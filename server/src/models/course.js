// 導入必要的模組 Import necessary modules
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// 定義課程種類模型 Define course category model
const Course = sequelize.define('Course', {
  // 課程ID Course ID
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // 課程種類名稱 Course category name
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '課程種類不能為空 Course category cannot be empty'
      }
    }
  },
  // 課程狀態 Course status
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  // 公司代碼 Company code
  company_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    references: {
      model: 'tenants',
      key: 'company_code'
    }
  }
}, {
  // 模型配置 Model configuration
  tableName: 'courses',
  timestamps: true, // 自動添加 createdAt 和 updatedAt
  indexes: [
    {
      unique: true,
      fields: ['category', 'company_code']  // 每個租戶的課程類別名稱都是唯一的
    }
  ]
});

// 導出模型 Export model
module.exports = Course; 