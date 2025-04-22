-- 添加 location_id 欄位到 warehouse_inventories 表
-- Add location_id column to warehouse_inventories table
ALTER TABLE warehouse_inventories
ADD COLUMN location_id INTEGER REFERENCES warehouses(id);

-- 更新註釋
-- Update comments
COMMENT ON COLUMN warehouse_inventories.location_id IS '倉庫ID / Warehouse ID'; 