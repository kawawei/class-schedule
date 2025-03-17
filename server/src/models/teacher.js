// 導入依賴 Import dependencies
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

// 定義老師模型 Define Teacher model
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
  line_id: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'LINE ID'
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '電子郵件 Email'
  },
  county: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '縣市 County'
  },
  district: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '區域 District'
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '地址 Address'
  },
  teaching_categories: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    comment: '教學種類 Teaching Categories'
  },
  level: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '等級 Level'
  },
  years_of_experience: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '教學年資 Years of Experience'
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
  emergency_contact_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '緊急聯絡人姓名 Emergency Contact Name'
  },
  emergency_contact_relation: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '緊急聯絡人關係 Emergency Contact Relation'
  },
  emergency_contact_phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '緊急聯絡人電話 Emergency Contact Phone'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '備註 Notes'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: '是否啟用 Is Active'
  }
}, {
  // 使用下劃線命名法 Use snake_case for field names
  underscored: true,
  // 表名與模型名相同 Table name will be the same as the model name
  freezeTableName: true,
  // 添加時間戳 Add timestamps
  timestamps: true,
  // 自定義時間戳字段名 Custom timestamp field names
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// 導出老師模型 Export Teacher model
module.exports = Teacher; 