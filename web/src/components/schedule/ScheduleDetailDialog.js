import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { scheduleAPI, courseAPI } from '@/utils/api';
import Message from '@/utils/message';

// 導出默認配置對象 Export default configuration object
export default {
  name: 'ScheduleDetailDialog',

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
    const originalData = ref(null);

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
      assistants: []
    });

    // 課程種類選項 Course type options
    const courseTypes = ref([]);
    const hasLoadedCourseTypes = ref(false);
    const teachers = ref([]);
    const assistants = ref([]);

    // 獲取課程種類 Get course types
    const fetchCourseTypes = async () => {
      if (hasLoadedCourseTypes.value) return;
      
      try {
        loading.value = true;
        const response = await courseAPI.getAllCourses();
        
        if (response.success) {
          const categories = [...new Set(response.data.map(course => {
            const courseData = course.dataValues || course;
            return courseData.category;
          }))];
          
          courseTypes.value = categories.map(category => ({
            label: `${category} / ${category}`,
            value: category.toLowerCase()
          }));
          
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

    // 組件掛載時獲取課程種類和老師列表
    onMounted(async () => {
      await fetchCourseTypes();
      if (props.visible) {
        initializeFormData();
      }
    });

    // 初始化表單數據 Initialize form data
    const initializeFormData = () => {
      formData.value = { ...props.scheduleData };
      
      formData.value.assistants = [];
      if (props.scheduleData.assistantName) {
        formData.value.assistants.push({
          id: '',
          name: props.scheduleData.assistantName,
          fee: props.scheduleData.assistantFee || 0
        });
      }
    };

    // 處理對話框可見性變化 Handle dialog visibility change
    const handleVisibleChange = (value) => {
      if (!value && !isDeleting.value) {
        isEditing.value = false;
      }
      emit('update:visible', value);
    };

    // 刪除相關狀態和處理函數 Delete related states and handlers
    const isDeleting = ref(false);
    const showDeleteConfirm = ref(false);

    const handleDeleteConfirmChange = (value) => {
      if (!value && !isDeleting.value) {
        showDeleteConfirm.value = false;
      }
    };

    const handleDeleteCancel = () => {
      showDeleteConfirm.value = false;
    };

    const handleDeleteConfirm = async (type = 'single') => {
      console.log('[ScheduleDetailDialog] 用戶確認刪除 User confirmed deletion', type);
      isDeleting.value = true;
      
      emit('delete', {
        id: props.scheduleData.id,
        type,
        series_id: props.scheduleData.series_id
      });
      
      showDeleteConfirm.value = false;
      emit('update:visible', false);
      
      setTimeout(() => {
        isDeleting.value = false;
      }, 1000);
    };

    const handleDelete = () => {
      if (isTeacher.value) {
        Message.warning('老師角色無法刪除課程 Teacher role cannot delete courses');
        return;
      }

      if (isDeleting.value) {
        console.log('[ScheduleDetailDialog] 刪除操作正在進行中，忽略重複請求');
        return;
      }

      console.log('[ScheduleDetailDialog] 開始處理刪除操作');
      console.log('[ScheduleDetailDialog] 課程ID:', props.scheduleData.id);
      
      showDeleteConfirm.value = true;
    };

    // 編輯相關函數 Edit related functions
    const startEditing = async () => {
      if (isTeacher.value) {
        Message.warning('老師角色無法編輯課程 Teacher role cannot edit courses');
        return;
      }

      if (teachers.value.length === 0) {
        await Promise.all([
          fetchTeachers(),
          fetchAssistants()
        ]);
      }
      isEditing.value = true;
    };

    // 助教相關函數 Assistant related functions
    const addAssistant = async () => {
      const newAssistant = {
        id: '',
        fee: ''
      };
      
      await nextTick();
      formData.value.assistants.push(newAssistant);
    };

    const removeAssistant = (index) => {
      formData.value.assistants.splice(index, 1);
    };

    // 批量更新相關狀態和函數 Batch update related states and functions
    const showBatchUpdateConfirm = ref(false);

    const handleBatchUpdateConfirmChange = (value) => {
      if (!value) {
        showBatchUpdateConfirm.value = false;
      }
    };

    const handleBatchUpdateCancel = () => {
      showBatchUpdateConfirm.value = false;
    };

    const handleBatchUpdateConfirm = async (type = 'single') => {
      console.log('[ScheduleDetailDialog] 用戶確認批量修改', type);
      
      const selectedTeacher = teachers.value.find(t => t.value === formData.value.teacherId);
      const teacherName = selectedTeacher ? selectedTeacher.label.split(' / ')[0] : '';

      let assistantName = '';
      if (formData.value.assistants.length > 0) {
        const selectedAssistant = assistants.value.find(a => a.value === formData.value.assistants[0].id);
        assistantName = selectedAssistant ? selectedAssistant.label.split(' / ')[0] : '';
      }

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
        assistantFee: formData.value.assistants[0]?.fee || '',
        updateType: type,
        series_id: props.scheduleData.series_id
      };

      console.log('提交的課程數據:', updatedCourseData);
      emit('save', updatedCourseData);
      
      showBatchUpdateConfirm.value = false;
      emit('update:visible', false);
    };

    // 檢查是否只修改了日期 Check if only date is changed
    const isDateChanged = () => {
      const originalData = props.scheduleData;
      const currentData = formData.value;
      
      console.log('原始數據:', originalData);
      console.log('當前數據:', currentData);
      
      const isOnlyDateChanged = (
        originalData.schoolName === currentData.schoolName &&
        originalData.className === currentData.className &&
        originalData.teacherId === currentData.teacherId &&
        originalData.courseType === currentData.courseType &&
        originalData.startTime === currentData.startTime &&
        originalData.endTime === currentData.endTime &&
        originalData.courseFee === currentData.courseFee &&
        originalData.teacherFee === currentData.teacherFee &&
        originalData.assistantFee === currentData.assistantFee &&
        originalData.date !== currentData.date
      );
      
      console.log('是否只修改了日期:', isOnlyDateChanged);
      console.log('日期比較:', {
        originalDate: originalData.date,
        currentDate: currentData.date,
        isDifferent: originalData.date !== currentData.date
      });
      
      return isOnlyDateChanged;
    };

    // 提交處理函數 Submit handler
    const handleSubmit = () => {
      console.log('開始處理提交');
      console.log('課程數據:', {
        hasSeriesId: !!props.scheduleData?.series_id,
        isDateOnlyChanged: isDateChanged()
      });
      
      if (props.scheduleData?.series_id && !isDateChanged()) {
        console.log('顯示批量修改確認對話框');
        showBatchUpdateConfirm.value = true;
        return;
      }
      
      console.log('直接提交更新');
      
      const selectedTeacher = teachers.value.find(t => t.value === formData.value.teacherId);
      const teacherName = selectedTeacher ? selectedTeacher.label.split(' / ')[0] : '';

      let assistantName = '';
      if (formData.value.assistants.length > 0) {
        const selectedAssistant = assistants.value.find(a => a.value === formData.value.assistants[0].id);
        assistantName = selectedAssistant ? selectedAssistant.label.split(' / ')[0] : '';
      }

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
        assistantFee: formData.value.assistants[0]?.fee || '',
        updateType: 'single'
      };

      console.log('提交的課程數據:', updatedCourseData);
      emit('save', updatedCourseData);
      handleClose();
    };

    // 關閉對話框 Close dialog
    const handleClose = () => {
      emit('update:visible', false);
      emit('close');
      isEditing.value = false;
    };

    // 監聽數據變化 Watch data changes
    watch(
      () => props.scheduleData,
      (newData) => {
        if (newData) {
          console.log('接收到的原始課程數據:', newData);
          
          formData.value = {
            schoolName: newData.schoolName || '',
            className: newData.className || '',
            courseType: newData.courseType || '',
            date: newData.date || '',
            startTime: newData.startTime || '',
            endTime: newData.endTime || '',
            courseFee: newData.courseFee || 0,
            teacherFee: newData.teacherFee || 0,
            assistantFee: newData.assistantFee || 0,
            teacherId: newData.teacherId,
            teacherName: newData.teacherId === null ? '待訂 / Pending' : newData.teacherName || '',
            assistantName: newData.assistantName || '',
            teacher: newData.teacher || null,
            assistants: newData.assistants || []
          };
          
          originalData.value = { ...formData.value };
          console.log('設置後的表單數據:', formData.value);
          console.log('保存的原始數據:', originalData.value);
        }
      },
      { immediate: true }
    );

    return {
      isEditing,
      loading,
      formData,
      originalData,
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
      handleDeleteConfirmChange,
      showBatchUpdateConfirm,
      handleBatchUpdateConfirm,
      handleBatchUpdateCancel,
      handleBatchUpdateConfirmChange
    };
  }
}; 