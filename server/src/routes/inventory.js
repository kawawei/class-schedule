const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

// 獲取庫存列表 Get inventory list
router.get('/', inventoryController.getInventoryList);

// 獲取單個庫存詳情 Get single inventory details
router.get('/:id', inventoryController.getInventoryDetails);

// 創建庫存 Create inventory
router.post('/', inventoryController.createInventory);

// 更新庫存 Update inventory
router.put('/:id', inventoryController.updateInventory);

// 刪除庫存 Delete inventory
router.delete('/:id', inventoryController.deleteInventory);

// 更新倉庫庫存 Update warehouse inventory
router.put('/warehouse/:id', inventoryController.updateWarehouseInventory);

module.exports = router; 