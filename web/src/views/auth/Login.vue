<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="card-header">
          <div class="login-logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <h1 class="login-title">才藝老師管理系統</h1>
          <p class="login-subtitle">請登入以繼續</p>
        </div>
        <div class="card-body">
          <div v-if="loginError" class="login-error">
            {{ loginError }}
          </div>
          <form class="login-form" @submit.prevent="handleSubmit">
            <div class="form-group">
              <AppInput
                label="用戶名"
                v-model="form.username"
                placeholder="請輸入用戶名"
                :error="errors.username"
                autocomplete="username"
                required
              />
            </div>
            <div class="form-group">
              <AppInput
                label="密碼"
                type="password"
                v-model="form.password"
                placeholder="請輸入密碼"
                :error="errors.password"
                autocomplete="current-password"
                required
              />
            </div>
            <div class="form-actions">
              <AppButton
                type="primary"
                class="login-btn"
                :loading="isSubmitting"
                :disabled="isSubmitting"
              >
                {{ isSubmitting ? '登入中...' : '登入' }}
              </AppButton>
            </div>
          </form>
        </div>
      </div>
      <div class="login-footer">
        <p>© {{ new Date().getFullYear() }} 才藝老師管理系統 - 版權所有</p>
      </div>
    </div>
  </div>
</template>

<script>
// 導入登入頁面腳本 Import login page script
import loginScript from './login.js';

// 導出登入頁面組件 Export login page component
export default loginScript;
</script>

<style lang="scss" scoped>
// 導入登入頁面樣式 Import login page styles
@import './login.scss';

// 登入錯誤樣式 Login error styles
.login-error {
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