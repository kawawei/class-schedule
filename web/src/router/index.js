import { createRouter, createWebHistory } from 'vue-router';

// 路由配置 Route configuration
const routes = [
  {
    path: '/',
    name: 'Root',
    redirect: to => {
      // 從 localStorage 獲取用戶信息 Get user info from localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          // 根據角色重定向到對應的儀表板 Redirect to corresponding dashboard based on role
          return userData.role === 'teacher' ? '/teacher/dashboard' : '/dashboard';
        } catch (error) {
          console.error('解析用戶數據時出錯 Error parsing user data:', error);
          return '/login';
        }
      }
      return '/login';
    }
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
    path: '/register',
    name: 'Register',
    component: () => import('../views/auth/Register.vue'), // 懶加載註冊頁面 Lazy load register page
    meta: {
      title: '註冊', // 頁面標題 Page title
      requiresAuth: false // 不需要身份驗證 No authentication required
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/dashboard/Dashboard.vue'),
    meta: {
      title: '管理員儀表板', // 頁面標題 Page title
      requiresAuth: true, // 需要身份驗證 Authentication required
      requiresRole: ['admin', 'staff'] // 需要管理員或職員角色 Requires admin or staff role
    }
  },
  {
    path: '/teacher/dashboard',
    name: 'TeacherDashboard',
    component: () => import('../views/teacher/Dashboard.vue'),
    meta: {
      title: '老師儀表板', // 頁面標題 Page title
      requiresAuth: true, // 需要身份驗證 Authentication required
      requiresRole: ['teacher'] // 需要老師角色 Requires teacher role
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
    path: '/teacher/schedule',
    name: 'TeacherSchedule',
    component: () => import('../views/teacher/Schedule.vue'),
    meta: {
      title: '我的課程表',
      requiresAuth: true,
      requiresRole: ['teacher']
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
  
  // 檢查是否需要身份驗證 Check if authentication is required
  if (to.meta.requiresAuth && !isAuthenticated()) {
    console.log('需要身份驗證但未登入，重定向到登入頁面 Authentication required but not logged in, redirecting to login page');
    next({ name: 'Login', query: { redirect: to.fullPath } });
    return;
  }
  
  // 檢查角色權限 Check role permissions
  if (to.meta.requiresRole) {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        // 檢查用戶角色是否在允許的角色列表中
        // Check if user role is in the allowed roles list
        if (!to.meta.requiresRole.includes(userData.role)) {
          console.log('用戶角色不符合要求，重定向到對應的儀表板 User role does not match requirements, redirecting to corresponding dashboard');
          // 避免重定向到當前路由，防止無限循環
          // Avoid redirecting to current route to prevent infinite loop
          const targetPath = userData.role === 'teacher' ? '/teacher/dashboard' : '/dashboard';
          if (to.path !== targetPath) {
            next(targetPath);
            return;
          }
        }
      } catch (error) {
        console.error('解析用戶數據時出錯 Error parsing user data:', error);
        next('/login');
        return;
      }
    }
  }
  
  // 如果已登入用戶訪問登入頁面，重定向到對應的儀表板
  // If logged in user visits login page, redirect to corresponding dashboard
  if (to.name === 'Login' && isAuthenticated()) {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        const targetPath = userData.role === 'teacher' ? '/teacher/dashboard' : '/dashboard';
        if (to.path !== targetPath) {
          next(targetPath);
          return;
        }
      } catch (error) {
        console.error('解析用戶數據時出錯 Error parsing user data:', error);
      }
    }
  }
  
  next();
});

export default router; 