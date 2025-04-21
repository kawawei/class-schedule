const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// 倉庫模型 Warehouse model
class Warehouse extends Model {}

Warehouse.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '倉庫ID / Warehouse ID'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '倉庫名稱 / Warehouse name'
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '地址 / Address'
  },
  contact_phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '聯絡電話 / Contact phone'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '備註 / Notes'
  },
  company_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '公司代碼 / Company code'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '創建時間 / Created time'
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '更新時間 / Updated time'
  }
}, {
  sequelize,
  modelName: 'Warehouse',
  tableName: 'warehouses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Warehouse; 