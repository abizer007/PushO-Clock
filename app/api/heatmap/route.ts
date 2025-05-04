import { NextResponse } from "next/server";

// SVG layout constants
const center = 150;
const radius = 90;

// ----------------------
// 1. Fetch GitHub contributions via GraphQL
// ----------------------
async function fetchCommitsGraphQL(username: string) {
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
        query {
          user(login: "${username}") {
            contributionsCollection(from: "${oneYearAgo.toISOString()}", to: "${today.toISOString()}") {
              contributionCalendar {
                weeks {
                  contributionDays {
                    date
                    weekday
                    contributionCount
                  }
                }
              }
            }
          }
        }
      `
    })
  });

  if (!res.ok) {
    console.error("GitHub GraphQL error:", await res.text());
    return [];
  }

  const json = await res.json();
  const days = json.data.user.contributionsCollection.contributionCalendar.weeks
    .flatMap((week: any) => week.contributionDays)
    .filter((d: any) => d.contributionCount > 0)
    .map((d: any) => ({
      date: d.date,
      count: d.contributionCount,
    }));

  return days;
}

// ----------------------
// 2. Convert date data to 7x24 heatmap matrix
// ----------------------
function buildHeatmap(commits: { date: string; count: number }[]) {
  const heatmap = Array.from({ length: 7 }, () => Array(24).fill(0));
  commits.forEach(({ date, count }) => {
    const dt = new Date(date);
    const day = dt.getUTCDay();     // Sunday = 0
    const hour = dt.getUTCHours();  // UTC Hour
    heatmap[day][hour] += count;
  });
  return heatmap;
}

// ----------------------
// 3. Render radial SVG
// ----------------------
function renderRadialSVG(heatmap: number[][], theme = "green") {
  const center = 150;
  const ringGap = 15;
  const labelOffset = 10;
  const radiusMax = ringGap * 7;

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" style="background:#0f172a;font-family:Arial,sans-serif;">
  <!-- Concentric rings -->
  ${Array.from({ length: 7 }).map((_, i) => {
    const r = ringGap * (i + 1);
    return `<circle cx="${center}" cy="${center}" r="${r}" stroke="#334155" fill="none" stroke-width="1"/>`;
  }).join("")}

  <!-- Hour labels around -->
  ${Array.from({ length: 24 }).map((_, h) => {
    const angle = (h / 24) * 2 * Math.PI - Math.PI / 2;
    const x = center + Math.cos(angle) * (radiusMax + labelOffset);
    const y = center + Math.sin(angle) * (radiusMax + labelOffset) + 3;
    return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" fill="#fff" font-size="10" text-anchor="middle">${h}</text>`;
  }).join("")}

  <!-- Day labels (Sun to Sat) -->
  ${dayLabels.map((label, i) => {
    const y = center - (i - 3) * ringGap;
    return `<text x="${center - radiusMax - 30}" y="${y}" fill="#fff" font-size="10">${label}</text>`;
  }).join("")}

  <!-- Data points -->
  ${heatmap.flatMap((row, day) =>
    row.map((count, hour) => {
      if (count === 0) return "";
      const angle = (hour / 24) * 2 * Math.PI - Math.PI / 2;
      const r = ringGap * (day + 1);
      const x = center + Math.cos(angle) * r;
      const y = center + Math.sin(angle) * r;
      const size = Math.min(6, count * 1.5);
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${size}" fill="#22c55e" opacity="${Math.min(1, count / 4)}"/>`;
    })
  ).join("")}
</svg>`;
}

// ----------------------
// 5. Final API Handler
// ----------------------
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  const type = searchParams.get("type") || "radial";
  const theme = searchParams.get("theme") || "green";

  if (!username) {
    return NextResponse.json({ error: "Missing username" }, { status: 400 });
  }

  // Get dynamic commit data
  const commits = await fetchCommitsGraphQL(username);
  const heatmap = buildHeatmap(commits);

  // Generate the correct SVG format
  const svg = type === "grid"
    ? renderGridSVG(heatmap, theme)
    : renderRadialSVG(heatmap, theme);

  // Compute current ISO week for weekly cache key
  const now = new Date();
  const year = now.getUTCFullYear();
  const jan1 = new Date(Date.UTC(year, 0, 1));
  const week = Math.ceil((((now.getTime() - jan1.getTime()) / 86400000) + jan1.getUTCDay() + 1) / 7);
  const cacheKey = `week-${year}-W${week}`;

  console.log("Serving cache for:", cacheKey);

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=604800, stale-while-revalidate",
    },
  });
}
