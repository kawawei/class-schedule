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
  },
  // 創建時間 Created time
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  // 更新時間 Updated time
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  // 模型配置 Model configuration
  tableName: 'courses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['category', 'company_code'],
      name: 'courses_category_company_code_unique'
    }
  ]
});

// 導出模型 Export model
module.exports = Course; 