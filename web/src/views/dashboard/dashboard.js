// 儀表板腳本 Dashboard script
import { authAPI } from '../../utils/api';

/**
 * 儀表板組件導出 Dashboard component export
 * @returns {Object} 儀表板組件配置 Dashboard component configuration
 */
export default {
  name: 'Dashboard',
  data() {
    return {
      // 用戶信息 User information
      user: {
        name: '管理員',
        avatar: '/images/avatar.png'
      },
      // 今日課程表格列定義 Today's classes table column definitions
      todayClassesColumns: [
        { key: 'time', title: '時間' },
        { key: 'courseName', title: '課程名稱' },
        { key: 'teacher', title: '老師' },
        { key: 'location', title: '地點' },
        { key: 'status', title: '狀態' }
      ],
      // 今日課程數據 Today's classes data
      todayClassesData: [
        { 
          id: 1, 
          time: '09:00 - 10:30', 
          courseName: '兒童繪畫', 
          teacher: '王小明', 
          location: '台北市大安區', 
          status: 'completed' 
        },
        { 
          id: 2, 
          time: '11:00 - 12:30', 
          courseName: '鋼琴基礎', 
          teacher: '李美玲', 
          location: '台北市信義區', 
          status: 'in-progress' 
        },
        { 
          id: 3, 
          time: '14:00 - 15:30', 
          courseName: '兒童舞蹈', 
          teacher: '張小華', 
          location: '台北市中山區', 
          status: 'upcoming' 
        },
        { 
          id: 4, 
          time: '16:00 - 17:30', 
          courseName: '小提琴入門', 
          teacher: '陳大明', 
          location: '台北市松山區', 
          status: 'upcoming' 
        }
      ],
      // 登出狀態 Logout state
      isLoggingOut: false
    }
  },
  created() {
    // 從 localStorage 獲取用戶信息 Get user information from localStorage
    this.getUserInfo();
  },
  methods: {
    /**
     * 獲取用戶信息 Get user information
     */
    getUserInfo() {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          this.user = userData;
        } catch (error) {
          console.error('解析用戶信息時出錯:', error); // Error parsing user information
        }
      }
    },
    
    /**
     * 處理課程點擊事件 Handle class click event
     * @param {Object} row - 被點擊的行數據 Clicked row data
     */
    handleClassClick(row) {
      console.log('課程點擊:', row);
      // 這裡可以添加導航到課程詳情頁的邏輯 Add navigation to class detail page logic here
    },
    
    /**
     * 登出系統 Logout from the system
     */
    async logout() {
      try {
        // 設置登出狀態 Set logout state
        this.isLoggingOut = true;
        
        // 調用登出 API Call logout API
        await authAPI.logout();
        
        // 導航到登入頁面 Navigate to login page
        this.$router.push({ name: 'Login' });
      } catch (error) {
        console.error('登出時出錯:', error); // Error during logout
      } finally {
        this.isLoggingOut = false;
      }
    }
  }
} 