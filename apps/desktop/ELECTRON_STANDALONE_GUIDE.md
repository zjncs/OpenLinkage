# 灵犀健康 - 纯前端 Electron 应用指南

## 项目概述

灵犀健康已改造为**纯前端 Electron 桌面应用**，所有数据存储在本地 SQLite 数据库中，无需后端服务器。

**核心特性**：
- ✅ 完全离线运行，无需网络连接（除 AI 功能外）
- ✅ 数据隐私性强，所有数据存储在用户本地
- ✅ 无需配置数据库服务器
- ✅ 支持打包为 Windows exe 和 macOS dmg

---

## 技术架构

### 前端
- **框架**：React 19 + TypeScript + Vite
- **UI 库**：shadcn/ui + Tailwind CSS 4
- **图表**：Recharts
- **样式**：高端杂志风格（奶油色背景 + Playfair Display 字体）

### Electron
- **主进程**：`electron/main.cjs`
- **预加载脚本**：`electron/preload.cjs`
- **IPC 通信**：通过 `window.electronAPI` 暴露接口

### 数据存储
- **数据库**：SQLite（better-sqlite3）
- **位置**：用户数据目录 `app.getPath('userData')/health.db`
- **表结构**：
  - `conversations` - 对话记录
  - `messages` - 消息记录
  - `health_records` - 健康数据
  - `health_reports` - 健康报告
  - `reminders` - 提醒设置

### AI 集成
- **API**：字节跳动豆包 AI
- **调用位置**：Electron 主进程（`electron/ai.cjs`）
- **环境变量**：
  - `DOUBAO_API_KEY` - API 密钥
  - `DOUBAO_MODEL` - 模型名称
  - `DOUBAO_API_URL` - API 地址

---

## 开发环境

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

豆包 AI 配置已通过 Manus 管理界面设置：
- `DOUBAO_API_KEY`
- `DOUBAO_MODEL`
- `DOUBAO_API_URL`

### 3. 启动开发服务器

```bash
# 启动 Vite 开发服务器（浏览器预览）
pnpm dev

# 启动 Electron 应用（桌面应用预览）
pnpm electron:dev
```

**开发模式特性**：
- 浏览器环境：使用伪后端（内存数据）
- Electron 环境：使用真实 SQLite 数据库

---

## 打包流程

### 1. 构建前端

```bash
pnpm build
```

这会在 `client/dist` 目录生成优化后的前端文件。

### 2. 打包 Electron 应用

```bash
# 打包为当前平台的安装包
pnpm build:electron

# Windows 上生成 exe
pnpm build:electron

# macOS 上生成 dmg
pnpm build:electron
```

**输出目录**：`release/`

**生成文件**：
- Windows：`灵犀健康 Setup 1.0.0.exe`
- macOS：`灵犀健康-1.0.0.dmg`

### 3. 跨平台打包

由于 electron-builder 的限制，需要在对应平台上构建：
- **Windows exe**：必须在 Windows 系统上构建
- **macOS dmg**：必须在 macOS 系统上构建

---

## 项目结构

```
linkage-health/
├── client/                    # 前端代码
│   ├── src/
│   │   ├── components/       # UI 组件
│   │   │   ├── AppLayout.tsx # 应用布局
│   │   │   └── ChatInterface.tsx # 对话界面
│   │   ├── pages/            # 页面组件
│   │   │   ├── Home.tsx      # 首页（对话）
│   │   │   ├── HealthData.tsx # 健康数据
│   │   │   ├── Analytics.tsx  # 数据分析
│   │   │   ├── Reports.tsx    # 健康报告
│   │   │   └── Settings.tsx   # 设置
│   │   ├── lib/
│   │   │   ├── api.ts        # API 封装层
│   │   │   └── mock-backend.ts # 伪后端
│   │   └── electron.d.ts     # Electron 类型定义
│   └── dist/                 # 构建输出
├── electron/                  # Electron 主进程
│   ├── main.cjs              # 主进程入口
│   ├── preload.cjs           # 预加载脚本
│   ├── database.cjs          # 数据库操作
│   └── ai.cjs                # AI API 调用
├── build/                     # 应用图标（待添加）
│   ├── icon.ico              # Windows 图标
│   └── icon.icns             # macOS 图标
├── release/                   # 打包输出
├── package.json              # 项目配置
└── README.md                 # 项目说明
```

---

## API 接口

### Electron IPC API

所有 API 通过 `window.electronAPI` 访问：

#### 对话相关
```typescript
// 创建对话
window.electronAPI.conversationCreate(title: string)

// 获取对话列表
window.electronAPI.conversationList()

// 获取对话详情
window.electronAPI.conversationGet(id: number)

// 删除对话
window.electronAPI.conversationDelete(id: number)

// 创建消息
window.electronAPI.messageCreate({
  conversationId: number,
  role: string,
  content: string
})
```

#### 健康数据相关
```typescript
// 创建健康记录
window.electronAPI.healthCreate({
  type: string,
  value: string,
  unit: string,
  notes?: string,
  recordedAt: number
})

// 获取健康记录列表
window.electronAPI.healthList(type?: string)

// 删除健康记录
window.electronAPI.healthDelete(id: number)
```

#### 报告相关
```typescript
// 创建报告
window.electronAPI.reportCreate({
  title: string,
  summary: string,
  trendAnalysis: string,
  riskAssessment: string,
  recommendations: string
})

// 获取报告列表
window.electronAPI.reportList()

// 获取报告详情
window.electronAPI.reportGet(id: number)
```

#### 提醒相关
```typescript
// 创建提醒
window.electronAPI.reminderCreate({
  title: string,
  description?: string,
  type: string,
  frequency: string,
  time: string
})

// 获取提醒列表
window.electronAPI.reminderList()

// 更新提醒状态
window.electronAPI.reminderUpdate({
  id: number,
  enabled: boolean
})

// 删除提醒
window.electronAPI.reminderDelete(id: number)
```

#### AI 相关
```typescript
// 对话
window.electronAPI.aiChat(messages: Array<{
  role: string,
  content: string
}>)

// 生成报告
window.electronAPI.aiGenerateReport(dataSummary: string)
```

#### 系统相关
```typescript
// 显示通知
window.electronAPI.showNotification(title: string, body: string)

// 获取应用版本
window.electronAPI.getAppVersion()

// 获取应用路径
window.electronAPI.getAppPath()
```

---

## 伪后端说明

为了在浏览器环境中开发和测试，项目包含伪后端实现（`client/src/lib/mock-backend.ts`）：

- **自动检测环境**：`client/src/lib/api.ts` 会自动检测是否在 Electron 环境
- **浏览器环境**：使用内存数据模拟所有 API
- **Electron 环境**：使用真实的 SQLite 数据库

**开发流程**：
1. 在浏览器中快速开发和调试 UI
2. 在 Electron 中测试完整功能
3. 打包后在真实环境中验证

---

## 常见问题

### 1. 如何更换 AI 模型？

修改环境变量：
- 通过 Manus 管理界面的 Settings → Secrets 更新
- 或在本地打包时修改 `.env` 文件

### 2. 数据存储在哪里？

- **开发环境**：`~/Library/Application Support/Electron/health.db`（macOS）
- **生产环境**：`~/Library/Application Support/灵犀健康/health.db`（macOS）
- **Windows**：`%APPDATA%\灵犀健康\health.db`

### 3. 如何备份数据？

直接复制 `health.db` 文件即可。

### 4. 如何添加应用图标？

1. 准备 1024x1024 的 PNG 图标
2. 使用在线工具转换：
   - Windows：转换为 `icon.ico`（256x256）
   - macOS：转换为 `icon.icns`（512x512@2x）
3. 放入 `build/` 目录
4. 重新打包

### 5. 打包后无法启动？

检查：
- 是否正确构建了前端（`pnpm build`）
- `electron/main.cjs` 中的路径是否正确
- 是否包含了 `better-sqlite3` 依赖

### 6. AI 功能不工作？

检查：
- 环境变量是否正确配置
- API 密钥是否有效
- 网络连接是否正常

---

## 下一步优化建议

1. **添加应用图标**：设计并添加品牌 Logo
2. **代码签名**：
   - Windows：购买代码签名证书
   - macOS：注册 Apple Developer 账号
3. **自动更新**：集成 electron-updater
4. **数据导出**：支持导出为 CSV/PDF
5. **离线 AI**：集成本地 LLM（如 Ollama）
6. **数据同步**：可选的云端同步功能

---

## 技术支持

如有问题，请参考：
- `README.md` - 项目总体说明
- `PACKAGING_GUIDE.md` - 详细打包指南
- Electron 官方文档：https://www.electronjs.org/
- better-sqlite3 文档：https://github.com/WiseLibs/better-sqlite3

---

**版本**：1.0.0  
**最后更新**：2026-01-27
