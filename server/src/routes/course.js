// 導入依賴 Import dependencies
const express = require('express');
const { authenticate } = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenant');

/**
 * 創建課程路由 Create course routes
 * @param {Object} models - 數據庫模型 Database models
 * @returns {Object} Router 實例 Router instance
 */
module.exports = (models) => {
  const router = express.Router();
  const { Course, Teacher } = models;

  // 使用中間件 Use middleware
  router.use(authenticate);
  router.use(tenantMiddleware);

  /**
   * 獲取所有課程 Get all courses
   * GET /api/courses
   * @private
   */
  router.get('/', async (req, res) => {
    try {
      const courses = await Course.findAll({
        include: [{
          model: Teacher,
          attributes: ['id', 'name']
        }],
        where: { is_active: true },
        order: [['name', 'ASC']]
      });

      res.json({
        success: true,
        data: courses
      });
    } catch (error) {
      console.error('獲取課程列表失敗 Failed to get courses:', error);
      res.status(500).json({
        success: false,
        message: '獲取課程列表失敗 Failed to get courses'
      });
    }
  });

  /**
   * 創建課程 Create course
   * POST /api/courses
   * @private
   */
  router.post('/', async (req, res) => {
    try {
      // 檢查教師是否存在 Check if teacher exists
      const teacher = await Teacher.findByPk(req.body.teacher_id);
      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: '教師不存在 Teacher not found'
        });
      }

      const course = await Course.create(req.body);

      res.status(201).json({
        success: true,
        message: '課程創建成功 Course created successfully',
        data: course
      });
    } catch (error) {
      console.error('創建課程失敗 Failed to create course:', error);
      res.status(500).json({
        success: false,
        message: '創建課程失敗 Failed to create course'
      });
    }
  });

  /**
   * 獲取單個課程 Get single course
   * GET /api/courses/:id
   * @private
   */
  router.get('/:id', async (req, res) => {
    try {
      const course = await Course.findByPk(req.params.id, {
        include: [{
          model: Teacher,
          attributes: ['id', 'name']
        }]
      });

      if (!course) {
        return res.status(404).json({
          success: false,
          message: '未找到課程 Course not found'
        });
      }

      res.json({
        success: true,
        data: course
      });
    } catch (error) {
      console.error('獲取課程失敗 Failed to get course:', error);
      res.status(500).json({
        success: false,
        message: '獲取課程失敗 Failed to get course'
      });
    }
  });

  /**
   * 更新課程 Update course
   * PUT /api/courses/:id
   * @private
   */
  router.put('/:id', async (req, res) => {
    try {
      const course = await Course.findByPk(req.params.id);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: '未找到課程 Course not found'
        });
      }

      // 如果更新了教師ID，檢查新教師是否存在 If teacher_id is updated, check if new teacher exists
      if (req.body.teacher_id && req.body.teacher_id !== course.teacher_id) {
        const teacher = await Teacher.findByPk(req.body.teacher_id);
        if (!teacher) {
          return res.status(404).json({
            success: false,
            message: '教師不存在 Teacher not found'
          });
        }
      }

      await course.update(req.body);

      res.json({
        success: true,
        message: '課程更新成功 Course updated successfully',
        data: course
      });
    } catch (error) {
      console.error('更新課程失敗 Failed to update course:', error);
      res.status(500).json({
        success: false,
        message: '更新課程失敗 Failed to update course'
      });
    }
  });

  /**
   * 刪除課程 Delete course
   * DELETE /api/courses/:id
   * @private
   */
  router.delete('/:id', async (req, res) => {
    try {
      const course = await Course.findByPk(req.params.id);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: '未找到課程 Course not found'
        });
      }

      await course.destroy();

      res.json({
        success: true,
        message: '課程刪除成功 Course deleted successfully'
      });
    } catch (error) {
      console.error('刪除課程失敗 Failed to delete course:', error);
      res.status(500).json({
        success: false,
        message: '刪除課程失敗 Failed to delete course'
      });
    }
  });

  return router;
}; 