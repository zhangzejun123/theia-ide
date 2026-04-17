// scripts/prepare-plugins.js
// 将 plugins/ 目录下的插件重命名为 <publisher>.<name>-<version> 并拷贝到目标目录
const fs = require('fs');
const path = require('path');

const destDir = process.argv[2];
if (!destDir) {
    console.error('用法: node scripts/prepare-plugins.js <destDir>');
    process.exit(1);
}

const pluginsDir = 'plugins';
if (!fs.existsSync(pluginsDir)) {
    console.log('plugins 目录不存在，跳过');
    process.exit(0);
}

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

for (const entry of fs.readdirSync(pluginsDir)) {
    const src = path.join(pluginsDir, entry);
    if (!fs.statSync(src).isDirectory()) { continue; }

    const pkgPath = path.join(src, 'extension', 'package.json');
    let destName = entry;

    if (fs.existsSync(pkgPath)) {
        const { publisher, name, version } = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        if (publisher && name && version) {
            destName = `${publisher}.${name}-${version}`;
        }
    }

    const dest = path.join(destDir, destName);
    fs.cpSync(src, dest, { recursive: true });
    console.log(`${entry} -> ${destName}`);
}

console.log('完成');
