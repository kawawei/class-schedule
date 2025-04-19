import { ref, computed, watch, nextTick, onMounted, reactive } from 'vue';
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

  emits: ['update:visible', 'close', 'edit', 'save', 'delete', 'updated'],

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
    const formData = reactive({
      id: null,
      courseType: '',
      schoolName: '',
      className: '',
      teacherId: null,
      teacherName: '',
      assistantName: '',
      startTime: '',
      endTime: '',
      date: '',
      courseFee: '0',
      teacherFee: '0',
      assistantFee: '0',
      county: '',  // 添加縣市欄位 Add county field
      district: '',  // 添加區域欄位 Add district field
      notes: '',  // 添加備註欄位 Add notes field
      assistants: [],
      series_id: null
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
      if (props.scheduleData) {
        // 直接設置 reactive 對象的屬性 Directly set properties of reactive object
        formData.id = props.scheduleData.id;
        formData.county = props.scheduleData.county || '';
        formData.district = props.scheduleData.district || '';
        formData.schoolName = props.scheduleData.schoolName || '';
        formData.className = props.scheduleData.className || '';
        formData.teacherId = props.scheduleData.teacherId || null;
        formData.teacherName = props.scheduleData.teacherName || '';
        formData.courseType = props.scheduleData.courseType || '';
        formData.date = props.scheduleData.date || '';
        formData.startTime = props.scheduleData.startTime || '';
        formData.endTime = props.scheduleData.endTime || '';
        formData.courseFee = props.scheduleData.courseFee || 0;
        formData.teacherFee = props.scheduleData.teacherFee || 0;
        formData.notes = props.scheduleData.notes || '';
        formData.assistants = props.scheduleData.assistants || [];
        
        console.log('初始化表單數據:', {
          county: formData.county,
          district: formData.district,
          // 其他字段...
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
      formData.assistants.push(newAssistant);
    };

    const removeAssistant = (index) => {
      formData.assistants.splice(index, 1);
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
      
      const selectedTeacher = teachers.value.find(t => t.value === formData.teacherId);
      const teacherName = selectedTeacher ? selectedTeacher.label.split(' / ')[0] : '';

      let assistantName = '';
      if (formData.assistants.length > 0) {
        const selectedAssistant = assistants.value.find(a => a.value === formData.assistants[0].id);
        assistantName = selectedAssistant ? selectedAssistant.label.split(' / ')[0] : '';
      }

      const updateData = {
        id: formData.id,
        school_name: formData.schoolName.trim(),
        class_name: formData.className.trim(),
        course_type: formData.courseType,
        teacher_id: formData.teacherId,
        date: formData.date,
        start_time: formData.startTime,
        end_time: formData.endTime,
        course_fee: formData.courseFee ? Number(formData.courseFee) : null,
        teacher_fee: formData.teacherFee ? Number(formData.teacherFee) : null,
        county: formData.county?.trim() || null,
        district: formData.district?.trim() || null,
        notes: formData.notes?.trim() || null,
        assistants: formData.assistants.map(assistant => ({
          id: assistant.id,
          assistant_id: assistant.assistant_id,
          fee: Number(assistant.fee) || 0
        })),
        updateType: type,
        series_id: props.scheduleData.series_id
      };

      console.log('提交的課程數據:', updateData);
      emit('save', updateData);
      
      showBatchUpdateConfirm.value = false;
      emit('update:visible', false);
    };

    // 檢查是否只修改了日期 Check if only date is changed
    const isDateChanged = () => {
      const originalData = props.scheduleData;
      const currentData = formData;
      
      console.log('原始數據:', originalData);
      console.log('當前數據:', currentData);
      
      // 檢查日期是否有變更 Check if date has changed
      const dateChanged = originalData.date !== currentData.date;
      
      console.log('日期比較:', {
        originalDate: originalData.date,
        currentDate: currentData.date,
        isDifferent: dateChanged
      });
      
      return dateChanged;
    };

    // 處理提交 Handle submit
    const handleSubmit = async () => {
      try {
        // 驗證必填欄位 Validate required fields
        if (!formData.schoolName.trim()) {
          Message.error('請輸入學校名稱 Please enter school name');
          return;
        }
        if (!formData.className.trim()) {
          Message.error('請輸入班級名稱 Please enter class name');
          return;
        }
        if (!formData.date) {
          Message.error('請選擇日期 Please select date');
          return;
        }
        if (!formData.startTime) {
          Message.error('請選擇開始時間 Please select start time');
          return;
        }
        if (!formData.endTime) {
          Message.error('請選擇結束時間 Please select end time');
          return;
        }

        // 準備更新數據 Prepare update data
        const updateData = {
          school_name: formData.schoolName.trim(),
          class_name: formData.className.trim(),
          course_type: formData.courseType,
          teacher_id: formData.teacherId,
          date: formData.date,
          start_time: formData.startTime,
          end_time: formData.endTime,
          course_fee: formData.courseFee ? Number(formData.courseFee) : null,
          teacher_fee: formData.teacherFee ? Number(formData.teacherFee) : null,
          county: formData.county?.trim() || null,
          district: formData.district?.trim() || null,
          notes: formData.notes?.trim() || null,
          assistants: formData.assistants.map(assistant => ({
            id: assistant.id,
            assistant_id: assistant.assistant_id,
            fee: Number(assistant.fee) || 0
          }))
        };

        console.log('準備更新的數據:', updateData);

        // 檢查是否為重複性課程 Check if it's a recurring course
        if (props.scheduleData?.series_id) {
          console.log('這是重複性課程，series_id:', props.scheduleData.series_id);
          
          // 如果日期有變更，顯示確認對話框 If date has changed, show confirmation dialog
          if (isDateChanged()) {
            console.log('日期已變更，顯示批量更新確認');
            showBatchUpdateConfirm.value = true;
            return;
          }
          
          // 如果其他欄位有變更，也顯示確認對話框
          // If other fields have changed, also show confirmation dialog
          showBatchUpdateConfirm.value = true;
          return;
        }

        // 如果不是重複性課程，直接更新 If not a recurring course, update directly
        const response = await scheduleAPI.updateSchedule(formData.id, updateData);
        console.log('更新成功:', response);

        if (response.success) {
          Message.success('課程更新成功 Course updated successfully');
          emit('updated', response.data);
          emit('update:visible', false);
        } else {
          Message.error(response.message || '更新失敗 Update failed');
        }
      } catch (error) {
        console.error('更新課程失敗:', error);
        Message.error('更新課程失敗 Failed to update course');
      }
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
          console.log('接收到的課程數據:', {
            id: newData.id,
            schoolName: newData.schoolName,
            className: newData.className,
            county: newData.county,
            district: newData.district,
            notes: newData.notes
          });
          
          // 更新表單數據
          formData.id = newData.id;
          formData.courseType = newData.courseType || '';
          formData.schoolName = newData.schoolName || '';
          formData.className = newData.className || '';
          formData.teacherId = newData.teacherId;
          formData.teacherName = newData.teacherId === null ? '待訂 / Pending' : newData.teacherName || '';
          formData.assistantName = newData.assistantName || '';
          formData.startTime = newData.startTime || '';
          formData.endTime = newData.endTime || '';
          formData.date = newData.date || '';
          formData.courseFee = newData.courseFee || '0';
          formData.teacherFee = newData.teacherFee || '0';
          formData.assistantFee = newData.assistantFee || '0';
          formData.county = newData.county || '';
          formData.district = newData.district || '';
          formData.notes = newData.notes || '';
          formData.assistants = Array.isArray(newData.assistants) ? newData.assistants : [];
          formData.series_id = newData.series_id || null;

          console.log('更新後的表單數據:', {
            schoolName: formData.schoolName,
            className: formData.className,
            county: formData.county,
            district: formData.district,
            notes: formData.notes
          });
        }
      },
      { immediate: true, deep: true }
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