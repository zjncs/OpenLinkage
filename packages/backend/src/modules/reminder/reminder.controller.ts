import { Response } from 'express';
import { ResponseHandler } from '../../common/response';
import { AuthRequest } from '../../common/middleware';
import { pool } from '../../config/database';

// 创建提醒
export async function createReminder(req: AuthRequest, res: Response) {
  try {
    const { medicineName, dosage, reminderTime, frequency, notes } = req.body;
    const userId = req.userId!;

    console.log('\n=== 创建药品提醒 ===');
    console.log('userId:', userId);
    console.log('药品:', medicineName, dosage);
    console.log('时间:', reminderTime);
    console.log('频率:', frequency);

    if (!medicineName || !reminderTime) {
      return ResponseHandler.error(res, '药品名称和提醒时间不能为空');
    }

    // 保存提醒到数据库
    const [result] = await pool.query(
      'INSERT INTO medicine_reminders (user_id, medicine_name, dosage, reminder_time, frequency, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [userId, medicineName, dosage || '', reminderTime, frequency || '每天', notes || '']
    );

    const reminderId = (result as any).insertId;

    console.log('✓ 提醒创建成功, ID:', reminderId);
    console.log('=== 创建提醒结束 ===\n');

    return ResponseHandler.success(res, {
      reminderId,
      message: '提醒创建成功'
    });

  } catch (error: any) {
    console.error('创建提醒错误:', error);
    return ResponseHandler.serverError(res, error.message);
  }
}

// 获取提醒列表
export async function getReminders(req: AuthRequest, res: Response) {
  try {
    console.log('\n=== 获取提醒列表 ===');
    const userId = req.userId!;
    const { isActive } = req.query;
    console.log('userId:', userId);
    console.log('isActive 参数:', isActive);

    let query = 'SELECT * FROM medicine_reminders WHERE user_id = ?';
    const params: any[] = [userId];

    if (isActive !== undefined) {
      query += ' AND is_active = ?';
      params.push(isActive === 'true' ? 1 : 0);
    }

    query += ' ORDER BY reminder_time ASC';

    console.log('执行查询:', query);
    console.log('查询参数:', params);

    const [rows] = await pool.query(query, params);

    console.log('查询结果行数:', (rows as any[]).length);

    const reminders = (rows as any[]).map(row => ({
      id: row.id,
      medicineName: row.medicine_name,
      dosage: row.dosage,
      reminderTime: row.reminder_time ? String(row.reminder_time).substring(0, 5) : '', // 格式化时间 HH:MM
      frequency: row.frequency,
      isActive: row.is_active,
      notes: row.notes,
      createdAt: row.created_at
    }));

    console.log('返回提醒数量:', reminders.length);
    console.log('=== 获取提醒列表结束 ===\n');

    return ResponseHandler.success(res, { reminders });

  } catch (error: any) {
    console.error('获取提醒列表错误:', error);
    return ResponseHandler.serverError(res, error.message);
  }
}

// 更新提醒
export async function updateReminder(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.userId!;
    const { medicineName, dosage, reminderTime, frequency, isActive, notes } = req.body;

    // 检查提醒是否属于当前用户
    const [rows] = await pool.query(
      'SELECT id FROM medicine_reminders WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if ((rows as any[]).length === 0) {
      return ResponseHandler.error(res, '提醒不存在或无权限');
    }

    // 更新提醒
    await pool.query(
      'UPDATE medicine_reminders SET medicine_name = ?, dosage = ?, reminder_time = ?, frequency = ?, is_active = ?, notes = ?, updated_at = NOW() WHERE id = ?',
      [medicineName, dosage, reminderTime, frequency, isActive, notes, id]
    );

    return ResponseHandler.success(res, { message: '更新成功' });

  } catch (error: any) {
    console.error('更新提醒错误:', error);
    return ResponseHandler.serverError(res, error.message);
  }
}

// 删除提醒
export async function deleteReminder(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    // 检查提醒是否属于当前用户
    const [rows] = await pool.query(
      'SELECT id FROM medicine_reminders WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if ((rows as any[]).length === 0) {
      return ResponseHandler.error(res, '提醒不存在或无权限');
    }

    // 删除提醒
    await pool.query('DELETE FROM medicine_reminders WHERE id = ?', [id]);

    return ResponseHandler.success(res, { message: '删除成功' });

  } catch (error: any) {
    console.error('删除提醒错误:', error);
    return ResponseHandler.serverError(res, error.message);
  }
}
