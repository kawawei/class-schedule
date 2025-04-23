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
          <AppSelect
            v-model="formData.supplierId"
            :options="supplierOptions"
            placeholder="請選擇供應商"
            :error="errors.supplierId"
            filterable
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
          <AppInput v-model="row.materialName" placeholder="請輸入物料名稱" class="full-width-input" />
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
import { ref, reactive, computed, watch } from 'vue'
import { format } from 'date-fns';
import Message from '@/utils/message'

// 修改組件引入路徑，使用絕對路徑 Modified component import path to use absolute path
import AppButton from '@/components/base/AppButton.vue'
import AppInput from '@/components/base/AppInput.vue'
import AppSelect from '@/components/base/AppSelect.vue'
import AppCard from '@/components/base/AppCard.vue'
import DataTable from '@/components/base/DataTable.vue'
import AppDateRangePicker from '@/components/base/AppDateRangePicker.vue'

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
    // 處理中狀態標記 Processing state flag
    const isProcessing = ref(false);
    
    // 生成採購單號 Generate procurement number
    const generateProcurementNo = () => {
      const today = new Date();
      const dateStr = format(today, 'yyyyMMdd');
      const prefix = 'P' + dateStr;
      
      // 找出今天的所有採購單號 Find all procurement numbers for today
      const todayNumbers = props.existingNumbers
        .filter(no => no.startsWith(prefix))
        .map(no => parseInt(no.slice(-3)));
      
      // 如果沒有今天的採購單號，從1開始 If no numbers today, start from 1
      if (todayNumbers.length === 0) {
        return `${prefix}001`;
      }
      
      // 找出最小的未使用序號 Find the smallest unused sequence number
      let seq = 1;
      while (todayNumbers.includes(seq)) {
        seq++;
      }
      
      // 格式化為3位數 Format to 3 digits
      return `${prefix}${String(seq).padStart(3, '0')}`;
    };

    // 表單數據
    const formData = reactive({
      procurementNo: generateProcurementNo(),
      procurementDate: format(new Date(), 'yyyy-MM-dd'),
      supplierId: '',
      status: '',
      items: [],
      remark: '',
      ...props.initialData
    })

    // 表單錯誤信息
    const errors = reactive({
      procurementNo: '',
      procurementDate: '',
      supplierId: '',
      status: ''
    })

    // 供應商選項
    const supplierOptions = [
      { value: 'kingstone', label: '金石堂' },
      { value: 'books', label: '博客來' },
      { value: 'eslite', label: '誠品' }
    ]

    // 狀態選項
    const statusOptions = [
      { value: 'draft', label: '草稿' },
      { value: 'pending', label: '待審核' },
      { value: 'approved', label: '已審核' },
      { value: 'rejected', label: '已拒絕' }
    ]

    // 幣種選項 Currency options
    const currencyOptions = [
      { label: 'NT$ 新台幣', value: 'TWD' },
      { label: '¥ 人民幣', value: 'CNY' }
    ]

    // 採購項目表格列定義 Procurement item table column definitions
    const itemColumns = [
      { key: 'materialNo', title: '物料編號', width: 120, slot: true },
      { key: 'materialName', title: '物料名稱', width: 150, slot: true },
      { key: 'specification', title: '規格', width: 120, slot: true },
      { key: 'unit', title: '單位', width: 80, slot: true },
      { key: 'quantity', title: '數量', width: 80, align: 'center', slot: true },
      { key: 'unitPrice', title: '單價', width: 120, align: 'right', slot: true },
      { key: 'amount', title: '金額', width: 120, align: 'right', slot: true },
      { key: 'currency', title: '幣種', width: 100, slot: true },
      { key: 'actions', title: '操作', width: 80, align: 'center', slot: true }
    ]

    // 格式化金額 Format amount
    const formatAmount = (amount) => {
      return Number(amount || 0).toFixed(2);
    };

    // 計算總金額和幣種 Calculate total amount and currency
    const totals = computed(() => {
      const result = {
        TWD: 0,
        CNY: 0
      };
      
      formData.items.forEach(item => {
        if (item.currency && item.amount) {
          result[item.currency] += Number(item.amount) || 0;
        }
      });
      
      return result;
    });

    // 格式化總金額顯示 Format total amount display
    const formattedTotals = computed(() => {
      const parts = [];
      if (totals.value.TWD > 0) {
        parts.push(`NT$ ${totals.value.TWD.toFixed(2)}`);
      }
      if (totals.value.CNY > 0) {
        parts.push(`¥ ${totals.value.CNY.toFixed(2)}`);
      }
      // 如果沒有任何金額，根據最後一個項目的幣種顯示預設值
      if (parts.length === 0) {
        const lastItem = formData.items[formData.items.length - 1];
        return lastItem?.currency === 'CNY' ? '¥ 0.00' : 'NT$ 0.00';
      }
      return parts.join(' + ');
    });

    // 計算單項金額 Calculate item amount
    const calculateItemAmount = (row) => {
      const quantity = Number(row.quantity) || 0;
      const unitPrice = Number(row.unitPrice) || 0;
      row.amount = quantity * unitPrice;
    };

    // 監聽幣種變化 Watch currency changes
    watch(() => formData.items, () => {
      // 當項目變化時重新計算總金額
      formData.items.forEach(item => {
        calculateItemAmount(item);
      });
    }, { deep: true });

    // 新增採購項目
    const handleAddItem = () => {
      if (isProcessing.value) return;
      
      try {
        isProcessing.value = true;
        
        formData.items.push({
          materialNo: '',
          materialName: '',
          specification: '',
          unit: '',
          quantity: 1,
          unitPrice: 0,
          amount: 0,
          currency: 'TWD', // 默認使用新台幣
        });
        
        console.log('新增項目成功，當前項目數量:', formData.items.length);
      } catch (error) {
        console.error('新增項目失敗:', error);
        Message.error('新增項目失敗');
      } finally {
        setTimeout(() => {
          isProcessing.value = false;
        }, 300);
      }
    }

    // 刪除採購項目
    const handleRemoveItem = (index) => {
      try {
        // 從數組中移除指定索引的項目 Remove item from array at specified index
        formData.items.splice(index, 1);
        Message.success('刪除成功');
      } catch (error) {
        console.error('刪除項目失敗:', error);
        Message.error('刪除項目失敗');
      }
    }

    // 驗證表單
    const validateForm = () => {
      let isValid = true
      
      // 重置錯誤信息
      Object.keys(errors).forEach(key => {
        errors[key] = ''
      })

      // 驗證必填字段
      if (!formData.procurementNo) {
        errors.procurementNo = '請輸入採購單號'
        isValid = false
      }
      if (!formData.procurementDate) {
        errors.procurementDate = '請選擇採購日期'
        isValid = false
      }
      if (!formData.supplierId) {
        errors.supplierId = '請選擇供應商'
        isValid = false
      }
      if (!formData.status) {
        errors.status = '請選擇採購狀態'
        isValid = false
      }

      return isValid
    }

    // 取消操作
    const handleCancel = () => {
      emit('cancel')
    }

    // 提交表單
    const handleSubmit = async () => {
      if (!validateForm()) {
        Message.error('請檢查表單填寫是否正確')
        return
      }
      
      emit('submit', formData)
    }

    return {
      formData,
      errors,
      supplierOptions,
      statusOptions,
      currencyOptions,
      itemColumns,
      calculateItemAmount,
      formatAmount,
      handleAddItem,
      handleRemoveItem,
      handleCancel,
      handleSubmit,
      formattedTotals,
      isProcessing
    }
  }
}
</script>

<style lang="scss" scoped>
.procurement-form {
  padding: 20px 24px;
}

.form-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 20px;
}

.form-divider {
  height: 1px;
  background-color: #e9ecef;
  margin: 24px -24px;
}

.items-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .form-title {
    margin-bottom: 0;
  }
}

.form-group {
  margin-bottom: 20px;

  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #333;

    &.required::after {
      content: '*';
      color: #f56c6c;
      margin-left: 4px;
    }
  }
}

.data-table-wrapper {
  .total-row {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 12px 20px;
    margin-top: 12px;
    background-color: #f8f9fa;
    border: 1px solid #dcdfe6;
    border-radius: 4px;

    .total-label {
      font-weight: 500;
      margin-right: 8px;
    }

    .total-amount {
      font-size: 16px;
      font-weight: 600;
      color: #409eff;
    }
  }
}

:deep(.el-table) {
  th {
    background-color: #f8f9fa;
    font-weight: 500;
  }

  .el-input {
    width: 100%;
  }
}

.grid {
  display: grid;
  gap: 12px;
  margin-bottom: 20px;

  &.grid-cols-2 {
    grid-template-columns: repeat(2, 1fr);
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin: 24px -24px -20px;
  padding: 20px 24px;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

// 表格操作按鈕樣式 Table Action Buttons Styles
.action-buttons {
  display: flex;
  gap: var(--spacing-xs);
  justify-content: center;

  .icon-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      color: var(--color-primary);
      background: var(--bg-hover);
      border-radius: var(--radius-sm);
    }

    &.reject-btn {
      color: var(--color-danger);
      
      &:hover {
        color: var(--color-danger-dark);
      }
    }

    svg {
      width: 16px;
      height: 16px;
    }
  }
}

// 表格樣式 Table Styles
:deep(.data-table-wrapper) {
  .el-table {
    th {
      background-color: #f8f9fa;
      font-weight: 500;
    }

    td {
      padding: 8px;
      vertical-align: middle;
    }

    .amount-cell {
      text-align: right;
      padding-right: 16px;
    }
  }
}

// 金額顯示樣式 Amount Display Styles
.total-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 12px 20px;
  margin-top: 12px;
  background-color: #f8f9fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;

  .total-label {
    font-weight: 500;
    margin-right: 8px;
  }

  .total-amount {
    font-size: 16px;
    font-weight: 600;
    color: #409eff;
    min-width: 120px;
    text-align: right;
  }
}

.procurement-table {
  width: 100%;
  margin-bottom: 16px;
  border: 1px solid #dcdfe6;
  
  :deep(.el-table) {
    // 移除 el-table 默認邊框
    &::before,
    &::after {
      display: none;
    }

    th {
      background-color: #f8f9fa;
      font-weight: 500;
      padding: 8px;
      border: 1px solid #dcdfe6 !important;
      height: 40px;
    }

    td {
      padding: 4px 8px;
      vertical-align: middle;
      border: 1px solid #dcdfe6 !important;
      height: 40px;
    }

    // 移除最後一行的底部邊框
    tr:last-child td {
      border-bottom: none !important;
    }

    // 確保表格內容垂直居中
    .cell {
      display: flex;
      align-items: center;
      height: 100%;
      
      .full-width-input {
        margin: 0;
      }
    }
  }
}

.full-width-input {
  width: 100%;
  height: 32px !important;
  
  :deep(.el-input__inner) {
    height: 32px;
    line-height: 32px;
    padding: 0 8px;
  }
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.amount-cell {
  text-align: right;
  padding-right: 16px;
  color: var(--color-primary);
}

.summary-rows {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  margin-top: -1px;
  background-color: #f8f9fa;

  .summary-row {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 12px 16px;
    font-size: 14px;

    .label {
      font-weight: 500;
      margin-right: 8px;
    }

    .amount {
      min-width: 120px;
      text-align: right;
      color: var(--color-primary);
      font-weight: 600;
      font-size: 16px;
    }
  }
}

.currency-select {
  width: 100%;
  
  :deep(.el-input__inner) {
    height: 32px;
    line-height: 32px;
    padding: 0 8px;
    text-align: center;
  }
}
</style> 