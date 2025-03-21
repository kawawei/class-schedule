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
        <div v-if="!loading" class="course-cards">
          <div v-for="course in filteredCourses" 
               :key="course.id" 
               class="course-card"
               :style="{ background: course.gradient }"
               @click="editCourse(course)">
            <div class="course-content">
              <h3>{{ course.category }}</h3>
              <div class="course-actions">
                <button class="edit-btn" @click.stop="editCourse(course)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button class="delete-btn" @click.stop="deleteCourse(course)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <!-- 新增課程卡片 Add course card -->
          <div class="course-card add-card" @click="openAddCourseDialog">
            <div class="add-content">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>新增課程種類</span>
            </div>
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

.course-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  padding: 20px;
}

.course-card {
  position: relative;
  min-height: 120px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  overflow: hidden;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
  
  .course-content {
    padding: 20px;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    
    h3 {
      margin: 0;
      font-size: 1.2em;
      font-weight: 600;
    }
  }
  
  .course-actions {
    position: absolute;
    bottom: 15px;
    right: 15px;
    display: flex;
    gap: 10px;
    opacity: 0;
    transition: opacity 0.2s ease;
    
    button {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      cursor: pointer;
      transition: all 0.2s ease;
      padding: 0;
      
      &:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: scale(1.1);
      }
      
      svg {
        width: 16px;
        height: 16px;
      }
    }
  }
  
  &:hover .course-actions {
    opacity: 1;
  }
}

.add-card {
  background: linear-gradient(135deg, #E0E0E0 0%, #F5F5F5 100%);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .add-content {
    text-align: center;
    color: #666;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    
    svg {
      width: 32px;
      height: 32px;
      stroke: #666;
    }
    
    span {
      font-size: 14px;
    }
  }
  
  &:hover {
    background: linear-gradient(135deg, #D0D0D0 0%, #E5E5E5 100%);
  }
}
</style> 