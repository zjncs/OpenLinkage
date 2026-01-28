-- 灵犀健康数据库初始化脚本

-- 创建数据库
CREATE DATABASE IF NOT EXISTS linkage_health CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE linkage_health;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  openid VARCHAR(100) UNIQUE COMMENT '微信openid',
  phone VARCHAR(20) UNIQUE COMMENT '手机号',
  nickname VARCHAR(100) COMMENT '昵称',
  avatar VARCHAR(500) COMMENT '头像URL',
  role ENUM('user', 'doctor', 'admin') DEFAULT 'user' COMMENT '角色',
  status ENUM('active', 'inactive', 'banned') DEFAULT 'active' COMMENT '状态',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_openid (openid),
  INDEX idx_phone (phone),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 聊天消息表
CREATE TABLE IF NOT EXISTS chat_messages (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT '用户ID',
  session_id VARCHAR(100) NOT NULL COMMENT '会话ID',
  role ENUM('user', 'assistant') NOT NULL COMMENT '角色',
  content TEXT NOT NULL COMMENT '消息内容',
  expert_type VARCHAR(50) COMMENT '专家类型（群聊时使用）',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_session (user_id, session_id),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='聊天消息表';

-- 健康记录表
CREATE TABLE IF NOT EXISTS health_records (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT '用户ID',
  record_type VARCHAR(50) NOT NULL COMMENT '记录类型（血压、心率、睡眠等）',
  record_data JSON COMMENT '记录数据',
  record_date DATE NOT NULL COMMENT '记录日期',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_date (user_id, record_date),
  INDEX idx_type (record_type),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='健康记录表';

-- 医生表
CREATE TABLE IF NOT EXISTS doctors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE NOT NULL COMMENT '关联用户ID',
  name VARCHAR(100) NOT NULL COMMENT '姓名',
  title VARCHAR(100) COMMENT '职称',
  department VARCHAR(100) COMMENT '科室',
  hospital VARCHAR(200) COMMENT '医院',
  license_number VARCHAR(100) COMMENT '执业证号',
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' COMMENT '审核状态',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='医生表';

-- 预约表
CREATE TABLE IF NOT EXISTS appointments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT '用户ID',
  doctor_id INT NOT NULL COMMENT '医生ID',
  appointment_date DATETIME NOT NULL COMMENT '预约时间',
  status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending' COMMENT '状态',
  notes TEXT COMMENT '备注',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_doctor (doctor_id),
  INDEX idx_date (appointment_date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='预约表';

-- 随记表
CREATE TABLE IF NOT EXISTS moments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT '用户ID',
  content TEXT NOT NULL COMMENT '随记内容',
  images JSON COMMENT '图片列表',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_created (user_id, created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='随记表';

-- 药品提醒表
CREATE TABLE IF NOT EXISTS medicine_reminders (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT '用户ID',
  medicine_name VARCHAR(100) NOT NULL COMMENT '药品名称',
  dosage VARCHAR(50) COMMENT '剂量（如100mg）',
  reminder_time TIME NOT NULL COMMENT '提醒时间',
  frequency VARCHAR(20) NOT NULL DEFAULT '每天' COMMENT '频率（每天/每周/自定义）',
  is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
  notes TEXT COMMENT '备注',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_active (user_id, is_active),
  INDEX idx_reminder_time (reminder_time),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='药品提醒表';

-- 文章表
CREATE TABLE IF NOT EXISTS articles (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL COMMENT '文章标题',
  author VARCHAR(100) NOT NULL COMMENT '作者',
  author_avatar VARCHAR(500) COMMENT '作者头像',
  cover_image VARCHAR(500) COMMENT '封面图片',
  summary TEXT COMMENT '文章摘要',
  content LONGTEXT NOT NULL COMMENT '文章内容（HTML格式）',
  tags VARCHAR(200) COMMENT '标签（逗号分隔）',
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft' COMMENT '状态',
  publish_date DATE COMMENT '发布日期',
  read_count INT DEFAULT 0 COMMENT '阅读数',
  like_count INT DEFAULT 0 COMMENT '点赞数',
  collect_count INT DEFAULT 0 COMMENT '收藏数',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status_date (status, publish_date),
  INDEX idx_tags (tags),
  FULLTEXT INDEX idx_title_content (title, content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文章表';

-- 文章点赞表
CREATE TABLE IF NOT EXISTS article_likes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  article_id BIGINT NOT NULL COMMENT '文章ID',
  user_id INT NOT NULL COMMENT '用户ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_article_user (article_id, user_id),
  INDEX idx_article (article_id),
  INDEX idx_user (user_id),
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文章点赞表';

-- 文章收藏表
CREATE TABLE IF NOT EXISTS article_collects (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  article_id BIGINT NOT NULL COMMENT '文章ID',
  user_id INT NOT NULL COMMENT '用户ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_article_user (article_id, user_id),
  INDEX idx_article (article_id),
  INDEX idx_user (user_id),
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文章收藏表';

-- 插入测试数据
INSERT INTO users (openid, phone, nickname, role) VALUES
('test_openid_001', '13800138000', '测试用户', 'user'),
('test_openid_002', '13800138001', '张医生', 'doctor'),
('test_openid_003', '13800138002', '管理员', 'admin');

-- 插入测试医生
INSERT INTO doctors (user_id, name, title, department, hospital, status) VALUES
(2, '张医生', '主任医师', '内科', '市人民医院', 'approved');

-- 插入测试文章
INSERT INTO articles (title, author, author_avatar, cover_image, summary, content, tags, status, publish_date, read_count, like_count, collect_count) VALUES
('板蓝根、抗病毒口服液，对流感病毒有效吗？', '张医生', '/assets/images/default-avatar.png', '/assets/images/magazine2.png',
'流感是由流感病毒引起的急性呼吸道传染病，本文将探讨板蓝根和抗病毒口服液对流感的实际效果。',
'<h2>什么是流感？</h2><p>流感是由流感病毒引起的急性呼吸道传染病，主要通过空气飞沫传播。流感病毒分为甲、乙、丙三型，其中甲型流感病毒最容易发生变异，是引起流感大流行的主要病原体。</p><h2>板蓝根的作用</h2><p>板蓝根是一种常见的中药材，具有清热解毒、凉血利咽的功效。在中医理论中，板蓝根主要用于治疗温病发热、咽喉肿痛等症状。</p><h3>板蓝根对流感的效果</h3><p>虽然板蓝根在民间被广泛用于预防和治疗感冒，但目前的科学研究表明，板蓝根对流感病毒的直接抑制作用有限。</p>',
'健康,医学,流感', 'published', '2024-05-20', 1234, 89, 56),

('如何正确预防流感？', '李医生', '/assets/images/default-avatar.png', '/assets/images/magazine3.png',
'流感预防是保护健康的重要措施，本文介绍科学有效的流感预防方法。',
'<h2>流感预防的重要性</h2><p>流感是一种传染性强、传播速度快的疾病，每年都会造成大量人群感染。做好预防工作至关重要。</p><h2>预防措施</h2><ul><li>接种流感疫苗</li><li>保持良好的个人卫生习惯</li><li>增强体质，提高免疫力</li><li>避免去人群密集场所</li></ul>',
'健康,预防,流感', 'published', '2024-05-18', 856, 67, 43),

('流感疫苗接种指南', '王医生', '/assets/images/default-avatar.png', '/assets/images/magazine4.png',
'流感疫苗是预防流感最有效的方法，本文详细介绍流感疫苗接种的相关知识。',
'<h2>为什么要接种流感疫苗？</h2><p>流感疫苗是预防流感最有效、最经济的方法。接种流感疫苗可以显著降低感染流感的风险，即使感染也能减轻症状。</p><h2>谁应该接种？</h2><p>建议以下人群优先接种：老年人、儿童、孕妇、慢性病患者、医务人员等。</p>',
'健康,疫苗,流感', 'published', '2024-05-15', 723, 54, 38),

('儿童与青少年临床心理学', '赵医生', '/assets/images/default-avatar.png', '/assets/images/magazine1.png',
'儿童和青少年的心理健康同样重要，本文探讨儿童青少年常见的心理问题及应对方法。',
'<h2>儿童青少年心理健康的重要性</h2><p>儿童和青少年时期是人格形成和心理发展的关键时期，这一阶段的心理健康状况会影响其一生的发展。</p><h2>常见心理问题</h2><ul><li>焦虑症</li><li>抑郁症</li><li>注意力缺陷多动障碍</li><li>学习障碍</li></ul>',
'心理,儿童,青少年', 'published', '2024-05-10', 1567, 123, 89);

SELECT '✅ 数据库初始化完成！' AS message;
