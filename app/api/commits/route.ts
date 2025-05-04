import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");
  const since = searchParams.get("since");
  const until = searchParams.get("until");

  if (!owner || !repo) {
    return NextResponse.json({ error: "Missing 'owner' or 'repo' in query" }, { status: 400 });
  }

  const githubToken = process.env.GITHUB_TOKEN;
  const url = `https://api.github.com/repos/${owner}/${repo}/commits?since=${since}&until=${until}&per_page=100`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        "User-Agent": "PushO-Clock-App"
      }
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch commits" }, { status: 500 });
    }

    const commits = await res.json();

    const heatmap = Array.from({ length: 7 }, () => Array(24).fill(0));
    commits.forEach((commit: any) => {
      const date = new Date(commit.commit.author.date);
      const day = date.getUTCDay();
      const hour = date.getUTCHours();
      heatmap[day][hour]++;
    });

    return NextResponse.json({ heatmap });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}