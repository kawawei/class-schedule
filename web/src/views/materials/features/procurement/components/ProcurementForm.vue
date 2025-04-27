<template>
  <!-- 移除容器樣式，直接使用對話框背景 Remove container styles and use dialog background directly -->
  <div class="procurement-form">
    <h3 class="form-title">基本資訊</h3>
    <div class="grid grid-cols-2">
      <div class="col-span-1">
        <div class="form-group">
          <label class="required">採購單號</label>
          <AppInput 
            v-model="formData.procurementNo" 
            placeholder="請輸入採購單號"
            :error="errors.procurementNo"
            :readonly="readonly"
          />
        </div>
      </div>
      <div class="col-span-1">
        <div class="form-group">
          <label class="required">採購日期</label>
          <AppInput
            v-model="formData.procurementDate"
            type="date"
            placeholder="請選擇採購日期"
            :error="errors.procurementDate"
            :readonly="readonly"
          />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2">
      <div class="col-span-1">
        <div class="form-group">
          <label class="required">供應商</label>
          <AppInput
            v-model="formData.supplier"
            placeholder="請輸入供應商名稱"
            :error="errors.supplier"
            :readonly="readonly"
          />
        </div>
      </div>
      <div class="col-span-1">
        <div class="form-group">
          <label class="required">採購狀態</label>
          <AppSelect
            v-model="formData.status"
            :options="statusOptions"
            placeholder="請選擇採購狀態"
            :error="errors.status"
            :disabled="readonly"
          />
        </div>
      </div>
    </div>

    <div class="form-divider"></div>

    <div class="items-header">
      <h3 class="form-title">採購項目</h3>
      <AppButton 
        type="primary" 
        @click.stop.prevent="handleAddItem"
        :disabled="isProcessing || readonly"
      >
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </template>
        新增項目
      </AppButton>
    </div>

    <div class="data-table-wrapper">
      <DataTable
        :data="formData.items"
        :columns="itemColumns"
        border
        class="procurement-table"
      >
        <template #materialName="{ row }">
          <AppSelect
            v-model="row.materialId"
            :options="materialOptions"
            placeholder="請輸入或選擇物料名稱"
            class="full-width-input"
            searchable
            :loading="loadingMaterials"
            @search="handleMaterialSearch"
            @change="handleMaterialSelect(row, $event)"
            :disabled="readonly"
          />
        </template>
        <template #specification="{ row }">
          <div class="specifications-container">
            <div v-for="(spec, index) in row.specifications" :key="index" class="specification-row">
              <div class="specification-inputs">
                <AppSelect
                  v-model="spec.specification"
                  :options="getSpecificationOptions(row.materialId)"
                  placeholder="請選擇規格"
                  class="spec-select"
                  :disabled="readonly || !row.materialId || getSpecificationOptions(row.materialId).length === 0"
                  :class="{ 'no-specs': getSpecificationOptions(row.materialId).length === 0 }"
                />
                <div class="spec-actions">
                  <button
                    v-if="index === row.specifications.length - 1 && getSpecificationOptions(row.materialId).length > 0"
                    class="icon-button add-btn"
                    @click="handleAddSpecification(row)"
                    title="新增規格"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </button>
                  <button
                    v-if="row.specifications.length > 1 && getSpecificationOptions(row.materialId).length > 0"
                    class="icon-button remove-btn"
                    @click="handleRemoveSpecification(row, index)"
                    title="刪除規格"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>
        <template #unit="{ row }">
          <AppInput v-model="row.unit" placeholder="請輸入單位" class="full-width-input" :readonly="readonly" />
        </template>
        <template #quantity="{ row }">
          <div v-for="(spec, index) in row.specifications" :key="index">
            <AppInput 
              v-model.number="spec.quantity" 
              type="number" 
              :min="1"
              class="quantity-input"
              placeholder="數量"
              @input="calculateItemAmount(row, index)"
              :readonly="readonly"
            />
          </div>
        </template>
        <template #unitPrice="{ row }">
          <div v-for="(spec, index) in row.specifications" :key="index">
            <AppInput 
              v-model.number="spec.unitPrice" 
              type="number" 
              :min="0" 
              :step="0.01"
              class="price-input"
              placeholder="單價"
              @input="calculateItemAmount(row, index)"
              :readonly="readonly"
            />
          </div>
        </template>
        <template #amount="{ row }">
          <div v-for="(spec, index) in row.specifications" :key="index">
            <div class="amount-display">
              {{ row.currency === 'TWD' ? 'NT$' : '¥' }} {{ formatAmount(spec.amount) }}
            </div>
          </div>
        </template>
        <template #currency="{ row }">
          <AppSelect
            v-model="row.currency"
            :options="currencyOptions"
            class="currency-select"
            @change="calculateTotals"
            :disabled="readonly"
          />
        </template>
        <template #actions="{ index }">
          <div class="action-buttons">
            <button
              class="icon-button delete-btn"
              @click="handleRemoveItem(index)"
              title="刪除"
              :disabled="readonly"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </template>
      </DataTable>

      <div class="summary-rows">
        <div class="summary-row">
          <span class="label">總金額：</span>
          <span class="amount">{{ formattedTotals }}</span>
        </div>
      </div>
    </div>

    <div class="form-divider"></div>

    <!-- 額外費用區塊 Extra Charges Section -->
    <div class="extra-charges-section">
      <div class="section-header">
        <h3 class="form-title">額外費用</h3>
        <AppButton 
          type="primary" 
          @click="handleAddCharge"
          :disabled="isProcessing || readonly"
        >
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </template>
          新增費用
        </AppButton>
      </div>

      <div class="charges-table" v-if="formData.extraCharges && formData.extraCharges.length > 0">
        <DataTable
          :data="formData.extraCharges"
          :columns="chargeColumns"
          border
          class="extra-charges-table"
        >
          <template #type="{ row }">
            <AppSelect
              v-model="row.type"
              :options="chargeTypes"
              placeholder="請選擇費用類型"
              class="charge-type-select"
            />
          </template>
          <template #amount="{ row }">
            <div class="amount-input-group">
              <span class="currency-symbol">{{ currentCurrencySymbol }}</span>
              <AppInput 
                v-model.number="row.amount" 
                type="number" 
                :min="0" 
                :step="0.01"
                class="full-width-input text-right"
                @input="calculateTotals"
              />
            </div>
          </template>
          <template #description="{ row }">
            <AppInput 
              v-model="row.description"
              placeholder="請輸入說明"
              class="full-width-input"
            />
          </template>
          <template #actions="{ index }">
            <div class="action-buttons">
              <button
                class="icon-button delete-btn"
                @click="handleRemoveCharge(index)"
                title="刪除"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </template>
        </DataTable>
      </div>
    </div>

    <div class="summary-rows">
      <div class="summary-row">
        <span class="label">商品小計：</span>
        <span class="amount">{{ formattedSubtotal }}</span>
      </div>
      <div class="summary-row" v-if="hasExtraCharges">
        <span class="label">額外費用：</span>
        <span class="amount">{{ formattedExtraCharges }}</span>
      </div>
      <div class="summary-row total">
        <span class="label">總金額：</span>
        <span class="amount">{{ formattedTotalAmount }}</span>
      </div>
    </div>

    <div class="form-divider"></div>

    <h3 class="form-title">備註</h3>
    <div class="form-group">
      <AppInput
        v-model="formData.remark"
        type="textarea"
        :rows="4"
        placeholder="請輸入備註"
      />
    </div>
  </div>
</template>

<script>
// 引入組件和工具 Import components and utilities
import AppButton from '@/components/base/AppButton.vue'
import AppInput from '@/components/base/AppInput.vue'
import AppSelect from '@/components/base/AppSelect.vue'
import AppCard from '@/components/base/AppCard.vue'
import DataTable from '@/components/base/DataTable.vue'
import AppDateRangePicker from '@/components/base/AppDateRangePicker.vue'
import { useProcurementForm } from './ProcurementForm'

export default {
  name: 'ProcurementForm',
  
  components: {
    AppButton,
    AppInput,
    AppSelect,
    AppCard,
    DataTable,
    AppDateRangePicker
  },

  props: {
    initialData: {
      type: Object,
      default: () => ({})
    },
    existingNumbers: { // 已存在的採購單號列表
      type: Array,
      default: () => []
    }
  },

  setup(props, { emit }) {
    // 使用採購表單邏輯 Use procurement form logic
    return useProcurementForm(props, { emit })
  }
}
</script>

<style lang="scss">
@import './ProcurementForm.scss';
</style> 