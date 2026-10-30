const fs = require('fs');
const path = require('path');

const baseDir = 'E:\\风险管控0618';
const files = [
  'pages/rural-risk-task-add.html',
  'pages/patrol-task-management.html',
  'pages/rural-risk-task-detail.html'
];

let hasError = false;

files.forEach(file => {
  const fullPath = path.join(baseDir, file);
  if (!fs.existsSync(fullPath)) {
    console.error('MISSING:', file);
    hasError = true;
    return;
  }
  const html = fs.readFileSync(fullPath, 'utf-8');
  const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  let index = 0;
  while ((match = scriptRegex.exec(html)) !== null) {
    index++;
    const code = match[1];
    const tmp = path.join(process.cwd(), `__tmp_${path.basename(file)}_${index}.js`);
    fs.writeFileSync(tmp, code, 'utf-8');
    try {
      const { execSync } = require('child_process');
      execSync(`node --check "${tmp}"`, { stdio: 'pipe' });
      console.log('OK:', file, 'script', index);
    } catch (e) {
      console.error('SYNTAX ERROR:', file, 'script', index);
      console.error(e.stderr ? e.stderr.toString() : e.message);
      hasError = true;
    } finally {
      try { fs.unlinkSync(tmp); } catch (e) {}
    }
  }
});

process.exit(hasError ? 1 : 0);
