import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './styles/main.scss';

// 導入組件 Import components
import Components from './components';

// 創建Vue應用實例 Create Vue application instance
const app = createApp(App);

// 使用路由 Use router
app.use(router);

// 註冊所有組件 Register all components
app.use(Components);

// 掛載應用到DOM Mount the app to DOM
app.mount('#app'); 