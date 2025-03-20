const fs = require('fs');

const filePath = './config/firebaseAdmin.json';
const data = fs.readFileSync(filePath, 'utf8');

// Convert to single-line JSON and escape newlines and quotes
const singleLine = JSON.stringify(JSON.parse(data));

console.log(singleLine);
