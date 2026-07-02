(function() {
// UI组件模块：Toast 提示

function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toastContainer');
  if (!container) {
    const containerEl = document.createElement('div');
    containerEl.id = 'toastContainer';
    containerEl.className = 'toast-container';
    document.body.appendChild(containerEl);
  }
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  };
  
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-message">${message}</span>
  `;
  
  document.getElementById('toastContainer').appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);
}

// 景点管理Tab状态

// 暴露到全局
window.showToast = showToast;

})();