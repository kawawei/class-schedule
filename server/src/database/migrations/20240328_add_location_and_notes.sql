-- 添加縣市和區域欄位 Add county and district columns
ALTER TABLE public.course_schedules
ADD COLUMN county VARCHAR(255) NOT NULL DEFAULT '',
ADD COLUMN district VARCHAR(255) NOT NULL DEFAULT '';

-- 添加備註欄位 Add notes column
ALTER TABLE public.course_schedules
ADD COLUMN notes TEXT;

-- 更新欄位註釋 Update column comments
COMMENT ON COLUMN public.course_schedules.county IS '縣市 County';
COMMENT ON COLUMN public.course_schedules.district IS '區域 District';
COMMENT ON COLUMN public.course_schedules.notes IS '備註 Notes';

-- 添加地理位置索引 Add location index
CREATE INDEX idx_schedule_location ON public.course_schedules (county, district);

-- 更新課程鐘點費和老師實拿鐘點設定 Update course_fee and teacher_fee settings
ALTER TABLE public.course_schedules
ALTER COLUMN course_fee DROP NOT NULL,
ALTER COLUMN teacher_fee DROP NOT NULL,
ALTER COLUMN course_fee SET DEFAULT NULL,
ALTER COLUMN teacher_fee SET DEFAULT NULL; 