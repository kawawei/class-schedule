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
        :class="{ active: currentPage === 'specifications' }"
        @click="currentPage = 'specifications'"
      >
        規格管理
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
          @input="console.log('貨物名稱已更新:', form.name)"
        />
        <AppSelect
          v-model="form.courseType"
          label="課程種類"
          :options="courseTypeOptions"
          placeholder="請選擇課程種類"
          required
          @change="console.log('課程種類已更新:', form.courseType)"
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
            @input="console.log('單價已更新:', form.unitPrice)"
          />
          <AppSelect
            v-model="form.unitPriceCurrency"
            :options="currencyOptions"
            class="currency-select"
            @change="console.log('單價貨幣已更新:', form.unitPriceCurrency)"
          />
        </div>
        <div class="price-input">
          <AppInput
            v-model="form.cost"
            label="成本"
            type="number"
            placeholder="請輸入成本"
            required
            @input="console.log('成本已更新:', form.cost)"
          />
          <AppSelect
            v-model="form.costCurrency"
            :options="currencyOptions"
            class="currency-select"
            @change="console.log('成本貨幣已更新:', form.costCurrency)"
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
                <p>已選擇圖片: {{ form.image.name }}</p>
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
                <p>已選擇 QR Code: {{ form.qrcode.name }}</p>
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
          @input="console.log('備註已更新:', form.notes)"
        />
      </div>
    </div>

    <!-- 規格管理頁面 Specifications page -->
    <div v-if="currentPage === 'specifications'" class="form-content">
      <!-- 規格表格 Specification Table -->
      <div class="spec-table-container">
        <!-- 表格標題 Table Header -->
        <div class="spec-table-header">
          <div class="header-cell type-cell">規格種類 / Type</div>
          <div class="header-cell values-cell">規格值 / Values</div>
        </div>

        <!-- 表格內容 Table Content -->
        <div class="spec-table-body">
          <div v-for="(spec, index) in specifications" :key="index" class="spec-row">
            <!-- 規格種類 Type -->
            <div class="type-cell">
              <AppInput
                v-model="spec.typeName"
                placeholder="請輸入規格種類名稱"
                class="type-input"
                @input="console.log(`規格種類 ${index + 1} 已更新:`, spec.typeName)"
              />
            </div>

            <!-- 規格值 Values -->
            <div class="values-cell">
              <div class="values-wrapper">
                <div class="value-inputs">
                  <div 
                    v-for="(value, vIndex) in spec.values"
                    :key="vIndex"
                    class="value-input-wrapper"
                  >
                    <AppInput
                      v-model="value.name"
                      placeholder="請輸入規格值"
                      class="value-input"
                      @input="console.log(`規格種類 ${index + 1} 的值 ${vIndex + 1} 已更新:`, value.name)"
                    />
                    <button 
                      class="icon-button delete-btn"
                      @click.stop="removeSpecificationValue(index, vIndex)"
                      title="刪除規格值"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                </div>
                <AppButton 
                  type="text" 
                  class="add-value-btn"
                  @click.stop="addSpecificationValue(index)"
                >
                  添加規格值
                </AppButton>
              </div>
            </div>
          </div>
        </div>

        <!-- 新增規格種類按鈕 Add Specification Type Button -->
        <div class="spec-table-footer">
          <AppButton 
            type="primary" 
            class="add-spec-btn"
            @click="addSpecificationType"
          >
            新增規格種類 / Add Specification Type
          </AppButton>
        </div>
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
                @change="(value) => {
                  handleWarehouseSelect(value, index);
                  console.log(`倉庫 ${index + 1} 位置已更新:`, warehouse.location);
                }"
              />
              <AppInput
                v-model="warehouse.quantity"
                label="當前數量"
                type="number"
                placeholder="請輸入當前數量"
                @input="console.log(`倉庫 ${index + 1} 當前數量已更新:`, warehouse.quantity)"
              />
              <AppInput
                v-model="warehouse.minQuantity"
                label="最小庫存量"
                type="number"
                placeholder="請輸入最小庫存量"
                @input="console.log(`倉庫 ${index + 1} 最小庫存量已更新:`, warehouse.minQuantity)"
              />
              <AppInput
                v-model="warehouse.defectiveQuantity"
                label="不良品數量"
                type="number"
                placeholder="請輸入不良品數量"
                @input="console.log(`倉庫 ${index + 1} 不良品數量已更新:`, warehouse.defectiveQuantity)"
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
    const formLogic = {
      ...inventoryFormLogic.createInventoryFormLogic(props, emit),
      removeSpecificationValue(typeIndex, valueIndex) {
        const currentSpec = this.specifications[typeIndex];
        
        currentSpec.values.splice(valueIndex, 1);
        
        if (currentSpec.values.length === 0) {
          this.specifications.splice(typeIndex, 1);
        }
      }
    };

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

// 添加新的樣式
:deep(.spec-table-footer) {
  padding: 16px;
  border-top: 1px solid #EBEEF5;
  display: flex;
  justify-content: center;
}
</style> 