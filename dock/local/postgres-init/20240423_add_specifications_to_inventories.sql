-- 添加規格字段到庫存表 Add specifications column to inventories table
ALTER TABLE inventories 
ADD COLUMN specifications JSONB;

-- 添加註釋 Add comment
COMMENT ON COLUMN inventories.specifications IS '規格信息（可選）/ Specifications information (optional)'; 