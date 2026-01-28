import { Router } from 'express';
import { wechatLogin, phoneLogin, sendVerificationCode } from './auth.controller';

const router = Router();

// 微信登录
router.post('/wechat/login', wechatLogin);

// 发送手机验证码
router.post('/phone/send-code', sendVerificationCode);

// 手机号登录
router.post('/phone/login', phoneLogin);

export default router;
