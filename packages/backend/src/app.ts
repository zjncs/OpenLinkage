import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { config } from './config';
import { connectRedis, testDatabaseConnection } from './config/database';
import { errorHandler } from './common/middleware';

// 导入路由
import authRoutes from './modules/auth/auth.routes';
import chatRoutes from './modules/chat/chat.routes';
import momentRoutes from './modules/moment/moment.routes';
import reminderRoutes from './modules/reminder/reminder.routes';
import articleRoutes from './modules/article/article.routes';

dotenv.config();

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '灵犀健康后端服务运行中' });
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/moment', momentRoutes);
app.use('/api/reminder', reminderRoutes);
app.use('/api/article', articleRoutes);

// 用户端API（预留）
app.get('/api/user/profile', (req, res) => {
  res.json({ message: '用户模块开发中' });
});

// 医生端API（预留）
app.get('/api/doctor/patients', (req, res) => {
  res.json({ message: '医生模块开发中' });
});

// 管理员端API（预留）
app.get('/api/admin/users', (req, res) => {
  res.json({ message: '管理员模块开发中' });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ success: false, error: '接口不存在' });
});

// 错误处理
app.use(errorHandler);

// 启动服务器
async function startServer() {
  try {
    // 连接数据库
    await testDatabaseConnection();
    await connectRedis();

    // 启动服务器
    app.listen(config.port, () => {
      console.log('');
      console.log('🚀 ========================================');
      console.log(`🏥 灵犀健康后端服务已启动`);
      console.log(`📡 服务地址: http://localhost:${config.port}`);
      console.log(`🌍 环境: ${config.nodeEnv}`);
      console.log('🚀 ========================================');
      console.log('');
      console.log('📋 可用接口:');
      console.log(`   GET  /health - 健康检查`);
      console.log(`   POST /api/auth/wechat/login - 微信登录`);
      console.log(`   POST /api/auth/phone/send-code - 发送验证码`);
      console.log(`   POST /api/auth/phone/login - 手机登录`);
      console.log(`   POST /api/chat/health-manager - 健康管家对话`);
      console.log(`   POST /api/chat/expert-group - 专家群聊`);
      console.log(`   POST /api/moment/create - 创建随记`);
      console.log(`   GET  /api/moment/list - 获取随记列表`);
      console.log(`   POST /api/reminder/create - 创建药品提醒`);
      console.log(`   GET  /api/reminder/list - 获取提醒列表`);
      console.log(`   PUT  /api/reminder/update/:id - 更新提醒`);
      console.log(`   DELETE /api/reminder/delete/:id - 删除提醒`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
}

startServer();

export default app;
