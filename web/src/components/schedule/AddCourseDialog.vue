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
      <!-- 第一行：補習班名稱和班級名稱 First row: School Name and Class Name -->
      <div class="form-row">
        <AppInput
          v-model="formData.schoolName"
          label="補習班名稱 / School Name"
          placeholder="請輸入補習班名稱"
          required
        />
        <AppInput
          v-model="formData.className"
          label="班級名稱 / Class Name"
          placeholder="請輸入班級名稱"
          required
        />
      </div>

      <!-- 第二行：課程種類和老師 Second row: Course Type and Teacher -->
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

      <!-- 第三行：日期和時間 Third row: Date and Time -->
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
            >
            <span>{{ day.label }}</span>
          </label>
        </div>
      </div>

      <!-- 第五行：課程費用 Fifth row: Course Fees -->
      <div class="form-row">
        <AppInput
          v-model="formData.courseFee"
          label="課程鐘點費 / Course Fee"
          type="number"
          placeholder="請輸入課程鐘點費"
          required
        />
        <AppInput
          v-model="formData.teacherFee"
          label="老師實拿鐘點 / Teacher's Fee"
          type="number"
          placeholder="請輸入老師實拿鐘點"
          required
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
import { ref, reactive, nextTick, onMounted } from 'vue';
import { format, parseISO, getDay } from 'date-fns';
import { teacherAPI, courseAPI } from '@/utils/api';
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
      { label: '週日 / Sun', value: 0 }
    ];

    // 表單數據 Form data
    const formData = reactive({
      schoolName: '',
      className: '',
      courseType: '',
      date: '',
      endDate: '',
      startTime: '',
      endTime: '',
      teacherId: '',
      courseFee: '',
      teacherFee: '',
      assistants: [],
      recurringDays: Array(7).fill(false)  // 重複性選項 Recurring options
    });

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
          // 過濾出教授該課程種類的老師
          // Filter teachers who teach this course type
          teachers.value = response.data
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

    // 組件掛載時只獲取課程種類 Only fetch course types when component is mounted
    onMounted(async () => {
      await fetchCourseTypes();
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
        date: '',
        endDate: '',
        startTime: '',
        endTime: '',
        teacherId: '',
        courseFee: '',
        teacherFee: '',
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
    const handleSubmit = () => {
      // 創建課程數據 Create course data
      const selectedTeacher = teachers.value.find(t => t.value === formData.teacherId);
      const teacherName = selectedTeacher ? selectedTeacher.label.split(' / ')[0] : '';

      let assistantName = '';
      let assistantFee = '';
      if (formData.assistants.length > 0) {
        const selectedAssistant = assistants.value.find(a => a.value === formData.assistants[0].id);
        assistantName = selectedAssistant ? selectedAssistant.label.split(' / ')[0] : '';
        assistantFee = formData.assistants[0].fee;
      }

      // 基本課程數據 Base course data
      const baseEventData = {
        courseType: formData.courseType,
        schoolName: formData.schoolName,
        teacherName: teacherName,
        assistantName: assistantName,
        startTime: formData.startTime,
        endTime: formData.endTime,
        className: formData.className,
        courseFee: formData.courseFee,
        teacherFee: formData.teacherFee,
        assistantFee: assistantFee
      };

      // 如果沒有結束日期，創建單次課程 If no end date, create single course
      if (!formData.endDate) {
        const singleEvent = {
          ...baseEventData,
          date: formData.date
        };
        emit('submit', [singleEvent]);
      } else {
        // 如果有結束日期，創建重複性課程 If has end date, create recurring courses
        const events = generateRecurringEvents(baseEventData);
        emit('submit', events);
      }

      handleClose();
    };

    // 生成重複性課程 Generate recurring events
    const generateRecurringEvents = (baseEventData) => {
      const startDate = parseISO(formData.date);
      const endDate = parseISO(formData.endDate);
      const events = [];

      let currentDate = startDate;
      while (currentDate <= endDate) {
        const currentWeekday = getDay(currentDate);
        // 將 currentWeekday 轉換為數組索引（0=週一，...，6=週日）
        const dayIndex = currentWeekday === 0 ? 6 : currentWeekday - 1;
        
        if (formData.recurringDays[dayIndex]) {
          events.push({
            ...baseEventData,
            date: format(currentDate, 'yyyy-MM-dd')
          });
        }
        
        // 添加一天 Add one day
        currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
      }

      return events;
    };

    return {
      loading,
      formData,
      weekDays,
      courseTypes,
      teachers,
      assistants,
      handleVisibleChange,
      handleClose,
      handleSubmit,
      addAssistant,
      removeAssistant,
      generateRecurringEvents,
      handleCourseTypeChange,
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
  width: 100%;  // 改為 100% 寬度
  max-width: 720px;  // 設置最大寬度
  margin: 0 auto;  // 居中顯示

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    align-items: start;
  }

  .time-selection {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
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
</style> 