-- 創建數據庫 Create database
CREATE DATABASE IF NOT EXISTS Talent_teacher_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用數據庫 Use database
USE Talent_teacher_db;

-- 創建用戶表 Create user table
CREATE TABLE IF NOT EXISTS USER (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '用戶ID User ID',
  username VARCHAR(50) NOT NULL UNIQUE COMMENT '用戶名 Username',
  password VARCHAR(100) NOT NULL COMMENT '密碼 Password',
  name VARCHAR(100) NOT NULL COMMENT '姓名 Name',
  email VARCHAR(100) UNIQUE COMMENT '電子郵件 Email',
  role ENUM('admin', 'user') DEFAULT 'user' COMMENT '角色 Role',
  avatar VARCHAR(255) COMMENT '頭像URL Avatar URL',
  is_active BOOLEAN DEFAULT TRUE COMMENT '是否啟用 Is Active',
  last_login DATETIME COMMENT '最後登入時間 Last Login Time',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間 Created Time',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間 Updated Time'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入管理員用戶 Insert admin user
-- 密碼將在部署時設置 Password will be set during deployment
INSERT INTO USER (username, password, name, email, role)
VALUES ('admin', '$2b$10$3IXeQteRWBKgAFQ/UM1/1OQ83o1.j1JsV7wMtPUW.7MBtPYnEJJ0G', '管理員', 'admin@example.com', 'admin')
ON DUPLICATE KEY UPDATE username = username;

-- 創建老師表 Create teacher table
CREATE TABLE IF NOT EXISTS TEACHER (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '老師ID Teacher ID',
  name VARCHAR(100) NOT NULL COMMENT '姓名 Name',
  phone VARCHAR(20) NOT NULL COMMENT '電話 Phone',
  email VARCHAR(100) COMMENT '電子郵件 Email',
  specialty VARCHAR(255) NOT NULL COMMENT '專長 Specialty',
  hourly_rate DECIMAL(10, 2) NOT NULL COMMENT '時薪 Hourly Rate',
  address VARCHAR(255) COMMENT '地址 Address',
  notes TEXT COMMENT '備註 Notes',
  is_active BOOLEAN DEFAULT TRUE COMMENT '是否啟用 Is Active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間 Created Time',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間 Updated Time'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 創建課程表 Create course table
CREATE TABLE IF NOT EXISTS COURSE (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '課程ID Course ID',
  name VARCHAR(100) NOT NULL COMMENT '課程名稱 Course Name',
  description TEXT COMMENT '課程描述 Course Description',
  duration INT NOT NULL COMMENT '課程時長（分鐘） Course duration (minutes)',
  category VARCHAR(50) NOT NULL COMMENT '課程類別 Course Category',
  level VARCHAR(50) NOT NULL COMMENT '課程級別 Course Level',
  is_active BOOLEAN DEFAULT TRUE COMMENT '是否啟用 Is Active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間 Created Time',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間 Updated Time'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 創建排課表 Create schedule table
CREATE TABLE IF NOT EXISTS SCHEDULE (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '排課ID Schedule ID',
  teacher_id INT NOT NULL COMMENT '老師ID Teacher ID',
  course_id INT NOT NULL COMMENT '課程ID Course ID',
  start_time DATETIME NOT NULL COMMENT '開始時間 Start Time',
  end_time DATETIME NOT NULL COMMENT '結束時間 End Time',
  location VARCHAR(255) NOT NULL COMMENT '地點 Location',
  status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled' COMMENT '狀態 Status',
  notes TEXT COMMENT '備註 Notes',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間 Created Time',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間 Updated Time',
  FOREIGN KEY (teacher_id) REFERENCES TEACHER(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES COURSE(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; 