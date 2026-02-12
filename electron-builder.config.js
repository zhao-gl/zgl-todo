/**
 * Electron Builder 配置文件
 * 用于打包 Electron 应用程序
 */
const path = require('path');
const fs = require('fs-extra');
const { flipFuses, FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  // 应用基本信息
  appId: 'com.zgl.todo',
  productName: 'zgl-todo',
  copyright: 'Copyright © 2024 zhaogl',

  // 输出目录配置
  directories: {
    output: 'dist_electron',
    buildResources: 'build' // 构建资源目录
  },

  // 要包含的文件
  files: [
    'electron/**/*',
    'dist/**/*',
    '!**/*.pdb', // 移除调试符号
    '!**/*.debug',
    '!**/debug/**',
    '!**/*.map', // 移除 sourcemap
    '!**/*.ts', // 移除源码
    '!**/*.md',
    '!**/LICENSE*',
    '!**/README*',
    '!**/__tests__/**/*',
    '!**/test/**/*',
    '!**/*.spec.*',
    '!**/*.test.*'
  ],

  compression: 'maximum', // 启用最高级别压缩
  asar: true, // 启用 ASAR 打包
  asarUnpack: [
    '**/*.node',
    '**/better-sqlite3/**/*',        // 匹配任何位置的 better-sqlite3
    '**/bindings/**/*',              // 匹配任何位置的 bindings
    '**/file-uri-to-path/**/*',
    // '**/node_modules/.pnpm/better-sqlite3@*/**/*',
    // '**/node_modules/.pnpm/bindings@*/**/*',
    // '**/node_modules/.pnpm/file-uri-to-path@*/**/*',
  ],

  // 额外资源
  extraResources: [],

  // Windows 配置
  win: {
    target: [
      {
        target: 'nsis',
        arch: ['x64']
      }
    ],
    icon: 'build/icon.ico',
    publisherName: 'zhaogl',
    signingHashAlgorithms: ['sha256'],
    // 时间戳服务器（防止证书过期后无法验证）
    timeStampServer: 'https://timestamp.digicert.com'
  },

  // NSIS 安装包配置
  nsis: {
    oneClick: false, // 禁用一键安装
    allowToChangeInstallationDirectory: true, // 允许用户更改安装目录
    createDesktopShortcut: true, // 创建桌面快捷方式
    createStartMenuShortcut: true, // 创建启动菜单快捷方式
    shortcutName: 'zgl-todo', // 桌面快捷方式的名称
    uninstallDisplayName: 'zgl-todo', // 卸载时显示的名称
    artifactName: '${productName}-${version}-setup.${ext}', // 安装包名称
  },

  // macOS 配置
  mac: {
    target: [
      'dmg',
      'zip'
    ],
    category: 'public.app-category.productivity',
    icon: 'build/icon.icns',
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: 'build/entitlements.mac.plist',
    entitlementsInherit: 'build/entitlements.mac.plist'
  },

  // DMG 配置
  dmg: {
    contents: [
      {
        x: 410,
        y: 150,
        type: 'link',
        path: '/Applications'
      },
      {
        x: 130,
        y: 150,
        type: 'file'
      }
    ]
  },

  // Linux 配置
  linux: {
    target: [
      'AppImage',
      'deb',
      'rpm'
    ],
    category: 'Office',
    icon: 'build/icons',
    maintainer: 'zhaogl',
    vendor: 'zhaogl'
  },

  // 发布配置
  // publish: {
  //   provider: 'github',
  //   releaseType: 'release'
  // },

  // 构建钩子函数
  afterPack: async (context) => {
    const { appOutDir } = context;
    const localesDir = path.join(appOutDir, 'locales');
    // 删除多余的语言包
    if (fs.existsSync(localesDir)) {
      console.log('🔍 清理不需要的语言包...');
      const keepLocales = ['en-US.pak', 'zh-CN.pak'];
      const allFiles = await fs.readdir(localesDir);
      let removedCount = 0;
      for (const file of allFiles) {
        if (!keepLocales.includes(file)) {
          try {
            await fs.remove(path.join(localesDir, file));
            removedCount++;
          } catch (error) {
            console.warn(`⚠️ 无法删除 ${file}:`, error.message);
          }
        }
      }
      console.log(`✅ 清理完成！删除了 ${removedCount} 个语言包文件`);
    }
    // 执行熔断操作
    const ext = process.platform === 'win32' ? '.exe' : '';
    const executableName = `zgl-todo${ext}`; // 对应你的 productName
    await flipFuses(
      path.join(context.appOutDir, executableName),
      {
        version: FuseVersion.V1,
        [FuseV1Options.RunAsNode]: false, // 禁用 RunAsNode
        [FuseV1Options.EnableCookieEncryption]: true,
        [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
        [FuseV1Options.EnableNodeCliInspectArguments]: false,
        [FuseV1Options.OnlyLoadAppFromAsar]: true,
      }
    );
    console.log('✅ 已成功烧断 Electron 熔断器 (Fuses)');

    await removeUnnecessaryFiles(appOutDir); // 删除多余文件
  },

  afterAllArtifactBuild: async (context) => {
    console.log('Electron 应用构建完成!');
    console.log(`输出目录: ${context.outDir}`);
  }
};


// 辅助函数
async function removeUnnecessaryFiles(appOutDir) {
  const filesToRemove = [
    // 'blink_image_resources_200_percent.pak', // 高dpi缩放资源
    'content_shell.pak', // 测试用 shell
    // "ffmpeg.dll", // 音视频
    // 'vk_swiftshader.dll', // webGL/3D
    // 'vk_swiftshader_icd.json', // webGL/3D
    // 'vulkan-1.dll' // webGL/3D
  ];
  for (const file of filesToRemove) {
    const filePath = path.join(appOutDir, file);
    if (fs.existsSync(filePath)) {
      await fs.unlink(filePath);
      console.log(`✅ 删除了: ${file}`);
    }
  }
}
