# Skew — Backend

Express API server for the Skew bias detection news platform.

## Stack

- Node.js + Express 5 (ESM)
- MongoDB + Mongoose
- Cheerio (RSS scraping)
- Groq API — Llama 3.3 70B (bias analysis)
- Hugging Face Inference API (vector embeddings)
- node-cron (hourly pipeline)

## Setup

```bash
npm install
cp .env.example .env   # fill in your keys
npm run dev            # http://localhost:5000
```

Set `ENABLE_CRON=false` locally to avoid burning Groq/HF free-tier quota.

## API routes

| Method | Route | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/sources` | All tracked sources with lean labels |
| POST | `/api/auth/signup` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user (JWT required) |
| GET | `/api/articles` | Paginated article feed (supports `?category=`, `?q=`, `?page=`) |
| GET | `/api/articles/:id` | Single article |
| GET | `/api/articles/:id/related` | Related articles by vector similarity |
| POST | `/api/scrape/run` | Trigger scrape manually (requires `SCRAPE_KEY` header) |
| POST | `/api/analytics/click` | Log article click |
| GET | `/api/history/exposure` | User bias exposure stats (JWT required) |

## Pipeline

```
node-cron (:17 each hour)
  └─ runScraper()     — fetch RSS feeds, scrape new article text, save to MongoDB
  └─ runAnalysis()    — Groq AI: summary + bias + sentiment (batched, rate-limited)
                      — HuggingFace: vector embeddings saved to MongoDB
```

On Render, `startKeepAlive()` self-pings `/api/health` every 10 minutes to prevent the free-tier instance from sleeping and killing the cron.

## Deployment (Render)

See `render.yaml` for the service blueprint. Set all `sync: false` env vars manually in the Render dashboard.
