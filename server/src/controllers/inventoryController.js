const { Op } = require('sequelize');
const Inventory = require('../models/inventory');
const WarehouseInventory = require('../models/warehouseInventory');

// 獲取庫存列表 Get inventory list
exports.getInventoryList = async (req, res) => {
  try {
    console.log('開始獲取庫存列表 Start getting inventory list:', {
      user: req.user,
      method: req.method,
      url: req.url
    });

    const inventories = await Inventory.findAll({
      include: [{
        model: WarehouseInventory,
        as: 'warehouses',
        attributes: ['location', 'quantity', 'defectiveQuantity']
      }]
    });

    // 確保返回的數據是數組 Ensure returned data is an array
    const inventoryList = Array.isArray(inventories) ? inventories : [];

    console.log('成功獲取庫存列表 Successfully got inventory list:', { 
      totalInventories: inventoryList.length,
      processingTime: Date.now() - req.startTime 
    });

    res.json({
      success: true,
      data: inventoryList
    });
  } catch (error) {
    console.error('獲取庫存列表失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取庫存列表失敗 / Failed to get inventory list'
    });
  }
};

// 獲取單個庫存詳情 Get single inventory details
exports.getInventoryDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const inventory = await Inventory.findByPk(id, {
      include: [{
        model: WarehouseInventory,
        as: 'warehouses',
        attributes: ['location', 'quantity', 'defectiveQuantity']
      }]
    });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: '找不到該庫存 / Inventory not found'
      });
    }

    res.json({
      success: true,
      data: inventory
    });
  } catch (error) {
    console.error('獲取庫存詳情失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取庫存詳情失敗 / Failed to get inventory details'
    });
  }
};

// 創建庫存 Create inventory
exports.createInventory = async (req, res) => {
  try {
    const {
      name,
      courseType,
      minQuantity,
      unitPrice,
      unitPriceCurrency,
      cost,
      costCurrency,
      notes,
      qrcode_url,
      qrcode_name,
      warehouses
    } = req.body;

    // 創建庫存記錄 Create inventory record
    const inventory = await Inventory.create({
      name,
      courseType,
      minQuantity,
      unitPrice,
      unitPriceCurrency,
      cost,
      costCurrency,
      notes,
      qrcode_url,
      qrcode_name
    });

    // 創建倉庫庫存記錄 Create warehouse inventory records
    if (warehouses && warehouses.length > 0) {
      const warehouseRecords = warehouses.map(warehouse => ({
        inventoryId: inventory.id,
        location: warehouse.location,
        quantity: warehouse.quantity,
        defectiveQuantity: warehouse.defectiveQuantity
      }));

      await WarehouseInventory.bulkCreate(warehouseRecords);
    }

    // 獲取完整的庫存信息 Get complete inventory information
    const completeInventory = await Inventory.findByPk(inventory.id, {
      include: [{
        model: WarehouseInventory,
        as: 'warehouses',
        attributes: ['location', 'quantity', 'defectiveQuantity']
      }]
    });

    res.status(201).json({
      success: true,
      message: '創建成功 / Creation successful',
      data: completeInventory
    });
  } catch (error) {
    console.error('創建庫存失敗:', error);
    res.status(500).json({
      success: false,
      message: '創建庫存失敗 / Failed to create inventory'
    });
  }
};

// 更新庫存 Update inventory
exports.updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      courseType,
      minQuantity,
      unitPrice,
      unitPriceCurrency,
      cost,
      costCurrency,
      notes,
      qrcode_url,
      qrcode_name,
      warehouses
    } = req.body;

    // 檢查庫存是否存在 Check if inventory exists
    const inventory = await Inventory.findByPk(id);
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: '找不到該庫存 / Inventory not found'
      });
    }

    // 更新庫存信息 Update inventory information
    await inventory.update({
      name,
      courseType,
      minQuantity,
      unitPrice,
      unitPriceCurrency,
      cost,
      costCurrency,
      notes,
      qrcode_url,
      qrcode_name
    });

    // 更新倉庫庫存信息 Update warehouse inventory information
    if (warehouses && warehouses.length > 0) {
      // 刪除現有的倉庫記錄 Delete existing warehouse records
      await WarehouseInventory.destroy({
        where: { inventoryId: id }
      });

      // 創建新的倉庫記錄 Create new warehouse records
      const warehouseRecords = warehouses.map(warehouse => ({
        inventoryId: id,
        location: warehouse.location,
        quantity: warehouse.quantity,
        defectiveQuantity: warehouse.defectiveQuantity
      }));

      await WarehouseInventory.bulkCreate(warehouseRecords);
    }

    // 獲取更新後的完整信息 Get updated complete information
    const updatedInventory = await Inventory.findByPk(id, {
      include: [{
        model: WarehouseInventory,
        as: 'warehouses',
        attributes: ['location', 'quantity', 'defectiveQuantity']
      }]
    });

    res.json({
      success: true,
      message: '更新成功 / Update successful',
      data: updatedInventory
    });
  } catch (error) {
    console.error('更新庫存失敗:', error);
    res.status(500).json({
      success: false,
      message: '更新庫存失敗 / Failed to update inventory'
    });
  }
};

// 刪除庫存 Delete inventory
exports.deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;

    // 檢查庫存是否存在 Check if inventory exists
    const inventory = await Inventory.findByPk(id);
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: '找不到該庫存 / Inventory not found'
      });
    }

    // 刪除相關的倉庫記錄 Delete related warehouse records
    await WarehouseInventory.destroy({
      where: { inventoryId: id }
    });

    // 刪除庫存記錄 Delete inventory record
    await inventory.destroy();

    res.json({
      success: true,
      message: '刪除成功 / Deletion successful'
    });
  } catch (error) {
    console.error('刪除庫存失敗:', error);
    res.status(500).json({
      success: false,
      message: '刪除庫存失敗 / Failed to delete inventory'
    });
  }
};

// 更新倉庫庫存 Update warehouse inventory
exports.updateWarehouseInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { location, quantity, defectiveQuantity } = req.body;

    // 檢查倉庫庫存是否存在 Check if warehouse inventory exists
    const warehouseInventory = await WarehouseInventory.findByPk(id);
    if (!warehouseInventory) {
      return res.status(404).json({
        success: false,
        message: '找不到該倉庫庫存記錄 / Warehouse inventory record not found'
      });
    }

    // 更新倉庫庫存信息 Update warehouse inventory information
    await warehouseInventory.update({
      quantity,
      defectiveQuantity
    });

    res.json({
      success: true,
      message: '更新成功 / Update successful',
      data: warehouseInventory
    });
  } catch (error) {
    console.error('更新倉庫庫存失敗:', error);
    res.status(500).json({
      success: false,
      message: '更新倉庫庫存失敗 / Failed to update warehouse inventory'
    });
  }
}; 