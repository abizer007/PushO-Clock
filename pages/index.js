import { useState } from 'react';

export default function Home() {
  const [user, setUser] = useState('');
  const [type, setType] = useState('heatmap');
  const [theme, setTheme] = useState('light');
  const [tz, setTz] = useState('UTC');

  const imgUrl = user
    ? `/api/${encodeURIComponent(user)}.svg?type=${type}&theme=${theme}&tz=${encodeURIComponent(tz)}`
    : null;

  return (
    <div>
      <h1>Commit Clock Heatmap</h1>
      <input placeholder="GitHub Username" value={user} onChange={e => setUser(e.target.value)} />
      <select value={type} onChange={e => setType(e.target.value)}>
        <option value="heatmap">Heatmap</option>
        <option value="radial">Radial</option>
      </select>
      <select value={theme} onChange={e => setTheme(e.target.value)}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="colorful">Colorful</option>
      </select>
      <input placeholder="Timezone (e.g., UTC)" value={tz} onChange={e => setTz(e.target.value)} />
      {imgUrl && (
        <>
          <img src={imgUrl} alt="Commit heatmap" />
          <pre><code>![Commit Clock](https://your-deployment.vercel.app{imgUrl})</code></pre>
        </>
      )}
    </div>
  );
}
