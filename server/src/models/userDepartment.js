// 導入依賴 Import dependencies
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

// 定義用戶部門關聯模型 Define UserDepartment model
const UserDepartment = sequelize.define('USER_DEPARTMENT', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '關聯ID Relation ID'
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '用戶ID User ID',
    references: {
      model: 'USER',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  department_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '部門ID Department ID',
    references: {
      model: 'DEPARTMENT',
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'department_id'],
      name: 'user_department_unique'
    }
  ]
});

// 導出用戶部門關聯模型 Export UserDepartment model
module.exports = UserDepartment; 