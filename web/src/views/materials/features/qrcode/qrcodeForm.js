// QRCode 表單相關的狀態管理和驗證邏輯
// QRCode form related state management and validation logic
import { ref, watch } from 'vue';
import axios from 'axios';  // 導入 axios 用於發送 HTTP 請求 Import axios for sending HTTP requests
import { API_BASE_URL } from '@/utils/api';
import { createQRCode, updateQRCode } from './qrcodeTable';

// 表單初始狀態 Initial form state
const initialFormState = {
  name: '',
  target_url: '',
  error: '',
  preview_url: '', // 預覽用的中間跳轉連結 Preview redirect URL
  qrcode_preview: '', // QRCode 預覽圖片 QRCode preview image
  preview_id: null, // 保存預覽 ID Save preview ID
  is_editing: false, // 標記為編輯模式 Mark as edit mode
  custom_style: { // 自定義樣式設置 Custom style settings
    foregroundColor: '#000000', // 前景色 Foreground color
    backgroundColor: '#FFFFFF', // 背景色 Background color
    margin: 4, // 邊距 Margin
    width: 200, // 寬度 Width
    errorCorrectionLevel: 'M', // 容錯級別 Error correction level
    logoUrl: '', // Logo 圖片 URL Logo image URL
    logoSize: 15, // Logo 大小（佔 QR Code 的百分比）Logo size (percentage of QR Code)
    logoData: null // Logo 圖片的 base64 數據 Logo image base64 data
  }
};

export function useQRCodeForm() {
  // 表單狀態 Form state
  const form = ref({ ...initialFormState });

  // 重置表單 Reset form
  const resetForm = () => {
    form.value = { ...initialFormState };
  };

  // 設置編輯模式 Set edit mode
  const setEditMode = (row) => {
    form.value = {
      id: row.id,
      name: row.name,
      target_url: row.actual_url,
      error: '',
      preview_url: row.redirect_url,
      qrcode_preview: row.qrcode_url.startsWith('http') 
        ? row.qrcode_url 
        : `${API_BASE_URL}${row.qrcode_url}?t=${Date.now()}&style=${encodeURIComponent(JSON.stringify(row.custom_style || {}))}`,
      is_editing: true,
      preview_id: row.random_string, // 保存現有的 random_string Save existing random_string
      custom_style: {
        foregroundColor: row.custom_style?.foregroundColor || '#000000',
        backgroundColor: row.custom_style?.backgroundColor || '#FFFFFF',
        margin: row.custom_style?.margin || 4,
        width: row.custom_style?.width || 200,
        errorCorrectionLevel: row.custom_style?.errorCorrectionLevel || 'M',
        logoUrl: row.custom_style?.logoUrl || '',
        logoSize: row.custom_style?.logoSize || 15,
        logoData: row.custom_style?.logoData || null
      }
    };
  };

  // 更新預覽 Update preview
  const updatePreview = async () => {
    try {
      if (form.value.target_url) {
        const response = await axios.post('/qrcode/preview', {
          target_url: form.value.target_url,
          custom_style: {
            ...form.value.custom_style,
            // 如果有 Logo，確保使用 H 級別的容錯率
            // If logo exists, ensure using H level error correction
            errorCorrectionLevel: form.value.custom_style.logoUrl ? 'H' : form.value.custom_style.errorCorrectionLevel
          },
          preview_id: form.value.preview_id // 使用保存的 random_string Use saved random_string
        });

        form.value.qrcode_preview = `${API_BASE_URL}${response.data.data.qrcode_url}?t=${Date.now()}&style=${encodeURIComponent(JSON.stringify(form.value.custom_style))}`;
        
        if (!form.value.is_editing) {
          form.value.preview_url = response.data.data.redirect_url;
          form.value.preview_id = response.data.data.id;
        }
      } else {
        form.value.preview_url = '';
        form.value.qrcode_preview = '';
        form.value.preview_id = null;
      }
    } catch (error) {
      console.error('生成 QR Code 預覽失敗:', error);
      form.value.error = error.response?.data?.message || '生成 QR Code 預覽失敗';
    }
  };

  // 監聽目標連結變化 Watch target URL changes
  watch(() => form.value.target_url, async (newUrl) => {
    if (newUrl) {
      await updatePreview();
    }
  });

  // 監聽樣式變化 Watch style changes
  watch(() => form.value.custom_style, async (newStyle) => {
    if (form.value.target_url) {
      try {
        const response = await axios.post('/qrcode/preview', {
          target_url: form.value.target_url,
          custom_style: newStyle,
          preview_id: form.value.preview_id  // 保持使用相同的預覽 ID Keep using the same preview ID
        });
        
        form.value.qrcode_preview = `${API_BASE_URL}${response.data.data.qrcode_url}?t=${Date.now()}`; // 添加時間戳避免緩存 Add timestamp to avoid caching
        
        // 只在非編輯模式下更新系統跳轉連結 Only update redirect URL in non-edit mode
        if (!form.value.is_editing) {
          form.value.preview_url = response.data.data.redirect_url;
        }
      } catch (error) {
        console.error('更新 QR Code 預覽失敗:', error);
        form.value.error = error.response?.data?.message || '更新 QR Code 預覽失敗';
      }
    }
  }, { deep: true });

  // 提交表單 Submit form
  const submitForm = async () => {
    try {
      form.value.error = '';
      
      if (!form.value.name || !form.value.target_url) {
        form.value.error = '請填寫所有必填欄位 Please fill in all required fields';
        return false;
      }

      // 檢查目標連結格式 Check target URL format
      try {
        const url = new URL(form.value.target_url);
        if (!url.protocol.startsWith('http')) {
          form.value.error = '目標連結必須以 http:// 或 https:// 開頭 Target URL must start with http:// or https://';
          return false;
        }
      } catch (e) {
        form.value.error = '請輸入有效的目標連結，例如：https://example.com Please enter a valid target URL, e.g., https://example.com';
        return false;
      }

      const data = {
        name: form.value.name,
        target_url: form.value.target_url,
        custom_style: form.value.custom_style,
        qrcode_url: form.value.qrcode_preview?.replace(`${API_BASE_URL}`, '').split('?')[0] // 保存預覽圖片路徑 Save preview image path
      };

      if (form.value.is_editing) {
        // 更新現有 QR Code Update existing QR Code
        await updateQRCode(form.value.id, data);
      } else {
        // 創建新的 QR Code Create new QR Code
        data.preview_id = form.value.preview_id;
        await createQRCode(data);
      }

      return true;
    } catch (error) {
      console.error('提交 QR Code 失敗 Failed to submit QR Code:', error);
      form.value.error = error.response?.data?.message || '提交 QR Code 失敗 Failed to submit QR Code';
      return false;
    }
  };

  // 處理 Logo 上傳 Handle logo upload
  const handleLogoUpload = async (file) => {
    // 驗證文件類型 Validate file type
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      form.value.error = '請上傳 JPG、PNG 或 GIF 格式的圖片 Please upload JPG, PNG or GIF image';
      return;
    }

    // 驗證文件大小（最大 2MB）Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      form.value.error = '圖片大小不能超過 2MB Image size cannot exceed 2MB';
      return;
    }

    try {
      // 讀取文件為 base64 Read file as base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        // 創建圖片對象以獲取尺寸 Create image object to get dimensions
        const img = new Image();
        img.onload = async () => {
          // 驗證圖片尺寸（最小 32x32，最大 2048x2048）
          // Validate image dimensions (min 32x32, max 2048x2048)
          if (img.width < 32 || img.height < 32) {
            form.value.error = '圖片尺寸太小，最小需要 32x32 像素 Image is too small, minimum size is 32x32 pixels';
            return;
          }
          if (img.width > 2048 || img.height > 2048) {
            form.value.error = '圖片尺寸太大，最大允許 2048x2048 像素 Image is too large, maximum size is 2048x2048 pixels';
            return;
          }

          // 更新 Logo 相關設置 Update logo related settings
          form.value.custom_style.logoUrl = e.target.result;
          form.value.custom_style.logoData = e.target.result.split(',')[1];
          form.value.custom_style.logoSize = 15; // 預設大小 15% Default size 15%

          // 如果容錯率低於 H，自動提升到 H
          // If error correction level is lower than H, automatically increase to H
          if (form.value.custom_style.errorCorrectionLevel !== 'H') {
            form.value.custom_style.errorCorrectionLevel = 'H';
          }

          // 清除錯誤信息 Clear error message
          form.value.error = '';

          // 更新預覽 Update preview
          await updatePreview();
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('處理 Logo 上傳失敗 Failed to process logo upload:', error);
      form.value.error = '處理 Logo 上傳失敗 Failed to process logo upload';
    }
  };

  // 移除 Logo Remove logo
  const removeLogo = async () => {
    form.value.custom_style.logoUrl = '';
    form.value.custom_style.logoData = null;
    form.value.custom_style.logoSize = 15;
    await updatePreview();
  };

  // 更新 Logo 大小 Update logo size
  const updateLogoSize = async () => {
    const size = form.value.custom_style.logoSize;
    if (size < 5) form.value.custom_style.logoSize = 5;
    if (size > 30) form.value.custom_style.logoSize = 30;
    await updatePreview();
  };

  return {
    form,
    resetForm,
    setEditMode,
    updatePreview,
    submitForm,
    handleLogoUpload,
    removeLogo,
    updateLogoSize
  };
} 