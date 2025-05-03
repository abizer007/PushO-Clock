export default async function handler(req, res) {
  const { username, theme = 'light', tz = 'UTC' } = req.query;

  if (!username) {
    return res
      .status(400)
      .setHeader("Content-Type", "image/svg+xml")
      .send(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="50">
        <rect width="100%" height="100%" fill="${theme === "dark" ? "#111" : "#fff"}"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
              font-size="16" fill="${theme === "dark" ? "#f55" : "#d00"}">
          Error: GitHub username is required
        </text>
      </svg>`);
  }

  const token = process.env.GITHUB_TOKEN;
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const query = `
    query($login: String!) {
      user(login: $login) {
        name
        avatarUrl
        contributionsCollection {
          contributionCalendar {
            weeks {
              contributionDays {
                weekday
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables: { login: username } }),
    });

    const result = await response.json();

    if (!result.data || !result.data.user) {
      return res
        .status(404)
        .setHeader("Content-Type", "image/svg+xml")
        .send(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="50">
          <rect width="100%" height="100%" fill="${theme === "dark" ? "#111" : "#fff"}"/>
          <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
                font-size="16" fill="${theme === "dark" ? "#f55" : "#d00"}">
            GitHub user not found: ${username}
          </text>
        </svg>`);
    }

    const allDates = [];
    result.data.user.contributionsCollection.contributionCalendar.weeks.forEach((week) => {
      week.contributionDays.forEach((day) => {
        if (day.contributionCount > 0) {
          allDates.push(day.date);
        }
      });
    });

    const hourlyMatrix = Array(7).fill(null).map(() => Array(24).fill(0));
    const dateChunks = allDates.slice(-21); // last 3 weeks

    const commitFetches = await Promise.all(
      dateChunks.map(async (date) => {
        const url = `https://api.github.com/search/commits?q=author:${username}+committer-date:${date}`;
        const commitRes = await fetch(url, {
          headers: {
            Accept: "application/vnd.github.cloak-preview",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        if (!commitRes.ok) return [];
        const data = await commitRes.json();
        return data.items || [];
      })
    );

    commitFetches.flat().forEach((commit) => {
      const utcDate = new Date(commit.commit.committer.date);
      const local = new Date(utcDate.toLocaleString("en-US", { timeZone: tz }));
      const day = local.getDay();
      const hour = local.getHours();
      hourlyMatrix[day][hour]++;
    });

    const maxVal = Math.max(...hourlyMatrix.flat());
    const name = result.data.user.name || username;
    const avatar = result.data.user.avatarUrl;

    const svg = generateSVG(hourlyMatrix, maxVal, name, avatar, theme);

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.send(svg);
  } catch (err) {
    console.error("Error:", err);
    return res
      .status(500)
      .setHeader("Content-Type", "image/svg+xml")
      .send(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="50">
        <rect width="100%" height="100%" fill="${theme === "dark" ? "#111" : "#fff"}"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
              font-size="16" fill="${theme === "dark" ? "#f55" : "#d00"}">
          Error fetching GitHub data
        </text>
      </svg>`);
  }
}

function generateSVG(matrix, max, name, avatar, theme) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const svgSize = 420;
  const cx = svgSize / 2, cy = svgSize / 2;
  const baseRadius = 60, ringWidth = 15;
  const textColor = theme === "dark" ? "#eee" : "#111";
  const bgColor = theme === "dark" ? "#111" : "#fff";
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgSize}" height="${svgSize}">
    <style>text { font-family: sans-serif; font-size: 10px; fill: ${textColor}; }</style>
    <rect width="100%" height="100%" fill="${bgColor}" />
    <text x="${cx}" y="25" text-anchor="middle" font-size="16" font-weight="bold">${name}'s Commit Clock</text>
    ${avatar ? `
      <clipPath id="clip"><circle cx="${cx}" cy="${cy}" r="50"/></clipPath>
      <image href="${avatar}" x="${cx - 50}" y="${cy - 50}" width="100" height="100" clip-path="url(#clip)" />
      <circle cx="${cx}" cy="${cy}" r="50" fill="none" stroke="#ccc" stroke-width="2"/>
    ` : `<circle cx="${cx}" cy="${cy}" r="50" fill="#888"/>`}
  `;

  for (let day = 0; day < 7; day++) {
    const r1 = baseRadius + day * ringWidth;
    const r2 = r1 + ringWidth - 2;
    for (let hour = 0; hour < 24; hour++) {
      const angle = (Math.PI * 2 * hour) / 24 - Math.PI / 2;
      const count = matrix[day][hour];
      if (count === 0) continue;

      const scale = count / max;
      const color = `hsl(${120 - scale * 120}, 70%, ${40 + scale * 40}%)`;
      const x1 = cx + r1 * Math.cos(angle);
      const y1 = cy + r1 * Math.sin(angle);
      const x2 = cx + r2 * Math.cos(angle);
      const y2 = cy + r2 * Math.sin(angle);

      svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2" />`;
    }

    svg += `<text x="${cx}" y="${cy - r1 - 4}" text-anchor="middle">${days[day]}</text>`;
  }

  for (let hour = 0; hour < 24; hour += 3) {
    const angle = (Math.PI * 2 * hour) / 24 - Math.PI / 2;
    const labelR = baseRadius + 7 * ringWidth + 10;
    const x = cx + labelR * Math.cos(angle);
    const y = cy + labelR * Math.sin(angle);
    svg += `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle">${hour}:00</text>`;
  }

  svg += `</svg>`;
  return svg;
}
