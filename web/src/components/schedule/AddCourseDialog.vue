<!-- 添加課程對話框 Add Course Dialog -->
<template>
  <AppDialog
    :model-value="visible"
    :title="'新增課程 / Add Course'"
    size="lg"
    @update:model-value="handleVisibleChange"
    @close="handleClose"
  >
    <div class="add-course-form">
      <!-- 第一行：縣市和區域 First row: County and District -->
      <div class="form-row">
        <AppSelect
          v-model="formData.county"
          label="縣市 / County"
          :options="countyOptions"
          placeholder="請選擇縣市"
          required
          searchable
          @change="handleCountyChange"
        />
        <AppSelect
          v-model="formData.district"
          label="區域 / District"
          :options="districtOptions"
          placeholder="請選擇區域"
          required
          searchable
          :disabled="!formData.county"
        />
      </div>

      <!-- 第二行：補習班名稱和班級名稱 Second row: School Name and Class Name -->
      <div class="form-row">
        <AppSelect
          v-model="formData.schoolName"
          label="補習班名稱 / School Name"
          :options="schoolNameOptions"
          placeholder="請輸入補習班名稱"
          required
          searchable
          allow-custom-value
          @search="handleSchoolNameSearch"
        />
        <AppInput
          v-model="formData.className"
          label="班級名稱 / Class Name"
          placeholder="請輸入班級名稱"
          required
        />
      </div>

      <!-- 第三行：課程種類和老師 Third row: Course Type and Teacher -->
      <div class="form-row">
        <AppSelect
          v-model="formData.courseType"
          label="課程種類 / Course Type"
          :options="courseTypes"
          placeholder="請選擇課程種類"
          required
          @change="handleCourseTypeChange"
        />
        <AppSelect
          v-model="formData.teacherId"
          label="授課老師 / Teacher"
          :options="teachers"
          placeholder="請先選擇課程種類"
          required
          :disabled="!formData.courseType"
        />
      </div>

      <!-- 第四行：日期和時間 Fourth row: Date and Time -->
      <div class="time-selection">
        <AppInput
          v-model="formData.date"
          label="開始日期 / Start Date"
          type="date"
          required
        />
        <AppInput
          v-model="formData.endDate"
          label="結束日期 / End Date"
          type="date"
          placeholder="選填 / Optional"
        />
      </div>
      <div class="time-selection">
        <AppInput
          v-model="formData.startTime"
          label="開始時間 / Start Time"
          type="time"
          required
        />
        <AppInput
          v-model="formData.endTime"
          label="結束時間 / End Time"
          type="time"
          required
        />
      </div>

      <!-- 重複性選項 Recurring Options -->
      <div v-if="formData.endDate" class="recurring-options">
        <div class="section-title">重複性 / Recurring</div>
        <div class="weekday-checkboxes">
          <label v-for="(day, index) in weekDays" :key="index" class="weekday-checkbox">
            <input
              type="checkbox"
              v-model="formData.recurringDays[index]"
              :disabled="!availableWeekdays[index]"
            >
            <span :class="{ 'disabled': !availableWeekdays[index] }">{{ day.label }}</span>
          </label>
        </div>
      </div>

      <!-- 第五行：課程費用 Fifth row: Course Fees -->
      <div class="time-selection">
        <AppInput
          v-model="formData.courseFee"
          label="課程鐘點費"
          type="number"
          placeholder="請輸入課程鐘點費，預設為 0"
        />
        <AppInput
          v-model="formData.teacherFee"
          label="老師實拿鐘點"
          type="number"
          placeholder="請輸入老師實拿鐘點，預設為 0"
        />
      </div>

      <!-- 第六行：備註 Sixth row: Notes -->
      <div class="form-row">
        <AppInput
          v-model="formData.notes"
          label="備註 / Notes (選填 / Optional)"
          type="textarea"
          placeholder="請輸入備註"
          class="notes-input"
        />
      </div>

      <!-- 助教區域 Assistant Section -->
      <div class="assistant-section">
        <AppButton
          type="primary"
          size="md"
          class="add-assistant-button"
          @click.once="addAssistant"
        >
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </template>
          新增助教 / Add Assistant
        </AppButton>
      </div>

      <!-- 助教列表 Assistant List -->
      <div v-if="formData.assistants.length > 0" class="assistant-list">
        <div v-for="(assistant, index) in formData.assistants" :key="index" class="assistant-info">
          <div class="assistant-header">
            <h4>助教 {{ index + 1 }} / Assistant {{ index + 1 }}</h4>
            <AppButton
              type="text"
              size="sm"
              class="remove-assistant"
              @click="removeAssistant(index)"
            >
              移除助教 / Remove Assistant
            </AppButton>
          </div>
          <div class="form-row">
            <AppSelect
              v-model="assistant.id"
              label="助教 / Assistant"
              :options="assistants"
              placeholder="請選擇助教"
              required
            />
            <AppInput
              v-model="assistant.fee"
              label="助教鐘點費 / Assistant Fee"
              type="number"
              placeholder="請輸入助教鐘點費"
              required
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按鈕 Action Buttons -->
    <template #footer>
      <div class="dialog-footer">
        <AppButton
          type="secondary"
          @click="handleClose"
        >
          取消 / Cancel
        </AppButton>
        <AppButton
          type="primary"
          @click="handleSubmit"
        >
          確認 / Confirm
        </AppButton>
      </div>
    </template>
  </AppDialog>
</template>

<script>
import { ref, reactive, nextTick, onMounted, watch } from 'vue';
import { format, parseISO, getDay } from 'date-fns';
import { teacherAPI, courseAPI, scheduleAPI } from '@/utils/api';
import Message from '@/utils/message';
import AppDialog from '../base/AppDialog.vue';
import AppInput from '../base/AppInput.vue';
import AppSelect from '../base/AppSelect.vue';
import AppButton from '../base/AppButton.vue';

export default {
  name: 'AddCourseDialog',
  
  components: {
    AppDialog,
    AppInput,
    AppSelect,
    AppButton
  },

  props: {
    visible: {
      type: Boolean,
      required: true
    }
  },

  emits: ['update:visible', 'close', 'submit'],

  setup(props, { emit }) {
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
          class_name: formData.className,
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
  }
};
</script>

<style lang="scss" scoped>
.add-course-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  width: 100%;
  max-width: 720px;
  margin: 0 auto;

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    align-items: start;
    width: 100%;

    &:has(> :only-child) {
      grid-template-columns: 1fr;
    }
  }

  .time-selection {
    display: grid;
    grid-template-columns: 1fr 1fr;  // 改為兩列，確保對齊
    gap: 1.5rem;
    width: 100%;
  }

  .assistant-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .assistant-info {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
    background-color: var(--bg-secondary);
    border-radius: 8px;
    border: 1px solid var(--color-gray-200);

    .assistant-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;

      h4 {
        margin: 0;
        font-size: 1rem;
        font-weight: 500;
        color: var(--text-primary);
      }
    }

    .remove-assistant {
      color: var(--color-danger);
      
      &:hover {
        color: var(--color-danger-dark);
      }
    }
  }

  .assistant-section {
    display: flex;
    justify-content: flex-start;
    padding: 1rem 0;
    border-top: 1px solid var(--color-gray-200);
    border-bottom: 1px solid var(--color-gray-200);
    margin: 0.5rem 0;

    .add-assistant-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      
      svg {
        margin-right: 0.25rem;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }

  .recurring-options {
    margin-top: var(--spacing-md);
    padding: var(--spacing-md);
    background-color: var(--bg-secondary);
    border-radius: var(--radius-md);

    .section-title {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-medium);
      margin-bottom: var(--spacing-sm);
      color: var(--text-primary);
    }

    .weekday-checkboxes {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-sm);

      .weekday-checkbox {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        padding: var(--spacing-xs) var(--spacing-sm);
        background-color: var(--bg-primary);
        border-radius: var(--radius-sm);
        cursor: pointer;
        user-select: none;

        input[type="checkbox"] {
          width: 16px;
          height: 16px;
          margin: 0;
        }

        span {
          font-size: var(--font-size-sm);
          color: var(--text-primary);
        }

        &:has(input:disabled) {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .disabled {
          color: var(--text-secondary);
        }
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem;
  border-top: 1px solid var(--color-gray-200);
}

.notes-input {
  width: 100%;
  grid-column: 1 / -1;
  
  :deep(textarea) {
    min-height: 100px;
    resize: vertical;
  }
}
</style> 