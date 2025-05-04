import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function fetchWeeklyCommits(username: string) {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)

  // Get current week's Sunday
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - dayOfWeek);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  weekEnd.setHours(23, 59, 59, 999);

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
      `
    })
  });

  if (!res.ok) {
    console.error("GitHub GraphQL error:", await res.text());
    return Array(7).fill(0); // fallback
  }

  const json = await res.json();
  const week = Array(7).fill(0);

  const days = json?.data?.user?.contributionsCollection?.contributionCalendar?.weeks?.flatMap(
    (week: any) => week.contributionDays
  );

  if (Array.isArray(days)) {
    days.forEach((d: any) => {
      if (d.weekday >= 0 && d.weekday <= 6) {
        week[d.weekday] = d.contributionCount;
      }
    });
  }

  return week;
}

function renderRadialSVG(week: number[], theme = "green") {
  const center = 150;
  const radius = 90;
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" style="background:#0f172a;font-family:Arial,sans-serif">
  <circle cx="${center}" cy="${center}" r="${radius}" stroke="#334155" stroke-width="1" fill="none"/>

  <!-- Day labels -->
  ${dayLabels.map((label, i) => {
    const angle = (i / 7) * 2 * Math.PI - Math.PI / 2;
    const x = center + Math.cos(angle) * (radius + 14);
    const y = center + Math.sin(angle) * (radius + 14) + 3;
    return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" fill="#fff" font-size="10" text-anchor="middle">${label}</text>`;
  }).join("")}

  <!-- Dots -->
  ${week.map((count, i) => {
    const angle = (i / 7) * 2 * Math.PI - Math.PI / 2;
    const x = center + Math.cos(angle) * radius;
    const y = center + Math.sin(angle) * radius;
    const r = Math.min(8, count * 1.5);
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="#22c55e" opacity="${Math.min(1, count / 4)}"/>`;
  }).join("")}
</svg>`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username") || "octocat";
  const type = searchParams.get("type") || "radial";
  const theme = searchParams.get("theme") || "green";

  const week = await fetchWeeklyCommits(username);

  const svg = renderRadialSVG(week, theme);

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-store",
    },
  });
}
