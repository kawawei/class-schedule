-- 為 teachers 表新增 user_id 欄位 Add user_id column to teachers table
ALTER TABLE teachers
ADD COLUMN IF NOT EXISTS user_id INTEGER;

-- 設定 user_id 為外鍵 Set user_id as foreign key
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'teachers_user_id_fkey'
    ) THEN
        ALTER TABLE teachers
        ADD CONSTRAINT teachers_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 為 user_id 欄位添加註釋 Add comment to user_id column
COMMENT ON COLUMN teachers.user_id IS '對應 users 表的 ID，建立 teacher-user 關聯 / Corresponding user ID for teacher-user relation'; 