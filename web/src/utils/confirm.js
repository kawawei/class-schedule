import { createApp, h } from 'vue';
import AppDialog from '../components/base/AppDialog.vue';

/**
 * 確認對話框服務 Confirm dialog service
 * 用於在應用中顯示確認對話框 Used to display confirm dialogs in the application
 */
const Confirm = {
  /**
   * 顯示確認對話框 Show confirm dialog
   * @param {String} message - 訊息內容 Message content
   * @param {String} title - 標題 Title
   * @param {Object} options - 選項 Options
   * @param {String} options.confirmButtonText - 確認按鈕文字 Confirm button text
   * @param {String} options.cancelButtonText - 取消按鈕文字 Cancel button text
   * @param {String} options.type - 類型 Type (success, warning, error, info)
   * @returns {Promise} 確認結果 Confirm result
   */
  confirm(message, title = '確認', options = {}) {
    return new Promise((resolve, reject) => {
      // 默認選項 Default options
      const defaultOptions = {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      };
      
      // 合併選項 Merge options
      const mergedOptions = { ...defaultOptions, ...options };
      
      // 創建對話框容器 Create dialog container
      const dialogNode = document.createElement('div');
      document.body.appendChild(dialogNode);
      
      // 創建對話框實例 Create dialog instance
      const dialogApp = createApp({
        methods: {
          // 處理確認 Handle confirm
          handleConfirm() {
            // 關閉對話框 Close dialog
            this.closeDialog();
            // 解析 Promise Resolve promise
            resolve();
          },
          // 處理取消 Handle cancel
          handleCancel() {
            // 關閉對話框 Close dialog
            this.closeDialog();
            // 拒絕 Promise Reject promise
            reject(new Error('用戶取消 User cancelled'));
          },
          // 關閉對話框 Close dialog
          closeDialog() {
            // 卸載對話框 Unmount dialog
            dialogApp.unmount();
            // 移除對話框容器 Remove dialog container
            document.body.removeChild(dialogNode);
          }
        },
        render() {
          // 創建圖標元素 Create icon element
          let iconElement = null;
          if (mergedOptions.type) {
            let iconSvg = null;
            
            if (mergedOptions.type === 'success') {
              iconSvg = h('svg', {
                xmlns: 'http://www.w3.org/2000/svg',
                width: '24',
                height: '24',
                viewBox: '0 0 24 24',
                fill: 'none',
                stroke: 'currentColor',
                'stroke-width': '2',
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round'
              }, [
                h('path', { d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' }),
                h('polyline', { points: '22 4 12 14.01 9 11.01' })
              ]);
            } else if (mergedOptions.type === 'warning') {
              iconSvg = h('svg', {
                xmlns: 'http://www.w3.org/2000/svg',
                width: '24',
                height: '24',
                viewBox: '0 0 24 24',
                fill: 'none',
                stroke: 'currentColor',
                'stroke-width': '2',
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round'
              }, [
                h('path', { d: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' }),
                h('line', { x1: '12', y1: '9', x2: '12', y2: '13' }),
                h('line', { x1: '12', y1: '17', x2: '12.01', y2: '17' })
              ]);
            } else if (mergedOptions.type === 'error') {
              iconSvg = h('svg', {
                xmlns: 'http://www.w3.org/2000/svg',
                width: '24',
                height: '24',
                viewBox: '0 0 24 24',
                fill: 'none',
                stroke: 'currentColor',
                'stroke-width': '2',
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round'
              }, [
                h('circle', { cx: '12', cy: '12', r: '10' }),
                h('line', { x1: '15', y1: '9', x2: '9', y2: '15' }),
                h('line', { x1: '9', y1: '9', x2: '15', y2: '15' })
              ]);
            } else if (mergedOptions.type === 'info') {
              iconSvg = h('svg', {
                xmlns: 'http://www.w3.org/2000/svg',
                width: '24',
                height: '24',
                viewBox: '0 0 24 24',
                fill: 'none',
                stroke: 'currentColor',
                'stroke-width': '2',
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round'
              }, [
                h('circle', { cx: '12', cy: '12', r: '10' }),
                h('line', { x1: '12', y1: '16', x2: '12', y2: '12' }),
                h('line', { x1: '12', y1: '8', x2: '12.01', y2: '8' })
              ]);
            }
            
            iconElement = h('div', { class: `confirm-icon confirm-icon-${mergedOptions.type}` }, [iconSvg]);
          }
          
          // 創建內容元素 Create content element
          const contentElement = h('div', { class: 'confirm-content' }, [
            iconElement,
            h('div', { class: 'confirm-message' }, message)
          ]);
          
          // 創建底部按鈕 Create footer buttons
          const footerElement = h('div', { class: 'confirm-footer' }, [
            h('button', {
              class: 'btn btn-default',
              onClick: this.handleCancel
            }, mergedOptions.cancelButtonText),
            h('button', {
              class: `btn btn-${mergedOptions.type || 'primary'}`,
              onClick: this.handleConfirm
            }, mergedOptions.confirmButtonText)
          ]);
          
          // 返回對話框元素 Return dialog element
          return h(AppDialog, {
            modelValue: true,
            title: title,
            width: '400px',
            'onUpdate:modelValue': (val) => {
              if (!val) {
                this.handleCancel();
              }
            }
          }, {
            default: () => contentElement,
            footer: () => footerElement
          });
        }
      });
      
      // 掛載對話框 Mount dialog
      dialogApp.mount(dialogNode);
    });
  }
};

// 導出確認對話框服務 Export confirm dialog service
export default Confirm; 