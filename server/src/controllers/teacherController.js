const { Teacher } = require('../models');
const { ValidationError, Op } = require('sequelize');
const ApiError = require('../utils/apiError');
const bcrypt = require('bcryptjs');
const { mainPool } = require('../config/database');

/**
 * 老師控制器 Teacher Controller
 */
const teacherController = {
  /**
   * 獲取所有老師 Get all teachers
   * @param {Object} req - 請求對象 Request object
   * @param {Object} res - 響應對象 Response object
   * @param {Function} next - 下一個中間件 Next middleware
   */
  getAllTeachers: async (req, res, next) => {
    try {
      const { companyCode } = req.user;
      
      const teachers = await Teacher.findAll({
        where: { company_code: companyCode },
        order: [['name', 'ASC']]
      });
      
      res.json({
        success: true,
        data: teachers
      });
    } catch (error) {
      console.error('獲取老師列表失敗 Failed to get teachers:', error);
      next(new ApiError(500, '獲取老師列表失敗 Failed to get teachers'));
    }
  },

  /**
   * 獲取單個老師 Get single teacher
   * @param {Object} req - 請求對象 Request object
   * @param {Object} res - 響應對象 Response object
   * @param {Function} next - 下一個中間件 Next middleware
   */
  getTeacher: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { companyCode } = req.user;
      
      // 查詢老師基本資料 Query teacher basic info
      const teacher = await Teacher.findOne({
        where: { 
          id,
          company_code: companyCode
        }
      });
      
      if (!teacher) {
        throw new ApiError(404, '找不到該老師 Teacher not found');
      }
      
      // 查詢帳號 Query username from users table
      const client = await mainPool.connect();
      let username = null;
      try {
        const userResult = await client.query(
          `SELECT username FROM "${companyCode}".users WHERE name = $1 AND role = 'teacher' LIMIT 1`,
          [teacher.name]
        );
        if (userResult.rows.length > 0) {
          username = userResult.rows[0].username;
        }
      } finally {
        client.release();
      }
      
      // 回傳時加上 username Add username to response
      const teacherData = teacher.toJSON ? teacher.toJSON() : teacher;
      teacherData.username = username;
      
      res.json({
        success: true,
        data: teacherData
      });
    } catch (error) {
      console.error('獲取老師失敗 Failed to get teacher:', error);
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(new ApiError(500, '獲取老師失敗 Failed to get teacher'));
      }
    }
  },

  /**
   * 創建老師 Create teacher
   * @param {Object} req - 請求對象 Request object
   * @param {Object} res - 響應對象 Response object
   * @param {Function} next - 下一個中間件 Next middleware
   */
  createTeacher: async (req, res, next) => {
    const client = await mainPool.connect();
    try {
      const { companyCode } = req.user;
      const { username, password, ...teacherData } = req.body;
      teacherData.company_code = companyCode;
      
      // 檢查電話是否已存在 Check if phone already exists
      const existingTeacher = await Teacher.findOne({
        where: { 
          phone: teacherData.phone,
          company_code: companyCode
        }
      });
      
      if (existingTeacher) {
        throw new ApiError(400, '該電話號碼已被使用 Phone number already in use');
      }

      // 檢查用戶名是否已存在 Check if username exists
      const existingUser = await client.query(
        `SELECT id FROM "${companyCode}".users WHERE username = $1`,
        [username]
      );
      
      if (existingUser.rows.length > 0) {
        throw new ApiError(400, '用戶名已被使用 Username already in use');
      }

      // 加密密碼 Encrypt password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // 開始事務處理 Start transaction
      await client.query('BEGIN');
      
      try {
        // 先建立用戶帳號 Create user account first
        const userInsertResult = await client.query(
          `INSERT INTO "${companyCode}".users (username, password, name, email, role, is_active)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id`,
          [username, hashedPassword, teacherData.name, teacherData.email || null, 'teacher', true]
        );
        const userId = userInsertResult.rows[0].id; // 取得 user.id Get user.id

        // 建立老師資料，寫入 user_id Create teacher and write user_id
        const teacher = await Teacher.create({ ...teacherData, user_id: userId });
        
        // 提交事務 Commit transaction
        await client.query('COMMIT');
        
        res.status(201).json({
          success: true,
          data: teacher,
          message: '老師創建成功 Teacher created successfully'
        });
      } catch (error) {
        // 如果出錯，回滾事務 Rollback transaction if error occurs
        await client.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('創建老師失敗 Failed to create teacher:', error);
      if (error instanceof ValidationError) {
        next(new ApiError(400, error.message));
      } else if (error instanceof ApiError) {
        next(error);
      } else {
        next(new ApiError(500, '創建老師失敗 Failed to create teacher'));
      }
    } finally {
      client.release();
    }
  },

  /**
   * 更新老師 Update teacher
   * @param {Object} req - 請求對象 Request object
   * @param {Object} res - 響應對象 Response object
   * @param {Function} next - 下一個中間件 Next middleware
   */
  updateTeacher: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { companyCode } = req.user;
      const updateData = req.body;
      
      // 檢查老師是否存在 Check if teacher exists
      const teacher = await Teacher.findOne({
        where: { 
          id,
          company_code: companyCode
        }
      });
      
      if (!teacher) {
        throw new ApiError(404, '找不到該老師 Teacher not found');
      }
      
      // 如果要更新電話，檢查是否與其他老師重複
      // If updating phone, check if it conflicts with other teachers
      if (updateData.phone && updateData.phone !== teacher.phone) {
        const existingTeacher = await Teacher.findOne({
          where: { 
            phone: updateData.phone,
            company_code: companyCode,
            id: { [Op.ne]: id }
          }
        });
        
        if (existingTeacher) {
          throw new ApiError(400, '該電話號碼已被使用 Phone number already in use');
        }
      }
      
      await teacher.update(updateData);
      
      res.json({
        success: true,
        data: teacher,
        message: '老師更新成功 Teacher updated successfully'
      });
    } catch (error) {
      console.error('更新老師失敗 Failed to update teacher:', error);
      if (error instanceof ValidationError) {
        next(new ApiError(400, error.message));
      } else if (error instanceof ApiError) {
        next(error);
      } else {
        next(new ApiError(500, '更新老師失敗 Failed to update teacher'));
      }
    }
  },

  /**
   * 刪除老師 Delete teacher
   * @param {Object} req - 請求對象 Request object
   * @param {Object} res - 響應對象 Response object
   * @param {Function} next - 下一個中間件 Next middleware
   */
  deleteTeacher: async (req, res, next) => {
    const client = await mainPool.connect();
    try {
      const { id } = req.params;
      const { companyCode } = req.user;
      
      // 查詢老師資料 Query teacher info
      const teacher = await Teacher.findOne({
        where: { 
          id,
          company_code: companyCode
        }
      });
      
      if (!teacher) {
        throw new ApiError(404, '找不到該老師 Teacher not found');
      }
      
      // 優先用 user_id 刪除帳號 Delete user by user_id first
      let userDeleteResult = null;
      if (teacher.user_id) {
        userDeleteResult = await client.query(
          `DELETE FROM "${companyCode}".users WHERE id = $1`,
          [teacher.user_id]
        );
      } else {
        // 若無 user_id，則用 name/email 查找刪除 If no user_id, delete by name/email
        userDeleteResult = await client.query(
          `DELETE FROM "${companyCode}".users WHERE name = $1 AND email = $2 AND role = 'teacher'`,
          [teacher.name, teacher.email]
        );
      }

      // 刪除老師資料 Delete teacher record
      await teacher.destroy();
      
      res.json({
        success: true,
        message: '老師及帳號刪除成功 Teacher and user deleted successfully'
      });
    } catch (error) {
      console.error('刪除老師失敗 Failed to delete teacher:', error);
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(new ApiError(500, '刪除老師失敗 Failed to delete teacher'));
      }
    } finally {
      client.release();
    }
  },

  /**
   * 切換老師狀態 Toggle teacher status
   * @param {Object} req - 請求對象 Request object
   * @param {Object} res - 響應對象 Response object
   * @param {Function} next - 下一個中間件 Next middleware
   */
  toggleStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { companyCode } = req.user;
      
      const teacher = await Teacher.findOne({
        where: { 
          id,
          company_code: companyCode
        }
      });
      
      if (!teacher) {
        throw new ApiError(404, '找不到該老師 Teacher not found');
      }
      
      await teacher.update({
        is_active: !teacher.is_active
      });
      
      res.json({
        success: true,
        data: {
          is_active: teacher.is_active
        },
        message: `老師狀態已${teacher.is_active ? '啟用' : '停用'} Teacher status ${teacher.is_active ? 'activated' : 'deactivated'}`
      });
    } catch (error) {
      console.error('切換老師狀態失敗 Failed to toggle teacher status:', error);
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(new ApiError(500, '切換老師狀態失敗 Failed to toggle teacher status'));
      }
    }
  }
};

module.exports = teacherController; 