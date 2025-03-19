-- 創建數據庫 Create database
CREATE DATABASE IF NOT EXISTS Talent_teacher_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用數據庫 Use database
USE Talent_teacher_db;

-- 創建用戶表 Create user table
CREATE TABLE IF NOT EXISTS USER (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '用戶ID User ID',
  username VARCHAR(50) NOT NULL COMMENT '用戶名 Username',
  password VARCHAR(100) NOT NULL COMMENT '密碼 Password',
  name VARCHAR(100) NOT NULL COMMENT '姓名 Name',
  email VARCHAR(100) COMMENT '電子郵件 Email',
  role ENUM('admin', 'user') DEFAULT 'user' COMMENT '角色 Role',
  company_code VARCHAR(50) NOT NULL COMMENT '公司代碼 Company Code',
  avatar VARCHAR(255) COMMENT '頭像URL Avatar URL',
  is_active BOOLEAN DEFAULT TRUE COMMENT '是否啟用 Is Active',
  last_login DATETIME COMMENT '最後登入時間 Last Login Time',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間 Created Time',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間 Updated Time',
  INDEX idx_company_code (company_code),
  UNIQUE KEY username_company_unique (username, company_code),
  UNIQUE KEY email_company_unique (email, company_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入系統管理員用戶 Insert system admin user
INSERT INTO USER (username, password, name, email, role, company_code)
VALUES ('admin', '$2b$10$3IXeQteRWBKgAFQ/UM1/1OQ83o1.j1JsV7wMtPUW.7MBtPYnEJJ0G', '系統管理員', 'admin@example.com', 'admin', 'system')
ON DUPLICATE KEY UPDATE username = username; 