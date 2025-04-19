-- 添加 QR Code 自定義樣式欄位 Add QR Code custom style column
ALTER TABLE public.qrcodes
ADD COLUMN custom_style JSONB DEFAULT '{
  "errorCorrectionLevel": "H",
  "foregroundColor": "#000000",
  "backgroundColor": "#FFFFFF",
  "margin": 1,
  "width": 400
}'::jsonb;

-- 添加註釋 Add comment
COMMENT ON COLUMN public.qrcodes.custom_style IS 'QR Code 自定義樣式設置 QR Code custom style settings'; 