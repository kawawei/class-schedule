<!-- 老師儀表板頁面 Teacher Dashboard Page -->
<template>
  <div class="dashboard">
    <!-- 頂部導航欄 Top navigation bar -->
    <AppHeader 
      title="才藝老師管理系統" 
      :userAvatar="user.avatar"
      :isLoggingOut="isLoggingOut"
      @logout="logout"
    />

    <!-- 主要內容區域 Main content area -->
    <main class="dashboard-content">
      <div class="container">
        <!-- 歡迎卡片 Welcome card -->
        <WelcomeCard :userName="user.name" />

        <!-- 快速訪問區域 Quick access area -->
        <div class="quick-access-grid">
          <router-link to="/teacher/schedule" class="quick-access-card">
            <div class="quick-access-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <div class="quick-access-title">課程表</div>
            <div class="quick-access-description">查看課程安排</div>
          </router-link>
          
          <router-link to="/teacher/attendance" class="quick-access-card">
            <div class="quick-access-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                <line x1="9" y1="14" x2="15" y2="14"></line>
                <line x1="9" y1="17" x2="15" y2="17"></line>
              </svg>
            </div>
            <div class="quick-access-title">點名記錄</div>
            <div class="quick-access-description">管理學生出勤</div>
          </router-link>
          
          <router-link to="/teacher/materials" class="quick-access-card">
            <div class="quick-access-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <div class="quick-access-title">教材資源</div>
            <div class="quick-access-description">查看教學資源</div>
          </router-link>
          
          <router-link to="/teacher/students" class="quick-access-card">
            <div class="quick-access-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div class="quick-access-title">學生管理</div>
            <div class="quick-access-description">管理學生資料</div>
          </router-link>
        </div>

        <!-- 統計卡片區域 Statistics cards area -->
        <div class="stats-grid">
          <StatCard 
            title="本週課程" 
            value="12" 
            change="+2" 
            compareText="較上週" 
            changeType="success"
            iconBgColor="rgba(0, 113, 227, 0.1)"
            iconColor="var(--color-primary)"
          >
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </template>
          </StatCard>

          <StatCard 
            title="學生人數" 
            value="45" 
            change="+5" 
            compareText="較上月" 
            changeType="success"
            iconBgColor="rgba(52, 199, 89, 0.1)"
            iconColor="var(--color-success)"
          >
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </template>
          </StatCard>

          <StatCard 
            title="出勤率" 
            value="95%" 
            change="+2%" 
            compareText="較上月" 
            changeType="warning"
            iconBgColor="rgba(255, 149, 0, 0.1)"
            iconColor="var(--color-warning)"
          >
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                <line x1="9" y1="14" x2="15" y2="14"></line>
                <line x1="9" y1="17" x2="15" y2="17"></line>
              </svg>
            </template>
          </StatCard>

          <StatCard 
            title="平均課時" 
            value="1.5小時" 
            change="持平" 
            compareText="較上月" 
            changeType="info"
            iconBgColor="rgba(90, 200, 250, 0.1)"
            iconColor="var(--color-info)"
          >
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </template>
          </StatCard>
        </div>

        <!-- 今日課程區域 Today's classes area -->
        <AppCard class="mb-lg">
          <template #header>
            <SectionHeader title="今日課程">
              <template #actions>
                <router-link to="/teacher/schedule">
                  <AppButton type="secondary" text="查看全部" />
                </router-link>
              </template>
            </SectionHeader>
          </template>

          <DataTable 
            :columns="todayClassesColumns" 
            :data="todayClassesData"
            rowClickable
            @row-click="handleClassClick"
          >
            <template #status="{ row }">
              <StatusBadge :status="row.status" />
            </template>
          </DataTable>
        </AppCard>

        <!-- 最近活動區域 Recent activities area -->
        <AppCard>
          <template #header>
            <SectionHeader title="最近活動">
              <template #actions>
                <AppButton type="secondary" text="查看全部" />
              </template>
            </SectionHeader>
          </template>

          <div class="activities-list">
            <ActivityItem 
              v-for="activity in recentActivities"
              :key="activity.id"
              :time="activity.time"
              :type="activity.type"
            >
              {{ activity.content }}
            </ActivityItem>
          </div>
        </AppCard>
      </div>
    </main>
  </div>
</template>

<script>
// 導入必要的依賴 Import necessary dependencies
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  AppHeader,
  WelcomeCard,
  AppCard,
  SectionHeader,
  AppButton,
  DataTable,
  StatusBadge,
  StatCard,
  ActivityItem
} from '@/components';
import { authAPI } from '@/utils/api';

export default {
  name: 'TeacherDashboard',
  components: {
    AppHeader,
    WelcomeCard,
    AppCard,
    SectionHeader,
    AppButton,
    DataTable,
    StatusBadge,
    StatCard,
    ActivityItem
  },
  setup() {
    const router = useRouter();
    
    // 用戶信息 User information
    const user = ref({
      name: '',
      avatar: '/images/avatar.png'
    });
    
    // 登出狀態 Logout state
    const isLoggingOut = ref(false);
    
    // 今日課程表格列定義 Today's classes table column definitions
    const todayClassesColumns = ref([
      { key: 'time', title: '時間' },
      { key: 'courseName', title: '課程名稱' },
      { key: 'location', title: '地點' },
      { key: 'status', title: '狀態' }
    ]);
    
    // 今日課程數據 Today's classes data
    const todayClassesData = ref([
      {
        id: 1,
        time: '09:00 - 10:30',
        courseName: '兒童繪畫基礎',
        location: '台北市大安區',
        status: 'upcoming'
      },
      {
        id: 2,
        time: '14:00 - 15:30',
        courseName: '進階水彩技法',
        location: '台北市信義區',
        status: 'upcoming'
      }
    ]);

    // 最近活動 Recent activities
    const recentActivities = ref([
      {
        id: 1,
        time: '今天 08:45',
        type: 'primary',
        content: '完成 兒童繪畫基礎 課程'
      },
      {
        id: 2,
        time: '昨天 16:30',
        type: 'success',
        content: '更新 進階水彩技法 教材'
      },
      {
        id: 3,
        time: '昨天 14:15',
        type: 'warning',
        content: '學生 王小明 請假通知'
      },
      {
        id: 4,
        time: '2天前 10:20',
        type: 'info',
        content: '提交 7月份課程報告'
      }
    ]);
    
    /**
     * 處理課程點擊事件 Handle class click event
     * @param {Object} row - 被點擊的行數據 Clicked row data
     */
    const handleClassClick = (row) => {
      console.log('課程點擊:', row);
      router.push(`/teacher/classes/${row.id}`);
    };
    
    /**
     * 處理登出 Handle logout
     */
    const logout = async () => {
      isLoggingOut.value = true;
      try {
        await authAPI.logout();
        router.push('/login');
      } catch (error) {
        console.error('登出失敗 Logout failed:', error);
      } finally {
        isLoggingOut.value = false;
      }
    };
    
    /**
     * 獲取用戶信息 Get user information
     */
    const getUserInfo = () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          user.value = userData;
        } catch (error) {
          console.error('解析用戶信息時出錯 Error parsing user information:', error);
        }
      }
    };
    
    // 組件掛載時獲取用戶信息 Get user information when component mounts
    onMounted(() => {
      getUserInfo();
    });
    
    return {
      user,
      isLoggingOut,
      todayClassesColumns,
      todayClassesData,
      recentActivities,
      handleClassClick,
      logout
    };
  }
};
</script>

<style lang="scss" scoped>
// 導入儀表板樣式 Import dashboard styles
@import '@/views/dashboard/dashboard.scss';
</style> 