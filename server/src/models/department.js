// 導入依賴 Import dependencies
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

// 定義部門模型 Define Department model
const Department = sequelize.define('DEPARTMENT', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '部門ID Department ID'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '部門名稱 Department Name'
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '部門代碼 Department Code'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '部門描述 Department Description'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: '是否啟用 Is Active'
  }
});

// 導出部門模型 Export Department model
module.exports = Department; 