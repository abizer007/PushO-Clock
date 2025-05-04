import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

async function fetchWeeklyCommits(username: string) {
  const today = new Date();
  const dayOfWeek = today.getUTCDay();

  const weekStart = new Date(today);
  weekStart.setUTCDate(today.getUTCDate() - dayOfWeek);
  weekStart.setUTCHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
  weekEnd.setUTCHours(23, 59, 59, 999);

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
            contributionsCollection(from: "${weekStart.toISOString()}", to: "${weekEnd.toISOString()}") {
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
    return { week: Array(7).fill(0), weekStart, weekEnd };
  }

  const json = await res.json();
  const days =
    json?.data?.user?.contributionsCollection?.contributionCalendar?.weeks?.flatMap(
      (w: any) => w.contributionDays
    ) || [];

  const week = Array(7).fill(0);
  for (const d of days) {
    if (d.weekday >= 0 && d.weekday <= 6) {
      week[d.weekday] = d.contributionCount;
    }
  }

  return { week, weekStart, weekEnd };
}

function renderRadialSVG(week: number[], weekStart: Date, weekEnd: Date, username: string, theme = "green") {
  const width = 600;
  const height = 600;
  const center = width / 2;
  const maxRadius = 200;
  const radiusStep = maxRadius / 7;
  const themeColor = "#22c55e";
  const background = "#0f172a";

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const startLabel = formatDate(weekStart);
  const endLabel = formatDate(weekEnd);

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="background:${background}; font-family:sans-serif;">
  <!-- Concentric Rings -->
  ${Array.from({ length: 7 }).map((_, i) => {
    const r = radiusStep * (i + 1);
    return `<circle cx="${center}" cy="${center}" r="${r}" stroke="#1e293b" stroke-width="1" fill="none"/>`;
  }).join("")}

  <!-- Slanted Day Labels -->
  ${dayLabels.map((label, i) => {
    const r = radiusStep * (i + 1);
    const angle = 225 * (Math.PI / 180);
    const x = center + Math.cos(angle) * r;
    const y = center + Math.sin(angle) * r;
    return `<text x="${x}" y="${y}" fill="white" font-size="13" text-anchor="middle" transform="rotate(-25 ${x} ${y})">${label}</text>`;
  }).join("")}

  <!-- Commit Dots -->
  ${week.map((count, day) => {
    if (count === 0) return "";
    const angle = (12 / 24) * 2 * Math.PI; // Positioning at noon for visibility
    const r = radiusStep * (day + 1);
    const x = center + Math.cos(angle) * r;
    const y = center + Math.sin(angle) * r;
    const size = Math.min(10, count * 2);
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${size}" fill="${themeColor}" opacity="${Math.min(1, count / 4)}"/>`;
  }).join("")}

  <!-- Caption -->
  <text x="${center}" y="${height - 20}" fill="#94a3b8" font-size="14" text-anchor="middle">
    GitHub activity for ${username} from ${startLabel} to ${endLabel} (UTC)
  </text>
</svg>`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username") || "octocat";
  const theme = searchParams.get("theme") || "green";

  const { week, weekStart, weekEnd } = await fetchWeeklyCommits(username);
  const svg = renderRadialSVG(week, weekStart, weekEnd, username, theme);

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-store",
    },
  });
}

