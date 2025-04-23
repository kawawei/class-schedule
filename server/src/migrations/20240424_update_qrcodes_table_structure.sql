-- 更新 qrcodes 表結構 Update qrcodes table structure
ALTER TABLE qrcodes
ALTER COLUMN id SET DEFAULT nextval('qrcodes_id_seq'::regclass),
ALTER COLUMN qrcode_url TYPE text,
ALTER COLUMN redirect_url TYPE text,
ALTER COLUMN actual_url TYPE text,
ALTER COLUMN random_string TYPE varchar(12),
ALTER COLUMN custom_style SET DEFAULT '{"width": 400, "margin": 1, "backgroundColor": "#FFFFFF", "foregroundColor": "#000000", "errorCorrectionLevel": "H"}'::jsonb;

-- 創建序列（如果不存在）Create sequence if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'qrcodes_id_seq') THEN
        CREATE SEQUENCE qrcodes_id_seq;
    END IF;
END $$;

-- 添加外鍵約束 Add foreign key constraint
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'qrcodes_tenant_id_fkey'
    ) THEN
        ALTER TABLE qrcodes
        ADD CONSTRAINT qrcodes_tenant_id_fkey 
        FOREIGN KEY (tenant_id) 
        REFERENCES tenants(id);
    END IF;
END $$;

-- 添加索引 Add indexes
CREATE INDEX IF NOT EXISTS idx_qrcodes_name ON qrcodes(name);
CREATE INDEX IF NOT EXISTS idx_qrcodes_qrcode_url ON qrcodes(qrcode_url); 