<!-- 貨物表單組件 Inventory Form Component -->
<template>
  <div class="inventory-form">
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
    <div v-if="currentPage === 'basic'" class="form-content">
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
          <AppSelect
            v-model="form.unitPriceCurrency"
            :options="currencyOptions"
            class="currency-select"
          />
        </div>
        <div class="price-input">
          <AppInput
            v-model="form.cost"
            label="成本"
            type="number"
            placeholder="請輸入成本"
            required
          />
          <AppSelect
            v-model="form.costCurrency"
            :options="currencyOptions"
            class="currency-select"
          />
        </div>
      </div>

      <!-- 圖片上傳 Image Upload -->
      <div class="form-row image-row">
        <div class="image-content">
          <template v-if="form.image">
            <div class="selected-image">
              <img :src="form.image.url" :alt="form.image.name" class="image-preview" />
              <div class="image-info">
                <button class="remove-btn" @click="removeImage">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                  移除圖片
                </button>
              </div>
            </div>
          </template>
          <button
            v-else
            class="upload-image-btn"
            @click="openImageUpload"
            @drop.prevent="handleImageDrop"
            @dragover.prevent
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span>點擊或拖放圖片上傳</span>
            <span class="upload-hint">支援 jpg、png 格式，大小不超過 5MB</span>
          </button>
        </div>
      </div>

      <!-- QR Code 選擇 QR Code Selection -->
      <div class="form-row qrcode-row">
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
                  移除 QR Code
                </button>
              </div>
            </div>
          </template>
          <button v-else class="select-qrcode-btn" @click="openQRCodeSelect">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
    <div v-if="currentPage === 'inventory'" class="form-content">
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
              <AppSelect
                v-model="warehouse.location"
                label="倉庫位置"
                :options="warehouseOptions"
                placeholder="請選擇倉庫"
                @change="(value) => handleWarehouseSelect(value, index)"
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

    <!-- QR Code 選擇對話框 QR Code selection dialog -->
    <AppDialog
      v-model="qrcodeSelectVisible"
      title="選擇 QR Code"
      size="lg"
      @close="closeQRCodeSelect"
    >
      <template #default>
        <div class="qrcode-select">
          <div class="qrcode-grid">
            <div
              v-for="qrcode in qrcodeList"
              :key="qrcode.id"
              class="qrcode-item"
              :class="{ 'selected': selectedQRCode?.id === qrcode.id }"
              @click="selectQRCode(qrcode)"
            >
              <div class="qrcode-image">
                <img
                  :src="qrcode.qrcode_url.startsWith('http') ? qrcode.qrcode_url : `${API_BASE_URL}${qrcode.qrcode_url}`"
                  :alt="qrcode.name"
                />
              </div>
              <div class="qrcode-name">{{ qrcode.name }}</div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="dialog-footer">
          <AppButton @click="closeQRCodeSelect">取消</AppButton>
          <AppButton type="primary" @click="confirmQRCodeSelect" :disabled="!selectedQRCode">確定</AppButton>
        </div>
      </template>
    </AppDialog>
  </div>
</template>

<script>
import { ref } from 'vue';
import AppInput from '@/components/base/AppInput.vue';
import AppSelect from '@/components/base/AppSelect.vue';
import AppDialog from '@/components/base/AppDialog.vue';
import AppButton from '@/components/base/AppButton.vue';
import { API_BASE_URL } from '@/utils/api';
import inventoryFormLogic from './InventoryForm.js';

export default {
  name: 'InventoryForm',
  components: {
    AppInput,
    AppSelect,
    AppDialog,
    AppButton
  },
  props: {
    modelValue: {
      type: Object,
      default: () => ({})
    },
    courseTypeOptions: {
      type: Array,
      default: () => []
    },
    currencyOptions: {
      type: Array,
      default: () => []
    },
    warehouseOptions: {
      type: Array,
      default: () => []
    },
    isEditing: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const formLogic = inventoryFormLogic.createInventoryFormLogic(props, emit);
    const currentPage = ref('basic');

    return {
      ...formLogic,
      currentPage,
      API_BASE_URL
    };
  }
};
</script>

<style lang="scss" scoped>
@import './InventoryForm.scss';

.qrcode-select {
  padding: 20px;

  .qrcode-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 20px;
  }

  .qrcode-item {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 10px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      border-color: #409EFF;
      box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
    }

    &.selected {
      border-color: #409EFF;
      background-color: rgba(64,158,255,.1);
    }

    .qrcode-image {
      width: 100%;
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 10px;

      img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
    }

    .qrcode-name {
      text-align: center;
      font-size: 14px;
      color: #606266;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 10px 20px;
}
</style> 