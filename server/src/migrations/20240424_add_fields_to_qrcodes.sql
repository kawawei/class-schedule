-- 添加 random_string 和 custom_style 欄位到 qrcodes 表 Add random_string and custom_style fields to qrcodes table
ALTER TABLE qrcodes
ADD COLUMN IF NOT EXISTS random_string VARCHAR(10),
ADD COLUMN IF NOT EXISTS custom_style JSONB DEFAULT '{}'::jsonb;

-- 為現有的 QR Code 生成隨機字串 Generate random strings for existing QR codes
UPDATE qrcodes
SET random_string = SUBSTR(MD5(RANDOM()::TEXT), 1, 6)
WHERE random_string IS NULL;

-- 添加唯一性約束 Add unique constraint
ALTER TABLE qrcodes
ADD CONSTRAINT IF NOT EXISTS qrcodes_random_string_unique UNIQUE (random_string);

-- 添加註釋 Add comments
COMMENT ON COLUMN qrcodes.random_string IS '隨機字串 / Random string';
COMMENT ON COLUMN qrcodes.custom_style IS '自定義樣式 / Custom style'; 