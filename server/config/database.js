// 導入依賴 Import dependencies
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

// 加載環境變量 Load environment variables
dotenv.config();

// 輸出數據庫配置信息 Output database configuration info
console.log('數據庫配置信息 Database configuration info:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '已設置 (set)' : '未設置 (not set)');

// 創建 Sequelize 實例 Create Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    // 添加 dialectOptions 以確保使用正確的字符集 Add dialectOptions to ensure correct character set
    dialectOptions: {
      charset: 'utf8mb4',
      supportBigNumbers: true,
      bigNumberStrings: true
    },
    pool: {
      max: 5, // 連接池最大連接數 Maximum number of connections in pool
      min: 0, // 連接池最小連接數 Minimum number of connections in pool
      acquire: 30000, // 獲取連接的最大等待時間 (毫秒) Maximum time to acquire a connection (ms)
      idle: 10000 // 連接在釋放前可以空閒的最大時間 (毫秒) Maximum time a connection can be idle before being released (ms)
    },
    define: {
      timestamps: true, // 自動添加 createdAt 和 updatedAt 字段 Automatically add createdAt and updatedAt fields
      underscored: true, // 使用下劃線命名法 (例如: created_at) Use snake_case for field names (e.g., created_at)
      freezeTableName: true, // 表名與模型名相同，不自動轉為複數 Table name will be the same as the model name, not pluralized
      charset: 'utf8mb4', // 字符集 Character set
      collate: 'utf8mb4_unicode_ci' // 排序規則 Collation
    }
  }
);

// 測試數據庫連接 Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    // 設置連接字符集 Set connection character set
    await sequelize.query('SET NAMES utf8mb4');
    await sequelize.query('SET CHARACTER SET utf8mb4');
    await sequelize.query('SET character_set_client = utf8mb4');
    await sequelize.query('SET character_set_connection = utf8mb4');
    await sequelize.query('SET character_set_results = utf8mb4');
    console.log('數據庫連接成功。 Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('無法連接到數據庫: Database connection error:', error);
    return false;
  }
};

// 導出 Sequelize 實例和測試連接函數 Export Sequelize instance and test connection function
module.exports = {
  sequelize,
  testConnection
}; 