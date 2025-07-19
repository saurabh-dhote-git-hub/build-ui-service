import React, { useState } from 'react';
import { EventSourcePolyfill } from 'event-source-polyfill';
import './App.css'; // for spinner animation

function App() {
  const [repo, setRepo] = useState('');
  const [service, setService] = useState('');
  const [build, setBuild] = useState('');
  const [logs, setLogs] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLogs("🚀 Running script...\n");
    setLoading(true);

    const eventSource = new EventSourcePolyfill('/api/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repo, service, build })
    });

    eventSource.onmessage = (e) => {
      setLogs((prev) => prev + e.data + '\n');
    };

    eventSource.onerror = () => {
      setLogs((prev) => prev + "\n❌ Error streaming logs");
      setLoading(false);
      eventSource.close();
    };

    eventSource.onopen = () => setLoading(false);
  };

  const sharedStyle = {
    color: darkMode ? '#fff' : '#000',
    backgroundColor: darkMode ? '#1a1a1a' : '#fff',
    transition: 'all 0.3s ease'
  };

  return (
    <div style={{ ...sharedStyle, minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: 600, margin: 'auto', padding: '2rem', backgroundColor: darkMode ? '#2c2c2c' : '#f9f9f9', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>⚙️ Run Build Script</h2>
          <label>
            <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
            <span style={{ marginLeft: '8px' }}>🌙 Dark Mode</span>
          </label>
        </div>

        <form onSubmit={handleSubmit}>
          <input style={inputStyle(darkMode)} placeholder="📦 GitHub Repo URL" value={repo} onChange={(e) => setRepo(e.target.value)} required />
          <input style={inputStyle(darkMode)} placeholder="🛠️ Service Name" value={service} onChange={(e) => setService(e.target.value)} required />
          <input style={inputStyle(darkMode)} placeholder="🧪 Build Type (e.g. maven or gradle)" value={build} onChange={(e) => setBuild(e.target.value)} required />
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button type="submit" style={buttonStyle}>Run Script</button>
          </div>
        </form>

        {loading && (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        )}

        <div style={logBoxStyle(darkMode)}>
          {logs}
        </div>
      </div>
    </div>
  );
}

const inputStyle = (dark) => ({
  width: '100%',
  padding: '12px',
  marginBottom: '1rem',
  borderRadius: '8px',
  border: dark ? '1px solid #444' : '1px solid #ccc',
  fontSize: '1rem',
  backgroundColor: dark ? '#333' : '#fff',
  color: dark ? '#eee' : '#000'
});

const buttonStyle = {
  padding: '12px 24px',
  backgroundColor: '#2563eb',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '1rem',
  cursor: 'pointer'
};

const logBoxStyle = (dark) => ({
  backgroundColor: dark ? '#000' : '#1e1e1e',
  color: '#00ff00',
  padding: '1rem',
  marginTop: '2rem',
  height: '300px',
  overflowY: 'auto',
  borderRadius: '8px',
  fontFamily: 'monospace',
  fontSize: '0.95rem',
  whiteSpace: 'pre-wrap'
});

export default App;
