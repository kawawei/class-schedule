// 導入依賴 Import dependencies
const createTeacherModel = require('../models/teacher');

/**
 * 獲取所有老師 Get all teachers
 * @param {Object} req - 請求對象 Request object
 * @param {Object} res - 響應對象 Response object
 */
const getAllTeachers = async (req, res) => {
  try {
    // 獲取租戶的 Sequelize 實例 Get tenant's Sequelize instance
    const Teacher = createTeacherModel(req.tenantSequelize);
    
    // 獲取所有老師 Get all teachers
    const teachers = await Teacher.findAll({
      order: [['name', 'ASC']]
    });
    
    return res.status(200).json({
      success: true,
      message: '獲取老師列表成功 Get teachers list successfully',
      data: teachers
    });
  } catch (error) {
    console.error('獲取老師列表失敗 Failed to get teachers list:', error);
    return res.status(500).json({
      success: false,
      message: '獲取老師列表失敗 Failed to get teachers list',
      error: error.message
    });
  }
};

/**
 * 獲取單個老師 Get single teacher
 * @param {Object} req - 請求對象 Request object
 * @param {Object} res - 響應對象 Response object
 */
const getTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 獲取租戶的 Sequelize 實例 Get tenant's Sequelize instance
    const Teacher = createTeacherModel(req.tenantSequelize);
    
    // 獲取老師 Get teacher
    const teacher = await Teacher.findByPk(id);
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: '老師不存在 Teacher not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: '獲取老師成功 Get teacher successfully',
      data: teacher
    });
  } catch (error) {
    console.error('獲取老師失敗 Failed to get teacher:', error);
    return res.status(500).json({
      success: false,
      message: '獲取老師失敗 Failed to get teacher',
      error: error.message
    });
  }
};

/**
 * 創建老師 Create teacher
 * @param {Object} req - 請求對象 Request object
 * @param {Object} res - 響應對象 Response object
 */
const createTeacher = async (req, res) => {
  try {
    // 獲取租戶的 Sequelize 實例 Get tenant's Sequelize instance
    const Teacher = createTeacherModel(req.tenantSequelize);
    
    // 創建老師 Create teacher
    const teacher = await Teacher.create(req.body);
    
    return res.status(201).json({
      success: true,
      message: '創建老師成功 Create teacher successfully',
      data: teacher
    });
  } catch (error) {
    console.error('創建老師失敗 Failed to create teacher:', error);
    return res.status(500).json({
      success: false,
      message: '創建老師失敗 Failed to create teacher',
      error: error.message
    });
  }
};

/**
 * 更新老師 Update teacher
 * @param {Object} req - 請求對象 Request object
 * @param {Object} res - 響應對象 Response object
 */
const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 獲取租戶的 Sequelize 實例 Get tenant's Sequelize instance
    const Teacher = createTeacherModel(req.tenantSequelize);
    
    // 更新老師 Update teacher
    const [updated] = await Teacher.update(req.body, {
      where: { id }
    });
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: '老師不存在 Teacher not found'
      });
    }
    
    // 獲取更新後的老師 Get updated teacher
    const teacher = await Teacher.findByPk(id);
    
    return res.status(200).json({
      success: true,
      message: '更新老師成功 Update teacher successfully',
      data: teacher
    });
  } catch (error) {
    console.error('更新老師失敗 Failed to update teacher:', error);
    return res.status(500).json({
      success: false,
      message: '更新老師失敗 Failed to update teacher',
      error: error.message
    });
  }
};

/**
 * 刪除老師 Delete teacher
 * @param {Object} req - 請求對象 Request object
 * @param {Object} res - 響應對象 Response object
 */
const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 獲取租戶的 Sequelize 實例 Get tenant's Sequelize instance
    const Teacher = createTeacherModel(req.tenantSequelize);
    
    // 刪除老師 Delete teacher
    const deleted = await Teacher.destroy({
      where: { id }
    });
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: '老師不存在 Teacher not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: '刪除老師成功 Delete teacher successfully'
    });
  } catch (error) {
    console.error('刪除老師失敗 Failed to delete teacher:', error);
    return res.status(500).json({
      success: false,
      message: '刪除老師失敗 Failed to delete teacher',
      error: error.message
    });
  }
};

/**
 * 切換老師狀態 Toggle teacher status
 * @param {Object} req - 請求對象 Request object
 * @param {Object} res - 響應對象 Response object
 */
const toggleTeacherStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 獲取租戶的 Sequelize 實例 Get tenant's Sequelize instance
    const Teacher = createTeacherModel(req.tenantSequelize);
    
    // 獲取老師 Get teacher
    const teacher = await Teacher.findByPk(id);
    
    // 如果老師不存在，返回404 If teacher doesn't exist, return 404
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: '老師不存在 Teacher not found'
      });
    }
    
    // 切換狀態 Toggle status
    await teacher.update({
      is_active: !teacher.is_active
    });
    
    // 獲取更新後的老師 Get updated teacher
    const updatedTeacher = await Teacher.findByPk(id);
    
    return res.status(200).json({
      success: true,
      message: '切換老師狀態成功 Toggle teacher status successfully',
      data: updatedTeacher
    });
  } catch (error) {
    console.error('切換老師狀態失敗 Failed to toggle teacher status:', error);
    return res.status(500).json({
      success: false,
      message: '切換老師狀態失敗 Failed to toggle teacher status',
      error: error.message
    });
  }
};

// 導出控制器方法 Export controller methods
module.exports = {
  getAllTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  toggleTeacherStatus
}; 