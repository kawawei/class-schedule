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
      <!-- 第一行：補習班名稱 First row: School Name -->
      <AppInput
        v-model="formData.schoolName"
        label="補習班名稱 / School Name"
        placeholder="請輸入補習班名稱"
        required
      />

      <!-- 第二行：班級名稱和老師 Second row: Class Name and Teacher -->
      <div class="form-row">
        <AppInput
          v-model="formData.className"
          label="班級名稱 / Class Name"
          placeholder="請輸入班級名稱"
          required
        />
        <AppSelect
          v-model="formData.teacherId"
          label="授課老師 / Teacher"
          :options="teachers"
          placeholder="請選擇老師"
          required
        />
      </div>

      <!-- 第三行：課程種類 Third row: Course Type -->
      <AppSelect
        v-model="formData.courseType"
        label="課程種類 / Course Type"
        :options="courseTypes"
        placeholder="請選擇課程種類"
        required
      />

      <!-- 第四行：日期和時間 Fourth row: Date and Time -->
      <div class="time-selection">
        <AppInput
          v-model="formData.date"
          label="日期 / Date"
          type="date"
          required
        />
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
import { ref, reactive, nextTick } from 'vue';
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
      default: false
    }
  },

  emits: ['update:visible', 'close', 'submit'],

  setup(props, { emit }) {
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
      assistants: []  // 改為助教數組
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
        startTime: '',
        endTime: '',
        teacherId: '',
        courseFee: '',
        teacherFee: '',
        assistants: []
      });
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

    // 提交表單 Submit form
    const handleSubmit = () => {
      // TODO: 驗證表單 Validate form
      emit('submit', formData);
      handleClose();
    };

    return {
      formData,
      courseTypes,
      teachers,
      assistants,
      handleVisibleChange,
      handleClose,
      handleSubmit,
      addAssistant,
      removeAssistant
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
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem;
  border-top: 1px solid var(--color-gray-200);
}
</style> 