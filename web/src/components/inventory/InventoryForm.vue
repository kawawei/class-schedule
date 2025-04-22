<!-- 貨物表單組件 Inventory Form Component -->
<template>
  <div class="inventory-form-component">
    <!-- 分頁標籤 Page tabs -->
    <div class="dialog-tabs">
      <button 
        class="tab-button" 
        :class="{ active: currentPage === 'basic' }"
        @click="currentPage = 'basic'"
      >
        基本資料
      </button>
      <button 
        class="tab-button" 
        :class="{ active: currentPage === 'inventory' }"
        @click="currentPage = 'inventory'"
      >
        庫存資料
      </button>
    </div>

    <!-- 基本資料頁面 Basic info page -->
    <div v-if="currentPage === 'basic'" class="inventory-form">
      <!-- 基本信息 Basic Information -->
      <div class="form-row">
        <AppInput
          v-model="form.name"
          label="貨物名稱"
          placeholder="請輸入貨物名稱"
          required
        />
        <AppSelect
          v-model="form.courseType"
          label="課程種類"
          :options="courseTypeOptions"
          placeholder="請選擇課程種類"
          required
        />
      </div>

      <!-- 價格信息 Price Information -->
      <div class="form-row">
        <div class="price-input">
          <AppInput
            v-model="form.unitPrice"
            label="單價"
            type="number"
            placeholder="請輸入單價"
            required
          />
          <div class="currency-select">
            <AppSelect
              v-model="form.unitPriceCurrency"
              :options="currencyOptions"
            />
          </div>
        </div>
        <div class="price-input">
          <AppInput
            v-model="form.cost"
            label="成本"
            type="number"
            placeholder="請輸入成本"
            required
          />
          <div class="currency-select">
            <AppSelect
              v-model="form.costCurrency"
              :options="currencyOptions"
            />
          </div>
        </div>
      </div>

      <!-- 圖片上傳 Image Upload -->
      <div class="form-row">
        <div class="image-upload">
          <label>商品圖片</label>
          <div
            class="upload-area"
            @click="openImageUpload"
            @drop.prevent="handleImageDrop"
            @dragover.prevent
          >
            <template v-if="form.image">
              <div class="selected-image">
                <img :src="form.image.url" :alt="form.image.name" class="preview-image" />
                <div class="image-info">
                  <p>{{ form.image.name }}</p>
                  <button class="remove-btn" @click.stop="removeImage">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    移除
                  </button>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="upload-placeholder">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <p>點擊或拖放圖片上傳</p>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- QR Code 選擇 QR Code Selection -->
      <div class="form-row qrcode-row">
        <div class="qrcode-selection">
          <label>QR Code</label>
          <div class="qrcode-content">
            <template v-if="form.qrcode">
              <div class="selected-qrcode">
                <img :src="form.qrcode.url" class="qrcode-preview" :alt="form.qrcode.name" />
                <div class="qrcode-info">
                  <p>{{ form.qrcode.name }}</p>
                  <button class="remove-btn" @click="removeQRCode">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    移除
                  </button>
                </div>
              </div>
            </template>
            <button v-else class="select-qrcode-btn" @click="openQRCodeSelect">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <path d="M7 7h.01"></path>
                <path d="M17 7h.01"></path>
                <path d="M7 17h.01"></path>
                <path d="M17 17h.01"></path>
              </svg>
              選擇 QR Code
            </button>
          </div>
        </div>
      </div>

      <!-- 備註 Notes -->
      <div class="form-row">
        <AppInput
          v-model="form.notes"
          label="備註"
          type="textarea"
          placeholder="請輸入備註"
        />
      </div>
    </div>

    <!-- 庫存資料頁面 Inventory info page -->
    <div v-if="currentPage === 'inventory'" class="inventory-form">
      <!-- 倉庫管理區域 Warehouse Management Area -->
      <div class="warehouse-section">
        <div class="warehouse-header">
          <h3>倉庫資訊</h3>
          <button class="add-warehouse-btn" @click="addWarehouse">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            新增倉庫
          </button>
        </div>

        <div class="warehouse-list">
          <div v-for="(warehouse, index) in form.warehouses" :key="index" class="warehouse-item">
            <div class="warehouse-item-header">
              <h4>倉庫 #{{ index + 1 }}</h4>
              <button v-if="index > 0" class="remove-warehouse-btn" @click="removeWarehouse(index)">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div class="warehouse-row">
              <AppInput
                v-model="warehouse.location"
                label="倉庫位置"
                placeholder="請輸入倉庫位置"
              />
              <AppInput
                v-model="warehouse.quantity"
                label="當前數量"
                type="number"
                placeholder="請輸入當前數量"
              />
              <AppInput
                v-model="warehouse.minQuantity"
                label="最小庫存量"
                type="number"
                placeholder="請輸入最小庫存量"
              />
              <AppInput
                v-model="warehouse.defectiveQuantity"
                label="不良品數量"
                type="number"
                placeholder="請輸入不良品數量"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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
      removeImage
    };
  }
};
</script>

<style lang="scss" scoped>
.inventory-form-component {
  // 使用與原始檔案相同的樣式
  @import '@/views/materials/inventory.scss';

  // 圖片上傳區域樣式
  .image-upload {
    width: 100%;
    
    label {
      display: block;
      margin-bottom: var(--spacing-xs);
      color: var(--text-secondary);
    }

    .upload-area {
      border: 2px dashed var(--border-color);
      border-radius: var(--radius-lg);
      padding: var(--spacing-md);
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        border-color: var(--color-primary);
        background-color: var(--color-primary-light);
      }

      .selected-image {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--spacing-sm);

        .preview-image {
          max-width: 200px;
          max-height: 200px;
          object-fit: contain;
        }

        .image-info {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);

          p {
            margin: 0;
            color: var(--text-secondary);
          }
        }
      }

      .upload-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--spacing-sm);
        color: var(--text-secondary);

        svg {
          color: var(--text-secondary);
        }

        p {
          margin: 0;
        }
      }
    }
  }

  // QR Code 選擇區域樣式
  .qrcode-row {
    .qrcode-selection {
      width: 100%;

      label {
        display: block;
        margin-bottom: var(--spacing-xs);
        color: var(--text-secondary);
      }

      .qrcode-content {
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: var(--spacing-md);

        .selected-qrcode {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);

          .qrcode-preview {
            width: 100px;
            height: 100px;
            object-fit: contain;
          }

          .qrcode-info {
            flex: 1;
            display: flex;
            justify-content: space-between;
            align-items: center;

            p {
              margin: 0;
              color: var(--text-primary);
            }
          }
        }

        .select-qrcode-btn {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          padding: var(--spacing-sm) var(--spacing-md);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background-color: white;
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover {
            border-color: var(--color-primary);
            color: var(--color-primary);
            background-color: var(--color-primary-light);
          }

          svg {
            color: currentColor;
          }
        }
      }
    }
  }

  // 通用按鈕樣式
  .remove-btn {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
    border: none;
    border-radius: var(--radius-sm);
    background-color: var(--color-danger-light);
    color: var(--color-danger);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background-color: var(--color-danger);
      color: white;
    }

    svg {
      width: 16px;
      height: 16px;
    }
  }
}
</style> 