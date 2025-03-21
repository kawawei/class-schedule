const { Sequelize } = require('sequelize');
const { Pool } = require('pg');
require('dotenv').config();

// 創建 Sequelize 實例
const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    schema: 'public',
    timezone: 'Asia/Taipei',
    define: {
        timestamps: true,
        underscored: true
    },
    logging: console.log
});

// 創建主數據庫連接池
const mainPool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    // 設置默認 Schema
    search_path: 'public'
});

// 創建租戶 Schema 的函數
const createTenantSchema = async (schemaName) => {
    const client = await mainPool.connect();
    try {
        await client.query('BEGIN');
        
        // 創建 Schema
        await client.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);
        
        // 設置時區
        await client.query(`SET timezone = 'Asia/Taipei'`);
        
        // 創建用戶表
        await client.query(`
            CREATE TABLE IF NOT EXISTS ${schemaName}.users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                name VARCHAR(100),
                role VARCHAR(20) NOT NULL DEFAULT 'user',
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // 創建課程表
        await client.query(`
            CREATE TABLE IF NOT EXISTS ${schemaName}.courses (
                id SERIAL PRIMARY KEY,
                category VARCHAR(100) NOT NULL UNIQUE,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // 創建課表
        await client.query(`
            CREATE TABLE IF NOT EXISTS ${schemaName}.schedules (
                id SERIAL PRIMARY KEY,
                course_id INTEGER REFERENCES ${schemaName}.courses(id),
                teacher_id INTEGER REFERENCES ${schemaName}.users(id),
                start_time TIMESTAMP WITH TIME ZONE NOT NULL,
                end_time TIMESTAMP WITH TIME ZONE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // 啟用 RLS
        await client.query(`ALTER TABLE ${schemaName}.users ENABLE ROW LEVEL SECURITY`);
        await client.query(`ALTER TABLE ${schemaName}.courses ENABLE ROW LEVEL SECURITY`);
        await client.query(`ALTER TABLE ${schemaName}.schedules ENABLE ROW LEVEL SECURITY`);
        
        await client.query('COMMIT');
        return true;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

// 設置當前租戶 Schema
const setTenantSchema = async (schemaName) => {
    const client = await mainPool.connect();
    try {
        // 設置 schema 和時區
        await client.query(`SET search_path TO ${schemaName}`);
        await client.query(`SET timezone = 'Asia/Taipei'`);
        
        // 更新 Sequelize 的 schema
        sequelize.options.schema = schemaName;
        
        // 同步 Sequelize 模型
        await sequelize.sync();
        
        return true;
    } catch (error) {
        throw error;
    } finally {
        client.release();
    }
};

// 測試數據庫連接
sequelize.authenticate()
    .then(() => {
        console.log('數據庫連接成功 Database connection has been established successfully.');
        // 同步數據庫模型
        return sequelize.sync();
    })
    .then(() => {
        console.log('數據庫模型同步成功 Database models have been synchronized successfully.');
    })
    .catch(err => {
        console.error('無法連接到數據庫 Unable to connect to the database:', err);
    });

module.exports = {
    sequelize,
    mainPool,
    createTenantSchema,
    setTenantSchema
}; 