<template>
  <div class="materials-page">
    <!-- 頂部導航欄 Top navigation bar -->
    <AppHeader 
      title="教材管理" 
      :isLoggingOut="isLoggingOut"
      @logout="handleLogout"
    />
    
    <div class="container">
      <div class="materials-content">
        <!-- 標籤頁導航 Tab Navigation -->
        <div class="tabs-container">
          <div class="tabs-header">
            <div 
              v-for="tab in tabs" 
              :key="tab.key"
              class="tab-item"
              :class="{ active: currentTab === tab.key }"
              @click="switchTab(tab.key)"
            >
              <div class="tab-icon" :style="{ backgroundColor: tab.iconBg }">
                <component :is="tab.icon" />
              </div>
              <span class="tab-text">{{ tab.label }}</span>
            </div>
          </div>
          
          <!-- 標籤頁內容 Tab Content -->
          <div class="tab-content">
            <!-- 教材管理標籤頁 Materials Management Tab -->
            <div v-if="currentTab === 'materials'" class="materials-management">
              <InventoryPage />
            </div>

            <!-- QRCode管理標籤頁 QRCode Management Tab -->
            <div v-if="currentTab === 'qrcode'" class="qrcode-management">
              <div class="content-header">
                <h2>QRCode管理</h2>
                <AppButton 
                  type="primary"
                  @click="openQRCodeDialog"
                >
                  <template #icon>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </template>
                  新增QRCode
                </AppButton>
              </div>
              
              <!-- QRCode列表 QRCode List -->
              <DataTable
                :loading="loading"
                :columns="qrcodeColumns"
                :data="qrcodeData"
              >
                <!-- QRCode 圖片顯示 QRCode image display -->
                <template #qrcode_url="{ row }">
                  <img
                    :src="`${API_BASE_URL}${row.qrcode_url}?t=${Date.now()}&style=${encodeURIComponent(JSON.stringify(row.custom_style))}`"
                    :alt="row.name"
                    style="width: 50px; height: 50px; object-fit: contain;"
                    @error="handleImageError"
                    :onerror="handleImageError"
                  />
                </template>

                <!-- 掃描次數列 Scan count column -->
                <template #scan_count="{ row }">
                  <span class="scan-count">{{ row.scan_count }}</span>
                </template>

                <!-- 目標連結列 Target URL column -->
                <template #actual_url="{ row }">
                  <a 
                    :href="row.actual_url" 
                    target="_blank"
                    class="redirect-link"
                  >
                    {{ row.actual_url }}
                  </a>
                </template>

                <!-- 操作按鈕 Action buttons -->
                <template #actions="{ row }">
                  <div class="action-buttons">
                    <AppButton
                      type="primary"
                      class="edit-btn"
                      @click="editQRCode(row)"
                      title="編輯"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </AppButton>
                    <!-- 下載按鈕 Download button -->
                    <AppButton
                      type="primary"
                      class="download-btn"
                      @click="openDownloadDialog(row)"
                      title="下載"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </AppButton>
                    <AppButton
                      type="danger"
                      class="delete-btn"
                      @click="deleteQRCode(row)"
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
              </DataTable>
            </div>

            <!-- 倉庫管理標籤頁 Warehouse Management Tab -->
            <div v-if="currentTab === 'warehouse'" class="warehouse-management">
              <WarehousePage />
            </div>

            <!-- 進貨管理標籤頁 Purchase Management Tab -->
            <div v-if="currentTab === 'purchase'" class="purchase-management">
              <PurchasePage />
            </div>

            <!-- 採購管理標籤頁 Procurement Management Tab -->
            <div v-if="currentTab === 'procurement'" class="procurement-management">
              <ProcurementManagement />
            </div>

            <!-- 出貨管理 Shipment Management -->
            <div v-if="currentTab === 'shipment'" class="tab-content">
              <shipment-management />
            </div>

            <!-- 組合商品管理標籤頁 Bundle Management Tab -->
            <div v-if="currentTab === 'bundle'" class="bundle-management">
              <BundleManagement />
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- QRCode對話框 QRCode Dialog -->
    <AppDialog
      v-model="qrcodeDialogVisible"
      :title="qrcodeForm.is_editing ? '編輯 QR Code' : '新增 QR Code'"
      @close="closeQRCodeDialog"
      @confirm="submitQRCodeForm"
    >
      <template #default>
        <div class="qrcode-form">
          <div class="form-item">
            <label>名稱 Name</label>
            <AppInput
              v-model="qrcodeForm.name"
              placeholder="請輸入QRCode名稱 Please enter QRCode name"
            />
          </div>
          <div class="form-item">
            <label>目標連結 Target URL</label>
            <AppInput
              v-model="qrcodeForm.target_url"
              placeholder="請輸入目標連結 Please enter target URL"
            />
          </div>
          <!-- QRCode 樣式設置 QRCode Style Settings -->
          <div class="form-item">
            <label>QRCode 樣式設置 QRCode Style Settings</label>
            <div class="style-settings">
              <div class="style-item">
                <label>前景色 Foreground Color</label>
                <input type="color" v-model="qrcodeForm.custom_style.foregroundColor" />
              </div>
              <div class="style-item">
                <label>背景色 Background Color</label>
                <input type="color" v-model="qrcodeForm.custom_style.backgroundColor" />
              </div>
              <div class="style-item">
                <label>邊距 Margin</label>
                <input type="number" v-model="qrcodeForm.custom_style.margin" min="0" max="10" />
              </div>
              <div class="style-item">
                <label>寬度 Width</label>
                <input type="number" v-model="qrcodeForm.custom_style.width" min="100" max="1000" />
              </div>
              <!-- 容錯率設置 Error Correction Level -->
              <div class="form-item error-correction-level">
                <label>容錯率 Error Correction Level</label>
                <div class="error-correction-options">
                  <label 
                    v-for="level in ['L', 'M', 'Q', 'H']" 
                    :key="level"
                    class="error-correction-option"
                    :class="{ 
                      active: qrcodeForm.custom_style.errorCorrectionLevel === level,
                      disabled: qrcodeForm.is_editing || (qrcodeForm.custom_style.logoUrl && level !== 'H')
                    }"
                    @click="!qrcodeForm.is_editing && !(qrcodeForm.custom_style.logoUrl && level !== 'H') && (qrcodeForm.custom_style.errorCorrectionLevel = level)"
                  >
                    <input
                      type="radio"
                      :value="level"
                      v-model="qrcodeForm.custom_style.errorCorrectionLevel"
                      :disabled="qrcodeForm.is_editing || (qrcodeForm.custom_style.logoUrl && level !== 'H')"
                    />
                    <span class="level-label">{{ level }}</span>
                    <span class="level-description">
                      {{ 
                        level === 'L' ? '低 (7%)' :
                        level === 'M' ? '中 (15%)' :
                        level === 'Q' ? '較高 (25%)' :
                        '高 (30%)'
                      }}
                    </span>
                  </label>
                </div>
              </div>
              <!-- Logo 設置 Logo Settings -->
              <div class="style-item logo-settings">
                <label>Logo 圖片 Logo Image</label>
                <div class="logo-upload">
                  <input
                    type="file"
                    ref="logoInput"
                    @change="handleLogoUpload"
                    accept="image/png,image/jpeg,image/gif"
                    class="logo-input"
                  />
                  <div class="logo-preview" v-if="qrcodeForm.custom_style.logoUrl">
                    <img :src="qrcodeForm.custom_style.logoUrl" alt="Logo Preview" />
                    <button class="remove-logo" @click.prevent="removeLogo">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                  <button v-else class="upload-btn" @click.prevent="triggerLogoUpload">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    上傳 Logo Upload Logo
                  </button>
                </div>
                <!-- Logo 大小設置 Logo Size Settings -->
                <div class="logo-size-settings" v-if="qrcodeForm.custom_style.logoUrl">
                  <label>Logo 大小 Logo Size: {{ qrcodeForm.custom_style.logoSize }}%</label>
                  <input 
                    type="range" 
                    v-model.number="qrcodeForm.custom_style.logoSize" 
                    min="5" 
                    max="30"
                    step="1"
                    @input="updateLogoSize"
                    class="logo-size-slider"
                  />
                  <div class="size-hint">
                    <span>5%</span>
                    <span>30%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- QRCode 預覽區域 QRCode Preview Area -->
          <div v-if="qrcodeForm.target_url" class="qrcode-preview">
            <h3 class="preview-title">QRCode 預覽 Preview</h3>
            <div class="preview-content">
              <div class="preview-info">
                <div class="info-item">
                  <p class="preview-label">系統跳轉連結 System Redirect URL:</p>
                  <div class="preview-url-container">
                    <p class="preview-url">{{ qrcodeForm.preview_url }}</p>
                  </div>
                </div>
              </div>
              <div class="preview-qrcode">
                <img 
                  v-if="qrcodeForm.qrcode_preview" 
                  :src="qrcodeForm.qrcode_preview" 
                  alt="QRCode Preview"
                  class="preview-image"
                />
              </div>
            </div>
          </div>
          <div v-if="qrcodeForm.error" class="error-message">
            {{ qrcodeForm.error }}
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
          <p>確定要刪除這個 QR Code 嗎？此操作無法撤銷。</p>
          <p>Are you sure you want to delete this QR Code? This action cannot be undone.</p>
          <p v-if="qrcodeToDelete">名稱：{{ qrcodeToDelete.name }}</p>
        </div>
      </template>
    </AppDialog>

    <!-- QR Code 下載對話框 QR Code download dialog -->
    <AppDialog
      v-model="downloadDialogVisible"
      title="下載 QR Code Download QR Code"
      @close="closeDownloadDialog"
    >
      <div class="download-dialog-content">
        <div class="format-selection">
          <label>選擇格式 Select Format:</label>
          <select v-model="selectedFormat">
            <option value="png">PNG</option>
            <option value="svg">SVG</option>
            <option value="jpg">JPG</option>
            <option value="pdf">PDF</option>
          </select>
        </div>
        <div class="preview" v-if="qrcodeToDownload">
          <img 
            :src="`${API_BASE_URL}${qrcodeToDownload.qrcode_url}?t=${Date.now()}&style=${encodeURIComponent(JSON.stringify(qrcodeToDownload.custom_style))}`"
            :alt="qrcodeToDownload.name || 'QR Code Preview'"
            @error="handleImageError"
          >
        </div>
      </div>
      <template #footer>
        <AppButton type="default" @click="closeDownloadDialog">取消 Cancel</AppButton>
        <AppButton type="primary" @click="downloadQRCode">下載 Download</AppButton>
      </template>
    </AppDialog>
  </div>
</template>

<script>
import AppHeader from '@/components/layout/AppHeader.vue';
import AppButton from '@/components/base/AppButton.vue';
import DataTable from '@/components/base/DataTable.vue';
import AppDialog from '@/components/base/AppDialog.vue';
import AppInput from '@/components/base/AppInput.vue';
import InventoryPage from './inventory.vue';
import WarehousePage from './warehouse.vue';
import PurchasePage from './purchase.vue';
import ShipmentManagement from './shipment.vue';
import ProcurementManagement from './features/procurement/procurement.vue';
import BundleManagement from './features/bundle/bundle.vue';
import materialsLogic from './materials.js';

export default {
  name: 'MaterialsPage',
  components: {
    AppHeader,
    AppButton,
    DataTable,
    AppDialog,
    AppInput,
    InventoryPage,
    WarehousePage,
    PurchasePage,
    ShipmentManagement,
    ProcurementManagement,
    BundleManagement
  },
  setup() {
    return {
      ...materialsLogic.setup()
    };
  }
};
</script>

<style lang="scss" scoped>
@import './materials.scss';

.materials-page {
  height: 100vh;
  display: flex;
  flex-direction: column;

  .container {
    flex: 1;
    padding: var(--spacing-sm);
    width: 90%;
    margin: 0 auto;
    
    .materials-content {
      height: 100%;
      width: 100%;
      background-color: var(--bg-primary);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }
  }
}

.tabs-container {
  height: 100%;
  display: flex;
  flex-direction: column;

  .tabs-header {
    display: flex;
    gap: var(--spacing-md);
    padding: var(--spacing-sm) var(--spacing-md);
    border-bottom: 1px solid var(--border-color);
  }

  .tab-content {
    flex: 1;
    padding: var(--spacing-xs); // 減少內邊距
    overflow: auto; // 添加滾動條
  }
}
</style> 