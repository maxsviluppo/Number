console.log('STARTING INDEX.TSX EXECUTION');

try {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="background: yellow; color: black; font-size: 30px; padding: 20px; height: 100vh;">
        <h1>PURE JS CHECK</h1>
        <p>React is bypassed. If you see this, JS is running.</p>
      </div>
    `;
    console.log('DOM UPDATED MANUALLY');
  } else {
    console.error('ROOT NOT FOUND');
    document.body.innerHTML = 'ROOT MISSING';
  }
} catch (e) {
  console.error('FATAL JS ERROR', e);
  document.body.innerHTML = 'FATAL ERROR: ' + e;
}

// STOP HERE - NO REACT IMPORT
// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import App from './App'; ...
