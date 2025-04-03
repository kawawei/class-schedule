<!-- 課程詳情對話框 Schedule Detail Dialog -->
<template>
  <AppDialog
    :model-value="visible"
    :title="isEditing ? '編輯課程 / Edit Course' : '課程詳情 / Course Details'"
    size="lg"
    @update:model-value="handleVisibleChange"
  >
    <div class="course-form">
      <!-- 第一行：補習班名稱 First row: School Name -->
      <AppInput
        v-model="formData.schoolName"
        label="補習班名稱 / School Name"
        placeholder="請輸入補習班名稱"
        :disabled="!isEditing || isTeacher"
        required
      />

      <!-- 第二行：班級名稱和老師 Second row: Class Name and Teacher -->
      <div class="form-row">
        <AppInput
          v-model="formData.className"
          label="班級名稱 / Class Name"
          placeholder="請輸入班級名稱"
          :disabled="!isEditing || isTeacher"
          required
        />
        <!-- 在非編輯模式下顯示純文本，編輯模式下顯示選擇器 -->
        <template v-if="!isEditing || isTeacher">
          <AppInput
            v-model="formData.teacherName"
            label="授課老師 / Teacher"
            :disabled="true"
            required
          />
        </template>
        <AppSelect
          v-else
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
        :disabled="!isEditing || isTeacher"
        required
      />

      <!-- 第四行：日期和時間 Fourth row: Date and Time -->
      <div class="form-row">
        <AppInput
          v-model="formData.date"
          label="日期 / Date"
          type="date"
          :disabled="!isEditing || isTeacher"
          required
        />
        <div class="time-inputs">
          <AppInput
            v-model="formData.startTime"
            label="開始時間 / Start Time"
            type="time"
            :disabled="!isEditing || isTeacher"
            required
          />
          <AppInput
            v-model="formData.endTime"
            label="結束時間 / End Time"
            type="time"
            :disabled="!isEditing || isTeacher"
            required
          />
        </div>
      </div>

      <!-- 第五行：費用 Fifth row: Fees -->
      <div class="form-row">
        <AppInput
          v-if="!isTeacher"
          v-model="formData.courseFee"
          label="課程費用 / Course Fee"
          type="number"
          :disabled="!isEditing || isTeacher"
          required
        />
        <AppInput
          v-model="formData.teacherFee"
          label="老師費用 / Teacher Fee"
          type="number"
          :disabled="!isEditing || isTeacher"
          required
        />
      </div>

      <!-- 助教區域 Assistant Section -->
      <div class="assistant-section" v-if="isEditing && !isTeacher">
        <div class="section-header">
          <h4>助教信息 / Assistant Information</h4>
          <AppButton
            type="primary"
            size="sm"
            @click="addAssistant"
          >
            添加助教 / Add Assistant
          </AppButton>
        </div>
        <div
          v-for="(assistant, index) in formData.assistants"
          :key="index"
          class="assistant-row"
        >
          <AppSelect
            v-model="assistant.id"
            :options="assistants"
            placeholder="請選擇助教"
            :disabled="!isEditing || isTeacher"
            required
          />
          <AppInput
            v-model="assistant.fee"
            type="number"
            placeholder="助教費用"
            :disabled="!isEditing || isTeacher"
            required
          />
          <AppButton
            v-if="isEditing && !isTeacher"
            type="danger"
            size="sm"
            @click="removeAssistant(index)"
          >
            移除 / Remove
          </AppButton>
        </div>
      </div>
    </div>

    <!-- 操作按鈕 Action Buttons -->
    <template #footer>
      <div class="dialog-footer">
        <AppButton
          v-if="!isTeacher"
          type="danger"
          @click="handleDelete"
        >
          移除 / Delete
        </AppButton>
        <AppButton
          v-if="!isEditing && !isTeacher"
          type="primary"
          @click="startEditing"
        >
          編輯 / Edit
        </AppButton>
        <AppButton
          v-if="isEditing && !isTeacher"
          type="primary"
          @click="handleSubmit"
        >
          確認 / Confirm
        </AppButton>
      </div>
    </template>
  </AppDialog>

  <!-- 刪除確認對話框 Delete Confirmation Dialog -->
  <AppDialog
    :model-value="showDeleteConfirm"
    title="確認刪除 / Confirm Delete"
    size="sm"
    @update:model-value="handleDeleteConfirmChange"
  >
    <div class="delete-confirm-content">
      <template v-if="scheduleData?.series_id">
        <p>這是重複性課程，請選擇刪除方式：</p>
        <p>This is a recurring course, please select deletion method:</p>
      </template>
      <template v-else>
        <p>確定要刪除這個課程嗎？</p>
        <p>Are you sure you want to delete this course?</p>
      </template>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <AppButton
          type="secondary"
          @click="handleDeleteCancel"
        >
          取消 / Cancel
        </AppButton>
        <template v-if="scheduleData?.series_id">
          <AppButton
            type="danger"
            @click="() => handleDeleteConfirm('single')"
          >
            單筆刪除 / Delete Single
          </AppButton>
          <AppButton
            type="danger"
            @click="() => handleDeleteConfirm('series')"
          >
            批量刪除 / Delete All
          </AppButton>
        </template>
        <AppButton
          v-else
          type="danger"
          @click="() => handleDeleteConfirm('single')"
        >
          確認刪除 / Confirm Delete
        </AppButton>
      </div>
    </template>
  </AppDialog>
</template>

<script>
import { defineComponent, ref, reactive, nextTick, onMounted, watch, computed } from 'vue';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { scheduleAPI, courseAPI } from '@/utils/api';
import Message from '@/utils/message';
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
    scheduleData: {
      type: Object,
      default: () => ({})
    }
  },

  emits: ['update:visible', 'close', 'edit', 'save', 'delete'],

  setup(props, { emit }) {
    // 編輯模式狀態 Edit mode state
    const isEditing = ref(false);
    const loading = ref(false);

    // 獲取用戶角色 Get user role
    const userRole = computed(() => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          return userData.role;
        } catch (error) {
          console.error('解析用戶數據失敗:', error);
          return null;
        }
      }
      return null;
    });

    // 是否為老師角色 Is teacher role
    const isTeacher = computed(() => userRole.value === 'teacher');

    // 監聽編輯模式變化，如果是老師角色則禁止編輯
    // Watch editing mode changes, if teacher role then prevent editing
    watch(isEditing, (newValue) => {
      if (newValue && isTeacher.value) {
        isEditing.value = false;
        Message.warning('老師角色無法編輯課程 Teacher role cannot edit courses');
      }
    });

    // 表單數據 Form data
    const formData = ref({
      id: null,
      schoolName: '',
      className: '',
      teacherId: null,
      teacherName: '',
      assistantName: '',
      courseType: '',
      date: null,
      startTime: null,
      endTime: null,
      courseFee: 0,
      teacherFee: 0,
      assistantFee: 0,
      assistants: [] // 初始化助教列表為空數組 Initialize assistants list as empty array
    });

    // 課程種類選項 Course type options
    const courseTypes = ref([]);

    // 緩存標誌 Cache flag
    const hasLoadedCourseTypes = ref(false);

    // 老師列表 Teacher list
    const teachers = ref([]);

    // 助教列表 Assistant list
    const assistants = ref([]);

    // 獲取課程種類 Get course types
    const fetchCourseTypes = async () => {
      // 如果已經加載過，直接返回 If already loaded, return directly
      if (hasLoadedCourseTypes.value) return;
      
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
            value: category.toLowerCase()
          }));
          
          // 設置緩存標誌 Set cache flag
          hasLoadedCourseTypes.value = true;
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

    // 獲取老師列表 Get teacher list
    const fetchTeachers = async () => {
      try {
        loading.value = true;
        const response = await scheduleAPI.getTeachers();
        if (response.success) {
          teachers.value = response.data.map(teacher => ({
            label: `${teacher.name} / Teacher ${teacher.name}`,
            value: teacher.id
          }));
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

    // 獲取助教列表 Get assistant list
    const fetchAssistants = async () => {
      try {
        loading.value = true;
        const response = await scheduleAPI.getAssistants();
        if (response.success) {
          assistants.value = response.data.map(assistant => ({
            label: `${assistant.name} / Assistant ${assistant.name}`,
            value: assistant.id
          }));
        } else {
          Message.error(response.message || '獲取助教列表失敗');
        }
      } catch (error) {
        console.error('獲取助教列表失敗:', error);
        Message.error('獲取助教列表失敗');
      } finally {
        loading.value = false;
      }
    };

    // 組件掛載時獲取課程種類和老師列表 Get course types and teacher list when component is mounted
    onMounted(async () => {
      await fetchCourseTypes();
      if (props.visible) {
        initializeFormData();
      }
    });

    // 初始化表單數據 Initialize form data
    const initializeFormData = () => {
      formData.value = { ...props.scheduleData };
      
      // 如果有助教，添加到助教列表
      formData.value.assistants = [];
      if (props.scheduleData.assistantName) {
        formData.value.assistants.push({
          id: '', // 這裡需要後端提供助教ID
          name: props.scheduleData.assistantName,
          fee: props.scheduleData.assistantFee || 0
        });
      }
    };

    // 處理對話框可見性變化 Handle dialog visibility change
    const handleVisibleChange = (value) => {
      // 如果是關閉操作，且不是由刪除操作觸發的，才執行關閉邏輯
      // Only execute close logic if it's a close operation and not triggered by delete
      if (!value && !isDeleting.value) {
        isEditing.value = false;
      }
      emit('update:visible', value);
    };

    // 刪除狀態標誌 Delete state flag
    const isDeleting = ref(false);

    // 刪除確認對話框狀態 Delete confirmation dialog state
    const showDeleteConfirm = ref(false);

    // 處理刪除確認對話框狀態變化 Handle delete confirmation dialog state change
    const handleDeleteConfirmChange = (value) => {
      if (!value && !isDeleting.value) {
        showDeleteConfirm.value = false;
      }
    };

    // 處理刪除取消 Handle delete cancellation
    const handleDeleteCancel = () => {
      showDeleteConfirm.value = false;
    };

    // 處理刪除確認 Handle delete confirmation
    const handleDeleteConfirm = async (type = 'single') => {
      console.log('[ScheduleDetailDialog] 用戶確認刪除 User confirmed deletion', type);
      // 設置刪除狀態 Set delete state
      isDeleting.value = true;
      // 發送刪除事件，並傳遞刪除類型
      emit('delete', {
        id: props.scheduleData.id,
        type,
        series_id: props.scheduleData.series_id
      });
      console.log('[ScheduleDetailDialog] 發送刪除事件 Emitting delete event');
      // 關閉確認對話框 Close confirmation dialog
      showDeleteConfirm.value = false;
      // 關閉主對話框 Close main dialog
      console.log('[ScheduleDetailDialog] 更新對話框可見性 Updating dialog visibility');
      emit('update:visible', false);
      // 重置刪除狀態 Reset delete state
      setTimeout(() => {
        isDeleting.value = false;
      }, 1000);
    };

    // 處理刪除 Handle deletion
    const handleDelete = () => {
      // 如果是老師角色，不允許刪除 If teacher role, not allowed to delete
      if (isTeacher.value) {
        Message.warning('老師角色無法刪除課程 Teacher role cannot delete courses');
        return;
      }

      // 如果正在刪除中，直接返回 If already deleting, return directly
      if (isDeleting.value) {
        console.log('[ScheduleDetailDialog] 刪除操作正在進行中，忽略重複請求 Delete operation in progress, ignoring duplicate request');
        return;
      }

      console.log('[ScheduleDetailDialog] 開始處理刪除操作 Starting delete operation');
      console.log('[ScheduleDetailDialog] 課程ID Course ID:', props.scheduleData.id);
      
      // 顯示刪除確認對話框 Show delete confirmation dialog
      showDeleteConfirm.value = true;
    };

    // 開始編輯 Start editing
    const startEditing = async () => {
      // 如果是老師角色，不允許編輯 If teacher role, not allowed to edit
      if (isTeacher.value) {
        Message.warning('老師角色無法編輯課程 Teacher role cannot edit courses');
        return;
      }

      // 進入編輯模式時才獲取老師和助教列表
      // Only fetch teachers and assistants list when entering edit mode
      if (teachers.value.length === 0) {
        await Promise.all([
          fetchTeachers(),
          fetchAssistants()
        ]);
      }
      isEditing.value = true;
    };

    // 添加助教 Add assistant
    const addAssistant = async () => {
      const newAssistant = {
        id: '',
        fee: ''
      };
      
      await nextTick();
      formData.value.assistants.push(newAssistant);
    };

    // 移除助教 Remove assistant
    const removeAssistant = (index) => {
      formData.value.assistants.splice(index, 1);
    };

    // 提交表單 Submit form
    const handleSubmit = () => {
      // 獲取選中的老師名稱 Get selected teacher name
      const selectedTeacher = teachers.value.find(t => t.value === formData.value.teacherId);
      const teacherName = selectedTeacher ? selectedTeacher.label.split(' / ')[0] : '';

      // 獲取助教名稱（如果有） Get assistant name (if exists)
      let assistantName = '';
      if (formData.value.assistants.length > 0) {
        const selectedAssistant = assistants.value.find(a => a.value === formData.value.assistants[0].id);
        assistantName = selectedAssistant ? selectedAssistant.label.split(' / ')[0] : '';
      }

      // 創建課程數據 Create course data
      const updatedCourseData = {
        id: formData.value.id,
        courseType: formData.value.courseType,
        schoolName: formData.value.schoolName,
        teacherName: teacherName,
        teacherId: formData.value.teacherId,
        assistantName: assistantName,
        startTime: formData.value.startTime,
        endTime: formData.value.endTime,
        date: formData.value.date,
        className: formData.value.className,
        courseFee: formData.value.courseFee,
        teacherFee: formData.value.teacherFee,
        assistantFee: formData.value.assistants[0]?.fee || ''
      };

      console.log('提交的課程數據 Submitted course data:', updatedCourseData);
      emit('save', updatedCourseData);
      handleClose();
    };

    // 關閉對話框 Close dialog
    const handleClose = () => {
      emit('update:visible', false);
      emit('close');
      isEditing.value = false;
    };

    // 監聽 scheduleData 變化 Watch scheduleData changes
    watch(() => props.scheduleData, (newData) => {
      if (newData) {
        console.log('接收到的課程數據 Received course data:', newData);
        formData.value = {
          id: newData.id,
          schoolName: newData.schoolName || '',
          className: newData.className || '',
          teacherId: newData.teacher?.id,
          teacherName: newData.teacher?.name || '',
          courseType: newData.courseType || '',
          date: newData.date || null,
          startTime: newData.startTime || null,
          endTime: newData.endTime || null,
          courseFee: parseInt(newData.courseFee) || 0,
          teacherFee: parseInt(newData.teacherFee) || 0,
          assistants: newData.assistants?.map(assistant => ({
            id: assistant.assistant_id,
            fee: parseInt(assistant.fee) || 0
          })) || []
        };
        console.log('處理後的表單數據 Processed form data:', formData.value);
      }
    }, { immediate: true, deep: true });

    return {
      isEditing,
      loading,
      formData,
      courseTypes,
      teachers,
      assistants,
      isTeacher,
      handleVisibleChange,
      handleClose,
      startEditing,
      handleSubmit,
      addAssistant,
      removeAssistant,
      handleDelete,
      showDeleteConfirm,
      handleDeleteConfirm,
      handleDeleteCancel,
      handleDeleteConfirmChange
    };
  }
});
</script>

<style lang="scss" scoped>
:deep(.app-dialog-overlay) {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  z-index: 999999 !important;
}

:deep(.app-dialog) {
  position: relative !important;
  z-index: 1000000 !important;
  
  .app-dialog-body {
    position: relative !important;
    z-index: 1000001 !important;
  }
  
  .app-dialog-header {
    position: relative !important;
    z-index: 1000001 !important;
  }
  
  .app-dialog-footer {
    position: relative !important;
    z-index: 1000001 !important;
  }
}

.course-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  position: relative !important;
  z-index: 1000001 !important;

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    align-items: start;
    position: relative !important;
    z-index: 1000001 !important;
  }

  .time-inputs {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    position: relative !important;
    z-index: 1000001 !important;
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

    .section-header {
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
  position: relative !important;
  z-index: 1000001 !important;
}

:deep(.app-select-wrapper) {
  position: relative !important;
  z-index: 1000002 !important;
}

:deep(.app-select) {
  position: relative !important;
  z-index: 1000002 !important;
}

:deep(.select-options) {
  position: relative !important;
  z-index: 1000003 !important;
}

.delete-confirm-content {
  padding: 2rem 0.5rem;  // 減少左右邊距 Reduce left and right padding
  min-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  
  p {
    margin: 0.5rem 0;
    line-height: 1.5;
    text-align: left;
    width: 100%;
    padding-left: 0;  // 移除段落的左邊距 Remove left padding from paragraphs
  }
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  flex-wrap: wrap;
  
  :deep(.app-button) {
    min-width: 120px;
  }
}

@media screen and (max-width: 576px) {
  .delete-confirm-content {
    min-width: 300px;
  }
  
  .dialog-footer {
    flex-direction: column;
    align-items: stretch;
    
    :deep(.app-button) {
      width: 100%;
      margin: 0.5rem 0;
    }
  }
}
</style> 