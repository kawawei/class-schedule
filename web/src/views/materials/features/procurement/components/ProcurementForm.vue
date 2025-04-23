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
      <AppButton type="primary" @click="handleAddItem">
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
      >
        <template #materialNo="{ row }">
          <AppInput v-model="row.materialNo" placeholder="請輸入物料編號" />
        </template>
        <template #materialName="{ row }">
          <AppInput v-model="row.materialName" placeholder="請輸入物料名稱" />
        </template>
        <template #specification="{ row }">
          <AppInput v-model="row.specification" placeholder="請輸入規格" />
        </template>
        <template #unit="{ row }">
          <AppInput v-model="row.unit" placeholder="請輸入單位" />
        </template>
        <template #quantity="{ row }">
          <AppInput 
            v-model.number="row.quantity" 
            type="number" 
            :min="1"
            @input="calculateItemAmount(row)"
          />
        </template>
        <template #unitPrice="{ row }">
          <AppInput 
            v-model.number="row.unitPrice" 
            type="number" 
            :min="0" 
            :step="0.01"
            @input="calculateItemAmount(row)"
          />
        </template>
        <template #amount="{ row }">
          {{ formatAmount(row.amount) }}
        </template>
        <template #actions="{ index }">
          <AppButton type="danger" size="small" @click="handleRemoveItem(index)">
            <i class="fas fa-trash"></i>
          </AppButton>
        </template>
      </DataTable>

      <div class="total-row">
        <span class="total-label">總金額：</span>
        <span class="total-amount">NT$ {{ formatAmount(totalAmount) }}</span>
      </div>
    </div>

    <div class="form-divider"></div>

    <h3 class="form-title">備註</h3>
    <div class="form-group">
      <label>備註</label>
      <AppInput
        v-model="formData.remark"
        type="textarea"
        :rows="4"
        placeholder="請輸入備註"
      />
    </div>

    <div class="form-actions">
      <AppButton @click="handleCancel">取消</AppButton>
      <AppButton type="primary" @click="handleSubmit">確定</AppButton>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import AppButton from '@/components/base/AppButton.vue'
import AppInput from '@/components/base/AppInput.vue'
import AppSelect from '@/components/base/AppSelect.vue'
import AppCard from '@/components/base/AppCard.vue'
import DataTable from '@/components/base/DataTable.vue'
import AppDateRangePicker from '@/components/base/AppDateRangePicker.vue'
import Message from '@/utils/message'

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
    // 編輯模式下的初始數據
    initialData: {
      type: Object,
      default: () => ({})
    }
  },

  setup(props, { emit }) {
    // 表單數據
    const formData = reactive({
      procurementNo: '',
      procurementDate: '',
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

    // 採購項目表格列定義
    const itemColumns = [
      { key: 'materialNo', title: '物料編號', slot: true },
      { key: 'materialName', title: '物料名稱', slot: true },
      { key: 'specification', title: '規格', slot: true },
      { key: 'unit', title: '單位', slot: true },
      { key: 'quantity', title: '數量', slot: true },
      { key: 'unitPrice', title: '單價', slot: true },
      { key: 'amount', title: '金額', slot: true },
      { key: 'actions', title: '操作', slot: true }
    ]

    // 計算項目金額
    const calculateItemAmount = (row) => {
      row.amount = (row.quantity || 0) * (row.unitPrice || 0)
    }

    // 格式化金額
    const formatAmount = (amount) => {
      return amount ? amount.toFixed(2) : '0.00'
    }

    // 新增採購項目
    const handleAddItem = () => {
      formData.items.push({
        materialNo: '',
        materialName: '',
        specification: '',
        unit: '',
        quantity: 1,
        unitPrice: 0,
        amount: 0
      })
    }

    // 刪除採購項目
    const handleRemoveItem = (index) => {
      formData.items.splice(index, 1)
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

    // 添加總金額計算
    const totalAmount = computed(() => {
      return formData.items.reduce((sum, item) => sum + (item.amount || 0), 0)
    })

    return {
      formData,
      errors,
      supplierOptions,
      statusOptions,
      itemColumns,
      calculateItemAmount,
      formatAmount,
      handleAddItem,
      handleRemoveItem,
      handleCancel,
      handleSubmit,
      totalAmount
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
</style> 