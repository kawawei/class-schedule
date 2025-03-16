<!-- 基礎設置頁面 Basic Settings Page -->
<template>
  <div class="setting-page">
    <!-- 頂部導航欄 Top navigation bar -->
    <AppHeader 
      title="基礎設置" 
      :userName="userName" 
      :isLoggingOut="isLoggingOut"
      @logout="handleLogout"
    />
    
    <div class="container">
      <div class="setting-content">
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
            <!-- 用戶管理標籤頁 User Management Tab -->
            <div v-if="currentTab === 'users'" class="users-management">
              <div class="content-header">
                <h2>用戶管理</h2>
                <AppButton 
                  type="primary"
                  @click="openAddUserDialog"
                >
                  <template #icon>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </template>
                  新增用戶
                </AppButton>
              </div>
              
              <!-- 用戶列表 User List -->
              <DataTable
                :columns="userColumns"
                :data="users"
                row-key="id"
                :loading="loading"
              >
                <!-- 角色列 Role column -->
                <template #role="{ row }">
                  <span class="role-badge" :class="row.role">
                    {{ getRoleName(row.role) }}
                  </span>
                </template>
                
                <!-- 狀態列 Status column -->
                <template #status="{ row }">
                  <StatusBadge
                    :status="row.is_active ? 'completed' : 'cancelled'"
                    :text="getStatusName(row.is_active ? 'active' : 'inactive')"
                  />
                </template>
                
                <!-- 創建時間列 Created time column -->
                <template #createdAt="{ row }">
                  {{ formatDate(row.createdAt) }}
                </template>
                
                <!-- 操作列 Actions column -->
                <template #actions="{ row }">
                  <div class="action-buttons">
                    <AppButton
                      type="secondary"
                      class="edit-btn"
                      @click="handleEdit(row)"
                      title="編輯用戶"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </AppButton>
                    <AppButton
                      type="danger"
                      class="delete-btn"
                      @click="handleDelete(row)"
                      title="刪除用戶"
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
    
    <!-- 用戶對話框 User Dialog -->
    <AppDialog
      v-model="userDialogVisible"
      :title="isEditMode ? '編輯用戶' : '新增用戶'"
      :loading="loading"
      @confirm="saveUser"
    >
      <div class="user-form">
        <div class="form-row">
          <AppInput
            label="用戶名"
            v-model="currentUser.username"
            placeholder="請輸入用戶名"
            required
          />
        </div>
        <div class="form-row">
          <AppInput
            label="密碼"
            type="password"
            v-model="currentUser.password"
            :placeholder="isEditMode ? '不修改請留空' : '請輸入密碼'"
            :required="!isEditMode"
          />
        </div>
        <div class="form-row">
          <AppInput
            label="姓名"
            v-model="currentUser.name"
            placeholder="請輸入姓名"
            required
          />
        </div>
        <div class="form-row">
          <AppInput
            label="電子郵件"
            type="email"
            v-model="currentUser.email"
            placeholder="請輸入電子郵件"
          />
        </div>
        <div class="form-row">
          <AppSelect
            label="角色"
            v-model="currentUser.role"
            :options="[
              { value: 'admin', label: '管理員' },
              { value: 'teacher', label: '老師' }
            ]"
            placeholder="請選擇角色"
          />
        </div>
        <div class="form-row">
          <CheckboxGroup
            label="部門"
            :options="departmentOptions"
            v-model="currentUser.departments"
          />
        </div>
      </div>
    </AppDialog>
  </div>
</template>

<script>
import AppHeader from '@/components/layout/AppHeader.vue';
import DataTable from '@/components/base/DataTable.vue';
import StatusBadge from '@/components/base/StatusBadge.vue';
import AppButton from '@/components/base/AppButton.vue';
import AppInput from '@/components/base/AppInput.vue';
import AppDialog from '@/components/base/AppDialog.vue';
import AppCheckbox from '@/components/base/AppCheckbox.vue';
import CheckboxGroup from '@/components/base/CheckboxGroup.vue';
import AppSelect from '@/components/base/AppSelect.vue';
import settingLogic from './setting.js';

export default {
  name: 'SettingPage',
  components: {
    AppHeader,
    DataTable,
    StatusBadge,
    AppButton,
    AppInput,
    AppDialog,
    AppCheckbox,
    CheckboxGroup,
    AppSelect
  },
  ...settingLogic
};
</script>

<style lang="scss" scoped>
@import './setting.scss';

.user-form {
  .form-row {
    margin-bottom: var(--spacing-md);
  }
  
  .form-label {
    display: block;
    margin-bottom: var(--spacing-xs);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--text-secondary);
  }
  
  .form-select {
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      right: 15px;
      transform: translateY(-50%) rotate(45deg);
      width: 8px;
      height: 8px;
      border-right: 2px solid #000;
      border-bottom: 2px solid #000;
      pointer-events: none;
      transition: transform 0.3s ease;
    }
    
    &:hover::after {
      transform: translateY(-50%) rotate(45deg) scale(1.2);
    }
    
    select {
      width: 100%;
      padding: var(--spacing-sm) var(--spacing-md);
      padding-right: 35px;
      border: 1px solid #000000;
      border-radius: var(--radius-md);
      font-size: var(--font-size-md);
      color: var(--text-primary);
      background-color: var(--color-white);
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05);
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      transition: all 0.3s ease;
      cursor: pointer;
      
      &:hover {
        background-color: var(--color-gray-50);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      
      &:focus {
        outline: none;
        border-color: var(--color-primary);
        border-width: 2px;
        box-shadow: 0 0 0 2px rgba(0, 113, 227, 0.2);
      }
    }
  }
}
</style> 