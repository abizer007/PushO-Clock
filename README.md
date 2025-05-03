# GitHub Commit Clock Heatmap

This project visualizes the commit patterns of any GitHub user using a dynamic SVG heatmap. Supports both rectangular (7x24) and radial (clock-style) charts.

## Features

- Fetches commit timestamps via GitHub GraphQL API
- Aggregates by day of week and hour of day
- Outputs SVG heatmap suitable for GitHub README
- Configurable: chart type, theme, timezone
- Deployable on Vercel

## Usage

1. Deploy to Vercel.
2. Visit your domain and enter GitHub username.
3. Copy the embed link into your GitHub README.

Example:

```md
![Commit Clock](https://your-deployment.vercel.app/api/octocat.svg?type=radial&theme=dark&tz=UTC)
```
