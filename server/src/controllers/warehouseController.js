const { Warehouse } = require('../models');
const { validateWarehouse } = require('../validators/warehouseValidator');
const ApiError = require('../utils/apiError');

// 獲取倉庫列表 Get warehouse list
exports.getWarehouses = async (req, res, next) => {
  try {
    // 從請求中獲取公司代碼 Get company code from request
    const company_code = req.user.companyCode;

    // 查詢該公司的所有倉庫 Query all warehouses for the company
    const warehouses = await Warehouse.findAll({
      where: { company_code },
      order: [['created_at', 'DESC']]
    });

    res.json(warehouses);
  } catch (error) {
    next(error);
  }
};

// 獲取單個倉庫詳情 Get single warehouse details
exports.getWarehouse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const company_code = req.user.companyCode;

    // 查詢指定倉庫 Query specified warehouse
    const warehouse = await Warehouse.findOne({
      where: { id, company_code }
    });

    if (!warehouse) {
      throw new ApiError(404, '找不到該倉庫 Warehouse not found');
    }

    res.json(warehouse);
  } catch (error) {
    next(error);
  }
};

// 創建新倉庫 Create new warehouse
exports.createWarehouse = async (req, res, next) => {
  try {
    const company_code = req.user.companyCode;
    const warehouseData = { ...req.body, company_code };

    // 驗證倉庫數據 Validate warehouse data
    const { error } = validateWarehouse(warehouseData);
    if (error) {
      throw new ApiError(400, error.details[0].message);
    }

    // 創建新倉庫 Create new warehouse
    const warehouse = await Warehouse.create(warehouseData);

    res.status(201).json(warehouse);
  } catch (error) {
    next(error);
  }
};

// 更新倉庫信息 Update warehouse information
exports.updateWarehouse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const company_code = req.user.companyCode;
    const updateData = { ...req.body, company_code };

    // 驗證更新數據 Validate update data
    const { error } = validateWarehouse(updateData);
    if (error) {
      throw new ApiError(400, error.details[0].message);
    }

    // 查找並更新倉庫 Find and update warehouse
    const warehouse = await Warehouse.findOne({
      where: { id, company_code }
    });

    if (!warehouse) {
      throw new ApiError(404, '找不到該倉庫 Warehouse not found');
    }

    // 更新倉庫信息 Update warehouse information
    await warehouse.update(updateData);

    res.json(warehouse);
  } catch (error) {
    next(error);
  }
};

// 刪除倉庫 Delete warehouse
exports.deleteWarehouse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const company_code = req.user.companyCode;

    // 查找並刪除倉庫 Find and delete warehouse
    const warehouse = await Warehouse.findOne({
      where: { id, company_code }
    });

    if (!warehouse) {
      throw new ApiError(404, '找不到該倉庫 Warehouse not found');
    }

    // 刪除倉庫 Delete warehouse
    await warehouse.destroy();

    res.status(204).end();
  } catch (error) {
    next(error);
  }
}; 