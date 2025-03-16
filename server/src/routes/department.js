// 導入依賴 Import dependencies
const express = require('express');
const departmentController = require('../controllers/department');
const { authenticate, authorize } = require('../middleware/auth');

// 創建路由器 Create router
const router = express.Router();

/**
 * @route   GET /api/departments
 * @desc    獲取所有部門 Get all departments
 * @access  Private (需要認證 Authentication required)
 */
router.get('/', authenticate, departmentController.getAllDepartments);

/**
 * @route   GET /api/departments/:id
 * @desc    獲取單個部門 Get single department
 * @access  Private (需要認證 Authentication required)
 */
router.get('/:id', authenticate, departmentController.getDepartment);

// 導出路由器 Export router
module.exports = router; 