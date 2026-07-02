(function() {
// 景点管理模块

let editingSpotId = null;


let spotRegionTab = 'domestic';


function switchSpotRegionTab(tab) {
  spotRegionTab = tab;
  window.spotRegionTab = tab;
  document.querySelectorAll('#spotsSection .trip-tab[data-spot-region-tab]').forEach(t => {
    t.classList.toggle('active', t.dataset.spotRegionTab === tab);
  });
  const keyword = $('spotSearchInput') ? $('spotSearchInput').value : '';
  const reservationOnly = $('spotReservationFilter') ? $('spotReservationFilter').checked : false;
  renderSpotsList(keyword, tab === 'domestic' ? '国内' : '国外', reservationOnly);
}


function renderSpotsList(searchKeyword = '', regionFilter = '', reservationOnly = false) {
  const listEl = $('spotsList');
  if (!appData.spots || appData.spots.length === 0) {
    listEl.innerHTML = '<p style="color: var(--text-dim); text-align: center; padding: 40px;">暂无景点</p>';
    return;
  }

  let filteredSpots = appData.spots;

  if (searchKeyword) {
    const keyword = searchKeyword.toLowerCase();
    filteredSpots = filteredSpots.filter(spot => {
      return spot.name.toLowerCase().includes(keyword) ||
             spot.city.toLowerCase().includes(keyword) ||
             (spot.brief && spot.brief.toLowerCase().includes(keyword));
    });
  }

  if (regionFilter) {
    const locData = getLocationData();
    if (regionFilter === '国内') {
      filteredSpots = filteredSpots.filter(spot => {
        const firstPart = spot.city.split(' - ')[0];
        return locData['国内'] && locData['国内'][firstPart];
      });
    } else if (regionFilter === '国外') {
      filteredSpots = filteredSpots.filter(spot => {
        const firstPart = spot.city.split(' - ')[0];
        return locData['国外'] && locData['国外'][firstPart];
      });
    }
  }

  if (reservationOnly) {
    filteredSpots = filteredSpots.filter(spot => spot.needReservation);
  }

  if (filteredSpots.length === 0) {
    listEl.innerHTML = '<p style="color: var(--text-dim); text-align: center; padding: 40px;">未找到匹配的景点</p>';
    return;
  }

  // 高亮匹配关键词
  const highlightKeyword = (text, keyword) => {
    if (!keyword || !text) return text || '';
    const lowerText = text.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();
    const index = lowerText.indexOf(lowerKeyword);
    if (index === -1) return text;
    const before = text.slice(0, index);
    const match = text.slice(index, index + keyword.length);
    const after = text.slice(index + keyword.length);
    return `${before}<span style="background: rgba(196,168,130,0.3); color: var(--text); padding: 0 2px; border-radius: 2px;">${match}</span>${after}`;
  };

  listEl.innerHTML = filteredSpots.map(spot => `
    <div style="padding: 16px; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: flex-start;">
      <div style="flex: 1;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
          <h4 style="font-size: 14px; font-weight: 600; color: var(--text); margin: 0;">${highlightKeyword(spot.name, searchKeyword)}</h4>
          <span style="font-size: 11px; color: var(--text-dim); background: var(--surface-2); padding: 2px 8px; border-radius: 4px;">${highlightKeyword(spot.city, searchKeyword)}</span>
          ${spot.needReservation ? '<span style="font-size: 11px; color: #c00; background: rgba(204,0,0,0.1); padding: 2px 8px; border-radius: 4px;">需预约</span>' : ''}
        </div>
        <p style="font-size: 12px; color: var(--text-dim); margin: 0 0 8px 0;">${highlightKeyword(spot.brief, searchKeyword)}</p>
        <div style="display: flex; gap: 12px; align-items: center;">
          <span style="font-size: 11px; color: var(--text-dim);">${spot.hours || ''}</span>
          <span style="font-size: 11px; color: var(--text-dim);">${spot.ticket || ''}</span>
        </div>
      </div>
      <div style="display: flex; gap: 8px;">
        <button class="btn btn-logout" onclick="openSpotModal('${spot.id}'); return false;" style="width: auto; padding: 6px 12px; font-size: 11px;">编辑</button>
        <button class="btn btn-logout" onclick="deleteSpot('${spot.id}'); return false;" style="width: auto; padding: 6px 12px; font-size: 11px; color: #c00; border-color: rgba(204,0,0,0.3);">删除</button>
      </div>
    </div>
  `).join('');

  // 不再在这里绑定事件，改用事件委托
}


function openSpotModal(spotId = null) {
  editingSpotId = spotId;
  
  if (spotId) {
    const spot = appData.spots.find(s => s.id === spotId);
    if (!spot) return;
    
    $('spotModalTitle').textContent = '编辑景点';
    $('spotModalName').value = spot.name || '';
    setSpotLocationValue(spot.city || '');
    $('spotModalBrief').value = spot.brief || '';
    
    $('spotModalHours').value = spot.hours || '';
    $('spotModalTicket').value = spot.ticket || '';
    $('spotModalNeedReservation').checked = spot.needReservation || false;
    $('spotModalDescription').value = spot.description || '';
  } else {
    $('spotModalTitle').textContent = '新增景点';
    $('spotModalName').value = '';
    switchSpotLocationTab('domestic');
    $('spotModalBrief').value = '';
    $('spotModalHours').value = '';
    $('spotModalTicket').value = '';
    $('spotModalNeedReservation').checked = false;
    $('spotModalDescription').value = '';
  }
  
  $('spotModal').style.display = 'flex';
}


function saveSpot() {
  const name = $('spotModalName').value.trim();
  if (!name) {
    showToast('请输入景点名称', 'error');
    return;
  }
  
  const spotData = {
    id: editingSpotId || `spot_${Date.now()}`,
    name: name,
    city: getSpotLocationValue(),
    brief: $('spotModalBrief').value.trim(),
    hours: $('spotModalHours').value.trim(),
    ticket: $('spotModalTicket').value.trim(),
    needReservation: $('spotModalNeedReservation').checked,
    description: $('spotModalDescription').value.trim()
  };
  
  if (editingSpotId) {
    const index = appData.spots.findIndex(s => s.id === editingSpotId);
    if (index !== -1) {
      appData.spots[index] = { ...appData.spots[index], ...spotData };
    }
  } else {
    if (!appData.spots) appData.spots = [];
    appData.spots.push(spotData);
  }
  
  localStorage.setItem('appData', JSON.stringify(appData));
  $('spotsCount').textContent = appData.spots.length;
  closeSpotModal();
  renderSpotsList('', spotRegionTab === 'domestic' ? '国内' : '国外', false);
  showToast('保存成功！', 'success');
}


function deleteSpot(spotId) {
  if (!confirm('确定要删除这个景点吗？')) return;

  appData.spots = appData.spots.filter(s => s.id !== spotId);
  localStorage.setItem('appData', JSON.stringify(appData));
  $('spotsCount').textContent = appData.spots.length;
  renderSpotsList('', spotRegionTab === 'domestic' ? '国内' : '国外', false);
  showToast('删除成功！', 'info');
}


function closeSpotModal() {
  $('spotModal').style.display = 'none';
  editingSpotId = null;
}


function populateSpotCityDropdown() {
  const provinceSelect = $('spotModalProvince');
  const citySelect = $('spotModalCity');
  const districtSelect = $('spotModalDistrict');
  
  citySelect.innerHTML = '<option value="">选择城市</option>';
  districtSelect.innerHTML = '<option value="">选择区县</option>';
  citySelect.disabled = true;
  districtSelect.disabled = true;
  
  const selectedProvince = provinceSelect.value;
  if (selectedProvince && (getLocationData()["国内"] || {})[selectedProvince]) {
    citySelect.disabled = false;
    Object.keys((getLocationData()["国内"] || {})[selectedProvince]).forEach(city => {
      const option = document.createElement('option');
      option.value = city;
      option.textContent = city;
      citySelect.appendChild(option);
    });
  }
}


function populateSpotDistrictDropdown() {
  const provinceSelect = $('spotModalProvince');
  const citySelect = $('spotModalCity');
  const districtSelect = $('spotModalDistrict');
  
  districtSelect.innerHTML = '<option value="">选择区县</option>';
  districtSelect.disabled = true;
  
  const selectedProvince = provinceSelect.value;
  const selectedCity = citySelect.value;
  
  if (selectedProvince && selectedCity && (getLocationData()["国内"] || {})[selectedProvince] && (getLocationData()["国内"] || {})[selectedProvince][selectedCity]) {
    districtSelect.disabled = false;
    (getLocationData()["国内"] || {})[selectedProvince][selectedCity].forEach(district => {
      const option = document.createElement('option');
      option.value = district;
      option.textContent = district;
      districtSelect.appendChild(option);
    });
  }
}

// 已被新的地点选择模块取代


let spotLocationTab = 'domestic';


function switchSpotLocationTab(tab) {
  spotLocationTab = tab;
  
  document.querySelectorAll('#spotModal .trip-tab[data-location-tab]').forEach(t => {
    t.classList.toggle('active', t.dataset.locationTab === tab);
  });
  
  if (tab === 'domestic') {
    $('spotLocationDomestic').style.display = 'grid';
    $('spotLocationInternational').style.display = 'none';
    initSpotLocationDomestic();
  } else {
    $('spotLocationDomestic').style.display = 'none';
    $('spotLocationInternational').style.display = 'grid';
    initSpotLocationInternational();
  }
}


function initSpotLocationDomestic() {
  const provinceSelect = $('spotModalProvince');
  const citySelect = $('spotModalCity');
  const districtSelect = $('spotModalDistrict');
  
  const locData = getLocationData();
  const domestic = locData['国内'] || {};
  
  provinceSelect.innerHTML = '<option value="">选择省份</option>';
  getSortedKeys(domestic).forEach(province => {
    const option = document.createElement('option');
    option.value = province;
    option.textContent = province;
    provinceSelect.appendChild(option);
  });
  
  provinceSelect.disabled = false;
  citySelect.disabled = true;
  districtSelect.disabled = true;
  citySelect.innerHTML = '<option value="">选择城市</option>';
  districtSelect.innerHTML = '<option value="">选择区县</option>';
}


function initSpotLocationInternational() {
  const countrySelect = $('spotModalCountry');
  const citySelect = $('spotModalIntlCity');
  
  const locData = getLocationData();
  const intl = locData['国外'] || {};
  
  countrySelect.innerHTML = '<option value="">选择国家</option>';
  getSortedKeys(intl).forEach(country => {
    const option = document.createElement('option');
    option.value = country;
    option.textContent = country;
    countrySelect.appendChild(option);
  });
  
  countrySelect.disabled = false;
  citySelect.disabled = true;
  citySelect.innerHTML = '<option value="">选择城市</option>';
}


function populateSpotCityDropdown() {
  if (spotLocationTab === 'domestic') {
    const province = $('spotModalProvince').value;
    const citySelect = $('spotModalCity');
    const districtSelect = $('spotModalDistrict');
    
    citySelect.innerHTML = '<option value="">选择城市</option>';
    districtSelect.innerHTML = '<option value="">选择区县</option>';
    citySelect.disabled = true;
    districtSelect.disabled = true;
    
    const locData = getLocationData();
    const domestic = locData['国内'] || {};
    
    if (province && domestic[province]) {
      citySelect.disabled = false;
      getSortedKeys(domestic[province]).forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
      });
    }
  } else {
    const country = $('spotModalCountry').value;
    const citySelect = $('spotModalIntlCity');
    
    citySelect.innerHTML = '<option value="">选择城市</option>';
    citySelect.disabled = true;
    
    const locData = getLocationData();
    const intl = locData['国外'] || {};
    
    if (country && intl[country]) {
      citySelect.disabled = false;
      getSortedKeys(intl[country]).forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
      });
    }
  }
}


function populateSpotDistrictDropdown() {
  if (spotLocationTab !== 'domestic') return;
  
  const province = $('spotModalProvince').value;
  const city = $('spotModalCity').value;
  const districtSelect = $('spotModalDistrict');
  
  districtSelect.innerHTML = '<option value="">选择区县</option>';
  districtSelect.disabled = true;
  
  const locData = getLocationData();
  const domestic = locData['国内'] || {};
  
  if (province && city && domestic[province] && domestic[province][city]) {
    districtSelect.disabled = false;
    const districts = domestic[province][city] || [];
    districts.sort().forEach(district => {
      const option = document.createElement('option');
      option.value = district;
      option.textContent = district;
      districtSelect.appendChild(option);
    });
  }
}


function setSpotLocationValue(locationStr) {
  if (!locationStr) {
    switchSpotLocationTab('domestic');
    return;
  }
  
  const parts = locationStr.split(' - ');
  const locData = getLocationData();
  
  if (locData['国内'] && locData['国内'][parts[0]]) {
    spotLocationTab = 'domestic';
    switchSpotLocationTab('domestic');
    
    setTimeout(() => {
      $('spotModalProvince').value = parts[0] || '';
      populateSpotCityDropdown();
      
      setTimeout(() => {
        $('spotModalCity').value = parts[1] || '';
        populateSpotDistrictDropdown();
        
        setTimeout(() => {
          $('spotModalDistrict').value = parts[2] || '';
        }, 20);
      }, 20);
    }, 20);
  } else {
    spotLocationTab = 'international';
    switchSpotLocationTab('international');
    
    setTimeout(() => {
      $('spotModalCountry').value = parts[0] || '';
      populateSpotCityDropdown();
      
      setTimeout(() => {
        $('spotModalIntlCity').value = parts[1] || '';
      }, 20);
    }, 20);
  }
}


function getSpotLocationValue() {
  if (spotLocationTab === 'domestic') {
    const province = $('spotModalProvince').value;
    const city = $('spotModalCity').value;
    const district = $('spotModalDistrict').value;
    if (!province || !city) return '';
    return district ? province + ' - ' + city + ' - ' + district : province + ' - ' + city;
  } else {
    const country = $('spotModalCountry').value;
    const city = $('spotModalIntlCity').value;
    if (!country || !city) return '';
    return country + ' - ' + city;
  }
}


// 暴露到全局
window.editingSpotId = editingSpotId;
window.spotRegionTab = spotRegionTab;
window.switchSpotRegionTab = switchSpotRegionTab;
window.renderSpotsList = renderSpotsList;
window.openSpotModal = openSpotModal;
window.saveSpot = saveSpot;
window.deleteSpot = deleteSpot;
window.closeSpotModal = closeSpotModal;
window.populateSpotCityDropdown = populateSpotCityDropdown;
window.populateSpotDistrictDropdown = populateSpotDistrictDropdown;
window.spotLocationTab = spotLocationTab;
window.switchSpotLocationTab = switchSpotLocationTab;
window.initSpotLocationDomestic = initSpotLocationDomestic;
window.initSpotLocationInternational = initSpotLocationInternational;
window.populateSpotCityDropdown = populateSpotCityDropdown;
window.populateSpotDistrictDropdown = populateSpotDistrictDropdown;
window.setSpotLocationValue = setSpotLocationValue;
window.getSpotLocationValue = getSpotLocationValue;

})();