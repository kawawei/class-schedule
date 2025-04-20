-- 添加 random_string 欄位到 qrcodes 表 Add random_string column to qrcodes table
ALTER TABLE public.qrcodes
ADD COLUMN random_string VARCHAR(10);

-- 為現有的 QR Code 生成隨機字串 Generate random strings for existing QR codes
UPDATE public.qrcodes
SET random_string = SUBSTR(MD5(RANDOM()::TEXT), 1, 6)
WHERE random_string IS NULL;

-- 添加唯一性約束 Add unique constraint
ALTER TABLE public.qrcodes
ADD CONSTRAINT qrcodes_random_string_unique UNIQUE (random_string); 