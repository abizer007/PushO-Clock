import { NextResponse } from "next/server";

async function fetchCommits(username: string) {
  const res = await fetch(`https://api.github.com/users/${username}/events/public`, {
    headers: {
     // Remove Authorization for GitHub Camo compatibility
    // Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,

      "User-Agent": "PushO-Clock",
    },
  });

  if (!res.ok) return [];

  const data = await res.json();
  return data
    .filter((event: any) => event.type === "PushEvent")
    .flatMap((event: any) =>
      event.payload.commits.map(() => ({
        date: event.created_at,
      }))
    );
}

function renderExactRadial(commits: any[]) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const heatmap = Array.from({ length: 7 }, () => Array(24).fill(0));

  commits.forEach((c: any) => {
    const d = new Date(c.date);
    heatmap[d.getUTCDay()][d.getUTCHours()]++;
  });

  const svg = [];
  const center = 200;
  const radiusStep = 25;

  // Base: background + glow
  svg.push(`<rect width="100%" height="100%" fill="#0f172a"/>`);
  svg.push(`<circle cx="${center}" cy="${center}" r="5" fill="#22c55e" opacity="0.3"/>`);

  // Gridlines
  for (let r = radiusStep; r <= radiusStep * 7; r += radiusStep) {
    svg.push(`<circle cx="${center}" cy="${center}" r="${r}" stroke="#1e293b" stroke-width="1" fill="none"/>`);
  }

  // Hour labels
  for (let h = 0; h < 24; h++) {
    const angle = (h / 24) * 2 * Math.PI;
    const r = radiusStep * 7 + 15;
    const x = center + r * Math.sin(angle);
    const y = center - r * Math.cos(angle);
    svg.push(`<text x="${x}" y="${y}" font-size="10" fill="#fff" text-anchor="middle" dominant-baseline="middle">${h}</text>`);
  }

  // Day labels
  for (let d = 0; d < 7; d++) {
    const r = radiusStep * (d + 1);
    svg.push(`<text x="${center - 110}" y="${center + r - 3}" font-size="10" fill="#fff">${days[d]}</text>`);
  }

  // Dots (commits)
  heatmap.forEach((row, day) => {
    row.forEach((count, hour) => {
      if (count === 0) return;
      const angle = (hour / 24) * 2 * Math.PI;
      const r = radiusStep * (day + 1);
      const x = center + r * Math.sin(angle);
      const y = center - r * Math.cos(angle);
      const radius = Math.min(6, count * 1.5);
      svg.push(`<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${radius}" fill="#22c55e" opacity="${Math.min(1, count / 4)}"/>`);
    });
  });

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <style>
    text { font-family: sans-serif; }
  </style>
  ${svg.join("\n")}
</svg>`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username") || "octocat";

  try {
    const commits = await fetchCommits(username);
    const svg = renderExactRadial(commits);

    return new NextResponse(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=1800",
      },
    });
  } catch {
    return NextResponse.json({ error: "Could not generate heatmap" }, { status: 500 });
  }
}
