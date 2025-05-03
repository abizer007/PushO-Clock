export default async function handler(req, res) {
  const { username } = req.query;
  const { type = 'heatmap', theme = 'light', tz = 'UTC' } = req.query;

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

  // Initialize 7x24 grid
  const heatmap = Array(7).fill(null).map(() => Array(24).fill(0));
  const contributions = result.data.user.contributionsCollection.commitContributionsByRepository;

  contributions.forEach(repo => {
    repo.contributions.nodes.forEach(commit => {
      const utcDate = new Date(commit.occurredAt);
      const local = new Date(utcDate.toLocaleString('en-US', { timeZone: tz }));
      const day = local.getDay();    // 0 = Sunday
      const hour = local.getHours(); // 0–23
      heatmap[day][hour]++;
    });
  });

  // SVG generation
  const cellSize = 15;
  const svgWidth = 24 * cellSize + 100;
  const svgHeight = 7 * cellSize + 50;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}">
    <style>text { font-family: sans-serif; font-size: 10px; fill: ${theme === 'dark' ? '#eee' : '#000'}; }</style>
    <rect width="100%" height="100%" fill="${theme === 'dark' ? '#111' : '#fff'}" />`;

  const colors = ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'];
  const maxCount = Math.max(...heatmap.flat());

  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      const count = heatmap[d][h];
      const colorIdx = maxCount === 0 ? 0 : Math.floor((count / maxCount) * (colors.length - 1));
      const fill = colors[colorIdx];
      const x = h * cellSize + 50;
      const y = d * cellSize + 30;
      svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${fill}" />`;
    }
  }

  // Add axis labels
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  days.forEach((day, i) => {
    svg += `<text x="45" y="${i * cellSize + 42}" text-anchor="end">${day}</text>`;
  });
  for (let h = 0; h < 24; h++) {
    svg += `<text x="${h * cellSize + 57}" y="20" text-anchor="middle">${h}</text>`;
  }

  svg += `</svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(svg);
}
