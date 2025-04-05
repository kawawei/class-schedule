-- 創建租戶表（如果不存在）Create tenants table if not exists
CREATE TABLE IF NOT EXISTS tenants (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(100) NOT NULL,
    company_code VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 創建租戶表索引（如果不存在）Create index if not exists
CREATE INDEX IF NOT EXISTS idx_tenants_company_code ON tenants(company_code);

-- 設置權限 Set permissions
ALTER TABLE tenants OWNER TO postgres;

-- 創建課程排課表（如果不存在）Create course schedules table if not exists
CREATE TABLE IF NOT EXISTS course_schedules (
    id SERIAL PRIMARY KEY,
    series_id VARCHAR(36) DEFAULT NULL,
    school_name VARCHAR(100) NOT NULL,
    class_name VARCHAR(100) NOT NULL,
    course_type VARCHAR(50) NOT NULL,
    teacher_id INTEGER NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    course_fee DECIMAL(10, 2) NOT NULL,
    teacher_fee DECIMAL(10, 2) NOT NULL,
    company_code VARCHAR(50) NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_days JSON DEFAULT '[]',
    recurring_start_date DATE,
    recurring_end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 創建課程排課表索引（如果不存在）Create indexes if not exists
CREATE INDEX IF NOT EXISTS idx_schedule_teacher_id ON course_schedules(teacher_id);
CREATE INDEX IF NOT EXISTS idx_schedule_date ON course_schedules(date);
CREATE INDEX IF NOT EXISTS idx_schedule_company_code ON course_schedules(company_code);
CREATE INDEX IF NOT EXISTS idx_schedule_is_recurring ON course_schedules(is_recurring);
CREATE INDEX IF NOT EXISTS idx_schedule_recurring_start_date ON course_schedules(recurring_start_date);
CREATE INDEX IF NOT EXISTS idx_schedule_recurring_end_date ON course_schedules(recurring_end_date);
CREATE INDEX IF NOT EXISTS idx_schedule_series_id ON course_schedules(series_id);

-- 設置權限 Set permissions
ALTER TABLE course_schedules OWNER TO postgres; 