// 導入依賴 Import dependencies
const Teacher = require('../models/teacher');

/**
 * 獲取所有老師 Get all teachers
 * @param {Object} req - 請求對象 Request object
 * @param {Object} res - 響應對象 Response object
 */
const getAllTeachers = async (req, res) => {
  try {
    // 從請求頭或用戶對象中獲取部門ID Get department ID from request header or user object
    const departmentId = req.headers['x-department-id'] || req.user.departmentId;
    if (!departmentId) {
      return res.status(400).json({
        success: false,
        message: '缺少部門ID Missing department ID'
      });
    }

    // 獲取所有老師 Get all teachers
    const teachers = await Teacher.findAll({
      where: { department_id: departmentId },
      order: [['id', 'ASC']]
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
    const departmentId = req.user.departmentId;
    
    if (!departmentId) {
      return res.status(400).json({
        success: false,
        message: '缺少部門ID Missing department ID'
      });
    }
    
    // 獲取老師 Get teacher
    const teacher = await Teacher.findOne({
      where: {
        id,
        department_id: departmentId
      }
    });
    
    // 如果老師不存在，返回404 If teacher doesn't exist, return 404
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
    // 從請求中獲取部門ID Get department ID from request
    const departmentId = req.user.departmentId;
    if (!departmentId) {
      return res.status(400).json({
        success: false,
        message: '缺少部門ID Missing department ID'
      });
    }

    const {
      name,
      phone,
      line_id,
      email,
      county,
      district,
      address,
      teaching_categories,
      level,
      years_of_experience,
      specialty,
      hourly_rate,
      emergency_contact_name,
      emergency_contact_relation,
      emergency_contact_phone,
      notes,
      is_active
    } = req.body;
    
    // 驗證必填字段 Validate required fields
    if (!name || !phone || !teaching_categories || !level || !specialty || !hourly_rate || !county || !district || years_of_experience === undefined) {
      return res.status(400).json({
        success: false,
        message: '缺少必填字段 Missing required fields'
      });
    }
    
    // 創建老師 Create teacher
    const teacher = await Teacher.create({
      name,
      phone,
      line_id,
      email,
      county,
      district,
      address,
      teaching_categories,
      level,
      years_of_experience,
      specialty,
      hourly_rate,
      emergency_contact_name,
      emergency_contact_relation,
      emergency_contact_phone,
      notes,
      is_active: is_active !== undefined ? is_active : true,
      department_id: departmentId
    });
    
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
    const departmentId = req.user.departmentId;
    
    if (!departmentId) {
      return res.status(400).json({
        success: false,
        message: '缺少部門ID Missing department ID'
      });
    }
    
    const {
      name,
      phone,
      line_id,
      email,
      county,
      district,
      address,
      teaching_categories,
      level,
      years_of_experience,
      specialty,
      hourly_rate,
      emergency_contact_name,
      emergency_contact_relation,
      emergency_contact_phone,
      notes,
      is_active
    } = req.body;
    
    // 獲取老師 Get teacher
    const teacher = await Teacher.findOne({
      where: {
        id,
        department_id: departmentId
      }
    });
    
    // 如果老師不存在，返回404 If teacher doesn't exist, return 404
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: '老師不存在 Teacher not found'
      });
    }
    
    // 驗證必填字段 Validate required fields
    if (!name || !phone || !teaching_categories || !level || !specialty || !hourly_rate || !county || !district || years_of_experience === undefined) {
      return res.status(400).json({
        success: false,
        message: '缺少必填字段 Missing required fields'
      });
    }
    
    // 更新老師 Update teacher
    await teacher.update({
      name: name || teacher.name,
      phone: phone || teacher.phone,
      line_id: line_id !== undefined ? line_id : teacher.line_id,
      email: email !== undefined ? email : teacher.email,
      county: county !== undefined ? county : teacher.county,
      district: district !== undefined ? district : teacher.district,
      address: address !== undefined ? address : teacher.address,
      teaching_categories: teaching_categories || teacher.teaching_categories,
      level: level || teacher.level,
      years_of_experience: years_of_experience !== undefined ? years_of_experience : teacher.years_of_experience,
      specialty: specialty || teacher.specialty,
      hourly_rate: hourly_rate !== undefined ? hourly_rate : teacher.hourly_rate,
      emergency_contact_name: emergency_contact_name !== undefined ? emergency_contact_name : teacher.emergency_contact_name,
      emergency_contact_relation: emergency_contact_relation !== undefined ? emergency_contact_relation : teacher.emergency_contact_relation,
      emergency_contact_phone: emergency_contact_phone !== undefined ? emergency_contact_phone : teacher.emergency_contact_phone,
      notes: notes !== undefined ? notes : teacher.notes,
      is_active: is_active !== undefined ? is_active : teacher.is_active
    });
    
    // 獲取更新後的老師 Get updated teacher
    const updatedTeacher = await Teacher.findOne({
      where: {
        id,
        department_id: departmentId
      }
    });
    
    return res.status(200).json({
      success: true,
      message: '更新老師成功 Update teacher successfully',
      data: updatedTeacher
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
    const departmentId = req.user.departmentId;
    
    if (!departmentId) {
      return res.status(400).json({
        success: false,
        message: '缺少部門ID Missing department ID'
      });
    }
    
    // 獲取老師 Get teacher
    const teacher = await Teacher.findOne({
      where: {
        id,
        department_id: departmentId
      }
    });
    
    // 如果老師不存在，返回404 If teacher doesn't exist, return 404
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: '老師不存在 Teacher not found'
      });
    }
    
    // 刪除老師 Delete teacher
    await teacher.destroy();
    
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
    const departmentId = req.user.departmentId;
    
    if (!departmentId) {
      return res.status(400).json({
        success: false,
        message: '缺少部門ID Missing department ID'
      });
    }
    
    // 獲取老師 Get teacher
    const teacher = await Teacher.findOne({
      where: {
        id,
        department_id: departmentId
      }
    });
    
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
    const updatedTeacher = await Teacher.findOne({
      where: {
        id,
        department_id: departmentId
      }
    });
    
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