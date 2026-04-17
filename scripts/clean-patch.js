// scripts/clean-patch.js
// 清理 patch 文件，只保留 .js 文件的 diff 块
const fs = require('fs');

const patchFile = process.argv[2];
if (!patchFile) {
    console.error('用法: node scripts/clean-patch.js <patch-file>');
    process.exit(1);
}

const content = fs.readFileSync(patchFile, 'utf8');
const lines = content.split('\n');

const result = [];
let inBlock = false;
let keep = false;
let blockLines = [];

for (const line of lines) {
    if (line.startsWith('diff --git ')) {
        // 保存上一个块
        if (inBlock && keep) {
            result.push(...blockLines);
        }
        // 开始新块
        inBlock = true;
        keep = line.includes('.js ') || line.endsWith('.js');
        blockLines = [line];
    } else if (inBlock) {
        blockLines.push(line);
    }
}

// 最后一个块
if (inBlock && keep) {
    result.push(...blockLines);
}

fs.writeFileSync(patchFile, result.join('\n'), 'utf8');
console.log(`清理完成: ${patchFile}，保留 ${result.filter(l => l.startsWith('diff')).length} 个 .js 文件块`);
