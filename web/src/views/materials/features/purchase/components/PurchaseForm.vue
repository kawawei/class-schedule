<!-- 進貨表單組件 Purchase Form Component -->
<template>
  <div class="purchase-form">
    <h3 class="form-title">基本資訊</h3>
    <div class="grid grid-cols-2">
      <div class="col-span-1">
        <div class="form-group">
          <label class="required">進貨單號</label>
          <AppInput 
            v-model="formData.purchaseNo" 
            placeholder="請輸入進貨單號"
            :error="errors.purchaseNo"
            :readonly="readonly"
          />
        </div>
      </div>
      <div class="col-span-1">
        <div class="form-group">
          <label class="required">進貨日期</label>
          <AppInput
            v-model="formData.purchaseDate"
            type="date"
            placeholder="請選擇進貨日期"
            :error="errors.purchaseDate"
            :readonly="readonly"
          />
        </div>
      </div>
    </div>

    <div class="form-divider"></div>

    <h3 class="form-title">
      進貨項目
      <div class="title-actions">
        <AppButton
          type="primary"
          @click="handleAddItem"
        >
          新增進貨項目
        </AppButton>
        <AppButton
          type="default"
          class="scan-title-button"
          @click="openScanner"
        >
          <template #icon>
            <!-- 掃描圖標（四個圓角掃描框＋綠色橫槓）Scan Icon (Corners + Green Bar) -->
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- 四個圓角 Corners -->
              <rect x="3" y="3" width="6" height="2" rx="1" fill="#222" />
              <rect x="3" y="3" width="2" height="6" rx="1" fill="#222" />
              <rect x="19" y="3" width="6" height="2" rx="1" fill="#222" />
              <rect x="23" y="3" width="2" height="6" rx="1" fill="#222" />
              <rect x="3" y="23" width="6" height="2" rx="1" fill="#222" />
              <rect x="3" y="19" width="2" height="6" rx="1" fill="#222" />
              <rect x="19" y="23" width="6" height="2" rx="1" fill="#222" />
              <rect x="23" y="19" width="2" height="6" rx="1" fill="#222" />
              <!-- 中間綠色橫槓 Green Bar -->
              <rect x="6" y="13" width="16" height="2" rx="1" fill="#19c37d" />
            </svg>
          </template>
          掃描
        </AppButton>
      </div>
    </h3>
    <div class="items-list">
      <DataTable
        :columns="itemColumns"
        :data="formData.items"
        :loading="loading"
        row-key="id"
      >
        <!-- 物料選擇列 Material Selection Column -->
        <template #material="{ row }">
          <AppSelect
            v-model="row.materialId"
            :options="materialOptions"
            placeholder="選擇物料"
            @change="handleMaterialChange(row)"
          />
        </template>

        <!-- 數量列 Quantity Column -->
        <template #quantity="{ row }">
          <div class="specifications-container">
            <div v-for="(spec, sidx) in row.specifications" :key="sidx" class="specification-row">
              <div class="specification-inputs">
                <!-- 規格下拉選單 -->
                <AppSelect
                  v-if="specificationOptions[row.materialId] && specificationOptions[row.materialId].length > 0"
                  v-model="spec.specification"
                  :options="specificationOptions[row.materialId]"
                  placeholder="選擇規格"
                  style="width: 120px; margin-right: 8px;"
                />
                <AppInput 
                  v-model.number="spec.quantity" 
                  type="number" 
                  :min="1"
                  placeholder="數量"
                  style="width: 80px; margin-right: 8px;"
                  @input="calculateItemAmount(row, sidx)"
                />
                <AppInput 
                  v-model.number="spec.costPrice" 
                  type="number" 
                  :min="0" 
                  :step="0.01"
                  placeholder="成本價"
                  style="width: 100px; margin-right: 8px;"
                  @input="calculateItemAmount(row, sidx)"
                />
                <span class="amount-display" style="width: 80px; margin-right: 8px;">{{ formatAmount(spec.amount) }}</span>
                <!-- 新增/移除規格按鈕 -->
                <button
                  v-if="sidx === row.specifications.length - 1 && specificationOptions[row.materialId] && specificationOptions[row.materialId].length > 0"
                  class="icon-button add-btn"
                  @click="handleAddSpecification(row)"
                  title="新增規格"
                  type="button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
                <button
                  v-if="row.specifications.length > 1 && specificationOptions[row.materialId] && specificationOptions[row.materialId].length > 0"
                  class="icon-button remove-btn"
                  @click="handleRemoveSpecification(row, sidx)"
                  title="移除規格"
                  type="button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </template>

        <!-- 操作列 Actions Column -->
        <template #actions="{ row, index }">
          <div class="action-buttons">
            <AppButton
              type="danger"
              class="delete-button"
              @click="handleRemoveItem(index)"
            >
              刪除
            </AppButton>
          </div>
        </template>
      </DataTable>
    </div>

    <div class="form-divider"></div>

    <!-- 備註區 Remark Area -->
    <h3 class="form-title">備註</h3>
    <div class="form-group">
      <AppInput
        v-model="formData.remark"
        type="textarea"
        :rows="4"
        placeholder="請輸入備註"
      />
    </div>

    <!-- 掃描器對話框 Scanner Dialog -->
    <AppDialog
      v-model="scannerVisible"
      title="掃描條碼"
      width="450px"
      :hide-footer="false"
    >
      <Scanner
        @close="closeScanner"
        @scan-result="handleScanResult"
      />
      <template #footer>
        <AppButton @click="closeScanner">取消 Cancel</AppButton>
        <AppButton type="primary" @click="closeScanner">確定 Confirm</AppButton>
      </template>
    </AppDialog>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { format } from 'date-fns';
import { BrowserMultiFormatReader } from '@zxing/library';
import AppInput from '@/components/base/AppInput.vue';
import AppSelect from '@/components/base/AppSelect.vue';
import AppButton from '@/components/base/AppButton.vue';
import AppDialog from '@/components/base/AppDialog.vue';
import DataTable from '@/components/base/DataTable.vue';
import Scanner from '@/components/base/Scanner.vue';
import Message from '@/utils/message';
import { usePurchaseForm } from './PurchaseForm';

export default {
  name: 'PurchaseForm',
  
  components: {
    AppButton,
    AppInput,
    AppSelect,
    AppDialog,
    DataTable,
    Scanner
  },

  props: {
    initialData: {
      type: Object,
      default: () => ({})
    },
    existingNumbers: {
      type: Array,
      default: () => []
    }
  },

  setup(props, { emit }) {
    // 掃描器狀態 Scanner state
    const scannerVisible = ref(false);
    const { formData, materialOptions, specificationOptions } = usePurchaseForm(props, { emit });
    
    // 打開掃描器 Open scanner
    const openScanner = () => {
      scannerVisible.value = true;
    };
    
    // 關閉掃描器 Close scanner
    const closeScanner = () => {
      scannerVisible.value = false;
    };
    
    // 處理掃描結果 Handle scan result
    const handleScanResult = (code) => {
      try {
        // 嘗試根據條碼找到商品 Try to find product by barcode
        const found = materialOptions.value.find(m => m.value === code || m.label === code);
        if (found) {
          // 檢查進貨項目是否已存在該商品 Check if item already exists
          const existRow = formData.value.items.find(item => item.materialId === found.value);
          if (existRow) {
            // 已存在則數量+1 If exists, increment quantity
            if (existRow.specifications && existRow.specifications.length > 0) {
              existRow.specifications[0].quantity += 1;
            } else {
              existRow.quantity = (existRow.quantity || 0) + 1;
            }
          } else {
            // 不存在則自動新增一筆 If not exists, add new item
            handleAddItem();
            const newRow = formData.value.items[formData.value.items.length - 1];
            newRow.materialId = found.value;
            newRow.materialName = found.label;
            // 自動選第一個規格 Auto select first specification
            if (specificationOptions.value[found.value] && specificationOptions.value[found.value].length > 0) {
              newRow.specifications[0].specification = specificationOptions.value[found.value][0].value;
            }
          }
        } else {
          Message.error('查無對應商品');
        }
      } catch (error) {
        console.error('處理掃描結果失敗:', error);
        Message.error('處理掃描結果失敗');
      } finally {
        closeScanner();
      }
    };
    
    return {
      ...usePurchaseForm(props, { emit }),
      scannerVisible,
      openScanner,
      closeScanner,
      handleScanResult
    };
  }
};
</script>

<style lang="scss">
@import './PurchaseForm.scss';
</style> 