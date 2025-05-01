import { ref, reactive, nextTick, onMounted, watch } from 'vue';
import { format, parseISO, getDay } from 'date-fns';
import { teacherAPI, courseAPI, scheduleAPI } from '@/utils/api';
import Message from '@/utils/message';

// 組件名稱 Component name
export const name = 'AddCourseDialog';

// 組件屬性 Component props
export const props = {
  visible: {
    type: Boolean,
    required: true
  }
};

// 組件事件 Component emits
export const emits = ['update:visible', 'close', 'submit'];

// 組件設置 Component setup
export const setup = (props, { emit }) => {
  // 加載狀態 Loading state
  const loading = ref(false);
  
  // 星期幾選項 Weekday options
  const weekDays = [
    { label: '週一 / Mon', value: 1 },
    { label: '週二 / Tue', value: 2 },
    { label: '週三 / Wed', value: 3 },
    { label: '週四 / Thu', value: 4 },
    { label: '週五 / Fri', value: 5 },
    { label: '週六 / Sat', value: 6 },
    { label: '週日 / Sun', value: 7 }
  ];

  // 縣市選項 County options
  const countyOptions = [
    { value: '台北市', label: '台北市' },
    { value: '新北市', label: '新北市' }
  ];
  
  // 區域選項 District options
  const districtOptions = ref([]);
  
  // 縣市區域映射 County-district mapping
  const countyDistrictMap = {
    '台北市': [
      { value: '北投區', label: '北投區' },
      { value: '士林區', label: '士林區' },
      { value: '大同區', label: '大同區' },
      { value: '中山區', label: '中山區' },
      { value: '松山區', label: '松山區' },
      { value: '內湖區', label: '內湖區' },
      { value: '萬華區', label: '萬華區' },
      { value: '中正區', label: '中正區' },
      { value: '大安區', label: '大安區' },
      { value: '信義區', label: '信義區' },
      { value: '南港區', label: '南港區' },
      { value: '文山區', label: '文山區' }
    ],
    '新北市': [
      { value: '板橋區', label: '板橋區' },
      { value: '三重區', label: '三重區' },
      { value: '中和區', label: '中和區' },
      { value: '永和區', label: '永和區' },
      { value: '新莊區', label: '新莊區' },
      { value: '新店區', label: '新店區' },
      { value: '土城區', label: '土城區' },
      { value: '蘆洲區', label: '蘆洲區' },
      { value: '樹林區', label: '樹林區' },
      { value: '汐止區', label: '汐止區' },
      { value: '鶯歌區', label: '鶯歌區' },
      { value: '三峽區', label: '三峽區' },
      { value: '淡水區', label: '淡水區' },
      { value: '瑞芳區', label: '瑞芳區' },
      { value: '五股區', label: '五股區' },
      { value: '泰山區', label: '泰山區' },
      { value: '林口區', label: '林口區' },
      { value: '深坑區', label: '深坑區' },
      { value: '石碇區', label: '石碇區' },
      { value: '坪林區', label: '坪林區' },
      { value: '三芝區', label: '三芝區' },
      { value: '石門區', label: '石門區' },
      { value: '八里區', label: '八里區' },
      { value: '平溪區', label: '平溪區' },
      { value: '雙溪區', label: '雙溪區' },
      { value: '貢寮區', label: '貢寮區' },
      { value: '金山區', label: '金山區' },
      { value: '萬里區', label: '萬里區' },
      { value: '烏來區', label: '烏來區' }
    ]
  };
  
  // 表單數據 Form data
  const formData = reactive({
    schoolName: '',
    className: '',
    courseType: '',
    county: '',
    district: '',
    date: '',
    endDate: '',
    startTime: '',
    endTime: '',
    teacherId: '',
    courseFee: '0',  // 預設為 0 Default to 0
    teacherFee: '0',  // 預設為 0 Default to 0
    notes: '',  // 新增備註欄位 Add notes field
    assistants: [],
    recurringDays: Array(7).fill(false),
    scheduleMode: 'single', // 新增：排課模式 (single/recurring/custom) New: Schedule mode
    selectedDates: [], // 新增：自選日期列表 New: Custom dates list
    seriesId: '' // 新增：自選日期課程共用的 seriesId // New: Shared seriesId for custom date courses
  });

  // 新增：排課模式選項 New: Schedule mode options
  const scheduleModes = [
    { label: '單堂課程 / Single', value: 'single' },
    { label: '重複性課程 / Recurring', value: 'recurring' },
    { label: '自選日期課程 / Custom Dates', value: 'custom' }
  ];

  // 處理多日期選擇，確保 selectedDates 為 Date 物件陣列 Handle multi-date selection, ensure Date object array
  const handleDateSelect = (dates) => {
    formData.selectedDates = dates;
  };

  // 移除已選日期 Remove selected date
  const removeSelectedDate = (date) => {
    formData.selectedDates = formData.selectedDates.filter(
      d => (d instanceof Date ? d.getTime() : new Date(d).getTime()) !== date.getTime()
    );
  };

  // 新增：生成系列ID New: Generate series ID
  const generateSeriesId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // 處理縣市變更 Handle county change
  const handleCountyChange = () => {
    if (!formData) return;  // 確保 formData 已初始化 Ensure formData is initialized
    
    console.log('選擇的縣市:', formData.county);
    // 立即更新區域選項 Immediately update district options
    if (formData.county) {
      const districts = countyDistrictMap[formData.county];
      console.log('對應的區域:', districts);
      districtOptions.value = districts || [];
      // 重置區域選擇 Reset district selection
      formData.district = '';
    } else {
      districtOptions.value = [];
    }
    console.log('設置的區域選項:', districtOptions.value);
  };

  // 監聽縣市變化 Watch county changes
  watch(
    () => formData.county,
    (newValue) => {
      if (newValue) {
        handleCountyChange();
      }
    }
  );

  // 補習班名稱選項 School name options
  const schoolNameOptions = ref([]);

  // 獲取補習班名稱列表 Get school name list
  const fetchSchoolNames = async () => {
    try {
      const response = await scheduleAPI.getAllSchedules();
      if (response.success) {
        // 從所有課程中提取不重複的補習班名稱
        // Extract unique school names from all courses
        const uniqueSchoolNames = [...new Set(response.data
          .map(schedule => schedule.school_name)
          .filter(name => name)  // 過濾掉空值 Filter out empty values
        )];
        
        // 轉換為選項格式 Convert to options format
        schoolNameOptions.value = uniqueSchoolNames.map(name => ({
          label: name,
          value: name
        }));

        // 如果當前有選擇的補習班名稱但不在列表中，添加到選項中
        // If current school name is not in the list, add it
        if (formData.schoolName && !schoolNameOptions.value.some(option => option.value === formData.schoolName)) {
          schoolNameOptions.value.unshift({
            label: formData.schoolName,
            value: formData.schoolName
          });
        }
      }
    } catch (error) {
      console.error('獲取補習班名稱列表失敗:', error);
    }
  };

  // 處理補習班名稱搜尋 Handle school name search
  const handleSchoolNameSearch = async (searchText) => {
    try {
      console.log('搜尋文字:', searchText);  // 添加日誌
      // 如果搜尋文字少於2個字元，顯示所有選項
      // If search text is less than 2 characters, show all options
      if (searchText.length < 2) {
        await fetchSchoolNames();
        return;
      }

      // 過濾符合搜尋文字的選項
      // Filter options that match search text
      const searchLower = searchText.toLowerCase();
      let filteredOptions = schoolNameOptions.value.filter(option =>
        option.label.toLowerCase().includes(searchLower)
      );

      // 如果輸入的值不在現有選項中，將其添加為新選項（放在最前面）
      // If input value is not in existing options, add it as a new option (at the beginning)
      const exactMatch = filteredOptions.some(option => 
        option.value === searchText  // 使用完全匹配而不是轉換為小寫
      );

      if (!exactMatch) {
        filteredOptions = [{
          label: searchText,
          value: searchText
        }, ...filteredOptions];
      }

      console.log('過濾後的選項:', filteredOptions);  // 添加日誌
      schoolNameOptions.value = filteredOptions;
      
      // 確保 formData.schoolName 被設置為完整的輸入值
      // Ensure formData.schoolName is set to the complete input value
      formData.schoolName = searchText;
      console.log('設置的補習班名稱:', formData.schoolName);  // 添加日誌
    } catch (error) {
      console.error('搜尋補習班名稱失敗:', error);
    }
  };

  // 計算日期範圍內的星期幾 Calculate weekdays within date range
  const calculateAvailableWeekdays = () => {
    if (!formData.date || !formData.endDate) return Array(7).fill(true);
    
    const startDate = new Date(formData.date);
    const endDate = new Date(formData.endDate);
    
    // 如果結束日期小於開始日期，返回全部可選
    if (endDate < startDate) return Array(7).fill(true);
    
    // 計算日期範圍內的天數 Calculate days in range
    const daysInRange = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    // 如果日期範圍大於等於7天，返回全部可選
    if (daysInRange >= 7) return Array(7).fill(true);
    
    // 計算日期範圍內的星期幾
    const availableWeekdays = Array(7).fill(false);
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < daysInRange; i++) {
      // 將 getDay() 的結果轉換為我們的索引格式（週一為0，週日為6）
      // Convert getDay() result to our index format (Monday is 0, Sunday is 6)
      const day = currentDate.getDay();
      const index = day === 0 ? 6 : day - 1; // 將週日(0)轉換為6，其他日期減1
      availableWeekdays[index] = true;
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return availableWeekdays;
  };

  // 可選的星期幾 Available weekdays
  const availableWeekdays = ref(Array(7).fill(true));

  // 監聽日期變化 Watch date changes
  watch(
    () => [formData.date, formData.endDate],
    () => {
      availableWeekdays.value = calculateAvailableWeekdays();
      // 重置不可選的星期幾的勾選狀態 Reset unchecked state for unavailable weekdays
      formData.recurringDays = formData.recurringDays.map((checked, index) => 
        checked && availableWeekdays.value[index]
      );
    }
  );

  // 課程種類選項 Course type options
  const courseTypes = ref([]);

  // 老師列表 Teacher list
  const teachers = ref([]);

  // 助教列表 Assistant list
  const assistants = ref([]);

  // 獲取老師列表 Get teacher list
  const fetchTeachers = async () => {
    try {
      loading.value = true;
      const response = await teacherAPI.getAllTeachers();
      
      if (response.success) {
        teachers.value = response.data.map(teacher => {
          const teacherData = teacher.dataValues || teacher;
          return {
            label: `${teacherData.name} / Teacher ${teacherData.name}`,
            value: teacherData.id
          };
        });
      } else {
        Message.error(response.message || '獲取老師列表失敗');
      }
    } catch (error) {
      console.error('獲取老師列表失敗:', error);
      Message.error('獲取老師列表失敗');
    } finally {
      loading.value = false;
    }
  };

  // 獲取課程種類 Get course types
  const fetchCourseTypes = async () => {
    try {
      loading.value = true;
      const response = await courseAPI.getAllCourses();
      
      if (response.success) {
        // 從課程列表中提取不重複的類別 Extract unique categories from course list
        const categories = [...new Set(response.data.map(course => {
          const courseData = course.dataValues || course;
          return courseData.category;
        }))];
        
        // 轉換為選項格式 Convert to options format
        courseTypes.value = categories.map(category => ({
          label: `${category} / ${category}`,
          value: category
        }));
      } else {
        Message.error(response.message || '獲取課程種類失敗');
      }
    } catch (error) {
      console.error('獲取課程種類失敗:', error);
      Message.error('獲取課程種類失敗');
    } finally {
      loading.value = false;
    }
  };

  // 獲取特定課程種類的老師列表 Get teachers for specific course type
  const fetchTeachersByCourseType = async (courseType) => {
    try {
      loading.value = true;
      const response = await teacherAPI.getAllTeachers();
      
      if (response.success) {
        // 添加"待訂"選項作為第一個選項 Add "Pending" option as the first option
        teachers.value = [
          {
            label: '待訂 / Pending',
            value: null
          },
          ...response.data
            .filter(teacher => {
              const teacherData = teacher.dataValues || teacher;
              return teacherData.teaching_categories.includes(courseType);
            })
            .map(teacher => {
              const teacherData = teacher.dataValues || teacher;
              return {
                label: `${teacherData.name} / Teacher ${teacherData.name}`,
                value: teacherData.id
              };
            })
        ];
      } else {
        Message.error(response.message || '獲取老師列表失敗');
      }
    } catch (error) {
      console.error('獲取老師列表失敗:', error);
      Message.error('獲取老師列表失敗');
    } finally {
      loading.value = false;
    }
  };

  // 處理課程種類變更 Handle course type change
  const handleCourseTypeChange = async () => {
    // 重置老師選擇 Reset teacher selection
    formData.teacherId = '';
    
    if (formData.courseType) {
      await fetchTeachersByCourseType(formData.courseType);
    } else {
      teachers.value = [];
    }
  };

  // 組件掛載時獲取數據 Get data when component is mounted
  onMounted(async () => {
    await Promise.all([
      fetchCourseTypes(),
      fetchSchoolNames()
    ]);
    
    // 初始化時調用一次 Call once during initialization
    handleCountyChange();
  });

  // 處理對話框可見性變化 Handle dialog visibility change
  const handleVisibleChange = (value) => {
    emit('update:visible', value);
  };

  // 關閉對話框 Close dialog
  const handleClose = () => {
    emit('update:visible', false);
    emit('close');
    // 重置表單 Reset form
    Object.assign(formData, {
      schoolName: '',
      className: '',
      courseType: '',
      county: '',
      district: '',
      date: '',
      endDate: '',
      startTime: '',
      endTime: '',
      teacherId: '',
      courseFee: '0',
      teacherFee: '0',
      notes: '',  // 重置備註欄位 Reset notes field
      assistants: [],
      recurringDays: Array(7).fill(false),
      scheduleMode: 'single', // 重置排課模式 Reset schedule mode
      selectedDates: [], // 重置自選日期列表 Reset custom dates list
      seriesId: '' // 重置 seriesId // Reset seriesId
    });
    // 重置老師列表 Reset teacher list
    teachers.value = [];
  };

  // 添加助教 Add assistant
  const addAssistant = async () => {
    const newAssistant = {
      id: '',
      fee: ''
    };
    
    // 使用 nextTick 確保 DOM 更新後再添加新助教
    await nextTick();
    formData.assistants.push(newAssistant);
  };

  // 移除助教 Remove assistant
  const removeAssistant = (index) => {
    formData.assistants.splice(index, 1);
  };

  // 處理提交 Handle submit
  const handleSubmit = async () => {
    // 防止重複提交 Prevent duplicate submission
    if (loading.value) {
      console.log('正在提交中，請勿重複提交 / Submitting, please do not submit repeatedly');
      return;
    }

    try {
      loading.value = true;
      
      // 修正驗證邏輯：自選日期模式只檢查 selectedDates，其他模式檢查 date
      if (
        !formData.schoolName ||
        !formData.courseType ||
        !formData.teacherId ||
        !formData.startTime ||
        !formData.endTime ||
        (
          formData.scheduleMode === 'custom'
            ? formData.selectedDates.length === 0
            : !formData.date
        )
      ) {
        Message.error('請填寫必填欄位 / Please fill in required fields');
        return;
      }

      // 根據排課模式處理不同的提交邏輯 Handle different submit logic based on schedule mode
      if (formData.scheduleMode === 'custom') {
        if (formData.selectedDates.length === 0) {
          Message.error('請選擇至少一個上課日期 / Please select at least one course date');
          return;
        }
        // 若尚未產生 seriesId，則產生並掛在 formData 上 // Generate and attach seriesId to formData if not exists
        if (!formData.seriesId) {
          formData.seriesId = generateSeriesId();
        }
        const seriesId = formData.seriesId; // 取得本批次共用的 seriesId // Get shared seriesId for this batch
        console.log('本次所有自選課程共用 seriesId:', seriesId); // Log for debug
        let successCount = 0;
        let hasError = false;
        let createdCourses = [];
        // 為每個選擇的日期創建課程 // Create course for each selected date
        for (const date of formData.selectedDates) {
          try {
            // 明確組裝課程資料 // Explicitly assemble schedule data
            const scheduleData = {
              school_name: formData.schoolName, // 補習班名稱 // School name
              class_name: formData.className,   // 班級名稱 // Class name
              course_type: formData.courseType, // 課程類型 // Course type
              teacher_id: formData.teacherId,   // 老師ID // Teacher ID
              date: date,                       // 上課日期 // Course date
              start_time: formData.startTime,   // 開始時間 // Start time
              end_time: formData.endTime,       // 結束時間 // End time
              course_fee: formData.courseFee,   // 課程費用 // Course fee
              teacher_fee: formData.teacherFee, // 老師費用 // Teacher fee
              county: formData.county,          // 縣市 // County
              district: formData.district,      // 區域 // District
              notes: formData.notes,            // 備註 // Notes
              assistants: formData.assistants,  // 助教 // Assistants
              is_recurring: false,              // 非重複性課程 // Not recurring
              series_id: seriesId               // 同一系列ID // Same series ID for all
            };
            const response = await scheduleAPI.createSchedule(scheduleData);
            if (response.success) {
              successCount++;
              createdCourses.push(response.data); // 收集課程資料 // Collect course data
            } else {
              hasError = true;
              console.error('創建課程失敗 / Course creation failed:', response.message);
            }
          } catch (error) {
            hasError = true;
            console.error('創建課程時發生錯誤 / Error during course creation:', error);
          }
        }
        // 清空 seriesId，避免下次重複使用 // Clear seriesId after submit
        formData.seriesId = '';
        if (successCount > 0) {
          if (hasError) {
            Message.warning(`部分課程創建成功，共 ${successCount} 堂 / Partially successful, created ${successCount} courses`);
          } else {
            Message.success(`成功創建 ${successCount} 堂自選日期課程 / Successfully created ${successCount} custom date courses`);
          }
          // 回傳所有成功建立的課程詳細資料 // Emit all created course details
          emit('submit', createdCourses);
          handleClose();
        } else {
          Message.error('課程創建失敗，請檢查輸入資料 / Course creation failed, please check input data');
        }
      } else if (formData.scheduleMode === 'single') {
        // 單堂課程模式 Single course mode
        const scheduleData = {
          school_name: formData.schoolName,
          class_name: formData.className,
          course_type: formData.courseType,
          teacher_id: formData.teacherId,
          date: formData.date,
          start_time: formData.startTime,
          end_time: formData.endTime,
          course_fee: formData.courseFee,
          teacher_fee: formData.teacherFee,
          county: formData.county,
          district: formData.district,
          notes: formData.notes,
          assistants: formData.assistants,
          is_recurring: false
        };
        const response = await scheduleAPI.createSchedule(scheduleData);
        if (response.success) {
          emit('submit', response.data);
          handleClose();
        } else {
          Message.error(response.message || '課程排程創建失敗 / Course schedule creation failed');
        }
      } else if (formData.scheduleMode === 'recurring') {
        // 週期性課程模式 Recurring course mode
        if (!formData.endDate) {
          Message.error('請選擇結束日期 / Please select end date');
          return;
        }
        const recurringDays = formData.recurringDays
          .map((checked, index) => checked ? index + 1 : null)
          .filter(Boolean);
        if (recurringDays.length === 0) {
          Message.error('請選擇至少一個重複的星期 / Please select at least one recurring day');
          return;
        }
        const scheduleData = {
          school_name: formData.schoolName,
          class_name: formData.className,
          course_type: formData.courseType,
          teacher_id: formData.teacherId,
          date: formData.date,
          start_time: formData.startTime,
          end_time: formData.endTime,
          course_fee: formData.courseFee,
          teacher_fee: formData.teacherFee,
          county: formData.county,
          district: formData.district,
          notes: formData.notes,
          assistants: formData.assistants,
          is_recurring: true,
          recurring_days: recurringDays,
          recurring_start_date: formData.date,
          recurring_end_date: formData.endDate
        };
        const response = await scheduleAPI.createSchedule(scheduleData);
        if (response.success) {
          emit('submit', response.data);
          handleClose();
        } else {
          Message.error(response.message || '重複性課程排程創建失敗 / Recurring course schedule creation failed');
        }
      }
    } catch (error) {
      console.error('創建課程排程失敗 / Failed to create course schedule:', error);
      Message.error('創建課程排程失敗 / Failed to create course schedule');
    } finally {
      loading.value = false;
    }
  };

  // 格式化日期 Format date
  const formatDate = (date) => {
    // 若不是 Date 物件則轉換 If not a Date object, convert
    const d = (date instanceof Date) ? date : new Date(date);
    return format(d, 'yyyy-MM-dd');
  };

  return {
    loading,
    formData,
    weekDays,
    courseTypes,
    teachers,
    assistants,
    availableWeekdays,
    handleVisibleChange,
    handleClose,
    handleSubmit,
    addAssistant,
    removeAssistant,
    handleCourseTypeChange,
    countyOptions,
    districtOptions,
    handleCountyChange,
    schoolNameOptions,
    handleSchoolNameSearch,
    scheduleModes,
    handleDateSelect,
    removeSelectedDate,
    formatDate, // 將 formatDate 暴露給 template Use formatDate in template
  };
}; 