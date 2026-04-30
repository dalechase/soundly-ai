# Sound.ly Audio Worker Bridge

This bridge turns Sound.ly generation jobs into model-process calls. It is optional for music now that the app can use Mureka directly, but it remains useful for custom SFX and self-hosted experiments.

## Run

```bash
YUE_COMMAND_TEMPLATE='python /opt/YuE/YOUR_INFERENCE_SCRIPT.py --lyrics {prompt_file} --save_path {output_path}' \
SOUNDLY_MUSIC_COMMAND="python workers/audio-worker/examples/yue_generate.py" \
SOUNDLY_SFX_COMMAND="python /path/to/stable_audio_generate.py" \
npm run worker:audio
```

Then run the app server with:

```bash
SOUNDLY_AUDIO_WORKER_URL="http://localhost:8787/generate" npm run dev
```

## Command Contract

Each command receives the job JSON on stdin and in `SOUNDLY_JOB_JSON`:

```json
{
  "mode": "music",
  "prompt": "calm creator bed with warm guitar",
  "style": "Cinematic",
  "duration": 12,
  "intensity": 6,
  "loopable": true,
  "seed": "uuid"
}
```

The command must print JSON to stdout:

```json
{
  "model": "YuE",
  "audioPath": "/tmp/soundly-output.wav",
  "mimeType": "audio/wav",
  "duration": 12,
  "previewPeaks": [0.12, 0.44, 0.31]
}
```

It may return `audioUrl` or `audioBase64` instead of `audioPath`.

## YuE Adapter

`examples/yue_generate.py` is a thin adapter around a YuE checkout. Configure `YUE_COMMAND_TEMPLATE` for the exact YuE inference command you use. The adapter provides these placeholders:

- `{prompt_file}`: generated structured lyrics/prompt file.
- `{output_path}`: where the command should write the final WAV.
- `{prompt}`, `{style}`, `{duration}`, `{seed}`, `{tmpdir}`.

The adapter reads `{output_path}` and returns it to Sound.ly as `audioBase64`.
