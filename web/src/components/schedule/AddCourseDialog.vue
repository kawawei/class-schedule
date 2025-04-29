<!-- 添加課程對話框 Add Course Dialog -->
<template>
  <AppDialog
    :model-value="visible"
    :title="'新增課程 / Add Course'"
    size="lg"
    @update:model-value="handleVisibleChange"
    @close="handleClose"
  >
    <div class="add-course-form">
      <!-- 第一行：縣市和區域 First row: County and District -->
      <div class="form-row">
        <AppSelect
          v-model="formData.county"
          label="縣市 / County"
          :options="countyOptions"
          placeholder="請選擇縣市"
          required
          searchable
          @change="handleCountyChange"
        />
        <AppSelect
          v-model="formData.district"
          label="區域 / District"
          :options="districtOptions"
          placeholder="請選擇區域"
          required
          searchable
          :disabled="!formData.county"
        />
      </div>

      <!-- 第二行：補習班名稱和班級名稱 Second row: School Name and Class Name -->
      <div class="form-row">
        <AppSelect
          v-model="formData.schoolName"
          label="補習班名稱 / School Name"
          :options="schoolNameOptions"
          placeholder="請輸入補習班名稱"
          required
          searchable
          allow-custom-value
          @search="handleSchoolNameSearch"
        />
        <AppInput
          v-model="formData.className"
          label="班級名稱 / Class Name"
          placeholder="請輸入班級名稱"
        />
      </div>

      <!-- 第三行：課程種類和老師 Third row: Course Type and Teacher -->
      <div class="form-row">
        <AppSelect
          v-model="formData.courseType"
          label="課程種類 / Course Type"
          :options="courseTypes"
          placeholder="請選擇課程種類"
          required
          @change="handleCourseTypeChange"
        />
        <AppSelect
          v-model="formData.teacherId"
          label="授課老師 / Teacher"
          :options="teachers"
          placeholder="請先選擇課程種類"
          required
          :disabled="!formData.courseType"
        />
      </div>

      <!-- 第四行：排課模式 Fourth row: Schedule Mode -->
      <div class="form-row">
        <AppSelect
          v-model="formData.scheduleMode"
          label="排課模式 / Schedule Mode"
          :options="scheduleModes"
          placeholder="請選擇排課模式"
          required
        />
      </div>

      <!-- 第五行：日期和時間 Fifth row: Date and Time -->
      <div v-if="formData.scheduleMode !== 'custom'" class="time-selection">
        <AppInput
          v-model="formData.date"
          :label="formData.scheduleMode === 'single' ? '上課日期 / Course Date' : '開始日期 / Start Date'"
          type="date"
          required
        />
        <AppInput
          v-if="formData.scheduleMode === 'recurring'"
          v-model="formData.endDate"
          label="結束日期 / End Date"
          type="date"
          required
        />
      </div>

      <!-- 自選日期模式 Custom Dates Mode -->
      <div v-if="formData.scheduleMode === 'custom'" class="custom-dates-section">
        <div class="section-title">選擇上課日期 / Select Course Dates</div>
        <div class="calendar-container">
          <!-- 多日期選擇器組件 Multi Date Picker Component -->
          <AppMultiDatePicker
            v-model="formData.selectedDates"
            @change="handleDateSelect"
          />
        </div>
        <div class="selected-dates">
          <div v-for="date in formData.selectedDates" :key="date.getTime()" class="selected-date">
            {{ formatDate(date) }}
            <button class="remove-date" @click="removeSelectedDate(date)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div class="time-selection">
        <AppInput
          v-model="formData.startTime"
          label="開始時間 / Start Time"
          type="time"
          required
        />
        <AppInput
          v-model="formData.endTime"
          label="結束時間 / End Time"
          type="time"
          required
        />
      </div>

      <!-- 重複性選項 Recurring Options -->
      <div v-if="formData.scheduleMode === 'recurring' && formData.endDate" class="recurring-options">
        <div class="section-title">重複性 / Recurring</div>
        <div class="weekday-checkboxes">
          <label v-for="(day, index) in weekDays" :key="index" class="weekday-checkbox">
            <input
              type="checkbox"
              v-model="formData.recurringDays[index]"
              :disabled="!availableWeekdays[index]"
            >
            <span :class="{ 'disabled': !availableWeekdays[index] }">{{ day.label }}</span>
          </label>
        </div>
      </div>

      <!-- 第六行：課程費用 Sixth row: Course Fees -->
      <div class="time-selection">
        <AppInput
          v-model="formData.courseFee"
          label="課程鐘點費"
          type="number"
          placeholder="請輸入課程鐘點費，預設為 0"
        />
        <AppInput
          v-model="formData.teacherFee"
          label="老師實拿鐘點"
          type="number"
          placeholder="請輸入老師實拿鐘點，預設為 0"
        />
      </div>

      <!-- 第七行：備註 Seventh row: Notes -->
      <div class="form-row">
        <AppInput
          v-model="formData.notes"
          label="備註 / Notes (選填 / Optional)"
          type="textarea"
          placeholder="請輸入備註"
          class="notes-input"
        />
      </div>

      <!-- 助教區域 Assistant Section -->
      <div class="assistant-section">
        <AppButton
          type="primary"
          size="md"
          class="add-assistant-button"
          @click.once="addAssistant"
        >
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </template>
          新增助教 / Add Assistant
        </AppButton>
      </div>

      <!-- 助教列表 Assistant List -->
      <div v-if="formData.assistants.length > 0" class="assistant-list">
        <div v-for="(assistant, index) in formData.assistants" :key="index" class="assistant-info">
          <div class="assistant-header">
            <h4>助教 {{ index + 1 }} / Assistant {{ index + 1 }}</h4>
            <AppButton
              type="text"
              size="sm"
              class="remove-assistant"
              @click="removeAssistant(index)"
            >
              移除助教 / Remove Assistant
            </AppButton>
          </div>
          <div class="form-row">
            <AppSelect
              v-model="assistant.id"
              label="助教 / Assistant"
              :options="assistants"
              placeholder="請選擇助教"
              required
            />
            <AppInput
              v-model="assistant.fee"
              label="助教鐘點費 / Assistant Fee"
              type="number"
              placeholder="請輸入助教鐘點費"
              required
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按鈕 Action Buttons -->
    <template #footer>
      <div class="dialog-footer">
        <AppButton
          type="secondary"
          @click="handleClose"
        >
          取消 / Cancel
        </AppButton>
        <AppButton
          type="primary"
          @click="handleSubmit"
        >
          確認 / Confirm
        </AppButton>
      </div>
    </template>
  </AppDialog>
</template>

<script>
import * as dialog from './AddCourseDialog.js';
import AppDialog from '../base/AppDialog.vue';
import AppInput from '../base/AppInput.vue';
import AppSelect from '../base/AppSelect.vue';
import AppButton from '../base/AppButton.vue';
import AppMultiDatePicker from '../base/AppMultiDatePicker.vue';
import './AddCourseDialog.scss';  // 引入樣式文件 Import style file

export default {
  ...dialog,
  components: {
    AppDialog,
    AppInput,
    AppSelect,
    AppButton,
    AppMultiDatePicker
  }
};
</script>

<style lang="scss">
// 移除所有樣式代碼 Remove all style code
</style> 