<!-- 課程詳情對話框 Schedule Detail Dialog -->
<template>
  <AppDialog
    :model-value="visible"
    :title="isEditing ? '編輯課程 / Edit Course' : '課程詳情 / Course Details'"
    size="lg"
    @update:model-value="handleVisibleChange"
  >
    <div class="course-form">
      <!-- 第一行：縣市和區域 First row: County and District -->
      <div class="form-row">
        <AppInput
          v-model="formData.county"
          label="縣市 / County"
          placeholder="縣市"
          :disabled="!isEditing || isTeacher"
          required
        />
        <AppInput
          v-model="formData.district"
          label="區域 / District"
          placeholder="區域"
          :disabled="!isEditing || isTeacher"
          required
        />
      </div>

      <!-- 第二行：補習班名稱 Second row: School Name -->
      <AppInput
        v-model="formData.schoolName"
        label="補習班名稱 / School Name"
        placeholder="請輸入補習班名稱"
        :disabled="!isEditing || isTeacher"
        required
      />

      <!-- 第三行：班級名稱和老師 Third row: Class Name and Teacher -->
      <div class="form-row">
        <AppInput
          v-model="formData.className"
          label="班級名稱 / Class Name"
          placeholder="請輸入班級名稱"
          :disabled="!isEditing || isTeacher"
          required
        />
        <!-- 在非編輯模式下顯示純文本，編輯模式下顯示選擇器 -->
        <template v-if="!isEditing || isTeacher">
          <AppInput
            v-model="formData.teacherName"
            label="授課老師 / Teacher"
            :value="formData.teacherId === null ? '待訂 / Pending' : formData.teacherName"
            :disabled="true"
            required
          />
        </template>
        <AppSelect
          v-else
          v-model="formData.teacherId"
          label="授課老師 / Teacher"
          :options="[{ label: '待訂 / Pending', value: null }, ...teachers]"
          placeholder="請選擇老師"
          required
        />
      </div>

      <!-- 第四行：課程種類 Fourth row: Course Type -->
      <AppSelect
        v-model="formData.courseType"
        label="課程種類 / Course Type"
        :options="courseTypes"
        placeholder="請選擇課程種類"
        :disabled="!isEditing || isTeacher"
        required
      />

      <!-- 第五行：日期和時間 Fifth row: Date and Time -->
      <div class="form-row">
        <AppInput
          v-model="formData.date"
          label="日期 / Date"
          type="date"
          :disabled="!isEditing || isTeacher"
          required
        />
        <div class="time-inputs">
          <AppInput
            v-model="formData.startTime"
            label="開始時間 / Start Time"
            type="time"
            :disabled="!isEditing || isTeacher"
            required
          />
          <AppInput
            v-model="formData.endTime"
            label="結束時間 / End Time"
            type="time"
            :disabled="!isEditing || isTeacher"
            required
          />
        </div>
      </div>

      <!-- 第六行：費用 Sixth row: Fees -->
      <div class="form-row">
        <AppInput
          v-if="!isTeacher"
          v-model="formData.courseFee"
          label="課程費用 / Course Fee"
          type="number"
          :disabled="!isEditing || isTeacher"
          required
        />
        <AppInput
          v-model="formData.teacherFee"
          label="老師費用 / Teacher Fee"
          type="number"
          :disabled="!isEditing || isTeacher"
          required
        />
      </div>

      <!-- 第七行：備註 Seventh row: Notes -->
      <div class="form-row">
        <AppInput
          v-model="formData.notes"
          label="備註 / Notes"
          type="textarea"
          placeholder="請輸入備註"
          :disabled="!isEditing || isTeacher"
          class="notes-input"
        />
      </div>

      <!-- 助教區域 Assistant Section -->
      <div class="assistant-section" v-if="isEditing && !isTeacher">
        <div class="section-header">
          <h4>助教信息 / Assistant Information</h4>
          <AppButton
            type="primary"
            size="sm"
            @click="addAssistant"
          >
            添加助教 / Add Assistant
          </AppButton>
        </div>
        <div
          v-for="(assistant, index) in formData.assistants"
          :key="index"
          class="assistant-row"
        >
          <AppSelect
            v-model="assistant.id"
            :options="assistants"
            placeholder="請選擇助教"
            :disabled="!isEditing || isTeacher"
            required
          />
          <AppInput
            v-model="assistant.fee"
            type="number"
            placeholder="助教費用"
            :disabled="!isEditing || isTeacher"
            required
          />
          <AppButton
            v-if="isEditing && !isTeacher"
            type="danger"
            size="sm"
            @click="removeAssistant(index)"
          >
            移除 / Remove
          </AppButton>
        </div>
      </div>
    </div>

    <!-- 操作按鈕 Action Buttons -->
    <template #footer>
      <div class="dialog-footer">
        <AppButton
          v-if="!isTeacher"
          type="danger"
          @click="handleDelete"
        >
          移除 / Delete
        </AppButton>
        <AppButton
          v-if="!isEditing && !isTeacher"
          type="primary"
          @click="startEditing"
        >
          編輯 / Edit
        </AppButton>
        <AppButton
          v-if="isEditing && !isTeacher"
          type="primary"
          @click="handleSubmit"
        >
          確認 / Confirm
        </AppButton>
      </div>
    </template>
  </AppDialog>

  <!-- 刪除確認對話框 Delete Confirmation Dialog -->
  <AppDialog
    :model-value="showDeleteConfirm"
    title="確認刪除 / Confirm Delete"
    size="sm"
    @update:model-value="handleDeleteConfirmChange"
  >
    <div class="delete-confirm-content">
      <template v-if="scheduleData?.series_id">
        <p>這是重複性課程，請選擇刪除方式：</p>
        <p>This is a recurring course, please select deletion method:</p>
      </template>
      <template v-else>
        <p>確定要刪除這個課程嗎？</p>
        <p>Are you sure you want to delete this course?</p>
      </template>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <AppButton
          type="secondary"
          @click="handleDeleteCancel"
        >
          取消 / Cancel
        </AppButton>
        <template v-if="scheduleData?.series_id">
          <AppButton
            type="danger"
            @click="() => handleDeleteConfirm('single')"
          >
            單筆刪除 / Delete Single
          </AppButton>
          <AppButton
            type="danger"
            @click="() => handleDeleteConfirm('series')"
          >
            批量刪除 / Delete All
          </AppButton>
        </template>
        <AppButton
          v-else
          type="danger"
          @click="() => handleDeleteConfirm('single')"
        >
          確認刪除 / Confirm Delete
        </AppButton>
      </div>
    </template>
  </AppDialog>

  <!-- 批量修改確認對話框 Batch Update Confirmation Dialog -->
  <AppDialog
    :model-value="showBatchUpdateConfirm"
    title="批量修改確認 / Batch Update Confirmation"
    size="sm"
    @update:model-value="handleBatchUpdateConfirmChange"
  >
    <div class="batch-update-confirm-content">
      <template v-if="scheduleData?.series_id">
        <p>這是重複性課程，請選擇修改方式：</p>
        <p>This is a recurring course, please select update method:</p>
      </template>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <AppButton
          type="secondary"
          @click="handleBatchUpdateCancel"
        >
          取消 / Cancel
        </AppButton>
        <template v-if="scheduleData?.series_id">
          <AppButton
            type="primary"
            @click="() => handleBatchUpdateConfirm('single')"
          >
            僅修改當前課程 / Update Current Only
          </AppButton>
          <AppButton
            type="primary"
            @click="() => handleBatchUpdateConfirm('series')"
          >
            批量修改 / Update All Series
          </AppButton>
        </template>
      </div>
    </template>
  </AppDialog>
</template>

<script>
import AppDialog from '../base/AppDialog.vue';
import AppInput from '../base/AppInput.vue';
import AppSelect from '../base/AppSelect.vue';
import AppButton from '../base/AppButton.vue';
import scheduleDetailDialog from './ScheduleDetailDialog.js';

export default {
  ...scheduleDetailDialog,
  components: {
    AppDialog,
    AppInput,
    AppSelect,
    AppButton
  }
};
</script>

<style lang="scss" scoped>
@import './ScheduleDetailDialog.scss';
</style> 