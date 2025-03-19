// 導入依賴 Import dependencies
const { DataTypes } = require('sequelize');

/**
 * 創建用戶部門關聯模型 Create UserDepartment model
 * @param {Object} sequelize - Sequelize 實例 Sequelize instance
 * @returns {Object} UserDepartment 模型 UserDepartment model
 */
const createUserDepartmentModel = (sequelize) => {
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
    tableName: 'USER_DEPARTMENT',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'department_id'],
        name: 'user_department_unique'
      }
    ]
  });

  return UserDepartment;
};

// 導出用戶部門關聯模型創建函數 Export UserDepartment model creation function
module.exports = createUserDepartmentModel; 