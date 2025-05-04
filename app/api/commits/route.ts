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
    .flatMap((event: any) =>
      event.payload.commits.map((commit: any) => ({
        date: event.created_at,
        message: commit.message,
        author: commit.author.name,
      }))
    );

  return commits;
}

function getCommitHeatmapData(commits: any[]) {
  const heatmap = Array.from({ length: 7 }, () => Array(24).fill(0));

  commits.forEach(commit => {
    const date = new Date(commit.date);
    const day = date.getUTCDay(); // Sunday = 0
    const hour = date.getUTCHours();
    heatmap[day][hour]++;
  });

  return heatmap;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username") || "octocat";

  try {
    const commits = await fetchCommits(username);
    const heatmap = getCommitHeatmapData(commits);

    return NextResponse.json({ heatmap });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch commit data" }, { status: 500 });
  }
}

