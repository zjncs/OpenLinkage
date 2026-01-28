import { Router } from 'express';
import { createMoment, getMoments } from './moment.controller';
import { authenticateToken } from '../../common/middleware';

const router = Router();

// 创建随记
router.post('/create', authenticateToken, createMoment);

// 获取随记列表
router.get('/list', authenticateToken, getMoments);

export default router;
