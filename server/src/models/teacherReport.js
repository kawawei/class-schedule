const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TeacherReport = sequelize.define('TeacherReport', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '報告 ID Report ID'
  },
  scheduleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '課程排程 ID Schedule ID'
  },
  teacherId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '老師 ID Teacher ID'
  },
  departureTime: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '出發時間 Departure time'
  },
  departureLocation: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: '出發位置 Departure location'
  },
  arrivalTime: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '到達時間 Arrival time'
  },
  arrivalLocation: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: '到達位置 Arrival location'
  },
  materialsUsed: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '使用教材數量 Number of materials used'
  },
  status: {
    type: DataTypes.ENUM('pending', 'departed', 'arrived'),
    defaultValue: 'pending',
    allowNull: false,
    comment: '狀態 Status'
  },
  companyCode: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '公司代碼 Company code'
  }
}, {
  tableName: 'teacher_reports',
  underscored: true,
  timestamps: true,
  comment: '老師報告表 Teacher reports table'
});

module.exports = TeacherReport; 