// src/renderer.js
// 添加窗口控制按钮事件监听
let retryCount = 0;
const maxRetry = 10;

const bindControlBtn = () => {
  const minBtn = document.getElementById('window-min-btn');
  const maxBtn = document.getElementById('window-max-btn');
  const closeBtn = document.getElementById('window-close-btn');
  if(minBtn && maxBtn && closeBtn){
    minBtn?.addEventListener('click', () => {
      window.electronAPI?.minimizeWindow();
    });
    maxBtn?.addEventListener('click', () => {
      window.electronAPI?.maximizeWindow();
    });
    closeBtn?.addEventListener('click', () => {
      window.electronAPI?.closeWindow();
    });
  }else{
    retryCount++;
    if(retryCount < maxRetry){
      setTimeout(()=>{
        bindControlBtn()
      },300)
    }
  }
};

// 等待 DOM 加载完成后再绑定
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', bindControlBtn);
}else{
  bindControlBtn();
}
