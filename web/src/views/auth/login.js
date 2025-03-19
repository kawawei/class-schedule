// 導入依賴 Import dependencies
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import apiRequest from '@/utils/api';
import Message from '@/utils/message';

// 登入頁面腳本 Login page script
export default {
  name: 'Login',
  
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
        const response = await apiRequest('/auth/login', 'POST', {
          company_code: form.value.companyCode,
          username: form.value.username,
          password: form.value.password
        }, false);
        
        // 保存令牌和公司代碼 Save token and company code
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('companyCode', form.value.companyCode);
        
        // 跳轉到儀表板 Redirect to dashboard
        router.push('/dashboard');
      } catch (error) {
        console.error('登入失敗 Login failed:', error);
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