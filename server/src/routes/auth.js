// 導入依賴 Import dependencies
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const authController = require('../controllers/auth');
const { authenticate } = require('../middleware/auth');
const { createSequelizeInstance } = require('../../config/database');
const { generateToken } = require('../utils/jwt');

/**
 * 創建認證路由 Create authentication routes
 * @param {Object} models - 數據模型 Data models
 * @returns {Object} Router 實例 Router instance
 */
const createAuthRoutes = (models) => {
  const router = express.Router();
  const { User } = models;

  /**
   * @route   POST /api/auth/register
   * @desc    註冊新用戶 Register new user
   * @access  Public
   */
  router.post('/register', async (req, res) => {
    try {
      const { username, password, company_code } = req.body;

      // 驗證必填字段 Validate required fields
      if (!username || !password || !company_code) {
        return res.status(400).json({
          success: false,
          message: '缺少必填字段 Missing required fields'
        });
      }

      // 創建租戶 schema Create tenant schema
      const schema = `tenant_${company_code.toLowerCase()}`;
      const tenantSequelize = createSequelizeInstance(schema);

      try {
        // 創建 schema Create schema
        await tenantSequelize.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
        
        // 初始化租戶表 Initialize tenant tables
        await tenantSequelize.sync();
        
        console.log(`Schema ${schema} 已創建 Schema created`);
      } catch (schemaError) {
        console.error(`創建 schema ${schema} 失敗 Failed to create schema:`, schemaError);
        throw schemaError;
      }

      // 檢查用戶名是否已存在於該租戶 Check if username exists in tenant
      const existingUser = await User.findOne({
        where: { 
          username,
          company_code
        }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: '用戶名已存在 Username already exists'
        });
      }

      // 創建用戶 Create user
      const user = await User.create({
        username,
        password,
        name: username,  // 使用用戶名作為默認姓名
        company_code,
        role: 'admin' // 第一個用戶設為管理員 Set first user as admin
      });

      // 生成 JWT 令牌 Generate JWT token
      const token = generateToken({
        id: user.id,
        username: user.username,
        role: user.role,
        company_code: user.company_code
      });

      // 返回成功響應 Return success response
      return res.status(201).json({
        success: true,
        message: '註冊成功 Registration successful',
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
            company_code: user.company_code
          }
        }
      });
    } catch (error) {
      console.error('註冊失敗 Registration failed:', error);
      return res.status(500).json({
        success: false,
        message: '註冊失敗 Registration failed',
        error: error.message
      });
    }
  });

  /**
   * @route   POST /api/auth/login
   * @desc    用戶登入 User login
   * @access  Public
   */
  router.post('/login', async (req, res) => {
    try {
      const { username, password, company_code } = req.body;

      // 檢查必要字段 Check required fields
      if (!username || !password || !company_code) {
        return res.status(400).json({
          success: false,
          message: '缺少必填字段 Missing required fields'
        });
      }

      // 查找用戶 Find user
      const user = await User.findOne({
        where: { 
          username,
          company_code
        }
      });

      // 檢查用戶是否存在 Check if user exists
      if (!user) {
        return res.status(401).json({
          success: false,
          message: '用戶名或密碼錯誤 Invalid username or password'
        });
      }

      // 驗證密碼 Validate password
      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: '用戶名或密碼錯誤 Invalid username or password'
        });
      }

      // 更新最後登入時間 Update last login time
      await user.update({ last_login: new Date() });

      // 生成 JWT token Generate JWT token
      const token = generateToken({
        id: user.id,
        username: user.username,
        role: user.role,
        company_code: user.company_code
      });

      res.json({
        success: true,
        message: '登入成功 Login successful',
        data: {
          user: {
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            role: user.role,
            company_code: user.company_code
          },
          token
        }
      });
    } catch (error) {
      console.error('登入失敗 Login failed:', error);
      res.status(500).json({
        success: false,
        message: '登入失敗 Login failed',
        error: error.message
      });
    }
  });

  /**
   * @route   GET /api/auth/me
   * @desc    獲取當前用戶信息 Get current user info
   * @access  Private
   */
  router.get('/me', authenticate, authController.getCurrentUser);

  /**
   * @route   POST /api/auth/logout
   * @desc    用戶登出 User logout
   * @access  Private
   */
  router.post('/logout', authenticate, authController.logout);

  /**
   * @route   POST /api/auth/reset-password
   * @desc    重置密碼 Reset password
   * @access  Public (臨時公開，實際應用中應該是私有的 Temporarily public, should be private in production)
   */
  router.post('/reset-password', authController.resetPassword);

  return router;
};

// 導出路由創建函數 Export route creation function
module.exports = createAuthRoutes; 