// 導入依賴 Import dependencies
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize, testConnection } = require('../config/database');
const User = require('./models/user');
const Department = require('./models/department');
const UserDepartment = require('./models/userDepartment');
const Teacher = require('./models/teacher');
const Course = require('./models/course');

// 導入路由 Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const departmentRoutes = require('./routes/department');
const teacherRoutes = require('./routes/teacher');
const courseRoutes = require('./routes/course');

// 導入中間件 Import middleware
const timezoneMiddleware = require('./middleware/timezone');

// 加載環境變量 Load environment variables
dotenv.config();

// 創建 Express 應用 Create Express application
const app = express();

// 設置中間件 Set up middleware
app.use(cors()); // 啟用 CORS Enable CORS

// 設置字符編碼中間件 Set character encoding middleware
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

app.use(express.json()); // 解析 JSON 請求體 Parse JSON request body
app.use(express.urlencoded({ extended: true })); // 解析 URL 編碼的請求體 Parse URL-encoded request body

// 使用時區中間件 Use timezone middleware
app.use(timezoneMiddleware);

// 設置路由 Set up routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/courses', courseRoutes);

// 根路由 Root route
app.get('/', (req, res) => {
  res.json({
    message: '才藝老師管理系統 API 服務器 Talent Teacher Management System API Server'
  });
});

// 未找到路由處理 Not found route handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '未找到請求的資源 Requested resource not found'
  });
});

// 錯誤處理中間件 Error handling middleware
app.use((err, req, res, next) => {
  console.error('服務器錯誤 Server error:', err);
  res.status(500).json({
    success: false,
    message: '服務器錯誤 Server error'
  });
});

// 獲取端口 Get port
const PORT = process.env.PORT || 3004;

// 添加重試機制 Add retry mechanism
const connectWithRetry = async (retries = 5, delay = 5000) => {
  let currentRetry = 0;
  
  while (currentRetry < retries) {
    try {
      console.log(`嘗試連接數據庫 (${currentRetry + 1}/${retries}) Trying to connect to database (${currentRetry + 1}/${retries})`);
      await testConnection();
      
      // 同步數據庫模型 Sync database models
      await sequelize.sync({ alter: false });
      console.log('數據庫模型已同步 Database models synced');
      
      // 檢查是否有管理員用戶，如果沒有則創建 Check if admin user exists, create if not
      const adminExists = await User.findOne({ where: { username: 'admin' } });
      
      if (!adminExists) {
        await User.create({
          username: 'admin',
          password: 'admin123',
          name: '管理員',
          email: 'admin@example.com',
          role: 'admin'
        });
        console.log('已創建默認管理員用戶 Default admin user created');
      }
      
      return true;
    } catch (dbError) {
      console.warn(`數據庫連接失敗 (${currentRetry + 1}/${retries}): ${dbError.message} Database connection failed (${currentRetry + 1}/${retries}): ${dbError.message}`);
      
      if (currentRetry === retries - 1) {
        console.warn('數據庫連接或同步失敗，但服務器仍將啟動 Database connection or sync failed, but server will still start:', dbError.message);
        console.warn('請確保MySQL服務器正在運行，並且已創建數據庫 Please ensure MySQL server is running and database is created');
        console.warn('您可以使用以下SQL命令創建數據庫：CREATE DATABASE talent_teacher_db;');
        return false;
      }
      
      console.log(`等待 ${delay/1000} 秒後重試 Waiting ${delay/1000} seconds before retrying...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      currentRetry++;
    }
  }
  
  return false;
};

// 啟動服務器 Start server
const startServer = async () => {
  try {
    // 嘗試連接數據庫，使用重試機制 Try to connect to database with retry mechanism
    await connectWithRetry();
    
    // 啟動服務器 Start server
    app.listen(PORT, () => {
      console.log(`服務器運行在端口 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('啟動服務器時出錯 Error starting server:', error);
    process.exit(1);
  }
};

// 調用啟動函數 Call start function
startServer();

// 導出 app 用於測試 Export app for testing
module.exports = app; 