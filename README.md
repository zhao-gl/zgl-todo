# zgl-todo

一个基于 Electron + React + TypeScript + Ant Design 开发的桌面端待办工具。

## 🌟 功能特性

- ✅ 今日待办管理
- 📊 日程概览
- 📥 收集箱
- 🏷️ 标签视图
- 🗑️ 回收站
- 📈 数据统计
- 🌙 深色/浅色主题
- 🎯 拖拽排序
- 🔐 用户登录系统
- 💾 本地数据库存储

## 🛠️ 技术栈

### 前端
- **React 19** - UI 框架
- **TypeScript** - 类型安全
- **Ant Design 6** - UI 组件库
- **React Router 7** - 路由管理
- **Less** - 样式预处理器

### 桌面端
- **Electron 40** - 桌面应用框架
- **better-sqlite3** - 本地数据库

### 开发工具
- **Vite 6** - 构建工具
- **SWC** - JavaScript/TypeScript 编译器

## 📦 安装

```bash
# 克隆项目
git clone <repository-url>
cd zgl-todo

# 安装依赖
npm install

# 启动开发环境
npm run electron:dev
```

## 🚀 运行命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动 Vite 开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run electron:dev` | 启动 Electron 开发环境 |
| `npm run electron:build` | 构建所有平台的 Electron 应用 |
| `npm run electron:build:win` | 构建 Windows 版本 |
| `npm run electron:build:mac` | 构建 macOS 版本 |
| `npm run electron:build:linux` | 构建 Linux 版本 |

## 📁 项目结构

```
zgl-todo/
├── electron/                 # Electron 主进程代码
│   ├── db/                  # 数据库相关
│   │   ├── controller/     # 数据库操作控制器
│   │   └── db.js          # 数据库初始化
│   ├── ipc/               # IPC 通信
│   │   └── ipc.js         # IPC 处理
│   ├── main.js            # Electron 主进程入口
│   ├── preload.js         # 预加载脚本
│   └── utils.js           # 工具函数
├── src/                   # 前端代码
│   ├── pages/            # 页面组件
│   │   ├── login/       # 登录页面
│   │   ├── todoList/    # 待办列表
│   │   ├── overview/    # 概览页面
│   │   ├── collect/     # 收集箱
│   │   ├── tagView/     # 标签视图
│   │   └── recycle/     # 回收站
│   ├── components/       # 公共组件
│   ├── layout/          # 布局组件
│   ├── router/          # 路由配置
│   ├── styles/          # 全局样式
│   ├── App.tsx          # 根组件
│   └── main.tsx         # 前端入口
├── vite.config.ts        # Vite 配置
├── electron-builder.config.js  # Electron 打包配置
└── package.json          # 项目配置
```

## 🔐 数据库

项目使用 `better-sqlite3` 作为本地数据库，数据存储在用户数据目录：

- Windows: `C:\Users\<用户名>\AppData\Roaming\<app-name>\`
- macOS: `~/Library/Application Support/<app-name>/`
- Linux: `~/.config/<app-name>/`

### 数据库表结构

#### tb_users
- id - 主键
- username - 用户名
- nickname - 昵称
- email - 邮箱
- password_hash - 密码哈希
- created_at - 创建时间

#### tb_todos
- id - 主键
- title - 待办标题
- completed - 是否完成
- created_at - 创建时间

## 🎨 窗口控制

项目实现了自定义窗口控制按钮，支持：
- 最小化
- 最大化/还原
- 关闭

按钮类名：
- `.electron-window-min-btn` - 最小化按钮
- `.electron-window-max-btn` - 最大化按钮
- `.electron-window-close-btn` - 关闭按钮

## 📝 开发规范

- 使用 TypeScript 进行类型检查
- 使用 ESLint 进行代码规范检查
- 组件命名使用 PascalCase
- 文件命名使用 camelCase 或 PascalCase
- 样式使用 Less 模块化

## 🚧 构建应用

```bash
# 构建所有平台
npm run electron:build

# 构建特定平台
npm run electron:build:win    # Windows
npm run electron:build:mac    # macOS
npm run electron:build:linux  # Linux
```

构建后的应用将在 `dist` 目录中生成。

## 📄 许可证

MIT License

## 👤 作者

zhaogl
