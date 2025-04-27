// 引入所需的函數和工具 Import required functions and utilities
import { ref, reactive, computed, watch, toRefs } from 'vue'
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
    supplier: '',
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
    supplier: '',
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

  // 監聽幣種變化 Watch currency changes
  watch(() => formData.items, () => {
    // 當項目變化時重新計算總金額
    // Recalculate total amount when items change
    formData.items.forEach(item => {
      // 確保每個項目都有 specifications 數組 Ensure each item has specifications array
      if (!item.specifications) {
        item.specifications = [{
          specification: '',
          quantity: 1,
          unitPrice: 0,
          amount: 0
        }]
      }
      // 計算每個規格的金額 Calculate amount for each specification
      item.specifications.forEach((spec, index) => {
        calculateItemAmount(item, index)
      })
    })
  }, { deep: true })

  // 計算單項金額 Calculate item amount
  const calculateItemAmount = (row, specIndex) => {
    if (!row.specifications) {
      row.specifications = [{
        specification: '',
        quantity: 1,
        unitPrice: 0,
        amount: 0
      }]
    }
    const spec = row.specifications[specIndex]
    if (spec) {
      const quantity = Number(spec.quantity) || 0
      const unitPrice = Number(spec.unitPrice) || 0
      spec.amount = quantity * unitPrice
      calculateTotals()
    }
  }

  // 新增採購項目 Add procurement item
  const handleAddItem = () => {
    if (isProcessing.value) return
    
    try {
      isProcessing.value = true
      
      formData.items.push({
        materialId: '', // 初始化物料ID Initialize material ID
        materialName: '',
        specifications: [{ // 規格列表，支持多規格 Specification list, supporting multiple specifications
          specification: '',
          quantity: 1,
          unitPrice: 0,
          amount: 0,
        }],
        unit: '',
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
      if (!item.specifications) return sum
      return sum + item.specifications.reduce((specSum, spec) => {
        return specSum + (Number(spec.amount) || 0)
      }, 0)
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

  // 監聽每個欄位的變化並輸出日誌 Watch each field and log changes
  watch(() => formData.procurementNo, (val) => { console.log('[Log] 採購單號:', val) })
  watch(() => formData.procurementDate, (val) => { console.log('[Log] 採購日期:', val) })
  watch(() => formData.supplier, (val) => { console.log('[Log] 供應商:', val) })
  watch(() => formData.status, (val) => { console.log('[Log] 狀態:', val) })
  watch(() => formData.items, (val) => { console.log('[Log] 採購項目:', val) }, { deep: true })
  watch(() => formData.remark, (val) => { console.log('[Log] 備註:', val) })
  watch(() => formData.extraCharges, (val) => { console.log('[Log] 額外費用:', val) }, { deep: true })

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
    if (!formData.supplier) {
      errors.supplier = '請選擇供應商'
      isValid = false
    }
    if (!formData.status) {
      errors.status = '請選擇採購狀態'
      isValid = false
    }

    // 詳細日誌輸出 Log all field values and errors
    console.log('[Validate] formData:', JSON.parse(JSON.stringify(formData)))
    console.log('[Validate] errors:', JSON.parse(JSON.stringify(errors)))
    return isValid
  }

  // 取消操作 Cancel operation
  const handleCancel = () => {
    // 清空表單 Clear form
    formData.items = []
    formData.remark = ''
    formData.status = ''
    formData.supplier = ''
    formData.procurementNo = generateProcurementNo()
    emit('cancel')
  }

  // 提交表單 Submit form
  const handleSubmit = async () => {
    if (!validateForm()) {
      Message.error('請檢查表單填寫是否正確')
      console.log('[Submit] 驗證失敗，當前欄位與錯誤:', JSON.parse(JSON.stringify(formData)), JSON.parse(JSON.stringify(errors)))
      return
    }

    try {
      // 準備提交數據 Prepare submission data
      const procurementData = {
        procurementNo: formData.procurementNo,
        supplier: formData.supplier,
        items: formData.items.map(item => ({
          ...item,
          amount: Number(item.amount || 0).toFixed(2)
        })),
        currency: formData.items[0]?.currency || 'TWD',
        remark: formData.remark,
        procurementDate: formData.procurementDate,
        status: formData.status
      }

      // 依照指定格式詳細 log 輸出所有欄位
      // Log all fields in the specified format
      console.log('--- 採購單資料 Procurement Form Data ---')
      console.log('單號 Procurement No:', procurementData.procurementNo)
      console.log('採購日期 Procurement Date:', procurementData.procurementDate)
      console.log('供應商 Supplier:', procurementData.supplier)
      console.log('採購狀態 Status:', procurementData.status)
      if (procurementData.items && procurementData.items.length > 0) {
        procurementData.items.forEach((item, idx) => {
          // 逐一列出每個物料明細 List each material detail
          if (item.specifications && item.specifications.length > 0) {
            item.specifications.forEach((spec, sidx) => {
              console.log(
                `物料名稱 Material Name: ${item.materialName || ''} | 規格 Spec: ${spec.specification || ''} | 單位 Unit: ${item.unit || ''} | 數量 Qty: ${spec.quantity || ''} | 單價 Unit Price: ${spec.unitPrice || ''} | 金額 Amount: ${spec.amount || ''} | 幣種 Currency: ${item.currency || ''}`
              )
            })
          } else {
            // 沒有規格時也要列出
            console.log(
              `物料名稱 Material Name: ${item.materialName || ''} | 規格 Spec: 無 | 單位 Unit: ${item.unit || ''} | 數量 Qty: ${item.quantity || ''} | 單價 Unit Price: ${item.unitPrice || ''} | 金額 Amount: ${item.amount || ''} | 幣種 Currency: ${item.currency || ''}`
            )
          }
        })
      } else {
        console.log('無採購項目 No procurement items')
      }
      console.log('--------------------------------------')

      // 觸發父組件的提交事件 Emit submit event to parent component
      emit('submit', procurementData)
      
      // 清空表單 Clear form
      formData.items = []
      formData.remark = ''
      formData.status = ''
      formData.supplier = ''
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

  // 新增規格選項 Add specification options
  const specificationOptions = ref({})  // 用於存儲每個物料的規格選項 Store specification options for each material

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
          specifications: material.specifications || {}, // 保存完整的規格列表 Save complete specifications list
          unit: material.unit || '個' // 默認單位 Default unit
        }))

        // 更新規格選項 Update specification options
        data.data.forEach(material => {
          if (material.specifications?.combinations) {
            // 從組合中提取規格選項 Extract specification options from combinations
            specificationOptions.value[material.id] = material.specifications.combinations.map(combo => {
              // 將組合對象的值轉換為字符串 Convert combination object values to string
              const specValues = Object.values(combo).join(' / ')
              return {
                label: specValues,
                value: specValues
              }
            })
          } else {
            specificationOptions.value[material.id] = []
          }
        })
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
      row.materialId = materialId // 保存物料ID Save material ID
      row.materialName = selectedMaterial.label
      row.unit = selectedMaterial.unit

      // 檢查物料是否有規格選項 Check if material has specification options
      const specs = getSpecificationOptions(materialId)
      
      // 重置規格列表 Reset specification list
      row.specifications = [{
        specification: specs.length === 0 ? '無規格' : '', // 如果沒有規格選項，設置為"無規格" If no specs, set to "No specification"
        quantity: 1,
        unitPrice: 0,
        amount: 0,
      }]

      // 如果物料只有一個規格組合，自動選擇該規格 If material has only one specification combination, select it automatically
      if (specs.length === 1) {
        row.specifications[0].specification = specs[0].value
      }

      // 打印規格選項以便調試 Print specification options for debugging
      console.log('Material specs:', selectedMaterial.specifications)
      console.log('Spec options:', specs)
    }
  }

  // 獲取特定物料的規格選項 Get specification options for specific material
  const getSpecificationOptions = (materialId) => {
    return specificationOptions.value[materialId] || []
  }

  // 新增規格行 Add specification row
  const handleAddSpecification = (row) => {
    if (!row.specifications) {
      row.specifications = []
    }
    
    row.specifications.push({
      specification: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0,
    })
  }

  // 刪除規格行 Remove specification row
  const handleRemoveSpecification = (row, index) => {
    row.specifications.splice(index, 1)
    // 如果刪除後沒有規格了，添加一個空的規格行
    // If no specifications left after deletion, add an empty specification row
    if (row.specifications.length === 0) {
      handleAddSpecification(row)
    }
    calculateTotals()
  }

  // 初始化時獲取物料列表 Fetch materials list on initialization
  fetchMaterials()

  // 只讀狀態 Readonly state
  const readonly = ref(false)

  // 監聽父組件 dialogType，決定是否只讀 Watch parent dialogType to decide readonly
  watch(() => props.dialogType, (val) => {
    readonly.value = val === 'view'
  }, { immediate: true })

  // 合併監聽 initialData 與 materialOptions，確保物料名稱正確顯示
  watch([
    () => props.initialData,
    () => materialOptions.value
  ], ([val, options]) => {
    if (val && Array.isArray(options) && options.length > 0) {
      Object.assign(formData, val)
      // 採購日期格式轉換 Format procurementDate
      if (formData.procurementDate) {
        formData.procurementDate = String(formData.procurementDate).slice(0, 10) // 只取 yyyy-MM-dd
      }
      // 採購項目結構轉換 Convert items structure
      if (Array.isArray(formData.items)) {
        formData.items = formData.items.map(item => {
          // 取得 materialId（資料庫 name 欄位實為 id）
          const materialId = item.name
          // 從 materialOptions 找到對應物料資訊 Find material info from materialOptions
          const material = materialOptions.value.find(m => m.value == materialId)
          return {
            materialId, // 物料ID
            materialName: material ? material.label : '', // 物料名稱
            unit: material ? material.unit : '', // 單位
            currency: item.currency || 'TWD', // 幣種
            specifications: [ // 轉成規格陣列
              {
                specification: '', // 若有規格可補上
                quantity: item.quantity || 1,
                unitPrice: item.unitPrice || 0,
                amount: (item.quantity || 1) * (item.unitPrice || 0)
              }
            ]
          }
        })
      }
    }
  }, { immediate: true, deep: true })

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
    specificationOptions,
    
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
    calculateTotals,
    formatAmount,
    handleAddItem,
    handleRemoveItem,
    handleAddCharge,
    handleRemoveCharge,
    handleCancel,
    handleSubmit,
    handleMaterialSearch,
    handleMaterialSelect,
    getSpecificationOptions,
    handleAddSpecification,
    handleRemoveSpecification,
    readonly
  }
} 