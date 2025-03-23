<!-- 權限設置組件 Permission Settings Component -->
<template>
  <div class="permission-settings">
    <!-- 頁面標題 Page Title -->
    <div class="content-header">
      <h2>權限設置</h2>
    </div>

    <!-- 主要內容區域 Main Content Area -->
    <div class="main-content">
      <!-- 用戶列表 User List -->
      <div class="user-list">
        <div class="search-box">
          <AppInput
            v-model="searchQuery"
            placeholder="搜尋用戶..."
          >
            <template #prefix>
              <i class="fas fa-search"></i>
            </template>
          </AppInput>
        </div>

        <div class="users">
          <div
            v-for="user in filteredUsers"
            :key="user.id"
            :class="['user-item', { active: selectedUser?.id === user.id }]"
            @click="selectUser(user)"
          >
            <div class="user-info">
              <div class="user-name">{{ user.name }}</div>
              <div class="user-role">{{ getRoleName(user.role) }}</div>
            </div>
            <div class="user-status" :class="user.is_active ? 'active' : 'inactive'">
              {{ user.is_active ? '啟用' : '停用' }}
            </div>
          </div>
        </div>
      </div>

      <!-- 權限設置區域 Permission Settings Area -->
      <template v-if="selectedUser">
        <div class="permission-area">
          <div class="user-header">
            <h3>{{ selectedUser.name }} 的權限設置</h3>
            <div class="user-role">
              角色：{{ getRoleName(selectedUser.role) }}
            </div>
          </div>

          <!-- 權限模組列表 Permission Modules List -->
          <div class="permission-modules">
            <div v-for="(module, moduleKey) in modules" :key="moduleKey" class="module-card">
              <div class="module-header">
                <div class="module-title">
                  <i :class="module.icon"></i>
                  <h4>{{ module.name }}</h4>
                </div>
                <ToggleSwitch
                  v-model="permissions[moduleKey]"
                  :disabled="isAdmin"
                  @change="() => updatePermission(moduleKey)"
                />
              </div>
              <div class="module-description">
                {{ module.description }}
              </div>
            </div>
          </div>

          <!-- 保存按鈕 Save Button -->
          <div class="actions">
            <AppButton
              type="primary"
              :loading="loading"
              @click="saveChanges"
            >
              儲存設置
            </AppButton>
          </div>
        </div>
      </template>

      <!-- 未選擇用戶時的提示 Prompt when no user is selected -->
      <div class="no-selection" v-else>
        <div class="empty-state">
          <i class="fas fa-user-cog"></i>
          <p>請選擇左側用戶進行權限設置</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./permissionSettings.js"></script>
<style lang="scss" scoped src="./permissionSettings.scss"></style> 