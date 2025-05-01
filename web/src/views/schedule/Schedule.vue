<template>
  <div class="schedule-page">
    <!-- 添加頂部導航欄 Add top navigation bar -->
    <AppHeader 
      title="排課管理" 
      :isLoggingOut="isLoggingOut"
      @logout="handleLogout"
    />
    
    <div class="container">
      <div class="schedule-content">
        <!-- 日曆工具欄 Calendar toolbar -->
        <div class="calendar-toolbar">
          <div class="toolbar-left">
            <div class="date-navigation">
              <button class="nav-button" @click="navigatePrevious">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>
              <div class="current-date">
                <template v-if="currentView === 'day'">
                  <span class="year">{{ currentYear }}</span>
                  <span class="day-date">{{ currentDayDate }}</span>
                </template>
                <template v-else-if="currentView === 'week'">
                  <span class="year">{{ currentYear }}</span>
                  <span class="week-range">{{ weekDateRange }}</span>
                </template>
                <template v-else>
                  <span class="year">{{ currentYear }}</span>
                  <span class="month">{{ currentMonth }}</span>
                </template>
              </div>
              <button class="nav-button" @click="navigateNext">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            </div>
            <AppButton
              type="secondary"
              size="sm"
              @click="goToToday"
            >
              今天 / Today
            </AppButton>
            <!-- 添加篩選下拉組件 Add Filter Dropdown -->
            <FilterDropdown
              :filter-categories="filterCategories"
              @filter-change="handleFilterChange"
            />
          </div>
          <div class="toolbar-right">
            <!-- 添加新增課程按鈕 Add course button -->
            <AppButton
              type="primary"
              class="add-course-button"
              @click="showAddCourseDialog"
            >
              新增課程 / Add Course
            </AppButton>
            <div class="view-selector">
              <button 
                v-for="view in viewOptions" 
                :key="view.value"
                class="view-option"
                :class="{ active: currentView === view.value }"
                @click="changeView(view.value)"
              >
                {{ view.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- 日曆容器 Calendar container -->
        <div class="calendar-container" :class="`${currentView}-view`">
          <!-- 根據當前視圖顯示不同的日曆組件 Show different calendar components based on current view -->
          <component 
            :is="currentCalendarComponent" 
            :current-date="currentDate"
            :events="filteredCourseEvents"
            :is-teacher="isTeacher"
            @event-click="handleEventClick"
            @event-dblclick="handleEventDoubleClick"
            @date-click="handleDateClick"
            @course-move="handleCourseMove"
          ></component>
        </div>
      </div>
    </div>

    <!-- 新增課程對話框 Add course dialog -->
    <AddCourseDialog
      v-model:visible="isAddCourseDialogVisible"
      @close="hideAddCourseDialog"
      @submit="handleAddCourse"
    />

    <!-- 課程詳情對話框 Course detail dialog -->
    <ScheduleDetailDialog
      v-model:visible="showScheduleDetailDialog"
      :schedule-data="selectedCourseData"
      @close="hideScheduleDetailDialog"
      @save="handleCourseUpdate"
      @delete="handleCourseDelete"
    />
  </div>
</template>

<script>
import scheduleComponent from './schedule.js';
export default scheduleComponent;
</script>

<style lang="scss">
@import './schedule.scss';
</style> 