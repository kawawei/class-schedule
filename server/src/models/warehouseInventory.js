const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Inventory = require('./inventory');

// 倉庫庫存關聯表模型 Warehouse inventory association model
class WarehouseInventory extends Model {}

WarehouseInventory.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '倉庫庫存ID / Warehouse inventory ID'
  },
  inventoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'inventories',
      key: 'id'
    },
    comment: '庫存ID / Inventory ID'
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '倉庫位置 / Warehouse location'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '當前數量 / Current quantity'
  },
  defectiveQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '不良品數量 / Defective quantity'
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
  modelName: 'WarehouseInventory',
  tableName: 'warehouse_inventories',
  timestamps: true
});

// 建立關聯 Establish associations
Inventory.hasMany(WarehouseInventory, {
  foreignKey: 'inventoryId',
  as: 'warehouses'
});

WarehouseInventory.belongsTo(Inventory, {
  foreignKey: 'inventoryId',
  as: 'inventory'
});

module.exports = WarehouseInventory; 