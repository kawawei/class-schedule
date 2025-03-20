const { mainPool } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 認證控制器
const authController = {
    // 用戶登入
    login: async (req, res) => {
        const client = await mainPool.connect();
        try {
            const { company_code, username, password } = req.body;

            // 檢查公司代碼是否存在
            const tenantResult = await client.query(
                'SELECT * FROM public.tenants WHERE company_code = $1 AND status = $2',
                [company_code, 'active']
            );

            if (tenantResult.rows.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: '公司代碼不存在或已停用'
                });
            }

            const company = tenantResult.rows[0];

            // 在對應的 schema 中查找用戶
            const userResult = await client.query(
                `SELECT * FROM ${company_code}.users WHERE username = $1`,
                [username]
            );

            if (userResult.rows.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: '用戶名或密碼錯誤'
                });
            }

            const user = userResult.rows[0];

            // 檢查用戶是否被停用
            if (!user.is_active) {
                return res.status(401).json({
                    success: false,
                    message: '該帳號已被停用'
                });
            }

            // 驗證密碼
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: '用戶名或密碼錯誤'
                });
            }

            // 生成 JWT token
            const token = jwt.sign(
                {
                    userId: user.id,
                    username: user.username,
                    role: user.role,
                    companyCode: company_code
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            // 返回用戶信息和 token
            res.json({
                success: true,
                message: '登入成功',
                data: {
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    },
                    company: {
                        id: company.id,
                        company_name: company.company_name,
                        company_code: company.company_code,
                        status: company.status
                    }
                }
            });
        } catch (error) {
            console.error('登入錯誤:', error);
            res.status(500).json({
                success: false,
                message: '登入失敗',
                error: error.message
            });
        } finally {
            client.release();
        }
    },

    // 用戶登出
    logout: async (req, res) => {
        try {
            // 由於使用 JWT，服務器端不需要做特殊處理
            // 客戶端需要清除本地存儲的 token
            res.json({
                success: true,
                message: '登出成功'
            });
        } catch (error) {
            console.error('登出錯誤:', error);
            res.status(500).json({
                success: false,
                message: '登出失敗'
            });
        }
    }
};

module.exports = authController; 