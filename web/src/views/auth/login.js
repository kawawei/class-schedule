// 導入依賴 Import dependencies
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { authAPI } from '@/utils/api';
import Message from '@/utils/message';

// 登入頁面腳本 Login page script
export default {
  name: 'Login',
  
  setup() {
    const router = useRouter();
    
    // 表單數據 Form data
    const form = reactive({
      companyCode: '',
      username: '',
      password: ''
    });
    
    // 錯誤信息 Error messages
    const errors = reactive({
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
     * @returns {boolean} 是否有效 Is valid
     */
    const validateForm = () => {
      let isValid = true;
      
      // 重置錯誤信息 Reset error messages
      Object.keys(errors).forEach(key => errors[key] = '');
      
      // 驗證公司代碼 Validate company code
      if (!form.companyCode.trim()) {
        errors.companyCode = '請輸入公司代碼';
        isValid = false;
      }
      
      // 驗證用戶名 Validate username
      if (!form.username.trim()) {
        errors.username = '請輸入用戶名';
        isValid = false;
      }
      
      // 驗證密碼 Validate password
      if (!form.password) {
        errors.password = '請輸入密碼';
        isValid = false;
      }
      
      return isValid;
    };
    
    /**
     * 處理表單提交 Handle form submission
     */
    const handleSubmit = async () => {
      if (!validateForm()) {
        return;
      }
      
      isSubmitting.value = true;
      loginError.value = '';
      
      try {
        // 調用登入 API Call login API
        const response = await authAPI.login({
          companyCode: form.companyCode,
          username: form.username,
          password: form.password
        });
        
        if (response.success) {
          // 存儲令牌和用戶信息 Store token and user info
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          localStorage.setItem('companyCode', form.companyCode);
          localStorage.setItem('isAuthenticated', 'true');
          
          // 從 JWT token 中解析 departmentId Parse departmentId from JWT token
          const tokenPayload = JSON.parse(atob(response.data.token.split('.')[1]));
          localStorage.setItem('departmentId', tokenPayload.departmentId.toString());
          
          // 導航到儀表板 Navigate to dashboard
          router.push('/dashboard');
        } else {
          loginError.value = response.message || '登入失敗，請檢查輸入信息';
        }
      } catch (error) {
        console.error('登入錯誤:', error);
        loginError.value = error.message || '登入失敗，請稍後重試';
      } finally {
        isSubmitting.value = false;
      }
    };
    
    return {
      form,
      errors,
      loginError,
      isSubmitting,
      handleSubmit
    };
  }
}; 