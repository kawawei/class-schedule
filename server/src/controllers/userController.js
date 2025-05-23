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
            
            // 查詢用戶列表，排除老師角色 Query user list, exclude teacher role
            const result = await client.query(
                `SELECT id, username, name, email, role, is_active, created_at, updated_at 
                 FROM ${companyCode}.users 
                 WHERE role != 'teacher'
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
            const validRoles = ['admin', 'staff', 'teacher'];
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
            if (email) {
                const existingEmail = await client.query(
                    `SELECT id FROM "${companyCode}".users WHERE email = $1`,
                    [email]
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
                [username, hashedPassword, name, email || null, role, is_active !== false]
            );

            // 如果是老師角色，同時創建老師記錄
            // If it's a teacher role, also create a teacher record
            if (role === 'teacher') {
                await client.query(
                    `INSERT INTO "${companyCode}".teachers (name, email, phone, teaching_categories, level, years_of_experience, hourly_rate, is_active)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [name, email || null, '', '[]', '初級', 0, 0, true]
                );
            }
            
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
            const { id } = req.params;
            const { username, password, name, email, role, is_active } = req.body;
            const companyCode = req.user.companyCode;
            
            // 檢查權限 Check permission
            if (!['tenant', 'admin'].includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: '權限不足 Insufficient permissions'
                });
            }

            // 檢查用戶是否存在 Check if user exists
            const existingUser = await client.query(
                `SELECT id FROM ${companyCode}.users WHERE id = $1`,
                [id]
            );
            
            if (existingUser.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '用戶不存在 User not found'
                });
            }

            // 如果要更新角色，驗證角色的有效性 If updating role, validate role
            if (role) {
                const validRoles = ['admin', 'staff'];
                if (!validRoles.includes(role)) {
                    return res.status(400).json({
                        success: false,
                        message: '無效的角色 Invalid role'
                    });
                }
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
                        message: '用戶名已被使用 Username is already taken'
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
    },

    /**
     * 獲取用戶權限 Get user permissions
     * @param {Object} req - 請求對象 Request object
     * @param {Object} res - 響應對象 Response object
     */
    getUserPermissions: async (req, res) => {
        const client = await mainPool.connect();
        try {
            const { id } = req.params;
            const companyCode = req.user.companyCode;

            // 檢查權限 Check permission
            if (!['tenant', 'admin'].includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: '權限不足 Insufficient permissions'
                });
            }

            // 獲取用戶權限 Get user permissions
            const result = await client.query(
                `SELECT id, username, role, permissions 
                 FROM ${companyCode}.users 
                 WHERE id = $1`,
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '用戶不存在 User not found'
                });
            }

            res.json({
                success: true,
                data: {
                    id: result.rows[0].id,
                    username: result.rows[0].username,
                    role: result.rows[0].role,
                    permissions: result.rows[0].permissions || {}
                }
            });
        } catch (error) {
            console.error('獲取用戶權限失敗 Failed to get user permissions:', error);
            res.status(500).json({
                success: false,
                message: '獲取用戶權限失敗 Failed to get user permissions'
            });
        } finally {
            client.release();
        }
    },

    /**
     * 更新用戶權限 Update user permissions
     * @param {Object} req - 請求對象 Request object
     * @param {Object} res - 響應對象 Response object
     */
    updateUserPermissions: async (req, res) => {
        const client = await mainPool.connect();
        try {
            const { id } = req.params;
            const { permissions } = req.body;
            const requestingUser = req.user;

            console.log('[UPDATE PERMISSIONS] 開始更新權限 Starting permission update:', {
                userId: id,
                requestedPermissions: permissions
            });

            // 檢查權限 Check permission
            if (!['tenant', 'admin'].includes(req.user.role)) {
                console.log('[UPDATE PERMISSIONS] 權限不足 Insufficient permissions:', {
                    userRole: req.user.role,
                    requiredRoles: ['tenant', 'admin']
                });
                return res.status(403).json({
                    success: false,
                    message: '權限不足 Insufficient permissions'
                });
            }

            // 檢查用戶是否存在 Check if user exists
            const existingUser = await client.query(
                `SELECT id, role FROM ${req.user.companyCode}.users WHERE id = $1`,
                [id]
            );

            if (existingUser.rows.length === 0) {
                console.log('[UPDATE PERMISSIONS] 用戶不存在 User not found:', { userId: id });
                return res.status(404).json({
                    success: false,
                    message: '用戶不存在 User not found'
                });
            }

            // 只有超級管理員可以修改管理員的權限 Only tenant can modify admin permissions
            if (existingUser.rows[0].role === 'admin' && req.user.role !== 'tenant') {
                console.log('[UPDATE PERMISSIONS] 嘗試修改管理員權限 Attempt to modify admin permissions:', {
                    userId: id,
                    userRole: existingUser.rows[0].role,
                    requesterRole: req.user.role
                });
                return res.status(403).json({
                    success: false,
                    message: '只有超級管理員可以修改管理員的權限 Only tenant can modify admin permissions'
                });
            }

            // 驗證權限格式 Validate permissions format
            if (!permissions || typeof permissions !== 'object') {
                console.log('[UPDATE PERMISSIONS] 權限格式無效 Invalid permissions format:', {
                    receivedPermissions: permissions,
                    type: typeof permissions
                });
                return res.status(400).json({
                    success: false,
                    message: '權限格式無效 Invalid permissions format'
                });
            }

            // 轉換權限格式 Transform permissions format
            const transformedPermissions = {};
            for (const [module, modulePermissions] of Object.entries(permissions)) {
                // 檢查模組是否有 enabled 屬性 Check if module has enabled property
                if (!modulePermissions || typeof modulePermissions.enabled !== 'boolean') {
                    console.log('[UPDATE PERMISSIONS] 模組權限格式無效 Invalid permission format for module:', {
                        module,
                        receivedPermissions: modulePermissions
                    });
                    return res.status(400).json({
                        success: false,
                        message: `模組 ${module} 的權限格式無效 Invalid permission format for module ${module}`
                    });
                }

                // 如果模組被啟用，設置所有操作為 true，否則為 false
                // If module is enabled, set all operations to true, otherwise false
                transformedPermissions[module] = {
                    view: modulePermissions.enabled,
                    create: modulePermissions.enabled,
                    edit: modulePermissions.enabled,
                    delete: modulePermissions.enabled
                };
            }

            // 更新用戶權限 Update user permissions
            console.log('[UPDATE PERMISSIONS] 執行權限更新 Executing permission update');
            const result = await client.query(
                `UPDATE ${req.user.companyCode}.users 
                 SET permissions = $1,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = $2
                 RETURNING id, username, role, permissions`,
                [transformedPermissions, id]
            );

            console.log('[UPDATE PERMISSIONS] 權限更新成功 Permissions updated successfully:', {
                userId: id,
                updatedPermissions: transformedPermissions
            });

            res.json({
                success: true,
                data: result.rows[0]
            });
        } catch (error) {
            console.error('[UPDATE PERMISSIONS] 更新用戶權限失敗 Failed to update user permissions:', {
                error: error.message,
                stack: error.stack,
                query: error.query,
                parameters: error.parameters
            });
            res.status(500).json({
                success: false,
                message: '更新用戶權限失敗 Failed to update user permissions'
            });
        } finally {
            client.release();
            console.log('[UPDATE PERMISSIONS] 數據庫連接已釋放 Database connection released');
        }
    }
};

module.exports = userController; 