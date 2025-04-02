<template>
  <header class="app-header frosted-glass">
    <div class="container d-flex justify-content-between align-items-center">
      <div class="header-left d-flex align-items-center">
        <router-link to="/dashboard" class="home-btn" title="返回首頁">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </router-link>
        <button class="menu-btn" @click="toggleMenu" title="功能選單">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <slot name="left">
          <h1 class="header-title">{{ companyName }}</h1>
        </slot>
      </div>
      <div class="header-right d-flex align-items-center">
        <div class="user-info d-flex align-items-center">
          <span class="user-name">{{ userName }}</span>
          <div class="user-avatar">
            <img :src="userAvatar || defaultAvatar" :alt="`${userName}頭像`">
          </div>
          <button class="logout-btn" @click="handleLogout" :disabled="isLoggingOut">
            <svg v-if="!isLoggingOut" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span v-if="isLoggingOut" class="loading-spinner"></span>
            <span>{{ isLoggingOut ? '登出中...' : '登出' }}</span>
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- 菜單彈出窗口 Menu popup window -->
  <div class="menu-overlay" v-if="menuVisible" @click="closeMenu">
    <div class="menu-popup frosted-glass" @click.stop>
      <div class="menu-header">
        <h2>系統功能選單</h2>
        <button class="close-btn" @click="closeMenu">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="menu-content">
        <!-- 根據用戶角色顯示不同的菜單選項 Show different menu items based on user role -->
        <template v-if="userRole === 'teacher'">
          <!-- 老師專用菜單 Teacher menu -->
          <router-link to="/teacher/schedule" class="menu-item">
            <div class="icon-wrapper schedule-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
                <circle cx="12" cy="15" r="2"></circle>
              </svg>
            </div>
            <span>課程表</span>
          </router-link>
          <router-link to="/teacher/attendance" class="menu-item">
            <div class="icon-wrapper attendance-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
                <path d="M12 11v4"></path>
                <path d="M9 14h6"></path>
              </svg>
            </div>
            <span>點名管理</span>
          </router-link>
          <router-link to="/teacher/materials" class="menu-item">
            <div class="icon-wrapper material-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                <path d="M12 10v6"></path>
                <path d="M9 13h6"></path>
              </svg>
            </div>
            <span>教材管理</span>
          </router-link>
          <router-link to="/teacher/students" class="menu-item">
            <div class="icon-wrapper student-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <span>學生管理</span>
          </router-link>
          <router-link to="/teacher/reports" class="menu-item">
            <div class="icon-wrapper report-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
                <path d="M3 20h18"></path>
                <circle cx="18" cy="7" r="2"></circle>
              </svg>
            </div>
            <span>教學報告</span>
          </router-link>
          <router-link to="/teacher/profile" class="menu-item">
            <div class="icon-wrapper profile-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <span>個人資料</span>
          </router-link>
        </template>
        <template v-else>
          <!-- 管理員菜單 Admin menu -->
          <router-link to="/schedule" class="menu-item">
            <div class="icon-wrapper schedule-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
                <circle cx="12" cy="15" r="2"></circle>
              </svg>
            </div>
            <span>排課管理</span>
          </router-link>
          <router-link to="/teachers" class="menu-item">
            <div class="icon-wrapper teacher-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
                <path d="M12 11v4"></path>
                <path d="M9 14h6"></path>
              </svg>
            </div>
            <span>老師管理</span>
          </router-link>
          <router-link to="/courses" class="menu-item">
            <div class="icon-wrapper course-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                <path d="M8 6h8"></path>
                <path d="M8 10h8"></path>
                <path d="M8 14h6"></path>
              </svg>
            </div>
            <span>課程管理</span>
          </router-link>
          <router-link to="/materials" class="menu-item">
            <div class="icon-wrapper material-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                <path d="M12 10v6"></path>
                <path d="M9 13h6"></path>
              </svg>
            </div>
            <span>教材管理</span>
          </router-link>
          <router-link to="/reports" class="menu-item">
            <div class="icon-wrapper report-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
                <path d="M3 20h18"></path>
                <circle cx="18" cy="7" r="2"></circle>
              </svg>
            </div>
            <span>報表統計</span>
          </router-link>
          <router-link to="/settings" class="menu-item">
            <div class="icon-wrapper settings-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </div>
            <span>基礎設置</span>
          </router-link>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
// 導入腳本文件 Import script file
import AppHeaderScript from './AppHeader.js';

// 導出組件 Export component
export default AppHeaderScript;
</script>

<style lang="scss" scoped>
// 導入樣式文件 Import style file
@import './AppHeader.scss';
</style> 