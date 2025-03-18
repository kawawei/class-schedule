// 導入依賴 Import dependencies
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

/**
 * 課程模型 Course model
 * 定義課程表的數據結構和關係 Define the data structure and relationships of the course table
 */
const Course = sequelize.define('COURSE', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '課程ID Course ID'
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '課程種類 Course Category'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: '是否啟用 Is Active'
  },
  department_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '部門ID Department ID',
    references: {
      model: 'DEPARTMENT',
      key: 'id'
    }
  }
}, {
  // 設置表名為 COURSE Set table name to COURSE
  tableName: 'COURSE',
  // 將 createdAt 和 updatedAt 映射到 created_at 和 updated_at Map createdAt and updatedAt to created_at and updated_at
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  // 使用下劃線命名法 Use snake_case naming convention
  underscored: true
});

// 導出課程模型 Export Course model
module.exports = Course; 