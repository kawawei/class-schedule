// 導入依賴 Import dependencies
const express = require('express');
const courseController = require('../controllers/course');
const { authenticate, authorize } = require('../middleware/auth');

// 創建路由器 Create router
const router = express.Router();

/**
 * @route   GET /api/courses
 * @desc    獲取所有課程 Get all courses
 * @access  Private (需要認證 Authentication required)
 */
router.get('/', authenticate, courseController.getAllCourses);

/**
 * @route   GET /api/courses/:id
 * @desc    獲取單個課程 Get single course
 * @access  Private (需要認證 Authentication required)
 */
router.get('/:id', authenticate, courseController.getCourse);

/**
 * @route   POST /api/courses
 * @desc    創建課程 Create course
 * @access  Private (需要認證 Authentication required)
 */
router.post('/', authenticate, courseController.createCourse);

/**
 * @route   PUT /api/courses/:id
 * @desc    更新課程 Update course
 * @access  Private (需要認證 Authentication required)
 */
router.put('/:id', authenticate, courseController.updateCourse);

/**
 * @route   DELETE /api/courses/:id
 * @desc    刪除課程 Delete course
 * @access  Private (需要認證 Authentication required)
 */
router.delete('/:id', authenticate, courseController.deleteCourse);

/**
 * @route   PUT /api/courses/:id/toggle-status
 * @desc    切換課程狀態 Toggle course status
 * @access  Private (需要認證 Authentication required)
 */
router.put('/:id/toggle-status', authenticate, courseController.toggleCourseStatus);

// 導出路由器 Export router
module.exports = router; 