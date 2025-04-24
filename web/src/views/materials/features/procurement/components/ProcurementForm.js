// 引入所需的函數和工具 Import required functions and utilities
import { ref, reactive, computed, watch } from 'vue'
import { format } from 'date-fns'
import Message from '@/utils/message'
import { API_BASE_URL } from '@/utils/api'

// 採購表單邏輯 Procurement Form Logic
export const useProcurementForm = (props, { emit }) => {
  // 處理中狀態標記 Processing state flag
  const isProcessing = ref(false)
  
  // 生成採購單號 Generate procurement number
  const generateProcurementNo = () => {
    const today = new Date()
    const dateStr = format(today, 'yyyyMMdd')
    const prefix = 'P' + dateStr
    
    // 找出今天的所有採購單號 Find all procurement numbers for today
    const todayNumbers = props.existingNumbers
      .filter(no => no.startsWith(prefix))
      .map(no => parseInt(no.slice(-3)))
    
    // 如果沒有今天的採購單號，從1開始 If no numbers today, start from 1
    if (todayNumbers.length === 0) {
      return `${prefix}001`
    }
    
    // 找出最小的未使用序號 Find the smallest unused sequence number
    let seq = 1
    while (todayNumbers.includes(seq)) {
      seq++
    }
    
    // 格式化為3位數 Format to 3 digits
    return `${prefix}${String(seq).padStart(3, '0')}`
  }

  // 表單數據 Form data
  const formData = reactive({
    procurementNo: generateProcurementNo(),
    procurementDate: format(new Date(), 'yyyy-MM-dd'),
    supplierId: '',
    status: '',
    items: [],
    remark: '',
    extraCharges: [], // 額外費用列表 Extra charges list
    ...props.initialData
  })

  // 表單錯誤信息 Form error messages
  const errors = reactive({
    procurementNo: '',
    procurementDate: '',
    supplierId: '',
    status: ''
  })

  // 狀態選項 Status options
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

  // 費用類型選項 Charge type options
  const chargeTypes = [
    { label: '運費', value: 'SHIPPING' },
    { label: '服務費', value: 'SERVICE' },
    { label: '手續費', value: 'HANDLING' },
    { label: '其他費用', value: 'OTHER' }
  ]

  // 額外費用表格列定義 Extra charges table column definitions
  const chargeColumns = [
    { key: 'type', title: '費用類型', width: 150, slot: true },
    { key: 'amount', title: '金額', width: 120, align: 'right', slot: true },
    { key: 'description', title: '說明', minWidth: 200, slot: true },
    { key: 'actions', title: '操作', width: 80, align: 'center', slot: true }
  ]

  // 格式化金額 Format amount
  const formatAmount = (amount) => {
    return Number(amount || 0).toFixed(2)
  }

  // 計算總金額和幣種 Calculate total amount and currency
  const totals = computed(() => {
    const result = {
      TWD: 0,
      CNY: 0
    }
    
    formData.items.forEach(item => {
      if (item.currency && item.amount) {
        result[item.currency] += Number(item.amount) || 0
      }
    })
    
    return result
  })

  // 格式化總金額顯示 Format total amount display
  const formattedTotals = computed(() => {
    const parts = []
    if (totals.value.TWD > 0) {
      parts.push(`NT$ ${totals.value.TWD.toFixed(2)}`)
    }
    if (totals.value.CNY > 0) {
      parts.push(`¥ ${totals.value.CNY.toFixed(2)}`)
    }
    // 如果沒有任何金額，根據最後一個項目的幣種顯示預設值
    // If no amount, show default value based on last item's currency
    if (parts.length === 0) {
      const lastItem = formData.items[formData.items.length - 1]
      return lastItem?.currency === 'CNY' ? '¥ 0.00' : 'NT$ 0.00'
    }
    return parts.join(' + ')
  })

  // 計算單項金額 Calculate item amount
  const calculateItemAmount = (row) => {
    const quantity = Number(row.quantity) || 0
    const unitPrice = Number(row.unitPrice) || 0
    row.amount = quantity * unitPrice
    calculateTotals() // 重新計算總金額 Recalculate total amount
  }

  // 監聽幣種變化 Watch currency changes
  watch(() => formData.items, () => {
    // 當項目變化時重新計算總金額
    // Recalculate total amount when items change
    formData.items.forEach(item => {
      calculateItemAmount(item)
    })
  }, { deep: true })

  // 新增採購項目 Add procurement item
  const handleAddItem = () => {
    if (isProcessing.value) return
    
    try {
      isProcessing.value = true
      
      formData.items.push({
        materialNo: '',
        materialName: '',
        specification: '',
        unit: '',
        quantity: 1,
        unitPrice: 0,
        amount: 0,
        currency: 'TWD', // 默認使用新台幣 Default to TWD
      })
      
      console.log('新增項目成功，當前項目數量:', formData.items.length)
    } catch (error) {
      console.error('新增項目失敗:', error)
      Message.error('新增項目失敗')
    } finally {
      setTimeout(() => {
        isProcessing.value = false
      }, 300)
    }
  }

  // 刪除採購項目 Remove procurement item
  const handleRemoveItem = (index) => {
    try {
      // 從數組中移除指定索引的項目 Remove item from array at specified index
      formData.items.splice(index, 1)
      Message.success('刪除成功')
    } catch (error) {
      console.error('刪除項目失敗:', error)
      Message.error('刪除項目失敗')
    }
  }

  // 獲取當前幣種符號 Get current currency symbol
  const currentCurrencySymbol = computed(() => {
    const firstItem = formData.items[0]
    return firstItem?.currency === 'CNY' ? '¥' : 'NT$'
  })

  // 獲取當前幣種 Get current currency
  const currentCurrency = computed(() => {
    const firstItem = formData.items[0]
    return firstItem?.currency || 'TWD'
  })

  // 新增額外費用 Add extra charge
  const handleAddCharge = () => {
    if (isProcessing.value) return
    
    try {
      isProcessing.value = true
      
      formData.extraCharges.push({
        type: '',
        amount: 0,
        currency: currentCurrency.value, // 使用當前採購項目的幣種 Use current procurement item's currency
        description: ''
      })
      
      console.log('新增費用項目成功，當前費用項目數量:', formData.extraCharges.length)
    } catch (error) {
      console.error('新增費用項目失敗:', error)
      Message.error('新增費用項目失敗')
    } finally {
      setTimeout(() => {
        isProcessing.value = false
      }, 300)
    }
  }

  // 刪除額外費用 Remove extra charge
  const handleRemoveCharge = (index) => {
    try {
      formData.extraCharges.splice(index, 1)
      calculateTotals()
      Message.success('刪除成功')
    } catch (error) {
      console.error('刪除費用項目失敗:', error)
      Message.error('刪除費用項目失敗')
    }
  }

  // 計算總金額（包含額外費用）Calculate total amount (including extra charges)
  const calculateTotals = () => {
    // 計算商品小計 Calculate subtotal
    const subtotal = formData.items.reduce((sum, item) => {
      const itemAmount = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)
      return sum + itemAmount
    }, 0)

    // 計算額外費用總計 Calculate extra charges total
    const extraChargesTotal = formData.extraCharges.reduce((sum, charge) => {
      return sum + (Number(charge.amount) || 0)
    }, 0)

    // 更新總金額 Update total amounts
    formData.subtotal = subtotal
    formData.extraChargesTotal = extraChargesTotal
    formData.total = subtotal + extraChargesTotal
  }

  // 格式化顯示金額 Format display amounts
  const formattedSubtotal = computed(() => {
    const symbol = currentCurrencySymbol.value
    return `${symbol} ${formData.subtotal?.toFixed(2) || '0.00'}`
  })

  const formattedExtraCharges = computed(() => {
    const symbol = currentCurrencySymbol.value
    return `${symbol} ${formData.extraChargesTotal?.toFixed(2) || '0.00'}`
  })

  const formattedTotalAmount = computed(() => {
    const symbol = currentCurrencySymbol.value
    return `${symbol} ${formData.total?.toFixed(2) || '0.00'}`
  })

  const hasExtraCharges = computed(() => {
    return formData.extraCharges && formData.extraCharges.length > 0
  })

  // 監聽數據變化 Watch data changes
  watch([
    () => formData.items,
    () => formData.extraCharges
  ], () => {
    calculateTotals()
  }, { deep: true, immediate: true })

  // 監聽單個項目的數量和單價變化 Watch individual item quantity and unit price changes
  watch(() => formData.items.map(item => [item.quantity, item.unitPrice]), () => {
    formData.items.forEach(calculateItemAmount)
  }, { deep: true })

  // 監聽額外費用金額變化 Watch extra charges amount changes
  watch(() => formData.extraCharges.map(charge => charge.amount), () => {
    calculateTotals()
  }, { deep: true })

  // 監聽採購項目幣種變化 Watch procurement item currency changes
  watch(() => currentCurrency.value, (newCurrency) => {
    // 更新所有額外費用的幣種 Update all extra charges' currency
    formData.extraCharges.forEach(charge => {
      charge.currency = newCurrency
    })
    calculateTotals()
  })

  // 驗證表單 Validate form
  const validateForm = () => {
    let isValid = true
    
    // 重置錯誤信息 Reset error messages
    Object.keys(errors).forEach(key => {
      errors[key] = ''
    })

    // 驗證必填字段 Validate required fields
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

  // 取消操作 Cancel operation
  const handleCancel = () => {
    // 清空表單 Clear form
    formData.items = []
    formData.remark = ''
    formData.status = ''
    formData.supplierId = ''
    formData.procurementNo = generateProcurementNo()
    emit('cancel')
  }

  // 提交表單 Submit form
  const handleSubmit = async () => {
    if (!validateForm()) {
      Message.error('請檢查表單填寫是否正確')
      return
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
      }

      console.log('Submitting procurement data:', procurementData)
      
      // 觸發父組件的提交事件 Emit submit event to parent component
      emit('submit', procurementData)
      
      // 清空表單 Clear form
      formData.items = []
      formData.remark = ''
      formData.status = ''
      formData.supplierId = ''
      formData.procurementNo = generateProcurementNo()
      
      Message.success('採購單建立成功！')
    } catch (error) {
      console.error('提交採購單失敗:', error)
      Message.error('提交失敗，請稍後再試')
    }
  }

  // 物料選項 Material options
  const materialOptions = ref([])
  const loadingMaterials = ref(false)

  // 獲取物料列表 Fetch materials list
  const fetchMaterials = async (query = '') => {
    try {
      loadingMaterials.value = true
      // 調用庫存API獲取物料列表 Call inventory API to get materials list
      const response = await fetch(`${API_BASE_URL}/inventory${query ? `?search=${encodeURIComponent(query)}` : ''}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        // 轉換數據格式為下拉選項格式 Convert data format to select options format
        materialOptions.value = data.data.map(material => ({
          label: material.name,
          value: material.id,
          specification: material.specifications?.[0]?.value || '', // 使用第一個規格值 Use first specification value
          unit: material.unit || '個' // 默認單位 Default unit
        }))
      } else {
        throw new Error(data.message || '獲取物料列表失敗')
      }
    } catch (error) {
      console.error('獲取物料列表失敗:', error)
      Message.error(error.message || '獲取物料列表失敗')
      materialOptions.value = [] // 發生錯誤時清空選項 Clear options on error
    } finally {
      loadingMaterials.value = false
    }
  }

  // 處理物料搜索 Handle material search
  const handleMaterialSearch = async (query) => {
    await fetchMaterials(query)
  }

  // 處理物料選擇 Handle material selection
  const handleMaterialSelect = (row, materialId) => {
    const selectedMaterial = materialOptions.value.find(m => m.value === materialId)
    if (selectedMaterial) {
      row.materialName = selectedMaterial.label
      row.specification = selectedMaterial.specification
      row.unit = selectedMaterial.unit
    }
  }

  // 初始化時獲取物料列表 Fetch materials list on initialization
  fetchMaterials()

  return {
    // 狀態 States
    formData,
    errors,
    isProcessing,
    loadingMaterials,
    
    // 選項和配置 Options and configurations
    statusOptions,
    currencyOptions,
    itemColumns,
    chargeTypes,
    chargeColumns,
    materialOptions,
    
    // 計算屬性 Computed properties
    formattedTotals,
    formattedSubtotal,
    formattedExtraCharges,
    formattedTotalAmount,
    hasExtraCharges,
    currentCurrencySymbol,
    currentCurrency,
    
    // 方法 Methods
    calculateItemAmount,
    formatAmount,
    handleAddItem,
    handleRemoveItem,
    handleAddCharge,
    handleRemoveCharge,
    handleCancel,
    handleSubmit,
    handleMaterialSearch,
    handleMaterialSelect
  }
} 