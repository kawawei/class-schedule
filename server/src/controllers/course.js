// 導入依賴 Import dependencies
const Course = require('../models/course');
const { sequelize } = require('../../config/database');

/**
 * 獲取所有課程 Get all courses
 * @param {Object} req - 請求對象 Request object
 * @param {Object} res - 響應對象 Response object
 */
const getAllCourses = async (req, res) => {
  try {
    // 獲取查詢參數 Get query parameters
    const { status, search } = req.query;
    
    // 構建查詢條件 Build query conditions
    const where = {};
    
    // 添加過濾條件 Add filter conditions
    if (status !== undefined) {
      // 將字符串 "true"/"false" 轉換為布爾值 Convert string "true"/"false" to boolean
      where.is_active = status === 'true';
    }
    
    // 添加搜索條件 Add search condition
    if (search) {
      where.category = { [sequelize.Op.like]: `%${search}%` };
    }
    
    // 查詢課程列表 Query course list
    const courses = await Course.findAll({
      where,
      order: [['created_at', 'DESC']]
    });
    
    // 返回課程列表 Return course list
    return res.status(200).json({
      success: true,
      message: '獲取課程列表成功 Get course list successfully',
      data: courses
    });
  } catch (error) {
    console.error('獲取課程列表失敗 Failed to get course list:', error);
    return res.status(500).json({
      success: false,
      message: '獲取課程列表失敗 Failed to get course list',
      error: error.message
    });
  }
};

/**
 * 獲取課程 Get course
 * @param {Object} req - 請求對象 Request object
 * @param {Object} res - 響應對象 Response object
 */
const getCourse = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 查詢課程 Query course
    const course = await Course.findByPk(id);
    
    // 如果課程不存在，返回404 If course does not exist, return 404
    if (!course) {
      return res.status(404).json({
        success: false,
        message: '課程不存在 Course does not exist'
      });
    }
    
    // 返回課程信息 Return course information
    return res.status(200).json({
      success: true,
      message: '獲取課程成功 Get course successfully',
      data: course
    });
  } catch (error) {
    console.error('獲取課程失敗 Failed to get course:', error);
    return res.status(500).json({
      success: false,
      message: '獲取課程失敗 Failed to get course',
      error: error.message
    });
  }
};

/**
 * 創建課程 Create course
 * @param {Object} req - 請求對象 Request object
 * @param {Object} res - 響應對象 Response object
 */
const createCourse = async (req, res) => {
  try {
    console.log('收到創建課程請求 Received create course request:');
    console.log('請求體 Request body:', JSON.stringify(req.body));
    console.log('請求頭 Request headers:', JSON.stringify(req.headers));
    
    const { category, is_active } = req.body;
    
    // 檢查必填字段 Check required fields
    if (!category) {
      return res.status(400).json({
        success: false,
        message: '課程種類不能為空 Course category cannot be empty'
      });
    }
    
    // 創建課程 Create course
    const course = await Course.create({
      category,
      is_active: is_active === undefined ? true : is_active
    });
    
    console.log('課程創建成功 Course created successfully:', JSON.stringify(course));
    
    // 返回創建的課程 Return created course
    return res.status(201).json({
      success: true,
      message: '創建課程成功 Create course successfully',
      data: course
    });
  } catch (error) {
    console.error('創建課程失敗 Failed to create course:', error);
    return res.status(500).json({
      success: false,
      message: '創建課程失敗 Failed to create course',
      error: error.message
    });
  }
};

/**
 * 更新課程 Update course
 * @param {Object} req - 請求對象 Request object
 * @param {Object} res - 響應對象 Response object
 */
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, is_active } = req.body;
    
    // 查詢課程 Query course
    const course = await Course.findByPk(id);
    
    // 如果課程不存在，返回404 If course does not exist, return 404
    if (!course) {
      return res.status(404).json({
        success: false,
        message: '課程不存在 Course does not exist'
      });
    }
    
    // 檢查必填字段 Check required fields
    if (!category) {
      return res.status(400).json({
        success: false,
        message: '課程種類不能為空 Course category cannot be empty'
      });
    }
    
    // 更新課程 Update course
    await course.update({
      category,
      is_active: is_active !== undefined ? is_active : course.is_active
    });
    
    // 返回更新後的課程 Return updated course
    return res.status(200).json({
      success: true,
      message: '更新課程成功 Update course successfully',
      data: course
    });
  } catch (error) {
    console.error('更新課程失敗 Failed to update course:', error);
    return res.status(500).json({
      success: false,
      message: '更新課程失敗 Failed to update course',
      error: error.message
    });
  }
};

/**
 * 刪除課程 Delete course
 * @param {Object} req - 請求對象 Request object
 * @param {Object} res - 響應對象 Response object
 */
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 查詢課程 Query course
    const course = await Course.findByPk(id);
    
    // 如果課程不存在，返回404 If course does not exist, return 404
    if (!course) {
      return res.status(404).json({
        success: false,
        message: '課程不存在 Course does not exist'
      });
    }
    
    // 刪除課程 Delete course
    await course.destroy();
    
    // 返回成功信息 Return success message
    return res.status(200).json({
      success: true,
      message: '刪除課程成功 Delete course successfully'
    });
  } catch (error) {
    console.error('刪除課程失敗 Failed to delete course:', error);
    return res.status(500).json({
      success: false,
      message: '刪除課程失敗 Failed to delete course',
      error: error.message
    });
  }
};

/**
 * 切換課程狀態 Toggle course status
 * @param {Object} req - 請求對象 Request object
 * @param {Object} res - 響應對象 Response object
 */
const toggleCourseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 查詢課程 Query course
    const course = await Course.findByPk(id);
    
    // 如果課程不存在，返回404 If course does not exist, return 404
    if (!course) {
      return res.status(404).json({
        success: false,
        message: '課程不存在 Course does not exist'
      });
    }
    
    // 切換課程狀態 Toggle course status
    await course.update({
      is_active: !course.is_active
    });
    
    // 返回更新後的課程 Return updated course
    return res.status(200).json({
      success: true,
      message: '切換課程狀態成功 Toggle course status successfully',
      data: course
    });
  } catch (error) {
    console.error('切換課程狀態失敗 Failed to toggle course status:', error);
    return res.status(500).json({
      success: false,
      message: '切換課程狀態失敗 Failed to toggle course status',
      error: error.message
    });
  }
};

// 導出控制器方法 Export controller methods
module.exports = {
  getAllCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  toggleCourseStatus
}; 