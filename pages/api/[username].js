export default async function handler(req, res) {
  const { username } = req.query;
  const { type = 'radial', theme = 'light', tz = 'UTC' } = req.query;

  const token = process.env.GITHUB_TOKEN;
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const query = `
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          commitContributionsByRepository(maxRepositories: 10) {
            contributions(first: 100) {
              nodes {
                occurredAt
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

  const hourly = Array(24).fill(0);
  const contributions = result.data.user.contributionsCollection.commitContributionsByRepository;

  contributions.forEach(repo => {
    repo.contributions.nodes.forEach(commit => {
      const utcDate = new Date(commit.occurredAt);
      const local = new Date(utcDate.toLocaleString('en-US', { timeZone: tz }));
      const hour = local.getHours();
      hourly[hour]++;
    });
  });

  const maxVal = Math.max(...hourly);
  const cx = 150, cy = 150, radius = 80, barLength = 50;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
    <style>
      text { font-family: sans-serif; font-size: 10px; fill: ${theme === 'dark' ? '#eee' : '#000'}; }
    </style>
    <rect width="100%" height="100%" fill="${theme === 'dark' ? '#111' : '#fff'}"/>
    <circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="#ccc" stroke-width="1"/>
  `;

  for (let i = 0; i < 24; i++) {
    const angle = (Math.PI * 2 * i) / 24 - Math.PI / 2;
    const commitCount = hourly[i];
    const scale = maxVal === 0 ? 0 : commitCount / maxVal;
    const x1 = cx + radius * Math.cos(angle);
    const y1 = cy + radius * Math.sin(angle);
    const x2 = cx + (radius + scale * barLength) * Math.cos(angle);
    const y2 = cy + (radius + scale * barLength) * Math.sin(angle);
    const color = `hsl(${120 - scale * 120}, 80%, ${30 + scale * 50}%)`;
    svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="3" stroke-linecap="round"/>`;
  }

  for (let i = 0; i < 24; i += 3) {
    const angle = (Math.PI * 2 * i) / 24 - Math.PI / 2;
    const labelX = cx + (radius + barLength + 10) * Math.cos(angle);
    const labelY = cy + (radius + barLength + 10) * Math.sin(angle);
    svg += `<text x="${labelX}" y="${labelY}" text-anchor="middle" dominant-baseline="middle">${i}:00</text>`;
  }

  svg += '</svg>';

  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(svg);
}

