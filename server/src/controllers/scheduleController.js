const { CourseSchedule, CourseAssistant, Teacher } = require('../models');
const { ValidationError, Op } = require('sequelize');
const ApiError = require('../utils/apiError');
const { addDays, isWithinInterval, parseISO } = require('date-fns');
const { v4: uuidv4 } = require('uuid');  // 引入 UUID 生成函數
const { sequelize } = require('../models');

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
        attributes: [
          'id',
          'county',  // 添加縣市字段 Add county field
          'district',  // 添加區域字段 Add district field
          'school_name',
          'class_name',
          'course_type',
          'teacher_id',
          'date',
          'start_time',
          'end_time',
          'course_fee',
          'teacher_fee',
          'notes',
          'company_code',
          'is_recurring',
          'series_id',
          'recurring_days',
          'recurring_start_date',
          'recurring_end_date'
        ],
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
        attributes: [
          'id',
          'county',  // 添加縣市字段 Add county field
          'district',  // 添加區域字段 Add district field
          'school_name',
          'class_name',
          'course_type',
          'teacher_id',
          'date',
          'start_time',
          'end_time',
          'course_fee',
          'teacher_fee',
          'notes',
          'company_code',
          'is_recurring',
          'series_id',
          'recurring_days',
          'recurring_start_date',
          'recurring_end_date'
        ],
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
      
      // 處理待訂教師的情況 Handle pending teacher case
      if (scheduleData.teacher_id === "待訂 / Pending") {
        scheduleData.teacher_id = null;
      }
      
      // 檢查是否為重複性課程 Check if it's a recurring course
      if (scheduleData.is_recurring) {
        console.log('處理重複性課程創建');
        const createdSchedules = [];
        let currentDate = new Date(scheduleData.recurring_start_date);
        const endDate = new Date(scheduleData.recurring_end_date);
        
        // 生成系列ID Generate series ID
        const seriesId = uuidv4();
        console.log('生成的系列ID:', seriesId);
        
        // 檢查重複日期是否有時間衝突
        // Check for time conflicts in recurring dates
        while (currentDate <= endDate) {
          const dayOfWeek = currentDate.getDay();
          const frontendDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
          
          console.log(`日期: ${currentDate.toISOString().split('T')[0]}, 星期: ${dayOfWeek}, 前端星期: ${frontendDayOfWeek}, 是否包含: ${scheduleData.recurring_days.includes(frontendDayOfWeek)}`);
          
          if (scheduleData.recurring_days.includes(frontendDayOfWeek)) {
            console.log('檢查日期:', currentDate.toISOString().split('T')[0]);
            
            // 只有在有指定教師時才檢查時間衝突
            // Only check time conflicts if a teacher is specified
            if (scheduleData.teacher_id !== null) {
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
          }
          
          currentDate = addDays(currentDate, 1);
        }
        
        // 重置日期到開始日期 Reset date to start date
        currentDate = new Date(scheduleData.recurring_start_date);
        
        // 創建重複性課程 Create recurring courses
        while (currentDate <= endDate) {
          const dayOfWeek = currentDate.getDay();
          const frontendDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
          
          console.log(`日期: ${currentDate.toISOString().split('T')[0]}, 星期: ${dayOfWeek}, 前端星期: ${frontendDayOfWeek}, 是否包含: ${scheduleData.recurring_days.includes(frontendDayOfWeek)}`);
          
          if (scheduleData.recurring_days.includes(frontendDayOfWeek)) {
            console.log('創建課程:', currentDate.toISOString().split('T')[0]);
            
            // 創建課程排課，包含系列ID Create schedule with series ID
            const schedule = await CourseSchedule.create({
              ...scheduleData,
              series_id: seriesId,  // 添加系列ID Add series ID
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
        
        // 只有在有指定教師時才檢查時間衝突
        // Only check time conflicts if a teacher is specified
        if (scheduleData.teacher_id !== null) {
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
        }
        
        // 創建單一課程排課 Create single schedule
        console.log('創建單次課程');
        const schedule = await CourseSchedule.create({
          ...scheduleData,
          series_id: null,  // 單次課程設置 series_id 為 null Set series_id to null for single course
          company_code: companyCode,
          course_fee: scheduleData.course_fee || null,  // 允許空值 Allow null
          teacher_fee: scheduleData.teacher_fee || null,  // 允許空值 Allow null
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
      const { updateType = 'single', ...scheduleData } = req.body;
      const { companyCode } = req.user;

      console.log('接收到的更新請求 Update request received:', { id, scheduleData, updateType });

      // 檢查課程是否存在 Check if course exists
      const existingSchedule = await CourseSchedule.findOne({
        where: {
          id,
          company_code: companyCode
        }
      });

      if (!existingSchedule) {
        throw new ApiError(404, '課程不存在 Course does not exist');
      }

      // 準備更新數據 Prepare update data
      const updateData = {
        school_name: scheduleData.school_name,
        class_name: scheduleData.class_name,
        course_type: scheduleData.course_type,
        teacher_id: scheduleData.teacher_id,
        start_time: scheduleData.start_time,
        end_time: scheduleData.end_time,
        course_fee: scheduleData.course_fee || null,
        teacher_fee: scheduleData.teacher_fee || null,
        county: scheduleData.county,
        district: scheduleData.district,
        notes: scheduleData.notes
      };

      // 只有在單一更新時才更新日期 Only update date for single updates
      if (updateType === 'single' && scheduleData.date) {
        updateData.date = scheduleData.date;
      }

      // 根據更新類型執行不同的更新操作
      if (updateType === 'series' && existingSchedule.series_id) {
        // 更新整個系列的課程 Update all courses in the series
        console.log('更新系列課程，系列ID:', existingSchedule.series_id);
        
        // 檢查時間衝突 Check for time conflicts
        if (scheduleData.start_time && scheduleData.end_time) {
          const conflictingSchedule = await CourseSchedule.findOne({
            where: {
              id: { [Op.ne]: id },
              company_code: companyCode,
              teacher_id: scheduleData.teacher_id || existingSchedule.teacher_id,
              date: existingSchedule.date, // 使用當前課程的日期 Use current course's date
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

          if (conflictingSchedule) {
            throw new ApiError(400, '該時段已有其他課程安排 There is already a course scheduled for this time slot');
          }
        }

        // 更新所有相關課程 Update all related courses
        const [updatedCount, updatedSchedules] = await CourseSchedule.update(
          {
            ...updateData,
            updated_at: new Date()
          },
          {
            where: {
              series_id: existingSchedule.series_id,
              company_code: companyCode
            },
            returning: true
          }
        );

        // 更新助教排課 Update assistant schedules
        if (scheduleData.assistants) {
          // 刪除所有相關的助教記錄 Delete all related assistant records
          await CourseAssistant.destroy({
            where: {
              schedule_id: {
                [Op.in]: updatedSchedules.map(s => s.id)
              }
            }
          });

          // 創建新的助教排課 Create new assistant schedules
          if (scheduleData.assistants.length > 0) {
            const assistantSchedules = updatedSchedules.flatMap(schedule => 
              scheduleData.assistants.map(assistant => ({
                schedule_id: schedule.id,
                assistant_id: assistant.id,
                fee: assistant.fee,
                company_code: companyCode
              }))
            );

            await CourseAssistant.bulkCreate(assistantSchedules);
          }
        }

        console.log('系列課程更新成功 Series courses updated successfully');
        
        res.json({
          success: true,
          data: updatedSchedules,
          message: '系列課程更新成功 Series courses updated successfully'
        });
      } else {
        // 更新單一課程 Update single course
        console.log('更新單一課程，ID:', id);

        // 檢查時間衝突 Check for time conflicts
        if (scheduleData.date && scheduleData.start_time && scheduleData.end_time) {
          const conflictingSchedule = await CourseSchedule.findOne({
            where: {
              id: { [Op.ne]: id },
              company_code: companyCode,
              teacher_id: scheduleData.teacher_id || existingSchedule.teacher_id,
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

          if (conflictingSchedule) {
            throw new ApiError(400, '該時段已有其他課程安排 There is already a course scheduled for this time slot');
          }
        }

        // 更新單一課程 Update single course
        const [updatedCount, updatedSchedules] = await CourseSchedule.update(updateData, {
          where: {
            id,
            company_code: companyCode
          },
          returning: true
        });

        // 更新助教排課 Update assistant schedules
        if (scheduleData.assistants) {
          // 刪除原有的助教排課 Delete existing assistant schedules
          await CourseAssistant.destroy({
            where: { schedule_id: id }
          });

          // 創建新的助教排課 Create new assistant schedules
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

        console.log('單一課程更新成功 Single course updated successfully');
        
        res.json({
          success: true,
          data: updatedSchedules[0],
          message: '課程更新成功 Course updated successfully'
        });
      }
    } catch (error) {
      console.error('更新課程排課失敗 Failed to update schedule:', error);
      if (error instanceof ApiError) {
        next(error);
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
      const { type = 'single' } = req.query;
      const { companyCode } = req.user;
      
      console.log('刪除課程，參數:', { id, type, companyCode });
      
      const schedule = await CourseSchedule.findOne({
        where: {
          id,
          company_code: companyCode
        }
      });
      
      if (!schedule) {
        throw new ApiError(404, '找不到該課程排課 Schedule not found');
      }
      
      // 根據刪除類型執行不同的刪除操作
      // Execute different delete operations based on delete type
      if (type === 'series' && schedule.series_id) {
        // 刪除整個系列的課程 Delete all courses in the series
        console.log('刪除系列課程，系列ID:', schedule.series_id);
        
        // 先找到所有相關的課程 ID First find all related course IDs
        const relatedSchedules = await CourseSchedule.findAll({
          where: {
            series_id: schedule.series_id,
            company_code: companyCode
          },
          attributes: ['id']
        });
        
        const scheduleIds = relatedSchedules.map(s => s.id);
        
        // 先刪除所有相關的助教記錄 Delete all related assistant records first
        if (scheduleIds.length > 0) {
          await CourseAssistant.destroy({
            where: {
              schedule_id: {
                [Op.in]: scheduleIds
              }
            }
          });
        }
        
        // 然後刪除所有系列課程 Then delete all courses in the series
        const deleteResult = await CourseSchedule.destroy({
          where: {
            series_id: schedule.series_id,
            company_code: companyCode
          }
        });
        
        console.log('系列課程刪除結果:', deleteResult);
        
        res.json({
          success: true,
          message: '課程系列刪除成功 Course series deleted successfully'
        });
      } else {
        // 刪除單一課程 Delete single course
        console.log('刪除單一課程，ID:', id);
        
        // 先刪除相關的助教記錄 Delete related assistant records first
        await CourseAssistant.destroy({
          where: { schedule_id: id }
        });
        
        // 然後刪除課程 Then delete the course
        await schedule.destroy();
        
        res.json({
          success: true,
          message: '課程排課刪除成功 Schedule deleted successfully'
        });
      }
    } catch (error) {
      console.error('刪除課程排課失敗 Failed to delete schedule:', error);
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(new ApiError(500, '刪除課程排課失敗 Failed to delete schedule'));
      }
    }
  },

  /**
   * 更新課程日期 Update course date
   * @param {Object} req - 請求對象 Request object
   * @param {Object} res - 響應對象 Response object
   * @param {Function} next - 下一個中間件 Next middleware
   */
  updateCourseDate: async (req, res, next) => {
    const transaction = await sequelize.transaction();
    
    try {
      const { id } = req.params;
      const { date, isCopy } = req.body;
      const companyCode = req.user.companyCode;
      
      // 查找要更新的課程 Find the course to update
      const schedule = await CourseSchedule.findOne({
        where: {
          id,
          company_code: companyCode
        },
        transaction
      });
      
      if (!schedule) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: '找不到課程 Course not found'
        });
      }

      if (isCopy) {
        // 如果是複製操作，創建新的課程記錄
        // If copying, create a new course record
        const newSchedule = await CourseSchedule.create({
          ...schedule.toJSON(),
          id: undefined, // 讓數據庫自動生成新的 ID Let database generate new ID
          date: date, // 使用新的日期 Use new date
          series_id: schedule.series_id || uuidv4(), // 如果沒有 series_id，生成新的
          created_at: new Date(),
          updated_at: new Date()
        }, { transaction });

        // 複製助教信息 Copy assistant information
        const assistants = await CourseAssistant.findAll({
          where: { schedule_id: id },
          transaction
        });

        if (assistants.length > 0) {
          await CourseAssistant.bulkCreate(
            assistants.map(assistant => ({
              ...assistant.toJSON(),
              id: undefined,
              schedule_id: newSchedule.id,
              created_at: new Date(),
              updated_at: new Date()
            })),
            { transaction }
          );
        }

        await transaction.commit();
        
        return res.json({
          success: true,
          message: '課程複製成功 Course copied successfully',
          data: newSchedule
        });
      } else {
        // 如果是移動操作，只更新日期
        // If moving, only update the date
        const updatedSchedule = await schedule.update({
          date: date
        }, { transaction });

        await transaction.commit();
        
        return res.json({
          success: true,
          message: '課程日期更新成功 Course date updated successfully',
          data: updatedSchedule
        });
      }
    } catch (error) {
      await transaction.rollback();
      console.error('更新課程日期失敗 Failed to update course date:', error);
      next(new ApiError(500, '更新課程日期失敗 Failed to update course date'));
    }
  }
};

module.exports = scheduleController; 