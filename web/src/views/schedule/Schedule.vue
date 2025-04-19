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
            :events="courseEvents"
            @event-click="handleEventClick"
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

    <!-- 暫時隱藏對話框 Temporarily hide dialogs -->
    <!-- 
    <el-dialog
      :visible.sync="courseDialogVisible"
      :title="courseDialogTitle"
      width="500px"
      @close="resetCourseForm"
    >
      <!-- 課程表單 Course form -->
    <!--
      <el-form :model="currentCourse" label-width="80px">
        <el-form-item label="課程名稱">
          <el-input v-model="currentCourse.title" placeholder="請輸入課程名稱"></el-input>
        </el-form-item>
        <el-form-item label="開始時間">
          <el-date-picker
            v-model="currentCourse.start"
            type="datetime"
            placeholder="選擇開始時間"
            format="yyyy-MM-dd HH:mm"
            value-format="yyyy-MM-dd HH:mm"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="結束時間">
          <el-date-picker
            v-model="currentCourse.end"
            type="datetime"
            placeholder="選擇結束時間"
            format="yyyy-MM-dd HH:mm"
            value-format="yyyy-MM-dd HH:mm"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="老師">
          <el-select v-model="currentCourse.teacherId" placeholder="請選擇老師">
            <el-option
              v-for="teacher in teachers"
              :key="teacher.id"
              :label="teacher.name"
              :value="teacher.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="課程類型">
          <el-select v-model="currentCourse.courseTypeId" placeholder="請選擇課程類型">
            <el-option
              v-for="type in courseTypes"
              :key="type.id"
              :label="type.name"
              :value="type.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="地點">
          <el-select v-model="currentCourse.locationId" placeholder="請選擇地點">
            <el-option
              v-for="location in locations"
              :key="location.id"
              :label="location.name"
              :value="location.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="備註">
          <el-input
            type="textarea"
            v-model="currentCourse.description"
            placeholder="請輸入備註"
            :rows="3"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="courseDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCourse">確定</el-button>
      </div>
    </el-dialog>

    <!-- 篩選對話框 Filter dialog -->
    <!--
    <el-dialog
      :visible.sync="filterDialogVisible"
      title="篩選條件"
      width="400px"
    >
      <el-form :model="filters" label-width="80px">
        <el-form-item label="老師">
          <el-select v-model="filters.teacherId" placeholder="請選擇老師" clearable>
            <el-option
              v-for="teacher in teachers"
              :key="teacher.id"
              :label="teacher.name"
              :value="teacher.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="課程類型">
          <el-select v-model="filters.courseTypeId" placeholder="請選擇課程類型" clearable>
            <el-option
              v-for="type in courseTypes"
              :key="type.id"
              :label="type.name"
              :value="type.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="地點">
          <el-select v-model="filters.locationId" placeholder="請選擇地點" clearable>
            <el-option
              v-for="location in locations"
              :key="location.id"
              :label="location.name"
              :value="location.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="日期範圍">
          <el-date-picker
            v-model="filters.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="開始日期"
            end-placeholder="結束日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetFilters">重置</el-button>
        <el-button type="primary" @click="applyFilters">應用</el-button>
      </div>
    </el-dialog>
    -->
  </div>
</template>

<script>
import scheduleComponent from './schedule.js';
export default scheduleComponent;
</script>

<style lang="scss">
@import './schedule.scss';
</style> 