<template>
  <div class="schedule-page">
    <!-- 添加頂部導航欄 Add top navigation bar -->
    <AppHeader 
      title="我的課程表" 
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
          </div>
          <div class="toolbar-right">
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
            :is-teacher="true"
            @event-click="handleEventClick"
            @date-click="handleDateClick"
            @course-move="handleCourseMove"
          ></component>
        </div>
      </div>
    </div>

    <!-- 課程詳情對話框 Course detail dialog -->
    <ScheduleDetailDialog
      v-model:visible="showScheduleDetailDialog"
      :schedule-data="selectedCourseData"
      @close="hideScheduleDetailDialog"
      @save="handleCourseUpdate"
      @delete="handleCourseDelete"
    />

    <!-- 添加課程提醒組件 Add course reminder component -->
    <CourseReminder />
  </div>
</template>

<script>
import { ref, computed, onMounted, defineComponent } from 'vue';
import { format, addDays, addWeeks, addMonths, startOfWeek, startOfMonth, endOfWeek } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { useRouter } from 'vue-router';
import { scheduleAPI, authAPI } from '@/utils/api';
import Message from '@/utils/message';
import courseDataService from '@/services/courseDataService'; // 引入課程數據服務 Import course data service

// 導入日曆視圖組件 Import calendar view components
import DayView from '@/components/calendar/DayView.vue';
import WeekView from '@/components/calendar/WeekView.vue';
import MonthView from '@/components/calendar/MonthView.vue';

// 導入頂部導航欄組件 Import top navigation bar component
import AppHeader from '@/components/layout/AppHeader.vue';
import AppButton from '@/components/base/AppButton.vue';
import ScheduleBlock from '@/components/schedule/ScheduleBlock.vue';
import ScheduleDetailDialog from '@/components/schedule/ScheduleDetailDialog.vue';
import CourseReminder from '@/components/teacher/CourseReminder.vue'

export default defineComponent({
  name: 'TeacherSchedule',
  
  components: {
    DayView,
    WeekView,
    MonthView,
    AppHeader,
    AppButton,
    ScheduleBlock,
    ScheduleDetailDialog,
    CourseReminder
  },
  
  setup() {
    const router = useRouter();
    const isLoggingOut = ref(false);
    
    // 當前日期 Current date
    const currentDate = ref(new Date());
    
    // 當前視圖 Current view
    const currentView = ref('week');
    
    // 視圖選項 View options
    const viewOptions = [
      { label: '日 / Day', value: 'day' },
      { label: '週 / Week', value: 'week' },
      { label: '月 / Month', value: 'month' }
    ];
    
    // 課程事件 Course events
    const courseEvents = ref([]);
    
    // 當前老師ID Current teacher ID
    const currentTeacherId = ref(null);
    
    // 課程詳情對話框狀態 Course detail dialog state
    const showScheduleDetailDialog = ref(false);
    const selectedCourseData = ref(null);
    
    // 計算屬性 Computed properties
    
    // 當前日曆組件 Current calendar component
    const currentCalendarComponent = computed(() => {
      switch (currentView.value) {
        case 'day':
          return DayView;
        case 'week':
          return WeekView;
        case 'month':
          return MonthView;
        default:
          return WeekView;
      }
    });
    
    // 過濾後的課程事件 Filtered course events
    const filteredCourseEvents = computed(() => {
      if (!currentTeacherId.value) return [];
      return courseEvents.value.filter(event => event.teacher_id === currentTeacherId.value);
    });
    
    // 當前年份 Current year
    const currentYear = computed(() => {
      return format(currentDate.value, 'yyyy');
    });
    
    // 當前月份 Current month
    const currentMonth = computed(() => {
      return format(currentDate.value, 'MMMM', { locale: zhTW });
    });
    
    // 當前日期 Current day date
    const currentDayDate = computed(() => {
      return format(currentDate.value, 'MMMM d日', { locale: zhTW });
    });
    
    // 週日期範圍 Week date range
    const weekDateRange = computed(() => {
      const start = startOfWeek(currentDate.value, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate.value, { weekStartsOn: 1 });
      return `${format(start, 'M月d日', { locale: zhTW })} - ${format(end, 'M月d日', { locale: zhTW })}`;
    });
    
    // 方法 Methods
    
    // 獲取當前老師信息 Get current teacher info
    const fetchCurrentTeacher = async () => {
      try {
        // 嘗試從 localStorage 獲取用戶數據
        // Try to get user data from localStorage
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          console.error('未找到用戶數據');
          Message.error('無法獲取老師信息 Unable to get teacher information');
          return;
        }

        const userData = JSON.parse(userStr);
        console.log('用戶數據:', userData);

        // 根據用戶角色決定 currentTeacherId 的來源
        // Set currentTeacherId based on user role
        if (userData) {
          if (userData.role === 'teacher' && userData.teacherId) {
            // 老師登入：使用 teacherId 查詢課程
            // If teacher login, use teacherId to query courses
            currentTeacherId.value = userData.teacherId;
            console.log('設置當前老師ID為 teacherId:', currentTeacherId.value);
          } else if (userData.id) {
            // 其他用戶（如管理員）：使用 user.id 查詢課程
            // Other users (e.g., admin): use user.id to query courses
          currentTeacherId.value = userData.id;
            console.log('設置當前老師ID為 user.id:', currentTeacherId.value);
        } else {
            // 無法獲取ID時的錯誤處理
            // Error handling if no ID found
            console.error('用戶數據中沒有可用的ID');
          Message.error('無法獲取老師信息 Unable to get teacher information');
          }
        }
      } catch (error) {
        console.error('獲取老師信息失敗:', error);
        Message.error('無法獲取老師信息 Unable to get teacher information');
      }
    };
    
    // 獲取課程列表 Get course list
    const fetchCourses = async () => {
      try {
        if (!currentTeacherId.value) {
          console.error('未設置老師ID');
          Message.error('無法獲取老師信息 Unable to get teacher information');
          return;
        }

        console.log('開始獲取課程，老師ID:', currentTeacherId.value);
        
        // 獲取課程列表，只獲取當前老師的課程
        // Get course list, only get current teacher's courses
        const response = await scheduleAPI.getAllSchedules();
        console.log('獲取到的課程數據:', response);

        if (response.success) {
          // 過濾出當前老師的課程 Filter out current teacher's courses
          const teacherCourses = response.data.filter(schedule => 
            schedule.teacher_id === currentTeacherId.value
          );
          
          console.log('過濾後的老師課程:', teacherCourses);

          // 轉換數據格式為前端需要的格式 Convert data format to frontend format
          courseEvents.value = teacherCourses.map(schedule => {
            // 計算位置 Calculate position
            let row = 1;
            let column = 1;
            
            // 添加空值檢查 Add null check
            if (schedule.start_time) {
              const [hours, minutes] = schedule.start_time.split(':').map(Number);
              row = (hours - 8) * 2 + Math.floor(minutes / 30) + 1; // 從8點開始，每30分鐘一格
            }
            
            if (schedule.date) {
              const date = new Date(schedule.date);
              const day = date.getDay(); // 0-6 (週日-週六)
              column = day === 0 ? 7 : day; // 將週日(0)轉換為7，其他日期保持不變
            }

            // 新增 uuid 欄位，對應 series_id，確保系列課程聚合
            // Add uuid field, mapped from series_id, to ensure series aggregation
            return {
              id: schedule.id,
              teacher_id: schedule.teacher_id, // 添加 teacher_id
              courseType: schedule.course_type ? schedule.course_type.toLowerCase() : '',
              schoolName: schedule.school_name || '',
              teacherName: schedule.teacher?.name || '',
              assistantName: schedule.assistant?.name || '',
              startTime: schedule.start_time || '',
              endTime: schedule.end_time || '',
              date: schedule.date || '',
              className: schedule.class_name || '',
              courseFee: schedule.course_fee || 0,
              teacherFee: schedule.teacher_fee || 0,
              assistantFee: schedule.assistant_fee || 0,
              position: { row, column },
              uuid: schedule.series_id || String(schedule.id) // 新增 uuid 欄位 Add uuid field
            };
          });

          // 設置課程數據到全域服務 Set course data to global service
          courseDataService.setCourses(courseEvents.value);

          console.log('轉換後的課程數據:', courseEvents.value);
        } else {
          Message.error(response.message || '獲取課程列表失敗 Failed to get course list');
        }
      } catch (error) {
        console.error('獲取課程列表失敗:', error);
        Message.error('獲取課程列表失敗 Failed to get course list');
      }
    };
    
    // 處理登出 Handle logout
    const handleLogout = async () => {
      try {
        isLoggingOut.value = true;
        await authAPI.logout();
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        router.push('/login');
      } catch (error) {
        console.error('登出失敗:', error);
        Message.error('登出失敗');
      } finally {
        isLoggingOut.value = false;
      }
    };
    
    // 切換視圖 Change view
    const changeView = (view) => {
      currentView.value = view;
    };
    
    // 導航到上一個時間段 Navigate to previous time period
    const navigatePrevious = () => {
      switch (currentView.value) {
        case 'day':
          currentDate.value = addDays(currentDate.value, -1);
          break;
        case 'week':
          currentDate.value = addWeeks(currentDate.value, -1);
          break;
        case 'month':
          currentDate.value = addMonths(currentDate.value, -1);
          break;
      }
    };
    
    // 導航到下一個時間段 Navigate to next time period
    const navigateNext = () => {
      switch (currentView.value) {
        case 'day':
          currentDate.value = addDays(currentDate.value, 1);
          break;
        case 'week':
          currentDate.value = addWeeks(currentDate.value, 1);
          break;
        case 'month':
          currentDate.value = addMonths(currentDate.value, 1);
          break;
      }
    };
    
    // 跳轉到今天 Go to today
    const goToToday = () => {
      currentDate.value = new Date();
    };
    
    // 處理課程點擊 Handle course click
    const handleEventClick = async (event) => {
      try {
        const response = await scheduleAPI.getSchedule(event.id);
        if (response.success) {
          selectedCourseData.value = {
            id: response.data.id,
            courseType: response.data.course_type,
            schoolName: response.data.school_name,
            className: response.data.class_name,
            teacherName: response.data.teacher?.name,
            assistantName: response.data.assistants?.[0]?.assistant_id,
            startTime: response.data.start_time,
            endTime: response.data.end_time,
            date: response.data.date,
            courseFee: response.data.course_fee,
            teacherFee: response.data.teacher_fee,
            assistantFee: response.data.assistants?.[0]?.fee || 0,
            teacher: response.data.teacher,
            assistants: response.data.assistants || [],
            series_id: response.data.series_id // 添加 series_id 到課程數據中
          };
          showScheduleDetailDialog.value = true;
        } else {
          Message.error(response.message || '獲取課程詳情失敗');
        }
      } catch (error) {
        console.error('獲取課程詳情失敗:', error);
        Message.error('獲取課程詳情失敗');
      }
    };
    
    // 處理日期點擊 Handle date click
    const handleDateClick = (date) => {
      currentDate.value = date;
    };
    
    // 處理課程移動 Handle course move
    const handleCourseMove = async (event) => {
      try {
        const response = await scheduleAPI.updateCourseDate(event.id, {
          date: event.date,
          isCopy: event.isCopy
        });
        if (response.success) {
          Message.success('課程更新成功');
          await fetchCourses();
        } else {
          Message.error(response.message || '課程更新失敗');
        }
      } catch (error) {
        console.error('課程更新失敗:', error);
        Message.error('課程更新失敗');
      }
    };
    
    // 處理課程更新 Handle course update
    const handleCourseUpdate = async (updatedData) => {
      try {
        const response = await scheduleAPI.updateSchedule(updatedData.id, updatedData);
        if (response.success) {
          Message.success('課程更新成功');
          await fetchCourses();
          showScheduleDetailDialog.value = false;
        } else {
          Message.error(response.message || '課程更新失敗');
        }
      } catch (error) {
        console.error('課程更新失敗:', error);
        Message.error('課程更新失敗');
      }
    };
    
    // 處理課程刪除 Handle course delete
    const handleCourseDelete = async (deleteInfo) => {
      try {
        const response = await scheduleAPI.deleteSchedule(deleteInfo);
        if (response.success) {
          Message.success('課程刪除成功');
          await fetchCourses();
          showScheduleDetailDialog.value = false;
        } else {
          Message.error(response.message || '課程刪除失敗');
        }
      } catch (error) {
        console.error('課程刪除失敗:', error);
        Message.error('課程刪除失敗');
      }
    };
    
    // 隱藏課程詳情對話框 Hide course detail dialog
    const hideScheduleDetailDialog = () => {
      showScheduleDetailDialog.value = false;
    };
    
    // 組件掛載時執行 On component mount
    onMounted(async () => {
      await fetchCurrentTeacher();
      await fetchCourses();
    });
    
    return {
      isLoggingOut,
      currentDate,
      currentView,
      viewOptions,
      courseEvents,
      filteredCourseEvents,
      currentYear,
      currentMonth,
      currentDayDate,
      weekDateRange,
      currentCalendarComponent,
      showScheduleDetailDialog,
      selectedCourseData,
      handleLogout,
      changeView,
      navigatePrevious,
      navigateNext,
      goToToday,
      handleEventClick,
      handleDateClick,
      handleCourseMove,
      handleCourseUpdate,
      handleCourseDelete,
      hideScheduleDetailDialog
    };
  }
});
</script>

<style lang="scss" scoped>
@import '@/views/schedule/schedule.scss';
</style> 