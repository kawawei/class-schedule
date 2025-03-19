// 導入依賴 Import dependencies
const express = require('express');
const { authenticate } = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenant');

/**
 * 創建教師路由 Create teacher routes
 * @param {Object} models - 數據庫模型 Database models
 * @returns {Object} Router 實例 Router instance
 */
module.exports = (models) => {
  const router = express.Router();
  const { Teacher } = models;

  // 使用認證中間件 Use authentication middleware
  router.use(authenticate);
  
  // 使用租戶中間件 Use tenant middleware
  router.use(tenantMiddleware);

  /**
   * 獲取所有教師 Get all teachers
   * GET /api/teachers
   * @private
   */
  router.get('/', async (req, res) => {
    try {
      const teachers = await Teacher.findAll({
        where: { is_active: true },
        order: [['name', 'ASC']]
      });

      res.json({
        success: true,
        data: teachers
      });
    } catch (error) {
      console.error('獲取教師列表失敗 Failed to get teachers:', error);
      res.status(500).json({
        success: false,
        message: '獲取教師列表失敗 Failed to get teachers'
      });
    }
  });

  /**
   * 獲取單個教師 Get single teacher
   * GET /api/teachers/:id
   * @private
   */
  router.get('/:id', async (req, res) => {
    try {
      const teacher = await Teacher.findByPk(req.params.id);

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: '未找到教師 Teacher not found'
        });
      }

      res.json({
        success: true,
        data: teacher
      });
    } catch (error) {
      console.error('獲取教師失敗 Failed to get teacher:', error);
      res.status(500).json({
        success: false,
        message: '獲取教師失敗 Failed to get teacher'
      });
    }
  });

  /**
   * 創建教師 Create teacher
   * POST /api/teachers
   * @private
   */
  router.post('/', async (req, res) => {
    try {
      const teacher = await Teacher.create(req.body);

      res.status(201).json({
        success: true,
        message: '教師創建成功 Teacher created successfully',
        data: teacher
      });
    } catch (error) {
      console.error('創建教師失敗 Failed to create teacher:', error);
      res.status(500).json({
        success: false,
        message: '創建教師失敗 Failed to create teacher'
      });
    }
  });

  /**
   * 更新教師 Update teacher
   * PUT /api/teachers/:id
   * @private
   */
  router.put('/:id', async (req, res) => {
    try {
      const teacher = await Teacher.findByPk(req.params.id);

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: '未找到教師 Teacher not found'
        });
      }

      await teacher.update(req.body);

      res.json({
        success: true,
        message: '教師更新成功 Teacher updated successfully',
        data: teacher
      });
    } catch (error) {
      console.error('更新教師失敗 Failed to update teacher:', error);
      res.status(500).json({
        success: false,
        message: '更新教師失敗 Failed to update teacher'
      });
    }
  });

  /**
   * 刪除教師 Delete teacher
   * DELETE /api/teachers/:id
   * @private
   */
  router.delete('/:id', async (req, res) => {
    try {
      const teacher = await Teacher.findByPk(req.params.id);

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: '未找到教師 Teacher not found'
        });
      }

      await teacher.destroy();

      res.json({
        success: true,
        message: '教師刪除成功 Teacher deleted successfully'
      });
    } catch (error) {
      console.error('刪除教師失敗 Failed to delete teacher:', error);
      res.status(500).json({
        success: false,
        message: '刪除教師失敗 Failed to delete teacher'
      });
    }
  });

  /**
   * 切換教師狀態 Toggle teacher status
   * PUT /api/teachers/:id/toggle-status
   * @private
   */
  router.put('/:id/toggle-status', async (req, res) => {
    try {
      const teacher = await Teacher.findByPk(req.params.id);

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: '未找到教師 Teacher not found'
        });
      }

      // 切換狀態 Toggle status
      await teacher.update({
        is_active: !teacher.is_active
      });

      res.json({
        success: true,
        message: `教師狀態已更新為 ${teacher.is_active ? '啟用' : '停用'} Teacher status updated to ${teacher.is_active ? 'active' : 'inactive'}`,
        data: teacher
      });
    } catch (error) {
      console.error('切換教師狀態失敗 Failed to toggle teacher status:', error);
      res.status(500).json({
        success: false,
        message: '切換教師狀態失敗 Failed to toggle teacher status'
      });
    }
  });

  return router;
};