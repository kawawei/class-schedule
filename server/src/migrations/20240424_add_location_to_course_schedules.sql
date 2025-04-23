-- 添加位置相關欄位到課程排課表 Add location fields to course schedules table
ALTER TABLE course_schedules
ADD COLUMN IF NOT EXISTS county VARCHAR(255) NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS district VARCHAR(255) NOT NULL DEFAULT '';

-- 更新現有數據 Update existing data
UPDATE course_schedules
SET county = school_name,
    district = class_name
WHERE county = '' AND district = '';

-- 添加位置索引 Add location index
CREATE INDEX IF NOT EXISTS idx_schedule_location ON course_schedules(county, district);

-- 添加註釋 Add comments
COMMENT ON COLUMN course_schedules.county IS '縣市 County';
COMMENT ON COLUMN course_schedules.district IS '區域 District'; 