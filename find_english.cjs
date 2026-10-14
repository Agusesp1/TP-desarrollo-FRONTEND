const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, 'src', 'components');

const regex = />([^<]+)</g;
const words = /\b(quota|quotas|member|members|teacher|teachers|payment|payments|receipt|receipts|client|clients|user|users|amount|status|date|shift|shifts)\b/i;

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
let results = [];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = regex.exec(content)) !== null) {
    if (words.test(match[1])) {
      results.push(`${file.replace(rootDir, '')}: ${match[1].trim().substring(0, 100)}`);
    }
  }
});

fs.writeFileSync('english_texts.txt', results.join('\n'));
console.log('Done. Wrote to english_texts.txt');
