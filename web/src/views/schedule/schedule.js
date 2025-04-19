import { ref, computed, onMounted, defineComponent } from 'vue';
import { format, addDays, addWeeks, addMonths, startOfWeek, startOfMonth, endOfWeek } from 'date-fns';
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
import FilterDropdown from '@/components/base/FilterDropdown.vue';

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
    ScheduleDetailDialog,
    FilterDropdown
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

    // 篩選類別配置 Filter categories configuration
    const filterCategories = ref([
      {
        key: 'school',
        label: '補習班 / School',
        options: []
      },
      {
        key: 'district',
        label: '區域 / District',
        options: []
      },
      {
        key: 'courseType',
        label: '課程種類 / Course Type',
        options: []
      },
      {
        key: 'teacher',
        label: '老師 / Teacher',
        options: []
      }
    ]);

    // 當前選中的篩選值 Currently selected filter values
    const selectedFilters = ref({
      school: [],
      district: [],
      courseType: [],
      teacher: []
    });

    // 處理篩選變更 Handle filter changes
    const handleFilterChange = async (filters) => {
      // 如果沒有傳入 filters 或是空對象，重置所有篩選條件
      // If no filters or empty object, reset all filter conditions
      if (!filters || Object.keys(filters).length === 0) {
        selectedFilters.value = {
          school: [],
          district: [],
          courseType: [],
          teacher: []
        };
      } else {
        // 更新所有篩選值 Update all filter values
        Object.keys(filters).forEach(key => {
          selectedFilters.value[key] = filters[key].map(item => item.value);
        });
      }
      
      console.log('篩選條件已更新 Filter conditions updated:', selectedFilters.value);
      // 重新獲取符合篩選條件的課程 Refetch courses with filter conditions
      await fetchCourseSchedules();
    };

    // 格式化課程排程數據 Format course schedule data
    const formatScheduleEvents = (schedules) => {
      if (!Array.isArray(schedules)) {
        console.error('無效的課程數據格式 Invalid course data format:', schedules);
        return [];
      }

      return schedules.map(schedule => {
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
          district: schedule.district || '',
          county: schedule.county || '',
          hourlyRate: schedule.hourly_rate || 0,
          notes: schedule.notes || '',
          uuid: schedule.series_id || '',
          position: { row, column }
        };
      });
    };

    // 獲取課程排程數據 Get course schedule data
    const fetchCourseSchedules = async () => {
      try {
        loading.value = true;
        
        // 構建查詢參數，包含篩選條件
        // Build query parameters including filter conditions
        const queryParams = buildFilterParams(selectedFilters.value);
        console.log('查詢參數 Query parameters:', queryParams);

        const response = await scheduleAPI.getAllSchedules(queryParams);
        
        if (response.success) {
          // 如果沒有任何篩選條件，直接顯示所有數據
          // If no filters are selected, show all data
          if (!hasActiveFilters(selectedFilters.value)) {
            courseEvents.value = formatScheduleEvents(response.data);
            return;
          }

          // 根據篩選條件過濾課程數據
          // Filter course data based on filter conditions
          let filteredData = response.data;
          
          // 如果有選擇篩選條件，進行過濾
          // Apply filters if conditions are selected
          if (selectedFilters.value.school?.length) {
            filteredData = filteredData.filter(schedule => 
              selectedFilters.value.school.includes(schedule.school_name)
            );
          }
          
          if (selectedFilters.value.district?.length) {
            filteredData = filteredData.filter(schedule => 
              selectedFilters.value.district.includes(schedule.district)
            );
          }
          
          if (selectedFilters.value.courseType?.length) {
            filteredData = filteredData.filter(schedule => 
              selectedFilters.value.courseType.includes(schedule.course_type)
            );
          }
          
          if (selectedFilters.value.teacher?.length) {
            filteredData = filteredData.filter(schedule => {
              // 處理待定老師的情況 Handle pending teacher case
              if (selectedFilters.value.teacher.includes('pending')) {
                return !schedule.teacher_id;
              }
              return selectedFilters.value.teacher.includes(schedule.teacher_id);
            });
          }

          courseEvents.value = formatScheduleEvents(filteredData);
          console.log('過濾後的課程數據 Filtered course data:', courseEvents.value);
        }
      } catch (error) {
        console.error('獲取課程失敗:', error);
        Message.error('獲取課程失敗 Failed to get courses');
      } finally {
        loading.value = false;
      }
    };

    // 檢查是否有任何活動的篩選條件
    // Check if there are any active filters
    const hasActiveFilters = (filters) => {
      return Object.values(filters).some(filterValues => filterValues.length > 0);
    };

    // 構建篩選參數 Build filter parameters
    const buildFilterParams = (filters) => {
      const params = {
        date: format(currentDate.value, 'yyyy-MM-dd'),
        view: currentView.value
      };
      
      // 只有當有選擇篩選條件時才添加到參數中
      // Only add to parameters when filters are selected
      if (filters.school?.length) {
        params.schools = filters.school;
      }
      if (filters.district?.length) {
        params.districts = filters.district;
      }
      if (filters.courseType?.length) {
        params.courseTypes = filters.courseType;
      }
      if (filters.teacher?.length) {
        params.teachers = filters.teacher;
      }
      
      return params;
    };

    // 獲取篩選選項數據 Get filter options data
    const fetchFilterOptions = async () => {
      try {
        // 獲取所有課程排程以提取補習班、區域和課程類型信息
        // Get all schedules to extract school, district and course type info
        const schedulesResponse = await scheduleAPI.getAllSchedules();
        if (schedulesResponse.success) {
          // 提取唯一的補習班、區域和課程類型
          // Extract unique schools, districts and course types
          const schools = new Set();
          const districts = new Set();
          const courseTypes = new Set();
          
          schedulesResponse.data.forEach(schedule => {
            if (schedule.school_name) schools.add(schedule.school_name);
            if (schedule.district) districts.add(schedule.district);
            if (schedule.course_type) courseTypes.add(schedule.course_type);
          });

          // 更新補習班選項 Update school options
          filterCategories.value[0].options = Array.from(schools).map(school => ({
            value: school,
            label: school
          }));

          // 更新區域選項 Update district options
          filterCategories.value[1].options = Array.from(districts).map(district => ({
            value: district,
            label: district
          }));

          // 更新課程類型選項 Update course type options
          filterCategories.value[2].options = Array.from(courseTypes).map(type => ({
            value: type,
            label: type
          }));

          // 如果沒有獲取到課程類型，輸出日誌 Log if no course types received
          if (courseTypes.size === 0) {
            console.warn('未獲取到課程類型數據 No course types data received');
          }
        }

        // 獲取老師列表 Get teachers list
        const teachersResponse = await scheduleAPI.getTeachers();
        if (teachersResponse.success) {
          // 添加待定選項和實際老師列表 Add pending option and actual teacher list
          filterCategories.value[3].options = [
            { value: 'pending', label: '待定 / Pending' },
            ...teachersResponse.data.map(teacher => ({
              value: teacher.id,
              label: teacher.name
            }))
          ];
        }
      } catch (error) {
        console.error('獲取篩選選項失敗:', error);
        Message.error('獲取篩選選項失敗 Failed to get filter options');
      }
    };

    // 組件掛載時獲取課程排程數據 Get course schedule data when component is mounted
    onMounted(async () => {
      await fetchFilterOptions();
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
              district: newEvent.district || '', // 添加區域資訊 Add district info
              county: newEvent.county || '', // 添加縣市資訊 Add county info
              hourlyRate: newEvent.hourly_rate || 0, // 添加鐘點費 Add hourly rate
              notes: newEvent.notes || '', // 添加備註 Add notes
              uuid: newEvent.series_id || '', // 添加系列ID Add series ID
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
          const courseData = response.data;
          console.log('後端返回的原始數據 Backend raw data:', courseData);
          
          // 檢查是否為重複性課程 Check if it's a recurring course
          const isRecurring = courseData.series_id != null;
          console.log('是否為重複性課程 Is recurring course:', isRecurring);
          
          selectedCourseData.value = {
            id: courseData.id,
            courseType: courseData.course_type,
            schoolName: courseData.school_name,
            className: courseData.class_name,
            teacherId: courseData.teacher_id,
            teacherName: courseData.teacher?.name || '',
            assistantName: courseData.assistants?.[0]?.assistant_id,
            startTime: courseData.start_time,
            endTime: courseData.end_time,
            date: courseData.date,
            courseFee: courseData.course_fee,
            teacherFee: courseData.teacher_fee,
            assistantFee: courseData.assistants?.[0]?.fee || 0,
            county: courseData.county || '',
            district: courseData.district || '',
            notes: courseData.notes || '',  // 確保包含備註字段
            teacher: courseData.teacher,
            assistants: courseData.assistants || [],
            series_id: courseData.series_id
          };
          
          console.log('處理後的課程數據:', {
            schoolName: selectedCourseData.value.schoolName,
            className: selectedCourseData.value.className,
            county: selectedCourseData.value.county,
            district: selectedCourseData.value.district,
            notes: selectedCourseData.value.notes
          });
          
          showScheduleDetailDialog.value = true;
        } else {
          Message.error('獲取課程詳情失敗 Failed to get course details');
        }
      } catch (error) {
        console.error('獲取課程詳情失敗:', error);
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
    
    // 計算屬性：週日期範圍 Computed property: week date range
    const weekDateRange = computed(() => {
      const weekStart = startOfWeek(currentDate.value, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(currentDate.value, { weekStartsOn: 1 });
      
      // 統一使用數字格式 Use numeric format consistently
      return `${format(weekStart, 'MM/dd')}-${format(weekEnd, 'MM/dd')}`;
    });
    
    // 計算屬性：當前月份 Computed property: current month
    const currentMonth = computed(() => {
      return format(currentDate.value, 'MM月', { locale: zhTW });
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
    const navigatePrevious = async () => {
      if (currentView.value === 'day') {
        currentDate.value = addDays(currentDate.value, -1);
      } else if (currentView.value === 'week') {
        currentDate.value = addWeeks(currentDate.value, -1);
      } else {
        currentDate.value = addMonths(currentDate.value, -1);
      }
      // 重新獲取課程數據 Refresh course data
      await fetchCourseSchedules();
    };
    
    // 導航到下一個時間段 Navigate to next period
    const navigateNext = async () => {
      if (currentView.value === 'day') {
        currentDate.value = addDays(currentDate.value, 1);
      } else if (currentView.value === 'week') {
        currentDate.value = addWeeks(currentDate.value, 1);
      } else {
        currentDate.value = addMonths(currentDate.value, 1);
      }
      // 重新獲取課程數據 Refresh course data
      await fetchCourseSchedules();
    };
    
    // 跳轉到今天 Go to today
    const goToToday = async () => {
      currentDate.value = new Date();
      // 重新獲取課程數據 Refresh course data
      await fetchCourseSchedules();
    };
    
    // 切換視圖 Change view
    const changeView = async (view) => {
      currentView.value = view;
      // 重新獲取課程數據 Refresh course data
      await fetchCourseSchedules();
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
        // 確保有課程ID Ensure we have course ID
        if (!updatedData.id) {
          throw new Error('課程ID不存在 Course ID does not exist');
        }

        console.log('準備更新的課程數據 Course data to update:', updatedData);

        // 從 updatedData 中提取 id，其餘作為更新數據
        // Extract id from updatedData, use the rest as update data
        const { id, ...scheduleData } = updatedData;
        const response = await scheduleAPI.updateSchedule(id, scheduleData);
        
        if (response.success) {
          console.log('後端更新成功，重新獲取所有課程數據 Backend update successful, refetching all course data');
          
          // 重新獲取所有課程數據 Refetch all course data
          await fetchCourseSchedules();
          
          // 重新獲取並更新當前選中課程的詳細信息
          // Refetch and update current selected course details
          const updatedCourseResponse = await scheduleAPI.getSchedule(id);
          if (updatedCourseResponse.success) {
            const courseData = updatedCourseResponse.data;
            selectedCourseData.value = {
              id: courseData.id,
              courseType: courseData.course_type,
              schoolName: courseData.school_name,
              className: courseData.class_name,
              teacherId: courseData.teacher_id,
              teacherName: courseData.teacher?.name || '',
              assistantName: courseData.assistants?.[0]?.assistant_id,
              startTime: courseData.start_time,
              endTime: courseData.end_time,
              date: courseData.date,
              courseFee: courseData.course_fee,
              teacherFee: courseData.teacher_fee,
              assistantFee: courseData.assistants?.[0]?.fee || 0,
              county: courseData.county || '',
              district: courseData.district || '',
              notes: courseData.notes || '',
              teacher: courseData.teacher,
              assistants: courseData.assistants || [],
              series_id: courseData.series_id
            };
          }
          
          Message.success('課程更新成功 Course updated successfully');
        } else {
          console.error('更新課程失敗 Failed to update course:', response.message);
          Message.error(response.message || '更新課程失敗 Failed to update course');
        }
      } catch (error) {
        console.error('更新課程出錯 Error updating course:', error);
        Message.error(error.message || '更新課程失敗 Failed to update course');
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
        const response = await scheduleAPI.updateCourseDate(moveData.courseId, {
          date: moveData.targetDate,
          isCopy: moveData.isCopy
        });
        
        if (response.success) {
          // 更新成功後重新獲取課程列表 Refresh course list after successful update
          await fetchCourseSchedules();
          Message.success(moveData.isCopy ? '課程複製成功' : '課程移動成功');
        } else {
          Message.error(response.message || '操作失敗');
        }
      } catch (error) {
        console.error('課程操作失敗:', error);
        Message.error('操作失敗');
      } finally {
        loading.value = false;
      }
    };
    
    // 計算屬性：當前日期格式化 Computed property: current day date formatted
    const currentDayDate = computed(() => {
      return format(currentDate.value, 'MM/dd', { locale: zhTW });
    });

    return {
      currentDate,
      currentView,
      isAddCourseDialogVisible,
      isLoggingOut,
      courseEvents,
      viewOptions,
      currentYear,
      currentMonth,
      weekDateRange,
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
      loading,
      currentDayDate,
      filterCategories,
      handleFilterChange
    };
  }
}); 