// 引入所需的函數和工具 Import required functions and utilities
import { ref, reactive, computed, watch } from 'vue'
import { format } from 'date-fns'
import Message from '@/utils/message'
import { API_BASE_URL } from '@/utils/api'

// 進貨表單邏輯 Purchase Form Logic
export const usePurchaseForm = (props, { emit }) => {
  // 處理中狀態標記 Processing state flag
  const isProcessing = ref(false)
  const loading = ref(false)
  const readonly = ref(false)
  
  // 生成進貨單號 Generate purchase number
  const generatePurchaseNo = () => {
    const today = new Date()
    const dateStr = format(today, 'yyyyMMdd')
    const prefix = 'R' + dateStr
    
    // 找出今天的所有進貨單號 Find all purchase numbers for today
    const todayNumbers = props.existingNumbers
      .filter(no => no.startsWith(prefix))
      .map(no => parseInt(no.slice(-3)))
    
    // 如果沒有今天的進貨單號，從1開始 If no numbers today, start from 1
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
    purchaseNo: generatePurchaseNo(),
    purchaseDate: format(new Date(), 'yyyy-MM-dd'),
    items: [],
    remark: '',
    ...props.initialData
  })

  // 表單錯誤信息 Form error messages
  const errors = reactive({
    purchaseNo: '',
    purchaseDate: '',
    items: ''
  })

  // 物料選項 Material options
  const materialOptions = ref([])
  // 載入物料狀態 Loading state for materials
  const loadingMaterials = ref(false)

  // 幣種選項 Currency options
  const currencyOptions = [
    { label: 'NT$ 新台幣', value: 'TWD' },
    { label: '¥ 人民幣', value: 'CNY' }
  ]

  // 規格選項 Specification options
  const specificationOptions = ref({})

  // 獲取物料列表 Fetch materials list
  const fetchMaterials = async (query = '') => {
    loadingMaterials.value = true // 標記為載入中 Mark as loading
    try {
      // 呼叫庫存 API 獲取物料列表 Call inventory API to get materials list
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/inventory${query ? `?search=${encodeURIComponent(query)}` : ''}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : undefined
        }
      })
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      // 轉換為下拉選單格式 Convert to select options format
      materialOptions.value = (data.data || []).map(material => ({
        label: material.name,
        value: material.id,
        unit: material.unit || '',
        specifications: material.specifications || [] // 帶入規格資料
      }))
      // 建立每個物料的規格選項 Build specification options for each material
      specificationOptions.value = {}
      materialOptions.value.forEach(material => {
        let specList = []
        // 支援多種規格格式 Support multiple spec formats
        if (Array.isArray(material.specifications) && material.specifications.length > 0) {
          // 直接是陣列（如 ["紅色/L", "藍色/M"]）
          specList = material.specifications.map(spec => ({ label: spec, value: spec }))
        } else if (material.specifications && Array.isArray(material.specifications.combinations)) {
          // 有 combinations 欄位（如 [{color: "紅", size: "L"}, ...]）
          specList = material.specifications.combinations.map(combo => {
            const specStr = Object.values(combo).join(' / ')
            return { label: specStr, value: specStr }
          })
        } else if (material.specifications && typeof material.specifications === 'object') {
          // 其他物件格式（如 {color: ["紅", "藍"], size: ["L", "M"]}）
          // 展開所有組合
          const keys = Object.keys(material.specifications)
          if (keys.length > 0) {
            const allCombos = (arrs, prefix = []) => {
              if (arrs.length === 0) return [prefix]
              return arrs[0].flatMap(val => allCombos(arrs.slice(1), [...prefix, val]))
            }
            const combos = allCombos(keys.map(k => material.specifications[k]))
            specList = combos.map(combo => ({ label: combo.join(' / '), value: combo.join(' / ') }))
          }
        }
        specificationOptions.value[material.value] = specList
      })
    } catch (error) {
      console.error('獲取物料列表失敗 Failed to fetch materials:', error)
      Message.error(error.message || '獲取物料列表失敗')
      materialOptions.value = []
      specificationOptions.value = {}
    } finally {
      loadingMaterials.value = false
    }
  }

  // 支援搜尋物料 Support material search
  const handleMaterialSearch = async (query) => {
    await fetchMaterials(query)
  }

  // 初始化時自動獲取物料列表 Fetch materials on component mount
  fetchMaterials()

  // 進貨項目表格列定義 Purchase item table column definitions
  const itemColumns = [
    { key: 'material', title: '物料', width: 200, slot: true },
    { key: 'quantity', title: '數量', width: 150, slot: true },
    { key: 'costPrice', title: '成本價', width: 150, slot: true },
    { key: 'amount', title: '金額', width: 150, slot: true },
    { key: 'actions', title: '操作', width: 100, slot: true }
  ]

  // 格式化金額 Format amount
  const formatAmount = (amount) => {
    return Number(amount || 0).toFixed(2)
  }

  // 計算單項金額 Calculate item amount
  const calculateItemAmount = (row, specIndex) => {
    if (!row.specifications) return
    const spec = row.specifications[specIndex]
    if (spec) {
      const quantity = Number(spec.quantity) || 0
      const costPrice = Number(spec.costPrice) || 0
      spec.amount = quantity * costPrice
    }
  }

  // 計算總金額 Calculate total amount
  const calculateTotalAmount = () => {
    formData.totalAmount = formData.items.reduce((sum, item) => {
      return sum + (Number(item.amount) || 0)
    }, 0)
  }

  // 格式化總金額顯示 Format total amount display
  const formattedTotalAmount = computed(() => {
    return `NT$ ${formatAmount(formData.totalAmount)}`
  })

  // 處理物料選擇 Handle material selection
  const handleMaterialChange = (row) => {
    const selectedMaterial = materialOptions.value.find(m => m.value === row.materialId)
    if (selectedMaterial) {
      row.materialName = selectedMaterial.label
      // 重設規格 Reset specifications
      const specs = specificationOptions.value[row.materialId] || []
      row.specifications = [{
        specification: specs.length > 0 ? specs[0].value : '',
        quantity: 1,
        costPrice: 0,
        amount: 0
      }]
    }
  }

  // 新增進貨項目 Add purchase item
  const handleAddItem = () => {
    if (isProcessing.value) return
    try {
      isProcessing.value = true
      formData.items.push({
        materialId: '', // 商品ID
        materialName: '', // 商品名稱
        specifications: [{ // 多規格陣列
          specification: '',
          quantity: 1,
          costPrice: 0,
          amount: 0
        }],
        currency: 'TWD' // 預設幣種
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

  // 新增規格 Add specification
  const handleAddSpecification = (row) => {
    if (!row.specifications) row.specifications = []
    row.specifications.push({
      specification: '',
      quantity: 1,
      costPrice: 0,
      amount: 0
    })
  }

  // 移除規格 Remove specification
  const handleRemoveSpecification = (row, index) => {
    if (row.specifications && row.specifications.length > 1) {
      row.specifications.splice(index, 1)
    }
  }

  // 刪除進貨項目 Remove purchase item
  const handleRemoveItem = (index) => {
    try {
      formData.items.splice(index, 1)
      calculateTotalAmount()
      Message.success('刪除成功')
    } catch (error) {
      console.error('刪除項目失敗:', error)
      Message.error('刪除項目失敗')
    }
  }

  // 打開掃描器 Open scanner
  const openScanner = (row) => {
    emit('open-scanner', row)
  }

  // 驗證表單 Validate form
  const validateForm = () => {
    let isValid = true
    
    // 重置錯誤信息 Reset error messages
    Object.keys(errors).forEach(key => {
      errors[key] = ''
    })

    // 驗證必填字段 Validate required fields
    if (!formData.purchaseNo) {
      errors.purchaseNo = '請輸入進貨單號'
      isValid = false
    }
    if (!formData.purchaseDate) {
      errors.purchaseDate = '請選擇進貨日期'
      isValid = false
    }
    if (formData.items.length === 0) {
      errors.items = '請至少添加一個進貨項目'
      isValid = false
    }

    // 驗證每個進貨項目 Validate each purchase item
    formData.items.forEach((item, index) => {
      if (!item.materialId) {
        Message.error(`第 ${index + 1} 項未選擇物料`)
        isValid = false
      }
      if (!item.quantity || item.quantity <= 0) {
        Message.error(`第 ${index + 1} 項數量必須大於0`)
        isValid = false
      }
      if (!item.costPrice || item.costPrice < 0) {
        Message.error(`第 ${index + 1} 項成本價不能為負數`)
        isValid = false
      }
    })

    return isValid
  }

  // 取消操作 Cancel operation
  const handleCancel = () => {
    // 清空表單 Clear form
    formData.items = []
    formData.remark = ''
    formData.purchaseNo = generatePurchaseNo()
    emit('cancel')
  }

  // 提交表單 Submit form
  const handleSubmit = async () => {
    if (!validateForm()) {
      Message.error('請檢查表單填寫是否正確')
      return
    }

    try {
      loading.value = true
      
      // 準備提交數據 Prepare submission data
      const purchaseData = {
        purchaseNo: formData.purchaseNo,
        purchaseDate: formData.purchaseDate,
        items: formData.items.map(item => ({
          materialId: item.materialId,
          materialName: item.materialName,
          quantity: Number(item.quantity),
          costPrice: Number(item.costPrice),
          amount: Number(item.amount)
        })),
        totalAmount: formData.totalAmount,
        remark: formData.remark
      }

      // 提交數據 Submit data
      const response = await fetch(`${API_BASE_URL}/purchases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(purchaseData)
      })

      if (response.ok) {
        Message.success('進貨單創建成功')
        emit('submit', purchaseData)
      } else {
        throw new Error('進貨單創建失敗')
      }
    } catch (error) {
      console.error('提交失敗:', error)
      Message.error(error.message || '提交失敗')
    } finally {
      loading.value = false
    }
  }

  // 監聽表單數據變化 Watch form data changes
  watch(() => formData.items, () => {
    calculateTotalAmount()
  }, { deep: true })

  return {
    // 狀態 States
    loading,
    readonly,
    formData,
    errors,
    materialOptions,
    itemColumns,
    loadingMaterials,
    currencyOptions,
    specificationOptions,
    
    // 計算屬性 Computed properties
    formattedTotalAmount,
    
    // 方法 Methods
    formatAmount,
    handleMaterialChange,
    handleAddItem,
    handleRemoveItem,
    openScanner,
    handleCancel,
    handleSubmit,
    fetchMaterials,
    handleMaterialSearch,
    handleAddSpecification,
    handleRemoveSpecification,
    calculateItemAmount
  }
} 