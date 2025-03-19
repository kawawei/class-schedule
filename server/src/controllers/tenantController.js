const { mainPool, createTenantSchema } = require('../config/database');
const bcrypt = require('bcryptjs');

// 租戶控制器
const tenantController = {
    // 註冊新租戶
    register: async (req, res) => {
        const client = await mainPool.connect();
        try {
            const { companyName, companyCode, username, password } = req.body;
            
            // 驗證必要字段
            if (!companyName || !companyCode || !username || !password) {
                return res.status(400).json({
                    success: false,
                    message: '所有字段都是必填的'
                });
            }

            // 驗證公司代碼格式
            if (!/^[a-zA-Z0-9]{6,}$/.test(companyCode)) {
                return res.status(400).json({
                    success: false,
                    message: '公司代碼必須至少包含6個英文字母或數字'
                });
            }
            
            await client.query('BEGIN');
            
            // 檢查公司代碼是否已存在
            const existingTenant = await client.query(
                'SELECT * FROM public.tenants WHERE company_code = $1',
                [companyCode]
            );
            
            if (existingTenant.rows.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: '公司代碼已存在'
                });
            }
            
            // 創建租戶記錄
            const tenantResult = await client.query(
                `INSERT INTO public.tenants (company_name, company_code, status)
                 VALUES ($1, $2, 'active')
                 RETURNING id`,
                [companyName, companyCode]
            );
            
            const tenantId = tenantResult.rows[0].id;
            
            // 創建租戶 Schema
            await createTenantSchema(companyCode);
            
            // 創建管理員用戶
            const hashedPassword = await bcrypt.hash(password, 10);
            await client.query(
                `INSERT INTO ${companyCode}.users (username, password, email, role)
                 VALUES ($1, $2, '', 'admin')`,
                [username, hashedPassword]
            );
            
            await client.query('COMMIT');
            
            res.status(201).json({
                success: true,
                message: '註冊成功',
                data: {
                    tenantId,
                    companyCode
                }
            });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('租戶註冊錯誤:', error);
            res.status(500).json({
                success: false,
                message: '註冊失敗',
                error: error.message
            });
        } finally {
            client.release();
        }
    },
    
    // 獲取租戶信息
    getTenantInfo: async (req, res) => {
        try {
            const { tenantId } = req.params;
            const tenantCode = req.headers['x-tenant-id'];
            
            console.log('獲取租戶信息請求:', { tenantId, tenantCode });
            
            // 檢查租戶 ID 是否與請求頭中的租戶 ID 匹配
            if (!tenantCode) {
                return res.status(400).json({
                    success: false,
                    message: '缺少租戶 ID'
                });
            }
            
            const result = await mainPool.query(
                'SELECT * FROM public.tenants WHERE id = $1 AND company_code = $2',
                [tenantId, tenantCode]
            );
            
            console.log('查詢結果:', result.rows);
            
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '租戶不存在或無權訪問'
                });
            }
            
            res.json({
                success: true,
                data: result.rows[0]
            });
        } catch (error) {
            console.error('獲取租戶信息錯誤:', error);
            console.error('錯誤堆棧:', error.stack);
            res.status(500).json({
                success: false,
                message: '獲取租戶信息失敗',
                error: error.message
            });
        }
    }
};

module.exports = tenantController; 