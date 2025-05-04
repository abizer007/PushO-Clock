import { NextResponse } from "next/server";

// SVG layout constants
const center = 150;
const radius = 90;

// ----------------------
// 1. Fetch GitHub contributions via GraphQL
// ----------------------
async function fetchCommitsGraphQL(username: string) {
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
            contributionsCollection {
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
      `,
    }),
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
  const svgRings = 7;
  const outerRadius = 120;

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const hourLabels = Array.from({ length: 24 }, (_, i) => i);

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" style="background:#0f172a;font-family:Arial,sans-serif">
  <g text-anchor="middle" font-size="10" fill="#fff">
    ${hourLabels.map(h => {
      const angle = (h / 24) * 2 * Math.PI - Math.PI / 2;
      const x = center + Math.cos(angle) * (outerRadius + 10);
      const y = center + Math.sin(angle) * (outerRadius + 10) + 3;
      return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}">${h}</text>`;
    }).join("")}

    ${dayLabels.map((day, i) => {
      const y = center + 5 + i * -15;
      return `<text x="${center - 135}" y="${y}">${day}</text>`;
    }).join("")}
  </g>

  ${Array.from({ length: svgRings }).map((_, i) => {
    return `<circle cx="${center}" cy="${center}" r="${(i + 1) * 15}" stroke="#334155" stroke-width="1" fill="none"/>`;
  }).join("")}

  ${heatmap.flatMap((row, day) =>
    row.map((count, hour) => {
      if (count === 0) return "";
      const angle = (hour / 24) * 2 * Math.PI - Math.PI / 2;
      const r = (7 - day) * 15;
      const x = center + Math.cos(angle) * r;
      const y = center + Math.sin(angle) * r;
      const size = Math.min(6, count * 1.2);
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${size}" fill="#22c55e" opacity="${Math.min(1, count / 4)}"/>`;
    })
  ).join("")}
</svg>`;
}


// ----------------------
// 4. Render grid SVG (24x7)
// ----------------------
function renderGridSVG(heatmap: number[][], theme = "green") {
  const cellSize = 12;
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${24 * cellSize}" height="${7 * cellSize}" style="background:#111;">
    ${heatmap.map((row, y) =>
      row.map((count, x) => {
        const opacity = Math.min(1, count / 4);
        return `<rect x="${x * cellSize}" y="${y * cellSize}" width="${cellSize - 2}" height="${cellSize - 2}" fill="#22c55e" opacity="${opacity}"/>`;
      }).join("")
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
