# Liberian Pulse Dashboard

Analytics dashboard for tracking Liberian artists on Audiomack.

## Quick Start

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Adding Data

1. Run your Python scraper: `python audiomack_scraper.py`
2. Copy CSV to `data/` folder: `cp audiomack_data_*.csv data/`
3. Refresh dashboard or restart dev server

## Deployment

Push to GitHub and deploy on Vercel:

```bash
git init
git add .
git commit -m "Initial commit"
git push
```

Then import to Vercel from your GitHub repo.

## Daily Workflow

1. Add artist URLs to `audiomack_scraper.py`
2. Run scraper daily
3. Copy CSV to `data/` folder
4. Dashboard auto-updates!
