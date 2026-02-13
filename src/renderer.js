
// 添加窗口控制按钮事件监听
let retryCount = 0;
const maxRetry = 10;
let retryInterval = 300;

// 绑定窗口控制按钮事件
const bindControlBtn = () => {
  const minBtn = document.querySelector('.electron-window-min-btn');
  const maxBtn = document.querySelector('.electron-window-max-btn');
  const closeBtn = document.querySelector('.electron-window-close-btn');

  console.log('尝试绑定控制按钮:', {
    minBtn: !!minBtn,
    maxBtn: !!maxBtn,
    closeBtn: !!closeBtn,
    retryCount
  });

  if(minBtn && maxBtn && closeBtn){
    // 移除可能存在的旧事件监听器
    minBtn.removeEventListener('click', handleMinimize);
    maxBtn.removeEventListener('click', handleMaximize);
    closeBtn.removeEventListener('click', handleClose);

    // 添加新的事件监听器
    minBtn.addEventListener('click', handleMinimize);
    maxBtn.addEventListener('click', handleMaximize);
    closeBtn.addEventListener('click', handleClose);

    console.log('✅ 控制按钮绑定成功');
    retryCount = 0; // 重置重试计数
    return true;
  }else{
    retryCount++;
    if(retryCount <= maxRetry){
      // 动态调整重试间隔，随着重试次数增加而延长
      const currentInterval = Math.min(retryInterval * Math.pow(1.1, retryCount), 1000);
      console.log(`⏳ 第${retryCount}次重试，${currentInterval}ms后继续`);
      setTimeout(bindControlBtn, currentInterval);
    } else {
      console.error('❌ 控制按钮绑定失败：超过最大重试次数');
    }
    return false;
  }
};

// 事件处理函数
const handleMinimize = () => {
  console.log('点击最小化按钮');
  window.electronAPI?.minimizeWindow();
};

const handleMaximize = () => {
  console.log('点击最大化按钮');
  window.electronAPI?.maximizeWindow();
};

const handleClose = () => {
  console.log('点击关闭按钮');
  window.electronAPI?.closeWindow();
};

// 使用 MutationObserver 监听 DOM 变化
const observeDOMChanges = () => {
  const observer = new MutationObserver((mutations) => {
    let shouldRebind = false;
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node;
            if (
              element.classList?.contains('electron-window-min-btn') ||
              element.classList?.contains('electron-window-max-btn') ||
              element.classList?.contains('electron-window-close-btn') ||
              element.querySelector?.('.electron-window-min-btn') ||
              element.querySelector?.('.electron-window-max-btn') ||
              element.querySelector?.('.electron-window-close-btn')
            ) {
              shouldRebind = true;
            }
          }
        });
      }
    });

    if (shouldRebind) {
      console.log('检测到控制按钮相关DOM变化，重新绑定');
      setTimeout(bindControlBtn, 50); // 延迟一小段时间确保DOM完全更新
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  return observer;
};

// 等待 DOM 加载完成后再绑定
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM加载完成，开始绑定控制按钮');
    bindControlBtn();
    observeDOMChanges();
  });
}else{
  console.log('DOM已就绪，立即绑定控制按钮');
  bindControlBtn();
  observeDOMChanges();
}

// 页面完全加载后再次检查
window.addEventListener('load', () => {
  console.log('页面完全加载，最终检查控制按钮');
  setTimeout(bindControlBtn, 100);
});


