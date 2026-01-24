import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log('BOOTSTRAPPING APP COMPONENT');

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error("Root not found");

  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);

  console.log('APP MOUNTED');
} catch (e) {
  console.error('BOOTSTRAP ERROR', e);
  document.body.innerHTML = 'BOOTSTRAP ERROR: ' + e;
}
