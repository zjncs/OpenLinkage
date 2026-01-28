import { Router } from 'express';
import {
  getArticles,
  getArticleDetail,
  likeArticle,
  unlikeArticle,
  collectArticle,
  uncollectArticle
} from './article.controller';
import { authenticateToken } from '../../common/middleware';

const router = Router();

// 获取文章列表（不需要登录）
router.get('/list', getArticles);

// 获取文章详情（不需要登录，但登录后可以看到点赞收藏状态）
router.get('/detail/:id', authenticateToken, getArticleDetail);

// 点赞相关（需要登录）
router.post('/like', authenticateToken, likeArticle);
router.post('/unlike', authenticateToken, unlikeArticle);

// 收藏相关（需要登录）
router.post('/collect', authenticateToken, collectArticle);
router.post('/uncollect', authenticateToken, uncollectArticle);

export default router;
