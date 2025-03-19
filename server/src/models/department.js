// 導入依賴 Import dependencies
const { DataTypes } = require('sequelize');

/**
 * 創建部門模型 Create Department model
 * @param {Object} sequelize - Sequelize 實例 Sequelize instance
 * @returns {Object} Department 模型 Department model
 */
const createDepartmentModel = (sequelize) => {
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
  }, {
    tableName: 'DEPARTMENT',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true
  });

  return Department;
};

// 導出部門模型創建函數 Export Department model creation function
module.exports = createDepartmentModel; 