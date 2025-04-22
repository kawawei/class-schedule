import { ref, computed } from 'vue';
import AppInput from '@/components/base/AppInput.vue';
import AppSelect from '@/components/base/AppSelect.vue';
import Message from '@/utils/message';
import axios from 'axios';
import { API_BASE_URL } from '@/utils/api';

// 重置表單 Reset form
const resetForm = () => {
  return {
    id: null,
    name: '',
    courseType: '',
    unitPrice: '',
    unitPriceCurrency: 'NT$',
    cost: '',
    costCurrency: 'NT$',
    notes: '',
    qrcode: null,
    image: null,
    warehouses: [{
      location: '', // 倉庫位置 warehouse location
      quantity: 0, // 當前數量 current quantity
      minQuantity: 0, // 最小庫存量 minimum quantity
      defectiveQuantity: 0 // 不良品數量 defective quantity
    }]
  };
};

// 創建表單邏輯 Create form logic
const createInventoryFormLogic = (props = {}, emit = () => {}) => {
  // 表單數據 Form data
  const form = ref(props.modelValue || resetForm());
  
  // 加載狀態 Loading state
  const loading = ref(false);
  
  // QR Code 選擇相關的狀態 QR Code selection related states
  const qrcodeSelectVisible = ref(false);
  const qrcodeList = ref([]);
  const qrcodeLoading = ref(false);
  const selectedQRCode = ref(null);
  
  // 圖片預覽相關 Image preview related
  const imagePreviewVisible = ref(false);
  const previewImageUrl = ref('');
  
  // 新增倉庫函數 Add warehouse function
  const addWarehouse = () => {
    // 新增一個空的倉庫資訊 Add a new empty warehouse info
    const newWarehouse = {
      location: '', // 從現有倉庫列表中選擇 Select from existing warehouse list
      quantity: 0, // 當前數量 current quantity
      minQuantity: 0, // 最小庫存量 minimum quantity
      defectiveQuantity: 0 // 不良品數量 defective quantity
    };
    
    // 將新倉庫添加到倉庫列表中 Add new warehouse to the warehouse list
    form.value.warehouses.push(newWarehouse);
  };

  // 移除倉庫函數 Remove warehouse function
  const removeWarehouse = (index) => {
    form.value.warehouses.splice(index, 1);
  };
  
  // 打開圖片上傳 Open image upload
  const openImageUpload = async () => {
    try {
      // 創建文件輸入元素 Create file input element
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      
      // 監聽文件選擇 Listen for file selection
      input.onchange = (e) => handleImageSelect(e.target.files[0]);
      
      // 觸發文件選擇 Trigger file selection
      input.click();
    } catch (error) {
      console.error('打開圖片上傳失敗:', error);
      Message.error(error.message || '打開圖片上傳失敗');
    }
  };

  // 處理圖片拖放 Handle image drop
  const handleImageDrop = (e) => {
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  // 處理圖片選擇 Handle image select
  const handleImageSelect = (file) => {
    if (!file) return;
    
    // 檢查文件類型 Check file type
    if (!file.type.startsWith('image/')) {
      Message.error('請選擇圖片文件 / Please select an image file');
      return;
    }
    
    // 檢查文件大小（最大 5MB）Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      Message.error('圖片大小不能超過 5MB / Image size cannot exceed 5MB');
      return;
    }
    
    // 創建預覽 Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      form.value.image = {
        file,
        url: e.target.result,
        name: file.name
      };
    };
    reader.readAsDataURL(file);
  };
  
  // 移除圖片 Remove image
  const removeImage = () => {
    form.value.image = null;
  };
  
  // QR Code 相關功能 QR Code related functions
  const openQRCodeSelect = async () => {
    try {
      await fetchQRCodes();
      qrcodeSelectVisible.value = true;
    } catch (error) {
      console.error('打開 QR Code 選擇失敗:', error);
      Message.error('打開 QR Code 選擇失敗');
    }
  };

  const selectQRCode = (qrcode) => {
    selectedQRCode.value = qrcode;
  };

  const confirmQRCodeSelect = () => {
    if (selectedQRCode.value) {
      form.value.qrcode = {
        url: selectedQRCode.value.qrcode_url.startsWith('http') 
          ? selectedQRCode.value.qrcode_url 
          : `${API_BASE_URL}${selectedQRCode.value.qrcode_url}`,
        name: selectedQRCode.value.name
      };
    }
    closeQRCodeSelect();
  };

  const closeQRCodeSelect = () => {
    qrcodeSelectVisible.value = false;
    selectedQRCode.value = null;
  };

  // 移除 QR Code Remove QR Code
  const removeQRCode = () => {
    form.value.qrcode = null;
  };

  const fetchQRCodes = async () => {
    try {
      qrcodeLoading.value = true;
      const response = await axios.get('qrcode');
      
      if (response.data && response.data.success) {
        qrcodeList.value = response.data.data;
      } else {
        throw new Error(response.data?.message || '獲取 QR Code 列表失敗');
      }
    } catch (error) {
      console.error('獲取 QR Code 列表失敗:', error);
      Message.error(error.message || '獲取 QR Code 列表失敗');
      throw error;
    } finally {
      qrcodeLoading.value = false;
    }
  };
  
  // 預覽圖片 Preview image
  const previewImage = (imageUrl) => {
    if (!imageUrl) return;
    previewImageUrl.value = imageUrl.startsWith('http') ? imageUrl : `${API_BASE_URL}${imageUrl}`;
    imagePreviewVisible.value = true;
  };
  
  // 關閉圖片預覽 Close image preview
  const closeImagePreview = () => {
    imagePreviewVisible.value = false;
    previewImageUrl.value = '';
  };
  
  // 提交表單 Submit form
  const submitForm = async () => {
    try {
      loading.value = true;
      
      // 準備基本數據 Prepare basic data
      const inventoryData = {
        name: form.value.name,
        courseType: form.value.courseType,
        minQuantity: Number(form.value.minQuantity),
        unitPrice: Number(form.value.unitPrice),
        unitPriceCurrency: form.value.unitPriceCurrency,
        cost: Number(form.value.cost),
        costCurrency: form.value.costCurrency,
        notes: form.value.notes,
        qrcode_url: form.value.qrcode?.url,
        qrcode_name: form.value.qrcode?.name,
        warehouses: form.value.warehouses.map(warehouse => ({
          location: warehouse.location,
          quantity: Number(warehouse.quantity),
          minQuantity: Number(warehouse.minQuantity),
          defectiveQuantity: Number(warehouse.defectiveQuantity)
        }))
      };

      let response;
      
      // 如果有圖片，使用 FormData If there's an image, use FormData
      if (form.value.image?.file) {
        const formData = new FormData();
        formData.append('data', JSON.stringify(inventoryData));
        formData.append('image', form.value.image.file);
        
        if (form.value.id) {
          response = await axios.put(`${API_BASE_URL}/inventory/${form.value.id}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
        } else {
          response = await axios.post(`${API_BASE_URL}/inventory`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
        }
      } else {
        // 如果沒有圖片，直接使用 JSON If no image, use JSON directly
        if (form.value.id) {
          response = await axios.put(`${API_BASE_URL}/inventory/${form.value.id}`, inventoryData);
        } else {
          response = await axios.post(`${API_BASE_URL}/inventory`, inventoryData);
        }
      }

      if (response.data && response.data.success) {
        Message.success(form.value.id ? '更新成功 / Update successful' : '創建成功 / Creation successful');
        return true;
      } else {
        throw new Error(response.data?.message || (form.value.id ? '更新失敗' : '創建失敗'));
      }
    } catch (error) {
      console.error('提交表單失敗:', error);
      Message.error(error.message || '操作失敗');
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    form,
    loading,
    qrcodeSelectVisible,
    qrcodeList,
    qrcodeLoading,
    selectedQRCode,
    imagePreviewVisible,
    previewImageUrl,
    addWarehouse,
    removeWarehouse,
    openImageUpload,
    handleImageDrop,
    handleImageSelect,
    removeImage,
    openQRCodeSelect,
    selectQRCode,
    confirmQRCodeSelect,
    closeQRCodeSelect,
    removeQRCode,
    fetchQRCodes,
    previewImage,
    closeImagePreview,
    submitForm,
    resetForm
  };
};

// 導出默認對象 Export default object
export default {
  setup: (props, context) => {
    return createInventoryFormLogic(props, context.emit);
  },
  createInventoryFormLogic,
  resetForm
}; 