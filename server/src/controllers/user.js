// 導入依賴 Import dependencies
const User = require('../models/user');
const Department = require('../models/department');
const UserDepartment = require('../models/userDepartment');
const { sequelize } = require('../../config/database');

/**
 * 獲取所有用戶 Get all users
 * @param {Object} req - 請求對象 Request object
 * @param {Object} res - 響應對象 Response object
 */
const getAllUsers = async (req, res) => {
  try {
    // 從請求頭或用戶對象中獲取部門ID Get department ID from request header or user object
    const departmentId = req.headers['x-department-id'] || req.user.departmentId;
    if (!departmentId) {
      return res.status(400).json({
        success: false,
        message: '缺少部門ID Missing department ID'
      });
    }

    // 獲取指定部門的所有用戶 Get all users from specified department
    const users = await User.findAll({
      attributes: { exclude: ['password'] }, // 排除密碼字段 Exclude password field
      include: [
        {
          model: Department,
          as: 'departments',
          through: { attributes: [] }, // 不包含中間表字段 Don't include junction table fields
          where: { id: departmentId } // 只獲取指定部門的用戶 Only get users from specified department
        }
      ],
      order: [['id', 'ASC']]
    });
    
    // 格式化用戶數據 Format user data
    const formattedUsers = users.map(user => {
      const userData = user.toJSON();
      return {
        ...userData,
        status: userData.is_active ? 'active' : 'inactive', // 將 is_active 轉換為 status Format is_active as status
        departments: userData.departments.map(dept => dept.code) // 只返回部門代碼 Only return department codes
      };
    });
    
    return res.status(200).json({
      success: true,
      message: '獲取用戶列表成功 Get users list successfully',
      data: formattedUsers
    });
  } catch (error) {
    console.error('獲取用戶列表失敗 Failed to get users list:', error);
    return res.status(500).json({
      success: false,
      message: '獲取用戶列表失敗 Failed to get users list',
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
    
    // 獲取用戶 Get user
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }, // 排除密碼字段 Exclude password field
      include: [
        {
          model: Department,
          as: 'departments',
          through: { attributes: [] } // 不包含中間表字段 Don't include junction table fields
        }
      ]
    });
    
    // 如果用戶不存在，返回404 If user doesn't exist, return 404
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
      status: userData.is_active ? 'active' : 'inactive', // 將 is_active 轉換為 status Format is_active as status
      departments: userData.departments.map(dept => dept.code) // 只返回部門代碼 Only return department codes
    };
    
    return res.status(200).json({
      success: true,
      message: '獲取用戶成功 Get user successfully',
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
  // 開始事務 Start transaction
  const transaction = await sequelize.transaction();
  
  try {
    const { username, password, name, email, role, departments } = req.body;
    
    // 檢查必填字段 Check required fields
    if (!username || !password || !name) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: '用戶名、密碼和姓名為必填字段 Username, password and name are required'
      });
    }
    
    // 檢查用戶名是否已存在 Check if username already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      await transaction.rollback();
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
    }, { transaction });
    
    // 如果有部門，添加部門關聯 If departments are provided, add department relations
    if (departments && departments.length > 0) {
      // 獲取部門 Get departments
      const deptRecords = await Department.findAll({
        where: { code: departments },
        transaction
      });
      
      // 添加部門關聯 Add department relations
      if (deptRecords.length > 0) {
        await user.addDepartments(deptRecords, { transaction });
      }
    }
    
    // 提交事務 Commit transaction
    await transaction.commit();
    
    // 獲取完整的用戶信息（包括部門） Get complete user info (including departments)
    const createdUser = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] }, // 排除密碼字段 Exclude password field
      include: [
        {
          model: Department,
          as: 'departments',
          through: { attributes: [] } // 不包含中間表字段 Don't include junction table fields
        }
      ]
    });
    
    // 格式化用戶數據 Format user data
    const userData = createdUser.toJSON();
    const formattedUser = {
      ...userData,
      status: userData.is_active ? 'active' : 'inactive', // 將 is_active 轉換為 status Format is_active as status
      departments: userData.departments.map(dept => dept.code) // 只返回部門代碼 Only return department codes
    };
    
    return res.status(201).json({
      success: true,
      message: '用戶創建成功 User created successfully',
      data: formattedUser
    });
  } catch (error) {
    // 回滾事務 Rollback transaction
    await transaction.rollback();
    
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
  // 開始事務 Start transaction
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { username, password, name, email, role, is_active, departments } = req.body;
    
    // 獲取用戶 Get user
    const user = await User.findByPk(id, { transaction });
    
    // 如果用戶不存在，返回404 If user doesn't exist, return 404
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: '用戶不存在 User not found'
      });
    }
    
    // 如果更改用戶名，檢查是否已存在 If changing username, check if it already exists
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ 
        where: { username },
        transaction
      });
      
      if (existingUser) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: '用戶名已存在 Username already exists'
        });
      }
    }
    
    // 更新用戶字段 Update user fields
    if (username) user.username = username;
    if (password) user.password = password; // 密碼會在模型的 beforeUpdate 鉤子中自動加密 Password will be automatically encrypted in the model's beforeUpdate hook
    if (name) user.name = name;
    if (email !== undefined) user.email = email;
    if (role) user.role = role;
    if (is_active !== undefined) user.is_active = is_active;
    
    // 保存用戶 Save user
    await user.save({ transaction });
    
    // 如果有部門，更新部門關聯 If departments are provided, update department relations
    if (departments && Array.isArray(departments)) {
      // 獲取部門 Get departments
      const deptRecords = await Department.findAll({
        where: { code: departments },
        transaction
      });
      
      // 設置部門關聯 Set department relations
      await user.setDepartments(deptRecords, { transaction });
    }
    
    // 提交事務 Commit transaction
    await transaction.commit();
    
    // 獲取更新後的用戶信息 Get updated user info
    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['password'] }, // 排除密碼字段 Exclude password field
      include: [
        {
          model: Department,
          as: 'departments',
          through: { attributes: [] } // 不包含中間表字段 Don't include junction table fields
        }
      ]
    });
    
    // 格式化用戶數據 Format user data
    const userData = updatedUser.toJSON();
    const formattedUser = {
      ...userData,
      status: userData.is_active ? 'active' : 'inactive', // 將 is_active 轉換為 status Format is_active as status
      departments: userData.departments.map(dept => dept.code) // 只返回部門代碼 Only return department codes
    };
    
    return res.status(200).json({
      success: true,
      message: '用戶更新成功 User updated successfully',
      data: formattedUser
    });
  } catch (error) {
    // 回滾事務 Rollback transaction
    await transaction.rollback();
    
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
    
    // 獲取用戶 Get user
    const user = await User.findByPk(id);
    
    // 如果用戶不存在，返回404 If user doesn't exist, return 404
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用戶不存在 User not found'
      });
    }
    
    // 刪除用戶 Delete user
    await user.destroy();
    
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

// 導出控制器方法 Export controller methods
module.exports = {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
}; 