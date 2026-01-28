import { Router } from 'express';
import { createReminder, getReminders, updateReminder, deleteReminder } from './reminder.controller';
import { authenticateToken } from '../../common/middleware';

const router = Router();

// 创建提醒
router.post('/create', authenticateToken, createReminder);

// 获取提醒列表
router.get('/list', authenticateToken, getReminders);

// 更新提醒
router.put('/update/:id', authenticateToken, updateReminder);

// 删除提醒
router.delete('/delete/:id', authenticateToken, deleteReminder);

export default router;
