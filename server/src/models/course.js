// 導入依賴 Import dependencies
const { DataTypes } = require('sequelize');

/**
 * 創建課程模型 Create Course model
 * @param {Object} sequelize - Sequelize 實例 Sequelize instance
 * @returns {Object} Course 模型 Course model
 */
const createCourseModel = (sequelize) => {
  const Course = sequelize.define('COURSE', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '課程ID Course ID'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '課程名稱 Course Name'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '課程描述 Course Description'
    },
    teacher_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '教師ID Teacher ID',
      references: {
        model: 'TEACHER',
        key: 'id'
      }
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '開始日期 Start Date'
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '結束日期 End Date'
    },
    day_of_week: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '星期幾 Day of Week (0-6, 0 = Sunday)'
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
      comment: '開始時間 Start Time'
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
      comment: '結束時間 End Time'
    },
    max_students: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
      comment: '最大學生數 Maximum Students'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'completed'),
      allowNull: false,
      defaultValue: 'active',
      comment: '課程狀態 Course Status'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: '是否啟用 Is Active'
    }
  }, {
    tableName: 'COURSE',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true
  });

  return Course;
};

// 導出課程模型創建函數 Export Course model creation function
module.exports = createCourseModel; 