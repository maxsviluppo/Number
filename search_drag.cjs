const fs = require('fs');

const filePath = 'c:\\Users\\Max\\Downloads\\A Codici Main\\Numbergame-Final\\GameView.tsx';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log('=== SEARCHING FOR TARGET DISPLAYS IN FINAL ===');
lines.forEach((line, index) => {
  if (line.includes('targets-display-tutorial')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
