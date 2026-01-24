import React from 'react';

const App: React.FC = () => {
  console.log('MINIMAL APP RENDERED');
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'blue',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999
    }}>
      <h1 style={{ fontSize: '3rem', fontFamily: 'sans-serif' }}>MINIMAL RENDER TEST</h1>
      <p style={{ marginTop: '1rem', fontSize: '1.5rem' }}>If you see this, React is working perfectly.</p>
      <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(0,0,0,0.5)' }}>
        System Time: {new Date().toISOString()}
      </div>
    </div>
  );
};

export default App;
