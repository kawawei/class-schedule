-- 添加規格欄位到庫存表 Add specifications column to inventories table
ALTER TABLE inventories
ADD COLUMN specifications JSON;

-- 添加規格庫存數據欄位到倉庫庫存表 Add specification inventory data column to warehouse_inventories table
ALTER TABLE warehouse_inventories
ADD COLUMN inventory JSON;

-- 更新註釋 Update comments
COMMENT ON COLUMN inventories.specifications IS '規格定義 / Specifications definition';
COMMENT ON COLUMN warehouse_inventories.inventory IS '規格庫存數據 / Specification inventory data'; 