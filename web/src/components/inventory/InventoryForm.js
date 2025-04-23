import { ref, computed, watch, unref, reactive } from 'vue';
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
      location_id: null, // 倉庫ID warehouse ID
      quantity: 0, // 當前數量 current quantity
      minQuantity: 0, // 最小庫存量 minimum quantity
      defectiveQuantity: 0 // 不良品數量 defective quantity
    }]
  };
};

// 將後端數據轉換為前端格式 Convert backend data to frontend format
const convertBackendToFrontend = (backendSpecs) => {
  console.log('=== 後端返回的原始規格數據 (Backend Original Specs) ===');
  console.log(JSON.stringify(backendSpecs, null, 2));
  
  if (!backendSpecs || !backendSpecs.types) return [];
  
  const convertedSpecs = backendSpecs.types.map(type => ({
    typeName: type.name,
    values: type.values.map(value => ({ name: value }))
  }));
  
  console.log('=== 轉換後的前端規格數據 (Frontend Converted Specs) ===');
  console.log(JSON.stringify(convertedSpecs, null, 2));
  
  return convertedSpecs;
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
  
  // 規格管理相關狀態 Specifications Management State
  const specifications = reactive([]);
  
  // 防抖標誌 Debounce flags
  const isProcessing = ref(false);
  
  // 新增倉庫函數 Add warehouse function
  const addWarehouse = () => {
    // 新增一個空的倉庫資訊 Add a new empty warehouse info
    const newWarehouse = {
      location: '', // 從現有倉庫列表中選擇 Select from existing warehouse list
      location_id: null, // 倉庫ID warehouse ID
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
  
  // 處理倉庫選擇 Handle warehouse selection
  const handleWarehouseSelect = (value, index) => {
    // 從 warehouseOptions 中找到對應的倉庫
    // Find the corresponding warehouse from warehouseOptions
    const selectedWarehouse = props.warehouseOptions.find(option => option.value === value);
    if (selectedWarehouse) {
      // 更新倉庫資訊
      // Update warehouse information
      form.value.warehouses[index].location = selectedWarehouse.label;
      form.value.warehouses[index].location_id = selectedWarehouse.value;
    }
  };
  
  // 刪除規格值 Remove Specification Value
  const removeSpecificationValue = (typeIndex, valueIndex) => {
    console.log('=== 刪除規格值 ===');
    console.log('規格種類索引:', typeIndex);
    console.log('規格值索引:', valueIndex);
    console.log('刪除前的規格數據:', JSON.stringify(specifications));

    if (specifications[typeIndex]?.values) {
      // 只刪除指定的規格值 Only delete the specified value
      specifications[typeIndex].values = specifications[typeIndex].values.filter((_, index) => index !== valueIndex);
      console.log('刪除規格值後的數據:', JSON.stringify(specifications));
    }
  };

  // 刪除規格種類 Remove Specification Type
  const removeSpecificationType = (typeIndex) => {
    console.log('=== 刪除規格種類 ===');
    console.log('規格種類索引:', typeIndex);
    console.log('刪除前的規格數據:', JSON.stringify(specifications));

    specifications.splice(typeIndex, 1);
    console.log('刪除後的規格數據:', JSON.stringify(specifications));
  };

  // 添加規格種類 Add Specification Type
  const addSpecificationType = () => {
    if (isProcessing.value) return;
    isProcessing.value = true;

    console.log('=== 添加規格種類 ===');
    console.log('當前規格數量:', specifications.length);
    
    const newSpec = reactive({
      typeName: '',
      values: []
    });
    
    // 使用 nextTick 確保 DOM 更新後再設置狀態
    // Use nextTick to ensure DOM is updated before setting state
    specifications.push(newSpec);
    
    console.log('添加後規格數量:', specifications.length);
    console.log('新增的規格內容:', specifications[specifications.length - 1]);

    // 延長防抖時間，確保輸入框穩定顯示
    // Extend debounce time to ensure input box stays visible
    setTimeout(() => {
      isProcessing.value = false;
    }, 1000);
  };

  // 添加規格值 Add Specification Value
  const addSpecificationValue = (typeIndex) => {
    if (isProcessing.value) return;
    isProcessing.value = true;

    console.log('=== 添加規格值 ===');
    console.log('規格種類索引:', typeIndex);
    console.log('添加前該規格的值數量:', specifications[typeIndex].values.length);
    
    if (!specifications[typeIndex].values) {
      specifications[typeIndex].values = reactive([]);
    }
    
    const newValue = reactive({
      name: ''
    });
    
    // 使用 push 方法添加新值
    // Use push method to add new value
    specifications[typeIndex].values.push(newValue);
    
    console.log('添加後該規格的值數量:', specifications[typeIndex].values.length);
    console.log('添加後所有規格值:', JSON.stringify(specifications[typeIndex].values));

    // 延長防抖時間，確保輸入框穩定顯示
    // Extend debounce time to ensure input box stays visible
    setTimeout(() => {
      isProcessing.value = false;
    }, 1000);
  };

  // 生成所有規格組合 Generate All Specification Combinations
  const generateSpecificationCombinations = () => {
    // 只處理有效的規格（有名稱和至少一個值）Only process valid specifications
    const validSpecs = specifications.filter(
      spec => spec.typeName && spec.values.length > 0
    );

    if (validSpecs.length === 0) return [];

    // 遞歸生成組合 Recursively generate combinations
    const combine = (specs, current = {}, index = 0) => {
      if (index === specs.length) {
        return [current];
      }

      const spec = specs[index];
      const results = [];

      for (const value of spec.values) {
        if (!value.name) continue; // 跳過空值 Skip empty values
        const newCurrent = {
          ...current,
          [spec.typeName]: value.name
        };
        results.push(...combine(specs, newCurrent, index + 1));
      }

      return results;
    };

    return combine(validSpecs);
  };

  // 監聽規格變化並更新表單數據 Watch specification changes and update form data
  let updateTimeout = null;
  let isUpdatingFromModelValue = false; // 標記是否正在從 modelValue 更新 Flag if updating from modelValue
  let lastEmittedValue = null; // 記錄最後一次發送的值 Record the last emitted value

  watch(specifications, (newValue) => {
    // 如果正在從 modelValue 更新，則不觸發 watch
    // If updating from modelValue, don't trigger watch
    if (isUpdatingFromModelValue) return;

    // 清除之前的定時器 Clear previous timeout
    if (updateTimeout) {
      clearTimeout(updateTimeout);
    }

    // 延長更新延遲時間，避免過早觸發更新
    // Extend update delay time to avoid premature updates
    updateTimeout = setTimeout(() => {
      if (!isProcessing.value) {  // 只在非處理狀態下更新 Only update when not processing
        console.log('=== 規格數據變化 ===');
        console.log('變化後的完整規格數據:', JSON.stringify(newValue));
        
        const combinations = generateSpecificationCombinations();
        // 更新表單數據中的規格信息 Update specifications in form data
        const formData = unref(form);
        const newSpecifications = {
          types: newValue
            .filter(spec => spec.typeName.trim()) // 過濾空的規格名稱 Filter out empty type names
            .map(spec => ({
              name: spec.typeName,
              values: spec.values
                .map(v => v.name)
                .filter(name => name.trim()) // 過濾空的規格值 Filter out empty values
            })),
          combinations: combinations
        };

        // 比較新值和最後一次發送的值是否相同
        // Compare new value with last emitted value
        const newValueStr = JSON.stringify(newSpecifications);
        const lastValueStr = JSON.stringify(lastEmittedValue);
        
        if (newValueStr !== lastValueStr) {
          formData.specifications = newSpecifications;
          lastEmittedValue = newSpecifications;
          console.log('更新到表單的規格數據:', JSON.stringify(formData.specifications));
          emit('update:modelValue', formData);
        } else {
          console.log('規格數據未變化，跳過更新');
        }
      }
    }, 1000); // 延長更新延遲時間 Extend update delay time
  }, { 
    deep: true
  });
  
  // 監聽 modelValue 變化，處理規格數據 Watch modelValue changes, handle specifications data
  watch(() => props.modelValue, (newValue) => {
    if (newValue) {
      // 比較新值和當前值是否相同
      // Compare new value with current value
      const currentSpecStr = JSON.stringify(lastEmittedValue);
      const newSpecStr = JSON.stringify(newValue.specifications);
      
      if (currentSpecStr === newSpecStr) {
        console.log('接收到的數據與當前數據相同，跳過更新');
        return;
      }

      console.log('=== 編輯對話框打開，接收到的完整數據 (Complete Data Received) ===');
      console.log('newValue:', JSON.stringify(newValue, null, 2));
      console.log('newValue.specifications:', newValue.specifications);
      console.log('newValue.specifications?.types:', newValue.specifications?.types);
      
      // 設置標記，防止觸發 specifications 的 watch
      // Set flag to prevent triggering specifications watch
      isUpdatingFromModelValue = true;
      
      try {
        // 先處理規格數據 Handle specifications data first
        if (newValue.specifications) {
          console.log('=== 開始處理規格數據 (Start Processing Specifications) ===');
          const convertedSpecs = convertBackendToFrontend(newValue.specifications);
          console.log('轉換後的規格數據:', JSON.stringify(convertedSpecs, null, 2));
          specifications.splice(0, specifications.length, ...convertedSpecs);
          lastEmittedValue = newValue.specifications;
          console.log('更新後的 specifications 數組:', JSON.stringify(specifications, null, 2));
        } else {
          console.log('=== 警告：沒有找到規格數據 (Warning: No Specifications Found) ===');
          console.log('newValue:', newValue);
          // 清空現有規格 Clear existing specifications
          specifications.splice(0, specifications.length);
          lastEmittedValue = null;
        }
        
        // 然後更新其他表單數據，但保留 specifications Handle other form data while preserving specifications
        const { specifications: _, ...restData } = newValue;
        form.value = {
          ...restData,
          specifications: lastEmittedValue
        };
        
        console.log('=== 更新後的表單數據 (Updated Form Data) ===');
        console.log('form.value:', JSON.stringify(form.value, null, 2));
        console.log('=== 當前規格數據 (Current Specifications) ===');
        console.log('specifications:', JSON.stringify(specifications, null, 2));
      } finally {
        // 重置標記 Reset flag
        setTimeout(() => {
          isUpdatingFromModelValue = false;
        }, 100);
      }
    }
  }, { immediate: true });
  
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
        })),
        specifications: form.value.specifications
      };

      let response;
      
      // 如果有圖片，使用 FormData If there's an image, use FormData
      if (form.value.image?.file) {
        const formData = new FormData();
        formData.append('data', JSON.stringify(inventoryData));
        formData.append('image', form.value.image.file);
        
        if (form.value.id) {
          response = await axios.put(`inventory/${form.value.id}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
        } else {
          response = await axios.post('inventory', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
        }
      } else {
        // 如果沒有圖片，直接使用 JSON If no image, use JSON directly
        if (form.value.id) {
          response = await axios.put(`inventory/${form.value.id}`, inventoryData);
        } else {
          response = await axios.post('inventory', inventoryData);
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
    handleWarehouseSelect,
    submitForm,
    resetForm,
    specifications,
    addSpecificationType,
    removeSpecificationValue,
    addSpecificationValue,
    removeSpecificationType
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