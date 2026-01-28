import { Router } from 'express';
import { healthManagerChat, expertGroupChat } from './chat.controller';
import { authenticateToken } from '../../common/middleware';

const router = Router();

// 所有聊天接口需要认证
router.use(authenticateToken);

// 健康管家对话
router.post('/health-manager', healthManagerChat);

// 专家群聊
router.post('/expert-group', expertGroupChat);

export default router;
