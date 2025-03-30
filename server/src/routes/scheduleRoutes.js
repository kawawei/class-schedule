const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const validationMiddleware = require('../middlewares/validationMiddleware');

/**
 * 課程排課路由 Schedule Routes
 */

// 獲取所有課程排課 Get all schedules
router.get('/', authMiddleware, scheduleController.getAllSchedules);

// 創建課程排課 Create schedule
router.post('/', authMiddleware, scheduleController.createSchedule);

// 更新課程排課 Update schedule
router.put('/:id', authMiddleware, scheduleController.updateSchedule);

// 刪除課程排課 Delete schedule
router.delete('/:id', authMiddleware, scheduleController.deleteSchedule);

module.exports = router; 