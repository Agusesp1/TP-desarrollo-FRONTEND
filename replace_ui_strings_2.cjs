const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, 'src', 'components');

const replacements = [
  { from: />Member<\/span>/g, to: '>Socio</span>' },
  { from: />Member Titular:/g, to: '>Socio Titular:' },
  { from: />Member:</g, to: '>Socio:' },
  { from: />Member \/ Membresía</g, to: '>Socio / Membresía<' },
  { from: />N° Receipt/g, to: '>N° Comprobante' },
  { from: /Receipt de Cobro Registrado/g, to: 'Comprobante de Cobro Registrado' },
  { from: /Receipt de Payment/g, to: 'Comprobante de Pago' },
  { from: /Receipt Electrónico/g, to: 'Comprobante Electrónico' },
  { from: /Medio de Payment/g, to: 'Medio de Pago' },
  { from: /Date de Payment/g, to: 'Fecha de Pago' },
  { from: /Límite Payment/g, to: 'Límite de Pago' },
  { from: /Shift Preferencial/g, to: 'Turno Preferencial' },
  { from: /N° de Recibo o Receipt Interno/g, to: 'N° de Recibo o Comprobante Interno' }
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
    console.log('Updated', file.replace(rootDir, ''));
  }
});

console.log('Replacements completed.');
