/**
 * 发布脚本
 * 读取 package.json 中的 version 作为 git tag，
 * 先执行前端构建，再构建并发布 win/mac/linux 三平台安装包到 GitHub Release。
 *
 * 用法：
 *   node scripts/publish.js
 *   # 或
 *   npm run publish
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// 加载 .env 文件中的环境变量
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        let key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        // 去除可能包裹值的引号
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  });
}

// 读取 package.json 中的版本号
const pkgPath = path.join(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
const version = pkg.version;
const tag = `v${version}`;

const root = path.join(__dirname, '..');

console.log(`======================================`);
console.log(`  发布版本: ${version}`);
console.log(`  Git Tag:  ${tag}`);
console.log(`  目标平台: win, mac, linux`);
console.log(`======================================\n`);

// 0) 清理可能锁住 native 模块的进程（不杀 node.exe，避免自杀）
try {
  console.log(`🧹 清理残留进程...`);
  execSync(`taskkill /f /im zgl-todo.exe 2>nul || exit /b 0`, { stdio: 'ignore', cwd: root });
  execSync(`taskkill /f /im electron.exe 2>nul || exit /b 0`, { stdio: 'ignore', cwd: root });
  console.log(`✅ 清理完成\n`);
} catch {
  // 没找到进程是正常情况，忽略
}

// 1) 前端构建
console.log(`🔨 前端构建 (npm run build)...\n`);
try {
  execSync(`npm run build`, { stdio: 'inherit', cwd: root });
  console.log(`\n✅ 前端构建成功\n`);
} catch (err) {
  console.error(`\n❌ 前端构建失败:`, err.message);
  process.exit(1);
}

// 2) 创建 git tag（如果已存在则先删除重建）
try {
  // 检查 tag 是否已存在
  const exists = execSync(`git tag -l "${tag}"`, { stdio: 'pipe', cwd: root })
    .toString()
    .trim() === tag;

  if (exists) {
    console.log(`⚠️  标签 ${tag} 已存在，先删除旧标签...`);
    execSync(`git tag -d ${tag}`, { stdio: 'inherit', cwd: root });
    // 同时删除远程旧标签
    try {
      execSync(`git push github :refs/tags/${tag}`, { stdio: 'inherit', cwd: root });
    } catch {
      // 远程可能没有，忽略
    }
    console.log(`🗑️  旧标签已删除\n`);
  }

  console.log(`🔖 创建 git tag: ${tag}`);
  execSync(`git tag ${tag}`, { stdio: 'inherit', cwd: root });
  console.log(`✅ 标签创建成功\n`);
} catch (err) {
  console.error(`❌ 创建标签失败:`, err.message);
  process.exit(1);
}

// 3) 推送 tag 到远程
try {
  console.log(`📤 推送标签到远程: ${tag}`);
  execSync(`git push github ${tag}`, { stdio: 'inherit', cwd: root });
  console.log(`✅ 标签推送成功\n`);
} catch (err) {
  console.error(`❌ 推送标签失败:`, err.message);
  process.exit(1);
}

// 4) 仅构建当前平台并发布到 GitHub Release
const builderConfig = path.join(root, 'electron-builder.config.js');
const platformFlag = process.platform === 'win32' ? '--win' : process.platform === 'darwin' ? '--mac' : '--linux';
const buildCmd = `npx electron-builder ${platformFlag} --config "${builderConfig}" --publish always`;

// 检查 GH_TOKEN 是否有效
if (!process.env.GH_TOKEN) {
  console.error(`❌ 未设置 GH_TOKEN 环境变量，无法发布到 GitHub Release`);
  console.error(`   请在 .env 文件中配置 GH_TOKEN = "your_github_token"`);
  process.exit(1);
}

console.log(`  当前平台: ${process.platform} → ${platformFlag}`);
console.log(`  注意: Windows 上只能构建 Windows 安装包`);
console.log(`         macOS/Linux 的包需在对应平台或 CI 中构建\n`);

try {
  console.log(`🚀 开始构建并发布 (${platformFlag})...\n`);
  execSync(buildCmd, { stdio: 'inherit', cwd: root, env: { ...process.env, ELECTRON_REBUILD_SKIP_CACHE: '1' } });
  console.log(`\n✅ 构建发布完成！`);

  // 检查本地构建产物
  const distDir = path.join(root, 'dist_electron');
  if (fs.existsSync(distDir)) {
    const artifacts = fs.readdirSync(distDir).filter(f =>
      f.endsWith('.exe') || f.endsWith('.dmg') || f.endsWith('.AppImage') || f.endsWith('.deb') || f.endsWith('.rpm') || f.endsWith('.zip')
    );
    if (artifacts.length > 0) {
      console.log(`\n📦 本地构建产物:`);
      artifacts.forEach(f => console.log(`   - ${f}`));
    }
    console.log(`\n🔗 请检查 GitHub Releases 页面:`);
    console.log(`   https://github.com/zhao-gl/zgl-todo/releases`);
  }
} catch (err) {
  console.error(`\n❌ 构建发布失败:`, err.message);
  process.exit(1);
}
