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

-- 創建課程排課表 Create course schedule table
CREATE TABLE IF NOT EXISTS course_schedules (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '排課ID Schedule ID',
  series_id VARCHAR(36) DEFAULT NULL COMMENT '重複課程系列ID Series ID for recurring courses',
  is_recurring BOOLEAN DEFAULT FALSE COMMENT '是否為重複課程 Is Recurring Course',
  school_name VARCHAR(255) NOT NULL COMMENT '補習班名稱 School Name',
  class_name VARCHAR(255) NOT NULL COMMENT '班級名稱 Class Name',
  course_type VARCHAR(255) NOT NULL COMMENT '課程種類 Course Type',
  teacher_id INT NOT NULL COMMENT '授課老師ID Teacher ID',
  date DATE NOT NULL COMMENT '上課日期 Course Date',
  start_time TIME NOT NULL COMMENT '開始時間 Start Time',
  end_time TIME NOT NULL COMMENT '結束時間 End Time',
  course_fee DECIMAL(10, 2) NOT NULL COMMENT '課程鐘點費 Course Fee',
  teacher_fee DECIMAL(10, 2) NOT NULL COMMENT '老師實拿鐘點 Teacher Fee',
  company_code VARCHAR(255) NOT NULL COMMENT '公司代碼 Company Code',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間 Created Time',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間 Updated Time',
  INDEX idx_teacher_id (teacher_id),
  INDEX idx_date (date),
  INDEX idx_company_code (company_code),
  INDEX idx_series_id (series_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 創建課程助教表 Create course assistant table
CREATE TABLE IF NOT EXISTS course_assistants (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '助教排課ID Assistant Schedule ID',
  schedule_id INT NOT NULL COMMENT '課程排課ID Course Schedule ID',
  assistant_id INT NOT NULL COMMENT '助教ID Assistant ID',
  fee DECIMAL(10, 2) NOT NULL COMMENT '助教鐘點費 Assistant Fee',
  company_code VARCHAR(255) NOT NULL COMMENT '公司代碼 Company Code',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間 Created Time',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間 Updated Time',
  INDEX idx_schedule_id (schedule_id),
  INDEX idx_assistant_id (assistant_id),
  INDEX idx_company_code (company_code),
  FOREIGN KEY (schedule_id) REFERENCES course_schedules(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; 