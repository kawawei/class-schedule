/**
 * WebSocket 連接管理工具
 * WebSocket Connection Management Utility
 */

let ws = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

/**
 * 初始化 WebSocket 連接
 * Initialize WebSocket connection
 * @param {string} userId - 用戶ID User ID
 * @param {string} role - 用戶角色 User Role
 */
export const initWebSocket = (userId, role) => {
  // 如果已經有連接，先關閉
  // If there's an existing connection, close it first
  if (ws) {
    console.log('[WebSocket] 關閉現有的連接 Close existing connection');
    ws.close();
  }

  try {
    // 創建新的 WebSocket 連接
    // Create new WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.hostname}/ws`;
    console.log('[WebSocket] 嘗試連接到服務器 Attempting to connect to server:', wsUrl);
    console.log('[WebSocket] 用戶信息 User info:', { userId, role });
    
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('[WebSocket] 連接已建立 Connection established');
      reconnectAttempts = 0;
      
      // 如果是管理員，發送身份識別
      // If it's an admin, send identification
      if (role === 'admin' || role === 'tenant') {
        const identifyMessage = {
          type: 'admin_connect',
          userId
        };
        console.log('[WebSocket] 發送管理員身份識別 Sending admin identification:', identifyMessage);
        ws.send(JSON.stringify(identifyMessage));
      }
    };

    ws.onmessage = (event) => {
      try {
        console.log('[WebSocket] 收到原始消息 Received raw message:', event.data);
        let data;
        try {
          data = JSON.parse(event.data);
        } catch (parseError) {
          console.error('[WebSocket] 解析消息失敗 Failed to parse message:', parseError);
          return;
        }
        console.log('[WebSocket] 解析後的消息 Parsed message:', data);
        
        // 檢查消息格式
        // Check message format
        if (!data || typeof data !== 'object') {
          console.error('[WebSocket] 無效的消息格式 Invalid message format');
          return;
        }

        // 處理不同類型的消息
        // Handle different types of messages
        switch (data.type) {
          case 'notification':
            console.log('[WebSocket] 收到通知消息 Received notification message:', data.data);
            if (!data.data) {
              console.error('[WebSocket] 通知消息缺少數據 Notification message missing data');
              return;
            }
            // 觸發通知事件
            // Trigger notification event
            const notificationEvent = new CustomEvent('ws-notification', {
              detail: data.data
            });
            console.log('[WebSocket] 觸發通知事件 Triggering notification event');
            window.dispatchEvent(notificationEvent);
            break;

          case 'connection_success':
            console.log('[WebSocket] 連接成功確認 Connection success confirmation:', data);
            break;

          default:
            console.log('[WebSocket] 未知的消息類型 Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('[WebSocket] 處理消息時出錯 Error processing message:', error);
        console.error('[WebSocket] 原始消息 Raw message:', event.data);
      }
    };

    ws.onclose = (event) => {
      console.log('[WebSocket] 連接已關閉 Connection closed:', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean
      });
      
      // 如果不是主動關閉且重試次數未達上限，嘗試重新連接
      // If not actively closed and retry attempts not exceeded, try to reconnect
      if (!event.wasClean && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        console.log(`[WebSocket] 嘗試第 ${reconnectAttempts} 次重新連接 Attempting reconnection ${reconnectAttempts}`);
        setTimeout(() => {
          initWebSocket(userId, role);
        }, 5000 * Math.pow(2, reconnectAttempts - 1)); // 指數退避 Exponential backoff
      }
    };

    ws.onerror = (error) => {
      console.error('[WebSocket] 發生錯誤 Error occurred:', error);
    };
  } catch (error) {
    console.error('[WebSocket] 初始化時出錯 Error during initialization:', error);
  }
};

/**
 * 關閉 WebSocket 連接
 * Close WebSocket connection
 */
export const closeWebSocket = () => {
  if (ws) {
    console.log('[WebSocket] 主動關閉連接 Actively closing connection');
    ws.close();
    ws = null;
    reconnectAttempts = 0;
  }
}; 