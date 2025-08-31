<!-- 掃描器組件 Scanner Component -->
<template>
  <div class="scanner-container">
    <!-- 掃描器視窗 Scanner Window -->
    <div class="scanner-window">
      <video ref="videoRef" class="scanner-video"></video>
      <!-- 掃描框 Scan Frame -->
      <div class="scanner-frame">
        <div class="corner top-left"></div>
        <div class="corner top-right"></div>
        <div class="corner bottom-left"></div>
        <div class="corner bottom-right"></div>
      </div>
    </div>
    
    <!-- 掃描器控制區 Scanner Controls -->
    <!--
    <div class="scanner-controls">
      <AppButton @click="closeScanner">
        關閉掃描器
      </AppButton>
    </div>
    -->
  </div>
</template>

<script>
// 引入所需的組件和工具 Import required components and utilities
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { BrowserMultiFormatReader } from '@zxing/library'
import AppButton from './AppButton.vue'
import Message from '@/utils/message'

export default {
  name: 'Scanner',
  
  components: {
    AppButton
  },
  
  emits: ['close', 'scan-result'],
  
  setup(props, { emit }) {
    // 視頻元素引用 Video element reference
    const videoRef = ref(null)
    // 掃描器實例 Scanner instance
    const reader = new BrowserMultiFormatReader()
    // 掃描狀態 Scan status
    let scanning = false
    
    // 開始掃描 Start scanning
    const startScanning = async () => {
      try {
        if (!videoRef.value) {
          throw new Error('視頻元素未找到')
        }
        
        // 設置掃描選項 Set scanning options
        const hints = new Map()
        hints.set(2, true) // TRY_HARDER
        hints.set(4, true) // PURE_BARCODE
        
        // 開始掃描 Start scanning
        scanning = true
        await reader.decodeFromVideoDevice(null, videoRef.value, (result, err) => {
          if (result) {
            // 掃描成功，發送結果 Scan successful, emit result
            emit('scan-result', result.getText())
            stopScanning()
          }
          if (err && !(err instanceof Error)) {
            console.error('掃描錯誤:', err)
          }
        }, hints)
      } catch (error) {
        console.error('啟動掃描器失敗:', error)
        Message.error(error.message || '啟動掃描器失敗')
        emit('close')
      }
    }
    
    // 停止掃描 Stop scanning
    const stopScanning = () => {
      if (scanning) {
        try {
          reader.reset()
          scanning = false
        } catch (error) {
          console.error('停止掃描器失敗:', error)
        }
      }
    }
    
    // 關閉掃描器 Close scanner
    const closeScanner = () => {
      stopScanning()
      emit('close')
    }
    
    // 組件掛載時啟動掃描器 Start scanner when component is mounted
    onMounted(() => {
      startScanning()
    })
    
    // 組件卸載前停止掃描器 Stop scanner before component is unmounted
    onBeforeUnmount(() => {
      stopScanning()
    })
    
    return {
      videoRef,
      closeScanner
    }
  }
}
</script>

<style lang="scss" scoped>
.scanner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
  
  .scanner-window {
    position: relative;
    width: 100%;
    max-width: 400px;
    aspect-ratio: 4/3;
    background-color: #000;
    border-radius: 8px;
    overflow: hidden;
    
    .scanner-video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .scanner-frame {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80%;
      height: 80%;
      border: 2px solid rgba(255, 255, 255, 0.5);
      box-sizing: border-box;
      
      .corner {
        position: absolute;
        width: 20px;
        height: 20px;
        border-color: #19c37d;
        border-style: solid;
        border-width: 0;
        
        &.top-left {
          top: -2px;
          left: -2px;
          border-top-width: 4px;
          border-left-width: 4px;
        }
        
        &.top-right {
          top: -2px;
          right: -2px;
          border-top-width: 4px;
          border-right-width: 4px;
        }
        
        &.bottom-left {
          bottom: -2px;
          left: -2px;
          border-bottom-width: 4px;
          border-left-width: 4px;
        }
        
        &.bottom-right {
          bottom: -2px;
          right: -2px;
          border-bottom-width: 4px;
          border-right-width: 4px;
        }
      }
    }
  }
  
  .scanner-controls {
    display: flex;
    gap: 10px;
    margin-top: 10px;
  }
}
</style> 