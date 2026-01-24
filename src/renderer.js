// src/renderer.js

// 添加窗口控制按钮事件监听
document.addEventListener('DOMContentLoaded', () => {
    const minBtn = document.getElementById('min-btn');
    const maxBtn = document.getElementById('max-btn');
    const closeBtn = document.getElementById('close-btn');

    minBtn?.addEventListener('click', () => {
        window.electronAPI?.minimizeWindow();
    });

    maxBtn?.addEventListener('click', () => {
        window.electronAPI?.maximizeWindow();
    });

    closeBtn?.addEventListener('click', () => {
        window.electronAPI?.closeWindow();
    });
});
