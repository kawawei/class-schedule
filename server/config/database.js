// 導入依賴 Import dependencies
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

// 導入模型創建函數 Import model creation functions
const createUserModel = require('../src/models/user');
const createDepartmentModel = require('../src/models/department');
const createUserDepartmentModel = require('../src/models/userDepartment');
const createTeacherModel = require('../src/models/teacher');
const createCourseModel = require('../src/models/course');

// 加載環境變量 Load environment variables
dotenv.config();

// 獲取數據庫配置 Get database configuration
const {
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_USER,
  DB_PASSWORD
} = process.env;

/**
 * 創建 Sequelize 實例 Create Sequelize instance
 * @param {String} schema - 數據庫 schema Database schema
 * @returns {Object} Sequelize 實例 Sequelize instance
 */
const createSequelizeInstance = (schema = 'public') => {
  // 創建 Sequelize 實例 Create Sequelize instance
  const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: parseInt(DB_PORT, 10),
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      charset: 'utf8mb4'
    },
    define: {
      charset: 'utf8mb4',
      timestamps: true,
      underscored: true
    },
    retry: {
      match: [
        /Deadlock/i,
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/,
        /TimeoutError/,
        /ConnectionRefusedError/
      ],
      max: 5,
      backoffBase: 1000,
      backoffExponent: 1.5
    }
  });

  // 設置 schema Set schema
  sequelize.schema = schema;

  return sequelize;
};

/**
 * 初始化租戶模型 Initialize tenant models
 * @param {Object} sequelize - Sequelize 實例 Sequelize instance
 * @returns {Object} 初始化的模型 Initialized models
 */
const initializeTenantModels = (sequelize) => {
  // 創建模型 Create models
  const Department = createDepartmentModel(sequelize);
  const Teacher = createTeacherModel(sequelize);
  const Course = createCourseModel(sequelize);

  // 設置關聯 Set up associations
  Teacher.hasMany(Course, {
    foreignKey: 'teacher_id',
    as: 'courses'
  });

  Course.belongsTo(Teacher, {
    foreignKey: 'teacher_id',
    as: 'teacher'
  });

  // 返回所有模型 Return all models
  return {
    Department,
    Teacher,
    Course
  };
};

/**
 * 初始化公共模型 Initialize public models
 * @param {Object} sequelize - Sequelize 實例 Sequelize instance
 * @returns {Object} 初始化的模型 Initialized models
 */
const initializePublicModels = (sequelize) => {
  // 創建模型 Create models
  const User = createUserModel(sequelize);

  // 返回所有模型 Return all models
  return {
    User
  };
};

/**
 * 測試數據庫連接 Test database connection
 * @param {String} schema - 數據庫 schema Database schema
 * @returns {Promise<Object>} 連接結果 Connection result
 */
const testConnection = async (schema = 'public') => {
  let retries = 5;
  let lastError = null;

  while (retries > 0) {
    try {
      // 創建 Sequelize 實例 Create Sequelize instance
      const sequelize = createSequelizeInstance(schema);

      // 測試連接 Test connection
      await sequelize.authenticate();
      console.log('數據庫連接成功 Database connection successful');

      // 初始化模型 Initialize models
      let models;
      if (schema === 'public') {
        models = initializePublicModels(sequelize);
      } else {
        models = initializeTenantModels(sequelize);
      }

      // 同步模型到數據庫 Sync models to database
      await sequelize.sync();

      return {
        sequelize,
        models
      };
    } catch (error) {
      lastError = error;
      console.error(`數據庫連接失敗 (${6 - retries}/5): ${error.message}`);
      
      if (retries > 1) {
        console.log('等待 5 秒後重試...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      
      retries--;
    }
  }

  throw new Error(`無法連接到數據庫: ${lastError.message}`);
};

// 導出函數 Export functions
module.exports = {
  createSequelizeInstance,
  initializeTenantModels,
  initializePublicModels,
  testConnection
}; 