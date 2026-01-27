# Fitness Plan Tracker (Manu)

A simple mobile-friendly web app to:
- follow the weekly plan (strength/cardio/recovery)
- log daily weight, steps, calories, protein
- mark workouts done
- see a weight chart + recent history

Data is stored locally in your browser (localStorage). Use **Settings → Copy backup JSON** to back up / move devices.

## Run locally
```bash
npm install
npm run dev
```

## Deploy to GitHub Pages
This repo includes a GitHub Action that deploys `dist/` to GitHub Pages on every push to `main`.

After creating the repo:
1. Go to **Settings → Pages**
2. Set **Build and deployment** to **GitHub Actions**

Then your app will be available at:
`https://<your-user>.github.io/<repo-name>/`

## Phone install
Open the URL on your phone and use:
- iOS Safari: Share → **Add to Home Screen**
- Android Chrome: Menu → **Add to Home screen**
