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
                :columns="qrcodeColumns"
                :data="qrcodeData"
                row-key="id"
                :loading="loading"
              >
                <!-- QRCode圖片列 QRCode image column -->
                <template #qrcodeUrl="{ row }">
                  <img 
                    :src="row.qrcodeUrl" 
                    :alt="row.name"
                    class="qrcode-image"
                  >
                </template>

                <!-- 掃描次數列 Scan count column -->
                <template #scanCount="{ row }">
                  <span class="scan-count">{{ row.scanCount }}</span>
                </template>

                <!-- 跳轉連結列 Redirect URL column -->
                <template #redirectUrl="{ row }">
                  <a 
                    :href="row.redirectUrl" 
                    target="_blank"
                    class="redirect-link"
                  >
                    {{ row.redirectUrl }}
                  </a>
                </template>

                <!-- 操作列 Actions column -->
                <template #actions="{ row }">
                  <div class="action-buttons">
                    <AppButton
                      type="primary"
                      class="edit-btn"
                      @click.stop="editQRCode(row)"
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
                      @click.stop="deleteQRCode(row)"
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
      v-model:visible="qrcodeDialogVisible"
      title="新增QRCode"
      @close="closeQRCodeDialog"
    >
      <template #content>
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
          <div v-if="qrcodeForm.error" class="error-message">
            {{ qrcodeForm.error }}
          </div>
        </div>
      </template>
      <template #footer>
        <div class="dialog-footer">
          <AppButton
            type="secondary"
            @click="closeQRCodeDialog"
          >
            取消 Cancel
          </AppButton>
          <AppButton
            type="primary"
            :loading="loading"
            @click="submitQRCodeForm"
          >
            確認 Confirm
          </AppButton>
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
          <p>確定要刪除這個 QR Code 嗎？</p>
          <p>Are you sure you want to delete this QR Code?</p>
          <p v-if="qrcodeToDelete">名稱：{{ qrcodeToDelete.name }}</p>
        </div>
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
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem;
  border-top: 1px solid var(--color-gray-200);
}

.qrcode-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  background-color: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-sm);
    color: var(--text-secondary);
    
    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid var(--color-gray-200);
      border-top-color: var(--color-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  }
  
  .preview-image {
    max-width: 200px;
    max-height: 200px;
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-sm);
  }
  
  .placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-sm);
    color: var(--text-secondary);
    
    svg {
      color: var(--text-secondary);
    }
    
    span {
      font-size: var(--font-size-sm);
      text-align: center;
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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
</style> 