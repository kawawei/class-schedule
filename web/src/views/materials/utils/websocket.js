// WebSocket 工具類，用於處理 WebSocket 連接和事件
// WebSocket utility class for handling WebSocket connections and events
import { ref } from 'vue';
import { API_BASE_URL } from '@/utils/api';

// WebSocket 連接 URL（將 http/https 替換為 ws/wss）
// WebSocket connection URL (replace http/https with ws/wss)
const WS_URL = API_BASE_URL.replace(/^http/, 'ws') + '/ws';

export function useWebSocket(onMessageCallback) {
  // WebSocket 相關狀態 WebSocket related state
  const ws = ref(null);
  const isWsConnected = ref(false);
  const reconnectAttempts = ref(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000; // 3 秒後重試 Retry after 3 seconds

  // 連接 WebSocket Connect WebSocket
  const connectWebSocket = () => {
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      return; // 如果已經連接，直接返回 If already connected, return directly
    }

    try {
      ws.value = new WebSocket(WS_URL);

      ws.value.onopen = () => {
        console.log('WebSocket connected');
        isWsConnected.value = true;
        reconnectAttempts.value = 0; // 重置重連次數 Reset reconnect attempts
      };

      ws.value.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (onMessageCallback) {
            onMessageCallback(data);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.value.onclose = () => {
        console.log('WebSocket disconnected');
        isWsConnected.value = false;
        
        // 嘗試重新連接 Try to reconnect
        if (reconnectAttempts.value < maxReconnectAttempts) {
          reconnectAttempts.value++;
          console.log(`Attempting to reconnect (${reconnectAttempts.value}/${maxReconnectAttempts})...`);
          setTimeout(connectWebSocket, reconnectDelay);
        }
      };

      ws.value.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  };

  // 關閉 WebSocket Close WebSocket
  const closeWebSocket = () => {
    if (ws.value) {
      ws.value.close();
      ws.value = null;
    }
  };

  return {
    ws,
    isWsConnected,
    connectWebSocket,
    closeWebSocket
  };
} 