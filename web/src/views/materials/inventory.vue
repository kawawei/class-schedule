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
            :options="[{ label: '全部種類', value: '' }, ...courseTypeOptionsRef]"
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
            placeholder="選擇倉庫"
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
        <!-- 序號欄位 Index column -->
        <template #index="{ index }">
          {{ index + 1 }}
        </template>

        <!-- 圖片欄位 Image column -->
        <template #image="{ row }">
          <div class="image-cell">
            <template v-if="row.image_url">
              <img
                :src="row.image_url.startsWith('http') ? row.image_url : `${API_BASE_URL}${row.image_url}`"
                :alt="row.name"
                class="inventory-thumbnail"
                @click.stop="previewImage(row.image_url)"
              />
            </template>
            <div v-else class="no-image" @click="openImageUpload(row)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
          </div>
        </template>

        <!-- 數量欄位 Quantity column -->
        <template #quantity="{ row }">
          <span :class="{ 'low-stock': getStockStatus(row) !== 'primary' }">
            {{ getWarehouseQuantity(selectedLocation.value, 'normal', row.warehouses) }}
          </span>
        </template>

        <!-- 不良品數量欄位 Defective quantity column -->
        <template #defectiveQuantity="{ row }">
          {{ getWarehouseQuantity(selectedLocation.value, 'defective', row.warehouses) }}
        </template>
        
        <!-- 狀態欄位 Status column -->
        <template #status="{ row }">
          <StatusBadge
            :status="getStockStatus(row)"
            :text="getStockStatusText(row)"
          />
        </template>
        
        <template #unitPrice="{ row }">
          {{ getCurrencySymbol(row.unitPriceCurrency) }} {{ row.unitPrice }}
        </template>
        
        <template #cost="{ row }">
          {{ getCurrencySymbol(row.costCurrency) }} {{ row.cost }}
        </template>
        
        <!-- 操作按鈕 Action buttons -->
        <template #actions="{ row }">
          <div class="action-buttons">
            <button
              class="icon-button view-btn"
              @click.stop="viewInventoryDetails(row)"
              title="查看"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
            <button
              class="icon-button edit-btn"
              @click.stop="editInventory(row)"
              title="編輯"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button
              class="icon-button delete-btn"
              @click.stop="deleteInventory(row)"
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
        
        <!-- QR Code 列 QR Code column -->
        <template #qrcode="{ row }">
          <div class="qrcode-cell">
            <template v-if="row.qrcode_url">
              <img
                :src="row.qrcode_url.startsWith('http') ? row.qrcode_url : row.qrcode_url"
                :alt="row.qrcode_name"
                class="qrcode-preview"
              />
              <span class="qrcode-name">{{ row.qrcode_name }}</span>
            </template>
            <button
              v-else
              class="select-qrcode-btn"
              @click.stop="openQRCodeSelect(row)"
            >
              選擇 QR Code
            </button>
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
      <InventoryForm
        v-model="form"
        :course-type-options="courseTypeOptionsRef"
        :currency-options="currencyOptions"
        :warehouse-options="locationOptions"
        :is-editing="isEditing"
      />
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

  <!-- QR Code 選擇對話框 QR Code selection dialog -->
  <AppDialog
    v-model="qrcodeSelectVisible"
    title="選擇 QR Code"
    size="lg"
    @close="closeQRCodeSelect"
  >
    <template #default>
      <div class="qrcode-select">
        <div class="qrcode-grid">
          <div
            v-for="qrcode in qrcodeList"
            :key="qrcode.id"
            class="qrcode-item"
            :class="{ 'selected': selectedQRCode?.id === qrcode.id }"
            @click="selectQRCode(qrcode)"
          >
            <div class="qrcode-image">
              <img
                :src="qrcode.qrcode_url.startsWith('http') ? qrcode.qrcode_url : qrcode.qrcode_url"
                :alt="qrcode.name"
              />
            </div>
            <div class="qrcode-name">{{ qrcode.name }}</div>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="dialog-footer">
        <AppButton @click="closeQRCodeSelect">取消</AppButton>
        <AppButton type="primary" @click="confirmQRCodeSelect" :disabled="!selectedQRCode">確定</AppButton>
      </div>
    </template>
  </AppDialog>

  <!-- 貨物詳情對話框 Inventory details dialog -->
  <AppDialog
    v-model="detailsDialogVisible"
    title="貨物詳情"
    size="md"
    @close="closeDetailsDialog"
  >
    <template #default>
      <div class="inventory-details">
        <div class="details-header">
          <h3>{{ selectedItem?.name }}</h3>
          <p class="course-type">課程種類：{{ selectedItem?.courseType }}</p>
        </div>
        <div class="details-image" v-if="selectedItem?.image_url">
          <img
            :src="selectedItem.image_url.startsWith('http') ? selectedItem.image_url : `${API_BASE_URL}${selectedItem.image_url}`"
            :alt="selectedItem.name"
            class="item-image"
            @click="previewImage(selectedItem.image_url)"
          />
        </div>
        <div class="warehouse-list">
          <div 
            v-for="warehouse in (selectedLocation.value 
              ? selectedItem?.warehouses?.filter(w => w.location === selectedLocation.value)
              : selectedItem?.warehouses)" 
            :key="warehouse.location"
            class="warehouse-item"
          >
            <div class="warehouse-header">
              <h4>{{ getWarehouseName(warehouse.location) }}</h4>
            </div>
            <div class="warehouse-info">
              <div class="info-row">
                <span class="label">當前數量：</span>
                <span class="value">{{ warehouse.quantity }} 個</span>
              </div>
              <div class="info-row">
                <span class="label">不良品數量：</span>
                <span class="value">{{ warehouse.defectiveQuantity }} 個</span>
              </div>
            </div>
          </div>
        </div>
        <div class="details-footer">
          <div class="total-info">
            <div class="info-row">
              <span class="label">總數量：</span>
              <span class="value">{{ selectedLocation.value 
                ? selectedItem?.warehouses?.find(w => w.location === selectedLocation.value)?.quantity || 0
                : getTotalQuantity(selectedItem?.warehouses) }} 個</span>
            </div>
            <div class="info-row">
              <span class="label">總不良品數量：</span>
              <span class="value">{{ selectedLocation.value 
                ? selectedItem?.warehouses?.find(w => w.location === selectedLocation.value)?.defectiveQuantity || 0
                : getTotalDefectiveQuantity(selectedItem?.warehouses) }} 個</span>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="dialog-footer">
        <AppButton @click="closeDetailsDialog">關閉</AppButton>
      </div>
    </template>
  </AppDialog>

  <!-- 圖片預覽對話框 Image preview dialog -->
  <AppDialog
    v-model="imagePreviewVisible"
    title="圖片預覽"
    size="lg"
    @close="closeImagePreview"
  >
    <template #default>
      <div class="image-preview-container">
        <img
          :src="previewImageUrl"
          class="preview-image"
          alt="圖片預覽"
        />
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
import InventoryForm from '@/components/inventory/InventoryForm.vue';
import inventoryLogic from './inventory.js';

export default {
  name: 'InventoryPage',
  components: {
    AppButton,
    AppInput,
    AppSelect,
    DataTable,
    AppDialog,
    StatusBadge,
    InventoryForm
  },
  setup() {
    return {
      ...inventoryLogic.setup()
    };
  }
};
</script>

<style lang="scss" scoped>
@import './inventory.scss';
</style> 