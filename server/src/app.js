const express = require('express');
const cors = require('cors');
const { mainPool } = require('./config/database');
const tenantRoutes = require('./routes/tenantRoutes');
const authRoutes = require('./routes/authRoutes');

// 創建 Express 應用
const app = express();

// 中間件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/tenants', tenantRoutes);
app.use('/api/auth', authRoutes);

// 錯誤處理中間件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: '服務器內部錯誤'
    });
});

// 啟動服務器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`服務器運行在端口 ${PORT}`);
});

// 優雅關閉
process.on('SIGTERM', () => {
    mainPool.end();
    process.exit(0);
}); 