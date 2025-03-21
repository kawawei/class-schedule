const Course = require('../models/course');

const courseController = {
  // 獲取所有課程種類 Get all course categories
  async getAllCourses(req, res) {
    const requestId = Math.random().toString(36).substring(7);
    const startTime = new Date();
    
    try {
      console.log(`[${startTime.toISOString()}] [Request ${requestId}] 開始獲取課程列表 Start getting course list:`, {
        user: req.user,
        method: req.method,
        url: req.originalUrl
      });

      const courses = await Course.findAll({
        order: [['createdAt', 'DESC']]
      });

      const endTime = new Date();
      console.log(`[${endTime.toISOString()}] [Request ${requestId}] 成功獲取課程列表 Successfully got course list:`, {
        totalCourses: courses.length,
        processingTime: endTime - startTime
      });

      res.json({
        success: true,
        data: courses
      });
    } catch (error) {
      const endTime = new Date();
      console.error(`[${endTime.toISOString()}] [Request ${requestId}] 獲取課程列表失敗 Failed to get course list:`, {
        error: {
          message: error.message,
          stack: error.stack,
          code: error.code,
          name: error.name
        },
        processingTime: endTime - startTime
      });
      
      res.status(500).json({
        success: false,
        message: '獲取課程列表失敗 Failed to get course list',
        error: error.message
      });
    }
  },

  // 創建新課程種類 Create new course category
  async createCourse(req, res) {
    const requestId = Math.random().toString(36).substring(7);
    const startTime = new Date();
    
    try {
      const { category, is_active = true } = req.body;
      
      console.log(`[${startTime.toISOString()}] [Request ${requestId}] 開始創建課程種類 Start creating course category:`, {
        category,
        is_active,
        user: req.user,
        method: req.method,
        url: req.originalUrl
      });

      // 檢查課程種類是否已存在 Check if course category already exists
      const existingCourse = await Course.findOne({ where: { category } });
      if (existingCourse) {
        const endTime = new Date();
        console.log(`[${endTime.toISOString()}] [Request ${requestId}] 課程種類已存在 Course category already exists:`, {
          category,
          processingTime: endTime - startTime
        });
        return res.status(400).json({
          success: false,
          message: '課程種類已存在 Course category already exists'
        });
      }

      const course = await Course.create({
        category,
        is_active
      });

      const endTime = new Date();
      console.log(`[${endTime.toISOString()}] [Request ${requestId}] 成功創建課程種類 Successfully created course category:`, {
        course: {
          id: course.id,
          category: course.category,
          is_active: course.is_active,
          createdAt: course.createdAt,
          updatedAt: course.updatedAt
        },
        processingTime: endTime - startTime
      });

      res.status(201).json({
        success: true,
        message: '課程種類創建成功 Course category created successfully',
        data: course
      });
    } catch (error) {
      const endTime = new Date();
      console.error(`[${endTime.toISOString()}] [Request ${requestId}] 創建課程種類失敗 Failed to create course category:`, {
        error: {
          message: error.message,
          stack: error.stack,
          code: error.code,
          name: error.name
        },
        body: req.body,
        processingTime: endTime - startTime
      });
      
      res.status(500).json({
        success: false,
        message: '創建課程種類失敗 Failed to create course category',
        error: error.message
      });
    }
  },

  // 更新課程種類 Update course category
  async updateCourse(req, res) {
    const requestId = Math.random().toString(36).substring(7);
    const startTime = new Date();
    
    try {
      const { id } = req.params;
      const { category, is_active } = req.body;
      
      console.log(`[${startTime.toISOString()}] [Request ${requestId}] 開始更新課程種類 Start updating course category:`, {
        id,
        category,
        is_active,
        user: req.user,
        method: req.method,
        url: req.originalUrl
      });

      // 檢查課程是否存在 Check if course exists
      const course = await Course.findByPk(id);
      if (!course) {
        const endTime = new Date();
        console.log(`[${endTime.toISOString()}] [Request ${requestId}] 課程種類不存在 Course category does not exist:`, {
          id,
          processingTime: endTime - startTime
        });
        return res.status(404).json({
          success: false,
          message: '課程種類不存在 Course category does not exist'
        });
      }

      // 如果更新類別名稱，檢查是否已存在 If updating category name, check if it already exists
      if (category && category !== course.category) {
        const existingCourse = await Course.findOne({ where: { category } });
        if (existingCourse) {
          const endTime = new Date();
          console.log(`[${endTime.toISOString()}] [Request ${requestId}] 課程種類已存在 Course category already exists:`, {
            category,
            processingTime: endTime - startTime
          });
          return res.status(400).json({
            success: false,
            message: '課程種類已存在 Course category already exists'
          });
        }
      }

      // 更新課程種類 Update course category
      await course.update({
        category: category || course.category,
        is_active: is_active !== undefined ? is_active : course.is_active
      });

      const endTime = new Date();
      console.log(`[${endTime.toISOString()}] [Request ${requestId}] 成功更新課程種類 Successfully updated course category:`, {
        course: {
          id: course.id,
          category: course.category,
          is_active: course.is_active,
          updatedAt: course.updatedAt
        },
        processingTime: endTime - startTime
      });

      res.json({
        success: true,
        message: '課程種類更新成功 Course category updated successfully',
        data: course
      });
    } catch (error) {
      const endTime = new Date();
      console.error(`[${endTime.toISOString()}] [Request ${requestId}] 更新課程種類失敗 Failed to update course category:`, {
        error: {
          message: error.message,
          stack: error.stack,
          code: error.code,
          name: error.name
        },
        params: req.params,
        body: req.body,
        processingTime: endTime - startTime
      });
      
      res.status(500).json({
        success: false,
        message: '更新課程種類失敗 Failed to update course category',
        error: error.message
      });
    }
  },

  // 刪除課程種類 Delete course category
  async deleteCourse(req, res) {
    const requestId = Math.random().toString(36).substring(7);
    const startTime = new Date();
    
    try {
      const { id } = req.params;
      
      console.log(`[${startTime.toISOString()}] [Request ${requestId}] 開始刪除課程種類 Start deleting course category:`, {
        id,
        params: req.params,
        headers: req.headers,
        user: req.user,
        method: req.method,
        url: req.originalUrl
      });

      // 檢查課程是否存在 Check if course exists
      const course = await Course.findByPk(id);
      if (!course) {
        const endTime = new Date();
        console.log(`[${endTime.toISOString()}] [Request ${requestId}] 課程種類不存在 Course category does not exist:`, {
          id,
          params: req.params,
          processingTime: endTime - startTime
        });
        return res.status(404).json({
          success: false,
          message: '課程種類不存在 Course category does not exist'
        });
      }

      // 記錄要刪除的課程信息 Log course information before deletion
      console.log(`[${new Date().toISOString()}] [Request ${requestId}] 準備刪除課程種類 Prepare to delete course category:`, {
        course: {
          id: course.id,
          category: course.category,
          is_active: course.is_active,
          createdAt: course.createdAt,
          updatedAt: course.updatedAt
        }
      });

      // 刪除課程種類 Delete course category
      await course.destroy();

      const endTime = new Date();
      console.log(`[${endTime.toISOString()}] [Request ${requestId}] 成功刪除課程種類 Successfully deleted course category:`, {
        id,
        category: course.category,
        processingTime: endTime - startTime
      });

      res.json({
        success: true,
        message: '課程種類刪除成功 Course category deleted successfully',
        data: {
          id: course.id,
          category: course.category,
          deletedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      const endTime = new Date();
      console.error(`[${endTime.toISOString()}] [Request ${requestId}] 刪除課程種類失敗 Failed to delete course category:`, {
        error: {
          message: error.message,
          stack: error.stack,
          code: error.code,
          name: error.name
        },
        params: req.params,
        headers: req.headers,
        user: req.user,
        processingTime: endTime - startTime
      });
      
      res.status(500).json({
        success: false,
        message: '刪除課程種類失敗 Failed to delete course category',
        error: error.message
      });
    }
  },

  // 切換課程種類狀態 Toggle course category status
  async toggleCourseStatus(req, res) {
    const requestId = Math.random().toString(36).substring(7);
    const startTime = new Date();
    
    try {
      const { id } = req.params;
      
      console.log(`[${startTime.toISOString()}] [Request ${requestId}] 開始切換課程狀態 Start toggling course status:`, {
        id,
        params: req.params,
        user: req.user,
        method: req.method,
        url: req.originalUrl
      });

      // 檢查課程是否存在 Check if course exists
      const course = await Course.findByPk(id);
      if (!course) {
        const endTime = new Date();
        console.log(`[${endTime.toISOString()}] [Request ${requestId}] 課程種類不存在 Course category does not exist:`, {
          id,
          processingTime: endTime - startTime
        });
        return res.status(404).json({
          success: false,
          message: '課程種類不存在 Course category does not exist'
        });
      }

      // 切換課程狀態 Toggle course status
      await course.update({
        is_active: !course.is_active
      });

      const endTime = new Date();
      console.log(`[${endTime.toISOString()}] [Request ${requestId}] 成功切換課程狀態 Successfully toggled course status:`, {
        course: {
          id: course.id,
          category: course.category,
          is_active: course.is_active,
          updatedAt: course.updatedAt
        },
        processingTime: endTime - startTime
      });

      res.json({
        success: true,
        message: '課程狀態更新成功 Course status updated successfully',
        data: course
      });
    } catch (error) {
      const endTime = new Date();
      console.error(`[${endTime.toISOString()}] [Request ${requestId}] 切換課程狀態失敗 Failed to toggle course status:`, {
        error: {
          message: error.message,
          stack: error.stack,
          code: error.code,
          name: error.name
        },
        params: req.params,
        processingTime: endTime - startTime
      });
      
      res.status(500).json({
        success: false,
        message: '切換課程狀態失敗 Failed to toggle course status',
        error: error.message
      });
    }
  }
};

module.exports = courseController; 