/**
 * Electron Builder 配置文件
 * 用于打包 Electron 应用程序
 */

module.exports = {
  // 应用基本信息
  appId: 'com.zgl.todo',
  productName: 'zgl-todo',
  copyright: 'Copyright © 2024 zhaogl',

  // 输出目录配置
  directories: {
    output: 'dist_electron',
    buildResources: 'build'
  },

  // 要包含的文件
  files: [
    'electron/**/*',
    'dist/**/*',
    '!**/*.pdb', // 移除调试符号
    '!**/*.debug',
    '!**/debug/**'
  ],

  compression: 'maximum', // 启用最高级别压缩
  asar: true, // 启用 ASAR 打包
  asarUnpack: ['**/*.node'], // 只解包原生模块

  // 额外资源（语言包过滤）
  extraResources: [
    {
      from: 'node_modules/electron/dist/resources/',
      to: 'resources/',
      filter: [
        'default_app.asar',
        'locales/en-US.pak',
        'locales/zh-CN.pak',
        '!locales/**'  // 排除其他语言包
      ]
    }
  ],

  // Windows 配置
  win: {
    target: [
      {
        target: 'nsis',
        arch: ['x64']
      },
      {
        target: 'portable',
        arch: ['x64']
      }
    ],
    icon: 'build/icon.ico',
    publisherName: 'zhaogl',
    verifyUpdateCodeSignature: false
  },

  // NSIS 安装包配置
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: 'zgl-todo',
    uninstallDisplayName: 'zgl-todo',
    license: 'build/license.txt',
    artifactName: '${productName}-${version}-setup.${ext}'
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

  // AppImage 配置
  appImage: {
    artifactName: '${productName}-${version}.${ext}'
  },

  // Deb 包配置
  deb: {
    artifactName: '${productName}-${version}-${arch}.${ext}',
    depends: ['libgtk-3-0', 'libnotify4', 'libnss3', 'libxss1', 'libxtst6', 'xdg-utils']
  },

  // RPM 包配置
  rpm: {
    artifactName: '${productName}-${version}-${arch}.${ext}'
  },

  // 发布配置
  publish: {
    provider: 'github',
    releaseType: 'release'
  },

  // 构建钩子函数
  afterPack: async (context) => {
    console.log('开始构建 Electron 应用...');
    console.log(`版本: ${context.packager.appInfo.version}`);
    // console.log(`平台: ${context.platform.nodeName}`);
  },

  afterAllArtifactBuild: async (context) => {
    console.log('Electron 应用构建完成!');
    console.log(`输出目录: ${context.outDir}`);
  }
};
