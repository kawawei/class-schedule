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
      extraCharges: [], // 額外費用列表
      ...props.initialData
    })

    // 表單錯誤信息
    const errors = reactive({
      procurementNo: '',
      procurementDate: '',
      supplierId: '',
      status: ''
    })

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

    // 費用類型選項
    const chargeTypes = [
      { label: '運費', value: 'SHIPPING' },
      { label: '服務費', value: 'SERVICE' },
      { label: '手續費', value: 'HANDLING' },
      { label: '其他費用', value: 'OTHER' }
    ];

    // 額外費用表格列定義
    const chargeColumns = [
      { key: 'type', title: '費用類型', width: 150, slot: true },
      { key: 'amount', title: '金額', width: 120, align: 'right', slot: true },
      { key: 'description', title: '說明', minWidth: 200, slot: true },
      { key: 'actions', title: '操作', width: 80, align: 'center', slot: true }
    ];

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
      calculateTotals(); // 重新計算總金額
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

    // 獲取當前幣種符號
    const currentCurrencySymbol = computed(() => {
      const firstItem = formData.items[0];
      return firstItem?.currency === 'CNY' ? '¥' : 'NT$';
    });

    // 獲取當前幣種
    const currentCurrency = computed(() => {
      const firstItem = formData.items[0];
      return firstItem?.currency || 'TWD';
    });

    // 新增額外費用
    const handleAddCharge = () => {
      if (isProcessing.value) return;
      
      try {
        isProcessing.value = true;
        
        formData.extraCharges.push({
          type: '',
          amount: 0,
          currency: currentCurrency.value, // 使用當前採購項目的幣種
          description: ''
        });
        
        console.log('新增費用項目成功，當前費用項目數量:', formData.extraCharges.length);
      } catch (error) {
        console.error('新增費用項目失敗:', error);
        Message.error('新增費用項目失敗');
      } finally {
        setTimeout(() => {
          isProcessing.value = false;
        }, 300);
      }
    };

    // 刪除額外費用
    const handleRemoveCharge = (index) => {
      try {
        formData.extraCharges.splice(index, 1);
        calculateTotals();
        Message.success('刪除成功');
      } catch (error) {
        console.error('刪除費用項目失敗:', error);
        Message.error('刪除費用項目失敗');
      }
    };

    // 計算總金額（包含額外費用）
    const calculateTotals = () => {
      // 計算商品小計
      const subtotal = formData.items.reduce((sum, item) => {
        const itemAmount = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
        return sum + itemAmount;
      }, 0);

      // 計算額外費用總計
      const extraChargesTotal = formData.extraCharges.reduce((sum, charge) => {
        return sum + (Number(charge.amount) || 0);
      }, 0);

      // 更新總金額
      formData.subtotal = subtotal;
      formData.extraChargesTotal = extraChargesTotal;
      formData.total = subtotal + extraChargesTotal;
    };

    // 格式化顯示金額
    const formattedSubtotal = computed(() => {
      const symbol = currentCurrencySymbol.value;
      return `${symbol} ${formData.subtotal?.toFixed(2) || '0.00'}`;
    });

    const formattedExtraCharges = computed(() => {
      const symbol = currentCurrencySymbol.value;
      return `${symbol} ${formData.extraChargesTotal?.toFixed(2) || '0.00'}`;
    });

    const formattedTotalAmount = computed(() => {
      const symbol = currentCurrencySymbol.value;
      return `${symbol} ${formData.total?.toFixed(2) || '0.00'}`;
    });

    const hasExtraCharges = computed(() => {
      return formData.extraCharges && formData.extraCharges.length > 0;
    });

    // 監聽數據變化
    watch([
      () => formData.items,
      () => formData.extraCharges
    ], () => {
      calculateTotals();
    }, { deep: true, immediate: true });

    // 監聽單個項目的數量和單價變化
    watch(() => formData.items.map(item => [item.quantity, item.unitPrice]), () => {
      formData.items.forEach(calculateItemAmount);
    }, { deep: true });

    // 監聽額外費用金額變化
    watch(() => formData.extraCharges.map(charge => charge.amount), () => {
      calculateTotals();
    }, { deep: true });

    // 監聽採購項目幣種變化
    watch(() => currentCurrency.value, (newCurrency) => {
      // 更新所有額外費用的幣種
      formData.extraCharges.forEach(charge => {
        charge.currency = newCurrency;
      });
      calculateTotals();
    });

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
      // 清空表單
      formData.items = [];
      formData.remark = '';
      formData.status = '';
      formData.supplierId = '';
      formData.procurementNo = generateProcurementNo();
      emit('cancel');
    }

    // 提交表單 Submit form
    const handleSubmit = async () => {
      if (!validateForm()) {
        Message.error('請檢查表單填寫是否正確');
        return;
      }

      try {
        // 準備提交數據 Prepare submission data
        const procurementData = {
          procurementNumber: formData.procurementNo,
          supplier: formData.supplierId,
          items: formData.items.map(item => ({
            ...item,
            amount: Number(item.amount || 0).toFixed(2)
          })),
          currency: formData.items[0]?.currency || 'TWD',
          remark: formData.remark
        };

        console.log('Submitting procurement data:', procurementData);
        
        // 觸發父組件的提交事件
        emit('submit', procurementData);
        
        // 清空表單
        formData.items = [];
        formData.remark = '';
        formData.status = '';
        formData.supplierId = '';
        formData.procurementNo = generateProcurementNo();
        
        Message.success('採購單建立成功！');
      } catch (error) {
        console.error('提交採購單失敗:', error);
        Message.error('提交失敗，請稍後再試');
      }
    }

    return {
      formData,
      errors,
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
      isProcessing,
      chargeTypes,
      chargeColumns,
      handleAddCharge,
      handleRemoveCharge,
      formattedSubtotal,
      formattedExtraCharges,
      formattedTotalAmount,
      hasExtraCharges,
      currentCurrencySymbol,
      currentCurrency,
    }
  }
}
</script>

<style lang="scss">
@import './ProcurementForm.scss';
</style> 