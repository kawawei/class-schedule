<!-- 課程列表頁面 Course List Page -->
<template>
  <div class="course-list-page">
    <!-- 頂部導航欄 Top navigation bar -->
    <AppHeader 
      title="課程種類管理" 
      :isLoggingOut="isLoggingOut"
      @logout="handleLogout"
    />
    
    <div class="container">
      <div class="course-list-content">
        <!-- 課程列表標題 Course list title -->
        <div class="course-list-header">
          <h2 class="course-list-title">課程種類列表</h2>
        </div>
        
        <!-- 搜索框 Search box -->
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="搜尋課程名稱..." 
            @input="handleSearch"
            class="search-input"
          />
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        
        <!-- 課程卡片網格 Course card grid -->
        <div v-if="!loading" class="course-card-grid">
          <div v-for="course in filteredCourses" :key="course.id" class="course-card-item">
            <AppCard 
              :hoverable="true" 
              :clickable="true"
              class="course-card" 
              :class="getCardColorClass(course.category)"
              @click="editCourse(course)"
            >
              <div class="course-card-content">
                <h3 class="course-name">{{ course.category }}</h3>
                <div class="course-card-actions">
                  <AppButton 
                    type="text" 
                    @click="editCourse(course)"
                    class="edit-btn"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </AppButton>
                  <AppButton 
                    type="text" 
                    @click="deleteCourse(course)"
                    class="delete-btn"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </AppButton>
                </div>
              </div>
            </AppCard>
          </div>
          
          <!-- 新增課程卡片 Add course card -->
          <div class="course-card-item">
            <AppCard 
              :hoverable="true" 
              :clickable="true" 
              class="course-card add-card" 
              @click="openAddCourseDialog"
            >
              <div class="course-card-content">
                <div class="add-course-content">
                  <div class="add-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </div>
                  <p class="course-name">新增課程種類</p>
                </div>
              </div>
            </AppCard>
          </div>
        </div>
        
        <!-- 加載中狀態 Loading state -->
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>加載中...</p>
        </div>
        
        <!-- 空數據提示 Empty data prompt -->
        <div v-if="!loading && filteredCourses.length === 0" class="empty-data">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <p>暫無課程數據</p>
          <AppButton 
            type="primary"
            @click="openAddCourseDialog"
          >
            新增課程
          </AppButton>
        </div>
      </div>
    </div>
    
    <!-- 新增/編輯課程對話框 Add/Edit course dialog -->
    <AppDialog
      v-model="courseDialogVisible"
      :title="isEditMode ? '編輯課程種類' : '新增課程種類'"
      :loading="saving"
    >
      <div class="course-form">
        <!-- 確保表單不會自動提交 Ensure form doesn't auto-submit -->
        <div class="form-group">
          <AppInput
            label="課程種類"
            v-model="courseForm.category"
            placeholder="請輸入課程種類"
            required
          />
        </div>
      </div>
      <template #footer>
        <AppButton 
          type="secondary"
          @click="courseDialogVisible = false"
        >
          取消
        </AppButton>
        <AppButton 
          type="primary"
          @click.once="saveCourse"
          :loading="saving"
        >
          {{ isEditMode ? '更新' : '新增' }}
        </AppButton>
      </template>
    </AppDialog>
    
    <!-- 刪除確認對話框 Delete confirmation dialog -->
    <AppDialog
      v-model="deleteDialogVisible"
      title="確認刪除"
      @close="deleteDialogVisible = false"
    >
      <div class="delete-confirmation">
        <p>確定要刪除課程種類「{{ currentCourse.category }}」嗎？此操作無法撤銷。</p>
      </div>
      <template #footer>
        <AppButton 
          type="secondary"
          @click="deleteDialogVisible = false"
        >
          取消
        </AppButton>
        <AppButton 
          type="danger"
          @click="confirmDelete"
          :loading="deleting"
        >
          確認刪除
        </AppButton>
      </template>
    </AppDialog>
  </div>
</template>

<script>
import AppHeader from '@/components/layout/AppHeader.vue';
import AppButton from '@/components/base/AppButton.vue';
import AppDialog from '@/components/base/AppDialog.vue';
import AppSelect from '@/components/base/AppSelect.vue';
import AppInput from '@/components/base/AppInput.vue';
import ToggleSwitch from '@/components/base/ToggleSwitch.vue';
import StatusBadge from '@/components/base/StatusBadge.vue';
import AppCard from '@/components/base/AppCard.vue';
import courseListLogic from './course-list.js';

export default {
  name: 'CourseList',
  components: {
    AppHeader,
    AppButton,
    AppDialog,
    AppSelect,
    AppInput,
    ToggleSwitch,
    StatusBadge,
    AppCard
  },
  setup() {
    return {
      ...courseListLogic.setup()
    };
  }
};
</script>

<style lang="scss" scoped>
@import './course.scss';
</style> 