import { createRouter, createWebHistory } from 'vue-router';

// 路由配置 Route configuration
const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/Login.vue'), // 懶加載登入頁面 Lazy load login page
    meta: {
      title: '登入', // 頁面標題 Page title
      requiresAuth: false // 不需要身份驗證 No authentication required
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/dashboard/Dashboard.vue'), // 懶加載儀表板頁面 Lazy load dashboard page
    meta: {
      title: '儀表板', // 頁面標題 Page title
      requiresAuth: true // 需要身份驗證 Authentication required
    }
  },
  {
    path: '/schedule',
    name: 'Schedule',
    component: () => import('../views/schedule/Schedule.vue'), // 懶加載排課管理頁面 Lazy load schedule page
    meta: {
      title: '排課管理', // 頁面標題 Page title
      requiresAuth: true // 需要身份驗證 Authentication required
    }
  },
  {
    path: '/:pathMatch(.*)*', // 捕獲所有未匹配的路由 Catch all unmatched routes
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: {
      title: '頁面未找到', // 頁面標題 Page title
      requiresAuth: false // 不需要身份驗證 No authentication required
    }
  }
];

// 創建路由實例 Create router instance
const router = createRouter({
  history: createWebHistory(), // 使用HTML5 History模式 Use HTML5 History mode
  routes
});

// 檢查用戶是否已登入 (模擬) Check if user is logged in (simulated)
const isAuthenticated = () => {
  // 從 localStorage 獲取身份驗證狀態 Get authentication status from localStorage
  return localStorage.getItem('isAuthenticated') === 'true';
};

// 路由守衛，用於身份驗證和頁面標題設置 Router guard for authentication and page title
router.beforeEach((to, from, next) => {
  // 設置頁面標題 Set page title
  document.title = to.meta.title ? `${to.meta.title} - 才藝老師管理系統` : '才藝老師管理系統';
  
  // 檢查路由是否需要身份驗證 Check if route requires authentication
  if (to.meta.requiresAuth !== false) {
    // 如果用戶未登入，重定向到登入頁面 If user is not authenticated, redirect to login page
    if (!isAuthenticated()) {
      next({ name: 'Login' });
      return;
    }
  }
  
  // 如果用戶已登入且嘗試訪問登入頁面，重定向到儀表板 If user is authenticated and tries to access login page, redirect to dashboard
  if (to.name === 'Login' && isAuthenticated()) {
    next({ name: 'Dashboard' });
    return;
  }
  
  // 繼續導航 Continue navigation
  next();
});

export default router; 