// test-url.js
const { getHostArch } = require('@electron/get');

const version = '40.0.0';
const platform = process.platform; // 'win32'
const arch = getHostArch();        // 'x64'

// ✅ 使用反引号 +  $ {} 实现变量插值
const fileName = `electron-v${version}-${platform}-${arch}.zip`;

// 镜像地址（注意结尾要有 /）
const mirror = process.env.ELECTRON_MIRROR || 'https://github.com/electron/electron/releases/download/v';

// npmmirror 的目录是 v40.0.0（带 v），所以 customDir 应为 v $ {version}
const customDir = `${version}`;

const url = `${mirror}${customDir}/${fileName}`;
console.log('✅ Expected download URL:');
console.log(url);
