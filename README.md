# Skew — See the Slant

AI-powered news platform that analyzes political bias, sentiment, and provides multi-source perspectives on every story.

![Skew Home](skew-final-home.png)

## What it does

- Scrapes **16 news sources** across the political spectrum (BBC, Fox News, The Wire, OpIndia, NDTV, Guardian, and more)
- Runs **Groq AI (Llama 3.3 70B)** on every article to generate a bias score (Left → Right), sentiment, and summary
- Generates **vector embeddings** via Hugging Face to surface related articles across sources
- Runs the full pipeline **automatically every hour** via node-cron (self-pings on Render to stay alive)
- Custom **JWT authentication**, reading history, and bias exposure tracking

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Tailwind CSS v4, Framer Motion |
| Backend | Node.js, Express 5 |
| Database | MongoDB + Mongoose |
| Auth | Custom JWT + Bcrypt |
| Scraping | Cheerio (RSS feeds → full article text) |
| AI Analysis | Groq API — Llama 3.3 70B (JSON mode) |
| Embeddings | Hugging Face Inference API |
| Scheduler | node-cron (hourly) + Render keep-alive self-ping |

## Project structure

```
/
├── client/          # React + Vite frontend
└── server/          # Node.js + Express backend
```

## Running locally

### Backend

```bash
cd server
cp .env.example .env   # fill in your keys
npm install
npm run dev            # http://localhost:5000
```

### Frontend

```bash
cd client
npm install
npm run dev            # http://localhost:5173
```

Set `ENABLE_CRON=false` in `server/.env` for local dev to avoid burning free-tier API quota.

## Deployment

- **Backend** → [Render](https://render.com) (Web Service, `server/` as root)
- **Frontend** → [Vercel](https://vercel.com) (set `VITE_API_URL` to your Render URL)

See `server/render.yaml` for the Render blueprint and `client/vercel.json` for SPA routing config.

### Required environment variables (backend)

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Long random string for signing tokens |
| `JWT_EXPIRES_IN` | e.g. `7d` |
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) |
| `HF_API_KEY` | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) |
| `SCRAPE_KEY` | Secret for the internal `/api/scrape/run` route |
| `ENABLE_CRON` | `true` to start the hourly pipeline |

### Required environment variables (frontend)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend URL, e.g. `https://skew-api.onrender.com/api` |
