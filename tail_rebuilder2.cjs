const fs = require('fs');
const content = fs.readFileSync('src/App.jsx', 'utf8');

const regex = /schools\.map\(s => \([\s\S]*?Trash2 size=\{\d+\} \/>\s*<\/button>\s*<\/div>\s*\)\)\}\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\}\s*<\/div>\s*\)\}/;
let endCut = -1;

// Buscar el último </button> </div> ))}
const marker = '))}';
const markerIdx = content.lastIndexOf(marker);
if (markerIdx !== -1) {
   endCut = content.indexOf('</div>', markerIdx) + 6; // cierra grid
   endCut = content.indexOf('</div>', endCut) + 6;     // cierra col
   endCut = content.indexOf('</div>', endCut) + 6;     // cierra w-full max-w-7xl
   endCut = content.indexOf('</div>', endCut) + 6;     // NO... wait.
}

