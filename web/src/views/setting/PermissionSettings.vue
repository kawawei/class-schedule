<!-- 權限設置組件 Permission Settings Component -->
<template>
  <div class="permission-settings">
    <!-- 頁面標題 Page Title -->
    <div class="content-header">
      <h2>權限設置 / Permission Settings</h2>
    </div>

    <!-- 主要內容區域 Main Content Area -->
    <div class="main-content">
      <!-- 用戶列表 User List -->
      <div class="user-list">
        <div class="search-box">
          <AppInput
            v-model="searchQuery"
            placeholder="搜尋用戶... / Search users..."
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
              <div class="user-name">{{ user.name || user.username }}</div>
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
            <h3>{{ selectedUser.name || selectedUser.username }} 的權限設置</h3>
            <div class="user-role">
              角色：{{ getRoleName(selectedUser.role) }}
            </div>
          </div>

          <!-- 權限模組列表 Permission Modules List -->
          <div class="permission-modules">
            <div v-for="module in modules" :key="module.key" class="module-card">
              <div class="module-header">
                <div class="module-title">
                  <i :class="'fas fa-' + module.icon"></i>
                  <h4>{{ module.name }}</h4>
                </div>
                <ToggleSwitch
                  v-model="permissions[module.key]"
                  :disabled="!canModifyPermissions"
                  @change="() => updatePermission(module.key)"
                />
              </div>
              <div class="module-description">
                {{ module.description }}
              </div>
            </div>
          </div>

          <div v-if="!canModifyPermissions" class="permission-notice">
            <i class="fas fa-info-circle"></i>
            <span v-if="selectedUser.role === 'admin'">
              只有超級管理員可以修改管理員的權限
              <br>
              Only super administrators can modify admin permissions
            </span>
            <span v-else>
              您沒有權限修改此用戶的權限設置
              <br>
              You don't have permission to modify this user's permissions
            </span>
          </div>
        </div>
      </template>

      <!-- 未選擇用戶時的提示 Prompt when no user is selected -->
      <div class="no-selection" v-else>
        <div class="empty-state">
          <i class="fas fa-user-cog"></i>
          <p>請選擇左側用戶進行權限設置<br>Please select a user from the left to set permissions</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./permissionSettings.js"></script>

<style lang="scss" scoped>
.permission-settings {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 180px);
  padding: 20px;
  gap: 20px;

  .content-header {
    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
    }
  }

  .main-content {
    display: flex;
    gap: 20px;
    flex: 1;
    min-height: 0;
  }

  .user-list {
    flex: 0 0 280px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .search-box {
      padding: 16px;
      border-bottom: 1px solid #eee;
    }

    .users {
      flex: 1;
      overflow-y: auto;
      padding: 8px;

      .user-item {
        padding: 12px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
        margin-bottom: 4px;

        &:hover {
          background: #f5f7fa;
        }

        &.active {
          background: #e6f7ff;
          border-left: 3px solid #1890ff;
        }

        .user-info {
          .user-name {
            font-weight: 500;
            margin-bottom: 4px;
          }

          .user-role {
            font-size: 12px;
            color: #666;
          }
        }

        .user-status {
          font-size: 12px;
          margin-top: 4px;
          
          &.active {
            color: #52c41a;
          }
          
          &.inactive {
            color: #ff4d4f;
          }
        }
      }
    }
  }

  .permission-area {
    flex: 1;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 20px;
    overflow-y: auto;

    .user-header {
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #eee;

      h3 {
        margin: 0 0 8px 0;
        font-size: 20px;
        font-weight: 500;
      }

      .user-role {
        color: #666;
      }
    }

    .permission-modules {
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));

      .module-card {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 16px;
        border: 1px solid #eee;

        .module-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;

          .module-title {
            display: flex;
            align-items: center;
            gap: 8px;

            i {
              font-size: 16px;
              color: #1890ff;
            }

            h4 {
              margin: 0;
              font-size: 16px;
              font-weight: 500;
            }
          }
        }

        .module-description {
          color: #666;
          font-size: 14px;
          line-height: 1.5;
        }
      }
    }

    .permission-notice {
      margin-top: 20px;
      padding: 12px 16px;
      background: #fff7e6;
      border: 1px solid #ffe7ba;
      border-radius: 6px;
      color: #d46b08;
      display: flex;
      align-items: center;
      gap: 8px;

      i {
        font-size: 16px;
      }
    }
  }

  .no-selection {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    .empty-state {
      text-align: center;
      color: #999;

      i {
        font-size: 48px;
        margin-bottom: 16px;
        display: block;
      }

      p {
        margin: 0;
        font-size: 16px;
      }
    }
  }
}
</style> 