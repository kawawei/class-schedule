const { DataTypes } = require('sequelize');

/**
 * 老師模型 Teacher Model
 * @param {Object} sequelize - Sequelize instance
 * @returns {Object} Teacher model
 */
module.exports = (sequelize) => {
  const Teacher = sequelize.define('Teacher', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '老師 ID Teacher ID'
    },
    company_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: 'tenants',
        key: 'company_code'
      },
      comment: '公司代碼 Company code'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: '姓名不能為空 Name cannot be empty' }
      },
      comment: '姓名 Name'
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: { msg: '電子郵件格式不正確 Invalid email format' }
      },
      comment: '電子郵件 Email'
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: '電話不能為空 Phone cannot be empty' },
        is: {
          args: /^09\d{8}$|^0[1-8]\d{7,8}$/,
          msg: '電話格式不正確 Invalid phone format'
        }
      },
      comment: '聯絡電話 Phone'
    },
    line_id: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'LINE ID'
    },
    county: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: '縣市不能為空 County cannot be empty' }
      },
      comment: '縣市 County'
    },
    district: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: '區域不能為空 District cannot be empty' }
      },
      comment: '區域 District'
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '地址 Address'
    },
    teaching_categories: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        notEmpty: { msg: '教學種類不能為空 Teaching categories cannot be empty' },
        isValidCategories(value) {
          if (!Array.isArray(value) || value.length === 0) {
            throw new Error('至少選擇一個教學種類 Please select at least one teaching category');
          }
        }
      },
      comment: '教學種類 Teaching categories'
    },
    level: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: '等級不能為空 Level cannot be empty' },
        isIn: {
          args: [['初級', '中級', '高級']],
          msg: '等級必須是初級、中級或高級 Level must be 初級, 中級 or 高級'
        }
      },
      comment: '等級 Level'
    },
    years_of_experience: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: '教學年資不能小於0 Years of experience cannot be less than 0'
        }
      },
      comment: '教學年資 Years of experience'
    },
    specialty: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '專長描述 Specialty'
    },
    hourly_rate: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: '時薪不能小於0 Hourly rate cannot be less than 0'
        }
      },
      comment: '時薪 Hourly rate'
    },
    emergency_contact_name: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '緊急聯絡人姓名 Emergency contact name'
    },
    emergency_contact_relation: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '緊急聯絡人關係 Emergency contact relation'
    },
    emergency_contact_phone: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: {
          args: /^09\d{8}$|^0[1-8]\d{7,8}$/,
          msg: '電話格式不正確 Invalid phone format'
        }
      },
      comment: '緊急聯絡人電話 Emergency contact phone'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '備註 Notes'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: '是否啟用 Is active'
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '對應 users 表的 ID，建立 teacher-user 關聯 / Corresponding user ID for teacher-user relation'
    }
  }, {
    tableName: 'teachers',
    timestamps: true, // 啟用 createdAt 和 updatedAt
    paranoid: true,  // 軟刪除，啟用 deletedAt
    indexes: [
      {
        fields: ['company_code'],
        name: 'idx_teachers_company_code'
      },
      {
        fields: ['company_code', 'name'],
        name: 'idx_teachers_company_name'
      },
      {
        fields: ['company_code', 'phone'],
        name: 'idx_teachers_company_phone'
      }
    ]
  });

  // 定義關聯 Define associations
  Teacher.associate = (models) => {
    // 暫時移除公司關聯，等公司模型建立後再加入
    // Temporarily remove company association, will add it back after company model is created
  };

  return Teacher;
}; 