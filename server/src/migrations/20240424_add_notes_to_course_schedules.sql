-- 添加備註欄位到課程排課表 Add notes field to course schedules table
ALTER TABLE course_schedules
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 添加註釋 Add comments
COMMENT ON COLUMN course_schedules.notes IS '備註 Notes'; 