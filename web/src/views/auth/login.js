// 導入依賴 Import dependencies
import { authAPI } from '../../utils/api';

// 登入頁面腳本 Login page script

/**
 * 登入頁面組件導出 Login page component export
 * @returns {Object} 登入頁面組件配置 Login page component configuration
 */
export default {
  name: 'LoginPage',
  data() {
    return {
      // 表單數據 Form data
      form: {
        username: '',
        password: ''
      },
      // 錯誤訊息 Error messages
      errors: {
        username: '',
        password: ''
      },
      // 提交狀態 Submission state
      isSubmitting: false,
      // 登入錯誤 Login error
      loginError: ''
    };
  },
  methods: {
    /**
     * 驗證表單 Validate form
     * @returns {Boolean} 表單是否有效 Whether the form is valid
     */
    validateForm() {
      // 重置錯誤訊息 Reset error messages
      this.errors = {
        username: '',
        password: ''
      };
      
      let isValid = true;
      
      // 驗證用戶名 Validate username
      if (!this.form.username.trim()) {
        this.errors.username = '請輸入用戶名'; // Please enter username
        isValid = false;
      }
      
      // 驗證密碼 Validate password
      if (!this.form.password) {
        this.errors.password = '請輸入密碼'; // Please enter password
        isValid = false;
      } else if (this.form.password.length < 6) {
        this.errors.password = '密碼長度至少為6個字符'; // Password must be at least 6 characters
        isValid = false;
      }
      
      return isValid;
    },
    
    /**
     * 提交表單 Submit form
     */
    async handleSubmit() {
      // 重置登入錯誤 Reset login error
      this.loginError = '';
      
      // 驗證表單 Validate form
      if (!this.validateForm()) {
        return;
      }
      
      // 設置提交狀態 Set submission state
      this.isSubmitting = true;
      
      try {
        // 調用登入 API Call login API
        const response = await authAPI.login(this.form.username, this.form.password);
        
        // 存儲令牌 Store token
        localStorage.setItem('token', response.data.token);
        
        // 存儲用戶信息 Store user information
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // 設置身份驗證狀態 Set authentication state
        localStorage.setItem('isAuthenticated', 'true');
        
        // 導航到儀表板 Navigate to dashboard
        this.$router.push({ name: 'Dashboard' });
      } catch (error) {
        // 設置登入錯誤 Set login error
        this.loginError = error.message || '登入失敗，請檢查用戶名和密碼'; // Login failed, please check username and password
        console.error('登入錯誤 Login error:', error);
      } finally {
        // 重置提交狀態 Reset submission state
        this.isSubmitting = false;
      }
    }
  }
}; 