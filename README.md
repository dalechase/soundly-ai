# Sound.ly

Sound.ly is an MVP music generation service. Users can create a song, instrumental, or remix from a prompt, preview the finished audio, and revisit every saved creation from the library.

## Local Commands

```bash
npm run dev
npm run lint
npm run build
```

The app runs through `server/index.js`, which serves the React/Vite frontend and API routes on `http://localhost:5173`.

## Features

- Landing composer for song, instrumental, and remix generation.
- Direct creation page at `/create`.
- Saved library at `/library`.
- Persistent creation storage in `.data/creations.json`.
- Global bottom player with play/pause, previous/next, rewind, fast-forward, seeking, volume, mute, and download.
- Mureka-compatible backend generation with a built-in WAV composer fallback.

## Backend

The server loads exported environment variables from `~/.profile` at startup. It accepts either spelling:

```bash
export MUREKA_API_KEY="..."
export MURICA_API_KEY="..."
```

Optional settings:

```bash
export MUREKA_BASE_URL="https://api.mureka.ai"
export MUREKA_MODEL="auto"
export MUREKA_SONG_MODEL="auto"
export MUREKA_INSTRUMENTAL_MODEL="auto"
export MUREKA_POLL_TIMEOUT_MS=480000
export MUREKA_POLL_INTERVAL_MS=3000
```

When a key is present, `/api/audio/generate` tries Mureka first. If the provider fails and strict mode is not enabled, the app falls back to the local MVP composer so controls and library flows remain testable.

To force provider errors instead of fallback audio:

```bash
export MUREKA_STRICT=true
```

## API

- `GET /api/health`
- `GET /api/audio/status`
- `POST /api/audio/generate`
- `GET /api/audio/generate/:id`
- `GET /api/creations`
- `GET /api/creations/:id`
- `DELETE /api/creations/:id`

Generation requests accept:

```json
{
  "kind": "song",
  "prompt": "blue-hour pop song with a huge chorus",
  "style": "Pop",
  "mood": "Warm",
  "duration": 20,
  "energy": 6,
  "sourceCreationId": null
}
```

`kind` can be `song`, `instrumental`, or `remix`.
