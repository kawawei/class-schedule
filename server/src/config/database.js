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
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE,
                role VARCHAR(20) NOT NULL DEFAULT 'staff',
                is_active BOOLEAN DEFAULT true,
                permissions JSONB DEFAULT '{}'::jsonb,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT valid_role CHECK (role IN ('admin', 'staff', 'teacher', 'tenant')),
                CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')
            )
        `);
        
        // 創建更新觸發器
        await client.query(`
            CREATE OR REPLACE FUNCTION ${schemaName}.update_updated_at()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            DROP TRIGGER IF EXISTS update_users_updated_at ON ${schemaName}.users;
            
            CREATE TRIGGER update_users_updated_at
                BEFORE UPDATE ON ${schemaName}.users
                FOR EACH ROW
                EXECUTE FUNCTION ${schemaName}.update_updated_at();
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
        
        // 創建教師表 Create teachers table
        await client.query(`
            CREATE TABLE IF NOT EXISTS ${schemaName}.teachers (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                phone VARCHAR(20),
                teaching_categories TEXT[],
                education TEXT,
                experience TEXT,
                certifications TEXT[],
                availability JSON,
                hourly_rate DECIMAL(10,2),
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // 啟用 RLS
        await client.query(`ALTER TABLE ${schemaName}.users ENABLE ROW LEVEL SECURITY`);
        await client.query(`ALTER TABLE ${schemaName}.courses ENABLE ROW LEVEL SECURITY`);
        await client.query(`ALTER TABLE ${schemaName}.schedules ENABLE ROW LEVEL SECURITY`);
        
        await client.query('COMMIT');
        console.log(`Schema ${schemaName} 創建成功 Schema created successfully`);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(`創建 Schema ${schemaName} 失敗 Failed to create schema:`, error);
        throw error;
    } finally {
        client.release();
    }
};

// 更新現有 Schema 的函數
const updateExistingSchemas = async () => {
    const client = await mainPool.connect();
    try {
        // 獲取所有租戶 Schema
        const schemas = await client.query(`
            SELECT company_code 
            FROM public.tenants 
            WHERE status = 'active'
        `);
        
        for (const schema of schemas.rows) {
            const schemaName = schema.company_code;
            
            // 檢查並更新用戶表約束
            await client.query(`
                DO $$ 
                BEGIN
                    -- 刪除舊的約束
                    IF EXISTS (
                        SELECT 1 
                        FROM information_schema.table_constraints 
                        WHERE constraint_schema = '${schemaName}'
                        AND table_name = 'users' 
                        AND constraint_name = 'valid_role'
                    ) THEN
                        ALTER TABLE ${schemaName}.users DROP CONSTRAINT valid_role;
                    END IF;
                    
                    -- 添加新的約束
                    ALTER TABLE ${schemaName}.users 
                    ADD CONSTRAINT valid_role 
                    CHECK (role IN ('admin', 'staff', 'teacher', 'tenant'));
                END $$;
            `);
            
            console.log(`已更新 Schema ${schemaName} 的約束 Updated constraints for schema`);
        }
    } catch (error) {
        console.error('更新 Schema 失敗:', error);
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
    updateExistingSchemas,
    setTenantSchema
}; 