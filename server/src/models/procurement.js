// 引入必要的模塊 Import necessary modules
const { Model, DataTypes } = require('sequelize'); // 從 sequelize 套件引入 Model 與 DataTypes
const { sequelize } = require('../config/database'); // 正確引入 Sequelize 實例（與 inventory.js 一致）

// 定義採購單模型 Define Procurement Model
class Procurement extends Model {} // 宣告 Procurement 類別，繼承自 Model

// 初始化模型欄位與設定 Initialize model fields and settings
Procurement.init({
  id: {
    type: DataTypes.INTEGER, // 主鍵，自動遞增 Primary key, auto increment
    primaryKey: true,
    autoIncrement: true,
    comment: '採購單ID / Procurement ID'
  },
  procurementNo: {
    type: DataTypes.STRING, // 採購單號 Procurement Number
    allowNull: false,
    unique: true,
    field: 'procurement_no', // 對應資料庫底線命名
    comment: '採購單號 / Procurement Number'
  },
  procurementDate: {
    type: DataTypes.DATE, // 採購日期 Procurement Date
    allowNull: false,
    field: 'procurement_date', // 對應資料庫底線命名
    comment: '採購日期 / Procurement Date'
  },
  supplier: {
    type: DataTypes.STRING, // 供應商名稱 Supplier Name
    allowNull: false,
    comment: '供應商名稱 / Supplier Name'
  },
  status: {
    type: DataTypes.ENUM('draft', 'pending', 'approved', 'rejected'), // 狀態 Status
    allowNull: false,
    defaultValue: 'draft',
    comment: '採購狀態 / Procurement Status'
  },
  items: {
    type: DataTypes.JSONB, // 採購項目列表 Procurement Items List
    allowNull: false,
    comment: '採購項目列表 / Procurement Items List'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2), // 總金額 Total Amount
    allowNull: false,
    defaultValue: 0,
    field: 'total_amount', // 對應資料庫底線命名
    comment: '總金額 / Total Amount'
  },
  currency: {
    type: DataTypes.STRING, // 幣種 Currency
    allowNull: false,
    defaultValue: 'TWD',
    comment: '幣種 / Currency'
  },
  remark: {
    type: DataTypes.TEXT, // 備註 Remarks
    comment: '備註 / Remarks'
  },
  extraCharges: {
    type: DataTypes.JSONB, // 額外費用列表 Extra Charges List
    field: 'extra_charges', // 對應資料庫底線命名
    comment: '額外費用列表 / Extra Charges List'
  },
  createdAt: {
    type: DataTypes.DATE, // 創建時間 Created time
    allowNull: false,
    field: 'created_at', // 對應資料庫底線命名
    comment: '創建時間 / Created time'
  },
  updatedAt: {
    type: DataTypes.DATE, // 更新時間 Updated time
    allowNull: false,
    field: 'updated_at', // 對應資料庫底線命名
    comment: '更新時間 / Updated time'
  }
}, {
  sequelize, // 指定資料庫連線 Specify database connection
  modelName: 'Procurement', // 模型名稱 Model name
  tableName: 'procurements', // 對應資料表名稱 Table name
  timestamps: true, // 啟用自動時間戳 Enable timestamps
  indexes: [
    {
      unique: true,
      fields: ['procurement_no'] // 採購單號唯一索引 Unique index for procurement_no
    }
  ]
});

module.exports = Procurement; // 匯出模型 Export model