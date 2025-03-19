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
     * 獲取用戶姓名 Get user name
     * @returns {String} 用戶姓名 User name
     */
    userName() {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        return userData?.name || '管理員';
      } catch (error) {
        console.error('解析用戶數據失敗 Failed to parse user data:', error);
        return '管理員';
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