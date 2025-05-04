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
    to: endDate.toISOString(),
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
    const contributions =
      json.data?.user?.contributionsCollection?.contributionCalendar?.weeks
        ?.flatMap((week: any) => week.contributionDays)
        ?.reduce((acc: Record<string, number>, day: any) => {
          acc[day.date] = day.contributionCount;
          return acc;
        }, {}) || {};

    return {
      contributions,
      startDate,
      endDate,
      month: getMonthRange(endDate),
    };
  } catch (error) {
    console.error("Fetch error:", error);
    return {
      contributions: {},
      startDate,
      endDate,
      month: getMonthRange(endDate),
    };
  }
}

function renderSVG(contributions: Record<string, number>, month: string, endDate: Date, username: string) {
  const width = 600;
  const height = 600;
  const center = width / 2;
  const baseRadius = 140;
  const maxBarLength = 100;
  const angleStep = 360 / 30;
  const background = "#0C081F";
  const barColor = "#22c55e";
  const gridColor = "#ffffff22";
  const textColor = "#E2E8F0";

  const dates = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(endDate);
    d.setUTCDate(endDate.getUTCDate() - 29 + i);
    return d;
  });

  const values = dates.map((d) => {
    const key = d.toISOString().split("T")[0];
    return contributions[key] || 0;
  });

  const maxVal = Math.max(...values, 1);

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="background:${background}; font-family: 'Ubuntu', sans-serif;">
  <defs>
    <style>
      .title { font-size: 24px; font-weight: bold; fill: white; }
      .subtitle { font-size: 14px; fill: ${textColor}; }
      .label { font-size: 10px; fill: ${textColor}; opacity: 0.5; }
    </style>
  </defs>

  <!-- Title -->
  <text x="${center}" y="40" text-anchor="middle" class="title">GitHub Contributions</text>
  <text x="${center}" y="60" text-anchor="middle" class="subtitle">Last 30 Days • ${month}</text>

  <!-- Radial grid -->
  ${[25, 50, 75].map(r => `
    <circle cx="${center}" cy="${center}" r="${r}" fill="none" stroke="${gridColor}" stroke-width="1" />`).join('')}

  <!-- Bars -->
  ${values.map((value, i) => {
    const angle = angleStep * i - 90;
    const rad = (angle * Math.PI) / 180;
    const barLength = (value / maxVal) * maxBarLength;

    const x1 = center + Math.cos(rad) * baseRadius;
    const y1 = center + Math.sin(rad) * baseRadius;
    const x2 = center + Math.cos(rad) * (baseRadius + barLength);
    const y2 = center + Math.sin(rad) * (baseRadius + barLength);

    const dayLabelX = center + Math.cos(rad) * (baseRadius - 20);
    const dayLabelY = center + Math.sin(rad) * (baseRadius - 20);

    return `
      <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
            stroke="${barColor}" stroke-width="5" stroke-linecap="round"
            opacity="${0.4 + (value / maxVal) * 0.6}" />
      <text x="${dayLabelX}" y="${dayLabelY}" text-anchor="middle" alignment-baseline="middle" class="label">
        ${dates[i].getUTCDate()}
      </text>`;
  }).join("")}

  <!-- Footer -->
  <text x="${center}" y="${height - 20}" text-anchor="middle" class="label">
    Generated for @${username} • Updated ${new Date().toLocaleDateString()}
  </text>
</svg>`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username") || "octocat";

  const { contributions, month, endDate } = await fetch30DayContributions(username);
  const svg = renderSVG(contributions, month, endDate, username);

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
