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

  // Extract contribution days
  const allDates = [];
  result.data.user.contributionsCollection.contributionCalendar.weeks.forEach(week => {
    week.contributionDays.forEach(day => {
      if (day.contributionCount > 0) {
        allDates.push(day.date);
      }
    });
  });

  const hourlyMatrix = Array(7).fill(null).map(() => Array(24).fill(0));
  const dateChunks = allDates.slice(-21); // Limit to 3 weeks for performance

  // Fetch commits per day using GitHub's commit search API
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
    const day = local.getDay(); // 0 = Sunday
    const hour = local.getHours(); // 0–23
    hourlyMatrix[day][hour]++;
  });

  const maxVal = Math.max(...hourlyMatrix.flat());

  // SVG Dimensions
  const svgSize = 420;
  const cx = svgSize / 2, cy = svgSize / 2;
  const baseRadius = 60;
  const ringWidth = 15;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgSize}" height="${svgSize}">
    <style>
      text { font-family: sans-serif; font-size: 10px; fill: ${theme === 'dark' ? '#eee' : '#222'}; }
    </style>
    <rect width="100%" height="100%" fill="${theme === 'dark' ? '#111' : '#fff'}"/>`;

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let day = 0; day < 7; day++) {
    const r1 = baseRadius + day * ringWidth;
    const r2 = r1 + ringWidth - 2;
    for (let hour = 0; hour < 24; hour++) {
      const angle = (Math.PI * 2 * hour) / 24 - Math.PI / 2;
      const x1 = cx + r1 * Math.cos(angle);
      const y1 = cy + r1 * Math.sin(angle);
      const x2 = cx + r2 * Math.cos(angle);
      const y2 = cy + r2 * Math.sin(angle);

      const count = hourlyMatrix[day][hour];
      const scale = maxVal === 0 ? 0 : count / maxVal;
      const color = `hsl(${120 - scale * 120}, 80%, ${30 + scale * 50}%)`;

      svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2"/>`;
    }

    // Day labels
    const labelY = cy - baseRadius - 10 - day * ringWidth;
    svg += `<text x="${cx}" y="${labelY}" text-anchor="middle">${dayLabels[day]}</text>`;
  }

  // Hour labels
  for (let hour = 0; hour < 24; hour += 3) {
    const angle = (Math.PI * 2 * hour) / 24 - Math.PI / 2;
    const labelR = baseRadius + 7 * ringWidth + 10;
    const x = cx + labelR * Math.cos(angle);
    const y = cy + labelR * Math.sin(angle);
    svg += `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle">${hour}:00</text>`;
  }

  svg += `</svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(svg);
}
