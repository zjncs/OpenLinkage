# 灵犀健康 - Electron 打包指南

本指南将帮助您将灵犀健康应用打包成 Windows exe 和 macOS dmg 安装包。

## 前提条件

### 系统要求
- **Windows 打包**：需要在 Windows 系统上进行
- **macOS 打包**：需要在 macOS 系统上进行
- **跨平台打包**：可以在 Linux 上打包 Windows 版本，但 macOS 版本必须在 macOS 上打包

### 软件要求
- Node.js 22.x 或更高版本
- pnpm 10.x 或更高版本
- Git（用于克隆项目）

## 步骤 1：准备应用图标

### Windows 图标 (icon.ico)
1. 准备一张 1024x1024 像素的 PNG 图片
2. 使用在线工具转换为 .ico 格式：
   - https://icoconvert.com/
   - https://convertio.co/zh/png-ico/
3. 将生成的 `icon.ico` 文件放到项目的 `build/` 目录

### macOS 图标 (icon.icns)
1. 准备一张 1024x1024 像素的 PNG 图片
2. 在 macOS 上使用以下命令转换：

```bash
# 创建临时目录
mkdir icon.iconset

# 生成不同尺寸的图标
sips -z 16 16     icon.png --out icon.iconset/icon_16x16.png
sips -z 32 32     icon.png --out icon.iconset/icon_16x16@2x.png
sips -z 32 32     icon.png --out icon.iconset/icon_32x32.png
sips -z 64 64     icon.png --out icon.iconset/icon_32x32@2x.png
sips -z 128 128   icon.png --out icon.iconset/icon_128x128.png
sips -z 256 256   icon.png --out icon.iconset/icon_128x128@2x.png
sips -z 256 256   icon.png --out icon.iconset/icon_256x256.png
sips -z 512 512   icon.png --out icon.iconset/icon_256x256@2x.png
sips -z 512 512   icon.png --out icon.iconset/icon_512x512.png
sips -z 1024 1024 icon.png --out icon.iconset/icon_512x512@2x.png

# 转换为 .icns 格式
iconutil -c icns icon.iconset

# 清理临时文件
rm -rf icon.iconset
```

3. 将生成的 `icon.icns` 文件放到项目的 `build/` 目录

### 使用在线工具（推荐）
如果您不想手动转换，可以使用在线工具：
- https://cloudconvert.com/png-to-icns （PNG 转 ICNS）
- https://icoconvert.com/ （PNG 转 ICO）

## 步骤 2：下载项目代码

### 方法 1：从 Manus 导出代码
1. 在 Manus 管理界面，进入 **Code** 面板
2. 点击 **Download All Files** 下载整个项目
3. 解压到本地目录

### 方法 2：从 GitHub 导出（如果已导出）
```bash
git clone <your-github-repo-url>
cd linkage-health
```

## 步骤 3：安装依赖

```bash
# 进入项目目录
cd linkage-health

# 安装依赖
pnpm install
```

## 步骤 4：配置环境变量

创建 `.env` 文件并配置必要的环境变量：

```bash
# 数据库连接（必需）
DATABASE_URL=mysql://user:password@host:port/database

# 豆包 AI API（必需）
DOUBAO_API_KEY=your-api-key-here
DOUBAO_MODEL=doubao-seed-1-8-251228
DOUBAO_API_URL=https://ark.cn-beijing.volces.com/api/v3/responses

# JWT 密钥（必需）
JWT_SECRET=your-secret-key-here
```

**重要提示**：
- 如果您使用 Manus 平台的数据库，需要将数据库迁移到自己的 MySQL 服务器
- 或者使用云数据库服务（如 PlanetScale、AWS RDS、阿里云 RDS 等）

## 步骤 5：构建应用

```bash
# 构建 Web 应用和服务器代码
pnpm build
```

这将生成：
- `client/dist/` - 前端构建文件
- `dist/` - 服务器构建文件

## 步骤 6：打包 Electron 应用

### 打包 Windows 版本（在 Windows 上）

```bash
pnpm build:electron
```

生成的文件位于 `release/` 目录：
- `灵犀健康 Setup.exe` - Windows 安装程序

### 打包 macOS 版本（在 macOS 上）

```bash
pnpm build:electron
```

生成的文件位于 `release/` 目录：
- `灵犀健康.dmg` - macOS 磁盘映像

### 打包两个平台（在 macOS 上）

```bash
# 同时打包 Windows 和 macOS 版本
pnpm build:electron -- -mw
```

## 步骤 7：测试安装包

### Windows
1. 双击 `灵犀健康 Setup.exe`
2. 按照安装向导完成安装
3. 启动应用并测试所有功能

### macOS
1. 双击 `灵犀健康.dmg`
2. 将应用拖到 Applications 文件夹
3. 启动应用并测试所有功能

## 常见问题

### Q1：打包时提示缺少图标文件
**解决方案**：确保 `build/icon.ico` 和 `build/icon.icns` 文件存在。如果没有图标，可以临时删除 package.json 中的 icon 配置。

### Q2：macOS 提示"应用已损坏"
**解决方案**：这是因为应用未签名。可以通过以下命令绕过：
```bash
xattr -cr /Applications/灵犀健康.app
```

或者申请 Apple Developer 账号并签名应用。

### Q3：Windows Defender 提示病毒
**解决方案**：这是误报。未签名的应用可能被标记为不安全。可以申请代码签名证书。

### Q4：应用启动后无法连接数据库
**解决方案**：
1. 检查 `.env` 文件中的 `DATABASE_URL` 是否正确
2. 确保数据库服务器允许远程连接
3. 检查防火墙设置

### Q5：AI 对话功能不工作
**解决方案**：
1. 检查 `.env` 文件中的 `DOUBAO_API_KEY` 是否正确
2. 确保网络可以访问豆包 API
3. 检查 API 配额是否用完

## 高级配置

### 自定义安装程序

编辑 `package.json` 中的 `build` 配置：

```json
{
  "build": {
    "appId": "com.linkage.health",
    "productName": "灵犀健康",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "electron/**/*",
      "package.json"
    ],
    "mac": {
      "target": ["dmg", "zip"],
      "category": "public.app-category.healthcare-fitness",
      "icon": "build/icon.icns",
      "hardenedRuntime": true,
      "entitlements": "build/entitlements.mac.plist"
    },
    "win": {
      "target": ["nsis", "portable"],
      "icon": "build/icon.ico",
      "certificateFile": "path/to/certificate.pfx",
      "certificatePassword": "password"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    }
  }
}
```

### 代码签名

#### Windows 代码签名
1. 购买代码签名证书（如 DigiCert、Sectigo）
2. 配置 package.json：
```json
{
  "win": {
    "certificateFile": "path/to/certificate.pfx",
    "certificatePassword": "your-password"
  }
}
```

#### macOS 代码签名
1. 注册 Apple Developer 账号（$99/年）
2. 创建开发者证书
3. 配置 package.json：
```json
{
  "mac": {
    "identity": "Developer ID Application: Your Name (TEAM_ID)"
  }
}
```

## 分发应用

### Windows
- 将 `.exe` 文件上传到您的网站或云存储
- 或发布到 Microsoft Store

### macOS
- 将 `.dmg` 文件上传到您的网站或云存储
- 或发布到 Mac App Store（需要额外配置）

## 自动化构建（CI/CD）

使用 GitHub Actions 自动构建：

```yaml
name: Build Electron App

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [macos-latest, windows-latest]
    
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 22
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm build:electron
      
      - uses: actions/upload-artifact@v3
        with:
          name: ${{ matrix.os }}-build
          path: release/*
```

## 支持与反馈

如有问题，请参考：
- Electron 官方文档：https://www.electronjs.org/docs
- electron-builder 文档：https://www.electron.build/

---

**祝您打包顺利！** 🎉
