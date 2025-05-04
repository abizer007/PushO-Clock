import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

function getMonthRange(date: Date) {
  const month = date.toLocaleDateString("en-US", {
    month: "long",
    timeZone: "UTC",
  });
  const year = date.getUTCFullYear();
  return `${month} ${year}`;
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

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) throw new Error(`API Error: ${res.status}`);

    const json = await res.json();
    const contributions = json.data?.user?.contributionsCollection?.contributionCalendar?.weeks
      ?.flatMap((week: any) => week.contributionDays)
      ?.reduce((acc: Record<string, number>, day: any) => {
        acc[day.date] = day.contributionCount;
        return acc;
      }, {}) || {};

    return { 
      contributions,
      startDate,
      endDate,
      month: getMonthRange(endDate)
    };
  } catch (error) {
    console.error("Fetch error:", error);
    return { 
      contributions: {},
      startDate,
      endDate,
      month: getMonthRange(endDate)
    };
  }
}

function renderCircularChart(contributions: Record<string, number>, month: string, endDate: Date) {
  const width = 600;
  const height = 650;
  const center = width / 2;
  const baseRadius = 180;
  const maxBarLength = 80;
  const themeColor = "#22c55e";
  const background = "#0f172a";

  // Generate dates for last 30 days
  const dates = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(endDate);
    d.setUTCDate(d.getUTCDate() - 29 + i);
    return d;
  });

  const values = dates.map(d => {
    const dateStr = d.toISOString().split('T')[0];
    return contributions[dateStr] || 0;
  });
  const maxValue = Math.max(...values, 1);

  // Find today's position
  const todayIndex = dates.findIndex(d => 
    d.toDateString() === new Date().toDateString()
  );

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="background:${background};">
  <!-- Base circle -->
  <circle cx="${center}" cy="${center}" r="${baseRadius}" fill="none" stroke="#1e293b" stroke-width="2"/>
  
  ${dates.map((date, index) => {
    const angle = (index * 12) - 90; // 30 days × 12° = 360°
    const radians = angle * Math.PI / 180;
    const value = values[index];
    const barLength = (value / maxValue) * maxBarLength;
    
    // Bar coordinates
    const x1 = center + Math.cos(radians) * baseRadius;
    const y1 = center + Math.sin(radians) * baseRadius;
    const x2 = center + Math.cos(radians) * (baseRadius + barLength);
    const y2 = center + Math.sin(radians) * (baseRadius + barLength);

    // Day number position
    const dayX = center + Math.cos(radians) * (baseRadius - 20);
    const dayY = center + Math.sin(radians) * (baseRadius - 20);

    return `
    <g>
      <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
            stroke="${themeColor}" 
            stroke-width="4" 
            stroke-linecap="round"
            opacity="${0.5 + (value / maxValue) * 0.5}"/>
      
      <text x="${dayX}" y="${dayY}" 
            fill="#94a3b8" 
            font-size="12" 
            text-anchor="middle" 
            dominant-baseline="middle"
            font-family="monospace">
        ${date.getUTCDate()}
      </text>
    </g>`;
  }).join('')}

  <!-- Today marker -->
  ${todayIndex >= 0 ? `
  <circle cx="${center + baseRadius + maxBarLength}" 
          cy="${center}" 
          r="5" 
          fill="#dc2626"
          opacity="0.8"/>` : ''}

  <!-- Caption -->
  <text x="${center}" y="${height - 30}" 
        fill="#94a3b8" 
        font-size="16" 
        text-anchor="middle" 
        font-family="sans-serif"
        font-weight="500">
    ${month} • Updates daily
  </text>
  
  <text x="${center}" y="${height - 10}" 
        fill="#64748b" 
        font-size="12" 
        text-anchor="middle" 
        font-family="sans-serif">
    abizer's GitHub Commits
  </text>
</svg>`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username") || "octocat";

  const { contributions, month, endDate } = await fetch30DayContributions(username);
  const svg = renderCircularChart(contributions, month, endDate);

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
