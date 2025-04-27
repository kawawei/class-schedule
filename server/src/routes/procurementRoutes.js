// 引入必要的模塊 Import necessary modules
const express = require('express');
const router = express.Router();
const procurementController = require('../controllers/procurementController');

// 獲取所有採購單 Get all procurements
router.get('/', procurementController.getAllProcurements);

// 獲取單個採購單 Get single procurement
router.get('/:id', procurementController.getProcurement);

// 創建採購單 Create procurement
router.post('/', procurementController.createProcurement);

// 更新採購單 Update procurement
router.put('/:id', procurementController.updateProcurement);

// 審核採購單 Approve procurement
router.post('/:id/approve', procurementController.approveProcurement);

// 拒絕採購單 Reject procurement
router.post('/:id/reject', procurementController.rejectProcurement);

// 刪除採購單 Delete procurement
router.delete('/:id', procurementController.deleteProcurement);

module.exports = router; 