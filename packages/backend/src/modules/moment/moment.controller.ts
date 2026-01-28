import { Response } from 'express';
import { ResponseHandler } from '../../common/response';
import { AuthRequest } from '../../common/middleware';
import { pool } from '../../config/database';
import axios from 'axios';
import { config } from '../../config';

// AI服务 - 用于添加记忆到Mem0
class MomentMemoryService {
  async addMemory(userId: string, content: string) {
    try {
      const userIdStr = String(userId);
      if (!userIdStr || userIdStr === 'undefined') {
        console.error('Mem0添加记忆错误: userId 无效', userId);
        return;
      }

      console.log('📝 随记添加到Mem0 - userId:', userIdStr, 'content:', content.substring(0, 50));

      await axios.post(
        `${config.ai.mem0.apiUrl}/memories/`,
        {
          user_id: userIdStr,
          messages: [{ role: 'user', content: content }]
        },
        {
          params: {
            user_id: userIdStr
          },
          headers: {
            'Authorization': `Token ${config.ai.mem0.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✓ 随记记忆添加成功');
    } catch (error: any) {
      console.error('Mem0添加随记记忆错误:', error.response?.data || error.message);
    }
  }
}

const momentMemoryService = new MomentMemoryService();

// 创建随记
export async function createMoment(req: AuthRequest, res: Response) {
  try {
    const { content, images } = req.body;
    const userId = req.userId!;

    console.log('\n=== 创建随记 ===');
    console.log('userId:', userId);
    console.log('content:', content);
    console.log('images:', images?.length || 0, '张');

    if (!content || content.trim().length === 0) {
      return ResponseHandler.error(res, '随记内容不能为空');
    }

    // 保存随记到数据库
    const [result] = await pool.query(
      'INSERT INTO moments (user_id, content, images, created_at) VALUES (?, ?, ?, NOW())',
      [userId, content, images ? JSON.stringify(images) : null]
    );

    const momentId = (result as any).insertId;

    // 异步添加到Mem0（不阻塞响应）
    // 格式化内容，添加日期信息
    const today = new Date().toISOString().split('T')[0];
    const memoryContent = `${today}: ${content}`;

    momentMemoryService.addMemory(userId, memoryContent).catch(err =>
      console.error('添加随记记忆失败:', err)
    );

    console.log('✓ 随记创建成功, ID:', momentId);
    console.log('=== 创建随记结束 ===\n');

    return ResponseHandler.success(res, {
      momentId,
      message: '发布成功'
    });

  } catch (error: any) {
    console.error('创建随记错误:', error);
    return ResponseHandler.serverError(res, error.message);
  }
}

// 获取随记列表
export async function getMoments(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;
    const { page = 1, limit = 10 } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    const [rows] = await pool.query(
      'SELECT id, content, images, created_at FROM moments WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [userId, Number(limit), offset]
    );

    const moments = (rows as any[]).map(row => ({
      id: row.id,
      content: row.content,
      images: row.images ? JSON.parse(row.images) : [],
      createdAt: row.created_at
    }));

    return ResponseHandler.success(res, {
      moments,
      page: Number(page),
      limit: Number(limit)
    });

  } catch (error: any) {
    console.error('获取随记列表错误:', error);
    return ResponseHandler.serverError(res, error.message);
  }
}
