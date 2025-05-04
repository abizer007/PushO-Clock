import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

const CHART_COLORS = {
  bg: "#0C081F",
  bar: "#22c55e",
  text: "#FFFFFF",
  grid: "#2D3751",
  accent: "#DC2626"
};

async function fetchCommitData(username: string) {
  const endDate = new Date();
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

  // GitHub API call remains similar to previous implementation
  // ... (use the fetch30DayContributions logic from earlier)
}

function renderCircularCommitChart(contributions: Record<string, number>, month: string) {
  const width = 800;
  const center = width / 2;
  const innerRadius = 180;
  const maxBarLength = 120;
  const days = 30;
  
  const values = Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - 29 + i);
    return contributions[date.toISOString().split('T')[0]] || 0;
  });
  
  const maxCommits = Math.max(...values, 1);
  const barAngles = Array.from({ length: days }, (_, i) => (i * 12) - 90);

  return `
<svg width="${width}" height="${width + 100}" viewBox="0 0 ${width} ${width + 100}" 
     xmlns="http://www.w3.org/2000/svg" style="background:${CHART_COLORS.bg};">
  
  <!-- Grid Circles -->
  ${[40, 80, 120, 160].map(r => 
    `<circle cx="${center}" cy="${center}" r="${r}" fill="none" stroke="${CHART_COLORS.grid}" stroke-opacity="0.2"/>`
  ).join('')}

  <!-- Commit Bars -->
  ${barAngles.map((angle, i) => {
    const radians = angle * Math.PI / 180;
    const barHeight = (values[i] / maxCommits) * maxBarLength;
    const intensity = values[i] / maxCommits;
    
    return `
    <g transform="rotate(${angle} ${center} ${center})">
      <rect x="${center}" y="${center - innerRadius}" 
            width="${4 + intensity * 8}" 
            height="${barHeight}" 
            fill="${CHART_COLORS.bar}" 
            opacity="${0.3 + intensity * 0.7}"
            rx="2"/>
    </g>`;
  }).join('')}

  <!-- Day Labels -->
  ${barAngles.map((angle, i) => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - 29 + i);
    return `
    <text x="${center + Math.cos(angle * Math.PI / 180) * (innerRadius - 30)}" 
          y="${center + Math.sin(angle * Math.PI / 180) * (innerRadius - 30)}" 
          fill="${CHART_COLORS.text}" 
          font-size="12" 
          text-anchor="middle" 
          opacity="0.6"
          transform="rotate(${angle + 90} ${center + Math.cos(angle * Math.PI / 180) * (innerRadius - 30)} ${center + Math.sin(angle * Math.PI / 180) * (innerRadius - 30)})">
      ${date.getUTCDate()}
    </text>`;
  }).join('')}

  <!-- Center Info -->
  <text x="${center}" y="${center - 20}" font-size="32" fill="${CHART_COLORS.text}" 
        text-anchor="middle" font-family="Ubuntu, sans-serif">
    ${month}
  </text>
  <text x="${center}" y="${center + 30}" font-size="18" fill="${CHART_COLORS.accent}" 
        text-anchor="middle" font-family="Ubuntu, sans-serif">
    Daily Commits
  </text>

  <!-- Legend -->
  <g transform="translate(${center + 200} ${center - 100})">
    <rect x="0" y="0" width="20" height="20" fill="${CHART_COLORS.bar}" opacity="0.5"/>
    <text x="30" y="15" fill="${CHART_COLORS.text}" font-size="14">1 Commit</text>
    <rect x="0" y="30" width="20" height="20" fill="${CHART_COLORS.bar}" opacity="1"/>
    <text x="30" y="45" fill="${CHART_COLORS.text}" font-size="14">${maxCommits}+ Commits</text>
  </g>

  <!-- Caption -->
  <text x="${center}" y="${width + 80}" fill="${CHART_COLORS.text}" 
        font-size="16" text-anchor="middle" opacity="0.8">
    GitHub Activity • Updated ${new Date().toLocaleDateString()}
  </text>
</svg>`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username") || "octocat";
  
  const { contributions, month } = await fetchCommitData(username);
  return new NextResponse(renderCircularCommitChart(contributions, month), {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-store, max-age=0"
    }
  });
}
