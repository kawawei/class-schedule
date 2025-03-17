// 導入依賴 Import dependencies
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
// import { teacherAPI, authAPI } from '@/utils/api';
import { teacherAPI, authAPI } from '@/utils/api';

/**
 * 老師列表頁面邏輯 Teacher list page logic
 * @returns {Object} 老師列表頁面邏輯 Teacher list page logic
 */
export default {
  /**
   * 設置函數 Setup function
   * @returns {Object} 組件數據和方法 Component data and methods
   */
  setup() {
    // 路由器 Router
    const router = useRouter();
    
    // 用戶信息 User info
    const userName = ref('管理員');
    const isLoggingOut = ref(false);
    
    // 加載狀態 Loading state
    const loading = ref(false);
    
    // 老師列表 Teacher list
    const teachers = ref([]);
    
    // 搜索查詢 Search query
    const searchQuery = ref('');
    
    // 篩選條件 Filter conditions
    const filters = reactive({
      category: '',
      county: '',
      district: '',
      level: '',
      status: ''
    });
    
    // 當前選中的老師 Current selected teacher
    const currentTeacher = reactive({
      id: null,
      name: '',
      user_id: null,
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
    
    // 刪除對話框可見性 Delete dialog visibility
    const deleteDialogVisible = ref(false);
    
    // 詳情對話框可見性 Details dialog visibility
    const detailsDialogVisible = ref(false);
    
    // 表格列定義 Table columns definition
    const teacherColumns = [
      {
        key: 'name',
        title: '姓名',
        width: 120
      },
      {
        key: 'level',
        title: '等級',
        width: 100,
        slot: true
      },
      {
        key: 'years_of_experience',
        title: '教學年資',
        width: 100,
        align: 'center'
      },
      {
        key: 'county',
        title: '縣市',
        width: 100
      },
      {
        key: 'phone',
        title: '聯絡電話',
        width: 150
      },
      {
        key: 'status',
        title: '狀態',
        width: 100,
        slot: true
      },
      {
        key: 'actions',
        title: '操作',
        width: 120,
        align: 'center',
        slot: true
      }
    ];
    
    // 教學種類選項 Teaching category options
    const categoryOptions = [
      { value: '鋼琴', label: '鋼琴' },
      { value: '小提琴', label: '小提琴' },
      { value: '吉他', label: '吉他' },
      { value: '長笛', label: '長笛' },
      { value: '聲樂', label: '聲樂' },
      { value: '繪畫', label: '繪畫' },
      { value: '書法', label: '書法' },
      { value: '舞蹈', label: '舞蹈' }
    ];
    
    // 縣市選項 County options
    const countyOptions = [
      { value: '台北市', label: '台北市' },
      { value: '新北市', label: '新北市' }
    ];
    
    // 區域選項 District options
    const districtOptions = computed(() => {
      const districts = {
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
      
      return filters.county ? districts[filters.county] || [] : [];
    });
    
    // 等級選項 Level options
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
    
    // 篩選後的老師列表 Filtered teacher list
    const filteredTeachers = computed(() => {
      // 模擬數據 Mock data
      if (teachers.value.length === 0) {
        return [
          {
            id: 1,
            name: '王小明',
            phone: '0912-345-678',
            line_id: 'wang123',
            county: '台北市',
            district: '大安區',
            address: '和平東路二段100號',
            teaching_categories: ['鋼琴', '小提琴'],
            level: '高級',
            years_of_experience: 8,
            specialty: '古典音樂',
            hourly_rate: 800,
            emergency_contact_name: '王大明',
            emergency_contact_relation: '父親',
            emergency_contact_phone: '0933-123-456',
            notes: '擅長教導兒童，有耐心。\n週一、週三晚上無法排課。',
            is_active: true
          },
          {
            id: 2,
            name: '李小華',
            phone: '0923-456-789',
            line_id: 'lee456',
            county: '新北市',
            district: '板橋區',
            address: '文化路一段200號',
            teaching_categories: ['吉他', '聲樂'],
            level: '中級',
            years_of_experience: 5,
            specialty: '流行音樂',
            hourly_rate: 600,
            emergency_contact_name: '李大華',
            emergency_contact_relation: '母親',
            emergency_contact_phone: '0922-234-567',
            notes: '',
            is_active: true
          },
          {
            id: 3,
            name: '張小芳',
            phone: '0934-567-890',
            line_id: 'zhang789',
            county: '台北市',
            district: '信義區',
            address: '松仁路100號',
            teaching_categories: ['繪畫', '書法'],
            level: '初級',
            years_of_experience: 3,
            specialty: '水彩畫',
            hourly_rate: 500,
            emergency_contact_name: '張大芳',
            emergency_contact_relation: '姊姊',
            emergency_contact_phone: '0911-345-678',
            notes: '剛開始教學，但有豐富的創作經驗。',
            is_active: false
          }
        ];
      }
      
      let result = [...teachers.value];
      
      // 搜索過濾 Search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(teacher => 
          teacher.name.toLowerCase().includes(query) || 
          teacher.phone.includes(query) ||
          (teacher.line_id && teacher.line_id.toLowerCase().includes(query))
        );
      }
      
      // 類別過濾 Category filter
      if (filters.category) {
        result = result.filter(teacher => 
          teacher.teaching_categories.includes(filters.category)
        );
      }
      
      // 縣市過濾 County filter
      if (filters.county) {
        result = result.filter(teacher => 
          teacher.county === filters.county
        );
        
        // 區域過濾 District filter
        if (filters.district) {
          result = result.filter(teacher => 
            teacher.district === filters.district
          );
        }
      }
      
      // 等級過濾 Level filter
      if (filters.level) {
        result = result.filter(teacher => 
          teacher.level === filters.level
        );
      }
      
      // 狀態過濾 Status filter
      if (filters.status) {
        const isActive = filters.status === 'active';
        result = result.filter(teacher => 
          teacher.is_active === isActive
        );
      }
      
      return result;
    });
    
    // 獲取老師列表 Get teacher list
    const fetchTeachers = async () => {
      try {
        loading.value = true;
        console.log('開始獲取老師列表 Start fetching teacher list');
        
        // 模擬數據，實際應用中應該從API獲取
        // Mock data, should be fetched from API in real application
        setTimeout(() => {
          teachers.value = [
            {
              id: 1,
              name: '王小明',
              user_id: 2,
              phone: '0912-345-678',
              line_id: 'wang_teacher',
              county: '台北市',
              district: '大安區',
              address: '復興南路一段100號',
              teaching_categories: ['鋼琴', '小提琴'],
              level: '高級',
              years_of_experience: 8,
              specialty: '古典鋼琴、小提琴入門',
              hourly_rate: 800,
              emergency_contact_name: '王大明',
              emergency_contact_relation: '父親',
              emergency_contact_phone: '0987-654-321',
              notes: '週一、三、五晚上有空',
              is_active: true,
              createdAt: '2023-01-15T08:30:00.000Z',
              updatedAt: '2023-03-10T14:20:00.000Z'
            },
            {
              id: 2,
              name: '李小華',
              user_id: 3,
              phone: '0923-456-789',
              line_id: 'lee_teacher',
              county: '新北市',
              district: '板橋區',
              address: '文化路一段200號',
              teaching_categories: ['吉他', '聲樂'],
              level: '中級',
              years_of_experience: 5,
              specialty: '流行吉他、現代聲樂',
              hourly_rate: 650,
              emergency_contact_name: '李大華',
              emergency_contact_relation: '母親',
              emergency_contact_phone: '0976-543-210',
              notes: '週末全天有空',
              is_active: true,
              createdAt: '2023-02-20T10:15:00.000Z',
              updatedAt: '2023-03-12T09:45:00.000Z'
            },
            {
              id: 3,
              name: '張小芳',
              user_id: 4,
              phone: '0934-567-890',
              line_id: 'zhang_teacher',
              county: '台中市',
              district: '西屯區',
              address: '台灣大道三段300號',
              teaching_categories: ['繪畫', '書法'],
              level: '初級',
              years_of_experience: 3,
              specialty: '水彩畫、硬筆書法',
              hourly_rate: 550,
              emergency_contact_name: '張大芳',
              emergency_contact_relation: '姐姐',
              emergency_contact_phone: '0965-432-109',
              notes: '週二、四下午有空',
              is_active: false,
              createdAt: '2023-03-05T13:40:00.000Z',
              updatedAt: '2023-03-14T11:30:00.000Z'
            }
          ];
          loading.value = false;
          console.log('老師列表獲取成功 Teacher list fetched successfully');
        }, 1000);
        
        // 實際API調用 Actual API call
        // const response = await teacherAPI.getAllTeachers();
        // teachers.value = response.data;
      } catch (error) {
        console.error('獲取老師列表失敗 Failed to get teacher list:', error);
      } finally {
        // loading.value = false;
      }
    };
    
    // 處理搜索 Handle search
    const handleSearch = () => {
      console.log('搜索查詢: Search query:', searchQuery.value);
    };
    
    // 應用篩選 Apply filters
    const applyFilters = () => {
      console.log('應用篩選: Apply filters:', filters);
    };
    
    // 處理縣市變更 Handle county change
    const handleCountyChange = () => {
      // 清空區域選擇 Clear district selection
      filters.district = '';
      // 應用篩選 Apply filters
      applyFilters();
    };
    
    // 打開新增老師表單 Open add teacher form
    const openAddTeacherForm = () => {
      router.push('/teachers/new');
    };
    
    // 查看老師詳情 View teacher details
    const viewTeacherDetails = (teacher) => {
      console.log('查看老師詳情 View teacher details:', teacher);
      
      // 設置當前選中的老師 Set current selected teacher
      Object.assign(currentTeacher, teacher);
      
      // 顯示詳情對話框 Show details dialog
      detailsDialogVisible.value = true;
    };
    
    // 編輯老師 Edit teacher
    const editTeacher = (teacher) => {
      router.push(`/teachers/${teacher.id}`);
    };
    
    // 刪除老師 Delete teacher
    const deleteTeacher = (teacher) => {
      currentTeacher.id = teacher.id;
      currentTeacher.name = teacher.name;
      deleteDialogVisible.value = true;
    };
    
    // 確認刪除 Confirm delete
    const confirmDelete = async () => {
      try {
        loading.value = true;
        console.log('刪除老師: Delete teacher:', currentTeacher.id);
        
        // 模擬刪除操作 Mock delete operation
        setTimeout(() => {
          teachers.value = teachers.value.filter(teacher => teacher.id !== currentTeacher.id);
          deleteDialogVisible.value = false;
          loading.value = false;
          console.log('老師刪除成功 Teacher deleted successfully');
        }, 1000);
        
        // 實際API調用 Actual API call
        // await teacherAPI.deleteTeacher(currentTeacher.id);
        // teachers.value = teachers.value.filter(teacher => teacher.id !== currentTeacher.id);
        // deleteDialogVisible.value = false;
      } catch (error) {
        console.error('刪除老師失敗 Failed to delete teacher:', error);
      } finally {
        // loading.value = false;
      }
    };
    
    // 切換老師狀態 Toggle teacher status
    const toggleTeacherStatus = async (teacher) => {
      try {
        loading.value = true;
        console.log('切換老師狀態: Toggle teacher status:', teacher.id, !teacher.is_active);
        
        // 模擬狀態切換 Mock status toggle
        setTimeout(() => {
          const index = teachers.value.findIndex(t => t.id === teacher.id);
          if (index !== -1) {
            teachers.value[index].is_active = !teachers.value[index].is_active;
          }
          loading.value = false;
          console.log('老師狀態更新成功 Teacher status updated successfully');
        }, 500);
        
        // 實際API調用 Actual API call
        // const updatedTeacher = { ...teacher, is_active: !teacher.is_active };
        // await teacherAPI.updateTeacher(teacher.id, updatedTeacher);
        // const index = teachers.value.findIndex(t => t.id === teacher.id);
        // if (index !== -1) {
        //   teachers.value[index].is_active = !teachers.value[index].is_active;
        // }
      } catch (error) {
        console.error('更新老師狀態失敗 Failed to update teacher status:', error);
      } finally {
        // loading.value = false;
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
        isLoggingOut.value = false;
      }
    };
    
    // 獲取等級對應的狀態類型 Get status type for level
    const getLevelStatus = (level) => {
      const statusMap = {
        '初級': 'upcoming',
        '中級': 'in-progress',
        '高級': 'completed'
      };
      return statusMap[level] || 'upcoming';
    };
    
    // 組件掛載時獲取老師列表 Get teacher list when component is mounted
    onMounted(() => {
      fetchTeachers();
    });
    
    return {
      userName,
      isLoggingOut,
      loading,
      teachers,
      searchQuery,
      filters,
      currentTeacher,
      deleteDialogVisible,
      detailsDialogVisible,
      teacherColumns,
      categoryOptions,
      countyOptions,
      districtOptions,
      levelOptions,
      statusOptions,
      filteredTeachers,
      handleSearch,
      applyFilters,
      handleCountyChange,
      openAddTeacherForm,
      viewTeacherDetails,
      editTeacher,
      deleteTeacher,
      confirmDelete,
      toggleTeacherStatus,
      handleLogout,
      getLevelStatus
    };
  }
}; 