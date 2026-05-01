import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { stylePresets, styleProfileFor, moodProfileFor } from '../src/lib/audioProfiles.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const isProduction = process.env.NODE_ENV === 'production';
const port = Number(process.env.PORT || 5173);

loadProfileExports();

const app = express();
app.use(express.json({ limit: '8mb' }));

const dataDir = path.join(root, '.data');
const creationsPath = path.join(dataDir, 'creations.json');
const audioJobs = new Map();
const maxAudioJobs = 50;

const kindLabels = {
  song: 'Song',
  instrumental: 'Instrumental',
  remix: 'Remix',
};

function loadProfileExports() {
  const profilePath = path.join(process.env.HOME || '/home/ubuntu', '.profile');
  if (!fs.existsSync(profilePath)) return;

  const lines = fs.readFileSync(profilePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^\s*export\s+([A-Z0-9_]+)=(.*)\s*$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key]) continue;
    process.env[key] = rawValue.trim().replace(/^['"]|['"]$/g, '');
  }
}

function ensureDataDir() {
  fs.mkdirSync(dataDir, { recursive: true });
}

function readCreations() {
  if (!fs.existsSync(creationsPath)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(creationsPath, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCreations(creations) {
  ensureDataDir();
  fs.writeFileSync(creationsPath, JSON.stringify(creations, null, 2));
}

function saveCreation(job) {
  const creation = {
    id: job.id,
    title: titleForSettings(job.settings),
    kind: job.settings.kind,
    prompt: job.settings.prompt,
    style: job.settings.style,
    mood: job.settings.mood,
    duration: job.result?.duration || job.settings.duration,
    energy: job.settings.energy,
    sourceCreationId: job.settings.sourceCreationId || null,
    settings: job.settings,
    result: job.result,
    provider: job.result?.provider || job.provider,
    providerStatus: job.providerStatus,
    externalTaskId: job.externalTaskId,
    route: job.route,
    createdAt: job.createdAt,
    completedAt: job.completedAt,
  };
  const creations = readCreations().filter((item) => item.id !== creation.id);
  creations.unshift(creation);
  writeCreations(creations.slice(0, 100));
  return creation;
}

function titleForSettings(settings) {
  const firstWords = settings.prompt.split(/\s+/).slice(0, 6).join(' ');
  return `${kindLabels[settings.kind]} - ${firstWords}`.slice(0, 72);
}

function clampNumber(value, min, max, fallback) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(Math.max(numeric, min), max);
}

function normalizeKind(value) {
  if (value === 'music') return 'song';
  if (value === 'loop') return 'instrumental';
  if (['song', 'instrumental', 'remix'].includes(value)) return value;
  return 'song';
}

function normalizeAudioSettings(body = {}) {
  const kind = normalizeKind(body.kind || body.mode);
  const prompt = String(body.prompt || '').trim().replace(/\s+/g, ' ').slice(0, 520);
  const rawStyle = String(body.style || stylePresets[0]).trim().replace(/\s+/g, ' ').slice(0, 80);
  const rawMood = String(body.mood || 'Warm').trim().replace(/\s+/g, ' ').slice(0, 80);
  const style = styleProfileFor(rawStyle).name;
  const mood = moodProfileFor(rawMood).name;

  if (prompt.length < 4) {
    const error = new Error('Add a prompt before creating audio.');
    error.statusCode = 400;
    throw error;
  }

  return {
    kind,
    prompt,
    style,
    mood,
    duration: clampNumber(body.duration, 8, 45, kind === 'remix' ? 24 : 20),
    energy: clampNumber(body.energy ?? body.intensity, 1, 10, 6),
    sourceCreationId: String(body.sourceCreationId || '').trim() || null,
    seed: String(body.seed || randomUUID()),
  };
}

function pruneAudioJobs() {
  while (audioJobs.size > maxAudioJobs) {
    const oldestId = audioJobs.keys().next().value;
    audioJobs.delete(oldestId);
  }
}

function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function randomFromSeed(seed) {
  let value = hashString(seed) || 1;
  return () => {
    value += 0x6d2b79f5;
    let mixed = value;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

function midiToHz(note) {
  return 440 * (2 ** ((note - 69) / 12));
}

function oscillator(type, phase) {
  const cycle = phase - Math.floor(phase);
  if (type === 'square') return cycle < 0.5 ? 1 : -1;
  if (type === 'saw') return cycle * 2 - 1;
  if (type === 'triangle') return 1 - 4 * Math.abs(cycle - 0.5);
  return Math.sin(phase * Math.PI * 2);
}

function clampUnit(value) {
  return Math.min(Math.max(Number(value), 0), 1);
}

function musicalProfiles(settings) {
  const style = styleProfileFor(settings.style);
  const mood = moodProfileFor(settings.mood);
  const text = `${settings.prompt} ${style.name} ${mood.name}`.toLowerCase();
  return { style, mood, text };
}

function detectTempo(settings) {
  const { style, mood } = musicalProfiles(settings);
  const [minTempo, maxTempo] = style.tempoRange;
  const random = randomFromSeed(`${settings.seed}-${style.name}-${mood.name}-tempo`);
  const baseTempo = minTempo + random() * (maxTempo - minTempo);
  const remixLift = settings.kind === 'remix' ? 5 : 0;
  return Math.round(clampNumber(baseTempo + mood.tempoBias + remixLift, 45, 160, baseTempo));
}

function chordIntervalsFor(chordColor, minor) {
  const third = minor ? 3 : 4;
  const colors = {
    simple: [0, third, 7, 12],
    minimal: [0, minor ? 3 : 4, 7],
    extended: [0, third, 7, 10, 14],
    soulful: [0, third, 7, 10, 14],
    gospel: [0, third, 7, 10, 14, 17],
    dominant: [0, 4, 7, 10],
    jazz: [0, third, 7, 10, 14, 17],
    'neo-soul': [0, third, 7, 10, 14, 17, 21],
    tense: [0, 3, 6, 10],
    suspended: [0, 5, 7, 10],
    modal: [0, 5, 7, 12],
    nostalgic: [0, third, 7, 11, 14],
    power: [0, 7, 12, 19],
  };
  return colors[chordColor] || colors.simple;
}

function progressionsFor(chordColor, minor) {
  if (chordColor === 'minimal') return minor ? [[0, -2], [0, -5], [0, 3, -2]] : [[0, 5], [0, -3], [0, 4]];
  if (chordColor === 'gospel') return [[0, 5, 7, 4], [0, 4, 5, 7], [0, -3, -5, 5]];
  if (chordColor === 'jazz' || chordColor === 'neo-soul') return [[0, 2, -3, -5], [0, 5, -2, -5], [0, -5, -3, 2]];
  if (chordColor === 'dominant') return [[0, 0, 5, 3], [0, 5, 0, -2], [0, 3, 5, 3]];
  if (chordColor === 'suspended' || chordColor === 'tense') return [[0, -2, -5, -7], [0, 3, -2, -5], [0, -5, -7, -2]];
  if (chordColor === 'power') return [[0, -3, -5, 5], [0, 5, -3, 7], [0, -5, 3, 5]];
  return minor
    ? [[0, -3, -5, -7], [0, -5, -2, -7], [0, 3, -4, -5]]
    : [[0, 5, -3, 7], [0, -5, -4, 5], [0, 4, 5, 7]];
}

function profileSpaceAmount(style, mood) {
  const names = `${style.name} ${mood.name}`.toLowerCase();
  let amount = 0.22;
  if (/ambient|cinematic|dreamy/.test(names)) amount += 0.28;
  if (/warm|melancholic|soul|jazz|r&b|neo-soul/.test(names)) amount += 0.08;
  if (/aggressive|drill|funk|rock|jersey/.test(names)) amount -= 0.14;
  return clampUnit(amount);
}

function drumAccents(drumFeel, beat, swing = 0) {
  const beatIndex = Math.floor(beat) % 4;
  const beatPhase = beat - Math.floor(beat);
  const eighthPhase = (beat * 2 + swing) % 1;
  const sixteenthPhase = (beat * 4 + swing) % 1;
  const tripletPhase = (beat * 3) % 1;
  const near = (phase, width) => phase < width;

  const accents = {
    kick: near(beatPhase, 0.16) ? 0.85 : 0,
    snare: beatIndex === 2 && near(beatPhase, 0.14) ? 0.8 : 0,
    hat: near(eighthPhase, 0.09) ? 0.5 : 0,
    perc: 0,
  };

  if (drumFeel === 'ambient') return { kick: 0, snare: 0, hat: near(beatPhase, 0.04) ? 0.12 : 0, perc: 0 };
  if (drumFeel === 'four-on-floor') return { kick: near(beatPhase, 0.2) ? 1 : 0, snare: beatIndex === 1 || beatIndex === 3 ? 0.55 : 0, hat: near(eighthPhase, 0.12) ? 0.7 : 0, perc: 0 };
  if (drumFeel === 'trap' || drumFeel === 'drill') return { kick: accents.kick * (beatIndex === 2 ? 0.35 : 1), snare: beatIndex === 2 && near(beatPhase, 0.12) ? 1 : 0, hat: near(sixteenthPhase, drumFeel === 'drill' ? 0.09 : 0.13) ? 0.9 : 0, perc: near(tripletPhase, 0.05) ? 0.28 : 0 };
  if (drumFeel === 'boom-bap') return { kick: beatIndex === 0 || (beatIndex === 2 && near(beatPhase, 0.12)) ? 1 : 0.35 * accents.kick, snare: beatIndex === 1 || beatIndex === 3 ? 1 : 0, hat: near(eighthPhase, 0.1) ? 0.42 : 0, perc: 0 };
  if (drumFeel === 'lo-fi' || drumFeel === 'laid-back') return { kick: accents.kick * 0.58, snare: accents.snare * 0.58, hat: near(eighthPhase, 0.08) ? 0.28 : 0, perc: 0 };
  if (drumFeel === 'afrobeats') return { kick: beatIndex === 0 || beatIndex === 3 ? accents.kick : 0.25 * accents.kick, snare: beatIndex === 2 ? 0.55 : 0, hat: near(eighthPhase, 0.11) ? 0.52 : 0, perc: near((beat * 3 + 0.25) % 1, 0.07) ? 0.44 : 0 };
  if (drumFeel === 'dancehall') return { kick: beatIndex === 0 || beatIndex === 2 ? accents.kick : 0, snare: beatIndex === 1 || beatIndex === 3 ? 0.82 : 0, hat: near(eighthPhase, 0.09) ? 0.46 : 0, perc: near((beat * 2 + 0.5) % 1, 0.06) ? 0.34 : 0 };
  if (drumFeel === 'reggae') return { kick: beatIndex === 2 && near(beatPhase, 0.2) ? 0.8 : 0, snare: beatIndex === 2 ? 0.62 : 0, hat: beatIndex === 1 || beatIndex === 3 ? 0.38 : 0, perc: 0 };
  if (drumFeel === 'funk') return { kick: beatIndex === 0 || near((beat * 2 + 0.5) % 1, 0.09) ? 0.92 : 0, snare: beatIndex === 1 || beatIndex === 3 ? 0.86 : 0, hat: near(eighthPhase, 0.12) ? 0.6 : 0, perc: near((beat * 4 + 0.25) % 1, 0.05) ? 0.24 : 0 };
  if (drumFeel === 'jersey') return { kick: near(tripletPhase, 0.11) ? 1 : 0, snare: beatIndex === 2 ? 0.78 : 0, hat: near(sixteenthPhase, 0.1) ? 0.48 : 0, perc: near((beat * 3 + 0.33) % 1, 0.08) ? 0.42 : 0 };
  if (drumFeel === 'jazz') return { kick: accents.kick * 0.22, snare: near((beat * 3 + swing) % 1, 0.08) ? 0.24 : 0, hat: near((beat + 0.5) % 1, 0.12) ? 0.62 : 0, perc: near((beat * 2 + 0.3) % 1, 0.06) ? 0.22 : 0 };
  if (drumFeel === 'cinematic') return { kick: beatIndex === 0 && near(beatPhase, 0.22) ? 0.82 : 0, snare: 0, hat: 0, perc: beatIndex === 2 && near(beatPhase, 0.18) ? 0.55 : 0 };

  return accents;
}

function compositionProfile(settings) {
  const { style, mood, text } = musicalProfiles(settings);
  const random = randomFromSeed(`${settings.seed}-${settings.kind}`);
  const promptMajor = /\b(major|bright|happy|uplifting|sunny)\b/.test(text);
  const promptMinor = /\b(minor|dark|sad|melancholic|moody|tense|dramatic|cinematic|night)\b/.test(text);
  const minor = promptMajor
    ? false
    : promptMinor || mood.keyBias === 'minor' || (mood.keyBias !== 'major' && style.keyBias === 'minor') || (mood.keyBias === 'mixed' && style.keyBias === 'mixed' && random() < 0.45);
  const scale = style.chordColor === 'jazz' || style.chordColor === 'neo-soul'
    ? (minor ? [0, 2, 3, 5, 7, 9, 10] : [0, 2, 4, 5, 7, 9, 10])
    : minor ? [0, 2, 3, 5, 7, 8, 10] : [0, 2, 4, 5, 7, 9, 11];
  const roots = [45, 48, 50, 52, 53, 55, 57];
  const root = roots[Math.floor(random() * roots.length)];
  const progressions = progressionsFor(style.chordColor, minor);
  const progression = progressions[Math.floor(random() * progressions.length)];
  const melodyDensity = clampUnit((style.melodyDensity + mood.density) / 2);
  const melody = Array.from({ length: 32 }, (_, index) => {
    const restChance = settings.kind === 'instrumental' ? 0.46 - melodyDensity * 0.34 : 0.34 - melodyDensity * 0.24;
    if (random() < restChance && index % 4 !== 0) return null;
    return root + 12 + scale[Math.floor(random() * scale.length)] + (random() > 0.7 ? 12 : 0);
  });
  const brightness = clampUnit((style.brightness + mood.brightness) / 2);
  const drumLevel = clampNumber(0.16 + style.drumDrive * 0.34 + mood.drumBias, 0.02, 0.62, 0.3);

  return {
    random,
    style,
    mood,
    tempo: detectTempo(settings),
    root,
    scale,
    chordIntervals: chordIntervalsFor(style.chordColor, minor),
    progression,
    wave: style.wave,
    melody,
    drumLevel,
    padLevel: clampNumber(style.padLevel + (1 - mood.density) * 0.08, 0.08, 0.54, style.padLevel),
    swing: style.swing,
    brightness,
    bassMovement: clampUnit(style.bassMovement),
    spaceAmount: profileSpaceAmount(style, mood),
    vocalHint: settings.kind === 'song' ? 0.12 : 0,
  };
}

function percussiveEnvelope(phase, decay) {
  return Math.exp(-phase * decay);
}

function softClip(value) {
  return Math.tanh(value * 1.18) * 0.9;
}

function synthesizeMusic(settings) {
  const sampleRate = 32000;
  const length = Math.floor(settings.duration * sampleRate);
  const left = new Float32Array(length);
  const right = new Float32Array(length);
  const profile = compositionProfile(settings);
  const beatDuration = 60 / profile.tempo;
  const barDuration = beatDuration * 4;
  const stepDuration = beatDuration / 2;
  const energy = settings.energy / 10;
  let noiseState = hashString(`${settings.seed}-noise`) || 1;
  const delaySamples = Math.max(1, Math.floor(sampleRate * (0.08 + profile.spaceAmount * 0.18)));
  const delayLeft = new Float32Array(delaySamples);
  const delayRight = new Float32Array(delaySamples);
  let delayIndex = 0;

  function noise() {
    noiseState = (noiseState * 1103515245 + 12345) >>> 0;
    return noiseState / 2147483648 - 1;
  }

  for (let index = 0; index < length; index += 1) {
    const time = index / sampleRate;
    const fadeIn = Math.min(1, time / 0.2);
    const fadeOut = Math.min(1, (settings.duration - time) / 0.5);
    const masterEnv = Math.max(0, Math.min(fadeIn, fadeOut));
    const beat = time / beatDuration;
    const beatPhase = beat - Math.floor(beat);
    const bar = Math.floor(time / barDuration);
    const barPhase = (time % barDuration) / barDuration;
    const chordOffset = profile.progression[bar % profile.progression.length];
    const chordRoot = profile.root + chordOffset;
    const chord = profile.chordIntervals.map((interval) => chordRoot + interval);

    let sample = 0;
    for (const [voiceIndex, note] of chord.entries()) {
      const freq = midiToHz(note);
      const slowPulse = 0.76 + Math.sin(time * Math.PI * 2 * 0.18 + voiceIndex) * 0.18;
      const voiceLevel = profile.padLevel * (0.78 + profile.brightness * 0.28) * slowPulse / (voiceIndex + 2.2);
      sample += oscillator(profile.wave, freq * time + voiceIndex * 0.03) * voiceLevel;
    }

    const bassOffsets = profile.bassMovement > 0.78
      ? [0, 7, 12, 10, 0, 3, 7, -2]
      : profile.bassMovement > 0.55
        ? [0, 0, 7, 5, 0, 3, 7, 0]
        : [0, 0, 7, 0];
    const bassStep = Math.floor(beat * (profile.bassMovement > 0.62 ? 2 : 1));
    const bassNote = chordRoot - 12 + bassOffsets[bassStep % bassOffsets.length];
    const bassPhase = midiToHz(bassNote) * time + Math.sin(time * Math.PI * 2 * 2.2) * profile.bassMovement * 0.004;
    sample += oscillator('sine', bassPhase) * 0.28 * (0.58 + energy * 0.42) * (0.8 + profile.bassMovement * 0.32);

    const step = Math.floor(time / stepDuration);
    const stepTime = (time % stepDuration) / stepDuration;
    const melodyNote = profile.melody[step % profile.melody.length];
    if (melodyNote) {
      const melodyEnv = Math.sin(Math.PI * Math.min(1, stepTime)) * Math.exp(-stepTime * 1.9);
      const melodyWave = profile.brightness > 0.72 ? 'square' : 'triangle';
      sample += oscillator(melodyWave, midiToHz(melodyNote) * time) * melodyEnv * (0.11 + profile.brightness * 0.08 + energy * 0.08);
    }

    if (profile.vocalHint) {
      const phrasePhase = (time % (barDuration * 2)) / (barDuration * 2);
      const vowel = Math.sin(Math.PI * 2 * midiToHz(chordRoot + 24) * time) * Math.sin(Math.PI * phrasePhase);
      sample += vowel * profile.vocalHint * (0.7 + energy * 0.3);
    }

    const accents = drumAccents(profile.style.drumFeel, beat, profile.swing);
    const kick = Math.sin(Math.PI * 2 * (48 + 26 * Math.exp(-beatPhase * 12)) * time) * percussiveEnvelope(beatPhase, 18);
    const snarePhase = Math.abs((beat % 4) - 2);
    const snare = snarePhase < 0.2 ? noise() * Math.exp(-snarePhase * 22) : 0;
    const hatPhase = (beat * 2 + profile.swing) % 1;
    const hat = hatPhase < 0.12 ? noise() * Math.exp(-hatPhase * 42) : 0;
    const percPhase = (beat * 3 + profile.swing) % 1;
    const perc = percPhase < 0.1 ? oscillator('triangle', midiToHz(chordRoot + 24) * time) * percussiveEnvelope(percPhase, 28) : 0;
    const remixPulse = settings.kind === 'remix' ? Math.sin(Math.PI * 2 * time * (profile.tempo / 60 / 4)) * 0.08 : 0;

    sample += kick * profile.drumLevel * accents.kick;
    sample += snare * profile.drumLevel * (0.24 + profile.brightness * 0.18) * accents.snare;
    sample += hat * profile.drumLevel * (0.08 + profile.brightness * 0.14) * accents.hat;
    sample += perc * profile.drumLevel * 0.22 * accents.perc;
    sample += remixPulse;

    const panned = softClip(sample * masterEnv * 0.86);
    const dryLeft = panned * (0.92 + Math.sin(barPhase * Math.PI * 2) * 0.04);
    const dryRight = panned * (0.86 + Math.cos(barPhase * Math.PI * 2) * 0.05);
    const wetLeft = delayLeft[delayIndex] * profile.spaceAmount * 0.32;
    const wetRight = delayRight[delayIndex] * profile.spaceAmount * 0.32;
    left[index] = softClip(dryLeft + wetRight);
    right[index] = softClip(dryRight + wetLeft);
    delayLeft[delayIndex] = dryLeft + wetLeft * 0.42;
    delayRight[delayIndex] = dryRight + wetRight * 0.42;
    delayIndex = (delayIndex + 1) % delaySamples;
  }

  return encodeWavStereo(left, right, sampleRate);
}

function previewPeaksFromStereo(left, right) {
  const bucketCount = 72;
  const bucketSize = Math.max(1, Math.floor(left.length / bucketCount));
  return Array.from({ length: bucketCount }, (_, bucket) => {
    let peak = 0;
    const start = bucket * bucketSize;
    const end = Math.min(left.length, start + bucketSize);
    for (let index = start; index < end; index += 1) {
      peak = Math.max(peak, Math.abs(left[index]), Math.abs(right[index]));
    }
    return Number(Math.max(0.06, peak).toFixed(3));
  });
}

function encodeWavStereo(left, right, sampleRate) {
  const channelCount = 2;
  const bytesPerSample = 2;
  const frameCount = left.length;
  const dataLength = frameCount * channelCount * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataLength);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(channelCount, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * channelCount * bytesPerSample, 28);
  buffer.writeUInt16LE(channelCount * bytesPerSample, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataLength, 40);

  for (let index = 0; index < frameCount; index += 1) {
    const leftSample = Math.max(-1, Math.min(1, left[index]));
    const rightSample = Math.max(-1, Math.min(1, right[index]));
    buffer.writeInt16LE(leftSample < 0 ? leftSample * 0x8000 : leftSample * 0x7fff, 44 + index * 4);
    buffer.writeInt16LE(rightSample < 0 ? rightSample * 0x8000 : rightSample * 0x7fff, 46 + index * 4);
  }

  return {
    audioBase64: buffer.toString('base64'),
    mimeType: 'audio/wav',
    sampleRate,
    duration: Number((frameCount / sampleRate).toFixed(2)),
    previewPeaks: previewPeaksFromStereo(left, right),
  };
}

function muricaApiKey() {
  return process.env.MURICA_API_KEY || process.env.MUREKA_API_KEY || '';
}

function muricaConfigured() {
  return Boolean(muricaApiKey());
}

function muricaBaseUrl() {
  return String(process.env.MURICA_BASE_URL || process.env.MUREKA_BASE_URL || 'https://api.mureka.ai').replace(/\/+$/, '');
}

function muricaModel(settings) {
  if (settings.kind === 'instrumental') {
    return process.env.MURICA_INSTRUMENTAL_MODEL || process.env.MUREKA_INSTRUMENTAL_MODEL || process.env.MURICA_MODEL || process.env.MUREKA_MODEL || 'auto';
  }
  return process.env.MURICA_SONG_MODEL || process.env.MUREKA_SONG_MODEL || process.env.MURICA_MODEL || process.env.MUREKA_MODEL || 'auto';
}

function muricaPrompt(settings) {
  const { style, mood } = musicalProfiles(settings);
  return [
    settings.prompt,
    `${style.name} style: ${style.drums}; ${style.instruments}; ${style.chords}; ${style.bass}; ${style.mix}`,
    `${mood.name} mood: ${mood.harmony}; ${mood.space}; ${mood.drums}`,
    `${settings.duration} second target`,
    `${settings.energy}/10 energy`,
    settings.kind === 'instrumental' ? 'instrumental, no lead vocal' : '',
    settings.kind === 'remix' ? 'remix version, fresh arrangement, club-ready clarity' : '',
  ].filter(Boolean).join(', ');
}

function muricaLyrics(settings) {
  if (/\[(verse|chorus|bridge|hook|intro|outro)\]/i.test(settings.prompt)) return settings.prompt;
  const theme = settings.prompt.replace(/\b(song|track|music|lyrics?)\b/gi, '').replace(/\s+/g, ' ').trim() || 'this feeling';
  return [
    '[Verse]',
    `I carry ${theme} through the midnight air`,
    'A signal in the dark begins to rise',
    'Every heartbeat finds the open flare',
    'Every little spark becomes the sky',
    '',
    '[Chorus]',
    'Turn it up until the moment opens',
    'Let the rhythm pull us into light',
    'All the colors that we kept unspoken',
    'Come alive and move with us tonight',
  ].join('\n');
}

function muricaMimeType(audioUrl) {
  const pathPart = String(audioUrl || '').split('?')[0].toLowerCase();
  if (pathPart.endsWith('.flac')) return 'audio/flac';
  if (pathPart.endsWith('.wav')) return 'audio/wav';
  if (pathPart.endsWith('.m4a')) return 'audio/mp4';
  return 'audio/mpeg';
}

function muricaAudioChoice(task) {
  const directAudioUrl = task?.wav_url || task?.mp3_url || task?.url || task?.flac_url || task?.stream_url;
  if (directAudioUrl) {
    return { choice: task, audioUrl: directAudioUrl, mimeType: muricaMimeType(directAudioUrl) };
  }

  const choices = Array.isArray(task?.choices) ? task.choices : Array.isArray(task?.data?.choices) ? task.data.choices : [];
  const choice = choices.find((item) => item?.wav_url || item?.mp3_url || item?.url || item?.flac_url || item?.stream_url) || choices[0] || null;
  if (!choice) return null;
  const audioUrl = choice.wav_url || choice.mp3_url || choice.url || choice.flac_url || choice.stream_url || '';
  if (!audioUrl) return null;
  return { choice, audioUrl, mimeType: muricaMimeType(audioUrl) };
}

function muricaDurationSeconds(choice, fallback) {
  const duration = Number(choice?.duration);
  if (!Number.isFinite(duration) || duration <= 0) return fallback;
  return duration > 1000 ? Number((duration / 1000).toFixed(2)) : Number(duration.toFixed(2));
}

async function muricaRequest(pathname, body) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.MURICA_HTTP_TIMEOUT_MS || process.env.MUREKA_HTTP_TIMEOUT_MS || 45000));

  let response;
  try {
    response = await fetch(`${muricaBaseUrl()}${pathname}`, {
      method: body ? 'POST' : 'GET',
      headers: {
        authorization: `Bearer ${muricaApiKey()}`,
        ...(body ? { 'content-type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  const responseText = await response.text();
  let data = {};
  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    data = { raw: responseText };
  }

  if (!response.ok) {
    const message = data?.error?.message || data?.message || responseText || 'Mureka request failed';
    throw new Error(`Mureka returned ${response.status}: ${String(message).slice(0, 260)}`);
  }

  return data;
}

async function runMurica(settings, onProgress = () => {}) {
  const model = muricaModel(settings);
  const generationKind = settings.kind === 'instrumental' ? 'instrumental' : 'song';
  const createPath = settings.kind === 'instrumental'
    ? '/v1/instrumental/generate'
    : settings.kind === 'remix' && process.env.MURICA_REAL_REMIX === 'true'
      ? '/v1/song/remix'
      : '/v1/song/generate';
  const queryPath = generationKind === 'instrumental' ? '/v1/instrumental/query' : '/v1/song/query';
  const body = {
    model,
    n: 1,
    prompt: muricaPrompt(settings),
    stream: false,
    ...(settings.kind !== 'instrumental' ? { lyrics: muricaLyrics(settings) } : {}),
    ...(settings.kind === 'remix' && settings.sourceCreationId ? { source_creation_id: settings.sourceCreationId } : {}),
  };

  const created = await muricaRequest(createPath, body);
  const taskId = created.id || created.task_id || created.data?.id || created.data?.task_id;
  if (!taskId) throw new Error('Mureka did not return a task id.');

  onProgress({
    provider: 'mureka',
    providerStatus: created.status || created.data?.status || 'queued',
    externalTaskId: String(taskId),
    route: settings.kind,
  });

  const startedAt = Date.now();
  const timeoutMs = Number(process.env.MURICA_POLL_TIMEOUT_MS || process.env.MUREKA_POLL_TIMEOUT_MS || 1000 * 60 * 8);
  const pollMs = Number(process.env.MURICA_POLL_INTERVAL_MS || process.env.MUREKA_POLL_INTERVAL_MS || 3000);
  const failedStatuses = new Set(['failed', 'timeouted', 'cancelled']);
  let task = created;

  while (Date.now() - startedAt < timeoutMs) {
    const status = String(task.status || task.data?.status || '').toLowerCase();
    if (status) {
      onProgress({ provider: 'mureka', providerStatus: status, externalTaskId: String(taskId), route: settings.kind });
    }

    const audioChoice = status === 'succeeded' || status === 'completed' ? muricaAudioChoice(task) : null;
    if (audioChoice) {
      return {
        provider: 'mureka',
        model: task.model || task.data?.model || model,
        audioUrl: audioChoice.audioUrl,
        mimeType: audioChoice.mimeType,
        duration: muricaDurationSeconds(audioChoice.choice, settings.duration),
        previewPeaks: [],
        externalTaskId: String(taskId),
        route: settings.kind,
      };
    }

    if (failedStatuses.has(status)) {
      throw new Error(task.failed_reason || task.data?.failed_reason || task.error?.message || `Mureka task ${status}.`);
    }

    await new Promise((resolve) => setTimeout(resolve, pollMs));
    task = await muricaRequest(`${queryPath}/${encodeURIComponent(taskId)}`);
  }

  throw new Error('Mureka generation timed out before audio was ready.');
}

async function runBuiltInComposer(settings) {
  await new Promise((resolve) => setTimeout(resolve, 700));
  return {
    provider: 'soundly-fallback',
    model: 'Soundly MVP Composer',
    ...synthesizeMusic(settings),
  };
}

async function runAudioModel(settings, onProgress) {
  if (muricaConfigured()) {
    try {
      return await runMurica(settings, onProgress);
    } catch (error) {
      if (process.env.MURICA_STRICT === 'true' || process.env.MUREKA_STRICT === 'true') throw error;
      onProgress({ provider: 'mureka', providerStatus: `fallback: ${error.message}`.slice(0, 220), route: settings.kind });
    }
  }

  return runBuiltInComposer(settings);
}

function publicAudioJob(job) {
  return {
    id: job.id,
    status: job.status,
    settings: job.settings,
    provider: job.provider,
    providerStatus: job.providerStatus,
    externalTaskId: job.externalTaskId,
    route: job.route,
    result: job.result,
    creation: job.creation,
    error: job.error,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    completedAt: job.completedAt,
  };
}

async function audioStatus() {
  return {
    ready: true,
    muricaConfigured: muricaConfigured(),
    murekaConfigured: muricaConfigured(),
    provider: muricaConfigured() ? 'mureka' : 'soundly-fallback',
    muricaBaseUrl: muricaConfigured() ? muricaBaseUrl() : null,
    model: muricaConfigured() ? process.env.MURICA_MODEL || process.env.MUREKA_MODEL || 'auto' : 'Soundly MVP Composer',
    supportedKinds: ['song', 'instrumental', 'remix'],
  };
}

async function processAudioJob(job) {
  try {
    job.status = 'running';
    job.updatedAt = new Date().toISOString();
    job.result = await runAudioModel(job.settings, (progress) => {
      job.provider = progress.provider || job.provider;
      job.providerStatus = progress.providerStatus || job.providerStatus;
      job.externalTaskId = progress.externalTaskId || job.externalTaskId;
      job.route = progress.route || job.route;
      job.updatedAt = new Date().toISOString();
    });
    job.provider = job.result.provider || job.provider;
    job.providerStatus = 'completed';
    job.externalTaskId = job.result.externalTaskId || job.externalTaskId;
    job.route = job.result.route || job.route;
    job.status = 'completed';
    job.completedAt = new Date().toISOString();
    job.updatedAt = job.completedAt;
    job.creation = saveCreation(job);
  } catch (error) {
    job.status = 'failed';
    job.providerStatus = 'failed';
    job.error = error.message;
    job.completedAt = new Date().toISOString();
    job.updatedAt = job.completedAt;
  }
}

app.get('/api/health', async (_req, res) => {
  res.json({
    ok: true,
    service: 'soundly-ai',
    audio: await audioStatus(),
  });
});

app.get('/api/audio/status', async (_req, res) => {
  res.json({ ok: true, ...(await audioStatus()) });
});

app.post('/api/audio/generate', async (req, res) => {
  try {
    const id = randomUUID();
    const job = {
      id,
      status: 'queued',
      settings: normalizeAudioSettings(req.body),
      provider: null,
      providerStatus: null,
      externalTaskId: null,
      route: null,
      result: null,
      creation: null,
      error: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
    };

    audioJobs.set(id, job);
    pruneAudioJobs();
    setTimeout(() => processAudioJob(job), 0);
    res.status(202).json({ ok: true, job: publicAudioJob(job) });
  } catch (error) {
    res.status(error.statusCode || 400).json({ ok: false, error: error.message });
  }
});

app.get('/api/audio/generate/:id', (req, res) => {
  const job = audioJobs.get(req.params.id);
  if (!job) {
    res.status(404).json({ ok: false, error: 'Generation job not found' });
    return;
  }

  res.json({ ok: true, job: publicAudioJob(job) });
});

app.get('/api/creations', (_req, res) => {
  res.json({ ok: true, creations: readCreations() });
});

app.get('/api/creations/:id', (req, res) => {
  const creation = readCreations().find((item) => item.id === req.params.id);
  if (!creation) {
    res.status(404).json({ ok: false, error: 'Creation not found' });
    return;
  }

  res.json({ ok: true, creation });
});

app.delete('/api/creations/:id', (req, res) => {
  const existing = readCreations();
  const next = existing.filter((item) => item.id !== req.params.id);
  if (next.length === existing.length) {
    res.status(404).json({ ok: false, error: 'Creation not found' });
    return;
  }

  writeCreations(next);
  res.json({ ok: true, creations: next });
});

if (isProduction) {
  const distPath = path.join(root, 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  const vite = await import('vite');
  const viteServer = await vite.createServer({
    root,
    server: { middlewareMode: true, host: '0.0.0.0' },
    appType: 'spa',
  });
  app.use(viteServer.middlewares);
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Soundly server listening on http://localhost:${port}`);
});
