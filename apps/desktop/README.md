# 灵犀健康 - AI 健康助手

一个基于 Electron 的桌面端 AI 健康助手应用，采用高端杂志风格的编辑美学设计，提供健康咨询对话、数据分析、语音输入、个性化报告生成和智能提醒等功能。

## 功能特性

### 核心功能

- **AI 健康咨询对话**：智能健康问答，专业医疗建议，支持多轮对话和上下文管理
- **健康数据管理**：记录体重、血压、心率、血糖、体温等多种健康指标
- **数据分析可视化**：使用 Recharts 展示健康趋势图表，提供统计分析
- **语音输入**：集成浏览器语音识别 API，支持语音输入健康问题
- **个性化健康报告**：基于健康数据自动生成趋势分析、风险评估和改善建议
- **智能提醒系统**：定时提醒用药、运动、体检等健康事项

### 技术特点

- **Electron 桌面应用**：支持打包为 Windows exe 和 macOS dmg
- **高端杂志风格 UI**：奶油色背景、Playfair Display 衬线字体、精致布局
- **现代技术栈**：React 19 + TypeScript + TailwindCSS 4 + tRPC + Drizzle ORM
- **AI 驱动**：集成 LLM API 提供智能健康咨询和报告生成

## 技术栈

### 前端
- React 19
- TypeScript
- TailwindCSS 4
- Wouter (路由)
- Recharts (图表)
- shadcn/ui (组件库)
- tRPC (类型安全 API)

### 后端
- Node.js + Express
- tRPC 11
- Drizzle ORM
- MySQL 数据库

### 桌面框架
- Electron
- electron-builder (打包工具)

## 开发指南

### 环境要求

- Node.js 22.x
- pnpm 10.x
- MySQL 数据库

### 安装依赖

```bash
pnpm install
```

### 数据库迁移

```bash
pnpm db:push
```

### 开发模式

#### Web 开发模式
```bash
pnpm dev
```

访问 http://localhost:3000 查看应用

#### Electron 开发模式
```bash
pnpm dev:electron
```

这将同时启动 Web 服务器和 Electron 窗口

### 运行测试

```bash
pnpm test
```

### 构建应用

#### 构建 Web 版本
```bash
pnpm build
```

#### 构建 Electron 应用
```bash
pnpm build:electron
```

打包后的文件将输出到 `release` 目录：
- Windows: `release/灵犀健康 Setup.exe`
- macOS: `release/灵犀健康.dmg`

## 项目结构

```
linkage-health/
├── client/                 # 前端代码
│   ├── src/
│   │   ├── components/    # React 组件
│   │   ├── pages/         # 页面组件
│   │   ├── lib/           # 工具函数
│   │   └── index.css      # 全局样式
│   └── public/            # 静态资源
├── server/                # 后端代码
│   ├── routers.ts         # tRPC 路由
│   ├── db.ts              # 数据库查询
│   └── _core/             # 核心功能
├── drizzle/               # 数据库 schema 和迁移
│   └── schema.ts          # 数据表定义
├── electron/              # Electron 主进程
│   ├── main.cjs           # 主进程入口
│   └── preload.cjs        # 预加载脚本
└── package.json           # 项目配置
```

## 数据库表结构

### users
用户表，存储用户基本信息

### conversations
对话会话表，存储对话历史

### messages
消息表，存储对话中的每条消息

### healthRecords
健康记录表，存储各类健康指标数据

### healthReports
健康报告表，存储 AI 生成的健康分析报告

### reminders
提醒表，存储健康提醒设置

## 使用说明

### 1. AI 对话咨询

在首页点击"开始咨询"或直接在对话界面输入健康问题，AI 助手将提供专业的健康建议。支持：
- 文字输入
- 语音输入（点击麦克风图标）
- 多轮对话
- Markdown 格式响应

### 2. 健康数据管理

在"健康数据"页面：
1. 选择数据类型（体重、血压、心率等）
2. 输入数值和记录时间
3. 添加备注（可选）
4. 点击"保存记录"

### 3. 数据分析

在"数据分析"页面：
1. 选择要分析的数据类型
2. 查看趋势图表
3. 查看统计数据（最新值、平均值、数值范围）

### 4. 生成健康报告

在"健康报告"页面：
1. 点击"生成新报告"
2. AI 将基于您的健康数据生成包含以下内容的报告：
   - 数据总结
   - 趋势分析
   - 风险评估
   - 改善建议

### 5. 设置提醒

在"设置"页面：
1. 填写提醒标题和描述
2. 选择提醒类型和频率
3. 设置提醒时间
4. 点击"创建提醒"

## 环境变量

应用使用以下环境变量（由 Manus 平台自动注入）：

- `DATABASE_URL`: MySQL 数据库连接字符串
- `BUILT_IN_FORGE_API_KEY`: AI API 密钥
- `BUILT_IN_FORGE_API_URL`: AI API 地址
- `JWT_SECRET`: JWT 签名密钥

## 注意事项

1. **AI 模型**：应用使用第三方 AI 模型 API，但前端始终以"灵犀健康"品牌形象呈现
2. **语音识别**：语音输入功能依赖浏览器的 Web Speech API，需要 Chrome 或 Edge 浏览器
3. **系统通知**：Electron 系统通知功能仅在桌面应用中可用
4. **数据安全**：所有健康数据存储在本地数据库中，请注意数据备份

## 许可证

MIT License

## 联系方式

灵犀健康 - 您的专业健康管理伙伴
