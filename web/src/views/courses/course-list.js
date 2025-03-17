// 導入依賴 Import dependencies
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Message from '@/utils/message';
import Confirm from '@/utils/confirm';
import { authAPI, courseAPI } from '@/utils/api';

/**
 * 課程列表頁面邏輯 Course list page logic
 * @returns {Object} 課程列表頁面邏輯 Course list page logic
 */
export default {
  setup() {
    // 路由器 Router
    const router = useRouter();
    
    // 用戶信息 User info
    const userName = ref('管理員');
    const isLoggingOut = ref(false);
    
    // 加載狀態 Loading state
    const loading = ref(false);
    const saving = ref(false);
    const deleting = ref(false);
    
    // 搜索查詢 Search query
    const searchQuery = ref('');
    
    // 過濾條件 Filter conditions
    const filters = reactive({
      category: '',
      level: '',
      status: ''
    });
    
    // 課程列表 Course list
    const courses = ref([]);
    
    // 當前選中的課程 Current selected course
    const currentCourse = reactive({
      id: null,
      name: '',
      category: '',
      level: '',
      duration: 60,
      description: '',
      is_active: true
    });
    
    // 課程表單 Course form
    const courseForm = reactive({
      id: null,
      name: '',
      category: '',
      level: '',
      duration: 60,
      description: '',
      is_active: true
    });
    
    // 對話框可見性 Dialog visibility
    const courseDialogVisible = ref(false);
    const deleteDialogVisible = ref(false);
    
    // 編輯模式 Edit mode
    const isEditMode = computed(() => {
      return courseForm.id !== null;
    });
    
    // 表格列定義 Table column definitions
    const columns = [
      { key: 'name', title: '課程名稱', sortable: true },
      { key: 'category', title: '課程類別', sortable: true },
      { key: 'level', title: '課程級別', sortable: true },
      { key: 'duration', title: '課程時長', sortable: true },
      { key: 'status', title: '狀態', width: '100px' },
      { key: 'actions', title: '操作', width: '120px' }
    ];
    
    // 課程類別選項 Course category options
    const categoryOptions = [
      { value: '魔術', label: '魔術' },
      { value: '3D列印筆', label: '3D列印筆' },
      { value: '科學', label: '科學' },
      { value: '機器人', label: '機器人' },
      { value: '程式設計', label: '程式設計' },
      { value: '創意思考', label: '創意思考' },
      { value: '實驗探索', label: '實驗探索' },
      { value: '藝術創作', label: '藝術創作' }
    ];
    
    // 課程級別選項 Course level options
    const levelOptions = [
      { value: '初級', label: '初級' },
      { value: '中級', label: '中級' },
      { value: '高級', label: '高級' }
    ];
    
    // 狀態選項 Status options
    const statusOptions = [
      { value: 'active', label: '啟用' },
      { value: 'inactive', label: '停用' }
    ];
    
    // 過濾後的課程列表 Filtered course list
    const filteredCourses = computed(() => {
      let result = [...courses.value];
      
      // 搜索過濾 Search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(course => 
          course.category && course.category.toLowerCase().includes(query)
        );
      }
      
      // 類別過濾 Category filter
      if (filters.category) {
        result = result.filter(course => course.category === filters.category);
      }
      
      // 狀態過濾 Status filter
      if (filters.status) {
        const isActive = filters.status === 'active';
        result = result.filter(course => course.is_active === isActive);
      }
      
      return result;
    });
    
    // 獲取課程列表 Get course list
    const fetchCourses = async () => {
      try {
        loading.value = true;
        console.log('獲取課程列表 Get course list');
        
        // 調用课程API獲取課程 Call course API to get courses
        const response = await courseAPI.getAllCourses();
        
        if (response.success) {
          courses.value = response.data.map(course => ({
            id: course.dataValues ? course.dataValues.id : course.id,
            category: course.dataValues ? course.dataValues.category : course.category,
            is_active: course.dataValues ? course.dataValues.is_active : course.is_active
          }));
          console.log('獲取課程成功 Get courses successfully:', courses.value);
        } else {
          Message.error(response.message || '獲取課程列表失敗');
        }
        
        loading.value = false;
      } catch (error) {
        console.error('獲取課程列表失敗 Failed to get course list:', error);
        Message.error('獲取課程列表失敗 Failed to get course list');
        loading.value = false;
      }
    };
    
    // 處理搜索 Handle search
    const handleSearch = () => {
      console.log('搜索課程 Search course:', searchQuery.value);
    };
    
    // 應用過濾器 Apply filters
    const applyFilters = () => {
      console.log('應用過濾器 Apply filters:', filters);
    };
    
    // 打開添加課程對話框 Open add course dialog
    const openAddCourseDialog = () => {
      // 重置表單 Reset form
      Object.assign(courseForm, {
        id: null,  // 設置id為null，使isEditMode計算為false
        name: '',
        category: '',
        level: '',
        duration: 60,
        description: '',
        is_active: true
      });
      
      courseDialogVisible.value = true;
    };
    
    // 編輯課程 Edit course
    const editCourse = (course) => {
      // 複製課程數據到表單 Copy course data to form
      Object.assign(courseForm, course);
      // 由於複製了course.id，使isEditMode計算為true
      
      courseDialogVisible.value = true;
    };
    
    // 刪除課程 Delete course
    const deleteCourse = (course) => {
      // 設置當前課程 Set current course
      Object.assign(currentCourse, course);
      
      deleteDialogVisible.value = true;
    };
    
    // 確認刪除課程 Confirm delete course
    const confirmDelete = async () => {
      try {
        deleting.value = true;
        
        const response = await courseAPI.deleteCourse(currentCourse.id);
        
        if (response.success) {
          Message.success('課程刪除成功');
          // 關閉確認對話框 Close confirm dialog
          deleteDialogVisible.value = false;
          // 刷新課程列表 Refresh course list
          await fetchCourses();
        } else {
          Message.error(response.message || '刪除課程失敗');
        }
      } catch (error) {
        console.error('刪除課程失敗 Failed to delete course:', error);
        Message.error('刪除課程失敗');
      } finally {
        deleting.value = false;
      }
    };
    
    // 保存課程 Save course
    const saveCourse = async () => {
      // 檢查課程類別是否為空 Check if course category is empty
      if (!courseForm.category.trim()) {
        Message.error('請輸入課程種類');
        return;
      }
      
      // 如果已經在保存中，直接返回 If already saving, return directly
      if (saving.value) {
        console.log('正在保存中，請勿重複提交 Already saving, please do not submit repeatedly');
        return;
      }
      
      saving.value = true;
      
      try {
        console.log('保存課程 Save course:', courseForm);
        
        let response;
        if (courseForm.id) {
          // 更新現有課程 Update existing course
          response = await courseAPI.updateCourse(courseForm.id, {
            category: courseForm.category,
            is_active: courseForm.is_active
          });
        } else {
          // 添加新課程 Add new course
          response = await courseAPI.createCourse({
            category: courseForm.category,
            is_active: true
          });
        }
        
        if (response.success) {
          Message.success(courseForm.id ? '課程更新成功' : '課程添加成功');
          // 刷新課程列表 Refresh course list
          await fetchCourses();
          // 關閉對話框 Close dialog
          courseDialogVisible.value = false;
        } else {
          Message.error(response.message || '保存課程失敗');
        }
      } catch (error) {
        console.error('保存課程失敗 Failed to save course:', error);
        Message.error('保存課程失敗');
      } finally {
        saving.value = false;
      }
    };
    
    // 切換課程狀態 Toggle course status
    const toggleCourseStatus = async (course) => {
      try {
        loading.value = true;
        console.log('切換課程狀態 Toggle course status:', course.id);
        
        // 調用API切換課程狀態 Call API to toggle course status
        const response = await courseAPI.toggleCourseStatus(course.id);
        
        if (response.success) {
          // 更新前端課程狀態 Update frontend course status
          course.is_active = response.data.is_active;
          Message.success('課程狀態已更新');
        } else {
          Message.error(response.message || '切換課程狀態失敗');
        }
      } catch (error) {
        console.error('切換課程狀態失敗 Failed to toggle course status:', error);
        Message.error('切換課程狀態失敗');
      } finally {
        loading.value = false;
      }
    };
    
    // 處理登出 Handle logout
    const handleLogout = async () => {
      try {
        isLoggingOut.value = true;
        console.log('登出中... Logging out...');
        
        // 調用登出 API Call logout API
        await authAPI.logout();
        
        // API 調用成功後，清除身份驗證狀態 After successful API call, clear authentication state
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        
        // 導航到登入頁面 Navigate to login page
        router.push('/login');
      } catch (error) {
        console.error('登出失敗 Logout failed:', error);
        Message.error('登出失敗 Logout failed');
        isLoggingOut.value = false;
      }
    };
    
    // 獲取級別狀態 Get level status
    const getLevelStatus = (level) => {
      switch (level) {
        case '初級':
          return 'success';
        case '中級':
          return 'warning';
        case '高級':
          return 'danger';
        default:
          return 'default';
      }
    };
    
    // 獲取卡片顏色類名 Get card color class name
    const getCardColorClass = (category) => {
      switch (category) {
        case '魔術':
          return 'card-magic';
        case '3D列印筆':
          return 'card-3d-pen';
        case '科學':
          return 'card-science';
        case '機器人':
          return 'card-robot';
        case '程式設計':
          return 'card-programming';
        case '創意思考':
          return 'card-creative';
        case '實驗探索':
          return 'card-experiment';
        case '藝術創作':
          return 'card-art';
        default:
          return 'card-default';
      }
    };
    
    // 組件掛載時獲取課程列表 Get course list when component is mounted
    onMounted(() => {
      fetchCourses();
    });
    
    return {
      userName,
      isLoggingOut,
      loading,
      saving,
      deleting,
      searchQuery,
      filters,
      courses,
      currentCourse,
      courseForm,
      courseDialogVisible,
      deleteDialogVisible,
      isEditMode,
      columns,
      categoryOptions,
      levelOptions,
      statusOptions,
      filteredCourses,
      handleSearch,
      applyFilters,
      openAddCourseDialog,
      editCourse,
      deleteCourse,
      confirmDelete,
      saveCourse,
      toggleCourseStatus,
      handleLogout,
      getLevelStatus,
      getCardColorClass
    };
  }
}; 