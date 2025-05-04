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

function renderCircularChart(contributions: Record<string, number>, month: string, endDate: Date, username: string) {
  const width = 800;
  const height = 850;
  const center = width / 2;
  const baseRadius = 180;
  const maxBarLength = 120;
  const themeColor = "#22c55e";
  const background = "#0C081F";

  const dates = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(endDate);
    d.setUTCDate(endDate.getUTCDate() - 29 + i);
    return d;
  });

  const values = dates.map(d => {
    const dateStr = d.toISOString().split('T')[0];
    return contributions[dateStr] || 0;
  });

  const maxValue = Math.max(...values, 1);

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="background:${background};">

  <!-- Grid circles -->
  ${[40, 80, 120, 160].map(r => `
    <circle cx="${center}" cy="${center}" r="${r}" fill="none" stroke="white" stroke-opacity="0.1" stroke-width="1" />
  `).join('')}

  <!-- Bars -->
  ${dates.map((date, index) => {
    const angle = (index * 12) - 90;
    const radians = angle * Math.PI / 180;
    const value = values[index];
    const barLength = (value / maxValue) * maxBarLength;
    const opacity = 0.3 + (value / maxValue) * 0.7;

    const x1 = center + Math.cos(radians) * baseRadius;
    const y1 = center + Math.sin(radians) * baseRadius;
    const x2 = center + Math.cos(radians) * (baseRadius + barLength);
    const y2 = center + Math.sin(radians) * (baseRadius + barLength);

    const dayX = center + Math.cos(radians) * (baseRadius - 25);
    const dayY = center + Math.sin(radians) * (baseRadius - 25);

    return `
    <g>
      <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
            stroke="${themeColor}" 
            stroke-width="6" 
            stroke-linecap="round"
            opacity="${opacity}" />
      <text x="${dayX}" y="${dayY}" fill="#ffffff" font-size="12" 
            text-anchor="middle" dominant-baseline="middle" 
            opacity="0.5" font-family="Ubuntu, sans-serif">
        ${date.getUTCDate()}
      </text>
    </g>`;
  }).join('')}

  <!-- Title -->
  <text x="${center}" y="70" text-anchor="middle" font-size="36" fill="#ffffff" font-family="Mandalore, sans-serif">
    GitHub Contributions
  </text>

  <!-- Subtitle -->
  <text x="${center}" y="105" text-anchor="middle" font-size="18" fill="#cbd5e1" font-family="Ubuntu, sans-serif">
    Last 30 Days of Activity • ${month}
  </text>

  <!-- Footer -->
  <text x="${center}" y="${height - 30}" text-anchor="middle" font-size="12" fill="#94a3b8" font-family="Ubuntu, sans-serif">
    Generated for @${username} • Updated ${new Date().toLocaleDateString("en-US")}
  </text>

</svg>`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username") || "octocat";

  const { contributions, month, endDate } = await fetch30DayContributions(username);
  const svg = renderCircularChart(contributions, month, endDate, username);

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
