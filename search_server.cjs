const fs = require('fs');
const filePath = "C:\\Users\\Max\\Downloads\\A Codici Main\\VigilAI_Raspberry\\server.ts";
try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
        if (line.includes('listen') || line.includes('PORT') || line.includes('3088') || line.includes('http.createServer')) {
            console.log(`${idx+1}: ${line.trim()}`);
        }
    });
} catch (e) {
    console.error(e);
}
