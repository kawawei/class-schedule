<!-- 貨物管理頁面內容 Inventory Management Page Content -->
<template>
  <div class="inventory-page">
    <div class="inventory-content">
      <div class="content-header">
        <AppButton 
          type="primary"
          @click="openAddInventoryDialog"
        >
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </template>
          新增貨物
        </AppButton>
      </div>

      <!-- 篩選區域 Filter area -->
      <div class="advanced-filters">
        <!-- 課程種類過濾器 Course Type Filter -->
        <div class="filter-group course-type">
          <label>課程種類</label>
          <AppSelect
            class="type-filter"
            v-model="selectedType"
            :options="courseTypeOptions"
            placeholder="全部種類"
          />
        </div>

        <!-- 搜尋貨物過濾器 Search Filter -->
        <div class="filter-group search">
          <label>搜尋貨物</label>
          <AppInput
            class="search-input"
            v-model="searchQuery"
            placeholder="搜尋貨物..."
          />
        </div>

        <!-- 倉庫位置過濾器 Location Filter -->
        <div class="filter-group location">
          <label>倉庫位置</label>
          <AppSelect
            class="location-filter"
            v-model="selectedLocation"
            :options="locationOptions"
            placeholder="全部位置"
          />
        </div>

        <!-- 數量範圍過濾器 Quantity Range Filter -->
        <div class="filter-group quantity">
          <label>數量範圍</label>
          <div class="quantity-inputs">
            <AppInput
              class="quantity-input"
              v-model="minQuantity"
              placeholder="最小"
              type="number"
            />
            <span class="separator">-</span>
            <AppInput
              class="quantity-input"
              v-model="maxQuantity"
              placeholder="最大"
              type="number"
            />
          </div>
        </div>

        <div class="filter-group actions">
          <AppButton type="primary" @click="openAddDialog">
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </template>
            新增貨物
          </AppButton>
        </div>
      </div>

      <!-- 貨物列表 -->
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
  </div>

  <!-- 貨物表單對話框 Inventory form dialog -->
  <AppDialog
    v-model="dialogVisible"
    :title="isEditing ? '編輯貨物' : '新增貨物'"
    @close="closeDialog"
    @confirm="submitForm"
    size="lg"
  >
    <template #default>
      <div class="inventory-form">
        <!-- 基本信息 Basic Information -->
        <div class="form-row">
          <AppInput
            v-model="form.name"
            label="貨物名稱"
            placeholder="請輸入貨物名稱"
            required
          />
          <AppSelect
            v-model="form.courseType"
            label="課程種類"
            :options="courseTypeOptions"
            placeholder="請選擇課程種類"
            required
          />
        </div>

        <!-- 數量信息 Quantity Information -->
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
          <AppInput
            v-model="form.defectiveQuantity"
            label="不良品數量"
            type="number"
            placeholder="請輸入不良品數量"
          />
        </div>

        <!-- 位置和價格信息 Location and Price Information -->
        <div class="form-row">
          <AppSelect
            v-model="form.location"
            label="倉庫位置"
            :options="locationOptions"
            placeholder="請選擇倉庫位置"
            required
          />
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

        <!-- QRCode 選擇 QRCode Selection -->
        <div class="form-row qrcode-row">
          <div class="qrcode-label">QR Code</div>
          <div class="qrcode-content">
            <template v-if="form.qrcode">
              <div class="selected-qrcode">
                <img :src="form.qrcode.url" :alt="form.qrcode.name" class="qrcode-preview" />
                <div class="qrcode-info">
                  <p>{{ form.qrcode.name }}</p>
                  <button class="remove-btn" @click="form.qrcode = null">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    移除
                  </button>
                </div>
              </div>
            </template>
            <AppButton v-else type="primary" @click="openQRCodeSelect">選擇 QR Code</AppButton>
          </div>
        </div>

        <!-- 備註 Notes -->
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
import './inventory.scss';

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

    const openQRCodeSelect = () => {
      // TODO: Implement QR Code selection
      console.log('Open QR Code selection');
    };

    return {
      ...inventoryLogic.setup(),
      courseTypeOptions,
      inventoryColumns,
      openQRCodeSelect
    };
  }
};
</script> 