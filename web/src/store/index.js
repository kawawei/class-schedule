// 導入依賴 Import dependencies
import { createStore } from 'vuex';

// 創建 store Create store
export default createStore({
  state: {
    // 用戶信息 User information
    user: JSON.parse(localStorage.getItem('user')) || null,
    // 公司信息 Company information
    company: JSON.parse(localStorage.getItem('companyData')) || null,
    // 認證狀態 Authentication status
    isAuthenticated: localStorage.getItem('isAuthenticated') === 'true'
  },
  
  mutations: {
    // 設置用戶信息 Set user information
    SET_USER(state, user) {
      state.user = user;
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('user');
      }
    },
    
    // 設置公司信息 Set company information
    SET_COMPANY(state, company) {
      state.company = company;
      if (company) {
        localStorage.setItem('companyData', JSON.stringify(company));
      } else {
        localStorage.removeItem('companyData');
      }
    },
    
    // 設置認證狀態 Set authentication status
    SET_AUTH_STATUS(state, status) {
      state.isAuthenticated = status;
      if (status) {
        localStorage.setItem('isAuthenticated', 'true');
      } else {
        localStorage.removeItem('isAuthenticated');
      }
    }
  },
  
  actions: {
    // 登入操作 Login operation
    login({ commit }, { user, company }) {
      commit('SET_USER', user);
      commit('SET_COMPANY', company);
      commit('SET_AUTH_STATUS', true);
    },
    
    // 登出操作 Logout operation
    logout({ commit }) {
      commit('SET_USER', null);
      commit('SET_COMPANY', null);
      commit('SET_AUTH_STATUS', false);
      localStorage.removeItem('token');
      localStorage.removeItem('companyCode');
    }
  },
  
  getters: {
    // 獲取用戶信息 Get user information
    user: state => state.user,
    // 獲取公司信息 Get company information
    company: state => state.company,
    // 獲取認證狀態 Get authentication status
    isAuthenticated: state => state.isAuthenticated,
    // 獲取用戶角色 Get user role
    userRole: state => state.user?.role || null
  }
}); 