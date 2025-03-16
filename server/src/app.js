// 導入依賴 Import dependencies
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize, testConnection } = require('../config/database');
const User = require('./models/user');

// 導入路由 Import routes
const authRoutes = require('./routes/auth');

// 加載環境變量 Load environment variables
dotenv.config();

// 創建 Express 應用 Create Express application
const app = express();

// 設置中間件 Set up middleware
app.use(cors()); // 啟用 CORS Enable CORS
app.use(express.json()); // 解析 JSON 請求體 Parse JSON request body
app.use(express.urlencoded({ extended: true })); // 解析 URL 編碼的請求體 Parse URL-encoded request body

// 設置路由 Set up routes
app.use('/api/auth', authRoutes);

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

// 啟動服務器 Start server
const startServer = async () => {
  try {
    // 嘗試測試數據庫連接，但不阻止服務器啟動
    // Try to test database connection, but don't block server startup
    try {
      await testConnection();
      
      // 同步數據庫模型 Sync database models
      await sequelize.sync({ alter: true });
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
    } catch (dbError) {
      console.warn('數據庫連接或同步失敗，但服務器仍將啟動 Database connection or sync failed, but server will still start:', dbError.message);
      console.warn('請確保MySQL服務器正在運行，並且已創建數據庫 Please ensure MySQL server is running and database is created');
      console.warn('您可以使用以下SQL命令創建數據庫：CREATE DATABASE talent_teacher_db;');
    }
    
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