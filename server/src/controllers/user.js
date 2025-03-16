// 導入依賴 Import dependencies
const User = require('../models/user');
const { generateToken } = require('../utils/jwt');

/**
 * 獲取所有用戶 Get all users
 * @param {Object} req - 請求對象 Request object
 * @param {Object} res - 響應對象 Response object
 */
const getAllUsers = async (req, res) => {
  try {
    // 查詢所有用戶，不返回密碼字段 Query all users, exclude password field
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']] // 按創建時間降序排序 Sort by creation time in descending order
    });
    
    // 輸出原始用戶數據 Log raw user data
    console.log('原始用戶數據 Raw user data:', JSON.stringify(users, null, 2));
    
    // 格式化用戶數據 Format user data
    const formattedUsers = users.map(user => {
      const userData = user.toJSON();
      
      // 不再嘗試重新編碼用戶名，直接使用數據庫返回的值
      // No longer try to re-encode user name, directly use the value returned by the database
      
      return {
        ...userData,
        status: userData.is_active ? 'active' : 'inactive' // 將 is_active 轉換為 status Format is_active as status
      };
    });
    
    // 輸出格式化後的用戶數據 Log formatted user data
    console.log('格式化後的用戶數據 Formatted user data:', JSON.stringify(formattedUsers, null, 2));
    
    // 返回用戶列表 Return user list
    return res.status(200).json({
      success: true,
      data: formattedUsers
    });
  } catch (error) {
    console.error('獲取用戶列表失敗 Failed to get user list:', error);
    return res.status(500).json({
      success: false,
      message: '獲取用戶列表失敗 Failed to get user list',
      error: error.message
    });
  }
};

/**
 * 獲取單個用戶 Get single user
 * @param {Object} req - 請求對象 Request object
 * @param {Object} res - 響應對象 Response object
 */
const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 查詢用戶 Query user
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
    
    // 如果用戶不存在，返回 404 If user doesn't exist, return 404
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用戶不存在 User not found'
      });
    }
    
    // 格式化用戶數據 Format user data
    const userData = user.toJSON();
    const formattedUser = {
      ...userData,
      status: userData.is_active ? 'active' : 'inactive' // 將 is_active 轉換為 status Format is_active as status
    };
    
    // 返回用戶信息 Return user info
    return res.status(200).json({
      success: true,
      data: formattedUser
    });
  } catch (error) {
    console.error('獲取用戶失敗 Failed to get user:', error);
    return res.status(500).json({
      success: false,
      message: '獲取用戶失敗 Failed to get user',
      error: error.message
    });
  }
};

/**
 * 創建用戶 Create user
 * @param {Object} req - 請求對象 Request object
 * @param {Object} res - 響應對象 Response object
 */
const createUser = async (req, res) => {
  try {
    const { username, password, name, email, role } = req.body;
    
    // 檢查必填字段 Check required fields
    if (!username || !password || !name) {
      return res.status(400).json({
        success: false,
        message: '用戶名、密碼和姓名為必填字段 Username, password and name are required'
      });
    }
    
    // 檢查用戶名是否已存在 Check if username already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '用戶名已存在 Username already exists'
      });
    }
    
    // 創建用戶 Create user
    const user = await User.create({
      username,
      password, // 密碼會在模型的 beforeCreate 鉤子中自動加密 Password will be automatically encrypted in the model's beforeCreate hook
      name,
      email,
      role: role || 'user',
      is_active: true
    });
    
    // 返回創建的用戶信息（不包含密碼） Return created user info (excluding password)
    const userData = user.toJSON();
    delete userData.password;
    
    return res.status(201).json({
      success: true,
      message: '用戶創建成功 User created successfully',
      data: {
        ...userData,
        status: userData.is_active ? 'active' : 'inactive' // 將 is_active 轉換為 status Format is_active as status
      }
    });
  } catch (error) {
    console.error('創建用戶失敗 Failed to create user:', error);
    return res.status(500).json({
      success: false,
      message: '創建用戶失敗 Failed to create user',
      error: error.message
    });
  }
};

/**
 * 更新用戶 Update user
 * @param {Object} req - 請求對象 Request object
 * @param {Object} res - 響應對象 Response object
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, status, password } = req.body;
    
    // 查詢用戶 Query user
    const user = await User.findByPk(id);
    
    // 如果用戶不存在，返回 404 If user doesn't exist, return 404
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用戶不存在 User not found'
      });
    }
    
    // 準備更新數據 Prepare update data
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (status !== undefined) updateData.is_active = status === 'active';
    if (password) updateData.password = password;
    
    // 更新用戶 Update user
    await user.update(updateData);
    
    // 重新獲取更新後的用戶信息 Get updated user info
    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
    
    // 格式化用戶數據 Format user data
    const userData = updatedUser.toJSON();
    const formattedUser = {
      ...userData,
      status: userData.is_active ? 'active' : 'inactive' // 將 is_active 轉換為 status Format is_active as status
    };
    
    // 返回更新後的用戶信息 Return updated user info
    return res.status(200).json({
      success: true,
      message: '用戶更新成功 User updated successfully',
      data: formattedUser
    });
  } catch (error) {
    console.error('更新用戶失敗 Failed to update user:', error);
    return res.status(500).json({
      success: false,
      message: '更新用戶失敗 Failed to update user',
      error: error.message
    });
  }
};

/**
 * 刪除用戶 Delete user
 * @param {Object} req - 請求對象 Request object
 * @param {Object} res - 響應對象 Response object
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 查詢用戶 Query user
    const user = await User.findByPk(id);
    
    // 如果用戶不存在，返回 404 If user doesn't exist, return 404
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用戶不存在 User not found'
      });
    }
    
    // 刪除用戶 Delete user
    await user.destroy();
    
    // 返回成功信息 Return success message
    return res.status(200).json({
      success: true,
      message: '用戶刪除成功 User deleted successfully'
    });
  } catch (error) {
    console.error('刪除用戶失敗 Failed to delete user:', error);
    return res.status(500).json({
      success: false,
      message: '刪除用戶失敗 Failed to delete user',
      error: error.message
    });
  }
};

// 導出控制器函數 Export controller functions
module.exports = {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
}; 