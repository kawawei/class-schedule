const { mainPool } = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * 用戶控制器 User Controller
 */
const userController = {
    /**
     * 獲取所有用戶 Get all users
     * @param {Object} req - 請求對象 Request object
     * @param {Object} res - 響應對象 Response object
     */
    getAllUsers: async (req, res) => {
        const client = await mainPool.connect();
        try {
            // 從請求中獲取公司代碼 Get company code from request
            const companyCode = req.user.companyCode;
            
            // 查詢用戶列表 Query user list
            const result = await client.query(
                `SELECT id, username, name, email, role, is_active, created_at, updated_at 
                 FROM ${companyCode}.users 
                 ORDER BY id ASC`
            );
            
            res.json({
                success: true,
                data: result.rows
            });
        } catch (error) {
            console.error('獲取用戶列表失敗:', error);
            res.status(500).json({
                success: false,
                message: '獲取用戶列表失敗'
            });
        } finally {
            client.release();
        }
    },

    /**
     * 獲取單個用戶 Get single user
     * @param {Object} req - 請求對象 Request object
     * @param {Object} res - 響應對象 Response object
     */
    getUser: async (req, res) => {
        const client = await mainPool.connect();
        try {
            const { id } = req.params;
            const companyCode = req.user.companyCode;
            
            const result = await client.query(
                `SELECT id, username, name, email, role, is_active, created_at, updated_at 
                 FROM ${companyCode}.users 
                 WHERE id = $1`,
                [id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '用戶不存在'
                });
            }
            
            res.json({
                success: true,
                data: result.rows[0]
            });
        } catch (error) {
            console.error('獲取用戶信息失敗:', error);
            res.status(500).json({
                success: false,
                message: '獲取用戶信息失敗'
            });
        } finally {
            client.release();
        }
    },

    /**
     * 創建用戶 Create user
     * @param {Object} req - 請求對象 Request object
     * @param {Object} res - 響應對象 Response object
     */
    createUser: async (req, res) => {
        const client = await mainPool.connect();
        try {
            console.log('開始創建用戶 Starting user creation');
            console.log('請求數據 Request data:', req.body);
            
            const { username, password, name, email, role, is_active } = req.body;
            const companyCode = req.user.companyCode;
            
            // 驗證公司代碼 Validate company code
            if (!companyCode) {
                console.log('缺少公司代碼 Missing company code');
                return res.status(400).json({
                    success: false,
                    message: '缺少公司代碼 Missing company code'
                });
            }
            
            // 檢查權限 Check permission
            if (!['tenant', 'admin'].includes(req.user.role)) {
                console.log('權限不足 Insufficient permissions:', req.user.role);
                return res.status(403).json({
                    success: false,
                    message: '權限不足 Insufficient permissions'
                });
            }

            // 驗證必填字段 Validate required fields
            const missingFields = [];
            if (!username) missingFields.push('username');
            if (!password) missingFields.push('password');
            if (!name) missingFields.push('name');
            if (!role) missingFields.push('role');

            if (missingFields.length > 0) {
                console.log('缺少必要字段 Missing required fields:', missingFields);
                return res.status(400).json({
                    success: false,
                    message: `缺少必要字段: ${missingFields.join(', ')} Missing required fields: ${missingFields.join(', ')}`
                });
            }

            // 驗證角色 Validate role
            const validRoles = ['admin', 'staff'];
            if (!validRoles.includes(role)) {
                console.log('無效的角色 Invalid role:', role);
                return res.status(400).json({
                    success: false,
                    message: `無效的角色: ${role} (有效角色: ${validRoles.join(', ')}) Invalid role: ${role} (Valid roles: ${validRoles.join(', ')})`
                });
            }

            // 檢查用戶名是否已存在 Check if username exists
            const existingUser = await client.query(
                `SELECT id FROM "${companyCode}".users WHERE username = $1`,
                [username]
            );
            
            if (existingUser.rows.length > 0) {
                console.log('用戶名已存在 Username already exists:', username);
                return res.status(400).json({
                    success: false,
                    message: '用戶名已存在 Username already exists'
                });
            }

            // 檢查郵箱是否已存在 Check if email exists
            if (email && email.trim() !== '') {
                const existingEmail = await client.query(
                    `SELECT id FROM "${companyCode}".users WHERE email = $1`,
                    [email.trim()]
                );
                
                if (existingEmail.rows.length > 0) {
                    console.log('郵箱已存在 Email already exists:', email);
                    return res.status(400).json({
                        success: false,
                        message: '郵箱已存在 Email already exists'
                    });
                }
            }
            
            // 加密密碼 Encrypt password
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // 創建用戶 Create user
            console.log('執行創建用戶操作 Executing user creation');
            const result = await client.query(
                `INSERT INTO "${companyCode}".users (username, password, name, email, role, is_active)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING id, username, name, email, role, is_active, 
                 to_char(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Taipei', 'YYYY-MM-DD HH24:MI:SS') as created_at,
                 to_char(updated_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Taipei', 'YYYY-MM-DD HH24:MI:SS') as updated_at`,
                [username, hashedPassword, name, email && email.trim() !== '' ? email.trim() : null, role, is_active !== false]
            );
            
            console.log('用戶創建成功 User created successfully:', result.rows[0]);
            res.status(201).json({
                success: true,
                data: result.rows[0]
            });
        } catch (error) {
            console.error('創建用戶失敗 Failed to create user:', error);
            console.error('錯誤詳情 Error details:', {
                message: error.message,
                stack: error.stack,
                query: error.query,
                parameters: error.parameters
            });
            
            // 根據錯誤類型返回不同的錯誤消息 Return different error messages based on error type
            let errorMessage = '創建用戶失敗 Failed to create user';
            if (error.message.includes('relation') && error.message.includes('does not exist')) {
                errorMessage = '公司資料表不存在 Company table does not exist';
            } else if (error.message.includes('permission denied')) {
                errorMessage = '沒有權限訪問數據庫 No permission to access database';
            } else if (error.message.includes('duplicate key value')) {
                if (error.message.includes('users_email_key')) {
                    errorMessage = '郵箱已存在 Email already exists';
                } else if (error.message.includes('users_username_key')) {
                    errorMessage = '用戶名已存在 Username already exists';
                }
            }
            
            res.status(500).json({
                success: false,
                message: `${errorMessage}: ${error.message}`
            });
        } finally {
            client.release();
        }
    },

    /**
     * 更新用戶 Update user
     * @param {Object} req - 請求對象 Request object
     * @param {Object} res - 響應對象 Response object
     */
    updateUser: async (req, res) => {
        const client = await mainPool.connect();
        try {
            console.log('開始更新用戶 Starting user update');
            console.log('請求數據 Request data:', req.body);
            console.log('請求參數 Request params:', req.params);
            
            const { id } = req.params;
            const { username, password, name, email, role, is_active } = req.body;
            const companyCode = req.user.companyCode;
            
            // 驗證用戶ID Validate user ID
            if (!id || isNaN(parseInt(id))) {
                console.log('無效的用戶ID Invalid user ID:', id);
                return res.status(400).json({
                    success: false,
                    message: '無效的用戶ID Invalid user ID'
                });
            }
            
            // 驗證公司代碼 Validate company code
            if (!companyCode) {
                console.log('缺少公司代碼 Missing company code');
                return res.status(400).json({
                    success: false,
                    message: '缺少公司代碼 Missing company code'
                });
            }
            
            // 檢查權限 Check permission
            if (!['tenant', 'admin'].includes(req.user.role)) {
                console.log('權限不足 Insufficient permissions:', req.user.role);
                return res.status(403).json({
                    success: false,
                    message: '權限不足 Insufficient permissions'
                });
            }

            // 檢查用戶是否存在 Check if user exists
            const existingUser = await client.query(
                `SELECT id, role FROM "${companyCode}".users WHERE id = $1`,
                [parseInt(id)]
            );
            
            if (existingUser.rows.length === 0) {
                console.log('用戶不存在 User does not exist:', id);
                return res.status(404).json({
                    success: false,
                    message: '用戶不存在 User does not exist'
                });
            }

            // 驗證角色 Validate role
            if (role) {
                const validRoles = ['admin', 'staff'];
                if (!validRoles.includes(role)) {
                    console.log('無效的角色 Invalid role:', role);
                    return res.status(400).json({
                        success: false,
                        message: `無效的角色: ${role} (有效角色: ${validRoles.join(', ')}) Invalid role: ${role} (Valid roles: ${validRoles.join(', ')})`
                    });
                }
            }

            // 檢查用戶名是否重複 Check if username is duplicate
            if (username) {
                const existingUsername = await client.query(
                    `SELECT id FROM "${companyCode}".users WHERE username = $1 AND id != $2`,
                    [username, parseInt(id)]
                );
                
                if (existingUsername.rows.length > 0) {
                    console.log('用戶名已存在 Username already exists:', username);
                    return res.status(400).json({
                        success: false,
                        message: '用戶名已存在 Username already exists'
                    });
                }
            }

            // 檢查郵箱是否重複 Check if email is duplicate
            if (email && email.trim() !== '') {
                const existingEmail = await client.query(
                    `SELECT id FROM "${companyCode}".users WHERE email = $1 AND id != $2`,
                    [email.trim(), parseInt(id)]
                );
                
                if (existingEmail.rows.length > 0) {
                    console.log('郵箱已存在 Email already exists:', email);
                    return res.status(400).json({
                        success: false,
                        message: '郵箱已存在 Email already exists'
                    });
                }
            }
            
            // 構建更新查詢 Build update query
            const updates = [];
            const values = [];
            let paramCount = 1;
            
            if (username) {
                updates.push(`username = $${paramCount}`);
                values.push(username);
                paramCount++;
            }
            
            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                updates.push(`password = $${paramCount}`);
                values.push(hashedPassword);
                paramCount++;
            }
            
            if (name) {
                updates.push(`name = $${paramCount}`);
                values.push(name);
                paramCount++;
            }
            
            if (email !== undefined) {
                updates.push(`email = $${paramCount}`);
                values.push(email && email.trim() !== '' ? email.trim() : null);
                paramCount++;
            }
            
            if (role) {
                updates.push(`role = $${paramCount}`);
                values.push(role);
                paramCount++;
            }
            
            if (is_active !== undefined) {
                updates.push(`is_active = $${paramCount}`);
                // 將字符串 "true"/"false" 或布爾值轉換為布爾值
                const isActiveValue = typeof is_active === 'string' 
                    ? is_active.toLowerCase() === 'true'
                    : Boolean(is_active);
                values.push(isActiveValue);
                paramCount++;
            }
            
            // 添加更新時間 Add updated_at
            updates.push(`updated_at = CURRENT_TIMESTAMP`);
            
            // 添加用戶ID Add user ID
            values.push(parseInt(id));
            
            // 執行更新 Execute update
            console.log('執行更新用戶操作 Executing user update');
            const result = await client.query(
                `UPDATE "${companyCode}".users 
                 SET ${updates.join(', ')}
                 WHERE id = $${paramCount}
                 RETURNING id, username, name, email, role, is_active,
                 to_char(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Taipei', 'YYYY-MM-DD HH24:MI:SS') as created_at,
                 to_char(updated_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Taipei', 'YYYY-MM-DD HH24:MI:SS') as updated_at`,
                values
            );
            
            if (result.rows.length === 0) {
                console.log('用戶不存在 User does not exist:', id);
                return res.status(404).json({
                    success: false,
                    message: '用戶不存在 User does not exist'
                });
            }
            
            console.log('用戶更新成功 User updated successfully:', result.rows[0]);
            res.json({
                success: true,
                data: result.rows[0]
            });
        } catch (error) {
            console.error('更新用戶失敗 Failed to update user:', error);
            console.error('錯誤詳情 Error details:', {
                message: error.message,
                stack: error.stack,
                query: error.query,
                parameters: error.parameters
            });
            
            res.status(500).json({
                success: false,
                message: `更新用戶失敗 Failed to update user: ${error.message}`
            });
        } finally {
            client.release();
        }
    },

    /**
     * 刪除用戶 Delete user
     * @param {Object} req - 請求對象 Request object
     * @param {Object} res - 響應對象 Response object
     */
    deleteUser: async (req, res) => {
        const client = await mainPool.connect();
        try {
            const { id } = req.params;
            const companyCode = req.user.companyCode;
            
            console.log(`[DELETE USER] 開始刪除用戶 Starting user deletion - User ID: ${id}, Company Code: ${companyCode}`);
            console.log(`[DELETE USER] 請求來源 Request source - IP: ${req.ip}, Method: ${req.method}, Path: ${req.path}`);
            console.log(`[DELETE USER] 請求標頭 Request headers:`, req.headers);
            
            // 檢查是否為超級管理員 Check if super admin
            if (id === '1') {
                console.log(`[DELETE USER] 嘗試刪除超級管理員 Attempt to delete super admin - Rejected`);
                return res.status(403).json({
                    success: false,
                    message: '不能刪除超級管理員'
                });
            }
            
            // 刪除用戶 Delete user
            console.log(`[DELETE USER] 執行刪除查詢 Executing delete query`);
            const result = await client.query(
                `DELETE FROM ${companyCode}.users WHERE id = $1 RETURNING id`,
                [id]
            );
            
            if (result.rows.length === 0) {
                console.log(`[DELETE USER] 用戶不存在 User not found - ID: ${id}`);
                return res.status(404).json({
                    success: false,
                    message: '用戶不存在'
                });
            }
            
            console.log(`[DELETE USER] 用戶刪除成功 User deleted successfully - ID: ${id}`);
            res.json({
                success: true,
                message: '用戶已刪除'
            });
        } catch (error) {
            console.error(`[DELETE USER] 刪除用戶時發生錯誤 Error deleting user:`, error);
            console.error(`[DELETE USER] 錯誤堆棧 Error stack:`, error.stack);
            res.status(500).json({
                success: false,
                message: '刪除用戶失敗'
            });
        } finally {
            client.release();
            console.log(`[DELETE USER] 數據庫連接已釋放 Database connection released`);
        }
    }
};

module.exports = userController; 