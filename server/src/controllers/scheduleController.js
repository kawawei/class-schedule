const { CourseSchedule, CourseAssistant, Teacher } = require('../models');
const { ValidationError, Op } = require('sequelize');
const ApiError = require('../utils/apiError');
const { addDays, isWithinInterval, parseISO } = require('date-fns');

/**
 * 課程排課控制器 Schedule Controller
 */
const scheduleController = {
  /**
   * 獲取所有課程排課 Get all schedules
   * @param {Object} req - 請求對象 Request object
   * @param {Object} res - 響應對象 Response object
   * @param {Function} next - 下一個中間件 Next middleware
   */
  getAllSchedules: async (req, res, next) => {
    try {
      const { companyCode } = req.user;
      const { startDate, endDate } = req.query;
      
      // 構建查詢條件 Build query conditions
      const where = {
        company_code: companyCode
      };
      
      // 如果有日期範圍，添加到查詢條件 Add date range to query if provided
      if (startDate && endDate) {
        where.date = {
          [Op.between]: [startDate, endDate]
        };
      }
      
      // 獲取課程排課列表，包含教師和助教信息
      // Get schedule list with teacher and assistant information
      const schedules = await CourseSchedule.findAll({
        where,
        include: [
          {
            model: Teacher,
            attributes: ['id', 'name'],
            as: 'teacher'
          },
          {
            model: CourseAssistant,
            as: 'assistants',
            attributes: ['id', 'assistant_id', 'fee']
          }
        ],
        order: [['date', 'ASC'], ['start_time', 'ASC']]
      });
      
      res.json({
        success: true,
        data: schedules.map(schedule => schedule.get({ plain: true }))
      });
    } catch (error) {
      console.error('獲取課程排課列表失敗 Failed to get schedules:', error);
      next(new ApiError(500, '獲取課程排課列表失敗 Failed to get schedules'));
    }
  },

  /**
   * 獲取單個課程排課 Get single schedule
   * @param {Object} req - 請求對象 Request object
   * @param {Object} res - 響應對象 Response object
   * @param {Function} next - 下一個中間件 Next middleware
   */
  getSchedule: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { companyCode } = req.user;
      
      // 獲取課程排課，包含教師和助教信息
      // Get schedule with teacher and assistant information
      const schedule = await CourseSchedule.findOne({
        where: { 
          id,
          company_code: companyCode
        },
        include: [
          {
            model: Teacher,
            attributes: ['id', 'name'],
            as: 'teacher'
          },
          {
            model: CourseAssistant,
            as: 'assistants',
            attributes: ['id', 'assistant_id', 'fee']
          }
        ]
      });
      
      if (!schedule) {
        throw new ApiError(404, '找不到該課程排課 Schedule not found');
      }
      
      res.json({
        success: true,
        data: schedule.get({ plain: true })
      });
    } catch (error) {
      console.error('獲取課程排課失敗 Failed to get schedule:', error);
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(new ApiError(500, '獲取課程排課失敗 Failed to get schedule'));
      }
    }
  },

  /**
   * 創建課程排課 Create schedule
   * @param {Object} req - 請求對象 Request object
   * @param {Object} res - 響應對象 Response object
   * @param {Function} next - 下一個中間件 Next middleware
   */
  createSchedule: async (req, res, next) => {
    try {
      const { companyCode } = req.user;
      const scheduleData = req.body;
      
      console.log('接收到的課程數據:', scheduleData);
      
      // 檢查是否為重複性課程 Check if it's a recurring course
      if (scheduleData.is_recurring) {
        console.log('處理重複性課程創建');
        const createdSchedules = [];
        let currentDate = new Date(scheduleData.recurring_start_date);
        const endDate = new Date(scheduleData.recurring_end_date);
        
        // 檢查重複日期是否有時間衝突
        // Check for time conflicts in recurring dates
        while (currentDate <= endDate) {
          // 獲取當前日期的星期幾（0-6，0 表示週日）
          // Get the day of week for current date (0-6, 0 means Sunday)
          const dayOfWeek = currentDate.getDay();
          // 將 getDay() 返回值（0-6）轉換為前端的值（1-7）
          // Convert getDay() value (0-6) to frontend value (1-7, Monday to Sunday)
          const frontendDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
          
          console.log(`日期: ${currentDate.toISOString().split('T')[0]}, 星期: ${dayOfWeek}, 前端星期: ${frontendDayOfWeek}, 是否包含: ${scheduleData.recurring_days.includes(frontendDayOfWeek)}`);
          
          if (scheduleData.recurring_days.includes(frontendDayOfWeek)) {
            console.log('檢查日期:', currentDate.toISOString().split('T')[0]);
            
            // 檢查該日期是否有時間衝突
            // Check for time conflicts on this date
            const existingSchedule = await CourseSchedule.findOne({
              where: {
                start_time: {
                  [Op.between]: [scheduleData.start_time, scheduleData.end_time]
                },
                company_code: companyCode,
                teacher_id: scheduleData.teacher_id,
                date: currentDate.toISOString().split('T')[0]
              }
            });
            
            if (existingSchedule) {
              return res.status(400).json({
                success: false,
                message: `在 ${currentDate.toISOString().split('T')[0]} 已有課程安排 Course already scheduled on ${currentDate.toISOString().split('T')[0]}`
              });
            }
          }
          
          currentDate = addDays(currentDate, 1);
        }
        
        // 重置日期到開始日期 Reset date to start date
        currentDate = new Date(scheduleData.recurring_start_date);
        
        // 創建重複性課程 Create recurring courses
        while (currentDate <= endDate) {
          // 獲取當前日期的星期幾（0-6，0 表示週日）
          // Get the day of week for current date (0-6, 0 means Sunday)
          const dayOfWeek = currentDate.getDay();
          // 將 getDay() 返回值（0-6）轉換為前端的值（1-7）
          // Convert getDay() value (0-6) to frontend value (1-7, Monday to Sunday)
          const frontendDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
          
          console.log(`日期: ${currentDate.toISOString().split('T')[0]}, 星期: ${dayOfWeek}, 前端星期: ${frontendDayOfWeek}, 是否包含: ${scheduleData.recurring_days.includes(frontendDayOfWeek)}`);
          
          if (scheduleData.recurring_days.includes(frontendDayOfWeek)) {
            console.log('創建課程:', currentDate.toISOString().split('T')[0]);
            
            // 創建課程排課 Create schedule
            const schedule = await CourseSchedule.create({
              ...scheduleData,
              date: currentDate.toISOString().split('T')[0],
              company_code: companyCode
            });
            
            // 如果有助教，創建助教排課 Create assistant schedules if any
            if (scheduleData.assistants && scheduleData.assistants.length > 0) {
              const assistantSchedules = scheduleData.assistants.map(assistant => ({
                schedule_id: schedule.id,
                assistant_id: assistant.id,
                fee: assistant.fee,
                company_code: companyCode
              }));
              
              await CourseAssistant.bulkCreate(assistantSchedules);
            }
            
            createdSchedules.push(schedule);
          }
          
          currentDate = addDays(currentDate, 1);
        }
        
        console.log('重複課程創建完成，總共創建:', createdSchedules.length);
        res.json({
          success: true,
          data: createdSchedules,
          message: '重複性課程排課創建成功 Recurring schedules created successfully'
        });
      } else {
        // 檢查單一課程是否有時間衝突
        // Check if single course has time conflicts
        console.log('處理單次課程創建');
        const existingSchedule = await CourseSchedule.findOne({
          where: {
            company_code: companyCode,
            teacher_id: scheduleData.teacher_id,
            date: scheduleData.date,
            [Op.or]: [
              {
                start_time: {
                  [Op.between]: [scheduleData.start_time, scheduleData.end_time]
                }
              },
              {
                end_time: {
                  [Op.between]: [scheduleData.start_time, scheduleData.end_time]
                }
              }
            ]
          }
        });
        
        if (existingSchedule) {
          console.log('發現時間衝突:', existingSchedule.get({ plain: true }));
          throw new ApiError(400, '該時段已有課程安排 This time slot is already scheduled');
        }
        
        // 創建單一課程排課 Create single schedule
        console.log('創建單次課程');
        const schedule = await CourseSchedule.create({
          ...scheduleData,
          company_code: companyCode
        });
        
        // 如果有助教，創建助教排課 Create assistant schedules if any
        if (scheduleData.assistants && scheduleData.assistants.length > 0) {
          const assistantSchedules = scheduleData.assistants.map(assistant => ({
            schedule_id: schedule.id,
            assistant_id: assistant.id,
            fee: assistant.fee,
            company_code: companyCode
          }));
          
          await CourseAssistant.bulkCreate(assistantSchedules);
        }
        
        console.log('單次課程創建完成');
        res.json({
          success: true,
          data: schedule,
          message: '課程排課創建成功 Schedule created successfully'
        });
      }
    } catch (error) {
      console.error('創建課程排課失敗 Failed to create schedule:', error);
      if (error instanceof ApiError) {
        next(error);
      } else if (error instanceof ValidationError) {
        next(new ApiError(400, '無效的課程排課數據 Invalid schedule data'));
      } else {
        next(new ApiError(500, '創建課程排課失敗 Failed to create schedule'));
      }
    }
  },

  /**
   * 更新課程排課 Update schedule
   * @param {Object} req - 請求對象 Request object
   * @param {Object} res - 響應對象 Response object
   * @param {Function} next - 下一個中間件 Next middleware
   */
  updateSchedule: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { companyCode } = req.user;
      const scheduleData = req.body;
      
      // 檢查課程排課是否存在 Check if schedule exists
      const schedule = await CourseSchedule.findOne({
        where: { 
          id,
          company_code: companyCode
        }
      });
      
      if (!schedule) {
        throw new ApiError(404, '找不到該課程排課 Schedule not found');
      }
      
      // 檢查是否有時段衝突 Check for time slot conflicts
      if (scheduleData.date || scheduleData.start_time || scheduleData.end_time) {
        const conflictSchedule = await CourseSchedule.findOne({
          where: {
            id: { [Op.ne]: id },
            company_code: companyCode,
            teacher_id: scheduleData.teacher_id || schedule.teacher_id,
            date: scheduleData.date || schedule.date,
            [Op.or]: [
              {
                start_time: {
                  [Op.between]: [
                    scheduleData.start_time || schedule.start_time,
                    scheduleData.end_time || schedule.end_time
                  ]
                }
              },
              {
                end_time: {
                  [Op.between]: [
                    scheduleData.start_time || schedule.start_time,
                    scheduleData.end_time || schedule.end_time
                  ]
                }
              }
            ]
          }
        });
        
        if (conflictSchedule) {
          throw new ApiError(400, '該時段已有課程安排 This time slot is already scheduled');
        }
      }
      
      // 更新課程排課 Update schedule
      await schedule.update(scheduleData);
      
      // 更新助教信息 Update assistant information
      if (scheduleData.assistants) {
        // 刪除現有助教 Delete existing assistants
        await CourseAssistant.destroy({
          where: {
            schedule_id: id,
            company_code: companyCode
          }
        });
        
        // 創建新助教 Create new assistants
        if (scheduleData.assistants.length > 0) {
          const assistantSchedules = scheduleData.assistants.map(assistant => ({
            schedule_id: id,
            assistant_id: assistant.id,
            fee: assistant.fee,
            company_code: companyCode
          }));
          
          await CourseAssistant.bulkCreate(assistantSchedules);
        }
      }
      
      res.json({
        success: true,
        data: schedule,
        message: '課程排課更新成功 Schedule updated successfully'
      });
    } catch (error) {
      console.error('更新課程排課失敗 Failed to update schedule:', error);
      if (error instanceof ApiError) {
        next(error);
      } else if (error instanceof ValidationError) {
        next(new ApiError(400, '無效的課程排課數據 Invalid schedule data'));
      } else {
        next(new ApiError(500, '更新課程排課失敗 Failed to update schedule'));
      }
    }
  },

  /**
   * 刪除課程排課 Delete schedule
   * @param {Object} req - 請求對象 Request object
   * @param {Object} res - 響應對象 Response object
   * @param {Function} next - 下一個中間件 Next middleware
   */
  deleteSchedule: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { companyCode } = req.user;
      
      // 檢查課程排課是否存在 Check if schedule exists
      const schedule = await CourseSchedule.findOne({
        where: { 
          id,
          company_code: companyCode
        }
      });
      
      if (!schedule) {
        throw new ApiError(404, '找不到該課程排課 Schedule not found');
      }
      
      // 刪除相關助教排課 Delete related assistant schedules
      await CourseAssistant.destroy({
        where: {
          schedule_id: id,
          company_code: companyCode
        }
      });
      
      // 刪除課程排課 Delete schedule
      await schedule.destroy();
      
      res.json({
        success: true,
        message: '課程排課刪除成功 Schedule deleted successfully'
      });
    } catch (error) {
      console.error('刪除課程排課失敗 Failed to delete schedule:', error);
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(new ApiError(500, '刪除課程排課失敗 Failed to delete schedule'));
      }
    }
  }
};

module.exports = scheduleController; 