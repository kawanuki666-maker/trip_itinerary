// 核心模块：数据管理、全局状态、工具函数、GitHub同步、应用初始化

// 此文件不用 IIFE 包裹，变量和函数直接声明在全局作用域
// 因为 appData 等变量会被重新赋值，IIFE 内的 window 暴露无法同步

let appData = {};

function getLocationData() {
  return appData.locations || { "国内": {}, "国外": {} };
}

function setLocationData(data) {
  appData.locations = data;
  localStorage.setItem('appData', JSON.stringify(appData));
}

let githubConfig = {
  token: '',
  repo: ''
};

let tempTrip = null;


const defaultData = {
  "currentTrip": "shanghai_2026",
  "trips": {
    "shanghai_2026": {
      "id": "shanghai_2026",
      "title": "上海两日",
      "startDate": "2026-07-01",
      "endDate": "2026-07-02",
      "subtitle": "魔都都市漫步",
      "description": "从外滩的万国建筑博览群，到陆家嘴的现代天际线；从豫园的古典园林，到南京路的繁华商街——感受上海这座国际化大都市的独特魅力。",
      "platforms": [],
      "reservations": [],
      "days": [
        {"day": 1, "title": "外滩 · 陆家嘴", "theme": "都市风光", "spotIds": ["spot_1", "spot_2", "spot_3", "spot_4"], "accommodation": {"hotelId": "hotel_1"}, "transport": null, "note": null},
        {"day": 2, "title": "豫园 · 南京路", "theme": "古典与繁华", "spotIds": ["spot_5", "spot_6"], "accommodation": null, "transport": null, "note": null}
      ]
    }
  },
  "hotels": [
    {"id": "hotel_1", "name": "外滩华尔道夫酒店", "location": "上海市 - 黄浦区", "address": "外滩2号", "phone": "", "checkInTime": "14:00", "checkOutTime": "12:00", "notes": ""}
  ],
  "spots": [
    {"id": "spot_1", "name": "外滩", "city": "上海市 - 黄浦区", "brief": "万国建筑博览群、上海标志性景观", "hours": "全天开放", "ticket": "免费", "needReservation": false, "description": "外滩是上海最具代表性的地标，沿黄浦江绵延1.5公里，汇集了52幢风格迥异的万国建筑群，被誉为'万国建筑博览群'。漫步外滩，可欣赏哥特式、巴洛克式、罗马式等各种风格的建筑，感受上海百年历史的沧桑与辉煌。夜幕降临后，浦江两岸灯火璀璨，是观赏陆家嘴天际线的绝佳位置。"},
    {"id": "spot_2", "name": "东方明珠", "city": "上海市 - 浦东新区", "brief": "上海地标性电视塔、观景平台", "hours": "8:00-22:00", "ticket": "观光票199-259元", "needReservation": false, "description": "东方明珠广播电视塔是上海的标志性建筑，高达468米，是观赏上海全景的最佳地点之一。塔内设有多个观光层，可360度俯瞰浦江两岸风光，夜晚灯光秀更是震撼人心。"},
    {"id": "spot_3", "name": "上海中心大厦", "city": "上海市 - 浦东新区", "brief": "中国第一高楼、云端观景", "hours": "9:30-22:00", "ticket": "观光票180-220元", "needReservation": false, "description": "上海中心大厦高达632米，是中国第一高楼、世界第三高楼。位于118-119层的'上海之巅'观光厅，可俯瞰整个上海城市风貌，云端之上的震撼体验令人难忘。"},
    {"id": "spot_4", "name": "南京路步行街", "city": "上海市 - 黄浦区", "brief": "中华商业第一街、繁华商街", "hours": "全天开放，商铺营业时间各异", "ticket": "免费", "needReservation": false, "description": "南京路步行街是上海最繁华的商业街，被誉为'中华商业第一街'。街道两侧汇集了百年老字号、国际品牌、特色餐饮，霓虹闪烁、人流如织，是感受上海都市繁华的最佳去处。"},
    {"id": "spot_5", "name": "豫园", "city": "上海市 - 黄浦区", "brief": "明代古典园林、江南园林精品", "hours": "9:00-16:30", "ticket": "40元", "needReservation": false, "description": "豫园始建于明代嘉靖年间，是上海现存最完整的古典园林，被誉为'东南名园冠'。园内亭台楼阁、假山池沼、曲径回廊，尽显江南园林的精致典雅。豫园商城周边更有各类传统小吃、手工艺品，是体验老上海风情的必打卡之地。"},
    {"id": "spot_6", "name": "城隍庙", "city": "上海市 - 黄浦区", "brief": "上海道教圣地、民俗文化聚集地", "hours": "8:30-16:30", "ticket": "免费", "needReservation": false, "description": "城隍庙是上海历史悠久的道教庙宇，始建于明代，供奉上海城隍神秦裕伯。庙宇建筑古朴庄严，香火旺盛，周边汇集了众多老字号小吃店铺，南翔小笼、蟹粉灌汤包等经典美食在此应有尽有，是品味上海传统民俗文化的绝佳去处。"}
  ],
  "locations": {
    "国内": {
      "上海市": {
        "黄浦区": [],
        "浦东新区": []
      }
    }
  }
};


function formatTripDates(startDate, endDate) {
  if (!startDate || !endDate) return '';
  const start = new Date(startDate);
  const end = new Date(endDate);
  return `${start.getFullYear()}.${start.getMonth() + 1}.${start.getDate()} — ${end.getFullYear()}.${end.getMonth() + 1}.${end.getDate()}`;
}

function $(id) {
  return document.getElementById(id);
}


function showLoading() {
  $('loadingOverlay').style.display = 'flex';
}


function hideLoading() {
  $('loadingOverlay').style.display = 'none';
}


function showError(msg) {
  const errorEl = $('loginError');
  errorEl.textContent = msg;
  errorEl.style.display = 'block';
}


function hideError() {
  $('loginError').style.display = 'none';
}


async function verifyGitHubConfig(token, repo) {
  try {
    const response = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('GitHub API Error:', response.status, errorText);
      return { ok: false, status: response.status, message: errorText };
    }
    
    const data = await response.json();
    return { ok: true, data };
  } catch (error) {
    console.error('Network Error:', error);
    return { ok: false, error: error.message };
  }
}

$('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError();
  
  const token = $('tokenInput').value.trim();
  const repo = $('repoInput').value.trim();
  
  if (!token || !repo) {
    showError('请填写完整信息');
    return;
  }
  
  if (!repo.includes('/')) {
    showError('仓库名称格式错误，请使用「用户名/仓库名」格式（例如：yourname/itinerary）');
    return;
  }
  
  $('loginBtn').disabled = true;
  $('loginBtn').textContent = '验证中...';
  
  const result = await verifyGitHubConfig(token, repo);
  
  if (result.ok) {
    githubConfig = { token, repo };
    sessionStorage.setItem('githubConfig', JSON.stringify(githubConfig));
    showAdminPage();
  } else {
    let errorMsg = 'Token 或仓库名称无效，请检查后重试';
    if (result.status === 401) {
      errorMsg = 'Token 无效或已过期，请检查 Token 是否正确';
    } else if (result.status === 404) {
      errorMsg = '仓库不存在，请检查仓库名称是否正确（格式：用户名/仓库名）';
    } else if (result.status === 403) {
      errorMsg = '访问被拒绝，请确认 Token 有 repo 权限';
    } else if (result.error) {
      errorMsg = `网络错误：${result.error}`;
    }
    showError(errorMsg);
    $('loginBtn').disabled = false;
    $('loginBtn').textContent = '进入后台';
  }
});

$('skipLoginBtn').addEventListener('click', () => {
  githubConfig = { token: 'skipped', repo: 'skipped' };
  sessionStorage.setItem('githubConfig', JSON.stringify(githubConfig));
  showAdminPage();
});


function showAdminPage() {
  $('loginPage').style.display = 'none';
  $('adminPage').classList.add('active');
  hideLoading();
  
  updateConnectionStatus();
  loadData();
}

// locationData 现在存储在 appData.locations 中


function renderUI() {
  renderTripsList();
  setTimeout(() => {
    renderSpotsList('', '国内', false);
    renderHotelsList('', '国内');
    renderDaysList();
    renderPlatformsList();
    renderReservationsList();
    if ($('locationsSection') && $('locationsSection').classList.contains('active')) {
      renderLocationLevel1List();
      renderLocationLevel2List();
    }
  }, 100);
}


async function loadData() {
  // 优先尝试从 JSON 文件加载最新数据
  try {
    const response = await fetch('../data/itinerary.json');
    
    if (response.ok) {
      const jsonData = await response.json();
      const savedData = localStorage.getItem('appData');
      
      // 如果 localStorage 没有数据，直接使用 JSON 文件数据
      if (!savedData) {
        appData = jsonData;
        localStorage.setItem('appData', JSON.stringify(appData));
        renderUI();
        return;
      }
      
      // 如果有 localStorage 数据，提示用户是否更新
      if (confirm('检测到新的行程数据，是否更新？')) {
        appData = jsonData;
        localStorage.setItem('appData', JSON.stringify(appData));
        renderUI();
        return;
      }
    }
  } catch (error) {
    // fetch 失败（如 file:// 协议限制），继续使用 localStorage 或 defaultData
  }
  
  // 使用 localStorage 数据
  const savedData = localStorage.getItem('appData');
  if (savedData) {
    appData = JSON.parse(savedData);
    
    // 数据迁移
    let dataUpdated = false;
    if (appData.days) {
      const currentTripId = appData.currentTrip;
      if (currentTripId && appData.trips?.[currentTripId] && !appData.trips[currentTripId].days) {
        appData.trips[currentTripId].days = appData.days;
      }
      delete appData.days;
      dataUpdated = true;
    }
    
    if (appData.trips) {
      Object.keys(appData.trips).forEach(tripId => {
        const trip = appData.trips[tripId];
        if (!trip.days) { trip.days = []; dataUpdated = true; }
        if (!trip.platforms) { trip.platforms = []; dataUpdated = true; }
        if (!trip.reservations) { trip.reservations = []; dataUpdated = true; }
      });
    }
    
    if (dataUpdated) {
      localStorage.setItem('appData', JSON.stringify(appData));
    }
    
    renderUI();
    return;
  }
  
  // 兜底：使用 defaultData
  appData = JSON.parse(JSON.stringify(defaultData));
  localStorage.setItem('appData', JSON.stringify(appData));
  renderUI();
}


function loadTripFormData() {
  if (!appData.trips || !appData.currentTrip) return;
  
  const trip = appData.trips[appData.currentTrip] || {};
  
  $('tripTitle').value = trip.title || '';
  
  $('tripStartDate').value = trip.startDate || '';
  $('tripEndDate').value = trip.endDate || '';
  
  $('tripSubtitle').value = trip.subtitle || '';
  $('tripDescription').value = trip.description || '';
  
  $('spotsCount').textContent = appData.spots ? appData.spots.length : 0;
  $('hotelsCount').textContent = appData.hotels ? appData.hotels.length : 0;
  $('daysCount').textContent = getCurrentTripDays().length;
}


function updateConnectionStatus() {
  const dot = $('connectionDot');
  const status = $('connectionStatus');
  const repoEl = $('currentRepo');
  const previewUrlEl = $('settingsPreviewUrl');
  const adminUrlEl = $('settingsAdminUrl');
  
  if (githubConfig.token && githubConfig.repo) {
    dot.classList.remove('disconnected');
    status.textContent = '已连接';
    repoEl.textContent = githubConfig.repo;
    
    // 生成预览链接
    const repoParts = githubConfig.repo.split('/');
    const username = repoParts[0];
    const repoName = repoParts[1];
    const previewUrl = `https://${username}.github.io/${repoName}/preview.html`;
    const adminUrl = `https://${username}.github.io/${repoName}/admin.html`;
    
    if (previewUrlEl) {
      previewUrlEl.href = previewUrl;
      previewUrlEl.textContent = previewUrl;
    }
    if (adminUrlEl) {
      adminUrlEl.href = adminUrl;
      adminUrlEl.textContent = adminUrl;
    }
  } else {
    dot.classList.add('disconnected');
    status.textContent = '未连接';
    repoEl.textContent = '-';
    
    if (previewUrlEl) {
      previewUrlEl.href = '#';
      previewUrlEl.textContent = '-';
    }
    if (adminUrlEl) {
      adminUrlEl.href = '#';
      adminUrlEl.textContent = '-';
    }
  }
}


function calculateTripDays(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end - start;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays > 0 ? diffDays : 0;
}


async function syncDataToGitHub() {
  if (!githubConfig || !githubConfig.token || !githubConfig.repo) {
    showToast('请先在设置中配置 GitHub Token 和仓库信息', 'error');
    return;
  }
  
  if (githubConfig.token === 'skipped') {
    showToast('请先登录 GitHub（当前为跳过验证模式）', 'error');
    return;
  }
  
  const syncBtn = $('syncDataBtn');
  const originalText = syncBtn.textContent;
  syncBtn.disabled = true;
  syncBtn.innerHTML = '<span class="loading-spinner"></span> 同步中...';
  
  // 显示状态提示
  showSyncStatus('正在准备数据...');
  
  try {
    // 1. 获取当前文件的 SHA
    showSyncStatus('正在连接 GitHub...');
    const getFileResponse = await fetch(`https://api.github.com/repos/${githubConfig.repo}/contents/data/itinerary.json`, {
      headers: {
        'Authorization': `token ${githubConfig.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    let sha = null;
    if (getFileResponse.ok) {
      const fileData = await getFileResponse.json();
      sha = fileData.sha;
    } else if (getFileResponse.status === 404) {
      // 文件不存在，需要创建（不需要 SHA）
      sha = null;
    } else {
      throw new Error(`获取文件信息失败: ${getFileResponse.status}`);
    }
    
    // 2. 准备提交数据
    showSyncStatus('正在编码数据...');
    const content = JSON.stringify(appData, null, 2);
    const encodedContent = btoa(unescape(encodeURIComponent(content)));
    
    const commitData = {
      message: `更新行程数据 - ${new Date().toLocaleString('zh-CN')}`,
      content: encodedContent,
      branch: 'main'
    };
    
    if (sha) {
      commitData.sha = sha;
    }
    
    // 3. 提交更新
    showSyncStatus('正在上传数据...');
    const updateResponse = await fetch(`https://api.github.com/repos/${githubConfig.repo}/contents/data/itinerary.json`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${githubConfig.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(commitData)
    });
    
    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`提交失败: ${updateResponse.status} - ${errorText}`);
    }
    
    const result = await updateResponse.json();
    
    // 4. 生成预览链接
    const repoParts = githubConfig.repo.split('/');
    const username = repoParts[0];
    const previewUrl = `https://${username}.github.io/${repoParts[1]}/preview.html`;
    const adminUrl = `https://${username}.github.io/${repoParts[1]}/admin.html`;
    
    // 隐藏状态提示
    hideSyncStatus();
    
    // 显示成功提示
    showSyncSuccess(previewUrl, adminUrl);
    showToast('同步成功！', 'success');
    
    // 更新连接状态显示
    updateConnectionStatus();
    
  } catch (error) {
    console.error('GitHub sync error:', error);
    hideSyncStatus();
    showSyncError(error.message);
    showToast(`同步失败: ${error.message}`, 'error');
  } finally {
    syncBtn.disabled = false;
    syncBtn.textContent = originalText;
  }
}

// 同步状态提示相关函数

let syncStatusTimeout = null;


function showSyncStatus(message) {
  let statusEl = $('syncStatus');
  if (!statusEl) {
    statusEl = document.createElement('div');
    statusEl.id = 'syncStatus';
    statusEl.style.cssText = 'margin-top: 12px; padding: 12px 16px; background: var(--surface-2); border-radius: 6px; font-size: 13px; color: var(--text-mid);';
    const dataManagementSection = document.querySelector('.section-card h3.section-card-title');
    if (dataManagementSection) {
      dataManagementSection.parentNode.insertBefore(statusEl, dataManagementSection.nextSibling);
    }
  }
  
  // 显示加载动画和文字
  const spinnerHtml = '<span style="display: inline-block; width: 14px; height: 14px; border: 2px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; margin-right: 8px; vertical-align: middle;"></span>';
  statusEl.innerHTML = spinnerHtml + message;
  
  // 自动隐藏
  clearTimeout(syncStatusTimeout);
}


function hideSyncStatus() {
  const statusEl = $('syncStatus');
  if (statusEl) {
    statusEl.style.display = 'none';
  }
}


function showSyncSuccess(previewUrl, adminUrl) {
  hideSyncStatus();
  
  let successEl = $('syncStatus');
  if (!successEl) {
    successEl = document.createElement('div');
    successEl.id = 'syncStatus';
    successEl.style.cssText = 'margin-top: 12px; padding: 16px; background: #e8f5e9; border: 1px solid #4caf50; border-radius: 6px; font-size: 13px;';
    const dataManagementSection = document.querySelector('.section-card h3.section-card-title');
    if (dataManagementSection) {
      dataManagementSection.parentNode.insertBefore(successEl, dataManagementSection.nextSibling);
    }
  }
  
  successEl.style.background = '#e8f5e9';
  successEl.style.border = '1px solid #4caf50';
  successEl.style.color = '#2e7d32';
  successEl.innerHTML = `
    <div style="font-weight: 600; margin-bottom: 10px;">✅ 同步成功！</div>
    <div style="margin-bottom: 8px;">
      <span>🔗 行程预览：</span>
      <a href="${previewUrl}" target="_blank" style="color: #1976d2; word-break: break-all;">${previewUrl}</a>
    </div>
    <div>
      <span>⚙️ 管理后台：</span>
      <a href="${adminUrl}" target="_blank" style="color: #1976d2; word-break: break-all;">${adminUrl}</a>
    </div>
  `;
  
  // 5秒后自动隐藏
  syncStatusTimeout = setTimeout(() => {
    hideSyncStatus();
  }, 5000);
}


function showSyncError(message) {
  hideSyncStatus();
  
  let errorEl = $('syncStatus');
  if (!errorEl) {
    errorEl = document.createElement('div');
    errorEl.id = 'syncStatus';
    errorEl.style.cssText = 'margin-top: 12px; padding: 12px 16px; border-radius: 6px; font-size: 13px;';
    const dataManagementSection = document.querySelector('.section-card h3.section-card-title');
    if (dataManagementSection) {
      dataManagementSection.parentNode.insertBefore(errorEl, dataManagementSection.nextSibling);
    }
  }
  
  errorEl.style.background = '#ffebee';
  errorEl.style.border = '1px solid #ef5350';
  errorEl.style.color = '#c62828';
  errorEl.innerHTML = `❌ 同步失败：${message}`;
  
  // 8秒后自动隐藏
  syncStatusTimeout = setTimeout(() => {
    hideSyncStatus();
  }, 8000);
}


function initEventListeners() {
  // 景点相关事件
  if ($('addSpotBtn')) $('addSpotBtn').addEventListener('click', () => openSpotModal());
  if ($('modalSaveBtn')) $('modalSaveBtn').addEventListener('click', saveSpot);
  if ($('modalCancelBtn')) $('modalCancelBtn').addEventListener('click', closeSpotModal);
  if ($('modalCloseBtn')) $('modalCloseBtn').addEventListener('click', closeSpotModal);
  if ($('syncDataBtn')) $('syncDataBtn').addEventListener('click', syncDataToGitHub);
  if ($('importDataBtn')) $('importDataBtn').addEventListener('click', openImportModal);
  if ($('importModalCloseBtn')) $('importModalCloseBtn').addEventListener('click', closeImportModal);
  if ($('importCancelBtn')) $('importCancelBtn').addEventListener('click', closeImportModal);
  if ($('importConfirmBtn')) $('importConfirmBtn').addEventListener('click', doImport);
  if ($('importSelectBtn')) $('importSelectBtn').addEventListener('click', () => $('importFileInput').click());
  if ($('importFileInput')) $('importFileInput').addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImportFile(e.target.files[0]);
    }
  });
  if ($('importDropzone')) {
    const dz = $('importDropzone');
    dz.addEventListener('dragover', (e) => {
      e.preventDefault();
      dz.classList.add('dragover');
    });
    dz.addEventListener('dragleave', () => {
      dz.classList.remove('dragover');
    });
    dz.addEventListener('drop', (e) => {
      e.preventDefault();
      dz.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleImportFile(e.dataTransfer.files[0]);
      }
    });
    dz.addEventListener('click', () => $('importFileInput').click());
  }
  
  // 行程搜索和排序
  if ($('tripSearchInput')) {
    $('tripSearchInput').addEventListener('input', (e) => {
      const sortBy = $('tripSortSelect') ? $('tripSortSelect').value : 'date_desc';
      renderTripsList(e.target.value, sortBy);
    });
  }
  if ($('tripSortSelect')) {
    $('tripSortSelect').addEventListener('change', (e) => {
      const keyword = $('tripSearchInput') ? $('tripSearchInput').value : '';
      renderTripsList(keyword, e.target.value);
    });
  }
  
  // 每日行程相关事件
  if ($('addDayBtn')) $('addDayBtn').addEventListener('click', () => openDayModal());
  if ($('dayModalSaveBtn')) $('dayModalSaveBtn').addEventListener('click', saveDay);
  if ($('dayModalCancelBtn')) $('dayModalCancelBtn').addEventListener('click', closeDayModal);
  if ($('dayModalCloseBtn')) $('dayModalCloseBtn').addEventListener('click', closeDayModal);
  if ($('dayModalDate')) $('dayModalDate').addEventListener('change', updateWeekdayFromDate);
  
  // 点击模态框遮罩层关闭
  if ($('dayModal')) {
    $('dayModal').addEventListener('click', (e) => {
      if (e.target === $('dayModal')) {
        closeDayModal();
      }
    });
  }
  if ($('spotModal')) {
    $('spotModal').addEventListener('click', (e) => {
      if (e.target === $('spotModal')) {
        closeSpotModal();
      }
    });
  }
  if ($('hotelModal')) {
    $('hotelModal').addEventListener('click', (e) => {
      if (e.target === $('hotelModal')) {
        closeHotelModal();
      }
    });
  }
  
  // 酒店相关事件
  if ($('addHotelBtn')) {
    $('addHotelBtn').addEventListener('click', () => {
      openHotelModal();
    });
  }
  if ($('hotelModalSaveBtn')) {
    $('hotelModalSaveBtn').addEventListener('click', saveHotel);
  }
  if ($('hotelModalCancelBtn')) {
    $('hotelModalCancelBtn').addEventListener('click', closeHotelModal);
  }
  if ($('hotelModalCloseBtn')) {
    $('hotelModalCloseBtn').addEventListener('click', closeHotelModal);
  }
  if ($('hotelSearchInput')) {
    $('hotelSearchInput').addEventListener('input', (e) => {
      renderHotelsList(e.target.value, hotelRegionTab === 'domestic' ? '国内' : '国外');
    });
  }
  
  // 酒店位置三级联动
  if ($('hotelModalProvince')) {
    $('hotelModalProvince').addEventListener('change', () => {
      populateHotelCityDropdown();
    });
  }
  if ($('hotelModalCity')) {
    $('hotelModalCity').addEventListener('change', () => {
      populateHotelDistrictDropdown();
    });
  }
  if ($('hotelModalCountry')) {
    $('hotelModalCountry').addEventListener('change', () => {
      populateHotelCityDropdown();
    });
  }
  

  
  if ($('spotSearchInput')) {
    $('spotSearchInput').addEventListener('input', (e) => {
      const region = spotRegionTab === 'domestic' ? '国内' : '国外';
      const reservationOnly = $('spotReservationFilter') ? $('spotReservationFilter').checked : false;
      renderSpotsList(e.target.value, region, reservationOnly);
    });
  }

  if ($('spotReservationFilter')) {
    $('spotReservationFilter').addEventListener('change', (e) => {
      const keyword = $('spotSearchInput') ? $('spotSearchInput').value : '';
      const region = spotRegionTab === 'domestic' ? '国内' : '国外';
      renderSpotsList(keyword, region, e.target.checked);
    });
  }

  if ($('spotModalProvince')) {
    $('spotModalProvince').addEventListener('change', () => {
      populateSpotCityDropdown();
    });
  }
  
  if ($('spotModalCountry')) {
    $('spotModalCountry').addEventListener('change', () => {
      populateSpotCityDropdown();
    });
  }
  
  if ($('spotModalCity')) {
    $('spotModalCity').addEventListener('change', () => {
      populateSpotDistrictDropdown();
    });
  }
  
  // ESC 键关闭模态框
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if ($('dayModal') && $('dayModal').style.display !== 'none') {
        closeDayModal();
      } else if ($('spotModal') && $('spotModal').style.display !== 'none') {
        closeSpotModal();
      } else if ($('hotelModal') && $('hotelModal').style.display !== 'none') {
        closeHotelModal();
      } else if ($('platformModal') && $('platformModal').style.display !== 'none') {
        closePlatformModal();
      } else if ($('reservationModal') && $('reservationModal').style.display !== 'none') {
        closeReservationModal();
      } else if ($('importModal') && $('importModal').style.display !== 'none') {
        closeImportModal();
      }
    }
  });
  
  // initLocationDropdowns 已移除
}

// 已被新的地区管理模块取代


function formatTimeForInput(timeStr) {
  if (!timeStr) return '';
  const match = timeStr.match(/(\d{1,2}):?(\d{0,2})/);
  if (match) {
    const hours = parseInt(match[1], 10).toString().padStart(2, '0');
    const minutes = match[2] ? parseInt(match[2], 10).toString().padStart(2, '0') : '00';
    return `${hours}:${minutes}`;
  }
  return '';
}


function calculateDayDate(dayNumber) {
  if (!appData.trips || !appData.currentTrip || !appData.trips[appData.currentTrip] || !appData.trips[appData.currentTrip].startDate) {
    return '';
  }
  
  const startDate = new Date(appData.trips[appData.currentTrip].startDate);
  startDate.setDate(startDate.getDate() + (dayNumber - 1));
  
  const year = startDate.getFullYear();
  const month = String(startDate.getMonth() + 1).padStart(2, '0');
  const day = String(startDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}


function getWeekdayString(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return weekdays[date.getDay()];
}


function getSortedKeys(obj) {
  const collator = new Intl.Collator('zh-CN', { sensitivity: 'accent' });
  return Object.keys(obj).sort((a, b) => collator.compare(a, b));
}


function initApp() {
  const savedConfig = sessionStorage.getItem('githubConfig');
  if (savedConfig) {
    githubConfig = JSON.parse(savedConfig);
    showAdminPage();
  } else {
    hideLoading();
  }
  initEventListeners();
}

// 生成唯一ID
function genId(prefix) {
  return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
}


// 导入数据相关
let importRawData = null;
let importPreviewResult = null;

function openImportModal() {
  importRawData = null;
  importPreviewResult = null;
  $('importStep1').style.display = 'block';
  $('importStep2').style.display = 'none';
  $('importConfirmBtn').style.display = 'none';
  $('importFileInput').value = '';
  $('importModal').style.display = 'flex';
}

function closeImportModal() {
  $('importModal').style.display = 'none';
}

function handleImportFile(file) {
  if (!file) return;
  if (!file.name.endsWith('.json')) {
    showToast('请选择 JSON 文件', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      importRawData = JSON.parse(e.target.result);
      importPreviewResult = analyzeImportData(importRawData);
      renderImportPreview(importPreviewResult);
      $('importStep1').style.display = 'none';
      $('importStep2').style.display = 'block';
      $('importConfirmBtn').style.display = 'inline-block';
    } catch (err) {
      showToast('JSON 文件解析失败：' + err.message, 'error');
    }
  };
  reader.readAsText(file);
}

function analyzeImportData(rawData) {
  const result = {
    locations: { new: 0, newDetail: [] },
    spots: { new: 0, existing: 0, newList: [] },
    hotels: { new: 0, existing: 0, newList: [] },
    trips: { new: 0, existing: 0, newList: [] },
    errors: []
  };

  const existingSpots = appData.spots || [];
  const existingHotels = appData.hotels || [];
  const existingTrips = appData.trips || {};
  const locData = getLocationData();

  // 分析区域
  if (rawData.locations) {
    for (const region of ['国内', '国外']) {
      if (rawData.locations[region]) {
        for (const provName of Object.keys(rawData.locations[region])) {
          if (!locData[region] || !locData[region][provName]) {
            result.locations.new++;
            result.locations.newDetail.push(provName + '（新增）');
          } else {
            const provData = rawData.locations[region][provName];
            const existProvData = locData[region][provName];
            for (const cityName of Object.keys(provData)) {
              if (!existProvData[cityName]) {
                result.locations.new++;
                result.locations.newDetail.push(provName + ' - ' + cityName + '（新增）');
              }
            }
          }
        }
      }
    }
  }

  // 分析景点
  if (rawData.spots && Array.isArray(rawData.spots)) {
    for (const spot of rawData.spots) {
      const existSpot = existingSpots.find(s =>
        s.name === spot.name && s.city === spot.city
      );
      if (existSpot) {
        result.spots.existing++;
      } else {
        result.spots.new++;
        result.spots.newList.push(spot.name);
      }
    }
  }

  // 分析酒店
  if (rawData.hotels && Array.isArray(rawData.hotels)) {
    for (const hotel of rawData.hotels) {
      const existHotel = existingHotels.find(h =>
        h.name === hotel.name && h.location === hotel.location
      );
      if (existHotel) {
        result.hotels.existing++;
      } else {
        result.hotels.new++;
        result.hotels.newList.push(hotel.name);
      }
    }
  }

  // 分析行程
  if (rawData.trips && Array.isArray(rawData.trips)) {
    for (const trip of rawData.trips) {
      const existTrip = existingTrips[trip.id] || Object.values(existingTrips).find(t => t.title === trip.title);
      if (existTrip) {
        result.trips.existing++;
        result.trips.updatedList = result.trips.updatedList || [];
        result.trips.updatedList.push(trip.title);
      } else {
        result.trips.new++;
        result.trips.newList.push(trip.title);
      }
    }
  }

  return result;
}

function renderImportPreview(result) {
  const container = $('importPreviewContent');
  let html = '';

  if (result.locations.new > 0) {
    html += `
      <div class="import-preview-item">
        <div class="label">📍 区域</div>
        <div class="stats">
          <span class="stat-new">新增 ${result.locations.new} 个</span>
        </div>
      </div>`;
  }

  html += `
    <div class="import-preview-item">
      <div class="label">🏞 景点</div>
      <div class="stats">
        <span class="stat-new">新增 ${result.spots.new} 个</span>
        <span class="stat-exist">已存在 ${result.spots.existing} 个</span>
      </div>
    </div>
    <div class="import-preview-item">
      <div class="label">🏨 酒店</div>
      <div class="stats">
        <span class="stat-new">新增 ${result.hotels.new} 个</span>
        <span class="stat-exist">已存在 ${result.hotels.existing} 个</span>
      </div>
    </div>
    <div class="import-preview-item">
      <div class="label">🗓 行程</div>
      <div class="stats">
        ${result.trips.new > 0 ? `<span class="stat-new">新增 ${result.trips.new} 个</span>` : ''}
        ${result.trips.updatedList && result.trips.updatedList.length > 0 ? `<span class="stat-update">更新 ${result.trips.updatedList.length} 个</span>` : ''}
      </div>
    </div>`;

  container.innerHTML = html;
}

function doImport() {
  if (!importRawData) return;

  const mode = document.querySelector('input[name="importMode"]:checked').value;

  if (mode === 'full') {
    if (!confirm('确定要全量覆盖吗？当前所有数据将被替换，此操作不可恢复！')) {
      return;
    }
  }

  try {
    const result = processImportData(importRawData, mode);
    localStorage.setItem('appData', JSON.stringify(appData));
    renderUI();
    closeImportModal();

    const msg = mode === 'full'
      ? `全量导入完成：${result.spots} 个景点，${result.hotels} 个酒店，${result.trips} 个行程`
      : `增量导入完成：新增 ${result.spotsNew} 个景点，${result.hotelsNew} 个酒店，${result.tripsNew} 个行程${result.tripsUpdated ? '，更新 ' + result.tripsUpdated + ' 个行程' : ''}`;
    showToast(msg, 'success');
  } catch (err) {
    showToast('导入失败：' + err.message, 'error');
  }
}

function processImportData(rawData, mode) {
  const result = { spots: 0, hotels: 0, trips: 0, spotsNew: 0, hotelsNew: 0, tripsNew: 0 };

  if (mode === 'full') {
    // 全量覆盖模式
    appData.locations = rawData.locations || { "国内": {}, "国外": {} };
    appData.spots = [];
    appData.hotels = [];
    appData.trips = {};

    // 处理景点
    if (rawData.spots && Array.isArray(rawData.spots)) {
      for (const spot of rawData.spots) {
        const newSpot = { ...spot };
        if (!newSpot.id) newSpot.id = genId('spot');
        appData.spots.push(newSpot);
      }
      result.spots = appData.spots.length;
    }

    // 处理酒店
    if (rawData.hotels && Array.isArray(rawData.hotels)) {
      for (const hotel of rawData.hotels) {
        const newHotel = { ...hotel };
        if (!newHotel.id) newHotel.id = genId('hotel');
        appData.hotels.push(newHotel);
      }
      result.hotels = appData.hotels.length;
    }

    // 处理行程
    if (rawData.trips && Array.isArray(rawData.trips)) {
      for (const trip of rawData.trips) {
        const newTrip = buildTripFromImport(trip);
        appData.trips[newTrip.id] = newTrip;
      }
      result.trips = Object.keys(appData.trips).length;
    }

    // 设置当前行程
    if (rawData.currentTrip && appData.trips[rawData.currentTrip]) {
      appData.currentTrip = rawData.currentTrip;
    } else if (Object.keys(appData.trips).length > 0) {
      appData.currentTrip = Object.keys(appData.trips)[0];
    }

  } else {
    // 增量导入模式
    if (!appData.spots) appData.spots = [];
    if (!appData.hotels) appData.hotels = [];
    if (!appData.trips) appData.trips = {};
    const locData = getLocationData();

    // 合并区域
    if (rawData.locations) {
      for (const region of ['国内', '国外']) {
        if (rawData.locations[region]) {
          if (!locData[region]) locData[region] = {};
          for (const provName of Object.keys(rawData.locations[region])) {
            if (!locData[region][provName]) {
              locData[region][provName] = rawData.locations[region][provName];
            } else {
              const importCities = rawData.locations[region][provName];
              for (const cityName of Object.keys(importCities)) {
                if (!locData[region][provName][cityName]) {
                  locData[region][provName][cityName] = importCities[cityName];
                }
              }
            }
          }
        }
      }
      setLocationData(locData);
    }

    // 合并景点
    if (rawData.spots && Array.isArray(rawData.spots)) {
      for (const spot of rawData.spots) {
        const existSpot = appData.spots.find(s =>
          s.name === spot.name && s.city === spot.city
        );
        if (!existSpot) {
          const newSpot = { ...spot };
          if (!newSpot.id) newSpot.id = genId('spot');
          appData.spots.push(newSpot);
          result.spotsNew++;
        }
      }
    }

    // 合并酒店
    if (rawData.hotels && Array.isArray(rawData.hotels)) {
      for (const hotel of rawData.hotels) {
        const existHotel = appData.hotels.find(h =>
          h.name === hotel.name && h.location === hotel.location
        );
        if (!existHotel) {
          const newHotel = { ...hotel };
          if (!newHotel.id) newHotel.id = genId('hotel');
          appData.hotels.push(newHotel);
          result.hotelsNew++;
        }
      }
    }

    // 合并行程
    if (rawData.trips && Array.isArray(rawData.trips)) {
      for (const trip of rawData.trips) {
        const existTrip = appData.trips[trip.id] || Object.values(appData.trips).find(t => t.title === trip.title);
        if (existTrip) {
          // 同名行程：用新数据完全替换（保留原ID）
          const updatedTrip = buildTripFromImport(trip, existTrip.id);
          appData.trips[existTrip.id] = updatedTrip;
          result.tripsUpdated = (result.tripsUpdated || 0) + 1;
        } else {
          // 新行程：新增
          const newTrip = buildTripFromImport(trip);
          appData.trips[newTrip.id] = newTrip;
          result.tripsNew++;
        }
      }
    }
  }

  return result;
}

function buildTripFromImport(importTrip, existingId = null) {
  const trip = { ...importTrip };

  // 生成ID（更新时保留原ID）
  trip.id = existingId || trip.id || genId('trip');

  // 确保有基本字段
  if (!trip.platforms) trip.platforms = [];
  if (!trip.reservations) trip.reservations = [];
  if (!trip.days) trip.days = [];

  // 处理购票平台（转换uses为对象数组）
  trip.platforms = trip.platforms.map(p => {
    const platform = { ...p };
    if (!platform.id) platform.id = genId('p');
    if (platform.uses && Array.isArray(platform.uses)) {
      platform.uses = platform.uses.map((u, i) => {
        if (typeof u === 'string') {
          return { id: genId('u'), desc: u };
        }
        return { id: u.id || genId('u'), desc: u.desc || '' };
      });
    }
    return platform;
  });

  // 处理预约提醒（spot名称转spotId）
  trip.reservations = trip.reservations.map(r => {
    const res = { ...r };
    if (!res.id) res.id = genId('r');
    if (res.spot && !res.spotId) {
      const foundSpot = appData.spots.find(s => s.name === res.spot);
      if (foundSpot) res.spotId = foundSpot.id;
      delete res.spot;
    }
    return res;
  });

  // 处理每日行程（景点名称转spotId，酒店名称转hotelId）
  trip.days = trip.days.map((d, i) => {
    const day = { ...d };
    if (day.day === undefined) day.day = i + 1;

    // 转换spots名称数组为spotIds
    if (day.spots && Array.isArray(day.spots)) {
      day.spotIds = day.spots.map(spotName => {
        const foundSpot = appData.spots.find(s => s.name === spotName);
        return foundSpot ? foundSpot.id : null;
      }).filter(id => id !== null);
      delete day.spots;
    }
    if (!day.spotIds) day.spotIds = [];

    // 转换accommodation名称为hotelId
    if (day.accommodation && typeof day.accommodation === 'string') {
      const foundHotel = appData.hotels.find(h => h.name === day.accommodation);
      day.accommodation = foundHotel ? { hotelId: foundHotel.id } : null;
    } else if (!day.accommodation) {
      day.accommodation = null;
    }

    if (!day.title) day.title = '';
    if (!day.theme) day.theme = '';
    if (day.transport === undefined) day.transport = null;
    if (day.note === undefined) day.note = null;

    return day;
  });

  return trip;
}

document.addEventListener('DOMContentLoaded', initApp);
