// 導入依賴 Import dependencies
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Message from '@/utils/message';
import Confirm from '@/utils/confirm';
import { authAPI, courseAPI } from '@/utils/api';

// 生成隨機漸層色 Generate random gradient color
const getRandomGradient = (category) => {
  // 預設漸層色組合 Default gradient color combinations
  const gradients = [
    ['#FF6B6B', '#4ECDC4'], // 紅綠漸層 Red-green gradient
    ['#A8E6CF', '#FFD3B6'], // 薄荷綠橙色漸層 Mint-orange gradient
    ['#79DAE8', '#E8A0BF'], // 天藍粉紅漸層 Sky blue-pink gradient
    ['#FFC75F', '#FF9EAA'], // 橙粉漸層 Orange-pink gradient
    ['#B8F2E6', '#FFA69E'], // 薄荷綠珊瑚色漸層 Mint-coral gradient
    ['#AED6F1', '#F5B7B1'], // 淺藍粉紅漸層 Light blue-pink gradient
    ['#F1948A', '#BB8FCE'], // 珊瑚紫漸層 Coral-purple gradient
    ['#F8C471', '#E59866']  // 金橙漸層 Gold-orange gradient
  ];
  
  // 根據課程類別名稱生成一個固定的索引，這樣同一個類別會有相同的顏色
  // Generate a fixed index based on category name so the same category will have the same color
  const index = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length;
  
  return `linear-gradient(135deg, ${gradients[index][0]} 0%, ${gradients[index][1]} 100%)`;
};

/**
 * 課程列表頁面邏輯 Course list page logic
 * @returns {Object} 課程列表頁面邏輯 Course list page logic
 */
export default {
  setup() {
    // 路由器 Router
    const router = useRouter();
    
    // 用戶信息 User info
    const userName = ref(JSON.parse(localStorage.getItem('user'))?.name || '管理員');
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
      console.log('計算過濾後的課程列表 Calculate filtered course list:', {
        searchQuery: searchQuery.value,
        filters: filters,
        totalCourses: courses.value.length
      });
      
      let result = [...courses.value];
      
      // 搜索過濾 Search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(course => 
          course.category && course.category.toLowerCase().includes(query)
        );
        console.log('搜索過濾結果 Search filter results:', {
          query,
          filteredCount: result.length
        });
      }
      
      // 類別過濾 Category filter
      if (filters.category) {
        result = result.filter(course => course.category === filters.category);
        console.log('類別過濾結果 Category filter results:', {
          category: filters.category,
          filteredCount: result.length
        });
      }
      
      // 狀態過濾 Status filter
      if (filters.status) {
        const isActive = filters.status === 'active';
        result = result.filter(course => course.is_active === isActive);
        console.log('狀態過濾結果 Status filter results:', {
          status: filters.status,
          filteredCount: result.length
        });
      }
      
      // 為每個課程添加漸層色 Add gradient color for each course
      result = result.map(course => ({
        ...course,
        gradient: getRandomGradient(course.category)
      }));
      
      return result;
    });
    
    // 獲取課程列表 Get course list
    const fetchCourses = async () => {
      try {
        loading.value = true;
        console.log('開始獲取課程列表 Start getting course list');
        
        // 調用课程API獲取課程 Call course API to get courses
        const response = await courseAPI.getAllCourses();
        
        if (response.success) {
          courses.value = response.data.map(course => ({
            id: course.dataValues ? course.dataValues.id : course.id,
            category: course.dataValues ? course.dataValues.category : course.category,
            is_active: course.dataValues ? course.dataValues.is_active : course.is_active
          }));
          console.log('成功獲取課程列表 Successfully got course list:', {
            totalCourses: courses.value.length,
            courses: courses.value.map(course => ({
              id: course.id,
              category: course.category,
              is_active: course.is_active
            }))
          });
        } else {
          console.error('獲取課程列表失敗 Failed to get course list:', {
            response: response,
            message: response.message
          });
          Message.error(response.message || '獲取課程列表失敗');
        }
        
        loading.value = false;
      } catch (error) {
        console.error('獲取課程列表失敗 Failed to get course list:', {
          error: error.message,
          stack: error.stack,
          name: error.name
        });
        Message.error('獲取課程列表失敗 Failed to get course list');
        loading.value = false;
      }
    };
    
    // 處理搜索 Handle search
    const handleSearch = () => {
      console.log('處理搜索請求 Handle search request:', {
        searchQuery: searchQuery.value,
        timestamp: new Date().toISOString()
      });
    };
    
    // 應用過濾器 Apply filters
    const applyFilters = () => {
      console.log('應用過濾器 Apply filters:', {
        filters: filters,
        timestamp: new Date().toISOString()
      });
    };
    
    // 打開添加課程對話框 Open add course dialog
    const openAddCourseDialog = () => {
      console.log('打開添加課程對話框 Open add course dialog');
      
      // 重置表單 Reset form
      Object.assign(courseForm, {
        id: null,
        name: '',
        category: '',
        level: '',
        duration: 60,
        description: '',
        is_active: true
      });
      
      courseDialogVisible.value = true;
      console.log('課程表單已重置 Course form has been reset:', courseForm);
    };
    
    // 編輯課程 Edit course
    const editCourse = (course) => {
      console.log('開始編輯課程 Start editing course:', {
        courseId: course.id,
        courseCategory: course.category,
        isActive: course.is_active
      });
      
      // 複製課程數據到表單 Copy course data to form
      Object.assign(courseForm, course);
      
      courseDialogVisible.value = true;
      console.log('課程表單已更新 Course form has been updated:', courseForm);
    };
    
    // 刪除課程 Delete course
    const deleteCourse = (course) => {
      console.log('準備刪除課程 Prepare to delete course:', {
        courseId: course.id,
        courseCategory: course.category,
        isActive: course.is_active
      });
      
      // 設置當前課程 Set current course
      Object.assign(currentCourse, course);
      
      deleteDialogVisible.value = true;
      console.log('刪除確認對話框已打開 Delete confirmation dialog opened');
    };
    
    // 確認刪除課程 Confirm delete course
    const confirmDelete = async () => {
      // 如果已經在刪除中，直接返回 If already deleting, return directly
      if (deleting.value) {
        console.log('正在刪除中，請勿重複提交 Already deleting, please do not submit repeatedly');
        return;
      }

      try {
        deleting.value = true;
        console.log('開始刪除課程 Start deleting course:', {
          courseId: currentCourse.id,
          courseCategory: currentCourse.category,
          timestamp: new Date().toISOString()
        });
        
        const response = await courseAPI.deleteCourse(currentCourse.id);
        
        if (response.success) {
          console.log('課程刪除成功 Course deleted successfully:', {
            courseId: currentCourse.id,
            response: response,
            timestamp: new Date().toISOString()
          });
          Message.success('課程刪除成功');
          // 關閉確認對話框 Close confirm dialog
          deleteDialogVisible.value = false;
          // 重置當前課程 Reset current course
          Object.assign(currentCourse, {
            id: null,
            name: '',
            category: '',
            level: '',
            duration: 60,
            description: '',
            is_active: true
          });
          // 刷新課程列表 Refresh course list
          await fetchCourses();
        } else {
          console.error('課程刪除失敗 Course deletion failed:', {
            courseId: currentCourse.id,
            response: response,
            message: response.message,
            timestamp: new Date().toISOString()
          });
          Message.error(response.message || '刪除課程失敗');
          // 關閉確認對話框 Close confirm dialog
          deleteDialogVisible.value = false;
        }
      } catch (error) {
        console.error('刪除課程失敗 Failed to delete course:', {
          error: error.message,
          stack: error.stack,
          name: error.name,
          courseId: currentCourse.id,
          timestamp: new Date().toISOString()
        });
        Message.error('刪除課程失敗');
        // 關閉確認對話框 Close confirm dialog
        deleteDialogVisible.value = false;
      } finally {
        deleting.value = false;
      }
    };
    
    // 保存課程 Save course
    const saveCourse = async () => {
      console.log('開始保存課程 Start saving course:', {
        courseForm: courseForm,
        isEditMode: isEditMode.value
      });
      
      // 檢查課程類別是否為空 Check if course category is empty
      if (!courseForm.category.trim()) {
        console.warn('課程類別為空 Course category is empty');
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
        let response;
        if (courseForm.id) {
          // 更新現有課程 Update existing course
          console.log('更新現有課程 Update existing course:', {
            courseId: courseForm.id,
            category: courseForm.category,
            isActive: courseForm.is_active
          });
          
          response = await courseAPI.updateCourse(courseForm.id, {
            category: courseForm.category,
            is_active: courseForm.is_active
          });
        } else {
          // 創建新課程 Create new course
          console.log('創建新課程 Create new course:', {
            category: courseForm.category,
            isActive: courseForm.is_active
          });
          
          response = await courseAPI.createCourse({
            category: courseForm.category,
            is_active: courseForm.is_active
          });
        }
        
        if (response.success) {
          console.log('課程保存成功 Course saved successfully:', {
            response: response,
            courseForm: courseForm
          });
          Message.success('課程保存成功');
          courseDialogVisible.value = false;
          await fetchCourses();
        } else {
          console.error('課程保存失敗 Course save failed:', {
            response: response,
            message: response.message,
            courseForm: courseForm
          });
          Message.error(response.message || '保存課程失敗');
        }
      } catch (error) {
        console.error('保存課程失敗 Failed to save course:', {
          error: error.message,
          stack: error.stack,
          name: error.name,
          courseForm: courseForm
        });
        Message.error('保存課程失敗');
      } finally {
        saving.value = false;
      }
    };
    
    // 切換課程狀態 Toggle course status
    const toggleCourseStatus = async (course) => {
      try {
        console.log('開始切換課程狀態 Start toggling course status:', {
          courseId: course.id,
          currentStatus: course.is_active,
          newStatus: !course.is_active
        });
        
        const response = await courseAPI.updateCourse(course.id, {
          is_active: !course.is_active
        });
        
        if (response.success) {
          console.log('課程狀態切換成功 Course status toggled successfully:', {
            courseId: course.id,
            newStatus: !course.is_active,
            response: response
          });
          Message.success('課程狀態更新成功');
          await fetchCourses();
        } else {
          console.error('課程狀態切換失敗 Course status toggle failed:', {
            courseId: course.id,
            response: response,
            message: response.message
          });
          Message.error(response.message || '更新課程狀態失敗');
        }
      } catch (error) {
        console.error('切換課程狀態失敗 Failed to toggle course status:', {
          error: error.message,
          stack: error.stack,
          name: error.name,
          courseId: course.id
        });
        Message.error('更新課程狀態失敗');
      }
    };
    
    // 處理登出 Handle logout
    const handleLogout = async () => {
      try {
        isLoggingOut.value = true;
        console.log('開始登出流程 Start logout process');
        
        const response = await authAPI.logout();
        console.log('登出響應 Logout response:', response);
        
        // 清除本地存儲 Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('companyCode');
        
        // 重定向到登入頁面 Redirect to login page
        router.push('/login');
        
        if (response.success) {
          console.log('登出成功 Logout successful:', response.message);
          Message.success(response.message || '登出成功');
        }
      } catch (error) {
        console.error('登出失敗 Failed to logout:', {
          error: error.message,
          stack: error.stack,
          name: error.name
        });
        Message.error('登出失敗');
      } finally {
        isLoggingOut.value = false;
      }
    };
    
    // 獲取課程級別狀態 Get course level status
    const getLevelStatus = (level) => {
      console.log('獲取課程級別狀態 Get course level status:', { level });
      return level === '高級' ? 'success' : level === '中級' ? 'warning' : 'info';
    };
    
    // 獲取卡片顏色類別 Get card color class
    const getCardColorClass = (category) => {
      console.log('獲取卡片顏色類別 Get card color class:', { category });
      const colorMap = {
        '魔術': 'primary',
        '3D列印筆': 'success',
        '科學': 'info',
        '機器人': 'warning',
        '程式設計': 'danger',
        '創意思考': 'secondary',
        '實驗探索': 'dark',
        '藝術創作': 'light'
      };
      return colorMap[category] || 'default';
    };
    
    // 組件掛載時獲取課程列表 Get course list when component is mounted
    onMounted(() => {
      console.log('組件已掛載，開始獲取課程列表 Component mounted, start getting course list');
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