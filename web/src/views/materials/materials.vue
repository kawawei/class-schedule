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
              <div class="content-header">
                <h2>教材管理</h2>
                <AppButton 
                  type="primary"
                  @click="openAddMaterialDialog"
                >
                  <template #icon>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </template>
                  新增教材
                </AppButton>
              </div>
              <!-- 教材列表將在後續開發 Materials list will be developed later -->
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
                    :src="`${API_BASE_URL}${row.qrcode_url}?v=${row.id}-${row.updated_at}`"
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
              <div class="form-item">
                <label>容錯率 Error Correction Level</label>
                <select 
                  v-model="qrcodeForm.custom_style.errorCorrectionLevel"
                  :disabled="qrcodeForm.is_editing"
                  :title="qrcodeForm.is_editing ? '編輯模式下不能修改容錯率 Cannot modify error correction level in edit mode' : ''"
                >
                  <option value="L">L - 低 (7%)</option>
                  <option value="M">M - 中 (15%)</option>
                  <option value="Q">Q - 較高 (25%)</option>
                  <option value="H">H - 高 (30%)</option>
                </select>
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
import materialsLogic from './materials.js';

export default {
  name: 'MaterialsPage',
  components: {
    AppHeader,
    AppButton,
    DataTable,
    AppDialog,
    AppInput
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

.qrcode-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  max-width: 500px;
  margin: 0 auto;

  .form-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    label {
      font-weight: 500;
      color: var(--text-primary);
    }
  }

  .style-settings {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    padding: 1rem;
    background-color: var(--bg-secondary);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-gray-200);

    .style-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      label {
        font-size: 0.9rem;
        color: var(--text-secondary);
      }

      input[type="color"] {
        width: 100%;
        height: 36px;
        padding: 0;
        border: 1px solid var(--color-gray-200);
        border-radius: var(--radius-md);
        cursor: pointer;
      }

      input[type="number"] {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid var(--color-gray-200);
        border-radius: var(--radius-md);
        font-size: 0.9rem;
      }

      select {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid var(--color-gray-200);
        border-radius: var(--radius-md);
        font-size: 0.9rem;
        background-color: var(--bg-primary);
        color: var(--text-primary);
      }
    }
  }
}

.qrcode-preview {
  margin-top: 1rem;
  padding: 1.5rem;
  background-color: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-gray-200);

  .preview-title {
    margin: 0 0 1.5rem;
    font-size: 1.1rem;
    color: var(--text-primary);
    font-weight: 500;
    text-align: center;
  }

  .preview-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;

    .preview-info {
      width: 100%;

      .info-item {
        .preview-label {
          font-weight: 500;
          color: var(--text-secondary);
          margin: 0 0 0.5rem;
          text-align: center;
        }

        .preview-url-container {
          background-color: var(--bg-primary);
          border-radius: var(--radius-md);
          border: 1px solid var(--color-gray-200);
          padding: 0.75rem;

          .preview-url {
            margin: 0;
            word-break: break-all;
            font-family: monospace;
            font-size: 0.9rem;
            line-height: 1.4;
            color: var(--text-primary);
            text-align: center;
          }
        }
      }
    }

    .preview-qrcode {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 1rem;
      background-color: white;
      border-radius: var(--radius-md);
      border: 1px solid var(--color-gray-200);

      .preview-image {
        width: 200px;
        height: 200px;
        object-fit: contain;
      }
    }
  }
}

.error-message {
  color: var(--color-danger);
  text-align: center;
  padding: 0.5rem;
  border-radius: var(--radius-md);
  background-color: var(--color-danger-light);
}

.delete-confirm-content {
  padding: 2rem;
  text-align: center;
  
  p {
    margin: 0.5rem 0;
    line-height: 1.5;
    
    &:first-child {
      font-weight: 500;
    }
  }
}

img {
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-sm);
  background-color: white;
  padding: 2px;
  
  &[src="/images/qrcode-placeholder.png"] {
    opacity: 0.5;
  }
}

.download-dialog-content {
  padding: 20px;
}

.format-selection {
  margin-bottom: 20px;
}

.format-selection label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
}

.format-selection select {
  width: 100%;
  padding: 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
}

.preview {
  text-align: center;
  margin-top: 20px;
}

.preview img {
  max-width: 200px;
  max-height: 200px;
  object-fit: contain;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;

  :deep(button) {
    padding: 4px 8px;
    background: transparent !important;
    border: none !important;
    color: var(--text-primary);
    transition: color 0.3s ease;
    min-width: unset !important;
    height: unset !important;
    opacity: 1 !important;

    &:hover {
      color: var(--color-primary);
      background: var(--bg-hover) !important;
    }

    &.delete-btn:hover {
      color: var(--color-danger);
    }

    &.download-btn {
      color: var(--color-info);
      
      &:hover {
        color: var(--color-info-dark);
      }
    }

    svg {
      display: block;
    }
  }
}
</style> 