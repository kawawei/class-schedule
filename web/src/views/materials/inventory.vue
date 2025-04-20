<!-- 貨物管理頁面內容 Inventory Management Page Content -->
<template>
  <div class="inventory-content">
    <div class="content-header">
      <div class="header-right">
        <AppButton 
          type="primary"
          @click="openAddInventoryDialog"
        >
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </template>
          新增貨物
        </AppButton>
      </div>
    </div>

    <!-- 篩選區域 Filter area -->
    <div class="advanced-filters">
      <div class="filter-group">
        <label>課程種類</label>
        <AppSelect
          v-model="filters.courseType"
          :options="courseTypeOptions"
          placeholder="全部種類"
          class="type-filter"
          @change="applyFilters"
        />
      </div>

      <div class="filter-group">
        <label>搜尋貨物</label>
        <AppInput 
          v-model="searchQuery" 
          placeholder="搜尋貨物..."
          class="search-input"
          @input="handleSearch"
        >
          <template #prefix>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </template>
        </AppInput>
      </div>

      <div class="filter-group">
        <label>倉庫位置</label>
        <AppSelect
          v-model="filters.location"
          :options="locationOptions"
          placeholder="全部位置"
          @change="applyFilters"
        />
      </div>

      <div class="filter-group">
        <label>數量範圍</label>
        <div class="quantity-inputs">
          <AppInput
            v-model="filters.minQuantity"
            type="number"
            placeholder="最小"
            @input="applyFilters"
          />
          <span class="separator">-</span>
          <AppInput
            v-model="filters.maxQuantity"
            type="number"
            placeholder="最大"
            @input="applyFilters"
          />
        </div>
      </div>
    </div>
    
    <!-- 貨物列表 Inventory list -->
    <DataTable
      :columns="inventoryColumns"
      :data="filteredInventory"
      :loading="loading"
      row-key="id"
      @row-click="viewInventoryDetails"
    >
      <!-- 自定義列插槽 Custom column slots -->
      <template #quantity="{ row }">
        <span :class="{ 'low-stock': row.quantity <= row.minQuantity }">
          {{ row.quantity }}
        </span>
      </template>
      
      <template #status="{ row }">
        <StatusBadge
          :status="getStockStatus(row)"
          :text="getStockStatusText(row)"
        />
      </template>
      
      <template #actions="{ row }">
        <div class="action-buttons">
          <AppButton
            type="primary"
            class="edit-btn"
            @click.stop="editInventory(row)"
            title="編輯"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </AppButton>
          <AppButton
            type="danger"
            class="delete-btn"
            @click.stop="deleteInventory(row)"
            title="刪除"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </AppButton>
        </div>
      </template>
      
      <!-- QR Code列 QR Code column -->
      <template #qrcode="{ row }">
        <div class="qrcode-cell">
          <img
            v-if="row.qrcode_url"
            :src="row.qrcode_url"
            :alt="row.name"
            class="qrcode-preview"
          />
          <AppButton
            v-else
            type="primary"
            size="sm"
            @click.stop="generateQRCode(row)"
          >
            生成QR Code
          </AppButton>
        </div>
      </template>
      
      <!-- 無數據提示 Empty data message -->
      <template #empty>
        <div class="empty-data">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            <line x1="12" y1="11" x2="12" y2="17"></line>
            <line x1="9" y1="14" x2="15" y2="14"></line>
          </svg>
          <p>暫無貨物數據</p>
          <AppButton 
            type="primary"
            @click="openAddInventoryDialog"
          >
            新增貨物
          </AppButton>
        </div>
      </template>
    </DataTable>
  </div>

  <!-- 貨物表單對話框 Inventory form dialog -->
  <AppDialog
    v-model="dialogVisible"
    :title="isEditing ? '編輯貨物' : '新增貨物'"
    @close="closeDialog"
    @confirm="submitForm"
  >
    <template #default>
      <div class="inventory-form">
        <div class="form-row">
          <AppInput
            v-model="form.name"
            label="貨物名稱"
            placeholder="請輸入貨物名稱"
            required
          />
        </div>
        <div class="form-row">
          <AppSelect
            v-model="form.courseType"
            label="課程種類"
            :options="courseTypeOptions"
            placeholder="請選擇課程種類"
            required
          />
        </div>
        <div class="form-row">
          <AppInput
            v-model="form.quantity"
            label="當前數量"
            type="number"
            placeholder="請輸入數量"
            required
          />
          <AppInput
            v-model="form.minQuantity"
            label="最小庫存量"
            type="number"
            placeholder="請輸入最小庫存量"
            required
          />
        </div>
        <div class="form-row">
          <AppSelect
            v-model="form.location"
            label="倉庫位置"
            :options="locationOptions"
            placeholder="請選擇倉庫位置"
            required
          />
        </div>
        <div class="form-row">
          <AppInput
            v-model="form.defectiveQuantity"
            label="不良品數量"
            type="number"
            placeholder="請輸入不良品數量"
          />
        </div>
        <div class="form-row">
          <AppInput
            v-model="form.unitPrice"
            label="單價"
            type="number"
            placeholder="請輸入單價"
            required
          />
          <AppInput
            v-model="form.cost"
            label="成本"
            type="number"
            placeholder="請輸入成本"
            required
          />
        </div>
        <div class="form-row">
          <AppInput
            v-model="form.notes"
            label="備註"
            type="textarea"
            placeholder="請輸入備註"
            :rows="3"
          />
        </div>
      </div>
    </template>
  </AppDialog>

  <!-- 刪除確認對話框 Delete confirmation dialog -->
  <AppDialog
    v-model="deleteConfirmVisible"
    title="確認刪除"
    size="sm"
    @close="closeDeleteConfirm"
    @confirm="confirmDelete"
  >
    <template #default>
      <div class="delete-confirm-content">
        <p>確定要刪除這個貨物嗎？此操作無法撤銷。</p>
        <p v-if="itemToDelete">名稱：{{ itemToDelete.name }}</p>
      </div>
    </template>
  </AppDialog>
</template>

<script>
import { ref, onMounted } from 'vue';
import AppButton from '@/components/base/AppButton.vue';
import AppInput from '@/components/base/AppInput.vue';
import AppSelect from '@/components/base/AppSelect.vue';
import DataTable from '@/components/base/DataTable.vue';
import AppDialog from '@/components/base/AppDialog.vue';
import StatusBadge from '@/components/base/StatusBadge.vue';
import { courseAPI } from '@/utils/api';
import inventoryLogic from './inventory.js';

export default {
  name: 'InventoryPage',
  components: {
    AppButton,
    AppInput,
    AppSelect,
    DataTable,
    AppDialog,
    StatusBadge
  },
  setup() {
    const courseTypeOptions = ref([]);
    const inventoryColumns = [
      { key: 'name', title: '貨物名稱' },
      { key: 'courseType', title: '課程種類' },
      { key: 'quantity', title: '當前數量' },
      { key: 'minQuantity', title: '最小庫存量' },
      { key: 'location', title: '倉庫位置' },
      { key: 'defectiveQuantity', title: '不良品數量' },
      { key: 'qrcode', title: 'QR Code', slot: true },
      { key: 'actions', title: '操作', slot: true }
    ];

    // 獲取課程種類
    const fetchCourseTypes = async () => {
      try {
        const response = await courseAPI.getAllCourses();
        if (response.success) {
          const categories = [...new Set(response.data.map(course => {
            const courseData = course.dataValues || course;
            return courseData.category;
          }))];
          
          courseTypeOptions.value = categories.map(category => ({
            label: category,
            value: category
          }));
        }
      } catch (error) {
        console.error('獲取課程種類失敗:', error);
      }
    };

    onMounted(() => {
      fetchCourseTypes();
    });

    return {
      ...inventoryLogic.setup(),
      courseTypeOptions,
      inventoryColumns
    };
  }
};
</script>

<style lang="scss" scoped>
.inventory-content {
  padding: var(--spacing-xs);
  background-color: var(--bg-primary);
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);

  .content-header {
    display: flex;
    justify-content: flex-end;
    padding: var(--spacing-sm) 0;
  }

  .advanced-filters {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
    background-color: var(--bg-secondary);
    border-radius: var(--radius-md);

    .filter-group {
      min-width: 200px;

      label {
        display: block;
        margin-bottom: var(--spacing-sm);
        color: var(--text-secondary);
        font-size: var(--font-size-sm);
        font-weight: 500;
      }

      .type-filter,
      .search-input {
        width: 100%;
        height: 40px;
      }

      .quantity-inputs {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);

        .separator {
          color: var(--text-secondary);
          padding: 0 var(--spacing-xs);
        }

        :deep(.app-input) {
          flex: 1;
          height: 40px;
        }
      }
    }
  }

  :deep(.data-table) {
    flex: 1;
    overflow: auto;
    min-height: 160px;
    
    table {
      width: 100%;
      white-space: nowrap;
    }

    th {
      padding: var(--spacing-sm) var(--spacing-md);
      background-color: var(--bg-secondary);
      font-weight: 500;
      text-align: left;
      height: 50px;
    }

    td {
      padding: var(--spacing-sm) var(--spacing-md);
      height: 60px;
      vertical-align: middle;
    }

    tr:hover {
      background-color: var(--bg-hover);
    }

    .qrcode-cell {
      display: flex;
      align-items: center;
      justify-content: center;
      
      .qrcode-preview {
        width: 40px;
        height: 40px;
        object-fit: contain;
        cursor: pointer;
        
        &:hover {
          transform: scale(1.1);
          transition: transform 0.2s ease;
        }
      }
    }

    .empty-data {
      height: 160px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm);
      
      svg {
        color: var(--text-secondary);
      }

      p {
        color: var(--text-secondary);
        margin: var(--spacing-xs) 0;
      }
    }
  }
}
</style> 