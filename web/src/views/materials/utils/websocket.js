import { ref, onUnmounted } from 'vue';

// WebSocket 工具函數 WebSocket utility function
export function useWebSocket(callback) {
  // WebSocket 連接狀態 WebSocket connection state
  const ws = ref(null);
  const isWsConnected = ref(false);

  // 連接 WebSocket Connect WebSocket
  const connectWebSocket = () => {
    if (ws.value) return; // 如果已經連接，直接返回 If already connected, return directly

    try {
      // 創建 WebSocket 連接 Create WebSocket connection
      ws.value = new WebSocket(WS_URL);
      
      // 連接成功時 Connection successful
      ws.value.onopen = () => {
        isWsConnected.value = true;
        console.log('WebSocket 連接成功 WebSocket connected');
      };
      
      // 接收消息時 On message received
      ws.value.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          callback(data); // 調用回調函數處理消息 Call callback function to handle message
        } catch (error) {
          console.error('WebSocket 消息解析失敗 WebSocket message parsing failed:', error);
        }
      };
      
      // 連接關閉時 Connection closed
      ws.value.onclose = () => {
        isWsConnected.value = false;
        console.log('WebSocket 連接關閉 WebSocket connection closed');
      };
      
      // 發生錯誤時 On error
      ws.value.onerror = (error) => {
        console.error('WebSocket 錯誤 WebSocket error:', error);
        isWsConnected.value = false;
      };
    } catch (error) {
      console.error('WebSocket 連接失敗 WebSocket connection failed:', error);
      isWsConnected.value = false;
    }
  };

  // 關閉 WebSocket 連接 Close WebSocket connection
  const closeWebSocket = () => {
    if (ws.value) {
      ws.value.close();
      ws.value = null;
      isWsConnected.value = false;
    }
  };

  // 組件卸載時自動關閉連接 Automatically close connection when component unmounts
  onUnmounted(() => {
    closeWebSocket();
  });

  return {
    ws,
    isWsConnected,
    connectWebSocket,
    closeWebSocket
  };
} 