import { Response } from 'express';
import { ResponseHandler } from '../../common/response';
import { AuthRequest } from '../../common/middleware';
import { pool } from '../../config/database';

// 获取文章列表
export async function getArticles(req: AuthRequest, res: Response) {
  try {
    console.log('\n=== 获取文章列表 ===');
    const { page = 1, pageSize = 10, keyword, tag } = req.query;

    const offset = (Number(page) - 1) * Number(pageSize);
    let query = 'SELECT * FROM articles WHERE status = "published"';
    const params: any[] = [];

    // 关键词搜索
    if (keyword) {
      query += ' AND (title LIKE ? OR content LIKE ?)';
      const searchTerm = `%${keyword}%`;
      params.push(searchTerm, searchTerm);
    }

    // 标签筛选
    if (tag) {
      query += ' AND tags LIKE ?';
      params.push(`%${tag}%`);
    }

    query += ' ORDER BY publish_date DESC, created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(pageSize), offset);

    console.log('执行查询:', query);
    console.log('查询参数:', params);

    const [rows] = await pool.query(query, params);

    // 获取总数
    let countQuery = 'SELECT COUNT(*) as total FROM articles WHERE status = "published"';
    const countParams: any[] = [];

    if (keyword) {
      countQuery += ' AND (title LIKE ? OR content LIKE ?)';
      const searchTerm = `%${keyword}%`;
      countParams.push(searchTerm, searchTerm);
    }

    if (tag) {
      countQuery += ' AND tags LIKE ?';
      countParams.push(`%${tag}%`);
    }

    const [countRows] = await pool.query(countQuery, countParams);
    const total = (countRows as any[])[0].total;

    const articles = (rows as any[]).map(row => ({
      id: row.id,
      title: row.title,
      author: row.author,
      authorAvatar: row.author_avatar,
      publishDate: row.publish_date,
      readCount: row.read_count,
      likeCount: row.like_count,
      collectCount: row.collect_count,
      tags: row.tags ? row.tags.split(',') : [],
      coverImage: row.cover_image,
      summary: row.summary
    }));

    console.log('返回文章数量:', articles.length);
    console.log('=== 获取文章列表结束 ===\n');

    return ResponseHandler.success(res, {
      articles,
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total,
        totalPages: Math.ceil(total / Number(pageSize))
      }
    });

  } catch (error: any) {
    console.error('获取文章列表错误:', error);
    return ResponseHandler.serverError(res, error.message);
  }
}

// 获取文章详情
export async function getArticleDetail(req: AuthRequest, res: Response) {
  try {
    console.log('\n=== 获取文章详情 ===');
    const { id } = req.params;
    const userId = req.userId;

    console.log('文章ID:', id);
    console.log('用户ID:', userId);

    // 获取文章详情
    const [rows] = await pool.query(
      'SELECT * FROM articles WHERE id = ? AND status = "published"',
      [id]
    );

    if ((rows as any[]).length === 0) {
      return ResponseHandler.error(res, '文章不存在');
    }

    const article = (rows as any[])[0];

    // 增加阅读数
    await pool.query(
      'UPDATE articles SET read_count = read_count + 1 WHERE id = ?',
      [id]
    );

    // 检查用户是否点赞
    let isLiked = false;
    if (userId) {
      const [likeRows] = await pool.query(
        'SELECT id FROM article_likes WHERE article_id = ? AND user_id = ?',
        [id, userId]
      );
      isLiked = (likeRows as any[]).length > 0;
    }

    // 检查用户是否收藏
    let isCollected = false;
    if (userId) {
      const [collectRows] = await pool.query(
        'SELECT id FROM article_collects WHERE article_id = ? AND user_id = ?',
        [id, userId]
      );
      isCollected = (collectRows as any[]).length > 0;
    }

    // 获取相关文章（相同标签）
    const tags = article.tags ? article.tags.split(',') : [];
    let relatedArticles: any[] = [];

    if (tags.length > 0) {
      const tagConditions = tags.map(() => 'tags LIKE ?').join(' OR ');
      const tagParams = tags.map((tag: string) => `%${tag}%`);

      const [relatedRows] = await pool.query(
        `SELECT id, title, cover_image, read_count
         FROM articles
         WHERE id != ? AND status = "published" AND (${tagConditions})
         ORDER BY read_count DESC
         LIMIT 5`,
        [id, ...tagParams]
      );

      relatedArticles = (relatedRows as any[]).map(row => ({
        id: row.id,
        title: row.title,
        coverImage: row.cover_image,
        readCount: row.read_count
      }));
    }

    const articleDetail = {
      id: article.id,
      title: article.title,
      author: article.author,
      authorAvatar: article.author_avatar,
      publishDate: article.publish_date,
      readCount: article.read_count + 1, // 已增加1
      likeCount: article.like_count,
      collectCount: article.collect_count,
      tags: tags,
      coverImage: article.cover_image,
      content: article.content,
      isLiked,
      isCollected,
      relatedArticles
    };

    console.log('文章详情加载成功');
    console.log('=== 获取文章详情结束 ===\n');

    return ResponseHandler.success(res, { article: articleDetail });

  } catch (error: any) {
    console.error('获取文章详情错误:', error);
    return ResponseHandler.serverError(res, error.message);
  }
}

// 点赞文章
export async function likeArticle(req: AuthRequest, res: Response) {
  try {
    const { articleId } = req.body;
    const userId = req.userId!;

    console.log('\n=== 点赞文章 ===');
    console.log('文章ID:', articleId);
    console.log('用户ID:', userId);

    // 检查是否已点赞
    const [existingLikes] = await pool.query(
      'SELECT id FROM article_likes WHERE article_id = ? AND user_id = ?',
      [articleId, userId]
    );

    if ((existingLikes as any[]).length > 0) {
      return ResponseHandler.error(res, '已经点赞过了');
    }

    // 添加点赞记录
    await pool.query(
      'INSERT INTO article_likes (article_id, user_id, created_at) VALUES (?, ?, NOW())',
      [articleId, userId]
    );

    // 增加文章点赞数
    await pool.query(
      'UPDATE articles SET like_count = like_count + 1 WHERE id = ?',
      [articleId]
    );

    console.log('点赞成功');
    console.log('=== 点赞文章结束 ===\n');

    return ResponseHandler.success(res, { message: '点赞成功' });

  } catch (error: any) {
    console.error('点赞文章错误:', error);
    return ResponseHandler.serverError(res, error.message);
  }
}

// 取消点赞
export async function unlikeArticle(req: AuthRequest, res: Response) {
  try {
    const { articleId } = req.body;
    const userId = req.userId!;

    console.log('\n=== 取消点赞 ===');
    console.log('文章ID:', articleId);
    console.log('用户ID:', userId);

    // 删除点赞记录
    const [result] = await pool.query(
      'DELETE FROM article_likes WHERE article_id = ? AND user_id = ?',
      [articleId, userId]
    );

    if ((result as any).affectedRows === 0) {
      return ResponseHandler.error(res, '未点赞过');
    }

    // 减少文章点赞数
    await pool.query(
      'UPDATE articles SET like_count = GREATEST(like_count - 1, 0) WHERE id = ?',
      [articleId]
    );

    console.log('取消点赞成功');
    console.log('=== 取消点赞结束 ===\n');

    return ResponseHandler.success(res, { message: '取消点赞成功' });

  } catch (error: any) {
    console.error('取消点赞错误:', error);
    return ResponseHandler.serverError(res, error.message);
  }
}

// 收藏文章
export async function collectArticle(req: AuthRequest, res: Response) {
  try {
    const { articleId } = req.body;
    const userId = req.userId!;

    console.log('\n=== 收藏文章 ===');
    console.log('文章ID:', articleId);
    console.log('用户ID:', userId);

    // 检查是否已收藏
    const [existingCollects] = await pool.query(
      'SELECT id FROM article_collects WHERE article_id = ? AND user_id = ?',
      [articleId, userId]
    );

    if ((existingCollects as any[]).length > 0) {
      return ResponseHandler.error(res, '已经收藏过了');
    }

    // 添加收藏记录
    await pool.query(
      'INSERT INTO article_collects (article_id, user_id, created_at) VALUES (?, ?, NOW())',
      [articleId, userId]
    );

    // 增加文章收藏数
    await pool.query(
      'UPDATE articles SET collect_count = collect_count + 1 WHERE id = ?',
      [articleId]
    );

    console.log('收藏成功');
    console.log('=== 收藏文章结束 ===\n');

    return ResponseHandler.success(res, { message: '收藏成功' });

  } catch (error: any) {
    console.error('收藏文章错误:', error);
    return ResponseHandler.serverError(res, error.message);
  }
}

// 取消收藏
export async function uncollectArticle(req: AuthRequest, res: Response) {
  try {
    const { articleId } = req.body;
    const userId = req.userId!;

    console.log('\n=== 取消收藏 ===');
    console.log('文章ID:', articleId);
    console.log('用户ID:', userId);

    // 删除收藏记录
    const [result] = await pool.query(
      'DELETE FROM article_collects WHERE article_id = ? AND user_id = ?',
      [articleId, userId]
    );

    if ((result as any).affectedRows === 0) {
      return ResponseHandler.error(res, '未收藏过');
    }

    // 减少文章收藏数
    await pool.query(
      'UPDATE articles SET collect_count = GREATEST(collect_count - 1, 0) WHERE id = ?',
      [articleId]
    );

    console.log('取消收藏成功');
    console.log('=== 取消收藏结束 ===\n');

    return ResponseHandler.success(res, { message: '取消收藏成功' });

  } catch (error: any) {
    console.error('取消收藏错误:', error);
    return ResponseHandler.serverError(res, error.message);
  }
}
