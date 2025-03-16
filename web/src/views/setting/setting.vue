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
                    :status="row.status === 'active' ? 'completed' : 'cancelled'"
                    :text="getStatusName(row.status)"
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
  </div>
</template>

<script>
import AppHeader from '@/components/layout/AppHeader.vue';
import DataTable from '@/components/base/DataTable.vue';
import StatusBadge from '@/components/base/StatusBadge.vue';
import AppButton from '@/components/base/AppButton.vue';
import settingLogic from './setting.js';

export default {
  name: 'SettingPage',
  components: {
    AppHeader,
    DataTable,
    StatusBadge,
    AppButton
  },
  ...settingLogic
};
</script>

<style lang="scss" scoped>
@import './setting.scss';
</style> 