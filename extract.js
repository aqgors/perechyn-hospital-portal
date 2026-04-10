const fs = require('fs');
const path = require('path');

const traverse = (dir, results = []) => {
  const files = fs.readdirSync(dir);
  for(const file of files) {
    const fullPath = path.join(dir, file);
    if(fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath, results);
    } else if(fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      // Using /t\(['"]([^'"]+)['"]\s*,\s*['"](.*?)['"]\)/g to avoid string delimiter issues
      const regex = /t\(['"]([^'"]+)['"]\s*,\s*['"](.*?)['"]\)/g;
      let m;
      while ((m = regex.exec(content)) !== null) {
        results.push({ key: m[1], fallback: m[2], file: fullPath });
      }
    }
  }
  return results;
};

const res = traverse('./frontend/src');
const map = {};
for(const {key, fallback} of res) {
  const parts = key.split('.');
  let current = map;
  for(let i=0; i<parts.length-1; i++) {
    const p = parts[i];
    if(!current[p]) current[p] = {};
    current = current[p];
  }
  current[parts[parts.length-1]] = fallback;
}

// Ensure the locales exist
let en = {};
let ua = {};
try {
  en = JSON.parse(fs.readFileSync('./frontend/src/locales/en.json', 'utf8'));
  ua = JSON.parse(fs.readFileSync('./frontend/src/locales/ua.json', 'utf8'));
} catch (e) {}

// Deep merge map into en and ua
const deepMerge = (target, source) => {
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], deepMerge(target[key], source[key]));
    }
  }
  Object.assign(target || {}, source);
  return target;
}

deepMerge(ua, map);
// To enforce translation to English, I will output the new skeleton as well, but for now let's just make it fall back to UA string in EN so we know what needs manual mapping
deepMerge(en, map);

fs.writeFileSync('./frontend/src/locales/ua.json', JSON.stringify(ua, null, 2));
fs.writeFileSync('./frontend/src/locales/en.json', JSON.stringify(en, null, 2));

console.log('Locales updated successfully', 'Total missing keys found:', res.length);
