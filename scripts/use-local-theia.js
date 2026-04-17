// scripts/use-local-theia.js
// 用下载的 @theia 包覆盖 node_modules/@theia，保留官方安装的各包 node_modules
const fs = require('fs');
const path = require('path');

const localDir = path.resolve(process.argv[2]);

if (!fs.existsSync(localDir)) {
    console.error(`目录不存在: ${localDir}`);
    process.exit(1);
}

for (const entry of fs.readdirSync(localDir)) {
    const pkgDir = path.join(localDir, entry);
    if (!fs.statSync(pkgDir).isDirectory()) { continue; }

    const target = path.join('node_modules', '@theia', entry);
    if (!fs.existsSync(target)) {
        console.log(`跳过 @theia/${entry}（官方未安装此包）`);
        continue;
    }

    // 删除下载包里的 node_modules，避免污染官方安装的依赖
    const localNm = path.join(pkgDir, 'node_modules');
    if (fs.existsSync(localNm)) {
        fs.rmSync(localNm, { recursive: true, force: true });
    }

    // 暂存官方的 node_modules（同盘，避免 EXDEV 跨设备错误）
    const officialNm = path.join(target, 'node_modules');
    const tmpNm = path.join('node_modules', '@theia', `_tmp_nm_${entry}`);
    if (fs.existsSync(officialNm)) {
        fs.renameSync(officialNm, tmpNm);
    }

    // 覆盖
    fs.rmSync(target, { recursive: true, force: true });
    fs.cpSync(pkgDir, target, { recursive: true });

    // 还原官方的 node_modules
    if (fs.existsSync(tmpNm)) {
        fs.renameSync(tmpNm, officialNm);
    }
    console.log(`Replaced @theia/${entry}`);
}

console.log('完成');
