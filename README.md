# Sound.ly

Sound.ly is a free AI audio generator for creator music, loops, and sound effects. It includes an async built-in composer that renders playable WAV files, and can route realistic music and loop jobs to Mureka when an API key is configured.

## Local Commands

```bash
npm run dev
npm run worker:audio
npm run lint
npm run build
```

The app runs through `server/index.js`, which serves the React/Vite frontend and API routes on `http://localhost:5173`.

## Audio Generation

By default, `/api/audio/generate` queues a job and renders audio with the built-in Sound.ly Composer. The frontend polls `/api/audio/generate/:id` until audio is ready for playback.

For realistic hosted music generation, configure Mureka on the server:

```bash
export MUREKA_API_KEY="..."
export MUREKA_MODEL="auto"
npm run dev
```

Optional Mureka settings:

```bash
export MUREKA_BASE_URL="https://api.mureka.ai"
export MUREKA_SONG_MODEL="auto"
export MUREKA_INSTRUMENTAL_MODEL="auto"
export MUREKA_POLL_TIMEOUT_MS=480000
export MUREKA_POLL_INTERVAL_MS=3000
```

Music and loop jobs use Mureka first when `MUREKA_API_KEY` exists. SFX jobs still use the worker bridge when configured, then fall back to the built-in composer.

To use a custom model worker instead, point `SOUNDLY_AUDIO_WORKER_URL` at its generation endpoint:

```bash
export SOUNDLY_AUDIO_WORKER_URL="http://localhost:8787/generate"
npm run dev
```

The included worker bridge can run model commands for music and SFX:

```bash
YUE_COMMAND_TEMPLATE='python /opt/YuE/YOUR_INFERENCE_SCRIPT.py --lyrics {prompt_file} --save_path {output_path}' \
SOUNDLY_MUSIC_COMMAND="python workers/audio-worker/examples/yue_generate.py" \
SOUNDLY_SFX_COMMAND="python /path/to/stable_audio_generate.py" \
npm run worker:audio
```

Worker command contract:

- Receives the job JSON on stdin and in `SOUNDLY_JOB_JSON`.
- Must print JSON to stdout.
- Must return `audioPath`, `audioUrl`, or `audioBase64`.

See `workers/audio-worker/README.md` for the exact payload shape. The worker path is now optional for music because Mureka is the primary realism route.

## Environment

The server loads exported environment variables from `~/.profile` at startup.

Hosted music:

```bash
export MUREKA_API_KEY=...
export MUREKA_MODEL="auto"
```

Audio worker:

```bash
export SOUNDLY_AUDIO_WORKER_URL="http://localhost:8787/generate"
export SOUNDLY_MUSIC_MODEL="YuE"
export SOUNDLY_SFX_MODEL="Stable Audio Open"
export SOUNDLY_BACKUP_MUSIC_MODEL="HeartMuLa"
```

Required for live trend scans:

```bash
export OPENAI_API_KEY=...
```

Current Amazon affiliate tag is hard-coded in `src/data/mockData.js` during the temporary phase:

```js
export const affiliateTag = 'inet9tv-20';
```

Future API-backed code should move affiliate configuration to server-side environment/config and return already-tagged Amazon URLs from the backend.

Amazon Creators/Product API access is intentionally disabled unless:

```bash
export AMAZON_API_ENABLED=true
```

## Live Data Flow

`GET /api/live/trends` returns cached live trend intelligence.

`POST /api/live/trends/refresh` forces a fresh OpenAI web-search scan.

The live scan currently returns:

- current audio/content trends
- evidence/source URLs
- gear intent
- Amazon search queries
- related product match cards

The cache lives at `.cache/live-trends.json` and currently uses a 30 minute TTL.

## Local Visual Assets

Product and hero imagery in `public/assets` is temporary, project-owned photorealistic placeholder imagery. It is not Amazon product imagery and should not be treated as proof of a specific purchasable product.

The old code-generated placeholder image script has been removed. Do not regenerate the previous schematic/vector-style assets.

Current placeholders cover microphones, headphones, interfaces, MIDI controllers, monitors, treatment, cables, stands, lighting, pop filters, streaming mixers, capture hardware, and software/sample products.

Future API-backed product cards should prefer official Amazon image URLs returned by the approved API when available. If an API record is missing an image or cannot be used confidently, keep these local category images as fallbacks.

## Temporary Amazon Product Matching

Important: the current Amazon product layer is a temporary search-link fallback, not final product data.

Because the Amazon API account is not eligible yet, the site does not fetch exact Amazon ASINs, prices, ratings, images, availability, or product titles from Amazon. It also should not scrape Amazon search result pages.

Temporary code paths:

- `src/data/mockData.js`
  - `amazonSearchUrl(query)` builds tagged Amazon search URLs with `inet9tv-20`.
  - `productSearchQuery(product)` and kit search helpers generate buyer-intent search terms.
- `server/index.js`
  - live trend scans ask OpenAI for `amazonSearchQuery` and `relatedProducts`.
  - `relatedProducts` are generic match cards with `name`, `category`, `priceBand`, `bestFor`, `whyMatched`, `searchQuery`, and `matchConfidence`.
- `src/components/LiveProductMatches.jsx`
  - displays live AI-generated product matches as Amazon search cards.
- `src/components/LiveTrendPanel.jsx`
  - displays compact matched searches inside each live trend.

This is acceptable for the unapproved phase because clicks go to tagged Amazon search pages instead of claiming a specific Amazon product record.

## Future Amazon API Path

When Amazon API eligibility is approved, the temporary search-link layer should become a real product hydration layer.

Future shape:

1. Keep OpenAI-generated `searchQuery` values as discovery seeds.
2. Call the official Amazon API from server-side code only.
3. Resolve each search query to real Amazon candidates.
4. Store normalized product records with:
   - ASIN/product id
   - title
   - price
   - rating/review count when available
   - image URL
   - detail page URL with affiliate tag
   - availability
   - last fetched timestamp
5. Replace UI `priceBand` placeholders with Amazon-provided product data.
6. Add a product cache/refresh policy so pages do not call Amazon on every request.
7. Keep affiliate disclosures on all buying pages.

Do not remove the search fallback entirely. Keep it as a graceful fallback for API failures, empty Amazon results, or products that cannot be resolved confidently.
