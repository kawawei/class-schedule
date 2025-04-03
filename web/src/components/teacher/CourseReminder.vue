<!-- 老師課程提醒組件 Teacher Course Reminder Component -->
<template>
  <div class="course-reminder">
    <!-- 提醒對話框 Reminder Dialog -->
    <AppDialog
      v-model="showReminderDialog"
      title="課程提醒 Course Reminder"
      width="90%"
      :close-on-click-modal="false"
      class="mobile-dialog"
    >
      <div class="reminder-content">
        <div class="course-info">
          <h3>{{ upcomingCourse?.className || '課程' }}</h3>
          <p class="time">
            <i class="icon-time"></i>
            {{ formatDateTime(upcomingCourse?.date, upcomingCourse?.startTime) }}
          </p>
          <p class="location">
            <i class="icon-location"></i>
            {{ upcomingCourse?.schoolName }}
          </p>
        </div>
        
        <div class="action-buttons">
          <AppButton 
            type="primary" 
            class="departure-btn"
            @click="handleDeparture"
          >
            確認出發 Confirm Departure
          </AppButton>
        </div>
      </div>
    </AppDialog>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { scheduleAPI, teacherReportAPI } from '@/utils/api'
import Message from '@/utils/message'
import AppDialog from '@/components/base/AppDialog.vue'
import AppButton from '@/components/base/AppButton.vue'

export default {
  name: 'CourseReminder',
  
  components: {
    AppDialog,
    AppButton
  },
  
  setup() {
    // 顯示提醒對話框 Show reminder dialog
    const showReminderDialog = ref(false)
    // 即將開始的課程 Upcoming course
    const upcomingCourse = ref(null)
    // 檢查間隔 Check interval
    let checkInterval = null
    // 記錄已確認出發的課程 Record confirmed departure courses
    const confirmedDepartures = ref(new Set())
    
    // 格式化日期時間 Format date time
    const formatDateTime = (date, time) => {
      if (!date || !time) return ''
      const dateObj = new Date(date)
      return format(dateObj, 'MM/dd (EEEE)', { locale: zhTW }) + ' ' + time
    }
    
    // 檢查即將開始的課程 Check upcoming courses
    const checkUpcomingCourses = async () => {
      try {
        // 獲取當前老師ID Get current teacher ID
        const userStr = localStorage.getItem('user')
        if (!userStr) return
        
        const userData = JSON.parse(userStr)
        const teacherId = userData.id
        
        // 獲取課程列表 Get course list
        const response = await scheduleAPI.getAllSchedules()
        if (!response.success) {
          console.error('獲取課程列表失敗:', response.message)
          return
        }
        
        // 過濾當前老師的課程 Filter current teacher's courses
        const teacherCourses = response.data.filter(
          schedule => schedule.teacher_id === teacherId
        )
        
        // 檢查接下來 50 分鐘內的課程 Check courses in next 50 minutes
        const now = new Date()
        const next50Minutes = new Date(now.getTime() + 50 * 60000)
        
        const upcomingCourses = teacherCourses.filter(course => {
          const courseDateTime = new Date(course.date + ' ' + course.start_time)
          return courseDateTime > now && courseDateTime <= next50Minutes
        })
        
        // 如果有即將開始的課程，檢查是否已經出發
        // If there are upcoming courses, check if already departed
        if (upcomingCourses.length > 0) {
          const courseId = upcomingCourses[0].id;
          
          // 檢查是否已有出發記錄 Check if there's departure record
          try {
            const reportResponse = await teacherReportAPI.getLocationRecords(courseId);
            const hasReport = reportResponse.success && 
                            reportResponse.data && 
                            reportResponse.data.status === 'departed';
            
            // 如果沒有出發記錄，顯示提醒對話框
            // If no departure record, show reminder dialog
            if (!hasReport) {
              upcomingCourse.value = upcomingCourses[0];
              showReminderDialog.value = true;
            }
          } catch (error) {
            console.error('檢查出發記錄失敗:', error);
          }
        }
      } catch (error) {
        console.error('檢查課程失敗:', error)
        Message.error('檢查課程時發生錯誤')
      }
    }
    
    // 獲取當前位置 Get current location
    const getCurrentLocation = () => {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('瀏覽器不支持地理位置功能'));
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            });
          },
          (error) => {
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        );
      });
    };
    
    // 處理出發 Handle departure
    const handleDeparture = async () => {
      try {
        // 獲取位置信息 Get location information
        const location = await getCurrentLocation();
        
        // 準備提交數據 Prepare submission data
        const departureData = {
          scheduleId: upcomingCourse.value.id,
          teacherId: JSON.parse(localStorage.getItem('user')).id,
          departureTime: new Date().toISOString(),
          location: location,
          status: 'departed'
        };
        
        // 提交出發記錄 Submit departure record
        const response = await teacherReportAPI.submitDeparture(departureData);
        
        if (response.success) {
          Message.success('已確認出發');
          showReminderDialog.value = false;
          // 記錄已確認出發的課程 Record confirmed departure course
          confirmedDepartures.value.add(upcomingCourse.value.id);
          
          // 震動反饋（如果支持）Vibration feedback (if supported)
          if ('vibrate' in navigator) {
            navigator.vibrate(200);
          }
        } else {
          throw new Error(response.message || '提交出發記錄失敗');
        }
      } catch (error) {
        console.error('確認出發失敗:', error);
        Message.error(error.message || '確認出發失敗');
      }
    };
    
    // 組件掛載時開始檢查 Start checking when component is mounted
    onMounted(() => {
      // 立即檢查一次 Check immediately
      checkUpcomingCourses()
      // 設置定時檢查 Set interval check
      checkInterval = setInterval(checkUpcomingCourses, 60000) // 每分鐘檢查一次 Check every minute
    })
    
    // 組件卸載時清理 Clean up when component is unmounted
    onUnmounted(() => {
      if (checkInterval) {
        clearInterval(checkInterval)
      }
    })
    
    return {
      showReminderDialog,
      upcomingCourse,
      formatDateTime,
      handleDeparture
    }
  }
}
</script>

<style scoped>
.course-reminder {
  /* 移動端優化 Mobile optimization */
  .mobile-dialog {
    margin: 0;
    
    :deep(.dialog-content) {
      margin: 0;
      position: fixed;
      left: 0;
      bottom: 0;
      width: 100%;
      border-radius: 16px 16px 0 0;
      
      .dialog-header {
        padding: 16px;
        border-bottom: 1px solid #eee;
      }
      
      .dialog-body {
        padding: 20px;
      }
    }
  }
  
  .reminder-content {
    .course-info {
      text-align: center;
      margin-bottom: 20px;
      
      h3 {
        font-size: 1.2rem;
        margin-bottom: 10px;
      }
      
      p {
        margin: 8px 0;
        color: #666;
        
        i {
          margin-right: 5px;
        }
      }
    }
    
    .action-buttons {
      .departure-btn {
        width: 100%;
        height: 44px;
        font-size: 1.1rem;
        border-radius: 22px;
      }
    }
  }
}
</style> 