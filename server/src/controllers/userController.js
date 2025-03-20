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
            const { username, password, name, email, role } = req.body;
            const companyCode = req.user.companyCode;
            
            // 檢查用戶名是否已存在 Check if username exists
            const existingUser = await client.query(
                `SELECT id FROM ${companyCode}.users WHERE username = $1`,
                [username]
            );
            
            if (existingUser.rows.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: '用戶名已存在'
                });
            }
            
            // 加密密碼 Encrypt password
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // 創建用戶 Create user
            const result = await client.query(
                `INSERT INTO ${companyCode}.users (username, password, name, email, role, is_active)
                 VALUES ($1, $2, $3, $4, $5, true)
                 RETURNING id, username, name, email, role, is_active, created_at, updated_at`,
                [username, hashedPassword, name, email, role]
            );
            
            res.status(201).json({
                success: true,
                data: result.rows[0]
            });
        } catch (error) {
            console.error('創建用戶失敗:', error);
            res.status(500).json({
                success: false,
                message: '創建用戶失敗'
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
            const { id } = req.params;
            const { username, password, name, email, role, is_active } = req.body;
            const companyCode = req.user.companyCode;
            
            // 檢查用戶是否存在 Check if user exists
            const existingUser = await client.query(
                `SELECT id FROM ${companyCode}.users WHERE id = $1`,
                [id]
            );
            
            if (existingUser.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '用戶不存在'
                });
            }
            
            // 如果更新用戶名，檢查是否與其他用戶衝突 If updating username, check for conflicts
            if (username) {
                const usernameCheck = await client.query(
                    `SELECT id FROM ${companyCode}.users WHERE username = $1 AND id != $2`,
                    [username, id]
                );
                
                if (usernameCheck.rows.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: '用戶名已被使用'
                    });
                }
            }
            
            // 構建更新語句 Build update query
            let updateQuery = `UPDATE ${companyCode}.users SET `;
            const updateValues = [];
            const updateFields = [];
            let valueIndex = 1;
            
            if (username) {
                updateFields.push(`username = $${valueIndex}`);
                updateValues.push(username);
                valueIndex++;
            }
            
            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                updateFields.push(`password = $${valueIndex}`);
                updateValues.push(hashedPassword);
                valueIndex++;
            }
            
            if (name) {
                updateFields.push(`name = $${valueIndex}`);
                updateValues.push(name);
                valueIndex++;
            }
            
            if (email) {
                updateFields.push(`email = $${valueIndex}`);
                updateValues.push(email);
                valueIndex++;
            }
            
            if (role) {
                updateFields.push(`role = $${valueIndex}`);
                updateValues.push(role);
                valueIndex++;
            }
            
            if (typeof is_active === 'boolean') {
                updateFields.push(`is_active = $${valueIndex}`);
                updateValues.push(is_active);
                valueIndex++;
            }
            
            updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
            
            updateQuery += updateFields.join(', ');
            updateQuery += ` WHERE id = $${valueIndex} RETURNING id, username, name, email, role, is_active, created_at, updated_at`;
            updateValues.push(id);
            
            // 執行更新 Execute update
            const result = await client.query(updateQuery, updateValues);
            
            res.json({
                success: true,
                data: result.rows[0]
            });
        } catch (error) {
            console.error('更新用戶失敗:', error);
            res.status(500).json({
                success: false,
                message: '更新用戶失敗'
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
            
            // 檢查是否為超級管理員 Check if super admin
            if (id === '1') {
                return res.status(403).json({
                    success: false,
                    message: '不能刪除超級管理員'
                });
            }
            
            // 刪除用戶 Delete user
            const result = await client.query(
                `DELETE FROM ${companyCode}.users WHERE id = $1 RETURNING id`,
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
                message: '用戶已刪除'
            });
        } catch (error) {
            console.error('刪除用戶失敗:', error);
            res.status(500).json({
                success: false,
                message: '刪除用戶失敗'
            });
        } finally {
            client.release();
        }
    }
};

module.exports = userController; 