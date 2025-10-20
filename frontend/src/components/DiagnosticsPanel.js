import React, { useState } from 'react';
import axios from 'axios';

const DiagnosticsPanel = () => {
  const [target, setTarget] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async (playbook) => {
    setLoading(true);
    setOutput('');
    try {
      const response = await axios.post('http://localhost:5000/run-playbook', {
        target,
        playbook
      });
      const { stdout, stderr } = response.data;
      setOutput(stdout || stderr);
    } catch (error) {
      setOutput('Error running diagnostics: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Network Diagnostics</h2>
      <h1>Hello this add from the client page</h1>
      <input
        type="text"
        placeholder="Enter target IP or hostname"
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        style={{ width: '300px', marginRight: '10px' }}
      />
      <button onClick={() => runDiagnostics('ping_check.yml')} disabled={loading}>
        Run Ping
      </button>
      <button onClick={() => runDiagnostics('traceroute_check.yml')} disabled={loading}>
        Run Traceroute
      </button>
      <pre style={{ marginTop: '20px', background: '#f4f4f4', padding: '10px' }}>
        {loading ? 'Running...' : output}
      </pre>
    </div>
  );
};

export default DiagnosticsPanel;