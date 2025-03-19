// 導入依賴 Import dependencies
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { testConnection } = require('../config/database');

// 加載環境變量 Load environment variables
dotenv.config();

// 創建 Express 應用 Create Express application
const app = express();

// 中間件 Middleware
app.use(cors());
app.use(express.json());

// 初始化數據庫連接 Initialize database connection
let sequelize;
let models;

const initializeDatabase = async () => {
  try {
    const result = await testConnection();
    sequelize = result.sequelize;
    models = result.models;

    // 設置路由 Set up routes
    const authRoutes = require('./routes/auth')(models);
    const userRoutes = require('./routes/user')(models);
    const teacherRoutes = require('./routes/teacher')(models);
    const courseRoutes = require('./routes/course')(models);
    const departmentRoutes = require('./routes/department')(models);

    // 使用路由 Use routes
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/teachers', teacherRoutes);
    app.use('/api/courses', courseRoutes);
    app.use('/api/departments', departmentRoutes);

    // 啟動服務器 Start server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`服務器運行在端口 ${PORT} Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('初始化數據庫失敗 Failed to initialize database:', error);
    process.exit(1);
  }
};

// 啟動應用 Start application
initializeDatabase(); 