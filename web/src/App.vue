<template>
  <div class="app-container">
    <router-view />
  </div>
</template>

<script>
import { onMounted } from 'vue';
import { initWebSocket, closeWebSocket } from '@/utils/websocket';
import Message from '@/utils/message';
import courseDataService from '@/services/courseDataService';
import { courseAPI } from '@/utils/api';

export default {
  name: 'App',
  
  data() {
    return {
      wsInitialized: false,
      notificationHandler: null // 保存通知處理器的引用 Store reference to notification handler
    };
  },

  created() {
    // 請求通知權限
    // Request notification permission
    this.requestNotificationPermission();

    // 監聽用戶登入狀態
    // Listen to user login status
    this.$watch(
      () => {
        try {
          return JSON.parse(localStorage.getItem('user'));
        } catch (error) {
          console.error('[App] 解析用戶數據失敗 Failed to parse user data:', error);
          return null;
        }
      },
      (newUser) => {
        console.log('[App] 用戶狀態變更 User status changed:', newUser);
        if (newUser && (newUser.role === 'admin' || newUser.role === 'tenant')) {
          // 如果是管理員用戶，初始化 WebSocket
          // If it's an admin user, initialize WebSocket
          if (!this.wsInitialized) {
            console.log('[App] 初始化 WebSocket Initialize WebSocket');
            // 創建新的通知處理器
            // Create new notification handler
            this.notificationHandler = this.handleNotification.bind(this);
            window.addEventListener('ws-notification', this.notificationHandler);
            initWebSocket(newUser.id, newUser.role);
            this.wsInitialized = true;
          }
        } else {
          // 如果不是管理員或登出，關閉 WebSocket
          // If not admin or logged out, close WebSocket
          if (this.wsInitialized) {
            console.log('[App] 關閉 WebSocket Close WebSocket');
            if (this.notificationHandler) {
              window.removeEventListener('ws-notification', this.notificationHandler);
              this.notificationHandler = null;
            }
            closeWebSocket();
            this.wsInitialized = false;
          }
        }
      },
      { immediate: true }
    );
  },

  beforeUnmount() {
    console.log('[App] 移除 WebSocket 通知事件監聽器 Removing WebSocket notification event listener');
    // 清理事件監聽
    // Clean up event listener
    if (this.notificationHandler) {
      window.removeEventListener('ws-notification', this.notificationHandler);
      this.notificationHandler = null;
    }
    closeWebSocket();
  },

  methods: {
    // 請求通知權限
    // Request notification permission
    async requestNotificationPermission() {
      try {
        if (!("Notification" in window)) {
          console.log('瀏覽器不支持通知 Browser does not support notifications');
          return;
        }

        if (Notification.permission === "granted") {
          return;
        }

        if (Notification.permission !== "denied") {
          const permission = await Notification.requestPermission();
          console.log('通知權限狀態 Notification permission status:', permission);
        }
      } catch (error) {
        console.error('請求通知權限失敗 Failed to request notification permission:', error);
      }
    },

    handleNotification(event) {
      console.log('[App] 收到通知事件 Received notification event:', event);
      const notification = event.detail;
      console.log('[App] 通知詳情 Notification details:', notification);
      
      try {
        if (notification.type === 'teacher_departed') {
          console.log('[App] 顯示老師出發通知 Showing teacher departure notification');
          const coordinates = notification.location?.coordinates;
          
          // 使用 OpenStreetMap Nominatim API 將座標轉換為地址
          // Using OpenStreetMap Nominatim API to convert coordinates to address
          if (coordinates) {
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.latitude}&lon=${coordinates.longitude}&zoom=18&accept-language=zh-TW`, {
              headers: {
                'Accept-Language': 'zh-TW',
                'User-Agent': 'ClassScheduleApp/1.0'
              }
            })
              .then(response => response.json())
              .then(data => {
                if (data && data.display_name) {
                  // 只取地址的第一個部分（通常是最具體的地點名稱）
                  // Only take the first part of the address (usually the most specific location name)
                  const addressParts = data.display_name.split(',');
                  const mainLocation = addressParts[0].trim();
                  
                  Message.info({
                    message: `${notification.teacherName} 已從 ${mainLocation} 前往${notification.schoolName}`,
                    type: 'info',
                    duration: 0
                  });
                } else {
                  throw new Error('無法獲取地址 Unable to get address');
                }
              })
              .catch(error => {
                console.error('[App] 地址轉換失敗 Address conversion failed:', error);
                Message.info({
                  message: `${notification.teacherName} 已從 目前位置 前往${notification.schoolName}`,
                  type: 'info',
                  duration: 0
                });
              });
          } else {
            Message.info({
              message: `${notification.teacherName} 已從 目前位置 前往${notification.schoolName}`,
              type: 'info',
              duration: 0
            });
          }
        } else if (notification.type === 'teacher_arrived') {
          console.log('[App] 顯示老師抵達通知 Showing teacher arrival notification');
          Message.success({
            message: `${notification.teacherName} 已抵達${notification.schoolName}`,
            type: 'success',
            duration: 0
          });
        } else {
          console.log('[App] 未知的通知類型 Unknown notification type:', notification.type);
        }
      } catch (error) {
        console.error('[App] 處理通知時出錯 Error handling notification:', error);
        console.error('[App] 通知數據 Notification data:', notification);
      }
    }
  },

  setup() {
    // 初始化課程數據 Initialize course data
    const initializeCourseData = async () => {
      try {
        // 使用 courseAPI 獲取課程數據 Get course data using courseAPI
        const response = await courseAPI.getAllCourses();
        
        if (response.success) {
          // 設置課程數據到服務中 Set course data to service
          courseDataService.setCourses(response.data);
        } else {
          console.error('初始化課程數據失敗 Failed to load course data:', response.message);
        }
      } catch (error) {
        console.error('初始化課程數據失敗 Failed to load course data:', error);
      }
    };

    // 組件掛載時獲取數據 Get data when component is mounted
    onMounted(() => {
      initializeCourseData();
    });

    return {
      // 如果需要在模板中使用，可以返回相關方法或數據
      // Return methods or data if needed in template
      initializeCourseData
    };
  }
}
</script>

<style lang="scss">
@use 'sass:color'; // 導入 sass:color 模塊 Import sass:color module

.app-container {
  min-height: 100vh; // 最小高度為視窗高度 Minimum height is viewport height
  display: flex; // 使用彈性布局 Use flexbox layout
  flex-direction: column; // 垂直排列 Vertical arrangement
}
</style> 