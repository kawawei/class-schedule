const { TeacherReport } = require('../models');
const { notifyAdmins } = require('./notificationController');

/**
 * 老師回報控制器
 * Teacher Report Controller
 */
const teacherReportController = {
  /**
   * 提交出發記錄
   * Submit departure record
   */
  submitDeparture: async (req, res) => {
    try {
      const { scheduleId, teacherId, departureTime, location, status } = req.body;
      const { companyCode } = req.user;
      
      // 創建出發記錄 Create departure record
      const report = await TeacherReport.create({
        scheduleId,
        teacherId,
        departureTime,
        departureLocation: location,
        status,
        companyCode
      });
      
      // 發送通知給管理員 Send notification to admins
      await notifyAdmins({
        type: 'teacher_departed',
        scheduleId,
        teacherId,
        departureTime,
        location
      });
      
      res.json({
        success: true,
        message: '出發記錄已提交',
        data: report
      });
    } catch (error) {
      console.error('提交出發記錄失敗:', error);
      res.status(500).json({
        success: false,
        message: '提交出發記錄失敗'
      });
    }
  },
  
  /**
   * 提交抵達記錄
   * Submit arrival record
   */
  submitArrival: async (req, res) => {
    try {
      const { scheduleId, teacherId, arrivalTime, location, materialsUsed } = req.body;
      
      // 更新報告記錄 Update report record
      const report = await TeacherReport.findOne({
        where: {
          schedule_id: scheduleId,
          teacher_id: teacherId
        }
      });
      
      if (!report) {
        throw new Error('找不到相關的出發記錄');
      }
      
      report.arrival_time = arrivalTime;
      report.arrival_location = location;
      report.materials_used = materialsUsed;
      report.status = 'arrived';
      await report.save();
      
      // 發送通知給管理員 Send notification to admins
      await notifyAdmins({
        type: 'teacher_arrived',
        scheduleId,
        teacherId,
        arrivalTime,
        location,
        materialsUsed
      });
      
      res.json({
        success: true,
        message: '抵達記錄已提交',
        data: report
      });
    } catch (error) {
      console.error('提交抵達記錄失敗:', error);
      res.status(500).json({
        success: false,
        message: error.message || '提交抵達記錄失敗'
      });
    }
  },
  
  /**
   * 獲取位置記錄
   * Get location records
   */
  getLocationRecords: async (req, res) => {
    try {
      const { scheduleId } = req.params;
      
      const report = await TeacherReport.findOne({
        where: {
          schedule_id: scheduleId
        }
      });
      
      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('獲取位置記錄失敗:', error);
      res.status(500).json({
        success: false,
        message: '獲取位置記錄失敗'
      });
    }
  }
};

module.exports = teacherReportController; 