import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

function formatMonth(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

async function fetch30DayContributions(username: string) {
  const today = new Date();
  const endDate = new Date(today);
  endDate.setUTCHours(23, 59, 59, 999);
  
  const startDate = new Date(endDate);
  startDate.setUTCDate(endDate.getUTCDate() - 29);
  startDate.setUTCHours(0, 0, 0, 0);

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
    from: startDate.toISOString(),
    to: endDate.toISOString()
  };

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) return { contributions: {}, month: formatMonth(today) };

  const json = await res.json();
  const contributions = json.data?.user?.contributionsCollection?.contributionCalendar?.weeks
    ?.flatMap((week: any) => week.contributionDays)
    ?.reduce((acc: Record<string, number>, day: any) => {
      acc[day.date] = day.contributionCount;
      return acc;
    }, {}) || {};

  return { contributions, month: formatMonth(today) };
}

function renderCircularBarChart(contributions: Record<string, number>, month: string) {
  const width = 540;
  const center = width / 2;
  const baseRadius = 180;
  const maxBarLength = 80;
  const themeColor = "#22c55e";
  const background = "#0f172a";

  // Get last 30 days data
  const dates = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - 29 + i);
    return d.toISOString().split('T')[0];
  });

  const values = dates.map(date => contributions[date] || 0);
  const maxValue = Math.max(...values, 1);

  return `
<svg width="${width}" height="${width}" viewBox="0 0 ${width} ${width}" xmlns="http://www.w3.org/2000/svg" style="background:${background};">
  <!-- Base circle -->
  <circle cx="${center}" cy="${center}" r="${baseRadius}" fill="none" stroke="#1e293b" stroke-width="2"/>
  
  ${dates.map((date, index) => {
    const angle = (index * 12) - 90; // 30 days × 12° = 360°
    const radians = angle * Math.PI / 180;
    const value = contributions[date] || 0;
    const barLength = (value / maxValue) * maxBarLength;
    
    const x1 = center + Math.cos(radians) * baseRadius;
    const y1 = center + Math.sin(radians) * baseRadius;
    const x2 = center + Math.cos(radians) * (baseRadius + barLength);
    const y2 = center + Math.sin(radians) * (baseRadius + barLength);

    return `
    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
          stroke="${themeColor}" 
          stroke-width="4" 
          stroke-linecap="round"
          opacity="${0.5 + (value / maxValue) * 0.5}"/>
    `;
  }).join('')}

  <!-- Month label -->
  <text x="${center}" y="${center + 30}" 
        fill="#94a3b8" 
        font-size="18" 
        text-anchor="middle" 
        font-family="sans-serif">
    ${month} Activity
  </text>
  
  <!-- Today marker -->
  <circle cx="${center + baseRadius + maxBarLength}" cy="${center}" r="4" fill="#dc2626"/>
</svg>`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username") || "octocat";

  const { contributions, month } = await fetch30DayContributions(username);
  const svg = renderCircularBarChart(contributions, month);

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-store",
    },
  });
}
