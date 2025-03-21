// 導入必要的模組 Import necessary modules
const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// 課程路由 Course routes
// 所有路由都需要認證 All routes require authentication
router.use(authMiddleware);

// 獲取所有課程種類 Get all course categories
router.get('/', courseController.getAllCourses);

// 創建新課程種類 Create new course category
router.post('/', courseController.createCourse);

// 更新課程種類 Update course category
router.put('/:id', courseController.updateCourse);

// 刪除課程種類 Delete course category
router.delete('/:id', courseController.deleteCourse);

// 切換課程種類狀態 Toggle course category status
router.put('/:id/toggle-status', courseController.toggleCourseStatus);

// 導出路由 Export routes
module.exports = router; 