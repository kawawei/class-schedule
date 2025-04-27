// 引入必要的模塊 Import necessary modules
const Procurement = require('../models/procurement');
const { Op } = require('sequelize');
const { format } = require('date-fns');

// 獲取所有採購單 Get all procurements
exports.getAllProcurements = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      supplier, 
      status, 
      search 
    } = req.query;

    // 構建查詢條件 Build query conditions
    const where = {};
    
    // 日期範圍查詢 Date range query
    if (startDate && endDate) {
      where.procurementDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // 供應商查詢 Supplier query
    if (supplier) {
      where.supplier = supplier;
    }

    // 狀態查詢 Status query
    if (status) {
      where.status = status;
    }

    // 搜尋查詢 Search query
    if (search) {
      where[Op.or] = [
        { procurementNo: { [Op.like]: `%${search}%` } },
        { supplier: { [Op.like]: `%${search}%` } }
      ];
    }

    // 查詢採購單 Query procurements
    const procurements = await Procurement.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: procurements
    });
  } catch (error) {
    console.error('獲取採購單列表失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取採購單列表失敗'
    });
  }
};

// 獲取單個採購單 Get single procurement
exports.getProcurement = async (req, res) => {
  try {
    const { id } = req.params;
    const procurement = await Procurement.findByPk(id);

    if (!procurement) {
      return res.status(404).json({
        success: false,
        message: '採購單不存在'
      });
    }

    res.json({
      success: true,
      data: procurement
    });
  } catch (error) {
    console.error('獲取採購單詳情失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取採購單詳情失敗'
    });
  }
};

// 創建採購單 Create procurement
exports.createProcurement = async (req, res) => {
  try {
    const {
      procurementNo,
      procurementDate,
      supplier,
      items,
      currency,
      remark,
      extraCharges
    } = req.body;

    // 計算總金額 Calculate total amount
    const totalAmount = items.reduce((sum, item) => {
      return sum + (Number(item.quantity) * Number(item.unitPrice));
    }, 0);

    // 創建採購單 Create procurement
    const procurement = await Procurement.create({
      procurementNo,
      procurementDate,
      supplier,
      items,
      totalAmount,
      currency,
      remark,
      extraCharges,
      status: 'draft'
    });

    res.status(201).json({
      success: true,
      data: procurement,
      message: '採購單創建成功'
    });
  } catch (error) {
    console.error('創建採購單失敗:', error);
    res.status(500).json({
      success: false,
      message: '創建採購單失敗'
    });
  }
};

// 更新採購單 Update procurement
exports.updateProcurement = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      procurementDate,
      supplier,
      items,
      currency,
      remark,
      extraCharges
    } = req.body;

    // 查找採購單 Find procurement
    const procurement = await Procurement.findByPk(id);
    if (!procurement) {
      return res.status(404).json({
        success: false,
        message: '採購單不存在'
      });
    }

    // 計算總金額 Calculate total amount
    const totalAmount = items.reduce((sum, item) => {
      return sum + (Number(item.quantity) * Number(item.unitPrice));
    }, 0);

    // 更新採購單 Update procurement
    await procurement.update({
      procurementDate,
      supplier,
      items,
      totalAmount,
      currency,
      remark,
      extraCharges
    });

    res.json({
      success: true,
      data: procurement,
      message: '採購單更新成功'
    });
  } catch (error) {
    console.error('更新採購單失敗:', error);
    res.status(500).json({
      success: false,
      message: '更新採購單失敗'
    });
  }
};

// 審核採購單 Approve procurement
exports.approveProcurement = async (req, res) => {
  try {
    const { id } = req.params;
    const procurement = await Procurement.findByPk(id);

    if (!procurement) {
      return res.status(404).json({
        success: false,
        message: '採購單不存在'
      });
    }

    if (procurement.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: '只能審核待審核狀態的採購單'
      });
    }

    await procurement.update({ status: 'approved' });

    res.json({
      success: true,
      message: '採購單審核成功'
    });
  } catch (error) {
    console.error('審核採購單失敗:', error);
    res.status(500).json({
      success: false,
      message: '審核採購單失敗'
    });
  }
};

// 拒絕採購單 Reject procurement
exports.rejectProcurement = async (req, res) => {
  try {
    const { id } = req.params;
    const procurement = await Procurement.findByPk(id);

    if (!procurement) {
      return res.status(404).json({
        success: false,
        message: '採購單不存在'
      });
    }

    if (procurement.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: '只能拒絕待審核狀態的採購單'
      });
    }

    await procurement.update({ status: 'rejected' });

    res.json({
      success: true,
      message: '採購單拒絕成功'
    });
  } catch (error) {
    console.error('拒絕採購單失敗:', error);
    res.status(500).json({
      success: false,
      message: '拒絕採購單失敗'
    });
  }
};

// 刪除採購單 Delete procurement
exports.deleteProcurement = async (req, res) => {
  try {
    const { id } = req.params;
    const procurement = await Procurement.findByPk(id);

    if (!procurement) {
      return res.status(404).json({
        success: false,
        message: '採購單不存在'
      });
    }

    if (procurement.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: '只能刪除草稿狀態的採購單'
      });
    }

    await procurement.destroy();

    res.json({
      success: true,
      message: '採購單刪除成功'
    });
  } catch (error) {
    console.error('刪除採購單失敗:', error);
    res.status(500).json({
      success: false,
      message: '刪除採購單失敗'
    });
  }
}; 