const express = require('express');
const router = express.Router();
const warehouseController = require('../controllers/warehouseController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// 所有倉庫路由都需要身份驗證 All warehouse routes require authentication
router.use(authMiddleware);

// 獲取倉庫列表 Get list of warehouses
router.get('/', warehouseController.getWarehouses);

// 獲取單個倉庫詳情 Get single warehouse details
router.get('/:id', warehouseController.getWarehouse);

// 創建新倉庫 Create new warehouse
router.post('/', warehouseController.createWarehouse);

// 更新倉庫信息 Update warehouse information
router.put('/:id', warehouseController.updateWarehouse);

// 刪除倉庫 Delete warehouse
router.delete('/:id', warehouseController.deleteWarehouse);

module.exports = router; 