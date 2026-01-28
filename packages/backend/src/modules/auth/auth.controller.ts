import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { config } from '../../config';
import { ResponseHandler } from '../../common/response';
import { pool, redisClient } from '../../config/database';

// 微信登录
export async function wechatLogin(req: Request, res: Response) {
  try {
    const { code } = req.body;

    if (!code) {
      return ResponseHandler.error(res, '缺少微信登录code');
    }

    // 调用微信API获取openid和session_key
    const wechatResponse = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
      params: {
        appid: config.wechat.appId,
        secret: config.wechat.secret,
        js_code: code,
        grant_type: 'authorization_code'
      }
    });

    const { openid, session_key, errcode, errmsg } = wechatResponse.data;

    if (errcode) {
      return ResponseHandler.error(res, `微信登录失败: ${errmsg}`);
    }

    // 查询或创建用户
    const [rows]: any = await pool.query(
      'SELECT * FROM users WHERE openid = ?',
      [openid]
    );

    let userId: string;

    if (rows.length > 0) {
      // 用户已存在
      userId = rows[0].id;
    } else {
      // 创建新用户
      const [result]: any = await pool.query(
        'INSERT INTO users (openid, role, created_at) VALUES (?, ?, NOW())',
        [openid, 'user']
      );
      userId = result.insertId.toString();
    }

    // 生成JWT token
    const token = jwt.sign(
      { userId, role: 'user' },
      config.jwt.secret,
      { expiresIn: '7d' }
    );

    return ResponseHandler.success(res, {
      token,
      userId,
      openid
    }, '登录成功');

  } catch (error: any) {
    console.error('微信登录错误:', error);
    return ResponseHandler.serverError(res, error.message);
  }
}

// 发送验证码
export async function sendVerificationCode(req: Request, res: Response) {
  try {
    const { phone } = req.body;

    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return ResponseHandler.error(res, '手机号格式不正确');
    }

    // 生成6位验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 存储到Redis，5分钟过期
    await redisClient.setEx(`sms:${phone}`, 300, code);

    // TODO: 调用短信服务发送验证码
    // 开发环境下直接返回验证码（生产环境删除）
    if (config.nodeEnv === 'development') {
      console.log(`📱 验证码: ${code} (手机号: ${phone})`);
      return ResponseHandler.success(res, { code }, '验证码已发送（开发模式）');
    }

    return ResponseHandler.success(res, null, '验证码已发送');

  } catch (error: any) {
    console.error('发送验证码错误:', error);
    return ResponseHandler.serverError(res, error.message);
  }
}

// 手机号登录
export async function phoneLogin(req: Request, res: Response) {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return ResponseHandler.error(res, '手机号和验证码不能为空');
    }

    // 验证验证码
    const storedCode = await redisClient.get(`sms:${phone}`);

    if (!storedCode || storedCode !== code) {
      return ResponseHandler.error(res, '验证码错误或已过期');
    }

    // 删除已使用的验证码
    await redisClient.del(`sms:${phone}`);

    // 查询或创建用户
    const [rows]: any = await pool.query(
      'SELECT * FROM users WHERE phone = ?',
      [phone]
    );

    let userId: string;

    if (rows.length > 0) {
      userId = rows[0].id;
    } else {
      // 创建新用户
      const [result]: any = await pool.query(
        'INSERT INTO users (phone, role, created_at) VALUES (?, ?, NOW())',
        [phone, 'user']
      );
      userId = result.insertId.toString();
    }

    // 生成JWT token
    const token = jwt.sign(
      { userId, role: 'user' },
      config.jwt.secret,
      { expiresIn: '7d' }
    );

    return ResponseHandler.success(res, {
      token,
      userId
    }, '登录成功');

  } catch (error: any) {
    console.error('手机登录错误:', error);
    return ResponseHandler.serverError(res, error.message);
  }
}
