const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const validationMiddleware = require('../middlewares/validationMiddleware');

/**
 * 老師路由 Teacher Routes
 */

// 獲取所有老師 Get all teachers
router.get('/', authMiddleware, teacherController.getAllTeachers);

// 獲取單個老師 Get single teacher
router.get('/:id', authMiddleware, teacherController.getTeacher);

// 創建老師 Create teacher
router.post('/', authMiddleware, validationMiddleware.validateTeacher, teacherController.createTeacher);

// 更新老師 Update teacher
router.put('/:id', authMiddleware, validationMiddleware.validateTeacher, teacherController.updateTeacher);

// 刪除老師 Delete teacher
router.delete('/:id', authMiddleware, teacherController.deleteTeacher);

// 切換老師狀態 Toggle teacher status
router.put('/:id/toggle-status', authMiddleware, teacherController.toggleStatus);

module.exports = router; 