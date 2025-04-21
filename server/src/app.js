const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const path = require('path');
const { mainPool, updateExistingSchemas } = require('./config/database');
const tenantRoutes = require('./routes/tenantRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const teacherReportRoutes = require('./routes/teacherReportRoutes');
const qrcodeRoutes = require('./routes/qrcodeRoutes');
const inventoryRoutes = require('./routes/inventory');
const warehouseRoutes = require('./routes/warehouse');
const { initializeWebSocket } = require('./controllers/notificationController');
const ApiError = require('./utils/ApiError');

// 創建 Express 應用
const app = express();

// 創建 HTTP 服務器
const server = http.createServer(app);

// 初始化 WebSocket 服務
initializeWebSocket(server);

// 配置 CORS
app.use(cors());

// 配置日誌
app.use(morgan('dev'));

// 配置 JSON 解析
app.use(express.json());
// 配置 URL 編碼解析 Configure URL-encoded parser
app.use(express.urlencoded({ extended: true }));

// 健康檢查端點
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: '服務正常運行 Service is running',
        timestamp: new Date().toISOString()
    });
});

// 路由 Routes
app.use('/api/tenants', tenantRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/teacher-reports', teacherReportRoutes);
app.use('/api/qrcode', qrcodeRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/warehouse', warehouseRoutes);

// 配置靜態文件服務 Configure static file service
app.use('/api/qrcodes', express.static(path.join(__dirname, '../public/qrcodes')));
app.use('/api/uploads', express.static(path.join(__dirname, '../uploads'))); // 將 uploads 目錄掛載到 /api/uploads 下 Mount uploads directory under /api/uploads

// 處理未找到的路由 Handle 404 routes
app.use((req, res, next) => {
    next(new ApiError(404, '找不到該路徑 Path not found'));
});

// 錯誤處理中間件
app.use((err, req, res, next) => {
    console.error('錯誤 Error:', err);

    // 如果是 API 錯誤 If it's an API error
    if (err instanceof ApiError) {
        return res.status(err.statusCode || 500).json({
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