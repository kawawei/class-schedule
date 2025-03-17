<!-- 老師管理頁面 Teacher Management Page -->
<template>
  <div class="teacher-page">
    <!-- 頂部導航欄 Top navigation bar -->
    <AppHeader 
      title="老師管理" 
      :userName="userName" 
      :isLoggingOut="isLoggingOut"
      @logout="handleLogout"
    />
    
    <div class="container">
      <div class="teacher-content">
        <!-- 頁面標題和操作按鈕 Page title and action buttons -->
        <div class="content-header">
          <h2>老師列表</h2>
          <div class="header-actions">
            <div class="search-box">
              <input 
                type="text" 
                v-model="searchQuery" 
                placeholder="搜尋老師..." 
                @input="handleSearch"
              />
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <AppButton 
              type="primary"
              @click="openAddTeacherForm"
            >
              <template #icon>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </template>
              新增老師
            </AppButton>
          </div>
        </div>
        
        <!-- 篩選選項 Filter options -->
        <div class="filter-options">
          <div class="filter-item">
            <label>教學種類</label>
            <AppSelect
              v-model="filters.category"
              :options="categoryOptions"
              placeholder="全部種類"
              @change="applyFilters"
            />
          </div>
          <div class="filter-item">
            <label>縣市</label>
            <AppSelect
              v-model="filters.county"
              :options="countyOptions"
              placeholder="全部縣市"
              @change="handleCountyChange"
            />
          </div>
          <div class="filter-item" v-if="filters.county && districtOptions.length > 0">
            <label>區域</label>
            <AppSelect
              v-model="filters.district"
              :options="districtOptions"
              placeholder="全部區域"
              @change="applyFilters"
            />
          </div>
          <div class="filter-item">
            <label>等級</label>
            <AppSelect
              v-model="filters.level"
              :options="levelOptions"
              placeholder="全部等級"
              @change="applyFilters"
            />
          </div>
          <div class="filter-item">
            <label>狀態</label>
            <AppSelect
              v-model="filters.status"
              :options="statusOptions"
              placeholder="全部狀態"
              @change="applyFilters"
            />
          </div>
        </div>
        
        <!-- 老師列表 Teacher List -->
        <DataTable
          :columns="teacherColumns"
          :data="filteredTeachers"
          row-key="id"
          :loading="loading"
          @row-click="viewTeacherDetails"
        >
          <!-- 無數據提示 Empty data message -->
          <template #empty>
            <div class="empty-data">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <p>暫無老師數據</p>
              <AppButton 
                type="primary"
                @click="openAddTeacherForm"
              >
                新增老師
              </AppButton>
            </div>
          </template>
          
          <!-- 等級列 Level column -->
          <template #level="{ row }">
            <StatusBadge
              :status="getLevelStatus(row.level)"
              :text="row.level"
            />
          </template>
          
          <!-- 狀態列 Status column -->
          <template #status="{ row }">
            <ToggleSwitch
              :model-value="row.is_active"
              @change="toggleTeacherStatus(row)"
            />
          </template>
          
          <!-- 操作列 Actions column -->
          <template #actions="{ row }">
            <div class="action-buttons">
              <AppButton
                type="secondary"
                class="edit-btn"
                @click.stop="editTeacher(row)"
                title="編輯老師"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </AppButton>
              <AppButton
                type="danger"
                class="delete-btn"
                @click.stop="deleteTeacher(row)"
                title="刪除老師"
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
    
    <!-- 確認刪除對話框 Confirm Delete Dialog -->
    <AppDialog
      v-model="deleteDialogVisible"
      title="確認刪除"
      :loading="loading"
      @confirm="confirmDelete"
    >
      <p>確定要刪除老師「{{ currentTeacher.name }}」嗎？此操作無法撤銷。</p>
    </AppDialog>
    
    <!-- 老師詳情對話框 Teacher Details Dialog -->
    <AppDialog
      v-model="detailsDialogVisible"
      title="老師詳細資訊"
      :loading="loading"
    >
      <div class="teacher-details">
        <AppCard>
          <div class="details-section">
            <h3 class="section-title">基本資料</h3>
            <div class="details-grid">
              <div class="detail-item">
                <span class="detail-label">姓名</span>
                <span class="detail-value">{{ currentTeacher.name }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">聯絡電話</span>
                <span class="detail-value">{{ currentTeacher.phone }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">LINE ID</span>
                <span class="detail-value">{{ currentTeacher.line_id || '未設定' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">地址</span>
                <span class="detail-value">{{ currentTeacher.county + currentTeacher.district + currentTeacher.address }}</span>
              </div>
            </div>
          </div>
          
          <div class="details-section">
            <h3 class="section-title">教學資訊</h3>
            <div class="details-grid">
              <div class="detail-item">
                <span class="detail-label">教學種類</span>
                <div class="detail-value">
                  <div class="category-tags">
                    <span 
                      v-for="(category, index) in currentTeacher.teaching_categories" 
                      :key="index"
                      class="category-tag"
                    >
                      {{ category }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="detail-item">
                <span class="detail-label">等級</span>
                <span class="detail-value">
                  <StatusBadge
                    :status="getLevelStatus(currentTeacher.level)"
                    :text="currentTeacher.level"
                  />
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">教學年資</span>
                <span class="detail-value">{{ currentTeacher.years_of_experience }} 年</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">鐘點費</span>
                <span class="detail-value">{{ currentTeacher.hourly_rate }} 元/小時</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">專長</span>
                <span class="detail-value">{{ currentTeacher.specialty || '未設定' }}</span>
              </div>
            </div>
          </div>
          
          <div class="details-section">
            <h3 class="section-title">緊急聯絡人</h3>
            <div class="details-grid">
              <div class="detail-item">
                <span class="detail-label">姓名</span>
                <span class="detail-value">{{ currentTeacher.emergency_contact_name || '未設定' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">關係</span>
                <span class="detail-value">{{ currentTeacher.emergency_contact_relation || '未設定' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">聯絡電話</span>
                <span class="detail-value">{{ currentTeacher.emergency_contact_phone || '未設定' }}</span>
              </div>
            </div>
          </div>
          
          <div class="details-section" v-if="currentTeacher.notes">
            <h3 class="section-title">備註</h3>
            <div class="details-notes">
              {{ currentTeacher.notes }}
            </div>
          </div>
        </AppCard>
      </div>
    </AppDialog>
  </div>
</template>

<script>
import AppHeader from '@/components/layout/AppHeader.vue';
import DataTable from '@/components/base/DataTable.vue';
import AppButton from '@/components/base/AppButton.vue';
import AppDialog from '@/components/base/AppDialog.vue';
import AppSelect from '@/components/base/AppSelect.vue';
import ToggleSwitch from '@/components/base/ToggleSwitch.vue';
import StatusBadge from '@/components/base/StatusBadge.vue';
import AppCard from '@/components/base/AppCard.vue';
import teacherListLogic from './teacher-list.js';

export default {
  name: 'TeacherList',
  components: {
    AppHeader,
    DataTable,
    AppButton,
    AppDialog,
    AppSelect,
    ToggleSwitch,
    StatusBadge,
    AppCard
  },
  setup() {
    return {
      ...teacherListLogic.setup()
    };
  }
};
</script>

<style lang="scss" scoped>
@import './teacher.scss';
</style> 