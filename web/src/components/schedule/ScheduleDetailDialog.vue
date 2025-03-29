<!-- 課程詳情對話框 Schedule Detail Dialog -->
<template>
  <AppDialog
    :model-value="visible"
    :title="isEditing ? '編輯課程 / Edit Course' : '課程詳情 / Course Details'"
    size="lg"
    @update:model-value="handleVisibleChange"
    @close="handleClose"
  >
    <div class="course-form">
      <!-- 第一行：補習班名稱 First row: School Name -->
      <AppInput
        v-model="formData.schoolName"
        label="補習班名稱 / School Name"
        placeholder="請輸入補習班名稱"
        :disabled="!isEditing"
        required
      />

      <!-- 第二行：班級名稱和老師 Second row: Class Name and Teacher -->
      <div class="form-row">
        <AppInput
          v-model="formData.className"
          label="班級名稱 / Class Name"
          placeholder="請輸入班級名稱"
          :disabled="!isEditing"
          required
        />
        <AppSelect
          v-model="formData.teacherId"
          label="授課老師 / Teacher"
          :options="teachers"
          placeholder="請選擇老師"
          :disabled="!isEditing"
          required
        />
      </div>

      <!-- 第三行：課程種類 Third row: Course Type -->
      <AppSelect
        v-model="formData.courseType"
        label="課程種類 / Course Type"
        :options="courseTypes"
        placeholder="請選擇課程種類"
        :disabled="!isEditing"
        required
      />

      <!-- 第四行：日期和時間 Fourth row: Date and Time -->
      <div class="time-selection">
        <AppInput
          v-model="formData.date"
          label="日期 / Date"
          type="date"
          :disabled="!isEditing"
          required
        />
        <AppInput
          v-model="formData.startTime"
          label="開始時間 / Start Time"
          type="time"
          :disabled="!isEditing"
          required
        />
        <AppInput
          v-model="formData.endTime"
          label="結束時間 / End Time"
          type="time"
          :disabled="!isEditing"
          required
        />
      </div>

      <!-- 第五行：課程費用 Fifth row: Course Fees -->
      <div class="form-row">
        <AppInput
          v-model="formData.courseFee"
          label="課程鐘點費 / Course Fee"
          type="number"
          placeholder="請輸入課程鐘點費"
          :disabled="!isEditing"
          required
        />
        <AppInput
          v-model="formData.teacherFee"
          label="老師實拿鐘點 / Teacher's Fee"
          type="number"
          placeholder="請輸入老師實拿鐘點"
          :disabled="!isEditing"
          required
        />
      </div>

      <!-- 助教區域 Assistant Section -->
      <div class="assistant-section" v-if="isEditing">
        <AppButton
          type="primary"
          size="md"
          class="add-assistant-button"
          @click="addAssistant"
          :disabled="formData.assistants.length > 0"
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
              v-if="isEditing"
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
              :disabled="!isEditing"
              required
            />
            <AppInput
              v-model="assistant.fee"
              label="助教鐘點費 / Assistant Fee"
              type="number"
              placeholder="請輸入助教鐘點費"
              :disabled="!isEditing"
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
          {{ isEditing ? '取消 / Cancel' : '關閉 / Close' }}
        </AppButton>
        <AppButton
          v-if="!isEditing"
          type="primary"
          @click="startEditing"
        >
          編輯 / Edit
        </AppButton>
        <AppButton
          v-else
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
import { defineComponent, ref, reactive, nextTick } from 'vue';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import AppDialog from '../base/AppDialog.vue';
import AppInput from '../base/AppInput.vue';
import AppSelect from '../base/AppSelect.vue';
import AppButton from '../base/AppButton.vue';

export default defineComponent({
  name: 'ScheduleDetailDialog',

  components: {
    AppDialog,
    AppInput,
    AppSelect,
    AppButton
  },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    courseData: {
      type: Object,
      required: true,
      default: () => ({
        date: '',
        startTime: '',
        endTime: '',
        courseType: '',
        schoolName: '',
        className: '',
        teacherName: '',
        assistantName: '',
        courseFee: '',
        teacherFee: '',
        assistantFee: ''
      })
    }
  },

  emits: ['update:visible', 'close', 'edit', 'save'],

  setup(props, { emit }) {
    // 編輯模式狀態 Edit mode state
    const isEditing = ref(false);

    // 表單數據 Form data
    const formData = reactive({
      schoolName: '',
      className: '',
      courseType: '',
      date: '',
      startTime: '',
      endTime: '',
      teacherId: '',
      courseFee: '',
      teacherFee: '',
      assistants: []
    });

    // 課程種類選項 Course type options
    const courseTypes = ref([
      { label: '數學 / Math', value: 'math' },
      { label: '英文 / English', value: 'english' },
      { label: '國文 / Chinese', value: 'chinese' },
      { label: '理化 / Science', value: 'science' }
    ]);

    // 老師列表 Teacher list
    const teachers = ref([
      { label: '王老師 / Teacher Wang', value: 1 },
      { label: '李老師 / Teacher Li', value: 2 },
      { label: '張老師 / Teacher Zhang', value: 3 }
    ]);

    // 助教列表 Assistant list
    const assistants = ref([
      { label: '王助教 / Assistant Wang', value: 1 },
      { label: '李助教 / Assistant Li', value: 2 },
      { label: '張助教 / Assistant Zhang', value: 3 }
    ]);

    // 初始化表單數據 Initialize form data
    const initializeFormData = () => {
      // 找到對應的教師ID Find corresponding teacher ID
      const teacherId = teachers.value.find(
        t => t.label.split(' / ')[0] === props.courseData.teacherName
      )?.value || '';

      // 設置表單數據 Set form data
      Object.assign(formData, {
        schoolName: props.courseData.schoolName,
        className: props.courseData.className,
        courseType: props.courseData.courseType,
        date: props.courseData.date,
        startTime: props.courseData.startTime,
        endTime: props.courseData.endTime,
        teacherId: teacherId,
        courseFee: props.courseData.courseFee,
        teacherFee: props.courseData.teacherFee,
        assistants: []
      });

      // 如果有助教，添加助教信息 Add assistant info if exists
      if (props.courseData.assistantName) {
        const assistantId = assistants.value.find(
          a => a.label.split(' / ')[0] === props.courseData.assistantName
        )?.value || '';

        formData.assistants.push({
          id: assistantId,
          fee: props.courseData.assistantFee
        });
      }
    };

    // 處理對話框可見性變化 Handle dialog visibility change
    const handleVisibleChange = (value) => {
      if (value) {
        initializeFormData();
      } else {
        isEditing.value = false;
      }
      emit('update:visible', value);
    };

    // 關閉對話框 Close dialog
    const handleClose = () => {
      emit('update:visible', false);
      emit('close');
      isEditing.value = false;
    };

    // 開始編輯 Start editing
    const startEditing = () => {
      isEditing.value = true;
    };

    // 添加助教 Add assistant
    const addAssistant = async () => {
      const newAssistant = {
        id: '',
        fee: ''
      };
      
      await nextTick();
      formData.assistants.push(newAssistant);
    };

    // 移除助教 Remove assistant
    const removeAssistant = (index) => {
      formData.assistants.splice(index, 1);
    };

    // 提交表單 Submit form
    const handleSubmit = () => {
      // 獲取選中的老師名稱 Get selected teacher name
      const selectedTeacher = teachers.value.find(t => t.value === formData.teacherId);
      const teacherName = selectedTeacher ? selectedTeacher.label.split(' / ')[0] : '';

      // 獲取助教名稱（如果有） Get assistant name (if exists)
      let assistantName = '';
      if (formData.assistants.length > 0) {
        const selectedAssistant = assistants.value.find(a => a.value === formData.assistants[0].id);
        assistantName = selectedAssistant ? selectedAssistant.label.split(' / ')[0] : '';
      }

      // 創建課程數據 Create course data
      const updatedCourseData = {
        courseType: formData.courseType,
        schoolName: formData.schoolName,
        teacherName: teacherName,
        assistantName: assistantName,
        startTime: formData.startTime,
        endTime: formData.endTime,
        date: formData.date,
        className: formData.className,
        courseFee: formData.courseFee,
        teacherFee: formData.teacherFee,
        assistantFee: formData.assistants[0]?.fee || ''
      };

      emit('save', updatedCourseData);
      handleClose();
    };

    return {
      isEditing,
      formData,
      courseTypes,
      teachers,
      assistants,
      handleVisibleChange,
      handleClose,
      startEditing,
      handleSubmit,
      addAssistant,
      removeAssistant
    };
  }
});
</script>

<style lang="scss" scoped>
.course-form {
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
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem;
  border-top: 1px solid var(--color-gray-200);
}
</style> 