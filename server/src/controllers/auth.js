// 導入依賴 Import dependencies
const User = require('../models/user');
const { generateToken } = require('../utils/jwt');

/**
 * 用戶登入 User login
 * @param {Object} req - 請求對象 Request object
 * @param {Object} res - 響應對象 Response object
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 驗證請求數據 Validate request data
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用戶名和密碼為必填項 Username and password are required'
      });
    }
    
    // 查找用戶 Find user
    const user = await User.findOne({ where: { username } });
    
    // 如果用戶不存在，返回錯誤 If user doesn't exist, return error
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用戶名或密碼錯誤 Invalid username or password'
      });
    }
    
    // 驗證密碼 Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    // 如果密碼無效，返回錯誤 If password is invalid, return error
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '用戶名或密碼錯誤 Invalid username or password'
      });
    }
    
    // 如果用戶未啟用，返回錯誤 If user is not active, return error
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: '用戶已被禁用 User is disabled'
      });
    }
    
    // 更新最後登入時間 Update last login time
    user.last_login = new Date();
    await user.save();
    
    // 生成令牌 Generate token
    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role
    });
    
    // 返回用戶信息和令牌 Return user info and token
    return res.status(200).json({
      success: true,
      message: '登入成功 Login successful',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        }
      }
    });
  } catch (error) {
    console.error('登入錯誤 Login error:', error);
    return res.status(500).json({
      success: false,
      message: '服務器錯誤 Server error'
    });
  }
};

/**
 * 獲取當前用戶信息 Get current user info
 * @param {Object} req - 請求對象 Request object
 * @param {Object} res - 響應對象 Response object
 */
const getCurrentUser = async (req, res) => {
  try {
    // 從請求對象中獲取用戶信息 Get user info from request object
    const user = req.user;
    
    // 返回用戶信息 Return user info
    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        last_login: user.last_login
      }
    });
  } catch (error) {
    console.error('獲取用戶信息錯誤 Get user info error:', error);
    return res.status(500).json({
      success: false,
      message: '服務器錯誤 Server error'
    });
  }
};

/**
 * 用戶登出 User logout
 * @param {Object} req - 請求對象 Request object
 * @param {Object} res - 響應對象 Response object
 */
const logout = (req, res) => {
  // 在客戶端，用戶應該刪除存儲的令牌 On client side, user should delete stored token
  return res.status(200).json({
    success: true,
    message: '登出成功 Logout successful'
  });
};

/**
 * 重置密碼 Reset password
 * @param {Object} req - 請求對象 Request object
 * @param {Object} res - 響應對象 Response object
 */
const resetPassword = async (req, res) => {
  try {
    const { username, newPassword } = req.body;
    
    // 驗證請求數據 Validate request data
    if (!username || !newPassword) {
      return res.status(400).json({
        success: false,
        message: '用戶名和新密碼為必填項 Username and new password are required'
      });
    }
    
    // 查找用戶 Find user
    const user = await User.findOne({ where: { username } });
    
    // 如果用戶不存在，返回錯誤 If user doesn't exist, return error
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用戶不存在 User not found'
      });
    }
    
    // 更新密碼 Update password
    user.password = newPassword;
    await user.save();
    
    // 返回成功信息 Return success message
    return res.status(200).json({
      success: true,
      message: '密碼重置成功 Password reset successful'
    });
  } catch (error) {
    console.error('重置密碼錯誤 Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: '服務器錯誤 Server error'
    });
  }
};

// 導出控制器 Export controllers
module.exports = {
  login,
  getCurrentUser,
  logout,
  resetPassword
}; 