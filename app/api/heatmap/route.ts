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

  const query = `
    query ($userLogin: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $userLogin) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;

  const variables = {
    userLogin: username,
    from: weekStart.toISOString(),
    to: weekEnd.toISOString()
  };

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    console.error("GitHub API error:", await res.text());
    return { contributions: [], weekStart, weekEnd };
  }

  const json = await res.json();
  
  if (!json.data?.user) {
    console.error("User not found:", username);
    return { contributions: [], weekStart, weekEnd };
  }

  const weeks = json.data.user.contributionsCollection?.contributionCalendar?.weeks || [];
  const contributions: { [day: string]: number } = {};

  weeks.forEach((week: any) => {
    week.contributionDays.forEach((day: any) => {
      contributions[day.date] = day.contributionCount;
    });
  });

  return { contributions, weekStart, weekEnd };
}

function renderRadialSVG(contributions: { [day: string]: number }, weekStart: Date, weekEnd: Date, username: string, theme = "green") {
  const width = 540;
  const center = width / 2;
  const maxRadius = 200;
  const radiusStep = maxRadius / 7;
  const themeColor = theme === "blue" ? "#3b82f6" : "#22c55e";
  const background = "#0f172a";

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const startLabel = formatDate(weekStart);
  const endLabel = formatDate(weekEnd);

  // Initialize weekly contributions
  const weeklyContributions = Array(7).fill(0);
  const currentDate = new Date(weekStart);
  for (let i = 0; i < 7; i++) {
    const dateStr = currentDate.toISOString().split('T')[0];
    weeklyContributions[i] = contributions[dateStr] || 0;
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  return `
<svg width="${width}" height="${width + 50}" viewBox="0 0 ${width} ${width + 50}" xmlns="http://www.w3.org/2000/svg" style="background:${background}; font-family:sans-serif;">
  <!-- Rings -->
  ${Array.from({ length: 7 }).map((_, i) => {
    const r = radiusStep * (i + 1);
    return `<circle cx="${center}" cy="${center}" r="${r}" stroke="#1e293b" stroke-width="1" fill="none"/>`;
  }).join("")}

  <!-- Day Labels -->
  ${dayLabels.map((label, i) => {
    const r = radiusStep * (i + 1);
    const angle = 225 * (Math.PI / 180);
    const x = center + Math.cos(angle) * r;
    const y = center + Math.sin(angle) * r;
    return `<text x="${x}" y="${y}" fill="white" font-size="13" text-anchor="middle" transform="rotate(-25 ${x} ${y})">${label}</text>`;
  }).join("")}

  <!-- Contribution Dots -->
  ${weeklyContributions.flatMap((count, dayIndex) => {
    const radius = radiusStep * (dayIndex + 1);
    const dots = [];
    const maxDots = 24; // Max dots to display per day
    const spacing = (2 * Math.PI) / Math.max(count, 1);
    
    for (let i = 0; i < Math.min(count, maxDots); i++) {
      const angle = spacing * i;
      const x = center + Math.cos(angle) * radius;
      const y = center + Math.sin(angle) * radius;
      dots.push(`<circle cx="${x}" cy="${y}" r="3" fill="${themeColor}"/>`);
    }
    return dots;
  }).join("")}

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

  const { contributions, weekStart, weekEnd } = await fetchWeeklyContributions(username);
  const svg = renderRadialSVG(contributions, weekStart, weekEnd, username, theme);

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-store",
    },
  });
}
