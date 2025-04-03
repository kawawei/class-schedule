const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const teacherReportController = require('../controllers/teacherReportController');

// 提交出發記錄 Submit departure record
router.post('/departure', authMiddleware, teacherReportController.submitDeparture);

// 提交到達記錄 Submit arrival record
router.post('/arrival', authMiddleware, teacherReportController.submitArrival);

// 獲取位置記錄 Get location records
router.get('/:scheduleId', authMiddleware, teacherReportController.getLocationRecords);

module.exports = router; 