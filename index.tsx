import React from 'react';
import ReactDOM from 'react-dom/client';

console.log('STARTING REACT BOOTSTRAP');

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error("Root not found");

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <div style={{ background: 'green', height: '100vh', padding: 50, color: 'white' }}>
      <h1>REACT 19 BOOTSTRAP SUCCESS</h1>
      <p>React Core is working. Next step: Re-connect App.</p>
    </div>
  );
  console.log('REACT RENDER CALLED');
} catch (e) {
  console.error('REACT BOOTSTRAP FAILED', e);
  document.body.innerHTML = '<div style="background:red;color:white;padding:20px">REACT FATAL: ' + e + '</div>';
}
