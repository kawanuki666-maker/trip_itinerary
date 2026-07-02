(function() {
// 行程管理模块：列表、详情、天数编辑、购票平台、预约提醒

function renderTripsList(searchKeyword = '', sortBy = 'date_desc') {
  const listEl = $('tripsList');
  if (!appData.trips || Object.keys(appData.trips).length === 0) {
    listEl.innerHTML = `
      <div class="no-trips">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
        <p>暂无行程</p>
        <p style="font-size: 12px; margin-top: 8px;">点击右上角按钮创建新行程</p>
      </div>
    `;
    return;
  }
  
  // 1. 过滤
  let trips = Object.values(appData.trips);
  if (searchKeyword) {
    const keyword = searchKeyword.toLowerCase();
    trips = trips.filter(trip => {
      return trip.title.toLowerCase().includes(keyword) ||
             (trip.subtitle && trip.subtitle.toLowerCase().includes(keyword)) ||
             (trip.description && trip.description.toLowerCase().includes(keyword));
    });
  }
  
  // 2. 排序
  trips.sort((a, b) => {
    switch (sortBy) {
      case 'date_desc':
        return new Date(b.startDate || 0) - new Date(a.startDate || 0);
      case 'date_asc':
        return new Date(a.startDate || 0) - new Date(b.startDate || 0);
      case 'name_asc':
        return a.title.localeCompare(b.title, 'zh-CN');
      case 'name_desc':
        return b.title.localeCompare(a.title, 'zh-CN');
      default:
        return 0;
    }
  });
  
  if (trips.length === 0) {
    listEl.innerHTML = `
      <div class="no-trips">
        <p>未找到匹配的行程</p>
      </div>
    `;
    return;
  }
  
  const tripsGrid = document.createElement('div');
  tripsGrid.className = 'trips-grid';
  
  tripsGrid.innerHTML = trips.map(trip => {
    let daysCount = calculateTripDays(trip.startDate, trip.endDate);
    if (daysCount === 0 && trip.days) {
      daysCount = trip.days.length;
    }
    const dates = trip.startDate && trip.endDate 
      ? formatTripDates(trip.startDate, trip.endDate) 
      : '';

    return `
      <div class="trip-card">
        <div class="trip-card-content" onclick="selectTrip('${trip.id}')">
          <h3 class="trip-card-title">${trip.title}</h3>
          <p class="trip-card-dates">${dates}</p>
          <p class="trip-card-desc">${trip.subtitle || trip.description || ''}</p>
          <div class="trip-card-footer">
            <span class="trip-card-meta">${trip.subtitle || ''}</span>
            <span class="trip-card-days">${daysCount}天行程</span>
          </div>
        </div>
        <div class="trip-card-actions" style="position: absolute; top: 24px; right: 24px;">
          <button class="trip-card-action-btn" onclick="viewTrip('${trip.id}')" title="预览行程">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
          </button>
          <button class="trip-card-action-btn" onclick="selectTrip('${trip.id}')" title="编辑行程">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="trip-card-action-btn" data-action="delete" onclick="confirmDeleteTrip('${trip.id}', event)" title="删除行程">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18"/>
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  }).join('');
  
  listEl.innerHTML = '';
  listEl.appendChild(tripsGrid);
}


function viewTrip(tripId) {
  localStorage.setItem('viewingTripId', tripId);
  window.open('../preview.html', '_blank');
}


function selectTrip(tripId) {
  appData.currentTrip = tripId;
  localStorage.setItem('appData', JSON.stringify(appData));
  
  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
  $('tripDetailSection').classList.add('active');
  
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  
  loadTripFormData();
  renderDaysList();
  renderPlatformsList();
  renderReservationsList();
}


function confirmDeleteTrip(tripId, event) {
  event.stopPropagation();
  
  const trip = appData.trips[tripId];
  if (!trip) return;
  
  if (confirm(`确定要删除行程「${trip.title}」吗？此操作不可恢复。`)) {
    deleteTrip(tripId);
  }
}


function deleteTrip(tripId) {
  delete appData.trips[tripId];
  
  // 如果删除的是当前行程，清空当前选择
  if (appData.currentTrip === tripId) {
    const tripIds = Object.keys(appData.trips);
    appData.currentTrip = tripIds.length > 0 ? tripIds[0] : '';
  }
  
  localStorage.setItem('appData', JSON.stringify(appData));
  renderTripsList();
  
  showToast('行程已删除', 'success');
}


function getCurrentTripPlatforms() {
  const trip = appData.trips?.[appData.currentTrip];
  return trip?.platforms || [];
}


function getCurrentTripReservations() {
  const trip = appData.trips?.[appData.currentTrip];
  return trip?.reservations || [];
}


function getCurrentTripDays() {
  const trip = appData.trips?.[appData.currentTrip];
  return trip?.days || [];
}


function setCurrentTripDays(days) {
  if (appData.trips?.[appData.currentTrip]) {
    appData.trips[appData.currentTrip].days = days;
  }
}


function switchTripTab(tabName) {
  const tabs = document.querySelectorAll('.trip-tab');
  const panels = document.querySelectorAll('.trip-panel');
  
  tabs.forEach(tab => {
    if (tab.dataset.tab === tabName) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
  
  const panelMap = {
    basic: 'basicPanel',
    days: 'daysPanel',
    platforms: 'platformsPanel',
    reservations: 'reservationsPanel'
  };
  
  const targetPanelId = panelMap[tabName];
  if (targetPanelId) {
    panels.forEach(panel => {
      if (panel.id === targetPanelId) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });
  }
  
  if (tabName === 'reservations') {
    renderReservationsList();
  }
}


function renderPlatformsList() {
  const listEl = $('platformsList');
  const countEl = $('platformsCount');
  const platforms = getCurrentTripPlatforms();
  
  if (countEl) countEl.textContent = platforms.length;
  
  if (platforms.length === 0) {
    listEl.innerHTML = '<p style="color: var(--text-dim); text-align: center; padding: 20px;">暂无购票平台</p>';
    return;
  }
  
  listEl.innerHTML = platforms.map(p => {
    const uses = p.uses || [{ desc: p.use }];
    const usesText = uses.map(u => u.desc || u).join('、');
    return `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid var(--border-light);">
        <div>
          <p style="font-size: 14px; font-weight: 500; color: var(--text);">${p.name}</p>
          <p style="font-size: 12px; color: var(--text-dim); margin-top: 4px;">${usesText}</p>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-logout" style="width: auto; padding: 6px 12px; font-size: 11px;" onclick="openPlatformModal('${p.id}'); return false;">编辑</button>
          <button class="btn btn-logout" style="width: auto; padding: 6px 12px; font-size: 11px; color: #c00; border-color: rgba(204,0,0,0.3);" onclick="deletePlatform('${p.id}')">删除</button>
        </div>
      </div>
    `;
  }).join('');
}


function renderReservationsList() {
  const listEl = $('reservationsList');
  const countEl = $('reservationsCount');
  const reservations = getCurrentTripReservations();
  
  if (countEl) countEl.textContent = reservations.length;
  
  if (reservations.length === 0) {
    listEl.innerHTML = '<p style="color: var(--text-dim); text-align: center; padding: 20px;">暂无预约提醒</p>';
    return;
  }
  
  listEl.innerHTML = reservations.map(r => {
    const spot = appData.spots?.find(s => s.id === r.spotId);
    const dueDate = calculateDueDate(r.spotId, r.advance);
    return `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid var(--border);">
        <div>
          <p style="font-size: 14px; font-weight: 500; color: var(--text);">${spot?.name || r.spotId}</p>
          <p style="font-size: 12px; color: var(--text-dim); margin-top: 4px;">${r.platform} · 提前${r.advance}天 · 截止：${dueDate || '无法计算'}</p>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-logout" style="width: auto; padding: 6px 12px; font-size: 11px;" onclick="openReservationModal('${r.id}'); return false;">编辑</button>
          <button class="btn btn-logout" style="width: auto; padding: 6px 12px; font-size: 11px; color: #c00; border-color: rgba(204,0,0,0.3);" onclick="deleteReservation('${r.id}')">删除</button>
        </div>
      </div>
    `;
  }).join('');
}


let editingPlatformId = null;

let editingReservationId = null;


function openPlatformModal(platformId = null) {
  editingPlatformId = platformId;
  const modal = $('platformModal');
  const titleEl = $('platformModalTitle');
  const nameEl = $('platformModalName');
  const containerEl = $('platformUsesContainer');
  
  containerEl.innerHTML = '';
  
  if (platformId) {
    titleEl.textContent = '编辑购票平台';
    const platform = getCurrentTripPlatforms().find(p => p.id === platformId);
    if (platform) {
      nameEl.value = platform.name;
      const uses = platform.uses || [{ desc: platform.use }];
      uses.forEach((use, index) => {
        addUseItem(use.desc || use, index === uses.length - 1);
      });
    }
  } else {
    titleEl.textContent = '添加购票平台';
    nameEl.value = '';
    addUseItem('', true);
  }
  
  modal.style.display = 'flex';
}


function addUseItem(value = '', isLast = false) {
  const containerEl = $('platformUsesContainer');
  const useItem = document.createElement('div');
  useItem.className = 'use-item';
  useItem.style.display = 'flex';
  useItem.style.gap = '8px';
  useItem.style.marginBottom = '8px';
  
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'form-input';
  input.placeholder = '输入使用场景';
  input.style.flex = '1';
  input.value = value;
  
  const removeBtn = document.createElement('button');
  removeBtn.className = 'btn btn-danger btn-sm';
  removeBtn.innerHTML = '-';
  removeBtn.style.width = '32px';
  removeBtn.style.height = '32px';
  removeBtn.style.padding = '0';
  removeBtn.onclick = () => removeUseItem(removeBtn);
  
  useItem.appendChild(input);
  useItem.appendChild(removeBtn);
  containerEl.appendChild(useItem);
  
  // 确保至少有一个输入框
  updateRemoveButtons();
}


function removeUseItem(btn) {
  const containerEl = $('platformUsesContainer');
  const items = containerEl.querySelectorAll('.use-item');
  
  if (items.length > 1) {
    btn.parentElement.remove();
    updateRemoveButtons();
  }
}


function updateRemoveButtons() {
  const containerEl = $('platformUsesContainer');
  const items = containerEl.querySelectorAll('.use-item');
  const removeBtns = containerEl.querySelectorAll('.btn-danger');
  
  removeBtns.forEach((btn, index) => {
    btn.style.display = items.length > 1 ? 'block' : 'none';
  });
}


function closePlatformModal() {
  $('platformModal').style.display = 'none';
  editingPlatformId = null;
}


function savePlatform() {
  const name = $('platformModalName').value.trim();
  if (!name) {
    showToast('请输入平台名称', 'error');
    return;
  }
  
  const containerEl = $('platformUsesContainer');
  const inputs = containerEl.querySelectorAll('input');
  const uses = Array.from(inputs)
    .map(input => input.value.trim())
    .filter(value => value);
  
  if (uses.length === 0) {
    showToast('请至少添加一个使用场景', 'error');
    return;
  }
  
  // 获取原有 platform 的 uses 列表（用于保留原有 ID）
  const originalPlatform = editingPlatformId 
    ? getCurrentTripPlatforms().find(p => p.id === editingPlatformId) 
    : null;
  const originalUses = originalPlatform?.uses || [];
  
  const platformData = {
    id: editingPlatformId || 'p_' + Date.now(),
    name: name,
    uses: uses.map((desc, index) => ({
      // 编辑时保留原有 ID，只有新增的才生成新 ID
      id: index < originalUses.length ? originalUses[index].id : 'u_' + Date.now() + '_' + index,
      desc: desc
    }))
  };
  
  const platforms = getCurrentTripPlatforms();
  
  if (editingPlatformId) {
    const index = platforms.findIndex(p => p.id === editingPlatformId);
    if (index !== -1) {
      platforms[index] = platformData;
    }
  } else {
    platforms.push(platformData);
  }
  
  appData.trips[appData.currentTrip].platforms = platforms;
  if (!tempTrip) {
    localStorage.setItem('appData', JSON.stringify(appData));
  }
  closePlatformModal();
  renderPlatformsList();
  showToast('保存成功！', 'success');
}


function deletePlatform(platformId) {
  if (!confirm('确定删除这个购票平台吗？')) return;
  
  const platforms = getCurrentTripPlatforms();
  appData.trips[appData.currentTrip].platforms = platforms.filter(p => p.id !== platformId);
  if (!tempTrip) {
    localStorage.setItem('appData', JSON.stringify(appData));
  }
  renderPlatformsList();
  showToast('删除成功！', 'info');
}


function getNeedReservationSpotsInTrip() {
  const allSpots = appData.spots || [];
  const days = getCurrentTripDays();
  
  const tripSpotIds = new Set();
  days.forEach(day => {
    day.spotIds?.forEach(spotId => {
      tripSpotIds.add(spotId);
    });
  });
  
  return allSpots.filter(spot => spot.needReservation && tripSpotIds.has(spot.id));
}


function getSpotTripDay(spotId) {
  const days = getCurrentTripDays();
  for (const day of days) {
    if (day.spotIds?.includes(spotId)) {
      // 动态计算日期，而不是使用存储的固定日期
      const calculatedDate = calculateDayDate(day.day);
      if (calculatedDate) {
        const dateObj = new Date(calculatedDate);
        // 返回包含动态日期的对象
        return {
          ...day,
          date: `${dateObj.getMonth() + 1}.${dateObj.getDate()}`, // 格式化为 "6.13"
          weekday: getWeekdayString(calculatedDate)
        };
      }
      return day;
    }
  }
  return null;
}


function calculateDueDate(spotId, advanceText) {
  const day = getSpotTripDay(spotId);
  if (!day) return null;
  
  const match = advanceText.match(/(\d+)/);
  if (!match) return null;
  
  const advanceDays = parseInt(match[1]);
  if (isNaN(advanceDays)) return null;
  
  const tripDateStr = calculateDayDate(day.day);
  if (!tripDateStr) return null;
  
  const tripDate = new Date(tripDateStr);
  tripDate.setDate(tripDate.getDate() - advanceDays);
  
  return `${tripDate.getMonth() + 1}月${tripDate.getDate()}日`;
}


function updateReservationDueDate() {
  const spotId = $('reservationModalSpot').value;
  const advance = $('reservationModalAdvance').value;
  const hintEl = $('reservationDueDateHint');
  const dueDateEl = $('reservationModalDueDate');
  
  if (!spotId || !advance) {
    dueDateEl.value = '';
    hintEl.textContent = '';
    return;
  }
  
  const day = getSpotTripDay(spotId);
  if (!day) {
    dueDateEl.value = '';
    hintEl.textContent = '该景点未安排在行程中';
    return;
  }
  
  const dueDate = calculateDueDate(spotId, advance);
  const tripDateStr = calculateDayDate(day.day);
  const dayDateFormatted = tripDateStr ? (() => {
    const d = new Date(tripDateStr);
    return `${d.getMonth() + 1}.${d.getDate()}`;
  })() : '';
  const dayWeekday = getWeekdayString(tripDateStr);
  
  if (dueDate) {
    dueDateEl.value = dueDate;
    hintEl.textContent = `💡 该景点安排在${dayDateFormatted}（${dayWeekday}），提前${advance}天预约，则截止日期为${dueDate}`;
  } else {
    dueDateEl.value = '';
    hintEl.textContent = '无法计算截止日期';
  }
}


function populateReservationSpotSelect() {
  const selectEl = $('reservationModalSpot');
  const spots = getNeedReservationSpotsInTrip();
  
  selectEl.innerHTML = '<option value="">请选择需要预约的景点</option>';
  
  spots.forEach(spot => {
    const day = getSpotTripDay(spot.id);
    let dayInfo = '';
    if (day) {
      const tripDateStr = calculateDayDate(day.day);
      const dayDateFormatted = tripDateStr ? (() => {
        const d = new Date(tripDateStr);
        return `${d.getMonth() + 1}.${d.getDate()}`;
      })() : '';
      const dayWeekday = getWeekdayString(tripDateStr);
      dayInfo = `（${dayDateFormatted} ${dayWeekday}）`;
    }
    const option = document.createElement('option');
    option.value = spot.id;
    option.textContent = `${spot.name}${dayInfo}`;
    selectEl.appendChild(option);
  });
  
  if (spots.length === 0) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = '暂无需要预约的景点';
    option.disabled = true;
    selectEl.appendChild(option);
  }
}


function openReservationModal(reservationId = null) {
  editingReservationId = reservationId;
  const modal = $('reservationModal');
  const titleEl = $('reservationModalTitle');
  
  populateReservationSpotSelect();
  
  const spotEl = $('reservationModalSpot');
  const platformEl = $('reservationModalPlatform');
  const advanceEl = $('reservationModalAdvance');
  const dueDateEl = $('reservationModalDueDate');
  
  if (reservationId) {
    titleEl.textContent = '编辑预约提醒';
    const reservation = getCurrentTripReservations().find(r => r.id === reservationId);
    if (reservation) {
      spotEl.value = reservation.spotId;
      platformEl.value = reservation.platform;
      advanceEl.value = reservation.advance;
      dueDateEl.value = '';
      updateReservationDueDate();
    }
  } else {
    titleEl.textContent = '添加预约提醒';
    spotEl.value = '';
    platformEl.value = '';
    advanceEl.value = '';
    dueDateEl.value = '';
    $('reservationDueDateHint').textContent = '';
  }
  
  modal.style.display = 'flex';
}


function closeReservationModal() {
  $('reservationModal').style.display = 'none';
  editingReservationId = null;
}


function saveReservation() {
  const spotId = $('reservationModalSpot').value;
  const platform = $('reservationModalPlatform').value.trim();
  const advance = $('reservationModalAdvance').value.trim();
  
  if (!spotId) {
    showToast('请选择景点', 'error');
    return;
  }
  
  // 检查该景点是否已有预约提醒（新增时才检查）
  if (!editingReservationId) {
    const reservations = getCurrentTripReservations();
    const existingReservation = reservations.find(r => r.spotId === spotId);
    if (existingReservation) {
      const spot = appData.spots?.find(s => s.id === spotId);
      const spotName = spot ? spot.name : '该景点';
      showToast(`${spotName}已存在预约提醒！`, 'error');
      return;
    }
  }
  
  const reservationData = {
    id: editingReservationId || 'r_' + Date.now(),
    spotId: spotId,
    platform: platform,
    advance: advance
  };
  
  const reservations = getCurrentTripReservations();
  
  if (editingReservationId) {
    const index = reservations.findIndex(r => r.id === editingReservationId);
    if (index !== -1) {
      reservations[index] = reservationData;
    }
  } else {
    reservations.push(reservationData);
  }
  
  appData.trips[appData.currentTrip].reservations = reservations;
  if (!tempTrip) {
    localStorage.setItem('appData', JSON.stringify(appData));
  }
  closeReservationModal();
  renderReservationsList();
  showToast('保存成功！', 'success');
}


function deleteReservation(reservationId) {
  if (!confirm('确定删除这个预约提醒吗？')) return;
  
  const reservations = getCurrentTripReservations();
  appData.trips[appData.currentTrip].reservations = reservations.filter(r => r.id !== reservationId);
  if (!tempTrip) {
    localStorage.setItem('appData', JSON.stringify(appData));
  }
  renderReservationsList();
  showToast('删除成功！', 'info');
}


function backToTripsList() {
  if (tempTrip && appData.trips[tempTrip]) {
    delete appData.trips[tempTrip];
    localStorage.setItem('appData', JSON.stringify(appData));
    tempTrip = null;
  }
  
  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
  $('tripsSection').classList.add('active');
  
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  document.querySelector('.nav-item[data-section="trips"]').classList.add('active');
  renderTripsList();
}

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    
    const section = item.dataset.section;
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    $(`${section}Section`).classList.add('active');
    
    if (section === 'trips') {
      renderTripsList();
    }
    if (section === 'locations') {
      renderLocationLevel1List();
      renderLocationLevel2List();
    }
  });
});

$('logoutBtn').addEventListener('click', () => {
  githubConfig = { token: '', repo: '' };
  sessionStorage.removeItem('githubConfig');
  localStorage.removeItem('appData');
  $('adminPage').classList.remove('active');
  $('loginPage').style.display = 'flex';
  $('tokenInput').value = '';
  $('repoInput').value = '';
  $('loginBtn').disabled = false;
  $('loginBtn').textContent = '进入后台';
});

$('saveTripBtn').addEventListener('click', () => {
  const title = $('tripTitle').value.trim();
  if (!title) {
    showToast('请输入行程标题', 'error');
    return;
  }
  
  if (!appData.trips) appData.trips = {};
  if (!appData.trips[appData.currentTrip]) appData.trips[appData.currentTrip] = {};
  
  const startDate = $('tripStartDate').value;
  const endDate = $('tripEndDate').value;
  
  appData.trips[appData.currentTrip] = {
    ...appData.trips[appData.currentTrip],
    id: appData.currentTrip,
    title: title,
    startDate: startDate,
    endDate: endDate,
    subtitle: $('tripSubtitle').value,
    description: $('tripDescription').value,
    days: appData.trips[appData.currentTrip]?.days || [],
    platforms: appData.trips[appData.currentTrip]?.platforms || [],
    reservations: appData.trips[appData.currentTrip]?.reservations || []
  };
  
  localStorage.setItem('appData', JSON.stringify(appData));
  tempTrip = null;
  renderDaysList();
  renderReservationsList();
  showToast('保存成功！', 'success');
});

$('addTripBtn').addEventListener('click', () => {
  const tripId = 'trip_' + Date.now();
  tempTrip = tripId;
  
  if (!appData.trips) appData.trips = {};
  appData.trips[tripId] = {
    id: tripId,
    title: '',
    startDate: '',
    endDate: '',
    subtitle: '',
    description: '',
    platforms: [],
    reservations: [],
    days: []
  };
  
  appData.currentTrip = tripId;
  
  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
  $('tripDetailSection').classList.add('active');
  
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  
  loadTripFormData();
  renderDaysList();
  renderPlatformsList();
  renderReservationsList();
});

$('backToTripsBtn').addEventListener('click', backToTripsList);

$('addPlatformBtn').addEventListener('click', () => { openPlatformModal(); });
$('addUseBtn').addEventListener('click', () => { addUseItem('', true); });
$('addReservationBtn').addEventListener('click', () => { openReservationModal(); });

if ($('platformModalCloseBtn')) $('platformModalCloseBtn').addEventListener('click', closePlatformModal);
if ($('platformModalCancelBtn')) $('platformModalCancelBtn').addEventListener('click', closePlatformModal);
if ($('platformModalSaveBtn')) $('platformModalSaveBtn').addEventListener('click', savePlatform);

if ($('reservationModalCloseBtn')) $('reservationModalCloseBtn').addEventListener('click', closeReservationModal);
if ($('reservationModalCancelBtn')) $('reservationModalCancelBtn').addEventListener('click', closeReservationModal);
if ($('reservationModalSaveBtn')) $('reservationModalSaveBtn').addEventListener('click', saveReservation);
if ($('reservationModalSpot')) $('reservationModalSpot').addEventListener('change', updateReservationDueDate);
if ($('reservationModalAdvance')) $('reservationModalAdvance').addEventListener('input', updateReservationDueDate);

$('previewDataBtn').addEventListener('click', () => {
  const jsonWindow = window.open('', '_blank');
  jsonWindow.document.write('<pre style="background: #fafafa; color: #1a1a1a; padding: 20px; font-family: monospace; font-size: 12px;">' + JSON.stringify(appData, null, 2) + '</pre>');
});

$('reloadDataBtn').addEventListener('click', () => {
  if (!confirm('确定要从 JSON 文件重新加载数据吗？所有未保存的修改将丢失。')) return;
  
  // 检查是否以 file:// 协议打开
  if (window.location.protocol === 'file:') {
    showToast('当前以文件方式打开，已使用默认数据', 'info');
    localStorage.removeItem('appData');
    appData = JSON.parse(JSON.stringify(defaultData));
    localStorage.setItem('appData', JSON.stringify(appData));
    renderUI();
    return;
  }
  
  localStorage.removeItem('appData');
  
  fetch('data/itinerary.json')
    .then(res => res.json())
    .then(data => {
      appData = data;
      localStorage.setItem('appData', JSON.stringify(appData));
      renderUI();
      showToast('数据已从 JSON 文件重新加载！', 'success');
    })
    .catch(() => {
      showToast('加载失败，请检查 data/itinerary.json 文件是否存在', 'error');
    });
});


let editingDayIndex = null;

let editingDayId = null;

let draggedDayIndex = -1;


function renderDaysList() {
  const listEl = $('daysList');
  const days = getCurrentTripDays();
  if (!days || days.length === 0) {
    listEl.innerHTML = '<p style="color: var(--text-dim); text-align: center; padding: 40px;">暂无行程</p>';
    return;
  }

  const sortedDays = [...days].sort((a, b) => a.day - b.day);
  let html = '';
  
  sortedDays.forEach((day, index) => {
    const calculatedDate = calculateDayDate(day.day);
    const calculatedWeekday = getWeekdayString(calculatedDate);
    const formattedDate = calculatedDate ? (() => {
      const d = new Date(calculatedDate);
      return `${d.getMonth() + 1}.${d.getDate()}`;
    })() : '';
    
    html += '<div style="padding: 20px; border-bottom: 1px solid var(--border-light);">';
    html += '<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">';
    html += '<div style="display: flex; align-items: center; gap: 12px;">';
    html += '<span style="width: 32px; height: 32px; background: var(--accent); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600;">D' + day.day + '</span>';
    html += '<div>';
    html += '<h4 style="font-size: 14px; font-weight: 600; color: var(--text); margin: 0;">' + (day.title || '') + '</h4>';
    let subTextParts = [];
    if (formattedDate) subTextParts.push(formattedDate);
    if (calculatedWeekday) subTextParts.push(calculatedWeekday);
    if (day.theme) subTextParts.push(day.theme);
    html += '<p style="font-size: 12px; color: var(--text-dim); margin: 2px 0 0 0;">' + subTextParts.join(' · ') + '</p>';
    html += '</div></div>';
    html += '<div style="display: flex; gap: 8px;">';
    
    const upDisabled = index === 0 ? 'disabled style="opacity: 0.3; cursor: not-allowed;"' : '';
    const downDisabled = index === sortedDays.length - 1 ? 'disabled style="opacity: 0.3; cursor: not-allowed;"' : '';
    
    html += '<button onclick="moveDay(' + index + ', -1)" style="width: 28px; height: 28px; border: 1px solid var(--border); background: white; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center;" title="上移" ' + upDisabled + '>↑</button>';
    html += '<button onclick="moveDay(' + index + ', 1)" style="width: 28px; height: 28px; border: 1px solid var(--border); background: white; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center;" title="下移" ' + downDisabled + '>↓</button>';
    html += '<button class="btn btn-logout" onclick="openDayModal(' + index + '); return false;" style="width: auto; padding: 6px 12px; font-size: 11px;">编辑</button>';
    html += '<button class="btn btn-logout" onclick="deleteDay(' + index + '); return false;" style="width: auto; padding: 6px 12px; font-size: 11px; color: #c00; border-color: rgba(204,0,0,0.3);">删除</button>';
    html += '</div></div>';
    
    if (day.spotIds && day.spotIds.length > 0) {
      html += '<div style="margin-bottom: 12px;">';
      html += '<div style="display: flex; flex-wrap: wrap; gap: 6px;">';
      day.spotIds.forEach(spotId => {
        const spot = appData.spots ? appData.spots.find(s => s.id === spotId) : null;
        html += '<span style="font-size: 11px; color: var(--text-mid); background: var(--surface-2); padding: 3px 8px; border-radius: 4px;">' + (spot ? spot.name : spotId) + '</span>';
      });
      html += '</div></div>';
    }
    
    if (day.accommodation) {
      const hotel = appData.hotels?.find(h => h.id === day.accommodation.hotelId);
      html += '<div style="margin-bottom: 8px;"><span style="font-size: 12px; color: var(--text-dim);">🏨 ' + (hotel ? hotel.name : '') + '</span></div>';
    }
    
    if (day.transport) {
      html += '<div style="margin-bottom: 8px;"><span style="font-size: 12px; color: var(--text-dim);">🚗 ' + day.transport + '</span></div>';
    }
    
    if (day.note) {
      html += '<div style="padding: 8px; background: rgba(204,0,0,0.05); border-radius: 4px;"><span style="font-size: 12px; color: #c00;">⚠️ ' + day.note + '</span></div>';
    }
    
    html += '</div>';
  });
  
  listEl.innerHTML = html;
}


function bindDayDragEvents() {
  const items = document.querySelectorAll('.day-item');
  items.forEach(item => {
    item.addEventListener('dragstart', handleDayDragStart);
    item.addEventListener('dragover', handleDayDragOver);
    item.addEventListener('drop', handleDayDrop);
    item.addEventListener('dragend', handleDayDragEnd);
  });
}


function handleDayDragStart(e) {
  draggedDayIndex = parseInt(e.target.closest('.day-item').dataset.dayIndex);
  e.target.closest('.day-item').style.opacity = '0.5';
  e.target.closest('.day-item').style.background = 'var(--surface-2)';
  e.dataTransfer.effectAllowed = 'move';
}


function handleDayDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  
  const targetItem = e.target.closest('.day-item');
  if (targetItem) {
    targetItem.style.borderTop = '3px solid var(--accent)';
  }
}


function handleDayDrop(e) {
  e.preventDefault();
  
  const targetItem = e.target.closest('.day-item');
  if (targetItem && draggedDayIndex !== -1) {
    const dropIndex = parseInt(targetItem.dataset.dayIndex);
    
    if (draggedDayIndex !== dropIndex) {
      // 重新排序
      const days = [...getCurrentTripDays()];
      const [removed] = days.splice(draggedDayIndex, 1);
      days.splice(dropIndex, 0, removed);
      
      // 重新编号
      days.forEach((day, index) => {
        day.day = index + 1;
      });
      
      setCurrentTripDays(days);
      if (!tempTrip) {
        localStorage.setItem('appData', JSON.stringify(appData));
      }
      renderDaysList();
    }
  }
  
  draggedDayIndex = -1;
}


function handleDayDragEnd(e) {
  const items = document.querySelectorAll('.day-item');
  items.forEach(item => {
    item.style.opacity = '1';
    item.style.background = 'white';
    item.style.borderTop = 'none';
  });
  draggedDayIndex = -1;
}


let selectedDaySpotIds = [];

let selectedDayHotelId = null;


function showDayHotelList(show) {
  const listEl = $('dayAvailableHotels');
  if (listEl) {
    listEl.style.display = show ? 'block' : 'none';
  }
}


function filterDayHotels() {
  const keyword = $('dayHotelSearch').value.toLowerCase();
  
  let hotels = appData.hotels || [];
  
  if (keyword) {
    hotels = hotels.filter(h => 
      h.name.toLowerCase().includes(keyword) || 
      h.location.toLowerCase().includes(keyword) ||
      h.address.toLowerCase().includes(keyword)
    );
  }
  
  renderDayHotelList(hotels);
}


function renderDayHotelList(hotels = null) {
  const listEl = $('dayAvailableHotels');
  const hotelsToRender = hotels !== null ? hotels : (appData.hotels || []);
  
  if (hotelsToRender.length === 0) {
    listEl.innerHTML = '<p style="color: var(--text-dim); text-align: center; padding: 16px;">无匹配的酒店</p>';
    return;
  }
  
  listEl.innerHTML = hotelsToRender.map(hotel => {
    const isSelected = selectedDayHotelId === hotel.id;
    return `
      <div style="background: ${isSelected ? 'var(--accent-dim)' : 'white'}; display: flex; align-items: center; gap: 8px; padding: 6px 8px; margin-bottom: 4px; border-radius: 4px; cursor: pointer;"
           onclick="selectDayHotel('${hotel.id}')">
        <span style="font-size: 13px; color: var(--text);">${hotel.name}</span>
        <span style="font-size: 11px; color: var(--text-dim);">(${hotel.location || ''})</span>
      </div>
    `;
  }).join('');
}


function selectDayHotel(hotelId) {
  selectedDayHotelId = hotelId;
  
  const hotel = appData.hotels?.find(h => h.id === hotelId);
  const badge = $('selectedHotelBadge');
  const badgeName = $('selectedHotelName');
  const badgeLocation = $('selectedHotelLocation');
  const searchInput = $('dayHotelSearch');
  
  if (hotel) {
    badgeName.textContent = hotel.name;
    badgeLocation.textContent = hotel.location ? `(${hotel.location})` : '';
    badge.style.display = 'flex';
    searchInput.value = '';
    searchInput.placeholder = '';
  } else {
    badge.style.display = 'none';
    searchInput.placeholder = '搜索酒店名称、城市...';
  }
  
  filterDayHotels();
  showDayHotelList(false);
}


function clearSelectedHotel() {
  selectedDayHotelId = null;
  $('selectedHotelBadge').style.display = 'none';
  $('selectedHotelName').textContent = '';
  $('selectedHotelLocation').textContent = '';
  $('dayHotelSearch').placeholder = '搜索酒店名称、城市...';
  $('dayHotelSearch').style.paddingLeft = '8px';
  filterDayHotels();
}


function initDaySpotFilters() {
  const regionSelect = $('dayModalSpotRegion');
  const provinceSelect = $('dayModalSpotProvince');
  const citySelect = $('dayModalSpotCity');
  const districtSelect = $('dayModalSpotDistrict');
  
  const loadLevel1Options = (region) => {
    provinceSelect.innerHTML = '<option value="">--</option>';
    citySelect.innerHTML = '<option value="">--</option>';
    districtSelect.innerHTML = '<option value="">--</option>';
    citySelect.disabled = true;
    districtSelect.disabled = true;
    
    const locData = getLocationData();
    if (region === '国内') {
      const domestic = locData['国内'] || {};
      Object.keys(domestic).sort().forEach(province => {
        const option = document.createElement('option');
        option.value = province;
        option.textContent = province;
        provinceSelect.appendChild(option);
      });
      provinceSelect.disabled = false;
    } else if (region === '国外') {
      const intl = locData['国外'] || {};
      Object.keys(intl).sort().forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        provinceSelect.appendChild(option);
      });
      provinceSelect.disabled = false;
    } else {
      provinceSelect.disabled = true;
    }
  };
  
  loadLevel1Options(regionSelect.value);
  
  regionSelect.addEventListener('change', () => {
    loadLevel1Options(regionSelect.value);
    renderDaySpotList();
  });
  
  provinceSelect.addEventListener('change', () => {
    const region = regionSelect.value;
    const province = provinceSelect.value;
    citySelect.innerHTML = '<option value="">--</option>';
    districtSelect.innerHTML = '<option value="">--</option>';
    citySelect.disabled = !province;
    districtSelect.disabled = true;
    
    if (province) {
      const locData = getLocationData();
      if (region === '国内') {
        const domestic = locData['国内'] || {};
        if (domestic[province]) {
          citySelect.disabled = false;
          Object.keys(domestic[province]).sort().forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
          });
        }
      } else if (region === '国外') {
        const intl = locData['国外'] || {};
        if (intl[province]) {
          citySelect.disabled = false;
          Object.keys(intl[province]).sort().forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
          });
        }
      }
    }
    renderDaySpotList();
  });
  
  citySelect.addEventListener('change', () => {
    const region = regionSelect.value;
    const province = provinceSelect.value;
    const city = citySelect.value;
    districtSelect.innerHTML = '<option value="">--</option>';
    districtSelect.disabled = !city;
    
    if (region === '国内' && province && city) {
      const locData = getLocationData();
      const domestic = locData['国内'] || {};
      if (domestic[province] && domestic[province][city]) {
        districtSelect.disabled = false;
        domestic[province][city].forEach(district => {
          const option = document.createElement('option');
          option.value = district;
          option.textContent = district;
          districtSelect.appendChild(option);
        });
      }
    }
    renderDaySpotList();
  });
  
  districtSelect.addEventListener('change', () => {
    renderDaySpotList();
  });
}


function filterSpotsByLocation() {
  const region = $('dayModalSpotRegion').value;
  const province = $('dayModalSpotProvince').value;
  const city = $('dayModalSpotCity').value;
  const district = $('dayModalSpotDistrict').value;
  
  if (!appData.spots) return [];
  
  const locData = getLocationData();
  const domestic = locData['国内'] || {};
  const intl = locData['国外'] || {};
  
  return appData.spots.filter(spot => {
    const parts = spot.city ? spot.city.split(' - ') : [];
    const spotProvince = parts[0] || '';
    const spotCity = parts[1] || '';
    const spotDistrict = parts[2] || '';
    
    if (region === '国内' && !domestic[spotProvince]) return false;
    if (region === '国外' && !intl[spotProvince]) return false;
    if (province && spotProvince !== province) return false;
    if (city && spotCity !== city) return false;
    if (district && spotDistrict !== district) return false;
    
    return true;
  });
}


function renderDaySpotList() {
  const container = $('dayModalAvailableSpots');
  const availableSpots = filterSpotsByLocation();
  
  if (availableSpots.length === 0) {
    container.innerHTML = '<p style="color: var(--text-dim); text-align: center; padding: 16px;">无匹配的景点</p>';
    return;
  }
  
  container.innerHTML = availableSpots.map(spot => {
    const isSelected = selectedDaySpotIds.includes(spot.id);
    return `
    <div style="background: ${isSelected ? 'var(--accent-dim)' : 'white'}; display: flex; align-items: center; gap: 8px; padding: 6px 8px; margin-bottom: 4px; border-radius: 4px; cursor: pointer;"
         ondblclick="toggleSpotSelection('${spot.id}')">
      <input type="checkbox" data-spot-id="${spot.id}" ${isSelected ? 'checked' : ''} style="margin: 0; cursor: pointer; width: 16px; height: 16px; accent-color: white;" onclick="event.stopPropagation(); toggleSpotSelection('${spot.id}');">
      <span style="font-size: 13px; color: var(--text);">${spot.name}</span>
      <span style="font-size: 11px; color: var(--text-dim);">(${spot.city})</span>
    </div>
  `}).join('');
}


function toggleSpotSelection(spotId) {
  const index = selectedDaySpotIds.indexOf(spotId);
  if (index === -1) {
    selectedDaySpotIds.push(spotId);
  } else {
    selectedDaySpotIds.splice(index, 1);
  }
  renderSelectedSpots();
  // 不再重新渲染左栏，只更新选中状态
  updateSpotSelectionVisual(spotId);
}


function updateSpotSelectionVisual(spotId) {
  const checkbox = document.querySelector(`input[type="checkbox"][data-spot-id="${spotId}"]`);
  if (checkbox) {
    checkbox.checked = selectedDaySpotIds.includes(spotId);
    const parentDiv = checkbox.parentElement;
    parentDiv.style.background = checkbox.checked ? 'var(--accent-dim)' : 'white';
  }
}


function clearAllSpotSelection() {
  document.querySelectorAll('input[type="checkbox"][data-spot-id]').forEach(checkbox => {
    checkbox.checked = false;
    const parentDiv = checkbox.parentElement;
    parentDiv.style.background = 'white';
  });
}


function renderSelectedSpots() {
  const container = $('dayModalSelectedSpots');
  
  if (selectedDaySpotIds.length === 0) {
    container.innerHTML = '<p style="color: var(--text-dim); font-size: 12px; text-align: center; padding-top: 80px;">拖拽或双击添加景点</p>';
    return;
  }
  
  container.innerHTML = '';
  
  selectedDaySpotIds.forEach((spotId, index) => {
    const spot = appData.spots?.find(s => s.id === spotId);
    if (!spot) return;
    
    const div = document.createElement('div');
    div.draggable = true;
    div.dataset.spotIndex = index;
    div.style.cssText = 'display: flex; align-items: center; gap: 8px; padding: 8px; margin-bottom: 4px; background: white; border-radius: 4px; cursor: grab; border: 1px solid var(--border);';
    div.onmousedown = () => { div.style.cursor = 'grabbing'; };
    div.onmouseup = () => { div.style.cursor = 'grab'; };
    div.ondragstart = handleDragStart;
    div.ondragover = handleDragOver;
    div.ondrop = handleDrop;
    div.ondragend = handleDragEnd;
    
    div.innerHTML = `
      <span style="font-size: 12px; font-weight: 600; min-width: 20px; text-align: center; color: var(--text-mid);">${index + 1}</span>
      <span style="flex: 1; font-size: 13px; color: var(--text);">${spot.name}</span>
      <span style="font-size: 11px; color: var(--text-dim);">${spot.city}</span>
      <button onclick="removeSpotFromDay('${spotId}')" style="background: transparent; color: var(--text-dim); border: none; border-radius: 4px; padding: 2px 6px; font-size: 14px; cursor: pointer; transition: color 0.2s;" title="移除" onmouseover="this.style.color='#c00'" onmouseout="this.style.color='var(--text-dim)'">×</button>
    `;
    container.appendChild(div);
  });
}


let draggedIndex = -1;


function handleDragStart(e) {
  draggedIndex = parseInt(e.target.dataset.spotIndex);
  e.dataTransfer.effectAllowed = 'move';
  e.target.style.opacity = '0.5';
}


function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  
  const target = e.target.closest('[data-spot-index]');
  if (target) {
    target.style.borderColor = 'var(--accent)';
    target.style.borderWidth = '2px';
  }
}


function handleDrop(e) {
  e.preventDefault();
  
  const target = e.target.closest('[data-spot-index]');
  if (target) {
    const dropIndex = parseInt(target.dataset.spotIndex);
    
    if (draggedIndex !== dropIndex) {
      const [removed] = selectedDaySpotIds.splice(draggedIndex, 1);
      selectedDaySpotIds.splice(dropIndex, 0, removed);
      renderSelectedSpots();
    }
    
    target.style.borderColor = 'var(--border)';
    target.style.borderWidth = '1px';
  }
  
  draggedIndex = -1;
}


function handleDragEnd(e) {
  e.target.style.opacity = '1';
  
  document.querySelectorAll('[data-spot-index]').forEach(el => {
    el.style.borderColor = 'var(--border)';
    el.style.borderWidth = '1px';
  });
  
  draggedIndex = -1;
}


function clearAllSpots() {
  if (!confirm('确定要清空所有已选景点吗？')) return;
  selectedDaySpotIds = [];
  renderSelectedSpots();
  renderDaySpotList();
}


function removeSpotFromDay(spotId) {
  selectedDaySpotIds = selectedDaySpotIds.filter(id => id !== spotId);
  renderSelectedSpots();
  renderDaySpotList();
}


function moveSpotUp(index) {
  if (index > 0) {
    const temp = selectedDaySpotIds[index];
    selectedDaySpotIds[index] = selectedDaySpotIds[index - 1];
    selectedDaySpotIds[index - 1] = temp;
    renderSelectedSpots();
  }
}


function moveSpotDown(index) {
  if (index < selectedDaySpotIds.length - 1) {
    const temp = selectedDaySpotIds[index];
    selectedDaySpotIds[index] = selectedDaySpotIds[index + 1];
    selectedDaySpotIds[index + 1] = temp;
    renderSelectedSpots();
  }
}


function getSelectedDaySpotIds() {
  return [...selectedDaySpotIds];
}


function updateWeekdayFromDate() {
  const dateInput = $('dayModalDate');
  const weekdayInput = $('dayModalWeekday');
  
  if (dateInput.value) {
    const date = new Date(dateInput.value);
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    weekdayInput.value = weekdays[date.getDay()];
  } else {
    weekdayInput.value = '';
  }
}


function openDayModal(index = null) {
  editingDayIndex = index;
  
  initDaySpotFilters();
  $('dayModalSpotRegion').value = '';
  $('dayModalSpotProvince').value = '';
  $('dayModalSpotCity').value = '';
  $('dayModalSpotCity').disabled = true;
  $('dayModalSpotDistrict').value = '';
  $('dayModalSpotDistrict').disabled = true;
  
  $('dayHotelSearch').value = '';
    selectedDayHotelId = null;
    renderDayHotelList();
    showDayHotelList(false);

  if (index !== null && index >= 0 && getCurrentTripDays()[index]) {
    const day = getCurrentTripDays()[index];
    editingDayId = day.id || null;
    $('dayModalTitle').textContent = '编辑每日行程';
    $('dayModalDay').value = day.day || '';
    
    const calculatedDate = calculateDayDate(day.day);
    const calculatedWeekday = getWeekdayString(calculatedDate);
    $('dayModalDate').value = calculatedDate;
    $('dayModalWeekday').value = calculatedWeekday;
    
    $('dayModalTitleInput').value = day.title || '';
    $('dayModalTheme').value = day.theme || '';
    
    if (day.accommodation?.hotelId) {
      selectedDayHotelId = day.accommodation.hotelId;
    } else if (day.accommodation?.name) {
      const hotels = appData.hotels || [];
      const matchingHotel = hotels.find(h => h.name === day.accommodation.name);
      if (matchingHotel) {
        selectedDayHotelId = matchingHotel.id;
      }
    }
    
    if (selectedDayHotelId) {
      const hotel = appData.hotels?.find(h => h.id === selectedDayHotelId);
      if (hotel) {
        $('selectedHotelName').textContent = hotel.name;
        $('selectedHotelLocation').textContent = hotel.location ? `(${hotel.location})` : '';
        $('selectedHotelBadge').style.display = 'flex';
        $('dayHotelSearch').placeholder = '';
        $('dayHotelSearch').style.paddingLeft = '200px';
        showDayHotelList(false);
      }
    }
    
    $('dayModalTransport').value = day.transport || '';
    $('dayModalNote').value = day.note || '';
    
    selectedDaySpotIds = [...(day.spotIds || [])];
    renderSelectedSpots();
    renderDaySpotList();
    renderDayHotelList();
  } else {
    editingDayId = null;
    const currentDays = getCurrentTripDays();
    const usedDays = currentDays.map(d => d.day);
    
    // 找到第一个最小的空缺数字（从1开始找）
    let newDayNumber = 1;
    while (usedDays.includes(newDayNumber)) {
      newDayNumber++;
    }
    const planDays = calculateTripDays(
      appData.trips[appData.currentTrip].startDate, 
      appData.trips[appData.currentTrip].endDate
    );
    
    // 检查是否超过计划天数
    if (planDays > 0 && newDayNumber > planDays) {
      const confirmMsg = `当前行程计划为 ${planDays} 天（${appData.trips[appData.currentTrip].startDate} 至 ${appData.trips[appData.currentTrip].endDate}），确定要添加第 ${newDayNumber} 天吗？\n\n确定后将自动延长结束日期。`;
      if (!confirm(confirmMsg)) {
        return;
      }
      // 用户确认，自动延长结束日期
      const startDate = new Date(appData.trips[appData.currentTrip].startDate);
      const newEndDate = new Date(startDate);
      newEndDate.setDate(startDate.getDate() + (newDayNumber - 1));
      const newEndDateStr = `${newEndDate.getFullYear()}-${String(newEndDate.getMonth() + 1).padStart(2, '0')}-${String(newEndDate.getDate()).padStart(2, '0')}`;
      appData.trips[appData.currentTrip].endDate = newEndDateStr;
      localStorage.setItem('appData', JSON.stringify(appData));
      // 更新基本信息表单里的结束日期
      $('tripEndDate').value = newEndDateStr;
    }
    
    $('dayModalTitle').textContent = '新增每日行程';
    $('dayModalDay').value = newDayNumber;
    const calculatedDate = calculateDayDate(newDayNumber);
    const calculatedWeekday = getWeekdayString(calculatedDate);
    $('dayModalDate').value = calculatedDate;
    $('dayModalWeekday').value = calculatedWeekday;
    $('dayModalTitleInput').value = '';
    $('dayModalTheme').value = '';
    $('dayModalTransport').value = '';
    $('dayModalNote').value = '';
    $('selectedHotelBadge').style.display = 'none';
    $('selectedHotelName').textContent = '';
    $('selectedHotelLocation').textContent = '';
    $('dayHotelSearch').placeholder = '搜索酒店名称、城市...';
    $('dayHotelSearch').style.paddingLeft = '8px';
    
    selectedDaySpotIds = [];
    selectedDayHotelId = null;
    renderSelectedSpots();
    renderDaySpotList();
    renderDayHotelList();
  }

  $('dayModal').style.display = 'flex';
}


function saveDay() {
  const day = parseInt($('dayModalDay').value);
  if (!day || day < 1) {
    showToast('请输入有效的天数', 'error');
    return;
  }
  
  // 检查天数是否已存在（新增时才检查）
  if (editingDayIndex === null) {
    const currentDays = getCurrentTripDays();
    const existingDay = currentDays.find(d => d.day === day);
    if (existingDay) {
      showToast(`第${day}天行程已存在！`, 'error');
      return;
    }
  }

  let title = $('dayModalTitleInput').value.trim();
  if (!title) {
    title = `第${day}天行程`;
  }

  const spotIds = getSelectedDaySpotIds();
  
  let accommodation = null;
  if (selectedDayHotelId) {
    accommodation = {
      hotelId: selectedDayHotelId
    };
  }

  const dayData = {
    id: editingDayId || 'day_' + Date.now(),
    day: day,
    title: title,
    theme: $('dayModalTheme').value.trim(),
    spotIds: spotIds,
    accommodation: accommodation,
    transport: $('dayModalTransport').value.trim(),
    note: $('dayModalNote').value.trim() || null
  };

  if (editingDayIndex !== null && editingDayIndex >= 0) {
    const days = [...getCurrentTripDays()];
    days[editingDayIndex] = dayData;
    setCurrentTripDays(days);
  } else {
    const days = [...getCurrentTripDays()];
    days.push(dayData);
    setCurrentTripDays(days);
  }

  if (!tempTrip) {
    localStorage.setItem('appData', JSON.stringify(appData));
  }
  $('daysCount').textContent = getCurrentTripDays().length;
  closeDayModal();
  renderDaysList();
  showToast('保存成功！', 'success');
}


function moveDay(index, direction) {
  const days = getCurrentTripDays();
  const newIndex = index + direction;
  
  if (newIndex < 0 || newIndex >= days.length) {
    return;
  }
  
  const sortedDays = [...days].sort((a, b) => a.day - b.day);
  
  const temp = sortedDays[index];
  sortedDays[index] = sortedDays[newIndex];
  sortedDays[newIndex] = temp;
  
  sortedDays.forEach((day, idx) => {
    day.day = idx + 1;
  });
  
  setCurrentTripDays(sortedDays);
  localStorage.setItem('appData', JSON.stringify(appData));
  renderDaysList();
}


function deleteDay(index) {
  if (!confirm('确定要删除这天行程吗？')) return;

  const days = [...getCurrentTripDays()];
  days.splice(index, 1);
  setCurrentTripDays(days);
  
  localStorage.setItem('appData', JSON.stringify(appData));
  $('daysCount').textContent = getCurrentTripDays().length;
  renderDaysList();
  showToast('删除成功！', 'info');
}


function closeDayModal() {
  const dayModal = $('dayModal');
  if (dayModal) {
    dayModal.style.display = 'none';
    editingDayIndex = null;
    editingDayId = null;
  }
}


// 暴露到全局
window.renderTripsList = renderTripsList;
window.viewTrip = viewTrip;
window.selectTrip = selectTrip;
window.confirmDeleteTrip = confirmDeleteTrip;
window.deleteTrip = deleteTrip;
window.getCurrentTripPlatforms = getCurrentTripPlatforms;
window.getCurrentTripReservations = getCurrentTripReservations;
window.getCurrentTripDays = getCurrentTripDays;
window.setCurrentTripDays = setCurrentTripDays;
window.switchTripTab = switchTripTab;
window.renderPlatformsList = renderPlatformsList;
window.renderReservationsList = renderReservationsList;
window.editingPlatformId = editingPlatformId;
window.editingReservationId = editingReservationId;
window.openPlatformModal = openPlatformModal;
window.addUseItem = addUseItem;
window.removeUseItem = removeUseItem;
window.updateRemoveButtons = updateRemoveButtons;
window.closePlatformModal = closePlatformModal;
window.savePlatform = savePlatform;
window.deletePlatform = deletePlatform;
window.getNeedReservationSpotsInTrip = getNeedReservationSpotsInTrip;
window.getSpotTripDay = getSpotTripDay;
window.calculateDueDate = calculateDueDate;
window.updateReservationDueDate = updateReservationDueDate;
window.populateReservationSpotSelect = populateReservationSpotSelect;
window.openReservationModal = openReservationModal;
window.closeReservationModal = closeReservationModal;
window.saveReservation = saveReservation;
window.deleteReservation = deleteReservation;
window.backToTripsList = backToTripsList;
window.editingDayIndex = editingDayIndex;
window.editingDayId = editingDayId;
window.draggedDayIndex = draggedDayIndex;
window.renderDaysList = renderDaysList;
window.bindDayDragEvents = bindDayDragEvents;
window.handleDayDragStart = handleDayDragStart;
window.handleDayDragOver = handleDayDragOver;
window.handleDayDrop = handleDayDrop;
window.handleDayDragEnd = handleDayDragEnd;
window.selectedDaySpotIds = selectedDaySpotIds;
window.selectedDayHotelId = selectedDayHotelId;
window.showDayHotelList = showDayHotelList;
window.filterDayHotels = filterDayHotels;
window.renderDayHotelList = renderDayHotelList;
window.selectDayHotel = selectDayHotel;
window.clearSelectedHotel = clearSelectedHotel;
window.initDaySpotFilters = initDaySpotFilters;
window.filterSpotsByLocation = filterSpotsByLocation;
window.renderDaySpotList = renderDaySpotList;
window.toggleSpotSelection = toggleSpotSelection;
window.updateSpotSelectionVisual = updateSpotSelectionVisual;
window.clearAllSpotSelection = clearAllSpotSelection;
window.renderSelectedSpots = renderSelectedSpots;
window.draggedIndex = draggedIndex;
window.handleDragStart = handleDragStart;
window.handleDragOver = handleDragOver;
window.handleDrop = handleDrop;
window.handleDragEnd = handleDragEnd;
window.clearAllSpots = clearAllSpots;
window.removeSpotFromDay = removeSpotFromDay;
window.moveSpotUp = moveSpotUp;
window.moveSpotDown = moveSpotDown;
window.getSelectedDaySpotIds = getSelectedDaySpotIds;
window.updateWeekdayFromDate = updateWeekdayFromDate;
window.openDayModal = openDayModal;
window.saveDay = saveDay;
window.moveDay = moveDay;
window.deleteDay = deleteDay;
window.closeDayModal = closeDayModal;

})();