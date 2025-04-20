-- 更新 random_string 欄位長度限制 Update random_string column length limit
ALTER TABLE public.qrcodes
ALTER COLUMN random_string TYPE VARCHAR(12);

-- 更新現有的隨機字串為8-12位 Update existing random strings to 8-12 digits
UPDATE public.qrcodes
SET random_string = SUBSTR(MD5(RANDOM()::TEXT), 1, 8 + (RANDOM() * 4)::INTEGER)
WHERE LENGTH(random_string) < 8;

-- 添加註釋 Add comment
COMMENT ON COLUMN public.qrcodes.random_string IS '隨機字符串（8-12位）Random string (8-12 digits)'; 