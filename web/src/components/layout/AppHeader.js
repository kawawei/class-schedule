/**
 * AppHeader 組件腳本
 * AppHeader component script
 */
export default {
  name: 'AppHeader',
  emits: ['logout'],
  props: {
    // 頁面標題 Page title
    title: {
      type: String,
      default: '才藝老師管理系統'
    },
    // 用戶頭像 User avatar
    userAvatar: {
      type: String,
      default: ''
    },
    // 登出狀態 Logout state
    isLoggingOut: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      // 默認頭像 Default avatar
      defaultAvatar: 'https://ui-avatars.com/api/?name=Admin&background=0071e3&color=fff',
      // 菜單是否可見 Menu visibility
      menuVisible: false
    };
  },

  computed: {
    /**
     * 獲取用戶角色 Get user role
     * @returns {String} 用戶角色 User role
     */
    userRole() {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        return userData?.role || 'admin';
      } catch (error) {
        console.error('解析用戶數據失敗 Failed to parse user data:', error);
        return 'admin';
      }
    },

    /**
     * 獲取用戶顯示名稱 Get user display name
     * 優先顯示用戶姓名，如果沒有則顯示用戶名
     * @returns {String} 用戶顯示名稱 User display name
     */
    userName() {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        return userData?.name || userData?.username || '管理員';
      } catch (error) {
        console.error('解析用戶數據失敗 Failed to parse user data:', error);
        return '管理員';
      }
    },

    /**
     * 獲取公司名稱 Get company name
     * @returns {String} 公司名稱 Company name
     */
    companyName() {
      try {
        const companyData = JSON.parse(localStorage.getItem('companyData'));
        return companyData?.company_name || this.title;
      } catch (error) {
        console.error('獲取公司名稱失敗 Failed to get company name:', error);
        return this.title;
      }
    }
  },
  
  methods: {
    /**
     * 處理登出事件 Handle logout event
     */
    handleLogout() {
      // 觸發登出事件 Emit logout event
      this.$emit('logout');
    },
    
    /**
     * 切換菜單顯示狀態 Toggle menu visibility
     */
    toggleMenu() {
      this.menuVisible = !this.menuVisible;
      
      // 如果菜單打開，添加滾動鎖定 If menu is open, add scroll lock
      if (this.menuVisible) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    },
    
    /**
     * 關閉菜單 Close menu
     */
    closeMenu() {
      this.menuVisible = false;
      document.body.style.overflow = '';
    }
  }
}; 