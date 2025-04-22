import { ref, defineProps, defineEmits, computed } from 'vue';
import AppInput from '@/components/base/AppInput.vue';
import AppSelect from '@/components/base/AppSelect.vue';

export default {
  name: 'InventoryForm',
  
  components: {
    AppInput,
    AppSelect
  },

  props: {
    // 表單數據 Form data
    modelValue: {
      type: Object,
      required: true
    },
    // 課程類型選項 Course type options
    courseTypeOptions: {
      type: Array,
      default: () => []
    },
    // 貨幣選項 Currency options
    currencyOptions: {
      type: Array,
      default: () => []
    },
    // 是否正在編輯 Is editing
    isEditing: {
      type: Boolean,
      default: false
    }
  },

  emits: ['update:modelValue', 'add-warehouse', 'remove-warehouse', 'open-qrcode-select', 'remove-qrcode'],

  setup(props, { emit }) {
    // 當前頁面 Current page
    const currentPage = ref('basic');

    // 表單數據的計算屬性 Computed form data
    const form = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    });

    // 新增倉庫 Add warehouse
    const addWarehouse = () => {
      emit('add-warehouse');
    };

    // 移除倉庫 Remove warehouse
    const removeWarehouse = (index) => {
      emit('remove-warehouse', index);
    };

    // 打開 QR Code 選擇器 Open QR Code selector
    const openQRCodeSelect = () => {
      emit('open-qrcode-select');
    };

    // 移除 QR Code Remove QR Code
    const removeQRCode = () => {
      emit('remove-qrcode');
    };

    // 打開圖片上傳 Open image upload
    const openImageUpload = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => handleImageSelect(e.target.files[0]);
      input.click();
    };

    // 處理圖片選擇 Handle image selection
    const handleImageSelect = (file) => {
      if (!file) return;
      
      if (!file.type.startsWith('image/')) {
        alert('請選擇圖片文件');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('圖片大小不能超過 5MB');
        return;
      }
      
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

    // 處理圖片拖放 Handle image drop
    const handleImageDrop = (e) => {
      const file = e.dataTransfer.files[0];
      if (file) {
        handleImageSelect(file);
      }
    };

    // 移除圖片 Remove image
    const removeImage = () => {
      form.value.image = null;
    };

    return {
      currentPage,
      form,
      addWarehouse,
      removeWarehouse,
      openQRCodeSelect,
      removeQRCode,
      openImageUpload,
      handleImageDrop,
      handleImageSelect,
      removeImage
    };
  }
}; 