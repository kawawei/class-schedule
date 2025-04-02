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
import { ref, computed, onMounted, defineComponent } from 'vue';
import { format, addDays, addWeeks, addMonths, startOfWeek, startOfMonth } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { useRouter } from 'vue-router';
import { scheduleAPI, authAPI } from '@/utils/api';
import Message from '@/utils/message';

// 導入日曆視圖組件 Import calendar view components
import DayView from '@/components/calendar/DayView.vue';
import WeekView from '@/components/calendar/WeekView.vue';
import MonthView from '@/components/calendar/MonthView.vue';

// 導入頂部導航欄組件 Import top navigation bar component
import AppHeader from '@/components/layout/AppHeader.vue';
import AddCourseDialog from '@/components/schedule/AddCourseDialog.vue';
import AppButton from '@/components/base/AppButton.vue';
import ScheduleBlock from '@/components/schedule/ScheduleBlock.vue';
import ScheduleDetailDialog from '@/components/schedule/ScheduleDetailDialog.vue';

export default defineComponent({
  name: 'SchedulePage',
  
  components: {
    DayView,
    WeekView,
    MonthView,
    AppHeader,
    AddCourseDialog,
    AppButton,
    ScheduleBlock,
    ScheduleDetailDialog
  },
  
  setup() {
    // 日期和視圖狀態 Date and view state
    const currentDate = ref(new Date());
    const currentView = ref('month'); // 默認月視圖 Default to month view
    const isAddCourseDialogVisible = ref(false);
    const isLoggingOut = ref(false);
    const showScheduleDetailDialog = ref(false);
    const selectedCourseData = ref(null);
    const loading = ref(false); // 添加 loading 狀態 Add loading state
    
    // 課程事件數據 Course events data
    const courseEvents = ref([]);

    // 獲取課程排程數據 Get course schedule data
    const fetchCourseSchedules = async () => {
      try {
        const response = await scheduleAPI.getAllSchedules();
        if (response.success) {
          // 轉換數據格式為前端需要的格式 Convert data format to frontend format
          const formattedEvents = response.data.map(schedule => {
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

            return {
              id: schedule.id,
              courseType: schedule.course_type ? schedule.course_type.toLowerCase() : '', // 添加空值檢查 Add null check
              schoolName: schedule.school_name || '',
              teacherName: schedule.teacher?.name || '', // 修改為使用可選鏈運算符 Use optional chaining
              assistantName: schedule.assistant?.name || '', // 修改為使用可選鏈運算符 Use optional chaining
              startTime: schedule.start_time || '',
              endTime: schedule.end_time || '',
              date: schedule.date || '',
              className: schedule.class_name || '',
              courseFee: schedule.course_fee || 0,
              teacherFee: schedule.teacher_fee || 0,
              assistantFee: schedule.assistant_fee || 0,
              position: { row, column }
            };
          });

          // 按照日期和開始時間排序 Sort by date and start time
          formattedEvents.sort((a, b) => {
            // 先比較日期 Compare dates first
            const dateComparison = new Date(a.date) - new Date(b.date);
            if (dateComparison !== 0) return dateComparison;

            // 如果日期相同，比較開始時間 If dates are same, compare start times
            if (a.startTime && b.startTime) {
              const [aHours, aMinutes] = a.startTime.split(':').map(Number);
              const [bHours, bMinutes] = b.startTime.split(':').map(Number);
              const aTime = aHours * 60 + aMinutes;
              const bTime = bHours * 60 + bMinutes;
              return aTime - bTime;
            }
            return 0;
          });

          // 更新課程事件數據 Update course events data
          courseEvents.value = formattedEvents;
          
          console.log('[Schedule] 課程數據已排序 Course data sorted:', 
            formattedEvents.map(e => ({
              id: e.id,
              date: e.date,
              startTime: e.startTime,
              className: e.className
            }))
          );
        } else {
          Message.error(response.message || '獲取課程排程失敗');
        }
      } catch (error) {
        console.error('獲取課程排程失敗:', error);
        Message.error('獲取課程排程失敗');
      }
    };

    // 組件掛載時獲取課程排程數據 Get course schedule data when component is mounted
    onMounted(async () => {
      await fetchCourseSchedules();
    });

    // 顯示新增課程對話框 Show add course dialog
    const showAddCourseDialog = () => {
      isAddCourseDialogVisible.value = true;
    };

    // 隱藏新增課程對話框 Hide add course dialog
    const hideAddCourseDialog = () => {
      isAddCourseDialogVisible.value = false;
    };

    // 處理新增課程 Handle add course
    const handleAddCourse = async (newEvents) => {
      try {
        // 如果創建成功，直接將新課程添加到列表中
        // If creation successful, directly add new courses to the list
        if (newEvents) {
          // 如果是單個課程，轉換為數組
          // If it's a single course, convert to array
          const eventsArray = Array.isArray(newEvents) ? newEvents : [newEvents];
          
          // 處理每個新課程
          // Process each new course
          eventsArray.forEach(newEvent => {
            // 計算位置 Calculate position
            let row = 1;
            let column = 1;
            
            // 添加空值檢查 Add null check
            if (newEvent.start_time) {
              const [hours, minutes] = newEvent.start_time.split(':').map(Number);
              row = (hours - 8) * 2 + Math.floor(minutes / 30) + 1; // 從8點開始，每30分鐘一格
            }
            
            if (newEvent.date) {
              const date = new Date(newEvent.date);
              const day = date.getDay(); // 0-6 (週日-週六)
              column = day === 0 ? 7 : day; // 將週日(0)轉換為7，其他日期保持不變
            }

            courseEvents.value.push({
              id: newEvent.id,
              courseType: newEvent.course_type ? newEvent.course_type.toLowerCase() : '', // 添加空值檢查 Add null check
              schoolName: newEvent.school_name || '',
              teacherName: newEvent.teacher?.name || '', // 修改為使用可選鏈運算符 Use optional chaining
              assistantName: newEvent.assistant?.name || '', // 修改為使用可選鏈運算符 Use optional chaining
              startTime: newEvent.start_time || '',
              endTime: newEvent.end_time || '',
              date: newEvent.date || '',
              className: newEvent.class_name || '',
              courseFee: newEvent.course_fee || 0,
              teacherFee: newEvent.teacher_fee || 0,
              assistantFee: newEvent.assistant_fee || 0,
              position: { row, column }
            });
          });
          
          Message.success('課程排程創建成功');
        }
        hideAddCourseDialog();
      } catch (error) {
        console.error('創建課程排程失敗:', error);
        Message.error('創建課程排程失敗');
      }
    };

    // 處理課程點擊事件 Handle course click
    const handleEventClick = async (event) => {
      console.log('課程點擊事件 Course click event:', event);
      try {
        // 獲取完整的課程詳情 Get complete course details
        const response = await scheduleAPI.getSchedule(event.id);
        console.log('獲取到的課程詳情 Course details received:', response);
        
        if (response.success) {
          // 檢查是否為重複性課程 Check if it's a recurring course
          const isRecurring = response.data.series_id != null;
          console.log('是否為重複性課程 Is recurring course:', isRecurring);
          
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
          console.log('處理後的課程數據 Processed course data:', selectedCourseData.value);
          showScheduleDetailDialog.value = true;
        } else {
          Message.error('獲取課程詳情失敗 Failed to get course details');
        }
      } catch (error) {
        console.error('獲取課程詳情失敗 Failed to get course details:', error);
        Message.error('獲取課程詳情失敗 Failed to get course details');
      }
    };

    // 處理日期點擊 Handle date click
    const handleDateClick = (date) => {
      console.log('Clicked date:', date);
    };
    
    // 視圖選項 View options
    const viewOptions = [
      { label: '日', value: 'day' },
      { label: '週', value: 'week' },
      { label: '月', value: 'month' }
    ];
    
    // 計算屬性：當前年份 Computed property: current year
    const currentYear = computed(() => {
      return format(currentDate.value, 'yyyy', { locale: zhTW });
    });
    
    // 計算屬性：當前月份 Computed property: current month
    const currentMonth = computed(() => {
      return format(currentDate.value, 'MM', { locale: zhTW });
    });
    
    // 計算屬性：當前日曆組件 Computed property: current calendar component
    const currentCalendarComponent = computed(() => {
      switch (currentView.value) {
        case 'day': return DayView;
        case 'week': return WeekView;
        case 'month': return MonthView;
        default: return MonthView;
      }
    });

    // 導航到上一個時間段 Navigate to previous period
    const navigatePrevious = () => {
      if (currentView.value === 'day') {
        currentDate.value = addDays(currentDate.value, -1);
      } else if (currentView.value === 'week') {
        currentDate.value = addWeeks(currentDate.value, -1);
      } else {
        currentDate.value = addMonths(currentDate.value, -1);
      }
    };
    
    // 導航到下一個時間段 Navigate to next period
    const navigateNext = () => {
      if (currentView.value === 'day') {
        currentDate.value = addDays(currentDate.value, 1);
      } else if (currentView.value === 'week') {
        currentDate.value = addWeeks(currentDate.value, 1);
      } else {
        currentDate.value = addMonths(currentDate.value, 1);
      }
    };
    
    // 跳轉到今天 Go to today
    const goToToday = () => {
      currentDate.value = new Date();
    };
    
    // 切換視圖 Change view
    const changeView = (view) => {
      currentView.value = view;
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
    
    // 隱藏課程詳情對話框
    const hideScheduleDetailDialog = () => {
      showScheduleDetailDialog.value = false;
      selectedCourseData.value = null;
    };

    // 處理課程更新 Handle course update
    const handleCourseUpdate = async (updatedData) => {
      try {
        const response = await scheduleAPI.updateSchedule(selectedCourseData.value.id, updatedData);
        if (response.success) {
          // 重新獲取課程數據 Refetch course data
          await fetchCourseSchedules();
          showScheduleDetailDialog.value = false;
        } else {
          console.error('更新課程失敗 Failed to update course:', response.message);
        }
      } catch (error) {
        console.error('更新課程出錯 Error updating course:', error);
      }
    };

    // 處理課程刪除 Handle course deletion
    const handleCourseDelete = async (deleteInfo) => {
      console.log('[Schedule] 開始處理課程刪除 Starting course deletion:', deleteInfo);
      console.log('[Schedule] 當前課程數據 Current course data:', courseEvents.value);
      
      try {
        console.log('[Schedule] 發送刪除請求到後端 Sending delete request to backend');
        const response = await scheduleAPI.deleteSchedule({
          id: deleteInfo.id,
          type: deleteInfo.type,
          series_id: deleteInfo.series_id
        });
        
        console.log('[Schedule] 收到後端響應 Received backend response:', response);
        
        if (response.success) {
          console.log('[Schedule] 刪除成功，開始重新獲取課程數據 Deletion successful, starting data refetch');
          // 先清空現有數據 Clear existing data first
          courseEvents.value = [];
          // 重新獲取數據 Refetch data
          await fetchCourseSchedules();
          console.log('[Schedule] 數據重新獲取完成 Data refetch completed, new data:', courseEvents.value);
          Message.success(
            deleteInfo.type === 'series' 
              ? '重複性課程已全部刪除 / All recurring courses deleted successfully'
              : '課程已成功刪除 / Course deleted successfully'
          );
          showScheduleDetailDialog.value = false;
        } else {
          console.error('[Schedule] 刪除失敗 Deletion failed:', response.message);
          Message.error(response.message || '刪除課程失敗 / Failed to delete course');
        }
      } catch (error) {
        console.error('[Schedule] 刪除出錯 Error deleting course:', error);
        Message.error('刪除課程失敗 / Failed to delete course');
      }
    };

    // 處理課程移動 Handle course move
    const handleCourseMove = async (moveData) => {
      try {
        // 顯示載入中 Show loading
        loading.value = true;
        
        // 調用後端 API 更新課程日期 Call backend API to update course date
        const response = await scheduleAPI.updateSchedule(moveData.courseId, {
          date: moveData.targetDate,
          isCopy: moveData.isCopy
        });
        
        if (response.success) {
          // 更新成功後重新獲取課程列表 Refresh course list after successful update
          await fetchCourseSchedules();
          Message.success('課程移動成功 Course moved successfully');
        } else {
          Message.error(response.message || '移動課程失敗 Failed to move course');
        }
      } catch (error) {
        console.error('移動課程失敗 Failed to move course:', error);
        Message.error('移動課程失敗 Failed to move course');
      } finally {
        loading.value = false;
      }
    };
    
    return {
      currentDate,
      currentView,
      isAddCourseDialogVisible,
      isLoggingOut,
      courseEvents,
      viewOptions,
      currentYear,
      currentMonth,
      currentCalendarComponent,
      showAddCourseDialog,
      hideAddCourseDialog,
      handleAddCourse,
      handleEventClick,
      handleDateClick,
      navigatePrevious,
      navigateNext,
      goToToday,
      changeView,
      handleLogout,
      fetchCourseSchedules,
      showScheduleDetailDialog,
      selectedCourseData,
      hideScheduleDetailDialog,
      handleCourseUpdate,
      handleCourseDelete,
      handleCourseMove,
      loading
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
  position: relative;
}

.schedule-content {
  position: relative;
}

.calendar-container {
  position: relative;
}
</style> 