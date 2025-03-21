// 導入必要的模組 Import necessary modules
const Course = require('../models/course');
const { Op } = require('sequelize');

// 課程控制器 Course controller
const courseController = {
  // 獲取所有課程種類 Get all course categories
  async getAllCourses(req, res) {
    try {
      const courses = await Course.findAll({
        order: [['createdAt', 'DESC']]
      });
      res.json({
        success: true,
        data: courses
      });
    } catch (error) {
      console.error('獲取課程列表失敗 Failed to get course list:', error);
      res.status(500).json({
        success: false,
        message: '獲取課程列表失敗 Failed to get course list'
      });
    }
  },

  // 創建新課程種類 Create new course category
  async createCourse(req, res) {
    try {
      const { category } = req.body;

      // 檢查課程種類是否已存在 Check if course category already exists
      const existingCourse = await Course.findOne({
        where: { category }
      });

      if (existingCourse) {
        return res.status(400).json({
          success: false,
          message: '課程種類已存在 Course category already exists'
        });
      }

      // 創建新課程種類 Create new course category
      const course = await Course.create({
        category,
        is_active: true
      });

      res.status(201).json({
        success: true,
        data: course,
        message: '課程種類創建成功 Course category created successfully'
      });
    } catch (error) {
      console.error('創建課程種類失敗 Failed to create course category:', error);
      res.status(500).json({
        success: false,
        message: '創建課程種類失敗 Failed to create course category'
      });
    }
  },

  // 更新課程種類 Update course category
  async updateCourse(req, res) {
    try {
      const { id } = req.params;
      const { category, is_active } = req.body;

      // 檢查課程是否存在 Check if course exists
      const course = await Course.findByPk(id);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: '課程種類不存在 Course category does not exist'
        });
      }

      // 如果更新類別名稱，檢查是否與其他課程重複 If updating category name, check for duplicates
      if (category && category !== course.category) {
        const existingCourse = await Course.findOne({
          where: { category }
        });

        if (existingCourse) {
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

      res.json({
        success: true,
        data: course,
        message: '課程種類更新成功 Course category updated successfully'
      });
    } catch (error) {
      console.error('更新課程種類失敗 Failed to update course category:', error);
      res.status(500).json({
        success: false,
        message: '更新課程種類失敗 Failed to update course category'
      });
    }
  },

  // 刪除課程種類 Delete course category
  async deleteCourse(req, res) {
    try {
      const { id } = req.params;

      // 檢查課程是否存在 Check if course exists
      const course = await Course.findByPk(id);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: '課程種類不存在 Course category does not exist'
        });
      }

      // 刪除課程種類 Delete course category
      await course.destroy();

      res.json({
        success: true,
        message: '課程種類刪除成功 Course category deleted successfully'
      });
    } catch (error) {
      console.error('刪除課程種類失敗 Failed to delete course category:', error);
      res.status(500).json({
        success: false,
        message: '刪除課程種類失敗 Failed to delete course category'
      });
    }
  },

  // 切換課程種類狀態 Toggle course category status
  async toggleCourseStatus(req, res) {
    try {
      const { id } = req.params;

      // 檢查課程是否存在 Check if course exists
      const course = await Course.findByPk(id);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: '課程種類不存在 Course category does not exist'
        });
      }

      // 切換狀態 Toggle status
      await course.update({
        is_active: !course.is_active
      });

      res.json({
        success: true,
        data: course,
        message: '課程種類狀態更新成功 Course category status updated successfully'
      });
    } catch (error) {
      console.error('切換課程種類狀態失敗 Failed to toggle course category status:', error);
      res.status(500).json({
        success: false,
        message: '切換課程種類狀態失敗 Failed to toggle course category status'
      });
    }
  }
};

// 導出控制器 Export controller
module.exports = courseController; 