const fs = require('fs');
const path = require('path');

async function generateDoc(text, firmData) {
    const filePath = path.join(__dirname, 'vystup.txt');
    const content = `Firma: ${firmData.obchodniJmeno}\nText: ${text}`;
    fs.writeFileSync(filePath, content);
    return filePath;
}

module.exports = { generateDoc };