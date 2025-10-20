import React from 'react';
// import DiagnosticsPanel from './components/DiagnosticsPanel';

import { BrowserRouter } from 'react-router-dom';
import NetworkDashboard from './components/NetworkDashboard';

function App() {
  return (
    <div className="App">
      {/* <DiagnosticsPanel /> */}

      <React.StrictMode>
        <BrowserRouter>
          <NetworkDashboard />
        </BrowserRouter>
      </React.StrictMode>

    </div>
  );
}

export default App;