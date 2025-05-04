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

async function fetchWeeklyContributions(username: string) {
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
    console.error("GitHub API error:", await res.text());
    return { commits: [], weekStart, weekEnd };
  }

  const json = await res.json();
  const days = json?.data?.user?.contributionsCollection?.contributionCalendar?.weeks?.flatMap(
    (week: any) => week.contributionDays
  ) || [];

  const commits = days.flatMap((d: any) => {
    const date = new Date(d.date);
    return Array(d.contributionCount).fill(null).map(() => ({
      date: date.toISOString(),
    }));
  });

  return { commits, weekStart, weekEnd };
}

function renderRadialSVG(commits: any[], weekStart: Date, weekEnd: Date, username: string, theme = "green") {
  const width = 540;
  const center = width / 2;
  const maxRadius = 200;
  const radiusStep = maxRadius / 7;
  const themeColor = theme === "blue" ? "#3b82f6" : "#22c55e";
  const background = "#0f172a";

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const startLabel = formatDate(weekStart);
  const endLabel = formatDate(weekEnd);

  const heatmap = Array.from({ length: 7 }, () => Array(24).fill(0));
  commits.forEach(c => {
    const d = new Date(c.date);
    const day = d.getUTCDay();
    const hour = d.getUTCHours();
    heatmap[day][hour]++;
  });

  return `
<svg width="${width}" height="${width + 50}" viewBox="0 0 ${width} ${width + 50}" xmlns="http://www.w3.org/2000/svg" style="background:${background}; font-family:sans-serif;">

  <!-- Rings -->
  ${Array.from({ length: 7 }).map((_, i) => {
    const r = radiusStep * (i + 1);
    return `<circle cx="${center}" cy="${center}" r="${r}" stroke="#1e293b" stroke-width="1" fill="none"/>`;
  }).join("")}

  <!-- Hour Labels (Clockwise, top=0) -->
  ${Array.from({ length: 24 }).map((_, hour) => {
    const angle = ((hour - 6 + 24) % 24) * (2 * Math.PI / 24);
    const x = center + Math.cos(angle) * (maxRadius + 14);
    const y = center + Math.sin(angle) * (maxRadius + 14);
    return `<text x="${x}" y="${y}" fill="white" font-size="11" text-anchor="middle" dominant-baseline="middle">${hour}</text>`;
  }).join("")}

  <!-- Slanted Weekday Labels -->
  ${dayLabels.map((label, i) => {
    const r = radiusStep * (i + 1);
    const angle = 225 * (Math.PI / 180);
    const x = center + Math.cos(angle) * r;
    const y = center + Math.sin(angle) * r;
    return `<text x="${x}" y="${y}" fill="white" font-size="13" text-anchor="middle" transform="rotate(-25 ${x} ${y})">${label}</text>`;
  }).join("")}

  <!-- Commit Dots -->
  ${heatmap.flatMap((row, day) =>
    row.map((count, hour) => {
      if (count === 0) return "";
      const angle = ((hour - 6 + 24) % 24) * (2 * Math.PI / 24);
      const r = radiusStep * (day + 1);
      const x = center + Math.cos(angle) * r;
      const y = center + Math.sin(angle) * r;
      const size = Math.min(7, count * 1.5);
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${size}" fill="${themeColor}" opacity="${Math.min(1, count / 4)}"/>`;
    })
  ).join("")}

  <!-- Caption -->
  <text x="${center}" y="${width + 30}" fill="#94a3b8" font-size="14" text-anchor="middle">
    GitHub activity for ${username} from ${startLabel} to ${endLabel} (UTC)
  </text>
</svg>`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username") || "octocat";
  const theme = searchParams.get("theme") || "green";

  const { commits, weekStart, weekEnd } = await fetchWeeklyContributions(username);
  const svg = renderRadialSVG(commits, weekStart, weekEnd, username, theme);

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-store",
    },
  });
}
