(function() {
// 区域管理模块

let currentLocationTab = 'domestic';

let selectedLocationLevel1 = null;

let selectedLocationLevel2 = null;


function switchLocationTab(tab) {
  currentLocationTab = tab;
  selectedLocationLevel1 = null;
  selectedLocationLevel2 = null;
  
  document.querySelectorAll('#locationsSection .trip-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tab);
  });
  
  if (tab === 'domestic') {
    $('locationLevel1Label').textContent = '省份';
    $('locationLevel2Label').textContent = '城市/区县';
    $('addLevel3Btn').style.display = 'inline-block';
  } else {
    $('locationLevel1Label').textContent = '国家';
    $('locationLevel2Label').textContent = '城市';
    $('addLevel3Btn').style.display = 'none';
  }
  
  renderLocationLevel1List();
  renderLocationLevel2List();
}


function renderLocationLevel1List() {
  const locData = getLocationData();
  const list = locData[currentLocationTab === 'domestic' ? '国内' : '国外'] || {};
  const items = getSortedKeys(list);
  
  const container = $('locationLevel1List');
  if (!container) return;
  
  if (items.length === 0) {
    container.innerHTML = '<p style="color: var(--text-dim); text-align: center; padding: 20px; font-size: 12px;">暂无数据</p>';
    return;
  }
  
  container.innerHTML = items.map(item => {
    const safeItem = item.replace(/'/g, "\'");
    return `
    <div class="location-item ${selectedLocationLevel1 === item ? 'active' : ''}" 
         onclick="selectLocationLevel1('${safeItem}')"
         style="padding: 10px 12px; cursor: pointer; border-radius: 6px; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center; font-size: 13px;">
      <span style="color: var(--text);">${item}</span>
      <div style="display: flex; gap: 4px; opacity: 0; transition: opacity 0.2s;" class="location-item-actions">
        <button onclick="event.stopPropagation(); renameLocationLevel1('${safeItem}')" style="background: none; border: none; color: var(--text-dim); cursor: pointer; font-size: 12px; padding: 2px 4px;">编辑</button>
        <button onclick="event.stopPropagation(); deleteLocationLevel1('${safeItem}')" style="background: none; border: none; color: #c00; cursor: pointer; font-size: 12px; padding: 2px 4px;">删除</button>
      </div>
    </div>
  `}).join('');
  
  container.querySelectorAll('.location-item').forEach(el => {
    el.addEventListener('mouseenter', () => {
      const actions = el.querySelector('.location-item-actions');
      if (actions) actions.style.opacity = '1';
    });
    el.addEventListener('mouseleave', () => {
      const actions = el.querySelector('.location-item-actions');
      if (actions) actions.style.opacity = '0';
    });
  });
}


function selectLocationLevel1(name) {
  selectedLocationLevel1 = name;
  selectedLocationLevel2 = null;
  renderLocationLevel1List();
  renderLocationLevel2List();
}


function renderLocationLevel2List() {
  const container = $('locationLevel2List');
  if (!container) return;
  
  const locData = getLocationData();
  const tabKey = currentLocationTab === 'domestic' ? '国内' : '国外';
  const level1Data = locData[tabKey] || {};
  
  if (!selectedLocationLevel1) {
    container.innerHTML = '<p style="color: var(--text-dim); text-align: center; padding: 40px; font-size: 12px;">请先选择' + (currentLocationTab === 'domestic' ? '省份' : '国家') + '</p>';
    return;
  }
  
  const cities = level1Data[selectedLocationLevel1] || {};
  const cityList = getSortedKeys(cities);
  
  if (cityList.length === 0) {
    container.innerHTML = '<p style="color: var(--text-dim); text-align: center; padding: 40px; font-size: 12px;">暂无城市数据</p>';
    return;
  }
  
  let html = '';
  cityList.forEach(city => {
    const safeCity = city.replace(/'/g, "\'");
    const districts = Array.isArray(cities[city]) ? cities[city] : [];
    const isExpanded = selectedLocationLevel2 === city;
    const isDomestic = currentLocationTab === 'domestic';
    
    if (isDomestic) {
      html += `
      <div style="margin-bottom: 8px;">
        <div class="location-city-item" 
             onclick="toggleLocationCity('${safeCity}')"
             style="padding: 10px 12px; background: var(--surface-2); border-radius: 6px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: 500;">
          <span style="color: var(--text); display: flex; align-items: center; gap: 6px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="transition: transform 0.2s; transform: rotate(${isExpanded ? '90deg' : '0deg'}); color: var(--text-dim);">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
            ${city}
          </span>
          <div style="display: flex; gap: 4px;" class="city-item-actions">
            <button onclick="event.stopPropagation(); renameLocationLevel2('${safeCity}')" style="background: none; border: none; color: var(--text-dim); cursor: pointer; font-size: 12px; padding: 2px 4px;">编辑</button>
            <button onclick="event.stopPropagation(); deleteLocationLevel2('${safeCity}')" style="background: none; border: none; color: #c00; cursor: pointer; font-size: 12px; padding: 2px 4px;">删除</button>
          </div>
        </div>
    `;
      
      if (isExpanded && districts.length > 0) {
        html += '<div style="padding-left: 24px; padding-top: 4px;">';
        districts.sort().forEach(district => {
          const safeDistrict = district.replace(/'/g, "\'");
          html += `
          <div style="padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 12px; border-bottom: 1px solid var(--border-light);">
            <span style="color: var(--text-mid);">${district}</span>
            <div style="display: flex; gap: 4px;">
              <button onclick="renameLocationLevel3('${safeCity}', '${safeDistrict}')" style="background: none; border: none; color: var(--text-dim); cursor: pointer; font-size: 11px;">编辑</button>
              <button onclick="deleteLocationLevel3('${safeCity}', '${safeDistrict}')" style="background: none; border: none; color: #c00; cursor: pointer; font-size: 11px;">删除</button>
            </div>
          </div>
        `;
        });
        html += '</div>';
      }
      
      html += '</div>';
    } else {
      html += `
      <div style="margin-bottom: 8px;">
        <div style="padding: 10px 12px; background: var(--surface-2); border-radius: 6px; display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: 500;">
          <span style="color: var(--text);">${city}</span>
          <div style="display: flex; gap: 4px;" class="city-item-actions">
            <button onclick="renameLocationLevel2('${safeCity}')" style="background: none; border: none; color: var(--text-dim); cursor: pointer; font-size: 12px; padding: 2px 4px;">编辑</button>
            <button onclick="deleteLocationLevel2('${safeCity}')" style="background: none; border: none; color: #c00; cursor: pointer; font-size: 12px; padding: 2px 4px;">删除</button>
          </div>
        </div>
      </div>
    `;
    }
  });
  
  container.innerHTML = html;
}


function toggleLocationCity(city) {
  if (selectedLocationLevel2 === city) {
    selectedLocationLevel2 = null;
  } else {
    selectedLocationLevel2 = city;
  }
  renderLocationLevel2List();
}


function addLocationLevel1() {
  const label = currentLocationTab === 'domestic' ? '省份' : '国家';
  const name = prompt('请输入' + label + '名称：');
  if (!name || !name.trim()) return;
  
  const locData = getLocationData();
  const tabKey = currentLocationTab === 'domestic' ? '国内' : '国外';
  
  if (!locData[tabKey]) locData[tabKey] = {};
  if (locData[tabKey][name.trim()]) {
    showToast(label + '已存在', 'error');
    return;
  }
  
  locData[tabKey][name.trim()] = {};
  setLocationData(locData);
  selectedLocationLevel1 = name.trim();
  renderLocationLevel1List();
  renderLocationLevel2List();
  showToast(label + '添加成功', 'success');
}


function renameLocationLevel1(oldName) {
  const label = currentLocationTab === 'domestic' ? '省份' : '国家';
  const newName = prompt('请输入新的' + label + '名称：', oldName);
  if (!newName || !newName.trim() || newName.trim() === oldName) return;
  
  const locData = getLocationData();
  const tabKey = currentLocationTab === 'domestic' ? '国内' : '国外';
  
  if (locData[tabKey][newName.trim()]) {
    showToast(label + '已存在', 'error');
    return;
  }
  
  locData[tabKey][newName.trim()] = locData[tabKey][oldName];
  delete locData[tabKey][oldName];
  
  updateLocationInSpotsAndHotels(tabKey, oldName, null, null, newName.trim(), null, null);
  
  setLocationData(locData);
  
  if (selectedLocationLevel1 === oldName) {
    selectedLocationLevel1 = newName.trim();
  }
  
  renderLocationLevel1List();
  renderLocationLevel2List();
  renderSpotsList('', spotRegionTab === 'domestic' ? '国内' : '国外', false);
  renderHotelsList('', hotelRegionTab === 'domestic' ? '国内' : '国外');
  showToast(label + '已重命名', 'success');
}


function deleteLocationLevel1(name) {
  const label = currentLocationTab === 'domestic' ? '省份' : '国家';
  if (!confirm('确定要删除"' + name + '"吗？下属所有城市和区县都将被删除。')) return;

  const locData = getLocationData();
  const tabKey = currentLocationTab === 'domestic' ? '国内' : '国外';

  const spotCount = countSpotsInLocation(tabKey, name);
  const hotelCount = countHotelsInLocation(tabKey, name);
  if (spotCount > 0 || hotelCount > 0) {
    if (!confirm('当前有 ' + spotCount + ' 个景点和 ' + hotelCount + ' 个酒店使用该地区，删除后这些数据的位置信息将不完整。确定继续吗？')) return;
  }

  delete locData[tabKey][name];
  setLocationData(locData);

  if (selectedLocationLevel1 === name) {
    selectedLocationLevel1 = null;
    selectedLocationLevel2 = null;
  }

  renderLocationLevel1List();
  renderLocationLevel2List();
  renderSpotsList('', spotRegionTab === 'domestic' ? '国内' : '国外', false);
  renderHotelsList('', hotelRegionTab === 'domestic' ? '国内' : '国外');
  showToast(label + '已删除', 'success');
}


function addLocationLevel2() {
  if (!selectedLocationLevel1) {
    showToast('请先选择' + (currentLocationTab === 'domestic' ? '省份' : '国家'), 'error');
    return;
  }
  
  const label = '城市';
  const name = prompt('请输入' + label + '名称：');
  if (!name || !name.trim()) return;
  
  const locData = getLocationData();
  const tabKey = currentLocationTab === 'domestic' ? '国内' : '国外';
  
  if (!locData[tabKey][selectedLocationLevel1]) {
    locData[tabKey][selectedLocationLevel1] = {};
  }
  
  if (locData[tabKey][selectedLocationLevel1][name.trim()]) {
    showToast(label + '已存在', 'error');
    return;
  }
  
  locData[tabKey][selectedLocationLevel1][name.trim()] = [];
  setLocationData(locData);
  selectedLocationLevel2 = name.trim();
  renderLocationLevel2List();
  showToast(label + '添加成功', 'success');
}


function renameLocationLevel2(oldName) {
  if (!selectedLocationLevel1) return;
  
  const newName = prompt('请输入新的城市名称：', oldName);
  if (!newName || !newName.trim() || newName.trim() === oldName) return;
  
  const locData = getLocationData();
  const tabKey = currentLocationTab === 'domestic' ? '国内' : '国外';
  
  if (locData[tabKey][selectedLocationLevel1][newName.trim()]) {
    showToast('城市已存在', 'error');
    return;
  }
  
  locData[tabKey][selectedLocationLevel1][newName.trim()] = locData[tabKey][selectedLocationLevel1][oldName];
  delete locData[tabKey][selectedLocationLevel1][oldName];
  
  updateLocationInSpotsAndHotels(tabKey, selectedLocationLevel1, oldName, null, selectedLocationLevel1, newName.trim(), null);
  
  setLocationData(locData);
  
  if (selectedLocationLevel2 === oldName) {
    selectedLocationLevel2 = newName.trim();
  }
  
  renderLocationLevel2List();
  renderSpotsList('', spotRegionTab === 'domestic' ? '国内' : '国外', false);
  renderHotelsList('', hotelRegionTab === 'domestic' ? '国内' : '国外');
  showToast('城市已重命名', 'success');
}


function deleteLocationLevel2(name) {
  if (!selectedLocationLevel1) return;

  if (!confirm('确定要删除"' + name + '"吗？下属所有区县都将被删除。')) return;

  const locData = getLocationData();
  const tabKey = currentLocationTab === 'domestic' ? '国内' : '国外';

  const spotCount = countSpotsInLocation(tabKey, selectedLocationLevel1, name);
  const hotelCount = countHotelsInLocation(tabKey, selectedLocationLevel1, name);
  if (spotCount > 0 || hotelCount > 0) {
    if (!confirm('当前有 ' + spotCount + ' 个景点和 ' + hotelCount + ' 个酒店使用该城市，删除后这些数据的位置信息将不完整。确定继续吗？')) return;
  }

  delete locData[tabKey][selectedLocationLevel1][name];
  setLocationData(locData);

  if (selectedLocationLevel2 === name) {
    selectedLocationLevel2 = null;
  }

  renderLocationLevel2List();
  renderSpotsList('', spotRegionTab === 'domestic' ? '国内' : '国外', false);
  renderHotelsList('', hotelRegionTab === 'domestic' ? '国内' : '国外');
  showToast('城市已删除', 'success');
}


function addLocationLevel3() {
  if (currentLocationTab !== 'domestic') return;
  if (!selectedLocationLevel1) {
    showToast('请先选择省份', 'error');
    return;
  }
  if (!selectedLocationLevel2) {
    showToast('请先选择城市', 'error');
    return;
  }
  
  const name = prompt('请输入区县名称：');
  if (!name || !name.trim()) return;
  
  const locData = getLocationData();
  const districts = locData['国内'][selectedLocationLevel1][selectedLocationLevel2] || [];
  
  if (districts.includes(name.trim())) {
    showToast('区县已存在', 'error');
    return;
  }
  
  districts.push(name.trim());
  districts.sort();
  locData['国内'][selectedLocationLevel1][selectedLocationLevel2] = districts;
  setLocationData(locData);
  renderLocationLevel2List();
  showToast('区县添加成功', 'success');
}


function renameLocationLevel3(city, oldDistrict) {
  const newDistrict = prompt('请输入新的区县名称：', oldDistrict);
  if (!newDistrict || !newDistrict.trim() || newDistrict.trim() === oldDistrict) return;
  
  const locData = getLocationData();
  const districts = locData['国内'][selectedLocationLevel1][city] || [];
  const idx = districts.indexOf(oldDistrict);
  
  if (idx === -1) return;
  if (districts.includes(newDistrict.trim())) {
    showToast('区县已存在', 'error');
    return;
  }
  
  districts[idx] = newDistrict.trim();
  districts.sort();
  
  updateLocationInSpotsAndHotels('国内', selectedLocationLevel1, city, oldDistrict, selectedLocationLevel1, city, newDistrict.trim());

  setLocationData(locData);
  renderLocationLevel2List();
  renderSpotsList('', spotRegionTab === 'domestic' ? '国内' : '国外', false);
  renderHotelsList('', hotelRegionTab === 'domestic' ? '国内' : '国外');
  showToast('区县已重命名', 'success');
}


function deleteLocationLevel3(city, district) {
  if (!confirm('确定要删除"' + district + '"吗？')) return;

  const locData = getLocationData();
  const districts = locData['国内'][selectedLocationLevel1][city] || [];
  const idx = districts.indexOf(district);

  if (idx === -1) return;

  const spotCount = countSpotsInLocation('国内', selectedLocationLevel1, city, district);
  const hotelCount = countHotelsInLocation('国内', selectedLocationLevel1, city, district);
  if (spotCount > 0 || hotelCount > 0) {
    if (!confirm('当前有 ' + spotCount + ' 个景点和 ' + hotelCount + ' 个酒店使用该区划，删除后这些数据的位置信息将不完整。确定继续吗？')) return;
  }

  districts.splice(idx, 1);
  setLocationData(locData);
  renderLocationLevel2List();
  renderSpotsList('', spotRegionTab === 'domestic' ? '国内' : '国外', false);
  renderHotelsList('', hotelRegionTab === 'domestic' ? '国内' : '国外');
  showToast('区县已删除', 'success');
}


function countSpotsInLocation(tabKey, level1, level2 = null, level3 = null) {
  if (!appData.spots) return 0;
  
  return appData.spots.filter(spot => {
    if (!spot.city) return false;
    const parts = spot.city.split(' - ');
    
    if (tabKey === '国内') {
      if (parts.length < 2) return false;
      if (parts[0] !== level1) return false;
      if (level2 && parts[1] !== level2) return false;
      if (level3 && parts[2] !== level3) return false;
      return true;
    } else {
      if (parts[0] !== level1) return false;
      if (level2 && parts[1] !== level2) return false;
      return true;
    }
  }).length;
}


function countHotelsInLocation(tabKey, level1, level2 = null, level3 = null) {
  if (!appData.hotels) return 0;
  
  return appData.hotels.filter(hotel => {
    if (!hotel.location) return false;
    const parts = hotel.location.split(' - ');
    
    if (tabKey === '国内') {
      if (parts.length < 2) return false;
      if (parts[0] !== level1) return false;
      if (level2 && parts[1] !== level2) return false;
      if (level3 && parts[2] !== level3) return false;
      return true;
    } else {
      if (parts[0] !== level1) return false;
      if (level2 && parts[1] !== level2) return false;
      return true;
    }
  }).length;
}


function updateLocationInSpotsAndHotels(tabKey, oldL1, oldL2, oldL3, newL1, newL2, newL3) {
  if (!appData.spots) appData.spots = [];
  if (!appData.hotels) appData.hotels = [];
  
  const updateCityField = (locationStr) => {
    if (!locationStr) return locationStr;
    const parts = locationStr.split(' - ');
    
    if (tabKey === '国内') {
      if (parts[0] !== oldL1) return locationStr;
      if (oldL2 && parts[1] !== oldL2) return locationStr;
      if (oldL3 && parts[2] !== oldL3) return locationStr;
      
      if (newL1) parts[0] = newL1;
      if (newL2 && oldL2) parts[1] = newL2;
      if (newL3 && oldL3) parts[2] = newL3;
    } else {
      if (parts[0] !== oldL1) return locationStr;
      if (oldL2 && parts[1] !== oldL2) return locationStr;
      
      if (newL1) parts[0] = newL1;
      if (newL2 && oldL2) parts[1] = newL2;
    }
    
    return parts.join(' - ');
  };
  
  appData.spots.forEach(spot => {
    spot.city = updateCityField(spot.city);
  });
  
  appData.hotels.forEach(hotel => {
    hotel.location = updateCityField(hotel.location);
  });
  
  localStorage.setItem('appData', JSON.stringify(appData));
}

// ============================================================
// 景点编辑 - 国内/国外 Tab
// ============================================================


// 暴露到全局
window.currentLocationTab = currentLocationTab;
window.selectedLocationLevel1 = selectedLocationLevel1;
window.selectedLocationLevel2 = selectedLocationLevel2;
window.switchLocationTab = switchLocationTab;
window.renderLocationLevel1List = renderLocationLevel1List;
window.selectLocationLevel1 = selectLocationLevel1;
window.renderLocationLevel2List = renderLocationLevel2List;
window.toggleLocationCity = toggleLocationCity;
window.addLocationLevel1 = addLocationLevel1;
window.renameLocationLevel1 = renameLocationLevel1;
window.deleteLocationLevel1 = deleteLocationLevel1;
window.addLocationLevel2 = addLocationLevel2;
window.renameLocationLevel2 = renameLocationLevel2;
window.deleteLocationLevel2 = deleteLocationLevel2;
window.addLocationLevel3 = addLocationLevel3;
window.renameLocationLevel3 = renameLocationLevel3;
window.deleteLocationLevel3 = deleteLocationLevel3;
window.countSpotsInLocation = countSpotsInLocation;
window.countHotelsInLocation = countHotelsInLocation;
window.updateLocationInSpotsAndHotels = updateLocationInSpotsAndHotels;

})();