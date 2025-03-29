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
                <span class="year">{{ currentYear }}</span>
                <span class="month">{{ currentMonth }}</span>
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
import { ref, computed, onMounted, defineComponent } from 'vue';
import { format, addDays, addWeeks, addMonths, startOfWeek, startOfMonth } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { useRouter } from 'vue-router';

// 導入日曆視圖組件 Import calendar view components
import DayView from '@/components/calendar/DayView.vue';
import WeekView from '@/components/calendar/WeekView.vue';
import MonthView from '@/components/calendar/MonthView.vue';

// 導入頂部導航欄組件 Import top navigation bar component
import AppHeader from '@/components/layout/AppHeader.vue';
import AddCourseDialog from '@/components/schedule/AddCourseDialog.vue';
import AppButton from '@/components/base/AppButton.vue';

export default defineComponent({
  name: 'SchedulePage',
  
  components: {
    DayView,
    WeekView,
    MonthView,
    AppHeader,
    AddCourseDialog,
    AppButton
  },
  
  setup() {
    // 日期和視圖狀態 Date and view state
    const currentDate = ref(new Date());
    const currentView = ref('month'); // 默認月視圖 Default to month view
    
    // 用戶信息 User information
    const isLoggingOut = ref(false);
    
    // 對話框狀態 Dialog states
    const courseDialogVisible = ref(false);
    const filterDialogVisible = ref(false);
    const isEditMode = ref(false);
    const currentCourse = ref({
      title: '',
      start: new Date(),
      end: new Date(),
      teacherId: null,
      courseTypeId: null,
      locationId: null,
      description: ''
    });
    
    // 篩選條件 Filter conditions
    const filters = ref({
      teacherId: null,
      courseTypeId: null,
      locationId: null,
      dateRange: null
    });
    
    // 課程數據 Course data
    const courseEvents = ref([
      // 示例數據，將在後續通過API獲取 Example data, will be fetched via API later
      {
        id: 1,
        title: '鋼琴課 - 初級',
        start: new Date(2023, 2, 15, 10, 0),
        end: new Date(2023, 2, 15, 11, 0),
        teacherId: 1,
        courseTypeId: 1,
        locationId: 1,
        description: '初級鋼琴課程'
      },
      {
        id: 2,
        title: '小提琴課 - 中級',
        start: new Date(2023, 2, 15, 14, 0),
        end: new Date(2023, 2, 15, 15, 30),
        teacherId: 2,
        courseTypeId: 2,
        locationId: 2,
        description: '中級小提琴課程'
      },
      {
        id: 3,
        title: '繪畫課 - 高級',
        start: new Date(2023, 2, 16, 9, 0),
        end: new Date(2023, 2, 16, 11, 0),
        teacherId: 3,
        courseTypeId: 3,
        locationId: 1,
        description: '高級繪畫課程'
      }
    ]);
    
    // 選項數據 Option data
    const teachers = ref([
      { id: 1, name: '王老師' },
      { id: 2, name: '李老師' },
      { id: 3, name: '張老師' }
    ]);
    
    const courseTypes = ref([
      { id: 1, name: '鋼琴' },
      { id: 2, name: '小提琴' },
      { id: 3, name: '繪畫' }
    ]);
    
    const locations = ref([
      { id: 1, name: '主教室' },
      { id: 2, name: '分教室A' },
      { id: 3, name: '分教室B' }
    ]);
    
    // 視圖選項 View options
    const viewOptions = [
      { label: '日', value: 'day' },
      { label: '週', value: 'week' },
      { label: '月', value: 'month' }
    ];
    
    // 計算屬性 Computed properties
    const formattedCurrentDate = computed(() => {
      if (currentView.value === 'day') {
        return format(currentDate.value, 'yyyy年MM月dd日', { locale: zhTW });
      } else if (currentView.value === 'week') {
        const weekStart = startOfWeek(currentDate.value, { weekStartsOn: 1 });
        const weekEnd = addDays(weekStart, 6);
        return `${format(weekStart, 'yyyy年MM月dd日', { locale: zhTW })} - ${format(weekEnd, 'MM月dd日', { locale: zhTW })}`;
      } else {
        return format(currentDate.value, 'yyyy年MM月', { locale: zhTW });
      }
    });
    
    const courseDialogTitle = computed(() => {
      return isEditMode.value ? '編輯課程' : '新增課程';
    });
    
    const currentCalendarComponent = computed(() => {
      switch (currentView.value) {
        case 'day': return DayView;
        case 'week': return WeekView;
        case 'month': return MonthView;
        default: return WeekView;
      }
    });
    
    // 計算屬性：當前年份 Computed property: current year
    const currentYear = computed(() => {
      return format(currentDate.value, 'yyyy', { locale: zhTW });
    });
    
    // 計算屬性：當前月份 Computed property: current month
    const currentMonth = computed(() => {
      return format(currentDate.value, 'MM', { locale: zhTW });
    });
    
    // 方法 Methods
    const navigatePrevious = () => {
      if (currentView.value === 'day') {
        currentDate.value = addDays(currentDate.value, -1);
      } else if (currentView.value === 'week') {
        currentDate.value = addWeeks(currentDate.value, -1);
      } else {
        currentDate.value = addMonths(currentDate.value, -1);
      }
    };
    
    const navigateNext = () => {
      if (currentView.value === 'day') {
        currentDate.value = addDays(currentDate.value, 1);
      } else if (currentView.value === 'week') {
        currentDate.value = addWeeks(currentDate.value, 1);
      } else {
        currentDate.value = addMonths(currentDate.value, 1);
      }
    };
    
    const goToToday = () => {
      currentDate.value = new Date();
    };
    
    const changeView = (view) => {
      currentView.value = view;
    };
    
    const openAddCourseDialog = () => {
      isEditMode.value = false;
      currentCourse.value = {
        title: '',
        start: new Date(),
        end: new Date(new Date().getTime() + 60 * 60 * 1000), // 默認1小時 Default 1 hour
        teacherId: null,
        courseTypeId: null,
        locationId: null,
        description: ''
      };
      courseDialogVisible.value = true;
    };
    
    const openFilterDialog = () => {
      filterDialogVisible.value = true;
    };
    
    const handleEventClick = (event) => {
      isEditMode.value = true;
      currentCourse.value = { ...event };
      courseDialogVisible.value = true;
    };
    
    const handleDateClick = (date) => {
      isEditMode.value = false;
      currentCourse.value = {
        title: '',
        start: date,
        end: new Date(date.getTime() + 60 * 60 * 1000), // 默認1小時 Default 1 hour
        teacherId: null,
        courseTypeId: null,
        locationId: null,
        description: ''
      };
      courseDialogVisible.value = true;
    };
    
    const saveCourse = () => {
      // 將在後續實現API調用 Will implement API calls in subsequent steps
      if (isEditMode.value) {
        // 更新現有課程 Update existing course
        const index = courseEvents.value.findIndex(e => e.id === currentCourse.value.id);
        if (index !== -1) {
          courseEvents.value[index] = { ...currentCourse.value };
        }
      } else {
        // 添加新課程 Add new course
        const newId = Math.max(0, ...courseEvents.value.map(e => e.id)) + 1;
        courseEvents.value.push({
          ...currentCourse.value,
          id: newId
        });
      }
      
      courseDialogVisible.value = false;
    };
    
    const resetCourseForm = () => {
      currentCourse.value = {
        title: '',
        start: new Date(),
        end: new Date(),
        teacherId: null,
        courseTypeId: null,
        locationId: null,
        description: ''
      };
    };
    
    const resetFilters = () => {
      filters.value = {
        teacherId: null,
        courseTypeId: null,
        locationId: null,
        dateRange: null
      };
    };
    
    const applyFilters = () => {
      // 將在後續實現篩選邏輯 Will implement filtering logic in subsequent steps
      console.log('應用篩選:', filters.value);
      filterDialogVisible.value = false;
      
      // 這裡應該調用API獲取篩選後的數據 Should call API to get filtered data here
    };
    
    // 處理登出 Handle logout
    const router = useRouter();
    const handleLogout = async () => {
      try {
        isLoggingOut.value = true;
        await authAPI.logout();
        router.push('/login');
      } catch (error) {
        console.error('登出失敗 Logout failed:', error);
      } finally {
        isLoggingOut.value = false;
      }
    };
    
    // 新增課程對話框狀態
    const isAddCourseDialogVisible = ref(false);

    // 顯示新增課程對話框 Show add course dialog
    const showAddCourseDialog = () => {
      isAddCourseDialogVisible.value = true;
    };

    // 隱藏新增課程對話框 Hide add course dialog
    const hideAddCourseDialog = () => {
      isAddCourseDialogVisible.value = false;
    };

    // 處理新增課程 Handle add course
    const handleAddCourse = (courseData) => {
      console.log('New course data:', courseData);
      // TODO: 調用 API 保存課程數據 Call API to save course data
    };
    
    // 生命週期鉤子 Lifecycle hooks
    onMounted(() => {
      // 將在後續實現API調用 Will implement API calls in subsequent steps
      console.log('組件已掛載，將加載課程數據');
      
      // 這裡應該調用API獲取初始數據 Should call API to get initial data here
    });
    
    return {
      currentDate,
      currentView,
      viewOptions,
      formattedCurrentDate,
      courseEvents,
      courseDialogVisible,
      courseDialogTitle,
      filterDialogVisible,
      currentCalendarComponent,
      currentCourse,
      filters,
      teachers,
      courseTypes,
      locations,
      navigatePrevious,
      navigateNext,
      goToToday,
      changeView,
      openAddCourseDialog,
      openFilterDialog,
      handleEventClick,
      handleDateClick,
      saveCourse,
      resetCourseForm,
      resetFilters,
      applyFilters,
      isLoggingOut,
      handleLogout,
      currentYear,
      currentMonth,
      isAddCourseDialogVisible,
      showAddCourseDialog,
      hideAddCourseDialog,
      handleAddCourse
    };
  }
});
</script>

<style lang="scss">
@import './schedule.scss';

.calendar-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .toolbar-left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 1rem;

    .add-course-button {
      margin-right: 1rem;
    }
  }

  .date-navigation {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .nav-button {
    padding: 0.5rem;
    border: none;
    background: none;
    cursor: pointer;
    border-radius: 4px;

    &:hover {
      background-color: #f5f5f5;
    }
  }

  .current-date {
    font-size: 1.2rem;
    font-weight: 500;
    
    .year, .month {
      margin: 0 0.25rem;
    }
  }

  .today-button {
    padding: 0.5rem 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: #fff;
    cursor: pointer;

    &:hover {
      background-color: #f5f5f5;
    }
  }

  .view-selector {
    display: flex;
    gap: 0.5rem;
    
    .view-option {
      padding: 0.5rem 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: #fff;
      cursor: pointer;

      &:hover {
        background-color: #f5f5f5;
      }

      &.active {
        background-color: #1890ff;
        color: #fff;
        border-color: #1890ff;
      }
    }
  }
}
</style> 