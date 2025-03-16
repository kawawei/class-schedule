-- 創建數據庫 Create database
CREATE DATABASE IF NOT EXISTS Talent_teacher_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用數據庫 Use database
USE Talent_teacher_db;

-- 創建部門表 Create department table
CREATE TABLE IF NOT EXISTS DEPARTMENT (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '部門ID Department ID',
  name VARCHAR(100) NOT NULL COMMENT '部門名稱 Department Name',
  code VARCHAR(50) NOT NULL UNIQUE COMMENT '部門代碼 Department Code',
  description TEXT COMMENT '部門描述 Department Description',
  is_active BOOLEAN DEFAULT TRUE COMMENT '是否啟用 Is Active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間 Created Time',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間 Updated Time'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入默認部門 Insert default departments
INSERT INTO DEPARTMENT (name, code, description)
VALUES 
  ('師資部', 'teaching', '負責教師管理和培訓 Responsible for teacher management and training'),
  ('管理部', 'management', '負責系統和行政管理 Responsible for system and administrative management')
ON DUPLICATE KEY UPDATE code = code;

-- 創建用戶表 Create user table
CREATE TABLE IF NOT EXISTS USER (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '用戶ID User ID',
  username VARCHAR(50) NOT NULL UNIQUE COMMENT '用戶名 Username',
  password VARCHAR(100) NOT NULL COMMENT '密碼 Password',
  name VARCHAR(100) NOT NULL COMMENT '姓名 Name',
  email VARCHAR(100) UNIQUE COMMENT '電子郵件 Email',
  role ENUM('admin', 'teacher', 'user') DEFAULT 'user' COMMENT '角色 Role',
  avatar VARCHAR(255) COMMENT '頭像URL Avatar URL',
  is_active BOOLEAN DEFAULT TRUE COMMENT '是否啟用 Is Active',
  last_login DATETIME COMMENT '最後登入時間 Last Login Time',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間 Created Time',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間 Updated Time'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 創建用戶部門關聯表 Create user department relation table
CREATE TABLE IF NOT EXISTS USER_DEPARTMENT (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '關聯ID Relation ID',
  user_id INT NOT NULL COMMENT '用戶ID User ID',
  department_id INT NOT NULL COMMENT '部門ID Department ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間 Created Time',
  FOREIGN KEY (user_id) REFERENCES USER(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES DEPARTMENT(id) ON DELETE CASCADE,
  UNIQUE KEY `user_department_unique` (user_id, department_id) COMMENT '用戶部門唯一索引 User Department Unique Index'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入管理員用戶 Insert admin user
-- 密碼為 admin123 的 bcrypt 哈希 Password is bcrypt hash of admin123
INSERT INTO USER (username, password, name, email, role)
VALUES ('admin', '$2b$10$3IXeQteRWBKgAFQ/UM1/1OQ83o1.j1JsV7wMtPUW.7MBtPYnEJJ0G', '管理員', 'admin@example.com', 'admin')
ON DUPLICATE KEY UPDATE username = username;

-- 為管理員用戶添加部門關聯 Add department relation for admin user
INSERT INTO USER_DEPARTMENT (user_id, department_id)
SELECT 
  (SELECT id FROM USER WHERE username = 'admin'),
  (SELECT id FROM DEPARTMENT WHERE code = 'management')
ON DUPLICATE KEY UPDATE user_id = user_id;

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