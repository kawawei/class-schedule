import { ref, defineProps, defineEmits, computed, watch } from 'vue';
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

  emits: [
    'update:modelValue',
    'open-qrcode-select',
    'remove-qrcode'
  ],

  setup(props, { emit }) {
    // 當前頁面 Current page
    const currentPage = ref('basic');

    // 表單數據的計算屬性 Computed form data
    const form = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    });

    // 檢查是否有有效的規格 Check if there are valid specifications
    const hasValidSpecifications = computed(() => {
      return form.value.specifications && form.value.specifications.length > 0;
    });

    // 獲取規格組合的鍵值 Get key for specification combination
    const getSpecKey = (combination) => {
      return combination.map(spec => `${spec.name}:${spec.value}`).join(',');
    };

    // 獲取庫存值 Get inventory value
    const getInventoryValue = (warehouse, combination, field) => {
      const key = getSpecKey(combination);
      return warehouse.inventory?.[key]?.[field] || 0;
    };

    // 更新庫存值 Update inventory value
    const updateInventoryValue = (warehouse, combination, field, value) => {
      const key = getSpecKey(combination);
      if (!warehouse.inventory) {
        warehouse.inventory = {};
      }
      if (!warehouse.inventory[key]) {
        warehouse.inventory[key] = {
          quantity: 0,
          minQuantity: 0,
          defectiveQuantity: 0
        };
      }
      warehouse.inventory[key][field] = value;
    };

    // 獲取默認庫存值 Get default inventory value
    const getDefaultInventoryValue = (warehouse, field) => {
      return warehouse.inventory?.default?.[field] || 0;
    };

    // 更新默認庫存值 Update default inventory value
    const updateDefaultInventoryValue = (warehouse, field, value) => {
      if (!warehouse.inventory) {
        warehouse.inventory = {};
      }
      if (!warehouse.inventory.default) {
        warehouse.inventory.default = {
          quantity: 0,
          minQuantity: 0,
          defectiveQuantity: 0
        };
      }
      warehouse.inventory.default[field] = value;
    };

    // 新增規格 Add specification
    const addSpecification = () => {
      if (!form.value.specifications) {
        form.value.specifications = [];
      }
      form.value.specifications.push({
        name: '',
        values: ['']
      });
    };

    // 移除規格 Remove specification
    const removeSpecification = (index) => {
      form.value.specifications.splice(index, 1);
    };

    // 新增規格值 Add specification value
    const addSpecificationValue = (specIndex) => {
      form.value.specifications[specIndex].values.push('');
    };

    // 移除規格值 Remove specification value
    const removeSpecificationValue = (specIndex, valueIndex) => {
      form.value.specifications[specIndex].values.splice(valueIndex, 1);
    };

    // 生成規格組合 Generate specification combinations
    const generateSpecCombinations = () => {
      if (!form.value.specifications || form.value.specifications.length === 0) {
        return [];
      }

      const combinations = [];
      const generate = (current, index) => {
        if (index === form.value.specifications.length) {
          combinations.push([...current]);
          return;
        }

        const spec = form.value.specifications[index];
        for (const value of spec.values) {
          if (value) {
            current.push({
              name: spec.name,
              value: value
            });
            generate(current, index + 1);
            current.pop();
          }
        }
      };

      generate([], 0);
      return combinations;
    };

    // 更新所有倉庫的庫存數據 Update all warehouses inventory data
    const updateWarehousesInventory = () => {
      if (!form.value.warehouses) return;

      const combinations = generateSpecCombinations();
      
      form.value.warehouses.forEach(warehouse => {
        if (!warehouse.inventory) {
          warehouse.inventory = {
            default: {
              quantity: 0,
              minQuantity: 0,
              defectiveQuantity: 0
            }
          };
        }
        
        // 只有在有有效規格組合時才更新
        // Only update when there are valid specification combinations
        if (combinations.length > 0 && combinations[0].length > 0) {
          const existingInventory = warehouse.inventory || {};
          const newInventory = {};
          
          combinations.forEach(combination => {
            const key = getSpecKey(combination);
            newInventory[key] = existingInventory[key] || {
              quantity: 0,
              minQuantity: 0,
              defectiveQuantity: 0
            };
          });
          
          warehouse.inventory = newInventory;
        }
      });
    };

    // 新增倉庫 Add warehouse
    const addWarehouse = () => {
      if (!form.value.warehouses) {
        form.value.warehouses = [];
      }
      const newWarehouse = {
        location: '',
        inventory: {
          default: {
            quantity: 0,
            minQuantity: 0,
            defectiveQuantity: 0
          }
        }
      };
      form.value.warehouses.push(newWarehouse);
    };

    // 移除倉庫 Remove warehouse
    const removeWarehouse = (index) => {
      form.value.warehouses.splice(index, 1);
    };

    // 打開 QR Code 選擇器 Open QR Code selector
    const openQRCodeSelect = () => {
      emit('open-qrcode-select');
    };

    // 處理移除 QR Code Handle remove QR Code
    const handleRemoveQRCode = () => {
      emit('remove-qrcode');
      if (form.value.qrcode) {
        form.value.qrcode = null;
      }
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

    // 監聽規格變化 Watch specifications changes
    watch(
      () => form.value.specifications,
      () => {
        updateWarehousesInventory();
      },
      { deep: true }
    );

    return {
      currentPage,
      form,
      hasValidSpecifications,
      getSpecKey,
      getInventoryValue,
      updateInventoryValue,
      getDefaultInventoryValue,
      updateDefaultInventoryValue,
      addWarehouse,
      removeWarehouse,
      openQRCodeSelect,
      handleRemoveQRCode,
      openImageUpload,
      handleImageDrop,
      handleImageSelect,
      removeImage,
      addSpecification,
      removeSpecification,
      addSpecificationValue,
      removeSpecificationValue,
      generateSpecCombinations
    };
  }
}; 