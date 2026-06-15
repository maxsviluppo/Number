const fs = require('fs');

const filePath = "C:\\Users\\Max\\Downloads\\A Codici Main\\Numbergame-Final\\components\\App.tsx";
if (fs.existsSync(filePath)) {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
            if (line.includes('adTimer') || line.includes('rewardDuration') || line.includes('ADS_CONFIG') || line.includes('60') || line.includes('30')) {
                if (line.trim().length < 200) {
                    console.log(`${idx+1}: ${line.trim()}`);
                }
            }
        });
    } catch (e) {
        console.error(e);
    }
} else {
    console.log("File does not exist");
}
