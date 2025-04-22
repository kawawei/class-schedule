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

      <!-- 規格管理 Specifications Management -->
      <div class="specifications-section">
        <div class="specifications-header">
          <h3>規格設定</h3>
          <button class="add-spec-btn" @click="addSpecification">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            新增規格
          </button>
        </div>

        <div class="specifications-list">
          <div v-for="(spec, specIndex) in form.specifications" :key="specIndex" class="specification-item">
            <div class="specification-header">
              <h4>規格 #{{ specIndex + 1 }}</h4>
              <button class="remove-spec-btn" @click="removeSpecification(specIndex)">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div class="specification-content">
              <AppInput
                v-model="spec.name"
                label="規格名稱"
                placeholder="請輸入規格名稱（如：顏色、尺寸）"
              />
              
              <div class="specification-values">
                <div v-for="(value, valueIndex) in spec.values" :key="valueIndex" class="value-item">
                  <AppInput
                    v-model="spec.values[valueIndex]"
                    :label="valueIndex === 0 ? '規格值' : ''"
                    placeholder="請輸入規格值"
                  />
                  <button 
                    v-if="valueIndex > 0"
                    class="remove-value-btn"
                    @click="removeSpecificationValue(specIndex, valueIndex)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                <button class="add-value-btn" @click="addSpecificationValue(specIndex)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  新增規格值
                </button>
              </div>
            </div>
          </div>
        </div>
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
                <button class="remove-btn" @click="handleRemoveQRCode">
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

            <div class="warehouse-content">
              <!-- 倉庫位置 Warehouse Location -->
              <AppInput
                v-model="warehouse.location"
                label="倉庫位置"
                placeholder="請輸入倉庫位置"
                class="location-input"
              />

              <!-- 規格庫存表格 Specification Inventory Table -->
              <div class="inventory-table" v-if="hasValidSpecifications">
                <table>
                  <thead>
                    <tr>
                      <th v-for="spec in form.specifications" :key="spec.name">
                        {{ spec.name }}
                      </th>
                      <th>當前數量</th>
                      <th>最小庫存量</th>
                      <th>不良品數量</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="combination in generateSpecCombinations()" :key="getSpecKey(combination)">
                      <td v-for="spec in combination" :key="spec.name">
                        {{ spec.value }}
                      </td>
                      <td>
                        <AppInput
                          :model-value="getInventoryValue(warehouse, combination, 'quantity')"
                          @update:model-value="updateInventoryValue(warehouse, combination, 'quantity', $event)"
                          type="number"
                          placeholder="0"
                        />
                      </td>
                      <td>
                        <AppInput
                          :model-value="getInventoryValue(warehouse, combination, 'minQuantity')"
                          @update:model-value="updateInventoryValue(warehouse, combination, 'minQuantity', $event)"
                          type="number"
                          placeholder="0"
                        />
                      </td>
                      <td>
                        <AppInput
                          :model-value="getInventoryValue(warehouse, combination, 'defectiveQuantity')"
                          @update:model-value="updateInventoryValue(warehouse, combination, 'defectiveQuantity', $event)"
                          type="number"
                          placeholder="0"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <!-- 無規格時的庫存輸入 Inventory Input without Specifications -->
              <div v-else class="no-spec-inventory">
                <div class="inventory-inputs">
                  <AppInput
                    :model-value="getDefaultInventoryValue(warehouse, 'quantity')"
                    @update:model-value="updateDefaultInventoryValue(warehouse, 'quantity', $event)"
                    label="當前數量"
                    type="number"
                    placeholder="請輸入當前數量"
                  />
                  <AppInput
                    :model-value="getDefaultInventoryValue(warehouse, 'minQuantity')"
                    @update:model-value="updateDefaultInventoryValue(warehouse, 'minQuantity', $event)"
                    label="最小庫存量"
                    type="number"
                    placeholder="請輸入最小庫存量"
                  />
                  <AppInput
                    :model-value="getDefaultInventoryValue(warehouse, 'defectiveQuantity')"
                    @update:model-value="updateDefaultInventoryValue(warehouse, 'defectiveQuantity', $event)"
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
    </div>
  </div>
</template>

<script>
import InventoryForm from './InventoryForm.js';
export default InventoryForm;
</script>

<style lang="scss" scoped>
@import './InventoryForm.scss';
</style> 