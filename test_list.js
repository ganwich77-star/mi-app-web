import fs from 'fs';
const content = fs.readFileSync('/Users/pujaltefotografia/Desktop/DESARROLLO APP Y WEB/00 PROYECTOS ANTIGRAVITY/03 ORLAS 2026/src/components/CommandCenter.jsx', 'utf8');
const lines = content.split('\n');
console.log(lines.slice(330, 421).join('\n'));
