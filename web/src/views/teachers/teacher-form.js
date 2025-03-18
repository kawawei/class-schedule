// 導入依賴 Import dependencies
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { teacherAPI, authAPI, courseAPI } from '@/utils/api';
import Message from '@/utils/message';

/**
 * 老師表單頁面邏輯 Teacher form page logic
 * @returns {Object} 老師表單頁面邏輯 Teacher form page logic
 */
export default {
  setup() {
    // 路由器和路由 Router and route
    const router = useRouter();
    const route = useRoute();
    
    // 用戶信息 User info
    const userName = ref(JSON.parse(localStorage.getItem('user'))?.name || '管理員');
    const isLoggingOut = ref(false);
    
    // 加載狀態 Loading state
    const loading = ref(false);
    
    // 編輯模式 Edit mode
    const isEditMode = computed(() => {
      return route.params.id !== undefined && route.name !== 'NewTeacher';
    });
    
    // 老師數據 Teacher data
    const teacher = reactive({
      id: null,
      name: '',
      email: '',
      phone: '',
      line_id: '',
      county: '',
      district: '',
      address: '',
      teaching_categories: [],
      level: '',
      years_of_experience: 0,
      specialty: '',
      hourly_rate: 0,
      emergency_contact_name: '',
      emergency_contact_relation: '',
      emergency_contact_phone: '',
      notes: '',
      is_active: true
    });
    
    // 教學種類選項 Teaching category options
    const categoryOptions = ref([]);
    
    // 獲取課程類別 Get course categories
    const fetchCourseCategories = async () => {
      try {
        loading.value = true;
        console.log('獲取課程類別 Get course categories');
        
        // 調用課程API獲取課程列表 Call course API to get course list
        const response = await courseAPI.getAllCourses();
        
        if (response.success) {
          // 從課程列表中提取不重複的類別 Extract unique categories from course list
          const categories = [...new Set(response.data.map(course => 
            course.dataValues ? course.dataValues.category : course.category
          ))];
          
          // 轉換為選項格式 Convert to options format
          categoryOptions.value = categories.map(category => ({
            value: category,
            label: category
          }));
          
          console.log('獲取課程類別成功 Get course categories successfully:', categoryOptions.value);
        } else {
          Message.error(response.message || '獲取課程類別失敗');
        }
        
        loading.value = false;
      } catch (error) {
        console.error('獲取課程類別失敗 Failed to get course categories:', error);
        Message.error('獲取課程類別失敗');
        loading.value = false;
      }
    };
    
    // 縣市選項 County options
    const countyOptions = [
      { value: '台北市', label: '台北市' },
      { value: '新北市', label: '新北市' }
    ];
    
    // 區域選項 District options
    const districtOptions = ref([]);
    
    // 等級選項 Level options
    const levelOptions = [
      { value: '初級', label: '初級' },
      { value: '中級', label: '中級' },
      { value: '高級', label: '高級' }
    ];
    
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
    
    // 處理縣市變更 Handle county change
    const handleCountyChange = () => {
      teacher.district = '';
      districtOptions.value = countyDistrictMap[teacher.county] || [];
    };
    
    // 獲取老師數據 Get teacher data
    const fetchTeacher = async (id) => {
      try {
        // 檢查 ID 是否有效 Check if ID is valid
        if (!id) {
          console.error('無效的老師 ID Invalid teacher ID');
          Message.error('無效的老師 ID Invalid teacher ID');
          router.push('/teachers');
          return;
        }
        
        // 檢查認證狀態 Check authentication status
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        const token = localStorage.getItem('token');
        
        if (!isAuthenticated || !token) {
          console.log('未認證，重定向到登入頁面 Not authenticated, redirecting to login page');
          router.push('/login');
          return;
        }
        
        loading.value = true;
        console.log('獲取老師數據 Get teacher data:', id);
        
        // 從API獲取老師數據 Fetch teacher data from API
        const response = await teacherAPI.getTeacher(id);
        console.log('API響應 API response:', response);
        
        if (response && response.success) {
          // 處理 Sequelize 模型數據，提取 dataValues 屬性
          // Process Sequelize model data, extract dataValues property
          const processedData = response.data && response.data.dataValues ? response.data.dataValues : response.data;
          
          // 檢查數據是否為空 Check if data is empty
          if (!processedData || Object.keys(processedData).length === 0) {
            console.error('獲取到的老師數據為空 Teacher data is empty');
            Message.error('獲取到的老師數據為空 Teacher data is empty');
            router.push('/teachers');
            return;
          }
          
          // 更新老師數據 Update teacher data
          Object.assign(teacher, processedData);
          
          // 更新區域選項 Update district options
          if (teacher.county) {
            districtOptions.value = countyDistrictMap[teacher.county] || [];
          }
          
          console.log('老師數據獲取成功 Teacher data fetched successfully:', teacher);
        } else {
          const errorMessage = response?.message || '獲取老師數據失敗 Failed to fetch teacher data';
          console.error('獲取老師數據失敗 Failed to fetch teacher data:', errorMessage);
          Message.error(errorMessage);
          router.push('/teachers');
        }
        
        loading.value = false;
      } catch (error) {
        console.error('獲取老師數據失敗 Failed to fetch teacher data:', error);
        Message.error('獲取老師數據失敗 Failed to fetch teacher data');
        loading.value = false;
        router.push('/teachers');
      }
    };
    
    // 驗證表單 Validate form
    const validateForm = () => {
      // 基本驗證 Basic validation
      if (!teacher.name) {
        Message.error('請輸入姓名');
        return false;
      }
      
      if (!teacher.phone) {
        Message.error('請輸入手機號碼');
        return false;
      }
      
      if (!teacher.county || !teacher.district) {
        Message.error('請選擇縣市和區域');
        return false;
      }
      
      if (!teacher.teaching_categories || teacher.teaching_categories.length === 0) {
        Message.error('請選擇至少一種教學種類');
        return false;
      }
      
      if (!teacher.level) {
        Message.error('請選擇等級');
        return false;
      }
      
      if (!teacher.specialty) {
        Message.error('請輸入專長');
        return false;
      }
      
      if (!teacher.hourly_rate || teacher.hourly_rate <= 0) {
        Message.error('請輸入有效的時薪');
        return false;
      }
      
      if (teacher.years_of_experience === undefined || teacher.years_of_experience === null) {
        Message.error('請輸入教學年資');
        return false;
      }
      
      return true;
    };
    
    // 保存老師數據 Save teacher data
    const saveTeacher = async () => {
      try {
        // 驗證表單 Validate form
        if (!validateForm()) {
          return;
        }
        
        // 檢查認證狀態 Check authentication status
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        const token = localStorage.getItem('token');
        
        if (!isAuthenticated || !token) {
          console.log('未認證，重定向到登入頁面 Not authenticated, redirecting to login page');
          router.push('/login');
          return;
        }
        
        loading.value = true;
        console.log('保存老師數據 Save teacher data:', teacher);
        
        let response;
        
        // 根據是否有ID決定是創建還是更新 Create or update based on whether there is an ID
        if (teacher.id) {
          // 更新老師 Update teacher
          response = await teacherAPI.updateTeacher(teacher.id, teacher);
        } else {
          // 創建老師 Create teacher
          response = await teacherAPI.createTeacher(teacher);
        }
        
        if (response.success) {
          Message.success(teacher.id ? '更新老師成功 Teacher updated successfully' : '創建老師成功 Teacher created successfully');
          router.push('/teachers');
        } else {
          console.error('保存老師失敗 Failed to save teacher:', response.message);
          Message.error('保存老師失敗 Failed to save teacher');
        }
        
        loading.value = false;
      } catch (error) {
        console.error('保存老師失敗 Failed to save teacher:', error);
        Message.error('保存老師失敗 Failed to save teacher');
        loading.value = false;
      }
    };
    
    // 返回列表頁 Return to list page
    const goBack = () => {
      router.push('/teachers');
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
    
    // 組件掛載時獲取老師數據 Get teacher data when component is mounted
    onMounted(async () => {
      try {
        // 從 URL 中獲取老師 ID Get teacher ID from URL
        const teacherId = route.params.id;
        console.log('組件掛載，路由參數 Component mounted, route params:', route.params);
        
        // 檢查認證狀態 Check authentication status
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        const token = localStorage.getItem('token');
        
        if (!isAuthenticated || !token) {
          console.log('未認證，重定向到登入頁面 Not authenticated, redirecting to login page');
          router.push('/login');
          return;
        }
        
        // 獲取課程類別 Get course categories
        await fetchCourseCategories();
        
        // 如果 URL 中有老師 ID，則獲取老師數據
        // If there is a teacher ID in the URL, fetch teacher data
        if (teacherId) {
          console.log('檢測到老師 ID，獲取老師數據 Teacher ID detected, fetching teacher data:', teacherId);
          await fetchTeacher(teacherId);
        } else {
          console.log('未檢測到老師 ID，創建新老師 No teacher ID detected, creating new teacher');
        }
      } catch (error) {
        console.error('組件掛載時出錯 Error during component mounting:', error);
        Message.error('加載頁面時出錯 Error loading page');
        router.push('/teachers');
      }
    });
    
    return {
      userName,
      isLoggingOut,
      loading,
      isEditMode,
      teacher,
      categoryOptions,
      countyOptions,
      districtOptions,
      levelOptions,
      handleCountyChange,
      saveTeacher,
      goBack,
      handleLogout
    };
  }
}; 