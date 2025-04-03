const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const { mainPool, updateExistingSchemas } = require('./config/database');
const tenantRoutes = require('./routes/tenantRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const teacherReportRoutes = require('./routes/teacherReportRoutes');
const { initializeWebSocket } = require('./controllers/notificationController');
const ApiError = require('./utils/apiError');

// 創建 Express 應用
const app = express();

// 創建 HTTP 服務器
const server = http.createServer(app);

// 初始化 WebSocket 服務
initializeWebSocket(server);

// 中間件
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// 路由
app.use('/api/tenants', tenantRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/teacher-reports', teacherReportRoutes);

// 404 處理
app.use((req, res, next) => {
    next(new ApiError(404, '找不到該路徑 Path not found'));
});

// 錯誤處理中間件
app.use((err, req, res, next) => {
    console.error('錯誤 Error:', err);

    // 如果是 API 錯誤 If it's an API error
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors
        });
    }

    // 如果是驗證錯誤 If it's a validation error
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: '驗證錯誤 Validation error',
            errors: err.errors
        });
    }

    // 其他錯誤 Other errors
    res.status(500).json({
        success: false,
        message: '服務器內部錯誤 Internal server error'
    });
});

// 初始化數據庫 Initialize database
const initializeDatabase = async () => {
    try {
        // 更新現有的 schema 以添加權限欄位
        console.log('開始更新數據庫 schema Starting database schema update...');
        await updateExistingSchemas();
        console.log('數據庫 schema 更新完成 Database schema update completed');
    } catch (error) {
        console.error('初始化數據庫失敗 Database initialization failed:', error);
        process.exit(1);
    }
};

// 啟動服務器
const PORT = process.env.PORT || 3006;
server.listen(PORT, async () => {
    console.log(`服務器運行在端口 ${PORT} Server is running on port ${PORT}`);
    await initializeDatabase();
});

// 優雅關閉
process.on('SIGTERM', () => {
    mainPool.end();
    process.exit(0);
}); 