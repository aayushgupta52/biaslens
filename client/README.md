# Skew — Frontend

React + Vite frontend for the Skew bias detection news platform.

## Stack

- React 19, React Router v7
- Tailwind CSS v4
- Framer Motion (page transitions, hover states)

## Setup

```bash
npm install
```

Create a `.env.local` file:

```
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev   # http://localhost:5173
```

## Build for production

```bash
npm run build
```

Deployed on Vercel. See `vercel.json` for SPA routing config.

## Pages

| Route | Description |
|---|---|
| `/` | Home feed with category sidebar and article cards |
| `/article/:id` | Full article with bias meter, summary, and related articles |
| `/spectrum` | All tracked sources plotted on the political spectrum |
| `/sources` | Source list with lean labels |
| `/exposure` | Personal bias exposure breakdown (requires login) |
| `/about` | About page |
