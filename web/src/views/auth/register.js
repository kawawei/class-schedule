import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { authAPI } from '@/utils/api';
import Message from '@/utils/message';

// 註冊頁面組件 / Register page component
export default {
  name: 'Register',
  
  setup() {
    const router = useRouter();
    const currentStep = ref(1); // 當前步驟
    const isSubmitting = ref(false);
    const registerError = ref('');

    // 表單數據
    const form = reactive({
      companyName: '',
      companyCode: '',
      username: '',
      password: '',
      confirmPassword: ''
    });

    // 表單錯誤
    const errors = reactive({
      companyName: '',
      companyCode: '',
      username: '',
      password: '',
      confirmPassword: ''
    });

    // 驗證第一步：公司資料
    const validateStep1 = () => {
      let isValid = true;
      errors.companyName = '';
      errors.companyCode = '';

      // 驗證公司名稱
      if (!form.companyName.trim()) {
        errors.companyName = '請輸入公司名稱';
        isValid = false;
      }

      // 驗證公司代碼
      if (!form.companyCode.trim()) {
        errors.companyCode = '請輸入公司代碼';
        isValid = false;
      } else if (!/^[a-zA-Z0-9]{6,}$/.test(form.companyCode)) {
        errors.companyCode = '公司代碼必須至少包含6個英文字母或數字';
        isValid = false;
      }

      return isValid;
    };

    // 驗證第二步：管理員帳號
    const validateStep2 = () => {
      let isValid = true;
      errors.username = '';
      errors.password = '';
      errors.confirmPassword = '';

      // 驗證用戶名
      if (!form.username.trim()) {
        errors.username = '請輸入管理員帳號';
        isValid = false;
      }

      // 驗證密碼
      if (!form.password) {
        errors.password = '請輸入密碼';
        isValid = false;
      } else if (form.password.length < 6) {
        errors.password = '密碼長度至少為6個字符';
        isValid = false;
      }

      // 驗證確認密碼
      if (!form.confirmPassword) {
        errors.confirmPassword = '請再次輸入密碼';
        isValid = false;
      } else if (form.password !== form.confirmPassword) {
        errors.confirmPassword = '兩次輸入的密碼不一致';
        isValid = false;
      }

      return isValid;
    };

    // 處理下一步
    const handleNextStep = () => {
      if (validateStep1()) {
        currentStep.value = 2;
        registerError.value = '';
      }
    };

    // 處理上一步
    const handlePrevStep = () => {
      currentStep.value = 1;
      registerError.value = '';
    };

    // 處理表單提交
    const handleSubmit = async () => {
      // 重新驗證所有字段
      if (!validateStep1() || !validateStep2()) {
        return;
      }

      try {
        isSubmitting.value = true;
        registerError.value = '';

        // 調用註冊 API
        const response = await authAPI.register({
          companyName: form.companyName.trim(),
          companyCode: form.companyCode.trim(),
          username: form.username.trim(),
          password: form.password,
          confirmPassword: form.confirmPassword
        });

        if (response.success) {
          // 註冊成功，跳轉到登入頁面
          Message.success('註冊成功！請使用新帳號登入。');
          router.push({
            path: '/login',
            query: {
              registered: 'success',
              companyCode: form.companyCode
            }
          });
        } else {
          registerError.value = response.message || '註冊失敗，請稍後重試';
        }
      } catch (error) {
        console.error('註冊錯誤:', error);
        registerError.value = error.message || '註冊失敗，請稍後重試';
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      currentStep,
      form,
      errors,
      isSubmitting,
      registerError,
      handleNextStep,
      handlePrevStep,
      handleSubmit
    };
  }
}; 