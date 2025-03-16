// 導入依賴 Import dependencies
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../../config/database');

// 定義用戶模型 Define User model
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
    unique: true,
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
    allowNull: true,
    unique: true,
    comment: '電子郵件 Email'
  },
  role: {
    type: DataTypes.ENUM('admin', 'user'),
    defaultValue: 'user',
    comment: '角色 Role'
  },
  avatar: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '頭像URL Avatar URL'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: '是否啟用 Is Active'
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '最後登入時間 Last Login Time'
  }
}, {
  // 添加鉤子方法 Add hooks
  hooks: {
    // 在創建用戶前加密密碼 Encrypt password before creating user
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    // 在更新用戶前加密密碼 (如果密碼被修改) Encrypt password before updating user (if password is changed)
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// 添加實例方法 Add instance methods
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 導出用戶模型 Export User model
module.exports = User; 