// QRCode 表格相關的配置和操作
// QRCode table related configurations and operations
import { h } from 'vue';
import axios from 'axios';
import { API_BASE_URL } from '@/utils/api';

// 配置 axios 基礎 URL Configure axios base URL
axios.defaults.baseURL = API_BASE_URL;

// 配置 axios 請求攔截器 Configure axios request interceptor
axios.interceptors.request.use(
  (config) => {
    // 從 localStorage 獲取 token Get token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      // 添加認證頭 Add authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// 配置 axios 響應攔截器 Configure axios response interceptor
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Response interceptor error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    return Promise.reject(error);
  }
);

// 格式化日期函數 Format date function
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

// QRCode 圖片載入錯誤處理 QR Code image error handling
const handleImageError = (event) => {
  // 設置預設圖片 Set default placeholder image
  event.target.src = '/images/qrcode-placeholder.png';
  // 記錄錯誤 Log the error
  console.warn('QR Code image failed to load:', event.target.alt);
};

// QRCode 表格列定義 QRCode table column definitions
export const qrcodeColumns = [
  {
    key: 'id',
    title: 'ID',
    width: 80,
    align: 'center'
  },
  {
    key: 'qrcode_url',
    title: 'QRCode',
    width: 100,
    align: 'center',
    render: (row) => {
      // 使用完整的後端 URL Use complete backend URL
      const fullUrl = row.qrcode_url.startsWith('http') 
        ? row.qrcode_url 
        : `${API_BASE_URL}${row.qrcode_url}`;
      return h('img', {
        src: fullUrl,
        alt: row.name || 'QRCode',
        style: {
          width: '50px',
          height: '50px',
          objectFit: 'contain'
        },
        onError: (event) => handleImageError(event)
      });
    }
  },
  {
    key: 'name',
    title: '名稱',
    width: 200
  },
  {
    key: 'scan_count',
    title: '掃描次數',
    width: 100,
    align: 'center'
  },
  {
    key: 'actual_url',
    title: '目標連結',
    width: 300
  },
  {
    key: 'created_at',
    title: '創建時間',
    width: 160,
    render: (row) => formatDate(row.created_at)
  }
];

// 獲取 QR Code 列表 Get QR Code list
export const fetchQRCodes = async () => {
  try {
    const response = await axios.get('/qrcode');
    return response.data.data;
  } catch (error) {
    console.error('獲取 QR Code 列表失敗 Failed to fetch QR Code list:', error);
    throw error;
  }
};

// 創建 QR Code Create QR Code
export const createQRCode = async (data) => {
  try {
    const response = await axios.post('/qrcode', data);
    return response.data.data;
  } catch (error) {
    console.error('創建 QR Code 失敗 Failed to create QR Code:', error);
    throw error;
  }
};

// 更新 QR Code Update QR Code
export const updateQRCode = async (id, data) => {
  try {
    const response = await axios.put(`/qrcode/${id}`, data);
    return response.data.data;
  } catch (error) {
    console.error('更新 QR Code 失敗 Failed to update QR Code:', error);
    throw error;
  }
};

// 刪除 QR Code Delete QR Code
export const deleteQRCode = async (id) => {
  try {
    await axios.delete(`/qrcode/${id}`);
  } catch (error) {
    console.error('刪除 QR Code 失敗 Failed to delete QR Code:', error);
    throw error;
  }
}; 