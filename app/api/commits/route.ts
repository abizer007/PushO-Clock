// app/api/heatmap/route.ts
import { NextResponse } from "next/server";

async function fetchCommits(username: string) {
  const res = await fetch(`https://api.github.com/users/${username}/events/public`, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      "User-Agent": "PushO-Clock",
    },
  });

  if (!res.ok) return [];

  const data = await res.json();
  const commits = data
    .filter((event: any) => event.type === "PushEvent")
    .flatMap((event: any) => event.payload.commits.map((c: any) => ({
      date: event.created_at,
    })));

  return commits;
}

function generateHeatmapSVG(commits: any[], type: string, theme: string) {
  const heatmap = Array.from({ length: 7 }, () => Array(24).fill(0));
  commits.forEach(commit => {
    const d = new Date(commit.date);
    heatmap[d.getUTCDay()][d.getUTCHours()]++;
  });

  const color = theme === "dark" ? "#00FFAA" : theme === "blue" ? "#0077ff" : "#111";

  if (type === "radial") {
    return `
<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
  <circle cx="150" cy="150" r="100" stroke="${color}" stroke-width="4" fill="none"/>
  ${heatmap.flatMap((row, day) =>
    row.map((count, hour) => {
      const angle = (hour / 24) * 2 * Math.PI;
      const x = 150 + Math.cos(angle) * 90;
      const y = 150 + Math.sin(angle) * 90;
      const size = Math.min(6, count * 2);
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${size}" fill="${color}" opacity="${Math.min(1, count / 4)}" />`;
    })
  ).join("\n")}
</svg>`;
  }

  // Default to 7x24 grid
  const cellSize = 12;
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${cellSize * 24}" height="${cellSize * 7}">
  ${heatmap.map((row, day) =>
    row.map((count, hour) => {
      const opacity = Math.min(1, count / 4);
      return `<rect x="${hour * cellSize}" y="${day * cellSize}" width="${cellSize}" height="${cellSize}" fill="${color}" opacity="${opacity}" />`;
    }).join("\n")
  ).join("\n")}
</svg>`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username") || "octocat";
  const type = searchParams.get("type") || "grid";
  const theme = searchParams.get("theme") || "dark";

  try {
    const commits = await fetchCommits(username);
    const svg = generateHeatmapSVG(commits, type, theme);

    return new NextResponse(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=1800",
      },
    });
  } catch (e) {
    return NextResponse.json({ error: "Failed to generate heatmap" }, { status: 500 });
  }
}
