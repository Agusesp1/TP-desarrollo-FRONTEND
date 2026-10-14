const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, 'src', 'components');

const replacements = [
  { from: />Socio:\/span>/g, to: '>Socio:</span>' },
  { from: />Socio Titular:\/span>/g, to: '>Socio Titular:</span>' },
  { from: />Socio \/ Membresía\/th>/g, to: '>Socio / Membresía</th>' }
];

function walkSync(dir, filelist = []) {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.jsx')) {
        filelist.push(dirFile);
      }
    }
  });
  return filelist;
}

const files = walkSync(rootDir);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  
  replacements.forEach(repl => {
    newContent = newContent.replace(repl.from, repl.to);
  });
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Fixed', file.replace(rootDir, ''));
  }
});

console.log('Fixes completed.');
