const WebSocket = require('ws');
const { TeacherReport, CourseSchedule, Teacher } = require('../models');

let wss;
const adminClients = new Map(); // 存儲管理員的 WebSocket 連接

/**
 * 初始化 WebSocket 服務器
 * Initialize WebSocket server
 * @param {Object} server - HTTP 服務器實例 HTTP server instance
 */
const initializeWebSocket = (server) => {
  console.log('[WebSocket] 初始化 WebSocket 服務器 Initializing WebSocket server');
  wss = new WebSocket.Server({ 
    server,
    path: '/ws',  // 指定 WebSocket 路徑
    perMessageDeflate: {
      zlibDeflateOptions: {
        // See zlib defaults.
        chunkSize: 1024,
        memLevel: 7,
        level: 3
      },
      zlibInflateOptions: {
        chunkSize: 10 * 1024
      },
      // Other options settable:
      clientNoContextTakeover: true, // Defaults to negotiated value.
      serverNoContextTakeover: true, // Defaults to negotiated value.
      serverMaxWindowBits: 10, // Defaults to negotiated value.
      // Below options specified as default values.
      concurrencyLimit: 10, // Limits zlib concurrency for perf.
      threshold: 1024 // Size (in bytes) below which messages
      // should not be compressed.
    }
  });
  
  wss.on('connection', (ws, req) => {
    console.log('[WebSocket] 新的 WebSocket 連接 New WebSocket connection');
    console.log('[WebSocket] 客戶端 IP Client IP:', req.socket.remoteAddress);
    
    ws.on('message', async (message) => {
      try {
        console.log('[WebSocket] 收到消息 Received message:', message.toString());
        const data = JSON.parse(message);
        
        // 如果是管理員連接，保存其 WebSocket 連接
        if (data.type === 'admin_connect') {
          adminClients.set(data.userId, ws);
          console.log('[WebSocket] 管理員已連接 Admin connected:', data.userId);
          console.log('[WebSocket] 當前在線管理員數量 Current online admin count:', adminClients.size);
          
          // 發送連接成功確認
          ws.send(JSON.stringify({
            type: 'connection_success',
            message: '連接成功 Connection successful'
          }));
        }
      } catch (error) {
        console.error('[WebSocket] 處理消息時出錯 Error processing message:', error);
        console.error('[WebSocket] 原始消息 Raw message:', message.toString());
      }
    });
    
    ws.on('close', () => {
      // 清理斷開的連接
      for (const [userId, client] of adminClients.entries()) {
        if (client === ws) {
          adminClients.delete(userId);
          console.log('[WebSocket] 管理員已斷開連接 Admin disconnected:', userId);
          console.log('[WebSocket] 當前在線管理員數量 Current online admin count:', adminClients.size);
          break;
        }
      }
    });

    ws.on('error', (error) => {
      console.error('[WebSocket] 連接錯誤 Connection error:', error);
    });
  });
};

/**
 * 發送通知給所有管理員
 * Send notification to all admins
 * @param {Object} notification - 通知數據 Notification data
 */
const notifyAdmins = async (notification) => {
  try {
    console.log('[WebSocket] 開始發送通知 Start sending notification:', notification);
    console.log('[WebSocket] 當前在線管理員數量 Current online admin count:', adminClients.size);
    
    // 如果是老師出發通知，獲取更多信息
    if (notification.type === 'teacher_departed') {
      console.log('[WebSocket] 處理老師出發通知 Processing teacher departure notification');
      const schedule = await CourseSchedule.findByPk(notification.scheduleId, {
        include: [{ model: Teacher, as: 'teacher' }]
      });
      
      if (schedule) {
        notification.teacherName = schedule.teacher.name;
        notification.className = schedule.class_name;
        notification.schoolName = schedule.school_name;
        // 保留原始位置信息，添加學校和班級信息
        const originalLocation = notification.location;
        notification.location = {
          coordinates: originalLocation, // 保留原始的經緯度信息
          schoolInfo: {
            name: schedule.school_name,
            className: schedule.class_name
          }
        };
        console.log('[WebSocket] 添加了課程信息 Added course information:', {
          teacherName: notification.teacherName,
          className: notification.className,
          schoolName: notification.schoolName,
          location: notification.location
        });
      } else {
        console.warn('[WebSocket] 找不到相關課程信息 Course information not found');
      }
    }
    
    // 發送給所有在線的管理員
    const message = JSON.stringify({
      type: 'notification',
      data: notification,
      timestamp: new Date().toISOString()
    });
    
    console.log('[WebSocket] 準備發送的消息 Message to be sent:', message);
    
    let sentCount = 0;
    for (const [userId, ws] of adminClients.entries()) {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(message);
          console.log('[WebSocket] 成功發送通知給管理員 Successfully sent notification to admin:', userId);
          sentCount++;
        } catch (error) {
          console.error('[WebSocket] 發送通知給管理員失敗 Failed to send notification to admin:', userId, error);
        }
      } else {
        console.warn('[WebSocket] 管理員連接未開啟 Admin connection not open:', userId, 'readyState:', ws.readyState);
      }
    }
    
    console.log('[WebSocket] 通知發送完成 Notification sending completed:', {
      totalAdmins: adminClients.size,
      successfullySent: sentCount
    });
  } catch (error) {
    console.error('[WebSocket] 發送通知時出錯 Error sending notification:', error);
    console.error('[WebSocket] 錯誤詳情 Error details:', {
      error: error.message,
      stack: error.stack,
      notification
    });
  }
};

module.exports = {
  initializeWebSocket,
  notifyAdmins
}; 