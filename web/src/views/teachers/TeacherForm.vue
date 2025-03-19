<!-- 老師表單頁面 Teacher Form Page -->
<template>
  <div class="teacher-form-page">
    <!-- 頂部導航欄 Top navigation bar -->
    <AppHeader 
      :title="isEditMode ? '編輯老師' : '新增老師'" 
      :isLoggingOut="isLoggingOut"
      @logout="handleLogout"
    />
    
    <div class="container">
      <div class="teacher-form-content">
        <!-- 返回按鈕 Back button -->
        <div class="back-button">
          <AppButton 
            type="secondary"
            @click="goBack"
          >
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </template>
            返回列表
          </AppButton>
        </div>
        
        <!-- 表單卡片 Form card -->
        <div class="form-card">
          <form @submit.prevent="saveTeacher">
            <!-- 基本資料區塊 Basic information section -->
            <div class="form-section">
              <h3 class="section-title">基本資料</h3>
              <div class="form-grid">
                <div class="form-group">
                  <AppInput
                    label="姓名"
                    v-model="teacher.name"
                    placeholder="請輸入姓名"
                    required
                  />
                </div>
                <div class="form-group">
                  <AppInput
                    label="用戶名"
                    v-model="teacher.username"
                    placeholder="請輸入用戶名（系統登入用）"
                    required
                  />
                </div>
                <div class="form-group">
                  <AppInput
                    label="密碼"
                    type="password"
                    v-model="teacher.password"
                    :placeholder="isEditMode ? '不修改請留空' : '請輸入密碼'"
                    :required="!isEditMode"
                  />
                </div>
              </div>
            </div>
            
            <!-- 聯絡方式區塊 Contact information section -->
            <div class="form-section">
              <h3 class="section-title">聯絡方式</h3>
              <div class="form-grid">
                <div class="form-group">
                  <AppInput
                    label="手機號碼"
                    v-model="teacher.phone"
                    placeholder="請輸入手機號碼"
                    required
                  />
                </div>
                <div class="form-group">
                  <AppInput
                    label="電子郵件"
                    type="email"
                    v-model="teacher.email"
                    placeholder="請輸入電子郵件"
                    required
                  />
                </div>
                <div class="form-group">
                  <AppInput
                    label="LINE ID"
                    v-model="teacher.line_id"
                    placeholder="請輸入LINE ID"
                  />
                </div>
              </div>
            </div>
            
            <!-- 地址資訊區塊 Address information section -->
            <div class="form-section">
              <h3 class="section-title">地址資訊</h3>
              <div class="form-grid">
                <div class="form-group">
                  <AppSelect
                    label="居住縣市"
                    v-model="teacher.county"
                    :options="countyOptions"
                    placeholder="請選擇縣市"
                    required
                    @change="handleCountyChange"
                  />
                </div>
                <div class="form-group">
                  <AppSelect
                    label="區域"
                    v-model="teacher.district"
                    :options="districtOptions"
                    placeholder="請選擇區域"
                    required
                    :disabled="!teacher.county"
                  />
                </div>
                <div class="form-group full-width">
                  <AppInput
                    label="詳細地址"
                    v-model="teacher.address"
                    placeholder="請輸入詳細地址"
                    required
                  />
                </div>
              </div>
            </div>
            
            <!-- 教學資訊區塊 Teaching information section -->
            <div class="form-section">
              <h3 class="section-title">教學資訊</h3>
              <div class="form-grid">
                <div class="form-group full-width">
                  <label class="form-label">教學種類</label>
                  <CheckboxGroup
                    v-model="teacher.teaching_categories"
                    :options="categoryOptions"
                  />
                </div>
                <div class="form-group">
                  <AppSelect
                    label="等級"
                    v-model="teacher.level"
                    :options="levelOptions"
                    placeholder="請選擇等級"
                    required
                  />
                </div>
                <div class="form-group">
                  <AppInput
                    label="教學年資"
                    type="number"
                    v-model="teacher.years_of_experience"
                    placeholder="請輸入教學年資"
                    min="0"
                    required
                  />
                </div>
                <div class="form-group">
                  <AppInput
                    label="時薪"
                    type="number"
                    v-model="teacher.hourly_rate"
                    placeholder="請輸入時薪"
                    min="0"
                    required
                  />
                </div>
                <div class="form-group full-width">
                  <AppInput
                    label="專長描述"
                    type="textarea"
                    v-model="teacher.specialty"
                    placeholder="請描述您的專長和教學特色"
                    rows="3"
                  />
                </div>
              </div>
            </div>
            
            <!-- 緊急聯絡人區塊 Emergency contact section -->
            <div class="form-section">
              <h3 class="section-title">緊急聯絡人</h3>
              <div class="form-grid">
                <div class="form-group">
                  <AppInput
                    label="姓名"
                    v-model="teacher.emergency_contact_name"
                    placeholder="請輸入緊急聯絡人姓名"
                    required
                  />
                </div>
                <div class="form-group">
                  <AppInput
                    label="關係"
                    v-model="teacher.emergency_contact_relation"
                    placeholder="請輸入與緊急聯絡人的關係"
                    required
                  />
                </div>
                <div class="form-group">
                  <AppInput
                    label="聯絡電話"
                    v-model="teacher.emergency_contact_phone"
                    placeholder="請輸入緊急聯絡人電話"
                    required
                  />
                </div>
              </div>
            </div>
            
            <!-- 其他設定區塊 Other settings section -->
            <div class="form-section">
              <h3 class="section-title">其他設定</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">帳號狀態</label>
                  <div class="toggle-container">
                    <ToggleSwitch
                      v-model="teacher.is_active"
                    />
                    <span class="toggle-label">{{ teacher.is_active ? '啟用' : '停用' }}</span>
                  </div>
                </div>
                <div class="form-group full-width">
                  <AppInput
                    label="備註"
                    type="textarea"
                    v-model="teacher.notes"
                    placeholder="請輸入備註事項"
                    rows="3"
                  />
                </div>
              </div>
            </div>
            
            <!-- 表單按鈕 Form buttons -->
            <div class="form-buttons">
              <AppButton
                type="secondary"
                @click="goBack"
              >
                取消
              </AppButton>
              <AppButton
                type="primary"
                :loading="loading"
                native-type="submit"
              >
                {{ isEditMode ? '更新' : '新增' }}
              </AppButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AppHeader from '@/components/layout/AppHeader.vue';
import AppButton from '@/components/base/AppButton.vue';
import AppInput from '@/components/base/AppInput.vue';
import AppSelect from '@/components/base/AppSelect.vue';
import CheckboxGroup from '@/components/base/CheckboxGroup.vue';
import ToggleSwitch from '@/components/base/ToggleSwitch.vue';
import teacherFormLogic from './teacher-form.js';

export default {
  name: 'TeacherForm',
  components: {
    AppHeader,
    AppButton,
    AppInput,
    AppSelect,
    CheckboxGroup,
    ToggleSwitch
  },
  setup() {
    return {
      ...teacherFormLogic.setup()
    };
  }
};
</script>

<style lang="scss" scoped>
@import './teacher.scss';

.back-button {
  margin-bottom: var(--spacing-md);
}

.form-card {
  background-color: var(--color-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.form-section {
  margin-bottom: var(--spacing-lg);
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .section-title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-medium);
    color: var(--text-primary);
    margin-top: 0;
    margin-bottom: var(--spacing-md);
    padding-bottom: var(--spacing-xs);
    border-bottom: 1px solid var(--border-color);
  }
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
  
  .form-group {
    &.full-width {
      grid-column: span 3;
    }
  }
}

.form-label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.toggle-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  
  .toggle-label {
    font-size: var(--font-size-md);
    color: var(--text-primary);
  }
}

.form-buttons {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
    
    .form-group {
      &.full-width {
        grid-column: span 1;
      }
    }
  }
}
</style> 