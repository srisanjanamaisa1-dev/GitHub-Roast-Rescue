# GitHub Roast & Rescue

A hackathon-ready React + Vite web app that analyzes a public GitHub profile, scores recruiter readiness, generates a respectful fact-based roast, and creates a rescue plan.

## Run

Requirements: Node.js 18+.

```bash
npm install
npm run dev
```

Open the localhost URL shown by Vite.

Production test:

```bash
npm run build
npm run preview
```

## Features

- Real public GitHub REST API profile/repository fetch
- Transparent 0–100 recruiter score
- Recruiter 30-second view
- Rule-based personalized roast and strengths
- Repository analysis for the most relevant repositories
- Language/tech-stack visibility
- Activity summary with limitations stated
- Prioritized rescue recommendations
- 7-day rescue plan
- Copyable share summary
- Clearly labeled Demo Mode for rate limits/offline presentation
- Friendly API errors
- Optional `VITE_GITHUB_TOKEN` support for higher GitHub API limits

## Optional GitHub token

Create `.env.local`:

```env
VITE_GITHUB_TOKEN=your_token_here
```

Use only a token appropriate for the intended public API access. Do not commit `.env.local`.

## Important implementation note

The GitHub repository list endpoint does not reliably prove whether every repository has a README. This MVP therefore does **not** fabricate README presence. It explicitly bases documentation scoring on repository descriptions, homepage/demo links, and licenses. A future backend can safely add README checks with `GET /repos/{owner}/{repo}/readme`.

## AI integration

The hackathon specification allows an AI API but requires the product to remain functional without one. This MVP therefore ships with a deterministic fallback roast/recommendation engine so the core flow works without an AI key. An AI provider can be added behind a server-side endpoint later without exposing a secret to the browser.
