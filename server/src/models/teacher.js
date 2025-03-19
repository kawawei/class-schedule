// 導入依賴 Import dependencies
const { DataTypes } = require('sequelize');

/**
 * 創建老師模型 Create Teacher model
 * @param {Object} sequelize - Sequelize 實例 Sequelize instance
 * @returns {Object} Teacher 模型 Teacher model
 */
const createTeacherModel = (sequelize) => {
  const Teacher = sequelize.define('TEACHER', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '老師ID Teacher ID'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '姓名 Name'
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '電話 Phone'
    },
    email: {
      type: DataTypes.STRING(100),
      comment: '電子郵件 Email'
    },
    specialty: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '專長 Specialty'
    },
    hourly_rate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '時薪 Hourly Rate'
    },
    address: {
      type: DataTypes.STRING(255),
      comment: '地址 Address'
    },
    notes: {
      type: DataTypes.TEXT,
      comment: '備註 Notes'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '是否啟用 Is Active'
    }
  }, {
    tableName: 'TEACHER',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true
  });

  return Teacher;
};

// 導出模型創建函數 Export model creation function
module.exports = createTeacherModel; 