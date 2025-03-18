<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-card">
        <div class="card-header">
          <div class="register-logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <h1 class="register-title">註冊新公司</h1>
          <p class="register-subtitle">{{ currentStep === 1 ? '請填寫公司基本資料' : '請設置管理員帳號' }}</p>
        </div>
        
        <!-- 步驟指示器 Step indicator -->
        <div class="step-indicator">
          <div class="step" :class="{ active: currentStep === 1, completed: currentStep > 1 }">
            <div class="step-number">1</div>
            <div class="step-label">公司資料</div>
          </div>
          <div class="step-line"></div>
          <div class="step" :class="{ active: currentStep === 2 }">
            <div class="step-number">2</div>
            <div class="step-label">管理員帳號</div>
          </div>
        </div>

        <div class="card-body">
          <div v-if="registerError" class="register-error">
            {{ registerError }}
          </div>
          
          <!-- 第一步：公司資料 Step 1: Company Information -->
          <form v-if="currentStep === 1" class="register-form" @submit.prevent="handleNextStep">
            <div class="form-section">
              <div class="form-group">
                <label for="companyName">公司名稱</label>
                <AppInput
                  id="companyName"
                  v-model="form.companyName"
                  type="text"
                  placeholder="請輸入公司名稱"
                  :error="errors.companyName"
                  required
                />
              </div>
              <div class="form-group">
                <label for="companyCode">公司代碼</label>
                <AppInput
                  id="companyCode"
                  v-model="form.companyCode"
                  type="text"
                  placeholder="請輸入公司代碼（英文和數字，至少6碼）"
                  :error="errors.companyCode"
                  required
                />
                <small class="form-text">公司代碼將用於登入識別，建議使用好記的英文縮寫</small>
              </div>
            </div>
            <div class="form-actions">
              <AppButton type="primary" :loading="isSubmitting" :disabled="isSubmitting">下一步</AppButton>
            </div>
          </form>

          <!-- 第二步：管理員帳號 Step 2: Admin Account -->
          <form v-else class="register-form" @submit.prevent="handleSubmit">
            <div class="form-section">
              <div class="form-group">
                <label for="username">管理員帳號</label>
                <AppInput
                  id="username"
                  v-model="form.username"
                  type="text"
                  placeholder="請輸入管理員帳號"
                  :error="errors.username"
                  required
                />
              </div>
              <div class="form-group">
                <label for="password">密碼</label>
                <AppInput
                  id="password"
                  v-model="form.password"
                  type="password"
                  placeholder="請輸入密碼"
                  :error="errors.password"
                  required
                />
              </div>
              <div class="form-group">
                <label for="confirmPassword">確認密碼</label>
                <AppInput
                  id="confirmPassword"
                  v-model="form.confirmPassword"
                  type="password"
                  placeholder="請再次輸入密碼"
                  :error="errors.confirmPassword"
                  required
                />
              </div>
            </div>
            <div class="form-actions">
              <AppButton type="secondary" :disabled="isSubmitting" @click="handlePrevStep">上一步</AppButton>
              <AppButton type="primary" :loading="isSubmitting" :disabled="isSubmitting">註冊</AppButton>
            </div>
          </form>
        </div>

        <div class="register-footer">
          <p>已有帳號？<router-link to="/login">返回登入</router-link></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 導入註冊頁面腳本
import registerScript from './register.js';

// 導出註冊頁面組件
export default registerScript;
</script>

<style lang="scss" scoped>
// 導入註冊頁面樣式 Import register page styles
@import './register.scss';

// 註冊錯誤樣式 Register error styles
.register-error {
  background-color: rgba(255, 59, 48, 0.1);
  color: var(--color-danger);
  border: 1px solid rgba(255, 59, 48, 0.2);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-sm);
  text-align: center;
}
</style> 