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
          />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2">
      <div class="col-span-1">
        <div class="form-group">
          <label class="required">供應商</label>
          <AppInput
            v-model="formData.supplierId"
            placeholder="請輸入供應商名稱"
            :error="errors.supplierId"
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
        :disabled="isProcessing"
      >
        <template #icon>
          <i class="fas fa-plus"></i>
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
        <template #materialNo="{ row }">
          <AppInput v-model="row.materialNo" placeholder="請輸入物料編號" class="full-width-input" />
        </template>
        <template #materialName="{ row }">
          <AppSelect
            v-model="row.materialName"
            :options="materialOptions"
            placeholder="請輸入或選擇物料名稱"
            class="full-width-input"
            searchable
            :loading="loadingMaterials"
            @search="handleMaterialSearch"
            @change="handleMaterialSelect(row, $event)"
          />
        </template>
        <template #specification="{ row }">
          <AppInput v-model="row.specification" placeholder="請輸入規格" class="full-width-input" />
        </template>
        <template #unit="{ row }">
          <AppInput v-model="row.unit" placeholder="請輸入單位" class="full-width-input" />
        </template>
        <template #quantity="{ row }">
          <AppInput 
            v-model.number="row.quantity" 
            type="number" 
            :min="1"
            class="full-width-input text-center"
            @input="calculateItemAmount(row)"
          />
        </template>
        <template #unitPrice="{ row }">
          <AppInput 
            v-model.number="row.unitPrice" 
            type="number" 
            :min="0" 
            :step="0.01"
            class="full-width-input text-right"
            @input="calculateItemAmount(row)"
          />
        </template>
        <template #amount="{ row }">
          <div class="amount-cell">
            {{ row.currency === 'TWD' ? 'NT$' : '¥' }} {{ formatAmount(row.amount) }}
          </div>
        </template>
        <template #currency="{ row }">
          <AppSelect
            v-model="row.currency"
            :options="currencyOptions"
            class="currency-select"
            @change="calculateItemAmount(row)"
          />
        </template>
        <template #actions="{ index }">
          <div class="action-buttons">
            <button
              class="icon-button reject-btn"
              @click="handleRemoveItem(index)"
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
          :disabled="isProcessing"
        >
          <template #icon>
            <i class="fas fa-plus"></i>
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
                class="icon-button reject-btn"
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