import { createApp } from 'vue';
import AppMessage from '../components/base/AppMessage.vue';

/**
 * 訊息服務 Message service
 * 用於在應用中顯示訊息 Used to display messages in the application
 */
const Message = {
  /**
   * 顯示訊息 Show message
   * @param {Object} options - 訊息選項 Message options
   * @param {String} options.message - 訊息內容 Message content
   * @param {String} options.type - 訊息類型 Message type (success, error, warning, info)
   * @param {Number} options.duration - 顯示時間（毫秒） Display time (ms)
   * @returns {Object} 訊息實例 Message instance
   */
  show(options) {
    // 創建訊息容器 Create message container
    const messageNode = document.createElement('div');
    document.body.appendChild(messageNode);
    
    // 創建訊息實例 Create message instance
    const messageApp = createApp(AppMessage, {
      ...options,
      onClose: () => {
        // 關閉後移除訊息 Remove message after close
        setTimeout(() => {
          messageApp.unmount();
          document.body.removeChild(messageNode);
        }, 300);
      }
    });
    
    // 掛載訊息 Mount message
    messageApp.mount(messageNode);
    
    // 返回訊息實例 Return message instance
    return {
      close: () => {
        // 手動關閉訊息 Manually close message
        messageApp.unmount();
        document.body.removeChild(messageNode);
      }
    };
  },
  
  /**
   * 顯示成功訊息 Show success message
   * @param {String} message - 訊息內容 Message content
   * @param {Number} duration - 顯示時間（毫秒） Display time (ms)
   * @returns {Object} 訊息實例 Message instance
   */
  success(message, duration = 3000) {
    return this.show({
      message,
      type: 'success',
      duration
    });
  },
  
  /**
   * 顯示錯誤訊息 Show error message
   * @param {String} message - 訊息內容 Message content
   * @param {Number} duration - 顯示時間（毫秒） Display time (ms)
   * @returns {Object} 訊息實例 Message instance
   */
  error(message, duration = 3000) {
    return this.show({
      message,
      type: 'error',
      duration
    });
  },
  
  /**
   * 顯示警告訊息 Show warning message
   * @param {String} message - 訊息內容 Message content
   * @param {Number} duration - 顯示時間（毫秒） Display time (ms)
   * @returns {Object} 訊息實例 Message instance
   */
  warning(message, duration = 3000) {
    return this.show({
      message,
      type: 'warning',
      duration
    });
  },
  
  /**
   * 顯示信息訊息 Show info message
   * @param {String} message - 訊息內容 Message content
   * @param {Number} duration - 顯示時間（毫秒） Display time (ms)
   * @returns {Object} 訊息實例 Message instance
   */
  info(message, duration = 3000) {
    return this.show({
      message,
      type: 'info',
      duration
    });
  }
};

// 導出訊息服務 Export message service
export default Message; 