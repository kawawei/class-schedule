const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// 庫存主表模型 Inventory main model
class Inventory extends Model {}

Inventory.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '庫存ID / Inventory ID'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '貨物名稱 / Item name'
  },
  courseType: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '課程種類 / Course type'
  },
  minQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '最小庫存量 / Minimum quantity'
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: '單價 / Unit price'
  },
  unitPriceCurrency: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'NT$',
    comment: '單價貨幣 / Unit price currency'
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: '成本 / Cost'
  },
  costCurrency: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'NT$',
    comment: '成本貨幣 / Cost currency'
  },
  specifications: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: '規格信息（可選）/ Specifications information (optional)'
  },
  notes: {
    type: DataTypes.TEXT,
    comment: '備註 / Notes'
  },
  qrcode_url: {
    type: DataTypes.STRING,
    comment: 'QR Code URL'
  },
  qrcode_name: {
    type: DataTypes.STRING,
    comment: 'QR Code 名稱 / QR Code name'
  },
  image_url: {
    type: DataTypes.STRING,
    comment: '圖片 URL / Image URL'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '創建時間 / Created time'
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '更新時間 / Updated time'
  }
}, {
  sequelize,
  modelName: 'Inventory',
  tableName: 'inventories',
  timestamps: true
});

module.exports = Inventory; 