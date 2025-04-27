// 導入依賴 Import dependencies
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authAPI } from '@/utils/api';
import Message from '@/utils/message';
import RecentCompanyCodes from '@/components/auth/RecentCompanyCodes.vue';

// 登入頁面腳本 Login page script
export default {
  name: 'Login',
  components: {
    RecentCompanyCodes
  },
  
  setup() {
    const router = useRouter();
    
    // 表單數據 Form data
    const form = ref({
      companyCode: '',
      username: '',
      password: ''
    });
    
    // 錯誤信息 Error messages
    const errors = ref({
      companyCode: '',
      username: '',
      password: ''
    });
    
    // 登入錯誤 Login error
    const loginError = ref('');
    
    // 提交狀態 Submit state
    const isSubmitting = ref(false);
    
    /**
     * 驗證表單 Validate form
     * @returns {Boolean} 是否通過驗證 Whether validation passed
     */
    const validateForm = () => {
      let isValid = true;
      errors.value = {
        companyCode: '',
        username: '',
        password: ''
      };
      
      if (!form.value.companyCode) {
        errors.value.companyCode = '請輸入公司代碼';
        isValid = false;
      }
      
      if (!form.value.username) {
        errors.value.username = '請輸入用戶名';
        isValid = false;
      }
      
      if (!form.value.password) {
        errors.value.password = '請輸入密碼';
        isValid = false;
      }
      
      return isValid;
    };
    
    /**
     * 更新最近使用的公司代碼 Update recent company codes
     * @param {String} companyCode - 公司代碼 Company code
     */
    const updateRecentCompanyCodes = (companyCode) => {
      try {
        // 獲取現有的最近使用記錄 Get existing recent codes
        const savedCodes = localStorage.getItem('recentCompanyCodes');
        let recentCodes = savedCodes ? JSON.parse(savedCodes) : [];
        
        // 移除已存在的相同代碼 Remove existing same code
        recentCodes = recentCodes.filter(code => code.code !== companyCode);
        
        // 添加新的代碼到列表開頭 Add new code to the beginning
        recentCodes.unshift({
          code: companyCode,
          lastUsed: new Date().toISOString()
        });
        
        // 限制最多保存5個 Limit to 5 items
        recentCodes = recentCodes.slice(0, 5);
        
        // 保存更新後的列表 Save updated list
        localStorage.setItem('recentCompanyCodes', JSON.stringify(recentCodes));
      } catch (error) {
        console.error('更新最近使用的公司代碼失敗 Failed to update recent company codes:', error);
      }
    };
    
    /**
     * 處理表單提交 Handle form submit
     */
    const handleSubmit = async () => {
      try {
        // 重置錯誤 Reset errors
        loginError.value = '';
        
        // 驗證表單 Validate form
        if (!validateForm()) {
          return;
        }
        
        // 設置提交狀態 Set submit state
        isSubmitting.value = true;
        
        // 發送登入請求 Send login request
        const response = await authAPI.login({
          company_code: form.value.companyCode,
          username: form.value.username,
          password: form.value.password
        });
        
        // 更新最近使用的公司代碼 Update recent company codes
        updateRecentCompanyCodes(form.value.companyCode);
        
        // 檢查響應格式 Check response format
        if (!response.success) {
          throw new Error(response.message || '登入失敗 Login failed');
        }
        
        // 保存令牌和公司代碼 Save token and company code
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('companyCode', form.value.companyCode);
        localStorage.setItem('isAuthenticated', 'true');
        
        // 保存用戶資料 Save user data
        // 直接存 response.data.user，確保 teacherId 等欄位都被保存
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // 保存公司資料 Save company data
        const companyData = {
          company_name: response.data.company.company_name,
          company_code: response.data.company.company_code,
          status: response.data.company.status
        };
        localStorage.setItem('companyData', JSON.stringify(companyData));
        
        // 根據用戶角色導向到不同的儀表板 Redirect to different dashboards based on user role
        console.log('用戶角色:', response.data.user.role); // Log user role
        if (response.data.user.role === 'teacher') {
          console.log('導向到老師儀表板 Redirecting to teacher dashboard');
          router.push('/teacher/dashboard');
        } else {
          console.log('導向到管理員儀表板 Redirecting to admin dashboard');
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('登入失敗 Login failed:', error);
        loginError.value = error.message || '登入失敗，請稍後重試';
      } finally {
        isSubmitting.value = false;
      }
    };
    
    /**
     * 選擇最近使用的公司代碼 Select recent company code
     * @param {String} code - 公司代碼 Company code
     */
    const handleSelectCompanyCode = (code) => {
      form.value.companyCode = code;
    };
    
    return {
      form,
      errors,
      loginError,
      isSubmitting,
      handleSubmit,
      handleSelectCompanyCode
    };
  }
}; 