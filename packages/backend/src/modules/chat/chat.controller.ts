import { Response } from 'express';
import axios from 'axios';
import { config } from '../../config';
import { ResponseHandler } from '../../common/response';
import { AuthRequest } from '../../common/middleware';
import { pool } from '../../config/database';

// 延迟函数
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// AI服务类
class AIService {
  // 调用SiliconFlow LLM（带重试机制）
  async callLLM(messages: any[], model: string = 'Qwen/Qwen2.5-7B-Instruct', maxRetries: number = 10) {
    let lastError: any;
    const maxRetryTime = 60000; // 最大重试时间：60秒
    const startTime = Date.now();

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // 检查是否超过最大重试时间
        if (Date.now() - startTime > maxRetryTime) {
          console.error('已超过最大重试时间(60秒)，停止重试');
          break;
        }

        const response = await axios.post(
          config.ai.siliconflow.apiUrl,
          {
            model,
            messages,
            max_tokens: 2000,
            temperature: 0.7
          },
          {
            headers: {
              'Authorization': `Bearer ${config.ai.siliconflow.apiKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 30000 // 30秒超时
          }
        );

        const content = response.data.choices[0].message.content;

        // 检查回复是否为空
        if (!content || content.trim().length === 0) {
          throw new Error('LLM返回了空回复');
        }

        // 成功返回
        if (attempt > 1) {
          console.log(`✓ 重试成功（第${attempt}次尝试）`);
        }
        return content;
      } catch (error: any) {
        lastError = error;
        const errorMsg = error.response?.data?.error?.message || error.message;
        console.error(`✗ LLM调用失败 (尝试 ${attempt}/${maxRetries}): ${errorMsg}`);

        // 如果不是最后一次尝试且未超时，等待后重试
        if (attempt < maxRetries && Date.now() - startTime < maxRetryTime) {
          const delayMs = Math.min(Math.pow(2, attempt - 1) * 1000, 8000); // 最大延迟8秒
          console.log(`⏳ 等待 ${delayMs}ms 后重试...`);
          await sleep(delayMs);
        }
      }
    }

    // 所有重试都失败
    console.error('❌ LLM调用失败，已达到最大重试次数或超时');
    throw new Error('AI服务暂时不可用');
  }

  // 调用Mem0 API获取用户记忆
  async getUserMemories(userId: string) {
    try {
      console.log('Mem0查询参数 - user_id:', userId, 'API URL:', config.ai.mem0.apiUrl);

      const response = await axios.get(
        `${config.ai.mem0.apiUrl}/memories`,
        {
          params: {
            user_id: userId,
            limit: 50
          },
          headers: {
            'Authorization': `Token ${config.ai.mem0.apiKey}`
          }
        }
      );

      console.log('Mem0返回数据:', JSON.stringify(response.data).substring(0, 200));

      // Mem0 API直接返回数组，不是 {memories: [...]} 格式
      const memories = Array.isArray(response.data) ? response.data : (response.data.memories || []);
      console.log(`✓ 成功获取${memories.length}条记忆`);

      return memories;
    } catch (error: any) {
      console.error('Mem0获取记忆错误:', error.response?.data || error.message);
      return [];
    }
  }

  // 添加记忆到Mem0
  async addMemory(userId: string, message: string) {
    try {
      // 确保 userId 是字符串且不为空
      const userIdStr = String(userId);
      if (!userIdStr || userIdStr === 'undefined') {
        console.error('Mem0添加记忆错误: userId 无效', userId);
        return;
      }

      console.log('Mem0添加记忆 - userId:', userIdStr, 'message:', message.substring(0, 50));

      // 同时在请求体和查询参数中传递 user_id
      await axios.post(
        `${config.ai.mem0.apiUrl}/memories/`,
        {
          user_id: userIdStr,
          messages: [{ role: 'user', content: message }]
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

      console.log('Mem0添加记忆成功');
    } catch (error: any) {
      console.error('Mem0添加记忆错误:', error.response?.data || error.message);
    }
  }
}

const aiService = new AIService();

// 健康管家对话
export async function healthManagerChat(req: AuthRequest, res: Response) {
  try {
    const { message, sessionId } = req.body;
    const userId = req.userId!;

    console.log('\n=== 健康管家对话开始 ===');
    console.log('userId:', userId, 'type:', typeof userId);
    console.log('sessionId:', sessionId || '(新会话)');
    console.log('用户消息:', message);

    if (!message) {
      return ResponseHandler.error(res, '消息不能为空');
    }

    // 获取用户历史记忆
    console.log('🔍 搜索用户记忆...');
    const memories = await aiService.getUserMemories(userId);
    console.log(`📚 找到${memories.length}条记忆`);
    if (memories.length > 0) {
      memories.slice(0, 3).forEach((m: any, index: number) => {
        console.log(`  [记忆${index + 1}] ${m.memory.substring(0, 50)}...`);
      });
      if (memories.length > 3) {
        console.log(`  ... 还有${memories.length - 3}条记忆`);
      }
    }

    // 获取当前会话的历史消息（最近10条）
    let historyMessages: any[] = [];
    if (sessionId) {
      const [rows] = await pool.query(
        'SELECT role, content FROM chat_messages WHERE user_id = ? AND session_id = ? ORDER BY created_at DESC LIMIT 10',
        [userId, sessionId]
      );
      historyMessages = (rows as any[]).reverse(); // 反转顺序，从旧到新
      console.log(`获取到${historyMessages.length}条历史消息`);
      historyMessages.forEach((msg: any, index: number) => {
        console.log(`  [${index + 1}] ${msg.role}: ${msg.content.substring(0, 30)}...`);
      });
    } else {
      console.log('无历史消息（新会话）');
    }

    // 构建系统提示词
    const systemPrompt = `你是灵犀健康的AI健康管家，专注于为用户提供个性化的健康建议和关怀。

用户画像信息：
${memories.length > 0 ? memories.map((m: any) => `- ${m.memory}`).join('\n') : '暂无历史信息'}

你的职责：
1. 提供温暖、专业的健康建议
2. 关注用户的身体和心理健康
3. 根据用户历史信息提供个性化建议
4. 必要时建议用户咨询专业医生

回复要求：
- 语气温和、关怀
- 建议具体、可操作
- 适当使用emoji增加亲和力
- 回复简洁明了（200字以内）`;

    // 构建完整的对话上下文
    const messages = [
      { role: 'system', content: systemPrompt },
      ...historyMessages.map((msg: any) => ({ role: msg.role, content: msg.content })),
      { role: 'user', content: message }
    ];

    console.log(`构建上下文: system(1) + history(${historyMessages.length}) + user(1) = ${messages.length}条消息`);

    // 调用LLM
    const aiResponse = await aiService.callLLM(messages);
    console.log('AI回复长度:', aiResponse?.length || 0);

    // 保存对话到数据库
    const newSessionId = sessionId || `session_${Date.now()}`;
    console.log('保存消息到sessionId:', newSessionId);

    await pool.query(
      'INSERT INTO chat_messages (user_id, session_id, role, content, created_at) VALUES (?, ?, ?, ?, NOW())',
      [userId, newSessionId, 'user', message]
    );
    await pool.query(
      'INSERT INTO chat_messages (user_id, session_id, role, content, created_at) VALUES (?, ?, ?, ?, NOW())',
      [userId, newSessionId, 'assistant', aiResponse]
    );

    console.log('=== 健康管家对话结束 ===\n');

    // 异步添加到Mem0（不阻塞响应）
    aiService.addMemory(userId, message).catch(err =>
      console.error('添加记忆失败:', err)
    );

    return ResponseHandler.success(res, {
      message: aiResponse,
      sessionId: newSessionId
    });

  } catch (error: any) {
    console.error('健康管家对话错误:', error);
    return ResponseHandler.serverError(res, error.message);
  }
}

// 专家群聊
export async function expertGroupChat(req: AuthRequest, res: Response) {
  try {
    const { message, sessionId } = req.body;
    const userId = req.userId!;
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log('\n=== 专家群聊开始 ===');
    console.log('请求ID:', requestId);
    console.log('userId:', userId, 'type:', typeof userId);
    console.log('sessionId:', sessionId || '(新会话)');
    console.log('用户消息:', message);

    if (!message) {
      return ResponseHandler.error(res, '消息不能为空');
    }

    // 专家配置
    const experts = [
      { type: 'emotion', name: '情绪专家', prompt: '你是情绪管理专家，专注于情绪疏导和心理健康。' },
      { type: 'psychology', name: '心理专家', prompt: '你是心理健康专家，提供心理评估和建议。' },
      { type: 'sleep', name: '睡眠专家', prompt: '你是睡眠质量专家，提供睡眠改善建议。' },
      { type: 'nutrition', name: '营养专家', prompt: '你是营养学专家，提供饮食和营养建议。' },
      { type: 'safety', name: '安全专家', prompt: '你是健康安全专家，评估建议的安全性和合规性。' }
    ];

    // 获取用户记忆
    console.log('🔍 搜索用户记忆...');
    const memories = await aiService.getUserMemories(userId);
    console.log(`📚 找到${memories.length}条记忆`);
    if (memories.length > 0) {
      memories.slice(0, 3).forEach((m: any, index: number) => {
        console.log(`  [记忆${index + 1}] ${m.memory.substring(0, 50)}...`);
      });
      if (memories.length > 3) {
        console.log(`  ... 还有${memories.length - 3}条记忆`);
      }
    }

    const memoryContext = memories.length > 0
      ? `用户历史信息：\n${memories.slice(0, 5).map((m: any) => `- ${m.memory}`).join('\n')}`
      : '暂无历史信息';

    // 获取当前会话的历史消息（最近10条）
    let historyMessages: any[] = [];
    if (sessionId) {
      const [rows] = await pool.query(
        'SELECT role, content, expert_type FROM chat_messages WHERE user_id = ? AND session_id = ? ORDER BY created_at DESC LIMIT 10',
        [userId, sessionId]
      );
      historyMessages = (rows as any[]).reverse(); // 反转顺序，从旧到新
    }

    // 保存用户消息
    const newSessionId = sessionId || `session_${Date.now()}`;
    await pool.query(
      'INSERT INTO chat_messages (user_id, session_id, role, content, created_at) VALUES (?, ?, ?, ?, NOW())',
      [userId, newSessionId, 'user', message]
    );

    // 并行调用所有专家，不等待彼此
    const expertPromises = experts.map(async (expert) => {
      try {
        console.log(`\n=== 调用${expert.name} ===`);

        // 构建当前专家的系统提示词
        const systemPrompt = `${expert.prompt}

${memoryContext}

你正在参与一个多专家会诊讨论。请从你的专业角度给出简短建议（100字以内）。`;

        // 获取历史消息作为上下文
        const conversationContext: any[] = [
          ...historyMessages.map((msg: any) => ({
            role: msg.role,
            content: msg.expert_type ? `[${msg.expert_type}] ${msg.content}` : msg.content
          })),
          { role: 'user', content: message }
        ];

        // 调用LLM
        const response = await aiService.callLLM([
          { role: 'system', content: systemPrompt },
          ...conversationContext
        ]);

        console.log(`${expert.name}回复长度: ${response?.length || 0}`);
        console.log(`${expert.name}回复内容: ${response?.substring(0, 50) || '(空)'}`);

        // 保存专家回复到数据库
        await pool.query(
          'INSERT INTO chat_messages (user_id, session_id, role, content, expert_type, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
          [userId, newSessionId, 'assistant', response, expert.type]
        );

        console.log(`${expert.name}处理完成\n`);

        return {
          expertType: expert.type,
          message: response,
          success: true
        };
      } catch (error: any) {
        console.error(`${expert.name}调用失败:`, error.message);
        return {
          expertType: expert.type,
          message: `抱歉，${expert.name}暂时无法回复。`,
          success: false
        };
      }
    });

    // 等待所有专家完成（无论成功或失败）
    const replies = await Promise.all(expertPromises);

    return ResponseHandler.success(res, {
      replies,
      sessionId: newSessionId
    });

  } catch (error: any) {
    console.error('专家群聊错误:', error);
    return ResponseHandler.serverError(res, error.message);
  }
}
