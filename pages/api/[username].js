export default async function handler(req, res) {
  const { username } = req.query;
  const { theme = 'light', tz = 'UTC' } = req.query;

  const token = process.env.GITHUB_TOKEN;
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const query = `
    query($login: String!) {
      user(login: $login) {
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

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables: { login: username } }),
  });

  const result = await response.json();

  if (!result.data || !result.data.user) {
    res.status(404).send(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="60">
      <text x="10" y="35" font-size="20" fill="red">GitHub user not found</text>
    </svg>`);
    return;
  }

  const allDates = [];
  result.data.user.contributionsCollection.contributionCalendar.weeks.forEach(week => {
    week.contributionDays.forEach(day => {
      if (day.contributionCount > 0) {
        allDates.push(day.date);
      }
    });
  });

  const hourlyMatrix = Array(7).fill(null).map(() => Array(24).fill(0));
  const dateChunks = allDates.slice(0, 30); // Limit to 30 days of API calls

  // Fetch commit timestamps per date using GitHub REST API
  const commitFetches = await Promise.all(dateChunks.map(async (date) => {
    const url = `https://api.github.com/search/commits?q=author:${username}+committer-date:${date}`;
    const commitRes = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.cloak-preview',
        ...(token && { Authorization: `Bearer ${token}` }),
      }
    });
    if (!commitRes.ok) return [];
    const data = await commitRes.json();
    return data.items || [];
  }));

  commitFetches.flat().forEach(commit => {
    const utcDate = new Date(commit.commit.committer.date);
    const local = new Date(utcDate.toLocaleString('en-US', { timeZone: tz }));
    const day = local.getDay();    // 0 = Sunday
    const hour = local.getHours(); // 0–23
    hourlyMatrix[day][hour]++;
  });

  const maxVal = Math.max(...hourlyMatrix.flat());
  const svgSize = 360;
  const cx = svgSize / 2, cy = svgSize / 2;
  const innerR = 70, layerW = 10;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgSize}" height="${svgSize}">
    <style>
      text { font-family: sans-serif; font-size: 9px; fill: ${theme === 'dark' ? '#eee' : '#111'}; }
    </style>
    <rect width="100%" height="100%" fill="${theme === 'dark' ? '#111' : '#fff'}"/>`;

  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const angle = (Math.PI * 2 * hour) / 24 - Math.PI / 2;
      const r1 = innerR + day * layerW;
      const r2 = r1 + layerW - 1;
      const x1 = cx + r1 * Math.cos(angle);
      const y1 = cy + r1 * Math.sin(angle);
      const x2 = cx + r2 * Math.cos(angle);
      const y2 = cy + r2 * Math.sin(angle);

      const count = hourlyMatrix[day][hour];
      const scale = maxVal === 0 ? 0 : count / maxVal;
      const color = `hsl(${120 - scale * 120}, 80%, ${30 + scale * 50}%)`;

      svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2" />`;
    }
  }

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let d = 0; d < 7; d++) {
    svg += `<text x="${cx}" y="${cy - innerR - 10 - d * layerW}" text-anchor="middle">${dayLabels[d]}</text>`;
  }

  svg += '</svg>';

  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(svg);
}
