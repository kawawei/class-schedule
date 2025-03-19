const { mainPool } = require('./database');

// 初始化數據庫
const initDatabase = async () => {
    const client = await mainPool.connect();
    try {
        await client.query('BEGIN');
        
        // 檢查租戶表是否存在
        const tableExists = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'tenants'
            )
        `);
        
        if (!tableExists.rows[0].exists) {
            // 創建租戶表
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
            
            // 創建租戶表索引
            await client.query(`
                CREATE INDEX idx_tenants_company_code 
                ON tenants(company_code)
            `);
            
            console.log('租戶表創建成功');
        } else {
            console.log('租戶表已存在，跳過創建');
        }
        
        await client.query('COMMIT');
        console.log('數據庫初始化完成');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('數據庫初始化失敗:', error);
        throw error;
    } finally {
        client.release();
    }
};

// 執行初始化
initDatabase().catch(console.error); 