-- 修改 teacher_id 欄位允許為空值 Modify teacher_id column to allow null values
ALTER TABLE public.course_schedules
ALTER COLUMN teacher_id DROP NOT NULL;

-- 更新欄位註釋 Update column comment
COMMENT ON COLUMN public.course_schedules.teacher_id IS '授課老師ID (null 表示待訂教師) Teacher ID (null means pending assignment)'; 