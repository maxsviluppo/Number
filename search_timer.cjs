
const fs = require('fs');
const filePath = 'c:\\Users\\Max\\Downloads\\A Codici Main\\Number-main\\Number-main\\App.tsx';
try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, index) => {
        if (line.includes('handleTimeAttackEnd')) {
            console.log(`Line ${index + 1}: ${line.trim()}`);
        }
        if (line.includes('const handleTimeAttackEnd =')) {
            console.log(`DEFINITION Line ${index + 1}: ${line.trim()}`);
        }
    });
    lines.forEach((line, index) => {
        if (line.includes('useEffect') && line.includes('timeLeft')) {
            console.log(`USEEFFECT TIMELEFT Line ${index + 1}: ${line.trim()}`);
        }
    });


} catch (err) {
    console.error(err);
}
