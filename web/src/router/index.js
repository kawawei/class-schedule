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
    path: '/courses',
    name: 'CourseList',
    component: () => import('../views/courses/CourseList.vue'), // 懶加載課程列表頁面 Lazy load course list page
    meta: {
      title: '課程管理', // 頁面標題 Page title
      requiresAuth: true // 需要身份驗證 Authentication required
    }
  },
  {
    path: '/teachers',
    name: 'TeacherList',
    component: () => import('../views/teachers/TeacherList.vue'), // 懶加載老師列表頁面 Lazy load teacher list page
    meta: {
      title: '老師管理', // 頁面標題 Page title
      requiresAuth: true // 需要身份驗證 Authentication required
    }
  },
  {
    path: '/teachers/new',
    name: 'NewTeacher',
    component: () => import('../views/teachers/TeacherForm.vue'), // 懶加載新增老師頁面 Lazy load new teacher page
    meta: {
      title: '新增老師', // 頁面標題 Page title
      requiresAuth: true // 需要身份驗證 Authentication required
    }
  },
  {
    path: '/teachers/:id',
    name: 'EditTeacher',
    component: () => import('../views/teachers/TeacherForm.vue'), // 懶加載編輯老師頁面 Lazy load edit teacher page
    meta: {
      title: '編輯老師', // 頁面標題 Page title
      requiresAuth: true // 需要身份驗證 Authentication required
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/setting/setting.vue'), // 懶加載基礎設置頁面 Lazy load settings page
    meta: {
      title: '基礎設置', // 頁面標題 Page title
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

// 檢查用戶是否已登入 Check if user is logged in
const isAuthenticated = () => {
  // 從 localStorage 獲取身份驗證狀態 Get authentication status from localStorage
  const authStatus = localStorage.getItem('isAuthenticated') === 'true';
  const token = localStorage.getItem('token');
  
  // 檢查令牌是否存在 Check if token exists
  if (authStatus && !token) {
    console.warn('認證狀態為真但令牌不存在 Authentication status is true but token does not exist');
    return false;
  }
  
  return authStatus;
};

// 路由守衛，用於身份驗證和頁面標題設置 Router guard for authentication and page title
router.beforeEach((to, from, next) => {
  console.log(`路由導航: 從 ${from.path} 到 ${to.path} Router navigation: from ${from.path} to ${to.path}`);
  
  // 設置頁面標題 Set page title
  document.title = to.meta.title ? `${to.meta.title} - 才藝老師管理系統` : '才藝老師管理系統';
  
  // 檢查路由是否需要身份驗證 Check if route requires authentication
  if (to.meta.requiresAuth !== false) {
    console.log(`路由 ${to.path} 需要認證 Route ${to.path} requires authentication`);
    
    // 如果用戶未登入，重定向到登入頁面 If user is not authenticated, redirect to login page
    if (!isAuthenticated()) {
      console.log('用戶未認證，重定向到登入頁面 User not authenticated, redirecting to login page');
      next({ name: 'Login' });
      return;
    }
    
    console.log('用戶已認證，允許訪問 User authenticated, allowing access');
  } else {
    console.log(`路由 ${to.path} 不需要認證 Route ${to.path} does not require authentication`);
  }
  
  // 如果用戶已登入且嘗試訪問登入頁面，重定向到儀表板 If user is authenticated and tries to access login page, redirect to dashboard
  if (to.name === 'Login' && isAuthenticated()) {
    console.log('用戶已認證且嘗試訪問登入頁面，重定向到儀表板 User authenticated and trying to access login page, redirecting to dashboard');
    next({ name: 'Dashboard' });
    return;
  }
  
  // 繼續導航 Continue navigation
  next();
});

export default router; 