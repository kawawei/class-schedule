-- 添加 image_url 欄位到 inventories 表
-- Add image_url column to inventories table
ALTER TABLE public.inventories
ADD COLUMN image_url VARCHAR(255);

-- 添加註釋
-- Add comment
COMMENT ON COLUMN public.inventories.image_url IS '圖片 URL / Image URL'; 