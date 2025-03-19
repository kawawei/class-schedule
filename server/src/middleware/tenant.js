// 導入依賴 Import dependencies
const { createSequelizeInstance } = require('../../config/database');

/**
 * 租戶中間件 Tenant middleware
 * 根據請求中的公司代碼設置對應的 schema，並自動創建 schema
 * Set schema based on company code in request and auto-create schema
 */
const tenantMiddleware = async (req, res, next) => {
  try {
    // 從請求頭獲取公司代碼 Get company code from request header
    const companyCode = req.headers['x-company-code'];
    
    if (!companyCode) {
      return res.status(400).json({
        success: false,
        message: '缺少公司代碼 Missing company code'
      });
    }

    // 將公司代碼轉換為 schema 名稱 Convert company code to schema name
    const schema = `tenant_${companyCode.toLowerCase()}`;
    
    // 創建該租戶的 Sequelize 實例 Create Sequelize instance for this tenant
    const tenantSequelize = createSequelizeInstance(schema);
    
    try {
      // 嘗試創建 schema Create schema if not exists
      await tenantSequelize.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
      
      // 初始化租戶表 Initialize tenant tables
      await tenantSequelize.sync();
      
      console.log(`Schema ${schema} 已創建或已存在 Schema created or already exists`);
    } catch (schemaError) {
      console.error(`創建 schema ${schema} 失敗 Failed to create schema:`, schemaError);
      throw schemaError;
    }
    
    // 將 Sequelize 實例添加到請求對象 Add Sequelize instance to request object
    req.tenantSequelize = tenantSequelize;
    
    // 繼續下一個中間件 Continue to next middleware
    next();
  } catch (error) {
    console.error('租戶中間件錯誤 Tenant middleware error:', error);
    return res.status(500).json({
      success: false,
      message: '處理租戶信息時出錯 Error processing tenant information',
      error: error.message
    });
  }
};

// 導出中間件 Export middleware
module.exports = tenantMiddleware; 