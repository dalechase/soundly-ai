import express from 'express';
import OpenAI from 'openai';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const isProduction = process.env.NODE_ENV === 'production';
const port = Number(process.env.PORT || 5173);

loadProfileExports();

const amazonApiEnabled = process.env.AMAZON_API_ENABLED === 'true';
const liveTrendCachePath = path.join(root, '.cache', 'live-trends.json');
const liveTrendCacheTtlMs = Number(process.env.LIVE_TRENDS_CACHE_TTL_MS || 1000 * 60 * 30);
const liveTrendCacheVersion = 2;
const blockedSourceHostnames = new Set([
  'aifans.fan',
  'deeka.ai',
  'freereadtext.com',
  'getaitoolhub.com',
  'hypergpt.ai',
  'old.reddit.com',
  'promptolis.com',
  'quora.com',
  'reddit.com',
  'shop.tiktok.com',
  'snshelper.com',
  'store.hypergpt.ai',
  'techsifted.com',
  'theweb.news',
  'wikipedia.org',
  'worldofsoftware.org',
  'www.aifans.fan',
  'www.deeka.ai',
  'www.freereadtext.com',
  'www.getaitoolhub.com',
  'www.hypergpt.ai',
  'www.promptolis.com',
  'www.quora.com',
  'www.reddit.com',
  'www.snshelper.com',
  'www.techsifted.com',
  'www.theweb.news',
  'www.wikipedia.org',
  'www.worldofsoftware.org',
]);

const app = express();
app.use(express.json({ limit: '1mb' }));

const audioJobs = new Map();
const maxAudioJobs = 40;

function clampNumber(value, min, max, fallback) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(Math.max(numeric, min), max);
}

function normalizeAudioSettings(body = {}) {
  const mode = ['music', 'sfx', 'loop'].includes(body.mode) ? body.mode : 'music';
  const prompt = String(body.prompt || '').trim().replace(/\s+/g, ' ').slice(0, 280);
  const style = String(body.style || '').trim().replace(/\s+/g, ' ').slice(0, 80);

  if (prompt.length < 4) {
    const error = new Error('Describe the sound you want to generate.');
    error.statusCode = 400;
    throw error;
  }

  return {
    mode,
    prompt,
    style: style || (mode === 'sfx' ? 'cinematic foley' : 'creator-ready'),
    duration: clampNumber(body.duration, 2, 20, mode === 'sfx' ? 5 : 8),
    intensity: clampNumber(body.intensity, 1, 10, 6),
    loopable: Boolean(body.loopable),
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

function detectTempo(settings) {
  const text = `${settings.prompt} ${settings.style}`.toLowerCase();
  if (text.includes('house') || text.includes('edm') || text.includes('dance')) return 122;
  if (text.includes('trap') || text.includes('hip hop')) return 140;
  if (text.includes('synthwave')) return 106;
  if (text.includes('lo-fi') || text.includes('lofi') || text.includes('chill')) return 82;
  if (text.includes('ambient') || text.includes('meditation')) return 64;
  if (text.includes('cinematic') || text.includes('trailer')) return 74;
  return 92 + Math.round(settings.intensity * 3.2);
}

function compositionProfile(settings) {
  const text = `${settings.prompt} ${settings.style}`.toLowerCase();
  const random = randomFromSeed(settings.seed);
  const minor = /(dark|sad|moody|trap|cinematic|night|tense|dramatic)/.test(text);
  const scale = minor ? [0, 2, 3, 5, 7, 8, 10] : [0, 2, 4, 5, 7, 9, 11];
  const roots = [48, 50, 52, 53, 55, 57];
  const root = roots[Math.floor(random() * roots.length)];
  const progressions = minor
    ? [[0, -3, -5, -7], [0, -5, -2, -7], [0, 3, -4, -5]]
    : [[0, 5, -3, 7], [0, -5, -4, 5], [0, 4, 5, 7]];
  const progression = progressions[Math.floor(random() * progressions.length)];
  const wave = text.includes('synth') || text.includes('electronic') ? 'saw' : text.includes('retro') ? 'square' : 'triangle';
  const drumLevel = text.includes('ambient') ? 0.14 : 0.32 + settings.intensity * 0.035;
  const melody = Array.from({ length: 32 }, (_, index) => {
    if (random() < 0.18 && index % 4 !== 0) return null;
    return root + 12 + scale[Math.floor(random() * scale.length)] + (random() > 0.72 ? 12 : 0);
  });

  return {
    random,
    tempo: detectTempo(settings),
    root,
    scale,
    progression,
    wave,
    drumLevel,
    melody,
    padLevel: text.includes('ambient') ? 0.34 : 0.2,
    swing: text.includes('lo-fi') || text.includes('lofi') ? 0.08 : 0.02,
  };
}

function percussiveEnvelope(phase, decay) {
  return Math.exp(-phase * decay);
}

function synthesizeSfx(settings) {
  const sampleRate = 32000;
  const length = Math.floor(settings.duration * sampleRate);
  const left = new Float32Array(length);
  const right = new Float32Array(length);
  const random = randomFromSeed(settings.seed);
  let noiseState = hashString(settings.seed) || 1;
  const bright = /chime|sparkle|magic|notification|ui|bell/i.test(settings.prompt);
  const base = bright ? 660 + random() * 440 : 48 + random() * 80;

  function noise() {
    noiseState = (noiseState * 1664525 + 1013904223) >>> 0;
    return noiseState / 2147483648 - 1;
  }

  for (let index = 0; index < length; index += 1) {
    const time = index / sampleRate;
    const progress = time / settings.duration;
    const env = bright ? Math.exp(-progress * 6) : Math.exp(-progress * 4.2);
    const sweep = bright ? base * (1 + progress * 0.8) : base * (1 - progress * 0.72);
    const tone =
      Math.sin(Math.PI * 2 * sweep * time) * 0.42 +
      Math.sin(Math.PI * 2 * sweep * 1.5 * time) * 0.18;
    const texture = noise() * (bright ? 0.05 : 0.28) * env;
    const hit = Math.sin(Math.PI * 2 * (60 + 80 * Math.exp(-time * 9)) * time) * Math.exp(-time * 8) * (bright ? 0.08 : 0.62);
    const sample = softClip((tone + texture + hit) * env * (0.7 + settings.intensity / 14));
    left[index] = sample * 0.9;
    right[index] = sample * (0.72 + Math.sin(time * 13) * 0.08);
  }

  return encodeWavStereo(left, right, sampleRate);
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
  const energy = settings.intensity / 10;
  let noiseState = hashString(`${settings.seed}-hat`) || 1;

  function noise() {
    noiseState = (noiseState * 1103515245 + 12345) >>> 0;
    return noiseState / 2147483648 - 1;
  }

  for (let index = 0; index < length; index += 1) {
    const time = index / sampleRate;
    const fadeIn = Math.min(1, time / 0.18);
    const fadeOut = Math.min(1, (settings.duration - time) / (settings.loopable ? 0.08 : 0.42));
    const masterEnv = Math.max(0, Math.min(fadeIn, fadeOut));
    const beat = time / beatDuration;
    const beatPhase = beat - Math.floor(beat);
    const bar = Math.floor(time / barDuration);
    const barPhase = (time % barDuration) / barDuration;
    const chordOffset = profile.progression[bar % profile.progression.length];
    const chordRoot = profile.root + chordOffset;
    const chord = [chordRoot, chordRoot + (profile.scale.includes(4) ? 4 : 3), chordRoot + 7, chordRoot + 12];

    let sample = 0;
    for (const [voiceIndex, note] of chord.entries()) {
      const freq = midiToHz(note);
      const slowPulse = 0.76 + Math.sin(time * Math.PI * 2 * 0.18 + voiceIndex) * 0.18;
      sample += oscillator(profile.wave, freq * time + voiceIndex * 0.03) * profile.padLevel * slowPulse / (voiceIndex + 2.2);
    }

    const bassNote = chordRoot - 12 + (Math.floor(beat / 2) % 2 === 0 ? 0 : 7);
    sample += oscillator('sine', midiToHz(bassNote) * time) * 0.28 * (0.58 + energy * 0.42);

    const step = Math.floor(time / stepDuration);
    const stepTime = (time % stepDuration) / stepDuration;
    const melodyNote = profile.melody[step % profile.melody.length];
    if (melodyNote) {
      const melodyEnv = Math.sin(Math.PI * Math.min(1, stepTime)) * Math.exp(-stepTime * 1.9);
      sample += oscillator('triangle', midiToHz(melodyNote) * time) * melodyEnv * (0.16 + energy * 0.08);
    }

    const kick = Math.sin(Math.PI * 2 * (54 + 18 * Math.exp(-beatPhase * 12)) * time) * percussiveEnvelope(beatPhase, 18);
    const snarePhase = Math.abs((beat % 4) - 2);
    const snare = snarePhase < 0.18 ? noise() * Math.exp(-snarePhase * 22) : 0;
    const hatPhase = (beat * 2 + profile.swing) % 1;
    const hat = hatPhase < 0.08 ? noise() * Math.exp(-hatPhase * 42) : 0;

    sample += kick * profile.drumLevel;
    sample += snare * profile.drumLevel * 0.34;
    sample += hat * profile.drumLevel * 0.16;

    const panned = softClip(sample * masterEnv * 0.86);
    left[index] = panned * (0.92 + Math.sin(barPhase * Math.PI * 2) * 0.04);
    right[index] = panned * (0.86 + Math.cos(barPhase * Math.PI * 2) * 0.05);
  }

  return encodeWavStereo(left, right, sampleRate);
}

function softClip(value) {
  return Math.tanh(value * 1.18) * 0.9;
}

function previewPeaksFromStereo(left, right) {
  const bucketCount = 64;
  const bucketSize = Math.max(1, Math.floor(left.length / bucketCount));
  return Array.from({ length: bucketCount }, (_, bucket) => {
    let peak = 0;
    const start = bucket * bucketSize;
    const end = Math.min(left.length, start + bucketSize);
    for (let index = start; index < end; index += 1) {
      peak = Math.max(peak, Math.abs(left[index]), Math.abs(right[index]));
    }
    return Number(Math.max(0.05, peak).toFixed(3));
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
    duration: frameCount / sampleRate,
    previewPeaks: previewPeaksFromStereo(left, right),
  };
}

function murekaConfigured() {
  return Boolean(process.env.MUREKA_API_KEY);
}

function murekaBaseUrl() {
  return String(process.env.MUREKA_BASE_URL || 'https://api.mureka.ai').replace(/\/+$/, '');
}

function murekaMusicModel(settings, songMode) {
  if (songMode) {
    return process.env.MUREKA_SONG_MODEL || process.env.MUREKA_MODEL || 'auto';
  }
  return process.env.MUREKA_INSTRUMENTAL_MODEL || process.env.MUREKA_MODEL || 'auto';
}

function murekaWantsSong(settings) {
  const text = `${settings.prompt} ${settings.style}`.toLowerCase();
  if (/\[(verse|chorus|bridge|hook|intro|outro)\]/i.test(settings.prompt)) return true;
  if (/\b(instrumental|no [a-z ]{0,20}vocals?|without [a-z ]{0,20}vocals?|backing track|background|bed|underscore|loop)\b/.test(text)) return false;
  return /\b(vocals?|singer|sung|lyrics?|verse|chorus|rap|rapping|duet|voice)\b/.test(text);
}

function murekaPrompt(settings) {
  const loopText = settings.loopable || settings.mode === 'loop' ? 'loopable, clean ending' : 'complete ending';
  const energy = settings.intensity >= 8 ? 'high energy' : settings.intensity <= 3 ? 'restrained energy' : 'medium energy';
  return [
    settings.prompt,
    settings.style,
    `${settings.duration} second target`,
    energy,
    loopText,
  ]
    .filter(Boolean)
    .join(', ');
}

function murekaLyrics(settings) {
  if (/\[(verse|chorus|bridge|hook|intro|outro)\]/i.test(settings.prompt)) {
    return settings.prompt;
  }

  const cleanedPrompt = settings.prompt
    .replace(/\b(with|featuring)?\s*(male|female)?\s*vocals?\b/gi, '')
    .replace(/\b(song|track|music|lyrics?)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  const theme = cleanedPrompt || 'a new creative spark';

  return [
    '[Verse]',
    `I feel ${theme} moving through the night`,
    'Every little moment starts to glow',
    'I keep my head up, chasing the light',
    'Letting the rhythm tell me where to go',
    '',
    '[Chorus]',
    'Turn it up and let the feeling rise',
    'We are alive under open skies',
    'Every heartbeat finds a melody',
    'This is the sound of what we came to be',
  ].join('\n');
}

function murekaMimeType(audioUrl) {
  const pathPart = String(audioUrl || '').split('?')[0].toLowerCase();
  if (pathPart.endsWith('.flac')) return 'audio/flac';
  if (pathPart.endsWith('.mp3')) return 'audio/mpeg';
  if (pathPart.endsWith('.wav')) return 'audio/wav';
  return 'audio/mpeg';
}

function murekaAudioChoice(task) {
  const directAudioUrl = task?.wav_url || task?.url || task?.flac_url || task?.stream_url;
  if (directAudioUrl) {
    return {
      choice: task,
      audioUrl: directAudioUrl,
      mimeType: murekaMimeType(directAudioUrl),
    };
  }

  const choices = Array.isArray(task?.choices) ? task.choices : Array.isArray(task?.data?.choices) ? task.data.choices : [];
  const choice = choices.find((item) => item?.wav_url || item?.url || item?.flac_url || item?.stream_url) || choices[0] || null;
  if (!choice) return null;
  const audioUrl = choice.wav_url || choice.url || choice.flac_url || choice.stream_url || '';
  if (!audioUrl) return null;

  return {
    choice,
    audioUrl,
    mimeType: murekaMimeType(audioUrl),
  };
}

function murekaDurationSeconds(choice, fallback) {
  const duration = Number(choice?.duration);
  if (!Number.isFinite(duration) || duration <= 0) return fallback;
  return duration > 1000 ? Number((duration / 1000).toFixed(2)) : duration;
}

async function murekaRequest(pathname, body) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.MUREKA_HTTP_TIMEOUT_MS || 45000));

  let response;
  try {
    response = await fetch(`${murekaBaseUrl()}${pathname}`, {
      method: body ? 'POST' : 'GET',
      headers: {
        authorization: `Bearer ${process.env.MUREKA_API_KEY}`,
        ...(body ? { 'content-type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  const responseText = await response.text();
  let data = null;
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

async function runMureka(settings, onProgress = () => {}) {
  const songMode = murekaWantsSong(settings);
  const model = murekaMusicModel(settings, songMode);
  const createPath = songMode ? '/v1/song/generate' : '/v1/instrumental/generate';
  const queryPath = songMode ? '/v1/song/query' : '/v1/instrumental/query';
  const body = {
    model,
    n: 1,
    prompt: murekaPrompt(settings),
    stream: false,
    ...(songMode ? { lyrics: murekaLyrics(settings) } : {}),
  };
  const created = await murekaRequest(createPath, body);
  const taskId = created.id || created.task_id || created.data?.id || created.data?.task_id;
  if (!taskId) {
    throw new Error('Mureka did not return a task id.');
  }
  onProgress({
    provider: 'mureka',
    providerStatus: created.status || created.data?.status || 'queued',
    externalTaskId: String(taskId),
    route: songMode ? 'song' : 'instrumental',
  });

  const startedAt = Date.now();
  const timeoutMs = Number(process.env.MUREKA_POLL_TIMEOUT_MS || 1000 * 60 * 8);
  const pollMs = Number(process.env.MUREKA_POLL_INTERVAL_MS || 3000);
  const failedStatuses = new Set(['failed', 'timeouted', 'cancelled']);
  let task = created;

  while (Date.now() - startedAt < timeoutMs) {
    const status = String(task.status || task.data?.status || '').toLowerCase();
    if (status) {
      onProgress({
        provider: 'mureka',
        providerStatus: status,
        externalTaskId: String(taskId),
        route: songMode ? 'song' : 'instrumental',
      });
    }
    const audioChoice = status === 'succeeded' ? murekaAudioChoice(task) : null;
    if (audioChoice) {
      return {
        provider: 'mureka',
        model: task.model || task.data?.model || model,
        audioUrl: audioChoice.audioUrl,
        mimeType: audioChoice.mimeType,
        duration: murekaDurationSeconds(audioChoice.choice, settings.duration),
        previewPeaks: [],
        externalTaskId: String(taskId),
        route: songMode ? 'song' : 'instrumental',
      };
    }

    if (failedStatuses.has(status)) {
      throw new Error(task.failed_reason || task.data?.failed_reason || task.error?.message || `Mureka task ${status}.`);
    }

    await new Promise((resolve) => setTimeout(resolve, pollMs));
    task = await murekaRequest(`${queryPath}/${encodeURIComponent(taskId)}`);
  }

  throw new Error('Mureka generation timed out before audio was ready.');
}

async function runBuiltInComposer(settings) {
  await new Promise((resolve) => setTimeout(resolve, 650));
  return {
    provider: 'soundly-composer',
    model: settings.mode === 'sfx' ? 'Sound.ly SFX Composer' : 'Sound.ly Music Composer',
    ...(settings.mode === 'sfx' ? synthesizeSfx(settings) : synthesizeMusic(settings)),
  };
}

async function runAudioWorker(settings) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.SOUNDLY_AUDIO_WORKER_TIMEOUT_MS || 1000 * 60 * 8));

  let response;
  try {
    response = await fetch(process.env.SOUNDLY_AUDIO_WORKER_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(settings),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Audio worker returned ${response.status}${message ? `: ${message.slice(0, 240)}` : ''}`);
  }

  const data = await response.json();
  if (!data.audioUrl && !data.audioBase64) {
    throw new Error('Audio worker did not return audioUrl or audioBase64.');
  }

  return {
    provider: 'open-source-worker',
    model: data.model || (settings.mode === 'sfx' ? 'Stable Audio Open' : 'YuE'),
    audioUrl: data.audioUrl,
    audioBase64: data.audioBase64,
    mimeType: data.mimeType || 'audio/wav',
    sampleRate: data.sampleRate,
    duration: data.duration || settings.duration,
    previewPeaks: Array.isArray(data.previewPeaks) ? data.previewPeaks : [],
  };
}

async function runAudioModel(settings, onProgress) {
  if (settings.mode !== 'sfx' && murekaConfigured()) {
    return runMureka(settings, onProgress);
  }

  if (process.env.SOUNDLY_AUDIO_WORKER_URL) {
    return runAudioWorker(settings);
  }

  return runBuiltInComposer(settings);
}

async function audioStatus() {
  let workerUrl = null;
  let workerHealth = null;
  if (process.env.SOUNDLY_AUDIO_WORKER_URL) {
    try {
      workerUrl = new URL(process.env.SOUNDLY_AUDIO_WORKER_URL).origin;
    } catch {
      workerUrl = process.env.SOUNDLY_AUDIO_WORKER_URL;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      const healthUrl = new URL('/health', process.env.SOUNDLY_AUDIO_WORKER_URL).toString();
      let response;
      try {
        response = await fetch(healthUrl, { signal: controller.signal });
      } finally {
        clearTimeout(timeout);
      }
      workerHealth = {
        reachable: response.ok,
        data: response.ok ? await response.json() : null,
      };
    } catch (error) {
      workerHealth = {
        reachable: false,
        error: error.message,
      };
    }
  }

  return {
    configured: Boolean(process.env.SOUNDLY_AUDIO_WORKER_URL),
    reachable: workerHealth?.reachable || false,
    ready: true,
    fallbackProvider: 'soundly-composer',
    murekaConfigured: murekaConfigured(),
    murekaBaseUrl: murekaConfigured() ? murekaBaseUrl() : null,
    musicProvider: murekaConfigured()
      ? 'mureka'
      : process.env.SOUNDLY_AUDIO_WORKER_URL
        ? 'open-source-worker'
        : 'soundly-composer',
    workerUrl,
    workerHealth,
    musicModel: murekaConfigured() ? process.env.MUREKA_MODEL || 'Mureka auto' : process.env.SOUNDLY_MUSIC_MODEL || 'YuE',
    murekaSongModel: process.env.MUREKA_SONG_MODEL || process.env.MUREKA_MODEL || 'auto',
    murekaInstrumentalModel: process.env.MUREKA_INSTRUMENTAL_MODEL || process.env.MUREKA_MODEL || 'auto',
    sfxModel: process.env.SOUNDLY_SFX_MODEL || 'Stable Audio Open',
    backupMusicModel: process.env.SOUNDLY_BACKUP_MUSIC_MODEL || 'HeartMuLa',
  };
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
    error: job.error,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    completedAt: job.completedAt,
  };
}

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

function pythonPath() {
  const venvPython = path.join(root, '.venv', 'bin', 'python');
  return fs.existsSync(venvPython) ? venvPython : 'python3';
}

function runAmazonLookup(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(pythonPath(), [path.join(root, 'scripts', 'amazon_creators_lookup.py'), ...args], {
      cwd: root,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('error', reject);
    child.on('close', (code) => {
      let parsed = null;
      try {
        parsed = JSON.parse(stdout);
      } catch {
        parsed = null;
      }

      if (code !== 0) {
        const message = parsed?.error || stderr || 'Amazon lookup failed';
        reject(new Error(message));
        return;
      }

      resolve(parsed);
    });
  });
}

function buildSearchArgs(params) {
  const query = String(params.query || '').trim();
  if (!query) {
    const error = new Error('Missing required query parameter');
    error.statusCode = 400;
    throw error;
  }

  const args = ['search', '--query', query];
  const passthrough = [
    ['searchIndex', '--search-index'],
    ['marketplace', '--marketplace'],
    ['partnerTag', '--partner-tag'],
    ['itemCount', '--item-count'],
    ['minRating', '--min-rating'],
    ['minPrice', '--min-price'],
    ['maxPrice', '--max-price'],
  ];

  for (const [key, flag] of passthrough) {
    if (params[key] !== undefined && params[key] !== '') {
      args.push(flag, String(params[key]));
    }
  }

  return args;
}

function ensureAmazonApiEnabled() {
  if (amazonApiEnabled) return;

  const error = new Error('Amazon Creators API is disabled. Using tagged Amazon search URLs until the account is approved.');
  error.statusCode = 503;
  throw error;
}

function productSearchQuery(product) {
  return [
    product.name,
    product.category,
    product.bestFor,
  ]
    .filter(Boolean)
    .join(' ');
}

function readJsonFile(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function writeJsonFile(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function isFreshCache(data, ttlMs) {
  if (!data?.generatedAt) return false;
  if (data.cacheVersion !== liveTrendCacheVersion) return false;
  const generatedAt = new Date(data.generatedAt).getTime();
  return Number.isFinite(generatedAt) && Date.now() - generatedAt < ttlMs;
}

function collectOpenAISources(response) {
  const sources = [];
  const seen = new Set();

  function normalizeSourceUrl(value) {
    if (!value) return null;
    return String(value).replace(/\/+$/, '');
  }

  for (const item of response.output || []) {
    if (item.type === 'web_search_call') {
      for (const source of item.action?.sources || []) {
        const url = normalizeSourceUrl(source.url || source.uri);
        if (!url || seen.has(url)) continue;
        seen.add(url);
        sources.push({
          title: source.title || url,
          url,
        });
      }
    }

    if (item.type === 'message') {
      for (const content of item.content || []) {
        for (const annotation of content.annotations || []) {
          const url = normalizeSourceUrl(annotation.url || annotation.uri);
          if (!url || seen.has(url)) continue;
          seen.add(url);
          sources.push({
            title: annotation.title || url,
            url,
          });
        }
      }
    }
  }

  return sources.slice(0, 12);
}

function isAllowedSourceUrl(value) {
  if (!value) return false;
  try {
    const hostname = new URL(value).hostname.toLowerCase();
    return !blockedSourceHostnames.has(hostname);
  } catch {
    return false;
  }
}

function sanitizeLiveTrendPayload(payload) {
  if (!payload) return payload;

  return {
    ...payload,
    trends: (payload.trends || []).map((trend) => ({
      ...trend,
      evidence: (trend.evidence || []).filter((source) => isAllowedSourceUrl(source.url)),
    })),
    sources: (payload.sources || []).filter((source) => isAllowedSourceUrl(source.url)),
  };
}

const liveTrendSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    summary: {
      type: 'string',
      description: 'Short editorial summary of the current audio trend landscape.',
    },
    generatedFor: {
      type: 'string',
      description: 'The target audience or market context.',
    },
    trends: {
      type: 'array',
      minItems: 4,
      maxItems: 6,
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          popularityScore: { type: 'integer', minimum: 1, maximum: 100 },
          velocity: { type: 'string' },
          audience: { type: 'string' },
          soundGoal: { type: 'string' },
          recommendedGearSearch: { type: 'string' },
          amazonSearchQuery: { type: 'string' },
          contentAngle: { type: 'string' },
          relatedProducts: {
            type: 'array',
            minItems: 3,
            maxItems: 4,
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                name: { type: 'string' },
                category: { type: 'string' },
                priceBand: { type: 'string' },
                bestFor: { type: 'string' },
                whyMatched: { type: 'string' },
                searchQuery: { type: 'string' },
                matchConfidence: { type: 'integer', minimum: 1, maximum: 100 },
              },
              required: [
                'name',
                'category',
                'priceBand',
                'bestFor',
                'whyMatched',
                'searchQuery',
                'matchConfidence',
              ],
            },
          },
          evidence: {
            type: 'array',
            minItems: 1,
            maxItems: 3,
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                title: { type: 'string' },
                url: { type: 'string' },
                note: { type: 'string' },
              },
              required: ['title', 'url', 'note'],
            },
          },
        },
        required: [
          'name',
          'description',
          'popularityScore',
          'velocity',
          'audience',
          'soundGoal',
          'recommendedGearSearch',
          'amazonSearchQuery',
          'contentAngle',
          'relatedProducts',
          'evidence',
        ],
      },
    },
  },
  required: ['summary', 'generatedFor', 'trends'],
};

async function fetchLiveTrendIntel({ refresh = false } = {}) {
  const cached = readJsonFile(liveTrendCachePath);
  if (!refresh && isFreshCache(cached, liveTrendCacheTtlMs)) {
    return { ...sanitizeLiveTrendPayload(cached), cached: true };
  }

  if (!process.env.OPENAI_API_KEY) {
    const error = new Error('Missing OPENAI_API_KEY in environment or ~/.profile');
    error.statusCode = 503;
    throw error;
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_LIVE_MODEL || 'gpt-5-mini';
  const today = new Date().toISOString().slice(0, 10);

  const response = await client.responses.create({
    model,
    reasoning: { effort: 'low' },
    tools: [
      {
        type: 'web_search',
        search_context_size: 'low',
        user_location: {
          type: 'approximate',
          country: 'US',
        },
        filters: {
          blocked_domains: [
            'reddit.com',
            'www.reddit.com',
            'quora.com',
            'www.quora.com',
            'wikipedia.org',
            'www.wikipedia.org',
            'aifans.fan',
            'deeka.ai',
            'freereadtext.com',
            'getaitoolhub.com',
            'hypergpt.ai',
            'promptolis.com',
            'shop.tiktok.com',
            'snshelper.com',
            'store.hypergpt.ai',
            'techsifted.com',
            'theweb.news',
            'worldofsoftware.org',
          ],
        },
      },
    ],
    tool_choice: 'required',
    include: ['web_search_call.action.sources'],
    text: {
      format: {
        type: 'json_schema',
        name: 'soundly_live_audio_trends',
        strict: true,
        schema: liveTrendSchema,
      },
    },
    input: [
      {
        role: 'system',
        content:
          'You are Sound.ly, a music-tech trend intelligence platform. Return only structured JSON matching the schema. Focus on audio trends that can become creator gear recommendations. Evidence must come from relevant, reputable, currently reachable sources; avoid generic AI roundup sites, unrelated community threads, and affiliate content farms.',
      },
      {
        role: 'user',
        content: `Today is ${today}. Use live web search to identify current or recently accelerating audio/content trends relevant to US creators: trending sounds, podcast voice workflows, TikTok/Reels vocal chains, beatmaking styles, streaming setups, and home-studio gear intent. Prefer primary sources, platform trend pages, creator economy reporting, music/audio trade publications, and reputable gear/media outlets. Avoid generic music news. For every trend, include a practical Amazon search query for gear discovery using generic product terms, not fictional product names. Also include 3 or 4 related product matches that should be displayed as Amazon search cards. Use real gear categories and generic buyer-intent search terms, not invented model names or claims about exact Amazon inventory. Price bands should be broad ranges like "$50-$100" or "$150-$300".`,
      },
    ],
  });

  const parsed = JSON.parse(response.output_text);
  const payload = sanitizeLiveTrendPayload({
    ok: true,
    cacheVersion: liveTrendCacheVersion,
    provider: 'openai-responses-web-search',
    model,
    generatedAt: new Date().toISOString(),
    cached: false,
    ...parsed,
    sources: collectOpenAISources(response),
  });

  writeJsonFile(liveTrendCachePath, payload);
  return payload;
}

app.get('/api/health', async (_req, res) => {
  res.json({
    ok: true,
    service: 'soundly-ai',
    audio: await audioStatus(),
    amazonApiEnabled,
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
    amazonCredentials: Boolean(process.env.AMAZON_CREDENTIAL_ID && (process.env.AMAZON_SECRET || process.env.AMAZON_CREDENTIAL_SECRET)),
  });
});

app.get('/api/audio/status', async (_req, res) => {
  res.json({
    ok: true,
    ...(await audioStatus()),
  });
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
    res.status(error.statusCode || 400).json({
      ok: false,
      error: error.message,
    });
  }
});

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
  } catch (error) {
    job.status = 'failed';
    job.providerStatus = 'failed';
    job.error = error.message;
    job.completedAt = new Date().toISOString();
    job.updatedAt = job.completedAt;
  }
}

app.get('/api/audio/generate/:id', (req, res) => {
  const job = audioJobs.get(req.params.id);
  if (!job) {
    res.status(404).json({ ok: false, error: 'Generation job not found' });
    return;
  }

  res.json({ ok: true, job: publicAudioJob(job) });
});

app.get('/api/live/trends', async (req, res) => {
  try {
    const refresh = req.query.refresh === 'true';
    const data = await fetchLiveTrendIntel({ refresh });
    res.json(data);
  } catch (error) {
    res.status(error.statusCode || 502).json({
      ok: false,
      error: error.message,
    });
  }
});

app.post('/api/live/trends/refresh', async (_req, res) => {
  try {
    const data = await fetchLiveTrendIntel({ refresh: true });
    res.json(data);
  } catch (error) {
    res.status(error.statusCode || 502).json({
      ok: false,
      error: error.message,
    });
  }
});

app.get('/api/amazon/search', async (req, res) => {
  try {
    ensureAmazonApiEnabled();
    const result = await runAmazonLookup(buildSearchArgs(req.query));
    res.json(result);
  } catch (error) {
    res.status(error.statusCode || 502).json({
      ok: false,
      error: error.message,
    });
  }
});

app.post('/api/amazon/search', async (req, res) => {
  try {
    ensureAmazonApiEnabled();
    const result = await runAmazonLookup(buildSearchArgs(req.body || {}));
    res.json(result);
  } catch (error) {
    res.status(error.statusCode || 502).json({
      ok: false,
      error: error.message,
    });
  }
});

app.post('/api/amazon/resolve-products', async (req, res) => {
  try {
    ensureAmazonApiEnabled();
    const { products } = await import('../src/data/mockData.js');
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : products.map((product) => product.id);
    const limit = Math.min(Number(req.body?.limit || ids.length), 12);
    const selected = ids
      .map((id) => products.find((product) => product.id === id))
      .filter(Boolean)
      .slice(0, limit);

    const resolved = [];
    for (const product of selected) {
      const result = await runAmazonLookup(
        buildSearchArgs({
          query: req.body?.query || productSearchQuery(product),
          searchIndex: req.body?.searchIndex || 'MusicalInstruments',
          itemCount: req.body?.itemCount || 5,
        }),
      );

      resolved.push({
        productId: product.id,
        productName: product.name,
        query: result.query,
        best: result.best,
        candidates: result.candidates,
      });
    }

    res.json({ ok: true, resolved });
  } catch (error) {
    res.status(error.statusCode || 502).json({
      ok: false,
      error: error.message,
    });
  }
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
  console.log(`Sound.ly server listening on http://localhost:${port}`);
});
