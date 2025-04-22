const { Op } = require('sequelize');
const Inventory = require('../models/inventory');
const WarehouseInventory = require('../models/warehouseInventory');
const path = require('path');
const fs = require('fs');

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
        attributes: ['location', 'location_id', 'quantity', 'defectiveQuantity']
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
        attributes: ['location', 'location_id', 'quantity', 'defectiveQuantity']
      }],
      attributes: {
        include: ['id', 'name', 'courseType', 'minQuantity', 'unitPrice', 'unitPriceCurrency',
                 'cost', 'costCurrency', 'notes', 'qrcode_url', 'qrcode_name', 'image_url',
                 'specifications'] // 確保包含 specifications 字段
      }
    });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: '找不到該庫存 / Inventory not found'
      });
    }

    // 添加日誌輸出 Add log output
    console.log('=== 返回的庫存詳情數據 (Returned Inventory Details) ===');
    console.log(JSON.stringify(inventory, null, 2));

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
    let inventoryData;
    let imageFile;

    // 檢查請求格式 Check request format
    if (req.is('multipart/form-data')) {
      // 如果是 FormData 格式 If it's FormData format
      if (!req.body.data) {
        return res.status(400).json({
          success: false,
          message: '缺少必要的數據 / Missing required data'
        });
      }

      try {
        inventoryData = typeof req.body.data === 'string' 
          ? JSON.parse(req.body.data)
          : req.body.data;
      } catch (parseError) {
        console.error('解析數據失敗:', parseError);
        return res.status(400).json({
          success: false,
          message: '數據格式不正確 / Invalid data format'
        });
      }

      // 保存圖片文件引用 Save image file reference
      if (req.file) {
        imageFile = req.file;
      }
    } else {
      // 如果是 JSON 格式 If it's JSON format
      inventoryData = req.body;
    }

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
      warehouses,
      specifications
    } = inventoryData;

    // 驗證必要字段 Validate required fields
    if (!name || !courseType) {
      return res.status(400).json({
        success: false,
        message: '缺少必要字段 / Missing required fields'
      });
    }

    // 創建庫存記錄 Create inventory record
    const inventory = await Inventory.create({
      name,
      courseType,
      minQuantity: Number(minQuantity) || 0,
      unitPrice: Number(unitPrice) || 0,
      unitPriceCurrency: unitPriceCurrency || 'NT$',
      cost: Number(cost) || 0,
      costCurrency: costCurrency || 'NT$',
      notes,
      qrcode_url,
      qrcode_name,
      specifications
    });

    // 如果有圖片，在創建記錄後設置圖片路徑 If there's an image, set the image path after creating the record
    if (imageFile) {
      const companyCode = req.user?.company?.company_code || 'default';
      const filename = path.basename(imageFile.path);
      const imageUrl = `/uploads/${companyCode}/materials/${filename}`;
      
      // 更新庫存記錄的圖片URL Update inventory record with image URL
      await inventory.update({ image_url: imageUrl });
    }

    // 創建倉庫庫存記錄（如果提供了倉庫數據）Create warehouse inventory records (if warehouse data is provided)
    if (warehouses && warehouses.length > 0) {
      // 過濾掉沒有選擇倉庫位置的記錄 Filter out records without warehouse location
      const validWarehouses = warehouses.filter(warehouse => warehouse.location);
      
      if (validWarehouses.length > 0) {
        const warehouseRecords = validWarehouses.map(warehouse => ({
          inventoryId: inventory.id,
          location: warehouse.location,
          location_id: warehouse.location_id,
          quantity: Number(warehouse.quantity) || 0,
          defectiveQuantity: Number(warehouse.defectiveQuantity) || 0
        }));

        await WarehouseInventory.bulkCreate(warehouseRecords);
      }
    }

    // 獲取完整的庫存信息 Get complete inventory information
    const completeInventory = await Inventory.findByPk(inventory.id, {
      include: [{
        model: WarehouseInventory,
        as: 'warehouses',
        attributes: ['location', 'location_id', 'quantity', 'defectiveQuantity']
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
      message: '創建庫存失敗 / Failed to create inventory',
      error: error.message
    });
  }
};

// 更新庫存 Update inventory
exports.updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 驗證ID是否為有效數字 Validate if ID is a valid number
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: '無效的庫存ID / Invalid inventory ID'
      });
    }

    let inventoryData;

    // 檢查請求格式 Check request format
    if (req.is('multipart/form-data')) {
      // 如果是 FormData 格式 If it's FormData format
      if (!req.body.data) {
        return res.status(400).json({
          success: false,
          message: '缺少必要的數據 / Missing required data'
        });
      }

      try {
        inventoryData = typeof req.body.data === 'string' 
          ? JSON.parse(req.body.data)
          : req.body.data;
      } catch (parseError) {
        console.error('解析數據失敗:', parseError);
        return res.status(400).json({
          success: false,
          message: '數據格式不正確 / Invalid data format'
        });
      }

      // 如果有上傳圖片，添加圖片路徑 If image is uploaded, add image path
      if (req.file) {
        // 構建相對路徑 Build relative path
        const companyCode = req.user?.companyCode || 'default';
        const materialId = id;
        const filename = path.basename(req.file.path);
        inventoryData.image_url = `/uploads/${companyCode}/materials/${materialId}/${filename}`;
      }
    } else {
      // 如果是 JSON 格式 If it's JSON format
      inventoryData = req.body;
    }

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
      warehouses,
      specifications,
      image_url
    } = inventoryData;

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
      minQuantity: Number(minQuantity) || 0,
      unitPrice: Number(unitPrice) || 0,
      unitPriceCurrency: unitPriceCurrency || 'NT$',
      cost: Number(cost) || 0,
      costCurrency: costCurrency || 'NT$',
      notes,
      qrcode_url,
      qrcode_name,
      specifications,
      ...(image_url && { image_url })
    });

    // 更新倉庫庫存信息 Update warehouse inventory information
    if (warehouses && warehouses.length > 0) {
      // 過濾掉沒有選擇倉庫位置的記錄 Filter out records without warehouse location
      const validWarehouses = warehouses.filter(warehouse => warehouse.location);
      
      // 刪除現有的倉庫記錄 Delete existing warehouse records
      await WarehouseInventory.destroy({
        where: { inventoryId: id }
      });

      if (validWarehouses.length > 0) {
        // 創建新的倉庫記錄 Create new warehouse records
        const warehouseRecords = validWarehouses.map(warehouse => ({
          inventoryId: id,
          location: warehouse.location,
          location_id: warehouse.location_id,
          quantity: Number(warehouse.quantity) || 0,
          defectiveQuantity: Number(warehouse.defectiveQuantity) || 0
        }));

        await WarehouseInventory.bulkCreate(warehouseRecords);
      }
    }

    // 獲取更新後的完整信息 Get updated complete information
    const updatedInventory = await Inventory.findByPk(id, {
      include: [{
        model: WarehouseInventory,
        as: 'warehouses',
        attributes: ['location', 'location_id', 'quantity', 'defectiveQuantity']
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
      message: '更新庫存失敗 / Failed to update inventory',
      error: error.message
    });
  }
};

// 刪除庫存 Delete inventory
exports.deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;

    // 查找要刪除的庫存 Find inventory to delete
    const inventory = await Inventory.findByPk(id);
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: '找不到該庫存 / Inventory not found'
      });
    }

    // 如果有圖片，刪除圖片文件 If there's an image, delete the image file
    if (inventory.image_url) {
      const imagePath = path.join(__dirname, '..', '..', inventory.image_url);
      try {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      } catch (error) {
        console.error('刪除圖片文件失敗:', error);
      }
    }

    // 刪除相關的倉庫庫存記錄 Delete related warehouse inventory records
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
      message: '刪除庫存失敗 / Failed to delete inventory',
      error: error.message
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