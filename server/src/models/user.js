// 導入依賴 Import dependencies
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

/**
 * 創建用戶模型 Create User model
 * @param {Object} sequelize - Sequelize 實例 Sequelize instance
 * @returns {Object} User 模型 User model
 */
const createUserModel = (sequelize) => {
  const User = sequelize.define('USER', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '用戶ID User ID'
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '用戶名 Username'
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '密碼 Password'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '姓名 Name'
    },
    email: {
      type: DataTypes.STRING(100),
      comment: '電子郵件 Email'
    },
    role: {
      type: DataTypes.ENUM('admin', 'user'),
      defaultValue: 'user',
      comment: '角色 Role'
    },
    company_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '公司代碼 Company Code'
    },
    avatar: {
      type: DataTypes.STRING(255),
      comment: '頭像URL Avatar URL'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '是否啟用 Is Active'
    },
    last_login: {
      type: DataTypes.DATE,
      comment: '最後登入時間 Last Login Time'
    }
  }, {
    tableName: 'USER',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    },
    indexes: [
      {
        unique: true,
        fields: ['username', 'company_code'],
        name: 'username_company_unique'
      },
      {
        unique: true,
        fields: ['email', 'company_code'],
        name: 'email_company_unique'
      }
    ]
  });

  // 添加實例方法 Add instance methods
  User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };

  return User;
};

// 導出模型創建函數 Export model creation function
module.exports = createUserModel; 