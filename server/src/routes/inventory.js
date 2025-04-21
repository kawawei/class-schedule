const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const inventoryController = require('../controllers/inventoryController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// 所有路由都需要認證 All routes require authentication
router.use(authMiddleware);

// 配置 multer 存儲 Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 從請求中獲取租戶信息 Get tenant info from request
    const companyCode = req.user?.company?.company_code || 'default';
    
    // 構建目錄路徑：uploads/公司代碼/materials
    // Build directory path: uploads/companyCode/materials
    const uploadDir = path.join(__dirname, '../../uploads', companyCode, 'materials');
    
    // 確保目錄存在 Ensure directory exists
    fs.mkdirSync(uploadDir, { recursive: true });
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 生成文件名：時間戳.副檔名
    // Generate filename: timestamp.extension
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${timestamp}${ext}`);
  }
});

// 創建 multer 實例 Create multer instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 限制文件大小為 5MB Limit file size to 5MB
  },
  fileFilter: function (req, file, cb) {
    // 只允許上傳圖片 Only allow image uploads
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允許上傳圖片文件 / Only image files are allowed'));
    }
  }
});

// 獲取庫存列表 Get inventory list
router.get('/', inventoryController.getInventoryList);

// 獲取單個庫存詳情 Get single inventory details
router.get('/:id', inventoryController.getInventoryDetails);

// 創建庫存 Create inventory
router.post('/', upload.single('image'), inventoryController.createInventory);

// 更新庫存 Update inventory
router.put('/:id', upload.single('image'), inventoryController.updateInventory);

// 刪除庫存 Delete inventory
router.delete('/:id', inventoryController.deleteInventory);

// 更新倉庫庫存 Update warehouse inventory
router.put('/warehouse/:id', inventoryController.updateWarehouseInventory);

module.exports = router; 