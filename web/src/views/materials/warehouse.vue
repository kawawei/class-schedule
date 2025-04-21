<!-- 倉庫管理頁面 Warehouse Management Page -->
<template>
  <div class="warehouse-page">
    <div class="content-header">
      <h2>倉庫管理 </h2>
      <AppButton 
        type="primary"
        @click="openAddWarehouseDialog"
      >
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </template>
        新增倉庫
      </AppButton>
    </div>

    <!-- 倉庫列表 Warehouse List -->
    <DataTable
      :loading="loading"
      :columns="warehouseColumns"
      :data="warehouseData"
    >
      <!-- 操作按鈕 Action buttons -->
      <template #actions="{ row }">
        <div class="action-buttons">
          <button
            class="icon-button edit-btn"
            @click="editWarehouse(row)"
            title="編輯"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button
            class="icon-button delete-btn"
            @click="deleteWarehouse(row)"
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

    <!-- 倉庫表單對話框 Warehouse Form Dialog -->
    <AppDialog
      v-model="warehouseDialogVisible"
      :title="warehouseForm.is_editing ? '編輯倉庫' : '新增倉庫'"
      @close="closeWarehouseDialog"
      @confirm="submitWarehouseForm"
    >
      <template #default>
        <div class="warehouse-form">
          <div class="form-item">
            <label>倉庫名稱 Warehouse Name</label>
            <AppInput
              v-model="warehouseForm.name"
              placeholder="請輸入倉庫名稱 Please enter warehouse name"
            />
          </div>
          <div class="form-item">
            <label>地址 Address</label>
            <AppInput
              v-model="warehouseForm.address"
              placeholder="請輸入倉庫地址 Please enter warehouse address"
            />
          </div>
          <div class="form-item">
            <label>聯絡人 Contact Person</label>
            <AppInput
              v-model="warehouseForm.contact_person"
              placeholder="請輸入聯絡人 Please enter contact person"
            />
          </div>
          <div class="form-item">
            <label>聯絡電話 Contact Phone</label>
            <AppInput
              v-model="warehouseForm.contact_phone"
              placeholder="請輸入聯絡電話 Please enter contact phone"
            />
          </div>
          <div class="form-item">
            <label>備註 Notes</label>
            <AppInput
              v-model="warehouseForm.notes"
              type="textarea"
              placeholder="請輸入備註 Please enter notes"
            />
          </div>
        </div>
      </template>
    </AppDialog>

    <!-- 刪除確認對話框 Delete Confirmation Dialog -->
    <AppDialog
      v-model="deleteConfirmVisible"
      title="確認刪除 Confirm Delete"
      size="sm"
      @close="closeDeleteConfirm"
      @confirm="confirmDelete"
    >
      <template #default>
        <div class="delete-confirm-content">
          <p>確定要刪除這個倉庫嗎？此操作無法撤銷。</p>
          <p>Are you sure you want to delete this warehouse? This action cannot be undone.</p>
          <p v-if="warehouseToDelete">名稱：{{ warehouseToDelete.name }}</p>
        </div>
      </template>
    </AppDialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import AppButton from '@/components/base/AppButton.vue';
import DataTable from '@/components/base/DataTable.vue';
import AppDialog from '@/components/base/AppDialog.vue';
import AppInput from '@/components/base/AppInput.vue';
import { API_BASE_URL } from '@/utils/api';

export default {
  name: 'WarehousePage',
  components: {
    AppButton,
    DataTable,
    AppDialog,
    AppInput
  },
  setup() {
    // 數據狀態 Data states
    const loading = ref(false);
    const warehouseData = ref([]);
    const warehouseDialogVisible = ref(false);
    const deleteConfirmVisible = ref(false);
    const warehouseToDelete = ref(null);

    // 表單數據 Form data
    const warehouseForm = ref({
      id: null,
      name: '',
      address: '',
      contact_person: '',
      contact_phone: '',
      notes: '',
      is_editing: false
    });

    // 表格列定義 Table column definitions
    const warehouseColumns = [
      {
        key: 'id',
        title: 'ID',
        width: 80
      },
      {
        key: 'name',
        title: '倉庫名稱',
        width: 200
      },
      {
        key: 'address',
        title: '地址',
        width: 300
      },
      {
        key: 'contact_phone',
        title: '聯絡電話',
        width: 150
      },
      {
        key: 'notes',
        title: '備註',
        width: 200
      },
      {
        key: 'actions',
        title: '操作',
        width: 150,
        fixed: 'right'
      }
    ];

    // 方法定義 Method definitions
    const fetchWarehouseList = async () => {
      loading.value = true;
      try {
        const response = await fetch(`${API_BASE_URL}/warehouse`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Warehouse list response:', data);
        warehouseData.value = data;
      } catch (error) {
        console.error('獲取倉庫列表失敗 Failed to fetch warehouse list:', error);
        alert('獲取倉庫列表失敗 Failed to fetch warehouse list: ' + error.message);
      } finally {
        loading.value = false;
      }
    };

    const openAddWarehouseDialog = () => {
      warehouseForm.value = {
        id: null,
        name: '',
        address: '',
        contact_person: '',
        contact_phone: '',
        notes: '',
        is_editing: false
      };
      warehouseDialogVisible.value = true;
    };

    const closeWarehouseDialog = () => {
      warehouseDialogVisible.value = false;
      warehouseForm.value = {
        id: null,
        name: '',
        address: '',
        contact_person: '',
        contact_phone: '',
        notes: '',
        is_editing: false
      };
    };

    const editWarehouse = (row) => {
      warehouseForm.value = {
        ...row,
        is_editing: true
      };
      warehouseDialogVisible.value = true;
    };

    const submitWarehouseForm = async () => {
      try {
        // 表單驗證 Form validation
        if (!warehouseForm.value.name) {
          alert('請輸入倉庫名稱 Please enter warehouse name');
          return;
        }
        if (!warehouseForm.value.address) {
          alert('請輸入倉庫地址 Please enter warehouse address');
          return;
        }
        if (!warehouseForm.value.contact_person) {
          alert('請輸入聯絡人 Please enter contact person');
          return;
        }
        if (!warehouseForm.value.contact_phone) {
          alert('請輸入聯絡電話 Please enter contact phone');
          return;
        }

        // 獲取用戶信息和公司代碼 Get user info and company code
        const companyData = JSON.parse(localStorage.getItem('companyData'));
        if (!companyData || !companyData.company_code) {
          alert('未找到公司代碼，請聯繫管理員 Company code not found, please contact administrator');
          return;
        }

        const url = warehouseForm.value.is_editing
          ? `${API_BASE_URL}/warehouse/${warehouseForm.value.id}`
          : `${API_BASE_URL}/warehouse`;
        
        const method = warehouseForm.value.is_editing ? 'PUT' : 'POST';
        
        // 準備請求數據 Prepare request data
        const requestData = {
          name: warehouseForm.value.name,
          address: warehouseForm.value.address,
          contact_person: warehouseForm.value.contact_person,
          contact_phone: warehouseForm.value.contact_phone,
          notes: warehouseForm.value.notes || '',
          company_code: companyData.company_code
        };

        console.log('Submitting warehouse form:', {
          url,
          method,
          data: requestData
        });
        
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(requestData)
        });

        const responseData = await response.json();
        console.log('Server response:', responseData);

        if (!response.ok) {
          throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
        }
        
        // 操作成功，關閉對話框並刷新列表
        // Operation successful, close dialog and refresh list
        alert(warehouseForm.value.is_editing ? '倉庫更新成功！ Warehouse updated successfully!' : '倉庫創建成功！ Warehouse created successfully!');
        await fetchWarehouseList();
        closeWarehouseDialog();
      } catch (error) {
        console.error('提交倉庫表單失敗:', error);
        alert('操作失敗：' + error.message);
      }
    };

    const deleteWarehouse = (row) => {
      warehouseToDelete.value = row;
      deleteConfirmVisible.value = true;
    };

    const closeDeleteConfirm = () => {
      deleteConfirmVisible.value = false;
      warehouseToDelete.value = null;
    };

    const confirmDelete = async () => {
      if (!warehouseToDelete.value) return;
      
      try {
        const response = await fetch(`${API_BASE_URL}/warehouse/${warehouseToDelete.value.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        // 刪除成功 Delete successful
        alert('倉庫刪除成功！ Warehouse deleted successfully!');
        await fetchWarehouseList();
        closeDeleteConfirm();
      } catch (error) {
        console.error('刪除倉庫失敗 Failed to delete warehouse:', error);
        alert('刪除倉庫失敗 Failed to delete warehouse: ' + error.message);
      }
    };

    // 生命週期鉤子 Lifecycle hooks
    onMounted(() => {
      fetchWarehouseList();
    });

    return {
      loading,
      warehouseData,
      warehouseColumns,
      warehouseDialogVisible,
      warehouseForm,
      deleteConfirmVisible,
      warehouseToDelete,
      openAddWarehouseDialog,
      closeWarehouseDialog,
      editWarehouse,
      submitWarehouseForm,
      deleteWarehouse,
      closeDeleteConfirm,
      confirmDelete
    };
  }
};
</script>

<style lang="scss" scoped>
.warehouse-page {
  padding: var(--spacing-md);

  .content-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);

    h2 {
      margin: 0;
      font-size: var(--font-size-xl);
      color: var(--text-primary);
    }
  }

  .warehouse-form {
    .form-item {
      margin-bottom: var(--spacing-md);

      label {
        display: block;
        margin-bottom: var(--spacing-xs);
        color: var(--text-secondary);
      }
    }
  }

  .action-buttons {
    display: flex;
    gap: 8px;
    justify-content: center;

    .icon-button {
      padding: 4px 8px;
      background: transparent !important;
      border: none !important;
      color: var(--text-primary);
      transition: color 0.3s ease;
      min-width: unset !important;
      height: unset !important;
      opacity: 1 !important;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        color: var(--color-primary);
        background: var(--bg-hover) !important;
      }

      &.edit-btn {
        color: var(--color-primary);
        
        &:hover {
          color: var(--color-primary-dark);
        }
      }

      &.delete-btn {
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

  .delete-confirm-content {
    text-align: center;
    padding: var(--spacing-md);

    p {
      margin-bottom: var(--spacing-sm);
      &:last-child {
        margin-bottom: 0;
        font-weight: bold;
      }
    }
  }
}
</style> 