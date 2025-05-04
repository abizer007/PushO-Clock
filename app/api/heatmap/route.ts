import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

const CHART_CONFIG = {
  width: 800,
  height: 900,
  center: 400,
  innerRadius: 250,
  maxBarHeight: 120,
  days: 30,
  colors: {
    background: "#0C081F",
    bar: "#22c55e",
    text: "#FFFFFF",
    grid: "#2D3751",
    accent: "#DC2626",
    today: "#F4E55E"
  }
};

async function fetchGitHubContributions(username: string) {
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
                weekday
              }
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: {
          userLogin: username,
          from: startDate.toISOString(),
          to: endDate.toISOString()
        }
      }),
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
      month: endDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    };
  } catch (error) {
    console.error("Fetch error:", error);
    return {
      contributions: {},
      startDate,
      endDate,
      month: endDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    };
  }
}

function calculateBarProperties(index: number, commitCount: number, maxCommits: number) {
  const angle = (index * 12) - 90;
  const radians = angle * Math.PI / 180;
  const barHeight = (commitCount / maxCommits) * CHART_CONFIG.maxBarHeight;
  const opacity = 0.3 + (commitCount / maxCommits) * 0.7;
  const barWidth = 4 + (commitCount / maxCommits) * 8;
  
  return {
    angle,
    radians,
    barHeight,
    opacity,
    barWidth,
    x: CHART_CONFIG.center + Math.cos(radians) * CHART_CONFIG.innerRadius,
    y: CHART_CONFIG.center + Math.sin(radians) * CHART_CONFIG.innerRadius
  };
}

function renderCommitChart(contributions: Record<string, number>, month: string) {
  const dates = Array.from({ length: CHART_CONFIG.days }, (_, i) => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - 29 + i);
    return d;
  });

  const values = dates.map(d => {
    const dateStr = d.toISOString().split('T')[0];
    return contributions[dateStr] || 0;
  });

  const maxCommits = Math.max(...values, 1);
  const todayIndex = dates.findIndex(d => d.toDateString() === new Date().toDateString());

  return `
<svg width="${CHART_CONFIG.width}" height="${CHART_CONFIG.height}" 
     viewBox="0 0 ${CHART_CONFIG.width} ${CHART_CONFIG.height}" 
     xmlns="http://www.w3.org/2000/svg" 
     style="background:${CHART_CONFIG.colors.background}; font-family: 'Ubuntu', sans-serif;">

  <!-- Grid Circles -->
  ${[150, 200, 250, 300].map((r, i) => `
    <circle cx="${CHART_CONFIG.center}" cy="${CHART_CONFIG.center}" r="${r}" 
            fill="none" stroke="${CHART_CONFIG.colors.grid}" 
            stroke-opacity="0.${3 - i}" stroke-width="1"/>`).join('')}

  <!-- Commit Bars -->
  ${dates.map((date, index) => {
    const commitCount = values[index];
    const { angle, radians, barHeight, opacity, barWidth, x, y } = 
      calculateBarProperties(index, commitCount, maxCommits);
    const isToday = index === todayIndex;

    return `
    <g transform="rotate(${angle} ${CHART_CONFIG.center} ${CHART_CONFIG.center})">
      <rect x="${CHART_CONFIG.center}" 
            y="${CHART_CONFIG.center - CHART_CONFIG.innerRadius}" 
            width="${barWidth}" 
            height="${barHeight}" 
            fill="${isToday ? CHART_CONFIG.colors.today : CHART_CONFIG.colors.bar}" 
            opacity="${isToday ? 1 : opacity}"
            rx="2" 
            ry="2"/>
    </g>
    <text x="${x + Math.cos(radians) * 30}" 
          y="${y + Math.sin(radians) * 30}" 
          fill="${CHART_CONFIG.colors.text}" 
          font-size="12" 
          text-anchor="middle" 
          transform="rotate(${angle + 90} ${x} ${y})"
          opacity="0.8">
      ${date.getUTCDate()}
    </text>`;
  }).join('')}

  <!-- Center Content -->
  <text x="${CHART_CONFIG.center}" y="${CHART_CONFIG.center - 20}" 
        font-size="32" fill="${CHART_CONFIG.colors.text}" 
        text-anchor="middle" font-weight="500">
    ${month}
  </text>
  <text x="${CHART_CONFIG.center}" y="${CHART_CONFIG.center + 30}" 
        font-size="18" fill="${CHART_CONFIG.colors.accent}" 
        text-anchor="middle">
    Daily Commits
  </text>

  <!-- Legend -->
  <g transform="translate(${CHART_CONFIG.center + 200} ${CHART_CONFIG.center - 100})">
    <rect x="0" y="0" width="20" height="20" 
          fill="${CHART_CONFIG.colors.bar}" opacity="0.5" rx="2"/>
    <text x="30" y="15" fill="${CHART_CONFIG.colors.text}" font-size="14">1 Commit</text>
    
    <rect x="0" y="30" width="20" height="20" 
          fill="${CHART_CONFIG.colors.bar}" opacity="1" rx="2"/>
    <text x="30" y="45" fill="${CHART_CONFIG.colors.text}" font-size="14">
      ${maxCommits}+ Commits
    </text>
    
    <circle cx="10" cy="75" r="6" fill="${CHART_CONFIG.colors.today}"/>
    <text x="30" y="80" fill="${CHART_CONFIG.colors.text}" font-size="14">Today</text>
  </g>

  <!-- Caption -->
  <text x="${CHART_CONFIG.center}" y="${CHART_CONFIG.height - 30}" 
        fill="${CHART_CONFIG.colors.text}" font-size="14" 
        text-anchor="middle" opacity="0.8">
    GitHub Activity for ${month} • Updated ${new Date().toLocaleDateString()}
  </text>
</svg>`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username") || "octocat";

  try {
    const { contributions, month } = await fetchGitHubContributions(username);
    return new NextResponse(renderCommitChart(contributions, month), {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "no-store, max-age=0"
      }
    });
  } catch (error) {
    return new NextResponse(renderCommitChart({}, "Error"), {
      status: 500,
      headers: { "Content-Type": "image/svg+xml" }
    });
  }
}
