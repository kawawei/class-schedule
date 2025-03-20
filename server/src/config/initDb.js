const { mainPool } = require('./database');

// 初始化數據庫 Initialize database
const initDatabase = async () => {
    const client = await mainPool.connect();
    try {
        await client.query('BEGIN');
        
        // 檢查租戶表是否存在 Check if tenants table exists
        const tableExists = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'tenants'
            )
        `);
        
        if (!tableExists.rows[0].exists) {
            // 創建租戶表 Create tenants table
            await client.query(`
                CREATE TABLE tenants (
                    id SERIAL PRIMARY KEY,
                    company_name VARCHAR(100) NOT NULL,
                    company_code VARCHAR(50) UNIQUE NOT NULL,
                    status VARCHAR(20) NOT NULL DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            
            // 創建租戶表索引 Create tenants table index
            await client.query(`
                CREATE INDEX idx_tenants_company_code 
                ON tenants(company_code)
            `);
            
            console.log('租戶表創建成功 Tenants table created successfully');
        } else {
            console.log('租戶表已存在，跳過創建 Tenants table already exists, skipping creation');
        }

        // 檢查用戶表是否存在 Check if users table exists
        const usersTableExists = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'users'
            )
        `);

        if (!usersTableExists.rows[0].exists) {
            // 創建用戶表 Create users table
            await client.query(`
                CREATE TABLE users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    name VARCHAR(100) NOT NULL,
                    email VARCHAR(255),
                    role VARCHAR(20) NOT NULL CHECK (role IN ('tenant', 'admin', 'staff')),
                    permissions JSONB DEFAULT '[]'::jsonb,
                    is_active BOOLEAN DEFAULT true,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // 創建用戶表索引 Create users table indexes
            await client.query(`
                CREATE INDEX idx_users_username ON users(username);
                CREATE INDEX idx_users_role ON users(role);
                CREATE INDEX idx_users_is_active ON users(is_active);
            `);

            console.log('用戶表創建成功 Users table created successfully');
        } else {
            // 檢查是否需要添加權限欄位 Check if permissions column needs to be added
            const permissionsColumnExists = await client.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.columns 
                    WHERE table_schema = 'public' 
                    AND table_name = 'users' 
                    AND column_name = 'permissions'
                )
            `);

            if (!permissionsColumnExists.rows[0].exists) {
                // 添加權限欄位 Add permissions column
                await client.query(`
                    ALTER TABLE users 
                    ADD COLUMN permissions JSONB DEFAULT '[]'::jsonb
                `);

                // 更新現有用戶的權限 Update existing users' permissions
                await client.query(`
                    UPDATE users 
                    SET permissions = CASE 
                        WHEN role = 'tenant' THEN '["create_user", "update_user", "delete_user", "disable_user"]'::jsonb
                        WHEN role = 'admin' THEN '["create_user", "update_user", "disable_user"]'::jsonb
                        ELSE '[]'::jsonb
                    END
                `);

                console.log('權限欄位添加成功 Permissions column added successfully');
            } else {
                console.log('權限欄位已存在，跳過添加 Permissions column already exists, skipping addition');
            }
        }
        
        await client.query('COMMIT');
        console.log('數據庫初始化完成 Database initialization completed');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('數據庫初始化失敗 Database initialization failed:', error);
        throw error;
    } finally {
        client.release();
    }
};

// 執行初始化 Execute initialization
initDatabase().catch(console.error); 