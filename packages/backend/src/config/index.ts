import dotenv from 'dotenv';
import { Secret } from 'jsonwebtoken';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',

  jwt: {
    secret: (process.env.JWT_SECRET || 'default_secret_change_in_production') as Secret,
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as string | number
  },

  wechat: {
    appId: process.env.WECHAT_APPID || '',
    secret: process.env.WECHAT_SECRET || ''
  },

  sms: {
    accessKey: process.env.SMS_ACCESS_KEY || '',
    secretKey: process.env.SMS_SECRET_KEY || ''
  },

  ai: {
    siliconflow: {
      apiKey: process.env.SILICONFLOW_API_KEY || '',
      apiUrl: process.env.SILICONFLOW_API_URL || 'https://api.siliconflow.cn/v1/chat/completions'
    },
    mem0: {
      apiKey: process.env.MEM0_API_KEY || '',
      apiUrl: process.env.MEM0_API_URL || 'https://api.mem0.ai/v1',
      userId: process.env.MEM0_USER_ID || 'experiment_050'
    }
  }
};
