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
    console.log('[Message] 創建新消息 Creating new message:', options);
    
    // 創建訊息容器 Create message container
    const messageNode = document.createElement('div');
    document.body.appendChild(messageNode);
    
    // 創建訊息實例 Create message instance
    const messageApp = createApp(AppMessage, {
      ...options,
      onClose: () => {
        console.log('[Message] 關閉消息 Closing message:', options);
        // 關閉後移除訊息 Remove message after close
        messageApp.unmount();
        document.body.removeChild(messageNode);
        console.log('[Message] 消息已移除 Message removed');
      }
    });
    
    // 掛載訊息 Mount message
    console.log('[Message] 掛載消息組件 Mounting message component');
    messageApp.mount(messageNode);
    
    // 返回訊息實例 Return message instance
    return {
      close: () => {
        console.log('[Message] 手動關閉消息 Manually closing message');
        // 手動關閉訊息 Manually close message
        messageApp._instance.exposed.close();
      }
    };
  },
  
  /**
   * 顯示成功訊息 Show success message
   * @param {Object|String} options - 訊息選項或訊息內容 Message options or content
   * @returns {Object} 訊息實例 Message instance
   */
  success(options) {
    console.log('[Message] 顯示成功消息 Showing success message:', options);
    const messageOptions = typeof options === 'string' ? { message: options } : options;
    return this.show({
      type: 'success',
      duration: 3000,
      ...messageOptions
    });
  },
  
  /**
   * 顯示信息訊息 Show info message
   * @param {Object|String} options - 訊息選項或訊息內容 Message options or content
   * @returns {Object} 訊息實例 Message instance
   */
  info(options) {
    console.log('[Message] 顯示信息消息 Showing info message:', options);
    const messageOptions = typeof options === 'string' ? { message: options } : options;
    return this.show({
      type: 'info',
      duration: 3000,
      ...messageOptions
    });
  },
  
  /**
   * 顯示警告訊息 Show warning message
   * @param {Object|String} options - 訊息選項或訊息內容 Message options or content
   * @returns {Object} 訊息實例 Message instance
   */
  warning(options) {
    console.log('[Message] 顯示警告消息 Showing warning message:', options);
    const messageOptions = typeof options === 'string' ? { message: options } : options;
    return this.show({
      type: 'warning',
      duration: 3000,
      ...messageOptions
    });
  },
  
  /**
   * 顯示錯誤訊息 Show error message
   * @param {Object|String} options - 訊息選項或訊息內容 Message options or content
   * @returns {Object} 訊息實例 Message instance
   */
  error(options) {
    console.log('[Message] 顯示錯誤消息 Showing error message:', options);
    const messageOptions = typeof options === 'string' ? { message: options } : options;
    return this.show({
      type: 'error',
      duration: 3000,
      ...messageOptions
    });
  }
};

// 導出訊息服務 Export message service
export default Message; 