import express from 'express';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';

const app = express();
const port = Number(process.env.AUDIO_WORKER_PORT || 8787);

app.use(express.json({ limit: '2mb' }));

function commandForMode(mode) {
  if (mode === 'sfx') return process.env.SOUNDLY_SFX_COMMAND;
  return process.env.SOUNDLY_MUSIC_COMMAND;
}

function modelForMode(mode) {
  if (mode === 'sfx') return process.env.SOUNDLY_SFX_MODEL || 'Stable Audio Open';
  if (mode === 'loop') return process.env.SOUNDLY_MUSIC_MODEL || 'YuE';
  return process.env.SOUNDLY_MUSIC_MODEL || 'YuE';
}

function runCommand(command, payload) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, {
      shell: true,
      env: {
        ...process.env,
        SOUNDLY_JOB_JSON: JSON.stringify(payload),
      },
      stdio: ['pipe', 'pipe', 'pipe'],
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
      if (code !== 0) {
        reject(new Error(stderr || `Model command exited with code ${code}`));
        return;
      }

      try {
        resolve(JSON.parse(stdout));
      } catch {
        reject(new Error(`Model command did not return JSON. stdout: ${stdout.slice(0, 240)}`));
      }
    });

    child.stdin.write(JSON.stringify(payload));
    child.stdin.end();
  });
}

async function normalizeResult(result, mode) {
  const response = {
    model: result.model || modelForMode(mode),
    mimeType: result.mimeType || 'audio/wav',
    sampleRate: result.sampleRate,
    duration: result.duration,
    previewPeaks: Array.isArray(result.previewPeaks) ? result.previewPeaks : [],
  };

  if (result.audioUrl) {
    return { ...response, audioUrl: result.audioUrl };
  }

  if (result.audioBase64) {
    return { ...response, audioBase64: result.audioBase64 };
  }

  if (result.audioPath) {
    const audio = await fs.readFile(result.audioPath);
    return {
      ...response,
      audioBase64: audio.toString('base64'),
      mimeType: result.mimeType || mimeTypeForPath(result.audioPath),
    };
  }

  throw new Error('Model command must return audioPath, audioUrl, or audioBase64.');
}

function mimeTypeForPath(filePath) {
  if (filePath.endsWith('.mp3')) return 'audio/mpeg';
  if (filePath.endsWith('.flac')) return 'audio/flac';
  if (filePath.endsWith('.ogg')) return 'audio/ogg';
  return 'audio/wav';
}

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    musicConfigured: Boolean(process.env.SOUNDLY_MUSIC_COMMAND),
    sfxConfigured: Boolean(process.env.SOUNDLY_SFX_COMMAND),
    musicModel: process.env.SOUNDLY_MUSIC_MODEL || 'YuE',
    sfxModel: process.env.SOUNDLY_SFX_MODEL || 'Stable Audio Open',
  });
});

app.post('/generate', async (req, res) => {
  try {
    const command = commandForMode(req.body?.mode);
    if (!command) {
      res.status(503).json({
        ok: false,
        error: `No ${req.body?.mode === 'sfx' ? 'SFX' : 'music'} model command configured.`,
      });
      return;
    }

    const result = await runCommand(command, req.body);
    res.json(await normalizeResult(result, req.body?.mode));
  } catch (error) {
    res.status(502).json({
      ok: false,
      error: error.message,
    });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Sound.ly audio worker bridge listening on http://localhost:${port}`);
});
