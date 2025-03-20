const { Pool } = require('pg');
require('dotenv').config();

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
        
        // 創建用戶表
        await client.query(`
            CREATE TABLE IF NOT EXISTS ${schemaName}.users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                name VARCHAR(255),
                role VARCHAR(20) NOT NULL DEFAULT 'user',
                permissions JSONB DEFAULT '{}',
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // 創建課程表
        await client.query(`
            CREATE TABLE IF NOT EXISTS ${schemaName}.courses (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // 創建課表
        await client.query(`
            CREATE TABLE IF NOT EXISTS ${schemaName}.schedules (
                id SERIAL PRIMARY KEY,
                course_id INTEGER REFERENCES ${schemaName}.courses(id),
                teacher_id INTEGER REFERENCES ${schemaName}.users(id),
                start_time TIMESTAMP NOT NULL,
                end_time TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
        await client.query(`SET search_path TO ${schemaName}`);
        return true;
    } catch (error) {
        throw error;
    } finally {
        client.release();
    }
};

module.exports = {
    mainPool,
    createTenantSchema,
    setTenantSchema
}; 