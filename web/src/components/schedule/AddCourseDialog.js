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
    recurringDays: Array(7).fill(false)
  });

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
      recurringDays: Array(7).fill(false)
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
    if (loading.value) return;
    
    try {
      loading.value = true;
      
      // 確保鐘點費為數字，如果為空則設為 0
      // Ensure fees are numbers, set to 0 if empty
      const courseFee = formData.courseFee === '' ? 0 : Number(formData.courseFee);
      const teacherFee = formData.teacherFee === '' ? 0 : Number(formData.teacherFee);
      
      // 創建課程數據 Create course data
      const selectedTeacher = teachers.value.find(t => t.value === formData.teacherId);
      const teacherName = selectedTeacher ? selectedTeacher.label.split(' / ')[0] : '';

      // 確保補習班名稱不為空 Ensure school name is not empty
      if (!formData.schoolName) {
        Message.error('請輸入補習班名稱 / Please enter school name');
        return;
      }

      // 基本課程數據 Base course data
      const baseEventData = {
        school_name: formData.schoolName,  // 直接使用用戶輸入的值，不進行 trim Directly use user input without trim
        class_name: formData.className || null,  // 如果為空則設為 null If empty, set to null
        course_type: formData.courseType,
        teacher_id: formData.teacherId || null,  // 確保 teacher_id 為 null 而不是空字串
        county: formData.county,  // 添加縣市資訊
        district: formData.district,  // 添加區域資訊
        start_time: formData.startTime,
        end_time: formData.endTime,
        course_fee: courseFee,
        teacher_fee: teacherFee,
        notes: formData.notes,
        company_code: localStorage.getItem('companyCode'),
        assistants: formData.assistants.map(assistant => ({
          id: assistant.id || null,  // 確保助教 ID 為 null 而不是空字串
          fee: Number(assistant.fee) || 0  // 確保助教鐘點費為數字
        }))
      };

      // 如果沒有結束日期，創建單次課程 If no end date, create single course
      if (!formData.endDate) {
        console.log('創建單次課程:', {
          ...baseEventData,
          date: formData.date,
          is_recurring: false
        });
        
        const scheduleData = {
          ...baseEventData,
          date: formData.date,
          is_recurring: false
        };
        
        const response = await scheduleAPI.createSchedule(scheduleData);
        console.log('單次課程創建響應:', response);
        
        if (response.success) {
          emit('submit', response.data);
          handleClose();
        } else {
          Message.error(response.message || '課程排程創建失敗');
        }
      } else {
        // 如果有結束日期，創建重複性課程 If has end date, create recurring courses
        console.log('選擇的重複性日期:', formData.recurringDays);
        console.log('星期幾選項:', weekDays);
        
        const recurringDays = formData.recurringDays
          .map((checked, index) => {
            console.log(`第 ${index} 天: ${checked ? '已選擇' : '未選擇'}`);
            // 直接使用 index + 1 作為星期值（1-7，週一到週日）
            // Directly use index + 1 as weekday value (1-7, Monday to Sunday)
            return checked ? index + 1 : null;
          })
          .filter(Boolean);
          
        console.log('生成的重複性日期:', recurringDays);
        
        console.log('創建重複性課程:', {
          ...baseEventData,
          date: formData.date,
          is_recurring: true,
          recurring_days: recurringDays,
          recurring_start_date: formData.date,
          recurring_end_date: formData.endDate
        });
        
        if (recurringDays.length === 0) {
          Message.error('請選擇至少一個重複的星期');
          return;
        }
        
        const scheduleData = {
          ...baseEventData,
          date: formData.date,
          is_recurring: true,
          recurring_days: recurringDays,
          recurring_start_date: formData.date,
          recurring_end_date: formData.endDate
        };
        
        const response = await scheduleAPI.createSchedule(scheduleData);
        console.log('重複性課程創建響應:', response);
        
        if (response.success) {
          emit('submit', response.data);
          handleClose();
        } else {
          Message.error(response.message || '重複性課程排程創建失敗');
        }
      }
    } catch (error) {
      console.error('創建課程排程失敗:', error);
      Message.error('創建課程排程失敗');
    } finally {
      loading.value = false;
    }
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
  };
}; 