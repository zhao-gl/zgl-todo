/**
 * 发布脚本
 * 读取 package.json 中的 version 作为 git tag，
 * 然后构建并发布 win/mac/linux 三平台安装包到 GitHub Release。
 *
 * 用法：
 *   node scripts/publish.js
 *   # 或
 *   npm run publish
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// 读取 package.json 中的版本号
const pkgPath = path.join(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
const version = pkg.version;
const tag = `v${version}`;

console.log(`======================================`);
console.log(`  发布版本: ${version}`);
console.log(`  Git Tag:  ${tag}`);
console.log(`  目标平台: win, mac, linux`);
console.log(`======================================\n`);

// 1) 创建 git tag
try {
  console.log(`🔖 创建 git tag: ${tag}`);
  execSync(`git tag ${tag}`, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  console.log(`✅ 标签创建成功\n`);
} catch (err) {
  if (err.message.includes('already exists')) {
    console.log(`⚠️  标签 ${tag} 已存在，跳过创建\n`);
  } else {
    console.error(`❌ 创建标签失败:`, err.message);
    process.exit(1);
  }
}

// 2) 推送 tag 到远程
try {
  console.log(`📤 推送标签到远程: ${tag}`);
  execSync(`git push github ${tag}`, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  console.log(`✅ 标签推送成功\n`);
} catch (err) {
  console.error(`❌ 推送标签失败:`, err.message);
  process.exit(1);
}

// 3) 构建并发布（三平台）
const builderConfig = path.join(__dirname, '..', 'electron-builder.config.js');
const buildCmd = `npx electron-builder --win --mac --linux --config "${builderConfig}" --publish onTag`;

try {
  console.log(`🚀 开始构建并发布 (win + mac + linux)...\n`);
  execSync(buildCmd, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  console.log(`\n✅ 构建发布完成！`);
} catch (err) {
  console.error(`\n❌ 构建发布失败:`, err.message);
  process.exit(1);
}
