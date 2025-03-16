// 導入依賴 Import dependencies
const Department = require('../models/department');

/**
 * 獲取所有部門 Get all departments
 * @param {Object} req - 請求對象 Request object
 * @param {Object} res - 響應對象 Response object
 */
const getAllDepartments = async (req, res) => {
  try {
    // 獲取所有啟用的部門 Get all active departments
    const departments = await Department.findAll({
      where: { is_active: true },
      order: [['name', 'ASC']]
    });
    
    return res.status(200).json({
      success: true,
      message: '獲取部門列表成功 Get departments list successfully',
      data: departments
    });
  } catch (error) {
    console.error('獲取部門列表失敗 Failed to get departments list:', error);
    return res.status(500).json({
      success: false,
      message: '獲取部門列表失敗 Failed to get departments list',
      error: error.message
    });
  }
};

/**
 * 獲取單個部門 Get single department
 * @param {Object} req - 請求對象 Request object
 * @param {Object} res - 響應對象 Response object
 */
const getDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 獲取部門 Get department
    const department = await Department.findByPk(id);
    
    // 如果部門不存在，返回404 If department doesn't exist, return 404
    if (!department) {
      return res.status(404).json({
        success: false,
        message: '部門不存在 Department not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: '獲取部門成功 Get department successfully',
      data: department
    });
  } catch (error) {
    console.error('獲取部門失敗 Failed to get department:', error);
    return res.status(500).json({
      success: false,
      message: '獲取部門失敗 Failed to get department',
      error: error.message
    });
  }
};

// 導出控制器方法 Export controller methods
module.exports = {
  getAllDepartments,
  getDepartment
}; 