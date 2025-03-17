// 導入依賴 Import dependencies
const express = require('express');
const teacherController = require('../controllers/teacher');
const { authenticate, authorize } = require('../middleware/auth');

// 創建路由器 Create router
const router = express.Router();

/**
 * @route   GET /api/teachers
 * @desc    獲取所有老師 Get all teachers
 * @access  Private (需要認證 Authentication required)
 */
router.get('/', authenticate, teacherController.getAllTeachers);

/**
 * @route   GET /api/teachers/:id
 * @desc    獲取單個老師 Get single teacher
 * @access  Private (需要認證 Authentication required)
 */
router.get('/:id', authenticate, teacherController.getTeacher);

/**
 * @route   POST /api/teachers
 * @desc    創建老師 Create teacher
 * @access  Private (需要認證 Authentication required)
 */
router.post('/', authenticate, teacherController.createTeacher);

/**
 * @route   PUT /api/teachers/:id
 * @desc    更新老師 Update teacher
 * @access  Private (需要認證 Authentication required)
 */
router.put('/:id', authenticate, teacherController.updateTeacher);

/**
 * @route   DELETE /api/teachers/:id
 * @desc    刪除老師 Delete teacher
 * @access  Private (需要認證 Authentication required)
 */
router.delete('/:id', authenticate, teacherController.deleteTeacher);

/**
 * @route   PUT /api/teachers/:id/toggle-status
 * @desc    切換老師狀態 Toggle teacher status
 * @access  Private (需要認證 Authentication required)
 */
router.put('/:id/toggle-status', authenticate, teacherController.toggleTeacherStatus);

// 導出路由器 Export router
module.exports = router; 