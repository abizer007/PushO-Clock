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

function generateSVG(commits: any[]) {
  const heatmap = Array.from({ length: 7 }, () => Array(24).fill(0));
  commits.forEach(commit => {
    const d = new Date(commit.date);
    heatmap[d.getUTCDay()][d.getUTCHours()]++;
  });

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="288" height="84">
  ${heatmap.map((row, day) =>
    row.map((count, hour) => {
      const size = Math.min(10, count * 2);
      const opacity = Math.min(1, count / 4);
      return `<rect x="${hour * 12}" y="${day * 12}" width="10" height="10" fill="#0077ff" opacity="${opacity}" rx="2"/>`;
    }).join('\n')
  ).join('\n')}
</svg>`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username") || "octocat";

  try {
    const commits = await fetchCommits(username);
    const svg = generateSVG(commits);

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
