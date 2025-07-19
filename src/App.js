import React, { useState } from 'react';

function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [logs, setLogs] = useState([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [theme, setTheme] = useState('dark');

  const isValidGitUrl = (url) => /^https:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+(\.git)?$/.test(url);

  const handleBuild = async () => {
    if (!isValidGitUrl(repoUrl)) {
      alert('Please enter a valid GitHub repository URL.');
      return;
    }

    setLogs([]);
    setIsBuilding(true);

    const encodedRepo = encodeURIComponent(repoUrl);
    const eventSource = new EventSource(`http://localhost:8080/build/logs?repoUrl=${encodedRepo}`);

    eventSource.onmessage = (event) => {
      setLogs((prev) => [...prev, event.data]);
    };

    eventSource.onerror = (err) => {
      console.error('SSE error:', err);
      eventSource.close();
      setIsBuilding(false);
    };

    eventSource.addEventListener('message', (event) => {
      if (event.data.includes('Build complete!')) {
        setIsBuilding(false);
        eventSource.close();
      }
    });

    try {
      await fetch('http://localhost:8080/build/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl }),
      });
    } catch (err) {
      console.error('Build request failed:', err);
      eventSource.close();
      setIsBuilding(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([logs.join('\n')], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'build-log.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const darkTheme = theme === 'dark';

  return (
    <div style={{ ...styles.container, backgroundColor: darkTheme ? '#1e1e1e' : '#f9f9f9', color: darkTheme ? '#fff' : '#111' }}>
      <div style={styles.header}>
        <h2 style={styles.heading}>⚙️ Git Build Runner</h2>
        <button onClick={toggleTheme} style={styles.themeButton}>
          {darkTheme ? '🌞 Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      <div style={styles.inputGroup}>
        <input
          type="text"
          placeholder="Enter GitHub Repo URL"
          value={repoUrl}
          required
          onChange={(e) => setRepoUrl(e.target.value)}
          style={styles.input}
        />
        <button
          onClick={handleBuild}
          disabled={isBuilding || !repoUrl.trim()}
          style={styles.button}
        >
          {isBuilding ? 'Building...' : 'Run Build'}
        </button>
        <button
          onClick={handleDownload}
          disabled={logs.length === 0}
          style={styles.downloadButton}
        >
          📥 Download Logs
        </button>
      </div>

      <pre style={{ ...styles.logBox, backgroundColor: darkTheme ? '#111' : '#eee', color: darkTheme ? '#00ff88' : '#333' }}>
        {logs.map((line, idx) => (
          <div key={idx}>{line}</div>
        ))}
        {isBuilding && <div style={{ color: '#999' }}>⏳ Running build...</div>}
      </pre>
    </div>
  );
}

const styles = {
  container: {
    padding: '40px',
    fontFamily: 'Segoe UI, sans-serif',
    minHeight: '100vh',
  },
  heading: {
    fontSize: '28px',
    marginBottom: '10px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputGroup: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  input: {
    flex: 1,
    padding: '10px 12px',
    fontSize: '16px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    minWidth: '300px',
  },
  button: {
    padding: '10px 16px',
    fontSize: '16px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  downloadButton: {
    padding: '10px 14px',
    fontSize: '16px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  themeButton: {
    padding: '8px 12px',
    fontSize: '14px',
    backgroundColor: '#444',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  logBox: {
    padding: '15px',
    height: '400px',
    overflowY: 'auto',
    borderRadius: '6px',
    fontFamily: 'monospace',
    fontSize: '14px',
    border: '1px solid #ccc',
  },
};

export default App;
