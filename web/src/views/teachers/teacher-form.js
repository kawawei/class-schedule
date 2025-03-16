// 導入依賴 Import dependencies
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { teacherAPI } from '@/utils/api';

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
    const userName = ref('管理員');
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
      username: '',
      password: '',
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
        loading.value = true;
        console.log('獲取老師數據 Get teacher data:', id);
        
        // 模擬獲取數據 Mock data fetching
        setTimeout(() => {
          // 模擬數據 Mock data
          const mockTeacher = {
            id: 1,
            name: '王小明',
            username: 'teacher1',
            email: 'teacher1@example.com',
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
            is_active: true
          };
          
          // 更新老師數據 Update teacher data
          Object.assign(teacher, mockTeacher);
          
          // 更新區域選項 Update district options
          if (teacher.county) {
            districtOptions.value = countyDistrictMap[teacher.county] || [];
          }
          
          loading.value = false;
          console.log('老師數據獲取成功 Teacher data fetched successfully');
        }, 1000);
        
        // 實際API調用 Actual API call
        // const response = await teacherAPI.getTeacher(id);
        // Object.assign(teacher, response.data);
        // if (teacher.county) {
        //   districtOptions.value = countyDistrictMap[teacher.county] || [];
        // }
      } catch (error) {
        console.error('獲取老師數據失敗 Failed to get teacher data:', error);
      } finally {
        // loading.value = false;
      }
    };
    
    // 驗證表單 Validate form
    const validateForm = () => {
      // 基本驗證 Basic validation
      if (!teacher.name) {
        alert('請輸入姓名');
        return false;
      }
      
      if (!teacher.username) {
        alert('請輸入用戶名');
        return false;
      }
      
      if (!isEditMode.value && !teacher.password) {
        alert('請輸入密碼');
        return false;
      }
      
      if (!teacher.phone) {
        alert('請輸入手機號碼');
        return false;
      }
      
      if (!teacher.email) {
        alert('請輸入電子郵件');
        return false;
      }
      
      if (!teacher.county || !teacher.district) {
        alert('請選擇縣市和區域');
        return false;
      }
      
      if (!teacher.address) {
        alert('請輸入詳細地址');
        return false;
      }
      
      if (teacher.teaching_categories.length === 0) {
        alert('請選擇至少一種教學種類');
        return false;
      }
      
      if (!teacher.level) {
        alert('請選擇等級');
        return false;
      }
      
      if (!teacher.emergency_contact_name || !teacher.emergency_contact_relation || !teacher.emergency_contact_phone) {
        alert('請填寫緊急聯絡人資料');
        return false;
      }
      
      return true;
    };
    
    // 保存老師數據 Save teacher data
    const saveTeacher = async () => {
      // 驗證表單 Validate form
      if (!validateForm()) {
        return;
      }
      
      try {
        loading.value = true;
        console.log('保存老師數據 Save teacher data:', teacher);
        
        // 模擬保存操作 Mock save operation
        setTimeout(() => {
          loading.value = false;
          router.push('/teachers');
          console.log('老師數據保存成功 Teacher data saved successfully');
        }, 1500);
        
        // 實際API調用 Actual API call
        // if (isEditMode.value) {
        //   await teacherAPI.updateTeacher(teacher.id, teacher);
        // } else {
        //   await teacherAPI.createTeacher(teacher);
        // }
        // router.push('/teachers');
      } catch (error) {
        console.error('保存老師數據失敗 Failed to save teacher data:', error);
      } finally {
        // loading.value = false;
      }
    };
    
    // 返回列表 Go back to list
    const goBack = () => {
      router.push('/teachers');
    };
    
    // 處理登出 Handle logout
    const handleLogout = async () => {
      try {
        isLoggingOut.value = true;
        console.log('登出中... Logging out...');
        
        // 模擬登出操作 Mock logout operation
        setTimeout(() => {
          router.push('/login');
          isLoggingOut.value = false;
          console.log('登出成功 Logout successful');
        }, 1000);
        
        // 實際API調用 Actual API call
        // await authAPI.logout();
        // router.push('/login');
      } catch (error) {
        console.error('登出失敗 Logout failed:', error);
        isLoggingOut.value = false;
      }
    };
    
    // 組件掛載時獲取老師數據 Get teacher data when component is mounted
    onMounted(() => {
      if (isEditMode.value) {
        fetchTeacher(route.params.id);
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