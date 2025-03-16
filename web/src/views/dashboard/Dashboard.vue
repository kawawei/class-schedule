<template>
  <div class="dashboard">
    <!-- 頂部導航欄 Top navigation bar -->
    <AppHeader 
      title="才藝老師管理系統" 
      :userName="user.name" 
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
          <router-link to="/schedule" class="quick-access-card">
            <div class="quick-access-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <div class="quick-access-title">排課管理</div>
            <div class="quick-access-description">管理老師課程排程</div>
          </router-link>
          
          <div class="quick-access-card">
            <div class="quick-access-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div class="quick-access-title">老師管理</div>
            <div class="quick-access-description">管理才藝老師資料</div>
          </div>
          
          <div class="quick-access-card">
            <div class="quick-access-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <div class="quick-access-title">教材管理</div>
            <div class="quick-access-description">管理教學教材資源</div>
          </div>
          
          <div class="quick-access-card">
            <div class="quick-access-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <div class="quick-access-title">課程管理</div>
            <div class="quick-access-description">管理課程類型與內容</div>
          </div>
        </div>

        <!-- 統計卡片區域 Statistics cards area -->
        <div class="stats-grid">
          <StatCard 
            title="老師總數" 
            value="24" 
            change="+3" 
            compareText="上月" 
            changeType="success"
            iconBgColor="rgba(0, 113, 227, 0.1)"
            iconColor="var(--color-primary)"
          >
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon" style="color: var(--color-primary);">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </template>
          </StatCard>

          <StatCard 
            title="本週課程" 
            value="42" 
            change="+5" 
            compareText="上週" 
            changeType="success"
            iconBgColor="rgba(52, 199, 89, 0.1)"
            iconColor="var(--color-success)"
          >
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon" style="color: var(--color-success);">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </template>
          </StatCard>

          <StatCard 
            title="教材使用" 
            value="128" 
            change="+12%" 
            compareText="上月" 
            changeType="warning"
            iconBgColor="rgba(255, 149, 0, 0.1)"
            iconColor="var(--color-warning)"
          >
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon" style="color: var(--color-warning);">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </template>
          </StatCard>

          <StatCard 
            title="平均課時" 
            value="1.5小時" 
            change="持平" 
            compareText="上月" 
            changeType="info"
            iconBgColor="rgba(90, 200, 250, 0.1)"
            iconColor="var(--color-info)"
          >
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon" style="color: var(--color-info);">
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
                <router-link to="/schedule">
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
              time="今天 08:45" 
              type="primary"
            >
              新增老師 <strong>林小芳</strong>
            </ActivityItem>
            
            <ActivityItem 
              time="昨天 16:30" 
              type="success"
            >
              更新課程 <strong>吉他進階</strong> 時間
            </ActivityItem>
            
            <ActivityItem 
              time="昨天 14:15" 
              type="warning"
            >
              教材 <strong>兒童繪畫套組</strong> 庫存不足
            </ActivityItem>
            
            <ActivityItem 
              time="2天前 10:20" 
              type="info"
            >
              生成 <strong>7月份薪資報表</strong>
            </ActivityItem>
          </div>
        </AppCard>
      </div>
    </main>
  </div>
</template>

<script>
// 導入儀表板腳本 Import dashboard script
import dashboardScript from './dashboard.js';

// 導出儀表板組件 Export dashboard component
export default dashboardScript;
</script>

<style lang="scss" scoped>
// 導入儀表板樣式 Import dashboard styles
@import './dashboard.scss';
</style> 