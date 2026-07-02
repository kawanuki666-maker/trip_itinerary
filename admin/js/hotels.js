(function() {
// 酒店管理模块

let editingHotelId = null;

// 酒店管理Tab状态

let hotelRegionTab = 'domestic';


function switchHotelRegionTab(tab) {
  hotelRegionTab = tab;
  window.hotelRegionTab = tab;
  document.querySelectorAll('#hotelsSection .trip-tab[data-hotel-region-tab]').forEach(t => {
    t.classList.toggle('active', t.dataset.hotelRegionTab === tab);
  });
  const keyword = $('hotelSearchInput') ? $('hotelSearchInput').value : '';
  renderHotelsList(keyword, tab === 'domestic' ? '国内' : '国外');
}


function renderHotelsList(searchKeyword = '', regionFilter = '') {
  const listEl = $('hotelsList');
  if (!appData.hotels || appData.hotels.length === 0) {
    listEl.innerHTML = '<p style="color: var(--text-dim); text-align: center; padding: 40px;">暂无酒店</p>';
    return;
  }

  let filteredHotels = appData.hotels;

  // 按国内外筛选
  if (regionFilter) {
    const locData = getLocationData();
    if (regionFilter === '国内') {
      filteredHotels = filteredHotels.filter(hotel => {
        const firstPart = (hotel.location || '').split(' - ')[0];
        return locData['国内'] && locData['国内'][firstPart];
      });
    } else if (regionFilter === '国外') {
      filteredHotels = filteredHotels.filter(hotel => {
        const firstPart = (hotel.location || '').split(' - ')[0];
        return locData['国外'] && locData['国外'][firstPart];
      });
    }
  }

  if (searchKeyword) {
    const keyword = searchKeyword.toLowerCase();
    filteredHotels = filteredHotels.filter(hotel => {
      return hotel.name.toLowerCase().includes(keyword) ||
             (hotel.location && hotel.location.toLowerCase().includes(keyword)) ||
             (hotel.address && hotel.address.toLowerCase().includes(keyword));
    });
  }

  if (filteredHotels.length === 0) {
    listEl.innerHTML = '<p style="color: var(--text-dim); text-align: center; padding: 40px;">未找到匹配的酒店</p>';
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

  listEl.innerHTML = filteredHotels.map(hotel => `
    <div style="padding: 16px; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: flex-start;">
      <div style="flex: 1;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
          <h4 style="font-size: 14px; font-weight: 600; color: var(--text); margin: 0;">${highlightKeyword(hotel.name, searchKeyword)}</h4>
        </div>
        <p style="font-size: 12px; color: var(--text-dim); margin: 0 0 4px 0;">${highlightKeyword(hotel.location, searchKeyword)}</p>
        ${hotel.address ? '<p style="font-size: 11px; color: var(--text-dim); margin: 0 0 4px 0;">📍 ' + highlightKeyword(hotel.address, searchKeyword) + '</p>' : ''}
        ${hotel.phone ? '<p style="font-size: 11px; color: var(--text-dim); margin: 0 0 4px 0;">📞 ' + hotel.phone + '</p>' : ''}
        ${hotel.checkInTime || hotel.checkOutTime ? '<p style="font-size: 11px; color: var(--text-dim); margin: 0;">入住 ' + (hotel.checkInTime || '--') + ' / 退房 ' + (hotel.checkOutTime || '--') + '</p>' : ''}
      </div>
      <div style="display: flex; gap: 8px;">
        <button class="btn btn-logout" onclick="openHotelModal('${hotel.id}'); return false;" style="width: auto; padding: 6px 12px; font-size: 11px;">编辑</button>
        <button class="btn btn-logout" onclick="deleteHotel('${hotel.id}'); return false;" style="width: auto; padding: 6px 12px; font-size: 11px; color: #c00; border-color: rgba(204,0,0,0.3);">删除</button>
      </div>
    </div>
  `).join('');
}


let hotelLocationTab = 'domestic';


function switchHotelLocationTab(tab) {
  hotelLocationTab = tab;
  
  document.querySelectorAll('#hotelModal .trip-tab[data-hotel-location-tab]').forEach(t => {
    t.classList.toggle('active', t.dataset.hotelLocationTab === tab);
  });
  
  if (tab === 'domestic') {
    $('hotelLocationDomestic').style.display = 'grid';
    $('hotelLocationInternational').style.display = 'none';
    initHotelLocationDomestic();
  } else {
    $('hotelLocationDomestic').style.display = 'none';
    $('hotelLocationInternational').style.display = 'grid';
    initHotelLocationInternational();
  }
}


function initHotelLocationDomestic() {
  const provinceSelect = $('hotelModalProvince');
  if (!provinceSelect) return;
  
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
  $('hotelModalCity').disabled = true;
  $('hotelModalDistrict').disabled = true;
  $('hotelModalCity').innerHTML = '<option value="">选择城市</option>';
  $('hotelModalDistrict').innerHTML = '<option value="">选择区县</option>';
}


function initHotelLocationInternational() {
  const countrySelect = $('hotelModalCountry');
  const citySelect = $('hotelModalIntlCity');
  if (!countrySelect) return;
  
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


function initHotelLocationDropdowns() {
  switchHotelLocationTab('domestic');
}


function populateHotelCityDropdown() {
  if (hotelLocationTab === 'domestic') {
    const province = $('hotelModalProvince').value;
    const citySelect = $('hotelModalCity');
    const districtSelect = $('hotelModalDistrict');
    
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
    const country = $('hotelModalCountry').value;
    const citySelect = $('hotelModalIntlCity');
    
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


function populateHotelDistrictDropdown() {
  if (hotelLocationTab !== 'domestic') return;
  
  const province = $('hotelModalProvince').value;
  const city = $('hotelModalCity').value;
  const districtSelect = $('hotelModalDistrict');
  
  districtSelect.innerHTML = '<option value="">选择区县</option>';
  districtSelect.disabled = true;
  
  const locData = getLocationData();
  const domestic = locData['国内'] || {};
  
  if (province && city && domestic[province] && domestic[province][city]) {
    districtSelect.disabled = false;
    domestic[province][city].forEach(district => {
      const option = document.createElement('option');
      option.value = district;
      option.textContent = district;
      districtSelect.appendChild(option);
    });
  }
}


function getHotelLocationValue() {
  if (hotelLocationTab === 'domestic') {
    const province = $('hotelModalProvince').value;
    const city = $('hotelModalCity').value;
    const district = $('hotelModalDistrict').value;
    
    if (!province) return '';
    if (!city) return province;
    if (!district) return province + ' - ' + city;
    return province + ' - ' + city + ' - ' + district;
  } else {
    const country = $('hotelModalCountry').value;
    const city = $('hotelModalIntlCity').value;
    
    if (!country) return '';
    if (!city) return country;
    return country + ' - ' + city;
  }
}


function setHotelLocationValue(locationStr) {
  if (!locationStr) return;
  
  const parts = locationStr.split(' - ');
  const firstPart = parts[0] || '';
  
  const locData = getLocationData();
  const isDomestic = !!(locData['国内'] && locData['国内'][firstPart]);
  
  if (isDomestic) {
    switchHotelLocationTab('domestic');
    const province = parts[0] || '';
    const city = parts[1] || '';
    const district = parts[2] || '';
    
    setTimeout(() => {
      $('hotelModalProvince').value = province;
      populateHotelCityDropdown();
      
      setTimeout(() => {
        $('hotelModalCity').value = city;
        populateHotelDistrictDropdown();
        
        setTimeout(() => {
          $('hotelModalDistrict').value = district;
        }, 50);
      }, 50);
    }, 50);
  } else {
    switchHotelLocationTab('international');
    const country = parts[0] || '';
    const city = parts[1] || '';
    
    setTimeout(() => {
      $('hotelModalCountry').value = country;
      populateHotelCityDropdown();
      
      setTimeout(() => {
        $('hotelModalIntlCity').value = city;
      }, 50);
    }, 50);
  }
}


function openHotelModal(hotelId = null) {
  editingHotelId = hotelId;
  
  initHotelLocationDropdowns();
  
  if (hotelId) {
    const hotel = appData.hotels.find(h => h.id === hotelId);
    if (!hotel) return;
    
    $('hotelModalTitle').textContent = '编辑酒店';
    $('hotelModalName').value = hotel.name || '';
    setHotelLocationValue(hotel.location || '');
    $('hotelModalAddress').value = hotel.address || '';
    $('hotelModalPhone').value = hotel.phone || '';
    $('hotelModalCheckIn').value = hotel.checkInTime || '';
    $('hotelModalCheckOut').value = hotel.checkOutTime || '';
    $('hotelModalNotes').value = hotel.notes || '';
  } else {
    $('hotelModalTitle').textContent = '新增酒店';
    $('hotelModalName').value = '';
    $('hotelModalProvince').value = '';
    $('hotelModalCity').value = '';
    $('hotelModalDistrict').value = '';
    $('hotelModalAddress').value = '';
    $('hotelModalPhone').value = '';
    $('hotelModalCheckIn').value = '14:00';
    $('hotelModalCheckOut').value = '12:00';
    $('hotelModalNotes').value = '';
  }
  
  $('hotelModal').style.display = 'flex';
}


function saveHotel() {
  const name = $('hotelModalName').value.trim();
  if (!name) {
    showToast('请输入酒店名称', 'error');
    return;
  }
  
  const hotelData = {
    id: editingHotelId || 'hotel_' + Date.now(),
    name: name,
    location: getHotelLocationValue(),
    address: $('hotelModalAddress').value.trim(),
    phone: $('hotelModalPhone').value.trim(),
    checkInTime: $('hotelModalCheckIn').value.trim(),
    checkOutTime: $('hotelModalCheckOut').value.trim(),
    notes: $('hotelModalNotes').value.trim()
  };
  
  if (editingHotelId) {
    const index = appData.hotels.findIndex(h => h.id === editingHotelId);
    if (index !== -1) {
      appData.hotels[index] = { ...appData.hotels[index], ...hotelData };
    }
  } else {
    if (!appData.hotels) appData.hotels = [];
    appData.hotels.push(hotelData);
  }
  
  localStorage.setItem('appData', JSON.stringify(appData));
  $('hotelsCount').textContent = appData.hotels.length;
  closeHotelModal();
  renderHotelsList('', hotelRegionTab === 'domestic' ? '国内' : '国外');
  showToast('保存成功！', 'success');
}


function deleteHotel(hotelId) {
  if (!confirm('确定要删除这个酒店吗？')) return;

  appData.hotels = appData.hotels.filter(h => h.id !== hotelId);
  localStorage.setItem('appData', JSON.stringify(appData));
  $('hotelsCount').textContent = appData.hotels.length;
  renderHotelsList('', hotelRegionTab === 'domestic' ? '国内' : '国外');
  showToast('删除成功！', 'info');
}


function closeHotelModal() {
  const hotelModal = $('hotelModal');
  if (hotelModal) {
    hotelModal.style.display = 'none';
    editingHotelId = null;
  }
}


// ============================================================
// 地区管理
// ============================================================


// 暴露到全局
window.editingHotelId = editingHotelId;
window.hotelRegionTab = hotelRegionTab;
window.switchHotelRegionTab = switchHotelRegionTab;
window.renderHotelsList = renderHotelsList;
window.hotelLocationTab = hotelLocationTab;
window.switchHotelLocationTab = switchHotelLocationTab;
window.initHotelLocationDomestic = initHotelLocationDomestic;
window.initHotelLocationInternational = initHotelLocationInternational;
window.initHotelLocationDropdowns = initHotelLocationDropdowns;
window.populateHotelCityDropdown = populateHotelCityDropdown;
window.populateHotelDistrictDropdown = populateHotelDistrictDropdown;
window.getHotelLocationValue = getHotelLocationValue;
window.setHotelLocationValue = setHotelLocationValue;
window.openHotelModal = openHotelModal;
window.saveHotel = saveHotel;
window.deleteHotel = deleteHotel;
window.closeHotelModal = closeHotelModal;

})();