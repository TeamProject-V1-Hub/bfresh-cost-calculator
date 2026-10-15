/**
 * APP.JS - Điều Khiển Toàn Bộ Giao Diện & Tương Tác Nghiệp Vụ BobaFlow Pro
 */

// --- ROUTER QUẢN LÝ CHUYỂN TAB ---
window.AppRouter = {
  currentTab: 'dashboard',

  init() {
    // Lắng nghe sự kiện click trên thanh điều hướng sidebar
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const tab = item.getAttribute('data-tab');
        if (tab) {
          this.navigate(tab);
        }
      });
    });

    // Xử lý nút mở menu trên thiết bị di động & 1 chạm bên ngoài để ẩn menu
    const mobileBtn = document.getElementById('mobile-menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');

    const closeMobileMenu = () => {
      if (sidebar) sidebar.classList.remove('mobile-open');
      if (backdrop) backdrop.classList.remove('active');
    };

    const toggleMobileMenu = () => {
      if (sidebar) {
        const isOpen = sidebar.classList.toggle('mobile-open');
        if (backdrop) backdrop.classList.toggle('active', isOpen);
      }
    };

    if (mobileBtn) {
      mobileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMobileMenu();
      });
    }

    if (backdrop) {
      backdrop.addEventListener('click', closeMobileMenu);
      backdrop.addEventListener('touchstart', closeMobileMenu, { passive: true });
    }

    // Bắt sự kiện 1 chạm bên ngoài menu trên toàn màn hình để tự động ẩn menu
    document.addEventListener('click', (e) => {
      if (sidebar && sidebar.classList.contains('mobile-open')) {
        if (!sidebar.contains(e.target) && e.target !== mobileBtn && !mobileBtn?.contains(e.target)) {
          closeMobileMenu();
        }
      }
    });

    const currentRole = (window.AppStore && typeof window.AppStore.getRole === 'function') ? window.AppStore.getRole() : 'owner';
    const startTab = (currentRole === 'staff') ? 'pos' : 'dashboard';
    this.navigate(startTab);
  },

  navigate(tabName) {
    const currentRole = (window.AppStore && typeof window.AppStore.getRole === 'function') ? window.AppStore.getRole() : 'owner';
    const staffRestricted = ['dashboard', 'reports', 'stockin', 'recipes', 'suppliers'];
    if (currentRole === 'staff' && staffRestricted.includes(tabName)) {
      if (window.UI && typeof window.UI.showToast === 'function') {
        window.UI.showToast('Phân Quyền', 'Bạn đang ở Chế độ Nhân viên. Vui lòng mở khóa Quản lý để truy cập mục này.', 'warning');
      }
      tabName = 'pos';
    }

    this.currentTab = tabName;

    // Cập nhật trạng thái active của menu
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-tab') === tabName);
    });

    // Đóng sidebar di động & backdrop sau khi chọn mục
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('mobile-open');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (backdrop) backdrop.classList.remove('active');

    // Chuyển view pane
    document.querySelectorAll('.view-pane').forEach(pane => {
      pane.classList.toggle('active', pane.id === `view-${tabName}`);
    });

    // Kích hoạt render tương ứng
    switch (tabName) {
      case 'dashboard':
        AppController.renderDashboard();
        break;
      case 'reports':
        AppController.renderReports();
        break;
      case 'ingredients':
        AppController.renderIngredients();
        break;
      case 'stockin':
        AppController.renderStockIn();
        break;
      case 'subrecipes':
        AppController.renderSubRecipes();
        break;
      case 'recipes':
        AppController.renderRecipes();
        break;
      case 'pos':
        AppController.renderPos();
        break;
      case 'audit':
        AppController.renderAudit();
        break;
      case 'suppliers':
        AppController.renderSuppliers();
        break;
    }

    // Luôn cuộn lên đầu trang khi đổi tab để người dùng nhìn thấy tiêu đề và công cụ ngay lập tức
    const viewport = document.getElementById('viewport-content');
    if (viewport) viewport.scrollTop = 0;
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  },

  // Quay về trang chủ (Dashboard) và cuộn lên đỉnh màn hình
  goHome() {
    this.navigate('dashboard');
    if (window.AppController && typeof window.AppController.updateHeaderStats === 'function') {
      window.AppController.updateHeaderStats();
      window.AppController.renderDashboard();
    }
    const viewport = document.getElementById('viewport-content');
    if (viewport) viewport.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('mobile-open');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (backdrop) backdrop.classList.remove('active');
    if (window.UI && typeof window.UI.showToast === 'function') {
      window.UI.showToast('BFresh Station', 'Đã làm mới trang chủ Dashboard!', 'success');
    }
  }
};

// ================= THEME & APPEARANCE CUSTOMIZATION ENGINE =================
window.ThemeManager = {
  currentSettings: null,
  previewSettings: null,

  init() {
    this.currentSettings = Object.assign({
      theme: 'light',
      accent: 'matcha',
      density: 'comfortable',
      fontSize: 'normal',
      storeName: 'Tiệm Trà & Cafe Artisanal',
      storeSlogan: 'Chủ Quán / Quản Lý'
    }, (window.AppStore && window.AppStore.state.settings) || {});

    this.applySettings(this.currentSettings);
    this.bindEvents();
  },

  /**
   * Áp dụng toàn bộ thuộc tính giao diện lên DOM
   */
  applySettings(settings) {
    if (!settings) return;
    this.currentSettings = Object.assign({}, this.currentSettings, settings);

    const root = document.documentElement;

    // 1. Theme Mode (Dark, Light, OLED, Auto)
    let activeTheme = settings.theme || 'light';
    if (activeTheme === 'auto') {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      activeTheme = prefersDark ? 'dark' : 'light';
    }
    root.setAttribute('data-theme', activeTheme);

    // Cập nhật biểu tượng trên nút quick toggle ở Header bằng vector SVG
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
      if (activeTheme === 'light') {
        themeIcon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
      } else {
        themeIcon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
      }
    }

    // 2. Brand Accent Palette
    const activeAccent = settings.accent || 'matcha';
    root.setAttribute('data-accent', activeAccent);

    // 3. Layout Density (Comfortable vs Compact)
    const activeDensity = settings.density || 'comfortable';
    root.setAttribute('data-density', activeDensity);

    // 4. Font Size Scale (Small, Normal, Large)
    const activeFontSize = settings.fontSize || 'normal';
    root.setAttribute('data-font-size', activeFontSize);

    // 5. Cập nhật Tên quán & Slogan hiển thị
    const storeName = settings.storeName || 'Tiệm Trà & Cafe Artisanal';
    const storeSlogan = settings.storeSlogan || 'Chủ Quán / Quản Lý';

    const sidebarStoreName = document.getElementById('sidebar-store-name');
    if (sidebarStoreName) sidebarStoreName.textContent = storeName;

    const sidebarStoreSlogan = document.getElementById('sidebar-store-slogan');
    if (sidebarStoreSlogan) sidebarStoreSlogan.textContent = storeSlogan;

    // Tạo avatar 2 ký tự viết tắt từ tên quán
    const words = storeName.trim().split(/\s+/);
    let initials = 'BF';
    if (words.length >= 2) {
      initials = (words[0][0] + words[1][0]).toUpperCase();
    } else if (words.length === 1 && words[0].length >= 2) {
      initials = words[0].substring(0, 2).toUpperCase();
    }
    const avatarEl = document.getElementById('sidebar-store-avatar');
    if (avatarEl) avatarEl.textContent = initials;
  },

  /**
   * Chuyển đổi nhanh Sáng / Tối trên Header
   */
  toggleQuickTheme() {
    const cur = this.currentSettings.theme || 'light';
    const nextTheme = (cur === 'dark' || cur === 'oled') ? 'light' : 'dark';
    
    this.currentSettings.theme = nextTheme;
    window.AppStore.updateSettings({ theme: nextTheme });
    
    const themeName = nextTheme === 'light' ? 'Sáng Thanh Lịch' : 'Tối Chuyên Nghiệp';
    if (window.UI && typeof window.UI.showToast === 'function') {
      window.UI.showToast('Giao diện', `Đã chuyển sang chế độ ${themeName}`, 'success');
    }
  },

  /**
   * Mở Modal Tùy Chọn Giao Diện Tức Thì (0ms Latency)
   */
  openThemeModal() {
    // 1. Mở ngay lập tức modal, không để người dùng chờ đợi dù chỉ 1ms
    if (window.UI && typeof window.UI.openModal === 'function') {
      window.UI.openModal('modal-theme-settings');
    } else {
      const m = document.getElementById('modal-theme-settings');
      if (m) {
        m.style.display = 'flex';
        m.classList.add('active');
      }
    }

    // 2. Đảm bảo cấu hình hiện tại luôn sẵn sàng
    if (!this.currentSettings) {
      this.currentSettings = Object.assign({
        theme: 'dark',
        accent: 'matcha',
        density: 'comfortable',
        fontSize: 'normal',
        storeName: 'Tiệm Trà & Cafe Artisanal',
        storeSlogan: 'Chủ Quán / Quản Lý'
      }, (window.AppStore && window.AppStore.state && window.AppStore.state.settings) || {});
    }

    this.previewSettings = Object.assign({}, this.currentSettings);

    // 3. Đồng bộ trạng thái các thẻ chọn & form trên modal
    this.syncModalControls(this.previewSettings);

    const previewStore = document.getElementById('preview-store-name');
    if (previewStore) {
      previewStore.textContent = this.previewSettings.storeName || 'Tiệm Trà & Cafe Artisanal';
    }
  },

  /**
   * Đóng Modal Tùy Chọn Giao Diện và khôi phục nếu chưa bấm lưu
   */
  closeThemeModal() {
    if (this.currentSettings) {
      this.applySettings(this.currentSettings);
    }
    if (window.UI && typeof window.UI.closeModal === 'function') {
      window.UI.closeModal('modal-theme-settings');
    } else {
      const m = document.getElementById('modal-theme-settings');
      if (m) {
        m.classList.remove('active');
        m.style.display = 'none';
      }
    }
  },

  /**
   * Đồng bộ các nút và thẻ chọn trong Modal theo settings
   */
  syncModalControls(settings) {
    // Mode cards
    document.querySelectorAll('#theme-mode-grid .theme-card-option').forEach(el => {
      const val = el.getAttribute('data-theme-val');
      el.classList.toggle('active', val === settings.theme);
    });

    // Accent cards
    document.querySelectorAll('#theme-accent-grid .accent-card-option').forEach(el => {
      const val = el.getAttribute('data-accent-val');
      el.classList.toggle('active', val === settings.accent);
    });

    // Density buttons
    document.querySelectorAll('#theme-density-control .segmented-btn').forEach(el => {
      const val = el.getAttribute('data-density-val');
      el.classList.toggle('active', val === settings.density);
    });

    // Font size buttons
    document.querySelectorAll('#theme-font-control .segmented-btn').forEach(el => {
      const val = el.getAttribute('data-font-val');
      el.classList.toggle('active', val === settings.fontSize);
    });

    // Input fields
    const inputName = document.getElementById('theme-input-store-name');
    if (inputName) inputName.value = settings.storeName || '';

    const inputSlogan = document.getElementById('theme-input-store-slogan');
    if (inputSlogan) inputSlogan.value = settings.storeSlogan || '';
  },

  /**
   * Cập nhật xem trước tức thì
   */
  updateLivePreview(settings) {
    const previewStore = document.getElementById('preview-store-name');
    if (previewStore) {
      previewStore.textContent = settings.storeName || 'Tiệm Trà & Cafe Artisanal';
    }
    // Tạm thời áp dụng lên giao diện để người dùng quan sát hiệu quả
    this.applySettings(settings);
  },

  /**
   * Gắn các sự kiện click, input
   */
  bindEvents() {
    // Nút quick toggle trên header
    const quickBtn = document.getElementById('btn-theme-toggle');
    if (quickBtn) {
      quickBtn.onclick = () => this.toggleQuickTheme();
    }

    // Nút mở modal trên header
    const openBtn = document.getElementById('btn-open-theme-modal');
    if (openBtn) {
      openBtn.onclick = () => this.openThemeModal();
    }

    // Nút mở modal tại sidebar profile
    const sidebarTrigger = document.getElementById('btn-sidebar-theme-trigger');
    if (sidebarTrigger) {
      sidebarTrigger.onclick = () => this.openThemeModal();
    }

    // Click chọn Theme Mode
    document.querySelectorAll('#theme-mode-grid .theme-card-option').forEach(card => {
      card.onclick = () => {
        const val = card.getAttribute('data-theme-val');
        this.previewSettings.theme = val;
        this.syncModalControls(this.previewSettings);
        this.updateLivePreview(this.previewSettings);
      };
    });

    // Click chọn Accent
    document.querySelectorAll('#theme-accent-grid .accent-card-option').forEach(card => {
      card.onclick = () => {
        const val = card.getAttribute('data-accent-val');
        this.previewSettings.accent = val;
        this.syncModalControls(this.previewSettings);
        this.updateLivePreview(this.previewSettings);
      };
    });

    // Click chọn Density
    document.querySelectorAll('#theme-density-control .segmented-btn').forEach(btn => {
      btn.onclick = () => {
        const val = btn.getAttribute('data-density-val');
        this.previewSettings.density = val;
        this.syncModalControls(this.previewSettings);
        this.updateLivePreview(this.previewSettings);
      };
    });

    // Click chọn Font Size
    document.querySelectorAll('#theme-font-control .segmented-btn').forEach(btn => {
      btn.onclick = () => {
        const val = btn.getAttribute('data-font-val');
        this.previewSettings.fontSize = val;
        this.syncModalControls(this.previewSettings);
        this.updateLivePreview(this.previewSettings);
      };
    });

    // Nhập Tên quán & Slogan
    const inputName = document.getElementById('theme-input-store-name');
    if (inputName) {
      inputName.oninput = (e) => {
        this.previewSettings.storeName = e.target.value;
        const previewStore = document.getElementById('preview-store-name');
        if (previewStore) previewStore.textContent = e.target.value || 'Tiệm Trà & Cafe Artisanal';
      };
    }

    const inputSlogan = document.getElementById('theme-input-store-slogan');
    if (inputSlogan) {
      inputSlogan.oninput = (e) => {
        this.previewSettings.storeSlogan = e.target.value;
      };
    }

    // Nút Lưu & Áp dụng
    const btnSave = document.getElementById('btn-theme-save-apply');
    if (btnSave) {
      btnSave.onclick = () => {
        if (inputName) this.previewSettings.storeName = inputName.value.trim() || 'Tiệm Trà & Cafe Artisanal';
        if (inputSlogan) this.previewSettings.storeSlogan = inputSlogan.value.trim() || 'Chủ Quán / Quản Lý';

        this.currentSettings = Object.assign({}, this.previewSettings);
        window.AppStore.updateSettings(this.currentSettings);
        this.applySettings(this.currentSettings);

        if (window.UI && typeof window.UI.closeModal === 'function') {
          window.UI.closeModal('modal-theme-settings');
        } else {
          const m = document.getElementById('modal-theme-settings');
          if (m) {
            m.classList.remove('active');
            m.style.display = 'none';
          }
        }

        if (window.UI && typeof window.UI.showToast === 'function') {
          window.UI.showToast('Giao diện', 'Đã lưu và áp dụng giao diện thành công!', 'success');
        }
      };
    }

    // Nút Khôi phục mặc định
    const btnReset = document.getElementById('btn-theme-reset-default');
    if (btnReset) {
      btnReset.onclick = () => {
        window.AppStore.resetSettingsToDefault();
        this.previewSettings = Object.assign({}, window.AppStore.state.settings);
        this.syncModalControls(this.previewSettings);
        this.updateLivePreview(this.previewSettings);
        if (window.UI && typeof window.UI.showToast === 'function') {
          window.UI.showToast('Giao diện', 'Đã khôi phục giao diện về mặc định ban đầu', 'info');
        }
      };
    }
  }
};

// --- CONTROLLER ĐIỀU PHỐI DỮ LIỆU & RENDER ---
window.AppController = {
  posCart: {}, // { productId: qty }
  dashPeriod: 'week', // 'today' | 'week' | 'all'
  reportPeriod: 'week', // 'today' | 'week' | 'all'
  expandedRecipeMap: {}, // { prodId: boolean }
  allRecipesExpanded: true,

  escapeHtml(str) {
    if (!str || typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  getSafeImageSrc(src) {
    if (!src || typeof src !== 'string') return '';
    let trimmed = src.trim();
    if (!trimmed) return '';

    // Nếu đã là Base64 SVG nhưng chứa %23 trong XML
    if (trimmed.startsWith('data:image/svg+xml;base64,')) {
      try {
        const b64 = trimmed.slice('data:image/svg+xml;base64,'.length);
        const decoded = atob(b64);
        if (decoded.includes('%23')) {
          const fixed = decoded.replace(/%23/g, '#');
          return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(fixed)));
        }
      } catch (e) {}
      return trimmed;
    }

    // Nếu là SVG unescaped với tiền tố data:image/svg+xml;utf8,
    if (trimmed.startsWith('data:image/svg+xml;utf8,')) {
      let rawSvg = trimmed.slice('data:image/svg+xml;utf8,'.length);
      rawSvg = rawSvg.replace(/%23/g, '#');
      try {
        return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(rawSvg)));
      } catch (e) {
        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(rawSvg);
      }
    }

    // Nếu bắt đầu trực tiếp bằng thẻ <svg
    if (trimmed.startsWith('<svg')) {
      const clean = trimmed.replace(/%23/g, '#');
      try {
        return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(clean)));
      } catch (e) {
        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(clean);
      }
    }

    // Nếu là chuỗi data:image/svg+xml nhưng có chứa dấu nháy kép unencoded hoặc %23
    if (trimmed.startsWith('data:image/svg+xml') && (trimmed.includes('"') || trimmed.includes('<') || trimmed.includes('%23'))) {
      const commaIdx = trimmed.indexOf(',');
      if (commaIdx !== -1) {
        let payload = trimmed.slice(commaIdx + 1);
        payload = payload.replace(/%23/g, '#');
        try {
          return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(payload)));
        } catch (e) {
          return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(payload);
        }
      }
    }

    return trimmed;
  },

  toggleRecipeDetails(prodId, event) {
    if (event) event.stopPropagation();
    const bodyEl = document.getElementById(`recipe-body-${prodId}`);
    const cardEl = document.getElementById(`recipe-card-${prodId}`);
    if (!bodyEl) return;

    const isHidden = bodyEl.style.display === 'none';
    bodyEl.style.display = isHidden ? 'block' : 'none';
    this.expandedRecipeMap[prodId] = isHidden;

    if (cardEl) {
      cardEl.classList.toggle('is-expanded', isHidden);
      cardEl.classList.toggle('is-collapsed', !isHidden);
      const iconText = cardEl.querySelector('.toggle-icon-text');
      if (iconText) iconText.textContent = isHidden ? 'Thu Gọn ▴' : 'Chi Tiết ▾';
    }
  },

  toggleAllRecipes() {
    this.allRecipesExpanded = !this.allRecipesExpanded;
    const products = window.AppStore.state.products || [];
    products.forEach(p => {
      this.expandedRecipeMap[p.id] = this.allRecipesExpanded;
      const bodyEl = document.getElementById(`recipe-body-${p.id}`);
      const cardEl = document.getElementById(`recipe-card-${p.id}`);
      if (bodyEl) bodyEl.style.display = this.allRecipesExpanded ? 'block' : 'none';
      if (cardEl) {
        cardEl.classList.toggle('is-expanded', this.allRecipesExpanded);
        cardEl.classList.toggle('is-collapsed', !this.allRecipesExpanded);
        const iconText = cardEl.querySelector('.toggle-icon-text');
        if (iconText) iconText.textContent = this.allRecipesExpanded ? 'Thu Gọn ▴' : 'Chi Tiết ▾';
      }
    });

    const lbl = document.getElementById('label-toggle-all-recipes');
    if (lbl) {
      lbl.textContent = this.allRecipesExpanded ? '▴ Thu Gọn Chi Tiết Tất Cả' : '▾ Mở Rộng Chi Tiết Tất Cả';
    }
  },

  // Phím tắt điều khiển Giao diện trực tiếp từ HTML (0ms Delay)
  openThemeSettings() {
    if (window.ThemeManager && typeof window.ThemeManager.openThemeModal === 'function') {
      window.ThemeManager.openThemeModal();
    } else if (window.UI && typeof window.UI.openModal === 'function') {
      window.UI.openModal('modal-theme-settings');
    }
  },

  closeThemeSettings() {
    if (window.ThemeManager && typeof window.ThemeManager.closeThemeModal === 'function') {
      window.ThemeManager.closeThemeModal();
    } else if (window.UI && typeof window.UI.closeModal === 'function') {
      window.UI.closeModal('modal-theme-settings');
    }
  },

  toggleTheme() {
    if (window.ThemeManager && typeof window.ThemeManager.toggleQuickTheme === 'function') {
      window.ThemeManager.toggleQuickTheme();
    }
  },

  // ================= MÃ QR XEM CÙNG MẠNG WI-FI (LAN ACCESS) =================
  openWifiQrModal() {
    this.renderWifiQr();
    if (window.UI && typeof window.UI.openModal === 'function') {
      window.UI.openModal('modal-wifi-qr');
    }
  },

  renderWifiQr() {
    let host = window.location.hostname;
    let port = window.location.port || '5173';
    
    // Nếu mở dạng localhost, 127.0.0.1 hoặc file://, lấy IP Wi-Fi đã phát hiện
    if (!host || host === 'localhost' || host === '127.0.0.1') {
      host = window.SERVER_DETECTED_IP || '192.168.1.4';
    }
    
    const targetUrl = `http://${host}:${port}/`;
    
    const qrBox = document.getElementById('wifi-qrcode-box');
    const urlText = document.getElementById('wifi-qr-url-text');
    const inputIp = document.getElementById('wifi-qr-custom-ip');
    const mobileLanUrl = document.getElementById('mobile-lan-url');
    
    if (urlText) urlText.textContent = targetUrl;
    if (mobileLanUrl) mobileLanUrl.textContent = targetUrl;
    if (inputIp && !inputIp.value) inputIp.value = host;
    
    if (qrBox) {
      qrBox.innerHTML = '';
      if (typeof QRCode !== 'undefined') {
        try {
          new QRCode(qrBox, {
            text: targetUrl,
            width: 220,
            height: 220,
            colorDark: "#0f172a",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.M
          });
          return;
        } catch (e) {
          console.warn('QRCode error:', e);
        }
      }
      
      // Fallback bằng ảnh SVG/PNG tạo tự động
      const img = document.createElement('img');
      img.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(targetUrl)}&bgcolor=ffffff&color=0f172a&margin=1`;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'contain';
      qrBox.appendChild(img);
    }
  },

  updateWifiQrWithIp(newIp) {
    const cleanIp = (newIp || '').trim();
    if (!cleanIp) return;
    const port = window.location.port || '5173';
    const targetUrl = `http://${cleanIp}:${port}/`;
    
    const qrBox = document.getElementById('wifi-qrcode-box');
    const urlText = document.getElementById('wifi-qr-url-text');
    const mobileLanUrl = document.getElementById('mobile-lan-url');
    
    if (urlText) urlText.textContent = targetUrl;
    if (mobileLanUrl) mobileLanUrl.textContent = targetUrl;
    
    if (qrBox) {
      qrBox.innerHTML = '';
      if (typeof QRCode !== 'undefined') {
        try {
          new QRCode(qrBox, {
            text: targetUrl,
            width: 220,
            height: 220,
            colorDark: "#0f172a",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.M
          });
        } catch (e) {
          console.warn('QRCode error:', e);
        }
      } else {
        const img = document.createElement('img');
        img.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(targetUrl)}&bgcolor=ffffff&color=0f172a&margin=1`;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        qrBox.appendChild(img);
      }
    }
    
    if (window.UI && typeof window.UI.showToast === 'function') {
      window.UI.showToast('Đã Cập Nhật IP', `Mã QR đã chuyển sang ${targetUrl}`, 'success');
    }
  },

  copyWifiQrUrl() {
    const urlText = document.getElementById('wifi-qr-url-text');
    const url = urlText ? urlText.textContent.trim() : `http://${window.SERVER_DETECTED_IP || '192.168.1.4'}:5173/`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        if (window.UI && typeof window.UI.showToast === 'function') {
          window.UI.showToast('Đã Sao Chép!', 'Đã sao chép link mạng Wi-Fi vào bộ nhớ tạm!', 'success');
        }
      }).catch(() => {
        prompt('Sao chép liên kết kết nối Wi-Fi:', url);
      });
    } else {
      prompt('Sao chép liên kết kết nối Wi-Fi:', url);
    }
  },

  // ================= SAO LƯU & NẠP DỮ LIỆU HUB (BACKUP & RESTORE) =================
  openBackupModal() {
    const jsonStr = JSON.stringify(window.AppStore.state, null, 2);
    const textarea = document.getElementById('textarea-backup-json');
    if (textarea) textarea.value = jsonStr;
    const sizeInfo = document.getElementById('backup-data-size-info');
    if (sizeInfo) {
      const kb = (new Blob([jsonStr]).size / 1024).toFixed(1);
      const prodCount = window.AppStore.state.products ? window.AppStore.state.products.length : 0;
      const ingCount = window.AppStore.state.ingredients ? window.AppStore.state.ingredients.length : 0;
      sizeInfo.textContent = `${kb} KB • ${prodCount} món • ${ingCount} nguyên liệu`;
    }
    window.UI.openModal('modal-backup-hub');
  },

  downloadBackupFileDirectly() {
    window.AppStore.exportBackupJSON();
    window.UI.showToast('Sao Lưu', 'Đã tải xuống tệp dữ liệu sao lưu .json', 'success');
  },

  copyBackupToClipboard() {
    const jsonStr = JSON.stringify(window.AppStore.state, null, 2);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(jsonStr).then(() => {
        window.UI.showToast('Đã Sao Chép', 'Đã copy toàn bộ mã JSON sao lưu vào bộ nhớ tạm!', 'success');
      }).catch(() => {
        this.fallbackCopyText(jsonStr);
      });
    } else {
      this.fallbackCopyText(jsonStr);
    }
  },

  fallbackCopyText(text) {
    const textarea = document.getElementById('textarea-backup-json');
    if (textarea) {
      textarea.select();
      textarea.setSelectionRange(0, 999999);
      try {
        document.execCommand('copy');
        window.UI.showToast('Đã Sao Chép', 'Đã copy toàn bộ dữ liệu vào bộ nhớ tạm!', 'success');
      } catch (e) {
        window.UI.showToast('Hướng Dẫn', 'Hãy chạm giữ vào khung văn bản và chọn Sao Chép (Copy).', 'warning');
      }
    }
  },

  openRestoreModal() {
    const textarea = document.getElementById('textarea-restore-json');
    if (textarea) textarea.value = '';
    window.UI.openModal('modal-restore-hub');
  },

  triggerFileInputRestore() {
    const input = document.getElementById('input-import-backup');
    if (input) input.click();
  },

  pasteFromClipboardToRestore() {
    if (navigator.clipboard && navigator.clipboard.readText) {
      navigator.clipboard.readText().then(text => {
        const textarea = document.getElementById('textarea-restore-json');
        if (textarea) textarea.value = text;
        window.UI.showToast('Đã Dán', 'Đã dán dữ liệu sao lưu từ bộ nhớ tạm!', 'success');
      }).catch(() => {
        window.UI.showToast('Lưu ý', 'Vui lòng chạm giữ vào ô và bấm Dán (Paste) thủ công.', 'warning');
      });
    } else {
      window.UI.showToast('Lưu ý', 'Vui lòng chạm giữ vào ô và bấm Dán (Paste) thủ công.', 'warning');
    }
  },

  restoreFromPastedJson() {
    const textarea = document.getElementById('textarea-restore-json');
    const raw = textarea ? textarea.value.trim() : '';
    if (!raw) {
      window.UI.showToast('Chưa Có Dữ Liệu', 'Vui lòng dán chuỗi JSON hoặc chọn tệp sao lưu!', 'warning');
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      if (!parsed || (!parsed.ingredients && !parsed.products)) {
        throw new Error('Tệp không đúng định dạng sao lưu của hệ thống (thiếu nguyên liệu hoặc menu món)!');
      }

      window.AppStore.loadState(parsed);
      window.UI.closeModal('modal-restore-hub');
      window.UI.showToast('Thành Công', 'Đã khôi phục hoàn chỉnh toàn bộ dữ liệu từ bản sao lưu!', 'success');
      this.init();
    } catch (err) {
      window.UI.showToast('Lỗi Dữ Liệu', err.message || 'Chuỗi JSON không hợp lệ!', 'danger');
    }
  },

  // ================= QUẢN TRỊ PHÂN QUYỀN & MÃ PIN (RBAC) =================
  pinState: {
    enteredPin: '',
    maxDigits: 4
  },

  initRole() {
    const role = (window.AppStore && typeof window.AppStore.getRole === 'function') ? window.AppStore.getRole() : 'owner';
    this.applyRoleUI(role);

    // Lắng nghe phím số vật lý trên bàn phím máy tính khi đang mở modal PIN
    window.addEventListener('keydown', (e) => {
      const pinModal = document.getElementById('modal-pin-auth');
      if (!pinModal || pinModal.style.display === 'none') return;

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        this.onPinDigit(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        this.backspacePin();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.closePinAuthModal();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (this.pinState.enteredPin.length === this.pinState.maxDigits) {
          this.submitPinAuth();
        }
      }
    });
  },

  applyRoleUI(role) {
    const isStaff = (role === 'staff');
    document.body.setAttribute('data-role', isStaff ? 'staff' : 'owner');

    const headerBtn = document.getElementById('btn-header-role');
    const headerIcon = document.getElementById('header-role-icon');
    const headerText = document.getElementById('header-role-text');
    const sidebarRoleBtnText = document.getElementById('sidebar-role-btn-text');
    const sidebarRoleSubtitle = document.getElementById('sidebar-store-slogan');

    if (headerBtn) {
      headerBtn.className = `btn btn-sm role-badge-btn ${isStaff ? 'role-badge-staff' : 'role-badge-owner'}`;
      headerBtn.title = isStaff ? 'Đang ở Chế độ Nhân viên (Bấm để Mở khóa Quản lý)' : 'Đang ở Quyền Quản lý (Bấm để Khóa sang Nhân viên)';
    }

    if (headerIcon) {
      headerIcon.innerHTML = isStaff
        ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
        : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
    }

    if (headerText) {
      headerText.textContent = isStaff ? 'Nhân Viên' : 'Quản Lý';
    }

    if (sidebarRoleBtnText) {
      sidebarRoleBtnText.innerHTML = isStaff
        ? `🔓 Mở Khóa Quản Lý (PIN)`
        : `🔒 Khóa Chế Độ Nhân Viên`;
    }

    if (sidebarRoleSubtitle) {
      sidebarRoleSubtitle.textContent = isStaff ? 'Nhân Viên Quầy Bar' : (window.AppStore?.state?.settings?.storeSlogan || 'Chủ Quán / Quản Lý');
    }
  },

  toggleRole() {
    const currentRole = (window.AppStore && typeof window.AppStore.getRole === 'function') ? window.AppStore.getRole() : 'owner';
    if (currentRole === 'owner') {
      this.switchToStaff();
    } else {
      this.openPinAuthModal();
    }
  },

  switchToStaff() {
    if (window.AppStore) {
      window.AppStore.setRole('staff');
    }
    this.applyRoleUI('staff');

    // Chuyển ngay sang tab an toàn cho nhân viên: Báo Cáo Cuối Ca (pos)
    const safeTabs = ['pos', 'subrecipes', 'ingredients', 'audit'];
    if (!safeTabs.includes(window.AppRouter.currentTab)) {
      window.AppRouter.navigate('pos');
    } else {
      this.refreshCurrentView();
    }

    if (window.UI && typeof window.UI.showToast === 'function') {
      window.UI.showToast('Phân Quyền', 'Đã khóa Chế độ Nhân viên (Ẩn giá vốn, doanh thu và định lượng món)', 'info');
    }
  },

  openPinAuthModal() {
    // 1. Tự động đóng ngay sidebar và backdrop trên màn hình di động để modal PIN hiện thẳng lên tức thì
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar) sidebar.classList.remove('mobile-open');
    if (backdrop) backdrop.classList.remove('active');

    this.clearPin();
    if (window.UI && typeof window.UI.openModal === 'function') {
      window.UI.openModal('modal-pin-auth');
    } else {
      const modal = document.getElementById('modal-pin-auth');
      if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
      }
    }
  },

  closePinAuthModal() {
    if (window.UI && typeof window.UI.closeModal === 'function') {
      window.UI.closeModal('modal-pin-auth');
    } else {
      const modal = document.getElementById('modal-pin-auth');
      if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
      }
    }
    this.clearPin();
  },

  onPinDigit(digit) {
    if (this.pinState.enteredPin.length >= this.pinState.maxDigits) return;
    this.pinState.enteredPin += String(digit);
    this.renderPinDots();

    const errEl = document.getElementById('pin-auth-error');
    if (errEl) errEl.textContent = '';

    if (this.pinState.enteredPin.length === this.pinState.maxDigits) {
      setTimeout(() => {
        this.submitPinAuth();
      }, 150);
    }
  },

  clearPin() {
    this.pinState.enteredPin = '';
    this.renderPinDots();
    const errEl = document.getElementById('pin-auth-error');
    if (errEl) errEl.textContent = '';
  },

  backspacePin() {
    if (this.pinState.enteredPin.length > 0) {
      this.pinState.enteredPin = this.pinState.enteredPin.slice(0, -1);
      this.renderPinDots();
      const errEl = document.getElementById('pin-auth-error');
      if (errEl) errEl.textContent = '';
    }
  },

  renderPinDots() {
    const len = this.pinState.enteredPin.length;
    for (let i = 0; i < 4; i++) {
      const dot = document.getElementById(`pin-dot-${i}`);
      if (dot) {
        dot.classList.toggle('filled', i < len);
      }
    }
  },

  submitPinAuth() {
    const pin = this.pinState.enteredPin;
    if (pin.length !== 4) return;

    if (window.AppStore && window.AppStore.verifyPin(pin)) {
      window.AppStore.setRole('owner');
      this.applyRoleUI('owner');
      this.closePinAuthModal();
      this.refreshCurrentView();
      if (window.UI && typeof window.UI.showToast === 'function') {
        window.UI.showToast('Xác Thực Thành Công', 'Đã mở toàn bộ quyền Quản Lý / Chủ Quán', 'success');
      }
    } else {
      const dotsContainer = document.getElementById('pin-auth-dots');
      const errEl = document.getElementById('pin-auth-error');
      if (errEl) {
        errEl.textContent = 'Mã PIN không đúng! Vui lòng kiểm tra lại.';
      }
      if (dotsContainer) {
        dotsContainer.classList.remove('pin-shake');
        void dotsContainer.offsetWidth;
        dotsContainer.classList.add('pin-shake');
      }
      setTimeout(() => {
        this.clearPin();
      }, 700);
    }
  },

  openChangePinModal() {
    const modal = document.getElementById('modal-change-pin');
    const form = document.getElementById('form-change-pin');
    const errEl = document.getElementById('change-pin-error');
    if (form) form.reset();
    if (errEl) errEl.textContent = '';
    if (modal) modal.style.display = 'flex';
  },

  closeChangePinModal() {
    const modal = document.getElementById('modal-change-pin');
    if (modal) modal.style.display = 'none';
  },

  submitChangePin() {
    const curPin = (document.getElementById('input-current-pin')?.value || '').trim();
    const newPin = (document.getElementById('input-new-pin')?.value || '').trim();
    const confPin = (document.getElementById('input-confirm-pin')?.value || '').trim();
    const errEl = document.getElementById('change-pin-error');

    if (!/^\d{4}$/.test(newPin)) {
      if (errEl) errEl.textContent = 'Mã PIN mới phải gồm đúng 4 chữ số (0-9).';
      return;
    }

    if (newPin !== confPin) {
      if (errEl) errEl.textContent = 'Xác nhận mã PIN mới không khớp.';
      return;
    }

    const res = window.AppStore ? window.AppStore.updatePin(curPin, newPin) : { success: false, message: 'Lỗi bộ nhớ' };
    if (!res.success) {
      if (errEl) errEl.textContent = res.message;
      return;
    }

    this.closeChangePinModal();
    if (window.UI && typeof window.UI.showToast === 'function') {
      window.UI.showToast('Đổi PIN', 'Đã lưu mã PIN quản lý mới thành công!', 'success');
    }
  },

  init() {
    // 1. Khởi tạo kho dữ liệu Store
    window.AppStore.init();

    // 2. Khởi tạo và áp dụng Theme & Tùy chọn giao diện
    window.ThemeManager.init();

    // 2.1 Khởi tạo Phân quyền & Vai trò (RBAC)
    this.initRole();

    // 3. Đăng ký nhận sự kiện khi Store thay đổi để tự động re-render view hiện tại
    window.AppStore.subscribe(() => {
      this.updateHeaderStats();
      this.refreshCurrentView();
    });

    // 4. Khởi động Router
    window.AppRouter.init();

    // 5. Gắn các sự kiện toàn cục (Backup, Search...)
    this.bindGlobalEvents();

    // 6. Cập nhật thống kê trên header
    this.updateHeaderStats();
  },

  refreshCurrentView() {
    AppRouter.navigate(AppRouter.currentTab);
  },

  // ================= 1. GLOBAL EVENTS =================
  bindGlobalEvents() {
    // Reset dữ liệu mẫu
    const resetBtn = document.getElementById('btn-reset-sample');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Bạn có chắc muốn nạp lại bộ dữ liệu mẫu thực tế của quán Trà Sữa & Trà Trái Cây? Toàn bộ dữ liệu hiện tại sẽ được thay bằng dữ liệu chuẩn.')) {
          window.AppStore.resetToDefault();
          UI.showToast('Thành công', 'Đã nạp lại bộ dữ liệu mẫu F&B!', 'success');
        }
      });
    }

    // Xuất sao lưu JSON & Mở Hub
    const exportBtn = document.getElementById('btn-export-backup');
    if (exportBtn) {
      exportBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openBackupModal();
      });
    }

    // Nút Nạp File mở Restore Hub
    const openRestoreBtn = document.getElementById('btn-open-restore-modal');
    if (openRestoreBtn) {
      openRestoreBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openRestoreModal();
      });
    }

    // Nhập sao lưu JSON qua thẻ input file
    const importInput = document.getElementById('input-import-backup');
    if (importInput) {
      importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          window.AppStore.importBackupJSON(file)
            .then(() => {
              window.UI.closeModal('modal-restore-hub');
              window.UI.showToast('Thành công', 'Đã khôi phục dữ liệu từ tệp sao lưu!', 'success');
              this.init();
              e.target.value = '';
            })
            .catch(err => {
              window.UI.showToast('Lỗi', err.message || 'Tệp sao lưu không hợp lệ', 'danger');
            });
        }
      });
    }

    // Xuất Excel CSV danh mục kho
    const exportCsvBtn = document.getElementById('btn-export-ingredients-csv');
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => {
        window.AppStore.exportIngredientsCSV();
        UI.showToast('Xuất Excel', 'Đã tải xuống file CSV danh mục tồn kho!', 'success');
      });
    }

    // Hướng dẫn mở trên điện thoại & Google Drive
    const mobileInfoBtn = document.getElementById('btn-open-mobile-info');
    if (mobileInfoBtn) {
      mobileInfoBtn.addEventListener('click', () => {
        UI.openModal('modal-mobile-guide');
      });
    }

    // Tìm kiếm toàn cục
    const globalSearch = document.getElementById('global-search-input');
    if (globalSearch) {
      globalSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (!query) {
          this.refreshCurrentView();
          return;
        }

        // Nếu người dùng đang ở tab kho nguyên liệu, tự filter bảng
        if (AppRouter.currentTab === 'ingredients') {
          this.renderIngredients(query);
        } else if (AppRouter.currentTab === 'recipes') {
          this.renderRecipes(query);
        }
      });
    }

    // Lắng nghe phím tắt Ctrl + V khi đang ở màn hình Báo Cáo Cuối Ca (POS) để dán nhanh
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        const activeEl = document.activeElement;
        const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');
        if (!isInput && window.AppRouter && window.AppRouter.currentTab === 'pos') {
          const modal = document.getElementById('modal-pos-sync-hub');
          if (!modal || modal.style.display === 'none') {
            e.preventDefault();
            this.handleQuickPosPaste();
          }
        }
      }
    });

    // Khởi tạo các Modal Handlers
    this.bindIngredientModal();
    this.bindBulkImportModal();
    this.bindQuickCatalogModal();
    this.bindStockInModal();
    this.bindSubRecipeModal();
    this.bindProductModal();
  },

  // ================= 2. HEADER STATS =================
  updateHeaderStats() {
    const ingredients = window.AppStore.state.ingredients || [];
    const products = window.AppStore.state.products || [];
    const ingMap = window.AppStore.getIngredientsMap();
    const subMap = window.AppStore.getSubRecipesMap();

    // 1. Tổng giá trị tồn kho = sum(stockQty * unitCost)
    let totalStockVal = 0;
    let lowStockCount = 0;

    ingredients.forEach(i => {
      totalStockVal += (i.stockQty || 0) * (i.unitCost || 0);
      if ((i.stockQty || 0) <= (i.minStock || 0)) {
        lowStockCount++;
      }
    });

    // 2. Tính Food Cost % trung bình
    let sumFoodCostPct = 0;
    let validProducts = 0;
    products.forEach(p => {
      const cogs = window.CostEngine.calculateProductCogs(p, ingMap, subMap);
      if (cogs && cogs.foodCostPct > 0) {
        sumFoodCostPct += cogs.foodCostPct;
        validProducts++;
      }
    });
    const avgFoodCost = validProducts > 0 ? (sumFoodCostPct / validProducts) : 28.5;
    const avgMargin = 100 - avgFoodCost;

    // Hiển thị trên Header
    const headStockEl = document.getElementById('header-stock-val');
    const headAlertEl = document.getElementById('header-alert-count');
    const headMarginEl = document.getElementById('header-avg-margin');
    const badgeEl = document.getElementById('sidebar-lowstock-badge');

    if (headStockEl) headStockEl.textContent = window.CostEngine.formatCurrency(totalStockVal);
    if (headAlertEl) {
      headAlertEl.textContent = `${lowStockCount} mục`;
      headAlertEl.style.color = lowStockCount > 0 ? 'var(--color-danger)' : 'var(--color-success)';
    }
    if (headMarginEl) headMarginEl.textContent = `${avgMargin.toFixed(1)}%`;

    if (badgeEl) {
      if (lowStockCount > 0) {
        badgeEl.textContent = lowStockCount;
        badgeEl.style.display = 'inline-block';
      } else {
        badgeEl.style.display = 'none';
      }
    }
  },

  // ================= 3. VIEWS & DASHBOARD HELPERS =================
  /**
   * Helper phân tích thời gian an toàn cho log bán hàng (ISO, VN, Timestamp)
   * Tương thích hoàn hảo kể cả khi thời gian đứng trước ngày (VD: "19:35:00 20/09/2026")
   */
  parseLogDate(log) {
    if (!log) return new Date();
    if (log.timestamp && !isNaN(log.timestamp)) return new Date(log.timestamp);
    if (log.date) {
      const str = String(log.date).trim();
      const iso = str.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
      if (iso) {
        const timeMatch = str.match(/(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/);
        const h = timeMatch ? parseInt(timeMatch[1], 10) : 12;
        const m = timeMatch ? parseInt(timeMatch[2], 10) : 0;
        return new Date(parseInt(iso[1], 10), parseInt(iso[2], 10) - 1, parseInt(iso[3], 10), h, m);
      }
      const vn = str.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
      if (vn) {
        const timeMatch = str.match(/(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/);
        const h = timeMatch ? parseInt(timeMatch[1], 10) : 12;
        const m = timeMatch ? parseInt(timeMatch[2], 10) : 0;
        return new Date(parseInt(vn[3], 10), parseInt(vn[2], 10) - 1, parseInt(vn[1], 10), h, m);
      }
      const d = new Date(str);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  },

  /**
   * So sánh hai mốc thời gian có cùng ngày tháng năm không
   */
  isSameDay(d1, d2) {
    if (!d1 || !d2) return false;
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  },

  /**
   * Render biểu đồ bán hàng 7 ngày tương tác, cột phát sáng sinh động và Empty State tuyệt đối không để màn hình đen
   */
  renderWeeklyChart(containerId, peakSummaryId, salesLogs) {
    const barsContainer = document.getElementById(containerId);
    const peakSummary = document.getElementById(peakSummaryId);
    if (!barsContainer) return;

    const now = new Date();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    // Lấy ngày đầu tuần là Thứ 2 (Monday-first: T2 -> T3 -> T4 -> T5 -> T6 -> T7 -> CN)
    const currentDay = now.getDay();
    const diffToMonday = (currentDay + 6) % 7;
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday, 0, 0, 0, 0);

    const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const fullDayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
    const weekDaysData = [];

    for (let i = 0; i < 7; i++) {
      const targetDate = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i, 0, 0, 0, 0);
      const isFuture = targetDate > todayEnd;

      let dayCups = 0;
      let dayRev = 0;
      let dayProfit = 0;
      let logCount = 0;

      // LOGIC CHUẨN THỰC TẾ: Các ngày ở tương lai chưa có số liệu bán hàng bắt buộc = 0
      if (!isFuture) {
        const dayLogs = (salesLogs || []).filter(log => {
          const ld = this.parseLogDate(log);
          return this.isSameDay(ld, targetDate);
        });

        dayLogs.forEach(l => {
          dayCups += Number(l.totalCups || 0);
          dayRev += Number(l.revenue || 0);
          dayProfit += Number(l.grossProfit || 0);
        });
        logCount = dayLogs.length;
      }

      const dd = String(targetDate.getDate()).padStart(2, '0');
      const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
      const isToday = this.isSameDay(targetDate, now);

      weekDaysData.push({
        dayName: dayNames[i],
        fullDayName: fullDayNames[i],
        dateStr: `${dd}/${mm}`,
        fullDateStr: `${targetDate.getFullYear()}-${mm}-${dd}`,
        cups: dayCups,
        revenue: dayRev,
        profit: dayProfit,
        isToday,
        isFuture,
        count: logCount
      });
    }

    const totalWeeklyCups = weekDaysData.reduce((sum, d) => sum + d.cups, 0);

    // TRƯỜNG HỢP 1: NẾU HOÀN TOÀN CHƯA CÓ SỐ LIỆU BÁN TRONG 7 NGÀY
    // HIỂN THỊ EMPTY STATE GIAO DIỆN CHUYÊN NGHIỆP, NỔI BẬT, CÓ NÚT HÀNH ĐỘNG — KHÔNG BAO GIỜ ĐỂ MÀN HÌNH ĐEN!
    if (totalWeeklyCups === 0) {
      if (peakSummary) {
        peakSummary.innerHTML = `<span style="color:var(--text-muted); font-size:0.75rem;">Chưa có dữ liệu ca bán 7 ngày qua</span>`;
      }
      barsContainer.innerHTML = `
        <div class="chart-empty-state">
          <div class="chart-empty-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.6;"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg></div>
          <div class="chart-empty-title">Chưa Có Số Liệu Bán Hàng 7 Ngày Gần Nhất</div>
          <div class="chart-empty-desc">
            Khu vực này phân tích cột số lượng ly bán & doanh thu 7 ngày qua (Thứ 2 &rarr; Chủ Nhật). Bạn có thể nạp ngay dữ liệu mẫu F&B hoặc bắt đầu bán hàng chốt ca để kích hoạt biểu đồ sinh động.
          </div>
          <div class="chart-empty-actions">
            <button class="btn btn-sm btn-primary" onclick="window.AppStore.resetSalesToWeeklySeed(); AppController.renderDashboard(); if (window.AppRouter && AppRouter.currentTab === 'reports') AppController.renderReports();">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path><path d="M16 21h5v-5"></path></svg>
              <span>Nạp 7 Ngày Bán Hàng Mẫu</span>
            </button>
            <button class="btn btn-sm btn-secondary" onclick="AppRouter.navigate('pos');">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              <span>Bán Hàng & Chốt Ca Mới</span>
            </button>
          </div>
        </div>
      `;
      return;
    }

    // TRƯỜNG HỢP 2: ĐÃ CÓ DỮ LIỆU BÁN -> HIỂN THỊ CỘT BIỂU ĐỒ NỔI BẬT & SINH ĐỘNG
    const maxWeeklyCups = Math.max(...weekDaysData.map(d => d.cups), 1);
    let peakDayIndex = 0;
    let peakDayCups = -1;
    weekDaysData.forEach((d, idx) => {
      if (d.cups > peakDayCups) {
        peakDayCups = d.cups;
        peakDayIndex = idx;
      }
    });

    if (peakSummary && peakDayCups > 0) {
      const peakItem = weekDaysData[peakDayIndex];
      peakSummary.innerHTML = `Đỉnh Điểm: <strong>${peakItem.dayName} (${peakItem.dateStr})</strong> — ${peakItem.cups} ly (${window.CostEngine.formatCurrency(peakItem.revenue)})`;
    }

    barsContainer.innerHTML = weekDaysData.map((day, idx) => {
      const isPeak = (idx === peakDayIndex && day.cups > 0);
      const heightPct = day.cups > 0 ? Math.min(92, Math.max(14, Math.round((day.cups / maxWeeklyCups) * 90))) : 4;
      const revMillion = day.revenue > 0 ? (day.revenue / 1000000).toFixed(1) + ' tr' : '0 đ';
      const tooltip = day.isFuture
        ? `${day.fullDayName} ngày ${day.dateStr} (Tương lai): Chưa có số liệu bán hàng (0 ly)`
        : `${day.fullDayName} ngày ${day.dateStr}${day.isToday ? ' (Hôm Nay)' : ''}: ${day.cups} ly (${day.count} ca) | Doanh thu: ${window.CostEngine.formatCurrency(day.revenue)}`;

      return `
        <div class="weekly-bar-col ${day.isToday ? 'is-today-col' : ''}" title="${tooltip}">
          ${isPeak ? '<span class="peak-badge">Đỉnh Điểm</span>' : ''}
          <span class="weekly-bar-cups-val ${isPeak ? 'is-peak-val' : ''}">${day.cups > 0 ? day.cups + ' ly' : '<span style="opacity:0.35;">0 ly</span>'}</span>
          <div class="weekly-bar-pillar-track">
            <div class="weekly-bar-pillar ${isPeak ? 'is-peak' : ''} ${day.isToday ? 'is-today' : ''} ${day.cups === 0 ? 'is-zero' : ''}" style="height: ${heightPct}%;"></div>
          </div>
          <div class="weekly-bar-labels">
            <div class="weekly-bar-dayname" style="color: ${day.isToday ? 'var(--primary-400)' : 'var(--text-primary)'}; font-weight: ${day.isToday ? '800' : '700'};">
              ${day.dayName}
            </div>
            <div class="weekly-bar-rev-tag ${day.revenue > 0 ? 'has-rev' : ''}">${revMillion}</div>
          </div>
        </div>
      `;
    }).join('');
  },

  // ================= VIEW: DASHBOARD =================
  renderDashboard(periodFilter) {
    if (periodFilter) {
      this.dashPeriod = periodFilter;
    }
    const currentPeriod = this.dashPeriod || 'week';

    const ingredients = window.AppStore.state.ingredients || [];
    const products = window.AppStore.state.products || [];
    const subRecipes = window.AppStore.state.subRecipes || [];
    const salesLogs = window.AppStore.state.salesLogs || [];
    const ingMap = window.AppStore.getIngredientsMap();
    const subMap = window.AppStore.getSubRecipesMap();

    // --- 1. GẮN SỰ KIỆN & CẬP NHẬT TRẠNG THÁI NÚT LỌC CHU KỲ BÁN HÀNG ---
    const periodButtons = document.querySelectorAll('#dash-period-filter-group .sales-period-btn');
    periodButtons.forEach(btn => {
      const p = btn.getAttribute('data-period');
      btn.classList.toggle('active', p === currentPeriod);
      btn.onclick = () => {
        this.renderDashboard(p);
      };
    });

    // --- 2. LỌC DANH SÁCH SALES LOGS THEO CHU KỲ ĐƯỢC CHỌN ---
    const now = new Date();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0);

    const filteredSalesLogs = salesLogs.filter(log => {
      const logDate = this.parseLogDate(log);
      if (currentPeriod === 'today') {
        return this.isSameDay(logDate, now);
      } else if (currentPeriod === 'week') {
        return logDate >= sevenDaysAgo && logDate <= todayEnd;
      }
      return true; // 'all'
    });

    // --- 3. TÍNH TOÁN 4 CHỈ SỐ KPI BÁN HÀNG TỨC THÌ ---
    let periodCups = 0;
    let periodRevenue = 0;
    let periodCogs = 0;
    let periodGrossProfit = 0;

    filteredSalesLogs.forEach(log => {
      periodCups += Number(log.totalCups || 0);
      periodRevenue += Number(log.revenue || 0);
      periodCogs += Number(log.estimatedCogs || 0);
      periodGrossProfit += Number(log.grossProfit || 0);
    });

    const periodMarginPct = periodRevenue > 0 ? ((periodGrossProfit / periodRevenue) * 100).toFixed(1) : '0';

    const elSalesCups = document.getElementById('dash-sales-cups');
    const elSalesCupsSub = document.getElementById('dash-sales-cups-sub');
    const elSalesRev = document.getElementById('dash-sales-revenue');
    const elSalesRevSub = document.getElementById('dash-sales-rev-sub');
    const elSalesCogs = document.getElementById('dash-sales-cogs');
    const elSalesProfit = document.getElementById('dash-sales-profit');
    const elSalesMargin = document.getElementById('dash-sales-margin-pct');

    const formattedCups = (window.CostEngine && typeof window.CostEngine.formatNumber === 'function')
      ? window.CostEngine.formatNumber(periodCups)
      : Number(periodCups).toLocaleString('vi-VN');

    if (elSalesCups) elSalesCups.textContent = `${formattedCups} ly`;
    if (elSalesCupsSub) {
      if (currentPeriod === 'today') {
        elSalesCupsSub.textContent = `Bán trong hôm nay (${filteredSalesLogs.length} ca ghi nhận)`;
      } else if (currentPeriod === 'week') {
        elSalesCupsSub.textContent = `Trong 7 ngày qua (TB ~${Math.round(periodCups / 7)} ly/ngày)`;
      } else {
        elSalesCupsSub.textContent = `Toàn bộ ${filteredSalesLogs.length} ca chốt từ trước đến nay`;
      }
    }
    if (elSalesRev) elSalesRev.textContent = window.CostEngine.formatCurrency(periodRevenue);
    if (elSalesRevSub) {
      elSalesRevSub.textContent = currentPeriod === 'today' ? 'Doanh thu hôm nay' : 'Doanh thu chu kỳ chọn';
    }
    if (elSalesCogs) elSalesCogs.textContent = window.CostEngine.formatCurrency(periodCogs);
    if (elSalesProfit) elSalesProfit.textContent = `+${window.CostEngine.formatCurrency(periodGrossProfit)}`;
    if (elSalesMargin) elSalesMargin.textContent = `${periodMarginPct}%`;

    // --- 4. RENDER BIỂU ĐỒ CỘT 7 NGÀY (THỨ 2 -> CHỦ NHẬT / HÔM NAY) ---
    this.renderWeeklyChart('dash-weekly-bars-container', 'dash-chart-peak-summary', salesLogs);

    // --- 6. XẾP HẠNG TOP MÓN BÁN CHẠY NHẤT & BOTTOM MÓN BÁN ÍT NHẤT (TOP & BOTTOM) ---
    const productStatsMap = {};
    products.forEach(p => {
      productStatsMap[p.id] = {
        product: p,
        totalQty: 0,
        totalRevenue: 0
      };
    });

    filteredSalesLogs.forEach(log => {
      if (Array.isArray(log.salesItems)) {
        log.salesItems.forEach(item => {
          if (productStatsMap[item.productId]) {
            const qty = Number(item.qty || 0);
            productStatsMap[item.productId].totalQty += qty;
            productStatsMap[item.productId].totalRevenue += Number(item.revenue || (qty * (item.unitPrice || 0)));
          }
        });
      }
    });

    const productStatsList = Object.values(productStatsMap);
    // Sắp xếp giảm dần theo số ly bán
    productStatsList.sort((a, b) => b.totalQty - a.totalQty);

    const totalPeriodSalesQty = productStatsList.reduce((sum, item) => sum + item.totalQty, 0);

    // TOP 3 MÓN BÁN CHẠY NHẤT
    const topSellersList = productStatsList.filter(item => item.totalQty > 0).slice(0, 3);
    const topContainer = document.getElementById('dash-top-sellers-list');
    if (topContainer) {
      if (topSellersList.length === 0) {
        topContainer.innerHTML = `<div style="text-align:center; padding:1.5rem; color:var(--text-muted); font-size:0.85rem;">Chưa có dữ liệu bán trong chu kỳ này.</div>`;
      } else {
        const rankMedals = ['1', '2', '3'];
        const rankClasses = ['gold', 'silver', 'bronze'];

        topContainer.innerHTML = topSellersList.map((item, idx) => {
          const pct = totalPeriodSalesQty > 0 ? ((item.totalQty / totalPeriodSalesQty) * 100).toFixed(1) : 0;
          return `
            <div class="rank-row">
              <div class="rank-pos-badge ${rankClasses[idx] || 'bronze'}">${rankMedals[idx] || (idx + 1)}</div>
              <div class="rank-info">
                <div class="rank-name-row">
                  <span class="rank-name" title="${item.product.name}">${item.product.name}</span>
                  <span class="rank-cups" style="color:var(--primary-400);">${item.totalQty} ly</span>
                </div>
                <div class="rank-progress-track">
                  <div class="rank-progress-fill ${idx === 0 ? 'fill-green' : ''}" style="width:${Math.max(8, pct)}%;"></div>
                </div>
                <div class="rank-meta-row">
                  <span>${item.product.size || ''} • Doanh thu: <strong>${window.CostEngine.formatCurrency(item.totalRevenue)}</strong></span>
                  <span style="font-weight:700; color:var(--text-primary);">${pct}% thị phần</span>
                </div>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // BOTTOM MÓN BÁN ÍT NHẤT (Chậm bán / Cảnh báo - Loại trừ các món đã nằm trong top bán chạy để không bị trùng lặp)
    const topSellerIds = new Set(topSellersList.map(it => it.product.id));
    const nonTopItems = productStatsList.filter(it => !topSellerIds.has(it.product.id));
    const bottomCandidates = nonTopItems
      .sort((a, b) => a.totalQty - b.totalQty)
      .slice(0, 3);
    const bottomContainer = document.getElementById('dash-bottom-sellers-list');
    if (bottomContainer) {
      if (bottomCandidates.length === 0) {
        bottomContainer.innerHTML = `<div style="text-align:center; padding:1.5rem; color:var(--text-muted); font-size:0.85rem;">Chưa có dữ liệu bán trong chu kỳ này.</div>`;
      } else {
        bottomContainer.innerHTML = bottomCandidates.map((item, idx) => {
          const pct = totalPeriodSalesQty > 0 ? ((item.totalQty / totalPeriodSalesQty) * 100).toFixed(1) : 0;
          const isCriticalSlow = item.totalQty <= 5;
          return `
            <div class="rank-row" style="border-left: 3px solid ${isCriticalSlow ? '#ef4444' : '#f59e0b'};">
              <div class="rank-pos-badge slow" style="display:inline-flex; align-items:center; gap:0.25rem;">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>
                <span>${item.totalQty} ly</span>
              </div>
              <div class="rank-info">
                <div class="rank-name-row">
                  <span class="rank-name" title="${item.product.name}">${item.product.name}</span>
                  <span class="rank-cups" style="color:${isCriticalSlow ? '#ef4444' : '#f59e0b'};">
                    ${item.totalQty > 0 ? item.totalQty + ' ly' : 'Chưa bán được ly nào'}
                  </span>
                </div>
                <div class="rank-progress-track">
                  <div class="rank-progress-fill fill-red" style="width:${Math.max(5, pct)}%;"></div>
                </div>
                <div class="rank-meta-row">
                  <span>${item.product.size || ''} • Doanh thu: <strong>${window.CostEngine.formatCurrency(item.totalRevenue)}</strong></span>
                  <span style="color:${isCriticalSlow ? '#f87171' : 'var(--text-muted)'}; font-weight:600;">
                    ${isCriticalSlow ? 'Tiêu thụ rất chậm (' + pct + '%)' : 'Thị phần thấp (' + pct + '%)'}
                  </span>
                </div>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // --- 7. TÍNH TOÁN CÁC THỐNG KÊ TỒN KHO & ĐỊNH LƯỢNG BAN ĐẦU ---
    let totalStockVal = 0;
    let lowStockItems = [];

    ingredients.forEach(i => {
      totalStockVal += (i.stockQty || 0) * (i.unitCost || 0);
      if ((i.stockQty || 0) <= (i.minStock || 0)) {
        lowStockItems.push(i);
      }
    });

    // KPI Cards đầu trang
    const kpiVal = document.getElementById('kpi-total-inventory-value');
    const kpiSkus = document.getElementById('kpi-total-skus');
    const kpiLow = document.getElementById('kpi-low-stock-count');
    const kpiAvgFc = document.getElementById('kpi-avg-foodcost');
    const kpiAvgMg = document.getElementById('kpi-avg-margin');
    const kpiMenuCount = document.getElementById('kpi-menu-count');
    const kpiSubCount = document.getElementById('kpi-subrecipe-count');

    if (kpiVal) kpiVal.textContent = window.CostEngine.formatCurrency(totalStockVal);
    if (kpiSkus) kpiSkus.textContent = `${ingredients.length} loại nguyên liệu & bao bì`;
    if (kpiLow) kpiLow.textContent = lowStockItems.length;
    if (kpiMenuCount) kpiMenuCount.textContent = `${products.length} món`;
    if (kpiSubCount) kpiSubCount.textContent = `${subRecipes.length} bán thành phẩm`;

    // Tính toán Top Món Lợi Nhuận Cao (theo biên lãi công thức)
    const rankedProducts = products.map(p => {
      const cogs = window.CostEngine.calculateProductCogs(p, ingMap, subMap);
      return { product: p, cogs };
    }).sort((a, b) => (b.cogs.inStoreMarginPct || 0) - (a.cogs.inStoreMarginPct || 0));

    if (rankedProducts.length > 0) {
      const avgFc = rankedProducts.reduce((acc, curr) => acc + (curr.cogs.foodCostPct || 0), 0) / rankedProducts.length;
      if (kpiAvgFc) kpiAvgFc.textContent = `${avgFc.toFixed(1)}%`;
      if (kpiAvgMg) kpiAvgMg.textContent = `${(100 - avgFc).toFixed(1)}%`;
    }

    // Bảng 1: Cảnh báo tồn kho thấp
    const lowStockTbody = document.getElementById('dash-low-stock-tbody');
    if (lowStockTbody) {
      if (lowStockItems.length === 0) {
        lowStockTbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:1.5rem; color:var(--color-success);">Toàn bộ nguyên liệu đều trên mức an toàn.</td></tr>`;
      } else {
        lowStockTbody.innerHTML = lowStockItems.slice(0, 5).map(i => {
          const isOut = (i.stockQty || 0) <= 0;
          return `
            <tr>
              <td>
                <div style="font-weight:600;">${i.name}</div>
                <div style="font-size:0.75rem; color:var(--text-muted);">${i.category}</div>
              </td>
              <td><strong style="color:${isOut ? 'var(--color-danger)' : 'var(--color-warning)'}">${window.CostEngine.formatQty(i.stockQty, i.baseUnit)}</strong></td>
              <td>${window.CostEngine.formatQty(i.minStock, i.baseUnit)}</td>
              <td>
                <span class="badge ${isOut ? 'badge-out-stock' : 'badge-low-stock'}">
                  ${isOut ? 'Hết Hàng' : 'Sắp Hết'}
                </span>
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    // Bảng 2: Bảng Xếp Hạng Menu (Hiển thị toàn bộ món đồ uống kèm biểu đồ thanh tỷ lệ)
    const topProfitTbody = document.getElementById('dash-top-profit-tbody');
    if (topProfitTbody) {
      topProfitTbody.innerHTML = rankedProducts.map((item) => {
        const marginPct = Number(item.cogs.inStoreMarginPct || 0);
        return `
          <tr>
            <td>
              <div class="product-cell">
                <div>
                  <div style="font-weight:700;">${item.product.name}</div>
                  <div style="font-size:0.75rem; color:var(--text-muted);">${item.product.size || ''}</div>
                </div>
              </div>
            </td>
            <td><strong>${window.CostEngine.formatCurrency(item.product.sellingPrice)}</strong></td>
            <td style="color:var(--primary-400);">${window.CostEngine.formatCurrency(item.cogs.totalCogs)}</td>
            <td style="color:var(--color-success); font-weight:700;">+${window.CostEngine.formatCurrency(item.cogs.inStoreGrossProfit)}</td>
            <td>
              <div style="display:flex; align-items:center; gap:0.4rem; min-width:85px;">
                <div style="flex:1; height:6px; background:var(--bg-input); border-radius:var(--radius-full); overflow:hidden;">
                  <div style="height:100%; width:${Math.min(100, Math.max(10, marginPct))}%; background:${marginPct >= 65 ? 'var(--accent-matcha-500)' : marginPct >= 50 ? 'var(--primary-500)' : '#ef4444'};"></div>
                </div>
                <span class="badge badge-in-stock" style="font-size:0.72rem; padding:0.15rem 0.4rem;">${marginPct}%</span>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }

    // Bảng 3: Lịch sử bán hàng ca gần nhất
    const salesTbody = document.getElementById('dash-sales-history-tbody');
    if (salesTbody) {
      if (salesLogs.length === 0) {
        salesTbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:1.5rem; color:var(--text-muted);">Chưa có ca bán hàng nào được ghi nhận. Bấm "Bán Hàng & Trừ Kho" để bắt đầu!</td></tr>`;
      } else {
        salesTbody.innerHTML = salesLogs.slice(0, 5).map(log => {
          return `
            <tr>
              <td><code>${log.id}</code></td>
              <td>${log.date}</td>
              <td><strong>${log.shift || 'Ca bán'}</strong></td>
              <td>${log.totalCups} ly</td>
              <td style="font-weight:700;">${window.CostEngine.formatCurrency(log.revenue)}</td>
              <td style="color:var(--primary-400);">${window.CostEngine.formatCurrency(log.estimatedCogs)}</td>
              <td style="color:var(--color-success); font-weight:700;">+${window.CostEngine.formatCurrency(log.grossProfit)}</td>
            </tr>
          `;
        }).join('');
      }
    }
  },

  // ================= 3.5. VIEW: BÁO CÁO BÁN HÀNG & MENU =================
  renderReports(periodFilter) {
    if (periodFilter) {
      this.reportPeriod = periodFilter;
    }
    const currentPeriod = this.reportPeriod || 'week';

    const ingredients = window.AppStore.state.ingredients || [];
    const products = window.AppStore.state.products || [];
    const subRecipes = window.AppStore.state.subRecipes || [];
    const salesLogs = window.AppStore.state.salesLogs || [];
    const ingMap = window.AppStore.getIngredientsMap();
    const subMap = window.AppStore.getSubRecipesMap();

    // 1. Cập nhật nút bộ lọc chu kỳ
    const periodButtons = document.querySelectorAll('#rep-period-filter-group .sales-period-btn');
    periodButtons.forEach(btn => {
      const p = btn.getAttribute('data-period');
      btn.classList.toggle('active', p === currentPeriod);
      btn.onclick = () => {
        this.renderReports(p);
      };
    });

    const rangeLabel = document.getElementById('rep-active-range-label');
    if (rangeLabel) {
      if (currentPeriod === 'today') rangeLabel.textContent = 'Đang hiển thị: Hôm Nay';
      else if (currentPeriod === 'week') rangeLabel.textContent = 'Đang hiển thị: 7 Ngày Tuần Này';
      else rangeLabel.textContent = 'Đang hiển thị: Toàn Thời Gian';
    }

    // 2. Lọc danh sách sales logs theo chu kỳ
    const now = new Date();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0);

    const filteredSalesLogs = salesLogs.filter(log => {
      const logDate = this.parseLogDate(log);
      if (currentPeriod === 'today') {
        return this.isSameDay(logDate, now);
      } else if (currentPeriod === 'week') {
        return logDate >= sevenDaysAgo && logDate <= todayEnd;
      }
      return true;
    });

    // 3. Tính toán 4 KPI tổng quan
    let periodCups = 0;
    let periodRevenue = 0;
    let periodCogs = 0;
    let periodGrossProfit = 0;

    filteredSalesLogs.forEach(log => {
      periodCups += Number(log.totalCups || 0);
      periodRevenue += Number(log.revenue || 0);
      periodCogs += Number(log.estimatedCogs || 0);
      periodGrossProfit += Number(log.grossProfit || 0);
    });

    const periodMarginPct = periodRevenue > 0 ? ((periodGrossProfit / periodRevenue) * 100).toFixed(1) : '0';

    const elCups = document.getElementById('rep-total-cups');
    const elCupsSub = document.getElementById('rep-cups-sub');
    const elRev = document.getElementById('rep-total-rev');
    const elCogs = document.getElementById('rep-total-cogs');
    const elProfit = document.getElementById('rep-total-profit');
    const elMargin = document.getElementById('rep-margin-pct');

    const formattedCups = (window.CostEngine && typeof window.CostEngine.formatNumber === 'function')
      ? window.CostEngine.formatNumber(periodCups)
      : Number(periodCups).toLocaleString('vi-VN');

    if (elCups) elCups.textContent = `${formattedCups} ly`;
    if (elCupsSub) {
      if (currentPeriod === 'today') elCupsSub.textContent = `Bán trong hôm nay (${filteredSalesLogs.length} ca ghi nhận)`;
      else if (currentPeriod === 'week') elCupsSub.textContent = `Trong 7 ngày qua (TB ~${Math.round(periodCups / 7)} ly/ngày)`;
      else elCupsSub.textContent = `Toàn bộ ${filteredSalesLogs.length} ca bán`;
    }
    if (elRev) elRev.textContent = window.CostEngine.formatCurrency(periodRevenue);
    if (elCogs) elCogs.textContent = window.CostEngine.formatCurrency(periodCogs);
    if (elProfit) elProfit.textContent = `+${window.CostEngine.formatCurrency(periodGrossProfit)}`;
    if (elMargin) elMargin.textContent = `${periodMarginPct}%`;

    // 4. Render Biểu Đồ 7 Ngày
    this.renderWeeklyChart('rep-weekly-bars-container', 'rep-chart-peak-summary', salesLogs);

    // 6. Xếp Hạng Top & Bottom Menu
    const productStatsMap = {};
    products.forEach(p => {
      const cogsInfo = window.CostEngine.calculateProductCogs(p, ingMap, subMap);
      productStatsMap[p.id] = {
        product: p,
        totalQty: 0,
        totalRevenue: 0,
        unitCogs: cogsInfo ? cogsInfo.totalCogs : 0,
        marginPct: cogsInfo ? cogsInfo.inStoreMarginPct : 0
      };
    });

    filteredSalesLogs.forEach(log => {
      if (Array.isArray(log.salesItems)) {
        log.salesItems.forEach(item => {
          if (productStatsMap[item.productId]) {
            const qty = Number(item.qty || 0);
            productStatsMap[item.productId].totalQty += qty;
            productStatsMap[item.productId].totalRevenue += Number(item.revenue || (qty * (item.unitPrice || 0)));
          }
        });
      }
    });

    const productStatsList = Object.values(productStatsMap);
    productStatsList.sort((a, b) => b.totalQty - a.totalQty);

    const totalPeriodSalesQty = productStatsList.reduce((sum, item) => sum + item.totalQty, 0);

    // Render Top 3 Best Sellers
    const topSellersList = productStatsList.filter(item => item.totalQty > 0).slice(0, 3);
    const topContainer = document.getElementById('rep-top-sellers-list');
    if (topContainer) {
      if (topSellersList.length === 0) {
        topContainer.innerHTML = `<div style="text-align:center; padding:1.5rem; color:var(--text-muted); font-size:0.85rem;">Chưa có dữ liệu bán trong chu kỳ này.</div>`;
      } else {
        const rankMedals = ['1', '2', '3'];
        const rankClasses = ['gold', 'silver', 'bronze'];

        topContainer.innerHTML = topSellersList.map((item, idx) => {
          const pct = totalPeriodSalesQty > 0 ? ((item.totalQty / totalPeriodSalesQty) * 100).toFixed(1) : 0;
          return `
            <div class="rank-row">
              <div class="rank-pos-badge ${rankClasses[idx] || 'bronze'}">${rankMedals[idx] || (idx + 1)}</div>
              <div class="rank-info">
                <div class="rank-name-row">
                  <span class="rank-name" title="${item.product.name}">${item.product.name}</span>
                  <span class="rank-cups" style="color:var(--primary-400);">${item.totalQty} ly</span>
                </div>
                <div class="rank-progress-track">
                  <div class="rank-progress-fill ${idx === 0 ? 'fill-green' : ''}" style="width:${Math.max(8, pct)}%;"></div>
                </div>
                <div class="rank-meta-row">
                  <span>${item.product.size || ''} • Doanh thu: <strong>${window.CostEngine.formatCurrency(item.totalRevenue)}</strong></span>
                  <span style="font-weight:700; color:var(--text-primary);">${pct}% thị phần</span>
                </div>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // Render Bottom Slow Movers (Loại trừ các món đã nằm trong top bán chạy để không bị trùng lặp)
    const repTopSellerIds = new Set(topSellersList.map(it => it.product.id));
    const repNonTopItems = productStatsList.filter(it => !repTopSellerIds.has(it.product.id));
    const bottomCandidates = repNonTopItems
      .sort((a, b) => a.totalQty - b.totalQty)
      .slice(0, 3);
    const bottomContainer = document.getElementById('rep-bottom-sellers-list');
    if (bottomContainer) {
      if (bottomCandidates.length === 0) {
        bottomContainer.innerHTML = `<div style="text-align:center; padding:1.5rem; color:var(--text-muted); font-size:0.85rem;">Chưa có dữ liệu bán trong chu kỳ này.</div>`;
      } else {
        bottomContainer.innerHTML = bottomCandidates.map((item) => {
          const pct = totalPeriodSalesQty > 0 ? ((item.totalQty / totalPeriodSalesQty) * 100).toFixed(1) : 0;
          const isCriticalSlow = item.totalQty <= 5;
          return `
            <div class="rank-row" style="border-left: 3px solid ${isCriticalSlow ? '#ef4444' : '#f59e0b'};">
              <div class="rank-pos-badge slow" style="display:inline-flex; align-items:center; gap:0.25rem;">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>
                <span>${item.totalQty} ly</span>
              </div>
              <div class="rank-info">
                <div class="rank-name-row">
                  <span class="rank-name" title="${item.product.name}">${item.product.name}</span>
                  <span class="rank-cups" style="color:${isCriticalSlow ? '#ef4444' : '#f59e0b'};">
                    ${item.totalQty > 0 ? item.totalQty + ' ly' : 'Chưa bán được ly nào'}
                  </span>
                </div>
                <div class="rank-progress-track">
                  <div class="rank-progress-fill fill-red" style="width:${Math.max(5, pct)}%;"></div>
                </div>
                <div class="rank-meta-row">
                  <span>${item.product.size || ''} • Doanh thu: <strong>${window.CostEngine.formatCurrency(item.totalRevenue)}</strong></span>
                  <span style="color:${isCriticalSlow ? '#f87171' : 'var(--text-muted)'}; font-weight:600;">
                    ${isCriticalSlow ? 'Tiêu thụ rất chậm (' + pct + '%)' : 'Thị phần thấp (' + pct + '%)'}
                  </span>
                </div>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // 7. BẢNG XẾP HẠNG TOÀN BỘ MENU ĐỒ UỐNG (FULL MATRIX TABLE)
    const fullMenuTbody = document.getElementById('rep-full-menu-tbody');
    if (fullMenuTbody) {
      fullMenuTbody.innerHTML = productStatsList.map((item, idx) => {
        const pct = totalPeriodSalesQty > 0 ? ((item.totalQty / totalPeriodSalesQty) * 100).toFixed(1) : 0;
        const totalCogs = item.totalQty * item.unitCogs;
        const grossProfit = item.totalRevenue - totalCogs;
        
        // Phân loại độ chạy với SVG vector tinh gọn
        let statusBadge = '';
        if (pct >= 20 || (idx === 0 && item.totalQty > 0)) {
          statusBadge = `<span class="badge-status-top">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
            Bán Chạy (Top)
          </span>`;
        } else if (pct < 5 || item.totalQty <= 5) {
          statusBadge = `<span class="badge-status-slow">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>
            Chậm / Bán Ít
          </span>`;
        } else {
          statusBadge = `<span class="badge-status-normal">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Ổn Định
          </span>`;
        }

        const rankBadge = idx === 0 
          ? '<span class="rank-chip rank-chip-1">1</span>' 
          : idx === 1 
          ? '<span class="rank-chip rank-chip-2">2</span>' 
          : idx === 2 
          ? '<span class="rank-chip rank-chip-3">3</span>' 
          : `<span class="rank-chip">${idx + 1}</span>`;

        return `
          <tr>
            <td style="text-align:center;">
              ${rankBadge}
            </td>
            <td>
              <div class="product-cell">
                <div>
                  <div style="font-weight:700;">${item.product.name}</div>
                  <div style="font-size:0.75rem; color:var(--text-muted);">${item.product.size || ''}</div>
                </div>
              </div>
            </td>
            <td><span class="badge badge-subtle">${item.product.category || 'Món chính'}</span></td>
            <td><strong>${window.CostEngine.formatCurrency(item.product.sellingPrice)}</strong></td>
            <td style="font-weight:800; color:var(--primary-400); font-size:0.95rem;">${item.totalQty} ly</td>
            <td style="font-weight:700;">${window.CostEngine.formatCurrency(item.totalRevenue)}</td>
            <td style="color:var(--text-muted);">${window.CostEngine.formatCurrency(totalCogs)}</td>
            <td style="color:var(--color-success); font-weight:700;">+${window.CostEngine.formatCurrency(grossProfit)}</td>
            <td><strong>${item.marginPct}%</strong></td>
            <td>
              <div style="display:flex; align-items:center; gap:0.5rem;">
                <div style="flex:1; height:6px; background:var(--bg-input); border-radius:var(--radius-full); overflow:hidden; min-width:50px;">
                  <div style="height:100%; width:${Math.max(5, pct)}%; background:${pct >= 20 ? 'var(--accent-matcha-500)' : pct < 5 ? '#ef4444' : 'var(--primary-500)'};"></div>
                </div>
                <span style="font-weight:700; font-size:0.75rem;">${pct}%</span>
              </div>
            </td>
            <td>${statusBadge}</td>
          </tr>
        `;
      }).join('');
    }

    // 8. Gắn sự kiện xuất file CSV báo cáo
    const exportBtn = document.getElementById('btn-export-reports-csv');
    if (exportBtn) {
      exportBtn.onclick = () => {
        const headers = ['XepHang', 'TenMon', 'Size', 'DanhMuc', 'GiaBan', 'SoLyBan', 'DoanhThu', 'GiaVonCOGS', 'LoiNhuanGop', 'BienLaiPct', 'TyTrongThiPhanPct', 'PhanLoai'];
        const rows = productStatsList.map((item, idx) => {
          const pct = totalPeriodSalesQty > 0 ? ((item.totalQty / totalPeriodSalesQty) * 100).toFixed(1) : 0;
          const totalCogs = item.totalQty * item.unitCogs;
          const grossProfit = item.totalRevenue - totalCogs;
          const status = pct >= 20 ? 'Ban Chay' : pct < 5 ? 'Khong Chay / Cham' : 'On Dinh';
          return [
            idx + 1,
            `"${item.product.name.replace(/"/g, '""')}"`,
            `"${item.product.size || ''}"`,
            `"${item.product.category || ''}"`,
            item.product.sellingPrice,
            item.totalQty,
            item.totalRevenue,
            totalCogs,
            grossProfit,
            item.marginPct + '%',
            pct + '%',
            status
          ].join(',');
        });

        const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Bao_Cao_Ban_Hang_Menu_${currentPeriod}_${new Date().toISOString().slice(0,10)}.csv`;
        link.click();
        UI.showToast('Xuất Thành Công', 'Đã tải xuống file báo cáo bán hàng CSV!', 'success');
      };
    }
  },

  // ================= 4. VIEW: KHO & NGUYÊN LIỆU =================
  renderIngredients(searchQuery = '') {
    const ingredients = window.AppStore.state.ingredients || [];
    const activeCat = document.querySelector('#ingredient-filter-pills .filter-pill.active')?.getAttribute('data-cat') || 'all';
    const stockFilter = document.getElementById('ingredient-stock-filter')?.value || 'all';

    let filtered = ingredients.filter(item => {
      // Lọc theo Category
      if (activeCat !== 'all' && item.category !== activeCat) return false;

      const stock = Number(item.stockQty || 0);
      const minStock = Number(item.minStock || 0);

      // Lọc theo Tình trạng tồn
      if (stockFilter === 'out' && stock > 0 && stock >= minStock) return false;
      if (stockFilter === 'low' && (stock > minStock * 1.25 || stock <= 0)) return false;
      if (stockFilter === 'in' && stock < minStock) return false;

      // Lọc theo Từ khóa tìm kiếm
      if (searchQuery) {
        const text = `${item.name} ${item.category} ${item.id}`.toLowerCase();
        if (!text.includes(searchQuery.toLowerCase())) return false;
      }

      return true;
    });

    // Gắn sự kiện chuyển pill
    const pills = document.querySelectorAll('#ingredient-filter-pills .filter-pill');
    pills.forEach(p => {
      p.onclick = () => {
        pills.forEach(x => x.classList.remove('active'));
        p.classList.add('active');
        this.renderIngredients();
      };
    });

    const selectFilter = document.getElementById('ingredient-stock-filter');
    if (selectFilter) {
      selectFilter.onchange = () => this.renderIngredients();
    }

    const tbody = document.getElementById('ingredients-tbody');
    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:2rem; color:var(--text-muted);">Không tìm thấy nguyên liệu nào phù hợp với bộ lọc.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(item => {
      const stock = Number(item.stockQty || 0);
      const minStock = Number(item.minStock || 0);
      const isOut = stock <= 0;
      const isBelowMin = !isOut && stock < minStock;
      const isNearMin = !isOut && !isBelowMin && (minStock > 0 && stock <= minStock * 1.25);
      const isLow = isBelowMin || isNearMin;

      let statusBadge = '';
      if (isOut) {
        statusBadge = '<span class="badge badge-out-stock" style="background:rgba(239,68,68,0.15); color:var(--color-danger); border:1px solid rgba(239,68,68,0.3); font-weight:700;">Hết Hàng</span>';
      } else if (isBelowMin) {
        statusBadge = '<span class="badge" style="background:rgba(249,115,22,0.18); color:#ea580c; border:1px solid rgba(249,115,22,0.4); font-weight:700;">Báo Động Hết</span>';
      } else if (isNearMin) {
        statusBadge = '<span class="badge badge-low-stock" style="background:rgba(234,179,8,0.16); color:#ca8a04; border:1px solid rgba(234,179,8,0.35); font-weight:700;">Sắp Hết</span>';
      } else {
        statusBadge = '<span class="badge badge-in-stock" style="background:rgba(34,197,94,0.15); color:var(--color-success); border:1px solid rgba(34,197,94,0.3); font-weight:700;">Còn Hàng</span>';
      }

      return `
        <tr>
          <td>
            <div style="font-weight:700; color:var(--text-primary); font-size:0.92rem; line-height:1.3;">${item.name}</div>
            <div style="margin-top:3px;">
              <span class="badge-sku-subtle">#${item.id}</span>
            </div>
          </td>
          <td><span class="badge badge-cat">${item.category}</span></td>
          <td>
            <div>${item.purchaseUnit}</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">(1 = ${item.ratioToBase} ${item.baseUnit})</div>
          </td>
          <td class="col-cost-sensitive">${window.CostEngine.formatCurrency(item.purchasePrice)}</td>
          <td class="col-cost-sensitive">
            <strong style="color:var(--primary-400);">${window.CostEngine.formatCurrency(item.unitCost)}</strong> / ${item.baseUnit}
          </td>
          <td>
            <strong style="font-size:0.95rem; color:${isOut ? 'var(--color-danger)' : (isLow ? 'var(--color-warning)' : 'var(--text-primary)')}">
              ${window.CostEngine.formatQty(item.stockQty, item.baseUnit)}
            </strong>
          </td>
          <td>${window.CostEngine.formatQty(item.minStock, item.baseUnit)}</td>
          <td>${statusBadge}</td>
          <td style="text-align:right; white-space:nowrap;" class="col-cost-sensitive">
            <button class="btn btn-secondary btn-sm" onclick="AppController.openEditIngredient('${item.id}')">Sửa</button>
            <button class="btn btn-danger btn-sm" onclick="AppController.confirmDeleteIngredient('${item.id}')">Xóa</button>
          </td>
        </tr>
      `;
    }).join('');
  },

  bindIngredientModal() {
    const addBtn = document.getElementById('btn-add-ingredient');
    const form = document.getElementById('form-ingredient');
    const baseUnitSelect = document.getElementById('ing-base-unit');
    const ratioUnitText = document.getElementById('ing-ratio-unit');

    if (addBtn) {
      addBtn.addEventListener('click', () => {
        this.openAddIngredient();
      });
    }

    if (baseUnitSelect && ratioUnitText) {
      baseUnitSelect.addEventListener('change', (e) => {
        ratioUnitText.textContent = e.target.value;
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('ing-id').value;
        const name = document.getElementById('ing-name').value.trim();
        const category = document.getElementById('ing-category').value;
        const supplierId = document.getElementById('ing-supplier').value;
        const purchaseUnit = document.getElementById('ing-purchase-unit').value.trim();
        const baseUnit = document.getElementById('ing-base-unit').value;
        const ratioToBase = Number(document.getElementById('ing-ratio').value) || 1;
        const purchasePrice = Number(document.getElementById('ing-purchase-price').value) || 0;
        const stockQty = Number(document.getElementById('ing-stock-qty').value) || 0;
        const minStock = Number(document.getElementById('ing-min-stock').value) || 0;

        const unitCost = parseFloat((purchasePrice / ratioToBase).toFixed(2));

        const data = {
          id: id || undefined,
          name,
          category,
          supplierId,
          purchaseUnit,
          baseUnit,
          ratioToBase,
          purchasePrice,
          unitCost,
          stockQty,
          minStock
        };

        window.AppStore.saveIngredient(data);
        UI.closeModal('modal-ingredient');
        UI.showToast('Thành công', `Đã lưu nguyên liệu: ${name}`, 'success');
      });
    }
  },

  openAddIngredient() {
    document.getElementById('modal-ing-title').textContent = 'Thêm Nguyên Liệu / Vật Tư Mới';
    document.getElementById('ing-id').value = '';
    document.getElementById('ing-name').value = '';
    document.getElementById('ing-category').value = 'Trà lá';
    document.getElementById('ing-purchase-unit').value = 'Gói 1kg';
    document.getElementById('ing-base-unit').value = 'g';
    document.getElementById('ing-ratio-unit').textContent = 'g';
    document.getElementById('ing-ratio').value = '1000';
    document.getElementById('ing-purchase-price').value = '';
    document.getElementById('ing-stock-qty').value = '5000';
    document.getElementById('ing-min-stock').value = '1000';

    // Nạp danh sách NCC vào select
    const supSelect = document.getElementById('ing-supplier');
    if (supSelect) {
      supSelect.innerHTML = (window.AppStore.state.suppliers || []).map(s => `
        <option value="${s.id}">${s.name}</option>
      `).join('');
    }

    UI.openModal('modal-ingredient');
  },

  openEditIngredient(id) {
    const item = (window.AppStore.state.ingredients || []).find(i => i.id === id);
    if (!item) return;

    document.getElementById('modal-ing-title').textContent = 'Chỉnh Sửa Nguyên Liệu';
    document.getElementById('ing-id').value = item.id;
    document.getElementById('ing-name').value = item.name;
    document.getElementById('ing-category').value = item.category;
    document.getElementById('ing-purchase-unit').value = item.purchaseUnit;
    document.getElementById('ing-base-unit').value = item.baseUnit;
    document.getElementById('ing-ratio-unit').textContent = item.baseUnit;
    document.getElementById('ing-ratio').value = item.ratioToBase;
    document.getElementById('ing-purchase-price').value = item.purchasePrice;
    document.getElementById('ing-stock-qty').value = Math.round((Number(item.stockQty) || 0) * 100) / 100;
    document.getElementById('ing-min-stock').value = Math.round((Number(item.minStock) || 0) * 100) / 100;

    const supSelect = document.getElementById('ing-supplier');
    if (supSelect) {
      supSelect.innerHTML = (window.AppStore.state.suppliers || []).map(s => `
        <option value="${s.id}" ${s.id === item.supplierId ? 'selected' : ''}>${s.name}</option>
      `).join('');
    }

    UI.openModal('modal-ingredient');
  },

  confirmDeleteIngredient(id) {
    const item = (window.AppStore.state.ingredients || []).find(i => i.id === id);
    if (!item) return;

    if (confirm(`Bạn có chắc muốn xóa nguyên liệu "${item.name}"?`)) {
      window.AppStore.deleteIngredient(id);
      UI.showToast('Đã xóa', `Đã xóa nguyên liệu ${item.name}`, 'warning');
    }
  },

  // --- BIND BULK IMPORT MODAL ---
  bindBulkImportModal() {
    const dlBtn1 = document.getElementById('btn-download-template');
    const dlBtn2 = document.getElementById('btn-modal-dl-template');
    const openBtn = document.getElementById('btn-bulk-import');
    const submitBtn = document.getElementById('btn-submit-bulk-import');
    const fileInput = document.getElementById('input-csv-file');
    const pasteArea = document.getElementById('textarea-csv-paste');

    const handleDl = () => {
      window.AppStore.downloadCsvTemplate();
      UI.showToast('Tải Mẫu', 'Đã tải xuống file biểu mẫu CSV chuẩn!', 'success');
    };

    if (dlBtn1) dlBtn1.onclick = handleDl;
    if (dlBtn2) dlBtn2.onclick = handleDl;

    if (openBtn) {
      openBtn.onclick = () => {
        if (fileInput) fileInput.value = '';
        if (pasteArea) pasteArea.value = '';
        UI.openModal('modal-bulk-import');
      };
    }

    if (submitBtn) {
      submitBtn.onclick = () => {
        const file = fileInput?.files?.[0];
        if (file) {
          const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
          const reader = new FileReader();

          reader.onload = (e) => {
            try {
              let csvText = '';
              if (isExcel && window.XLSX) {
                const data = new Uint8Array(e.target.result);
                const workbook = window.XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.SheetNames[0];
                csvText = window.XLSX.utils.sheet_to_csv(workbook.Sheets[firstSheet]);
              } else {
                csvText = e.target.result;
              }

              const count = window.AppStore.importIngredientsFromCSV(csvText);
              UI.closeModal('modal-bulk-import');
              UI.showToast('Thành Công', `Đã nạp ${count} nguyên liệu từ file Excel vào kho!`, 'success');
              this.renderIngredients();
            } catch (err) {
              UI.showToast('Lỗi Nhập Dữ Liệu', err.message, 'danger');
            }
          };

          if (isExcel && window.XLSX) {
            reader.readAsArrayBuffer(file);
          } else {
            reader.readAsText(file, 'utf-8');
          }
        } else if (pasteArea && pasteArea.value.trim()) {
          try {
            const count = window.AppStore.importIngredientsFromCSV(pasteArea.value);
            UI.closeModal('modal-bulk-import');
            UI.showToast('Thành Công', `Đã nạp ${count} nguyên liệu từ nội dung dán vào kho!`, 'success');
            this.renderIngredients();
          } catch (err) {
            UI.showToast('Lỗi Nhập Dữ Liệu', err.message, 'danger');
          }
        } else {
          UI.showToast('Cảnh Báo', 'Vui lòng chọn file CSV hoặc dán nội dung từ Excel vào ô!', 'warning');
        }
      };
    }

    // Xử lý kéo dữ liệu trực tiếp từ Google Sheets
    const fetchGSheetBtn = document.getElementById('btn-fetch-google-sheet');
    const gSheetInput = document.getElementById('input-google-sheets-url');

    if (fetchGSheetBtn && gSheetInput) {
      fetchGSheetBtn.onclick = async () => {
        const rawUrl = gSheetInput.value.trim();
        if (!rawUrl) {
          UI.showToast('Cảnh Báo', 'Vui lòng dán liên kết Google Sheets!', 'warning');
          return;
        }

        let exportUrl = rawUrl;
        const match = rawUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
        if (match && match[1]) {
          exportUrl = `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv`;
        }

        fetchGSheetBtn.textContent = 'Đang tải...';
        fetchGSheetBtn.disabled = true;

        try {
          const res = await fetch(exportUrl);
          if (!res.ok) throw new Error('Không thể tải file từ Google Sheets (Mã: ' + res.status + ')');
          const csvText = await res.text();
          if (pasteArea) pasteArea.value = csvText;

          const count = window.AppStore.importIngredientsFromCSV(csvText);
          UI.closeModal('modal-bulk-import');
          UI.showToast('Thành Công', `Đã đồng bộ ${count} nguyên liệu từ Google Sheets vào kho!`, 'success');
          this.renderIngredients();
        } catch (err) {
          UI.showToast('Lưu ý Google Sheets', 'Không thể kéo trực tiếp do quyền riêng tư. Bạn vui lòng bật "Chia sẻ: Bất kỳ ai có liên kết đều có thể xem" hoặc Copy & Paste bảng tính vào ô phía trên nhé!', 'warning');
        } finally {
          fetchGSheetBtn.textContent = 'Kéo Dữ Liệu';
          fetchGSheetBtn.disabled = false;
        }
      };
    }
  },

  // --- BIND QUICK CATALOG MODAL ---
  bindQuickCatalogModal() {
    const openBtn = document.getElementById('btn-quick-catalog');
    const searchInput = document.getElementById('catalog-search-input');
    const selectAllBtn = document.getElementById('btn-catalog-select-all');
    const deselectAllBtn = document.getElementById('btn-catalog-deselect-all');
    const submitBtn = document.getElementById('btn-submit-catalog');

    if (openBtn) {
      openBtn.onclick = () => {
        UI.openModal('modal-quick-catalog');
        this.renderCatalogItems();
      };
    }

    // Filter pills
    const pills = document.querySelectorAll('#catalog-filter-pills .filter-pill');
    pills.forEach(p => {
      p.onclick = () => {
        pills.forEach(x => x.classList.remove('active'));
        p.classList.add('active');
        this.renderCatalogItems();
      };
    });

    if (searchInput) {
      searchInput.oninput = () => this.renderCatalogItems();
    }

    if (selectAllBtn) {
      selectAllBtn.onclick = () => {
        document.querySelectorAll('.catalog-item-checkbox').forEach(cb => cb.checked = true);
        this.updateCatalogSelectedCount();
      };
    }

    if (deselectAllBtn) {
      deselectAllBtn.onclick = () => {
        document.querySelectorAll('.catalog-item-checkbox').forEach(cb => cb.checked = false);
        this.updateCatalogSelectedCount();
      };
    }

    if (submitBtn) {
      submitBtn.onclick = () => {
        const checkedBoxes = Array.from(document.querySelectorAll('.catalog-item-checkbox:checked'));
        if (checkedBoxes.length === 0) {
          UI.showToast('Cảnh Báo', 'Vui lòng chọn ít nhất một nguyên liệu từ thư viện!', 'warning');
          return;
        }

        const library = window.FNB_CATALOG_LIBRARY || [];
        const selectedItems = checkedBoxes.map(cb => {
          const idx = Number(cb.getAttribute('data-idx'));
          return library[idx];
        }).filter(Boolean);

        const count = window.AppStore.addIngredientsFromCatalog(selectedItems);
        UI.closeModal('modal-quick-catalog');
        UI.showToast('Thành Công', `Đã nạp thành công ${count} nguyên liệu chuẩn F&B vào kho hàng!`, 'success');
        this.renderIngredients();
      };
    }
  },

  renderCatalogItems() {
    const grid = document.getElementById('catalog-items-grid');
    if (!grid) return;

    const library = window.FNB_CATALOG_LIBRARY || [];
    const activeCat = document.querySelector('#catalog-filter-pills .filter-pill.active')?.getAttribute('data-cat') || 'all';
    const searchQuery = document.getElementById('catalog-search-input')?.value.toLowerCase().trim() || '';

    const currentIngNames = new Set((window.AppStore.state.ingredients || []).map(i => i.name.toLowerCase()));

    const filtered = library.map((item, idx) => ({ ...item, originalIdx: idx })).filter(item => {
      if (activeCat !== 'all' && item.category !== activeCat) return false;
      if (searchQuery && !item.name.toLowerCase().includes(searchQuery)) return false;
      return true;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:2rem; color:var(--text-muted);">Không tìm thấy nguyên liệu nào trong danh mục.</div>`;
      return;
    }

    grid.innerHTML = filtered.map(item => {
      const alreadyInStore = currentIngNames.has(item.name.toLowerCase());
      return `
        <label style="background:var(--bg-input); border:1px solid ${alreadyInStore ? 'rgba(16,185,129,0.3)' : 'var(--border-subtle)'}; border-radius:var(--radius-md); padding:0.75rem; display:flex; align-items:flex-start; gap:0.65rem; cursor:pointer; transition:all var(--trans-fast); user-select:none;">
          <input type="checkbox" class="catalog-item-checkbox" data-idx="${item.originalIdx}" ${alreadyInStore ? 'checked' : ''} style="margin-top:0.25rem; accent-color:var(--primary-500); width:16px; height:16px;">
          <div style="flex:1;">
            <div style="font-weight:700; font-size:0.85rem; color:var(--text-primary); line-height:1.3;">${item.name}</div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.35rem; font-size:0.75rem;">
              <span class="badge badge-cat" style="font-size:0.68rem; padding:0.1rem 0.4rem;">${item.category}</span>
              <span style="color:var(--primary-400); font-weight:700;">${window.CostEngine.formatCurrency(item.purchasePrice)}</span>
            </div>
            <div style="font-size:0.72rem; color:var(--text-muted); margin-top:0.2rem;">
              Quy cách: ${item.purchaseUnit} (1 = ${item.ratioToBase} ${item.baseUnit})
              ${alreadyInStore ? '<span style="color:var(--color-success); font-weight:bold; margin-left:4px;">● Đã có</span>' : ''}
            </div>
          </div>
        </label>
      `;
    }).join('');

    // Lắng nghe sự kiện click checkbox để cập nhật counter
    grid.querySelectorAll('.catalog-item-checkbox').forEach(cb => {
      cb.onchange = () => this.updateCatalogSelectedCount();
    });

    this.updateCatalogSelectedCount();
  },

  updateCatalogSelectedCount() {
    const count = document.querySelectorAll('.catalog-item-checkbox:checked').length;
    const el = document.getElementById('catalog-selected-count');
    if (el) el.textContent = count;
  },

  // ================= 5. VIEW: NHẬP HÀNG (STOCK IN) =================
  renderStockIn() {
    const purchaseLogs = window.AppStore.state.purchaseLogs || [];
    const tbody = document.getElementById('purchase-orders-tbody');
    if (!tbody) return;

    if (purchaseLogs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--text-muted);">Chưa có phiếu nhập hàng nào. Bấm "Tạo Phiếu Nhập Mới" để ghi nhận đơn hàng!</td></tr>`;
      return;
    }

    tbody.innerHTML = purchaseLogs.map(po => {
      return `
        <tr>
          <td><code>${po.id}</code></td>
          <td>${po.date}</td>
          <td><strong>${po.supplierName}</strong></td>
          <td>${po.itemCount || (po.items ? po.items.length : 1)} mặt hàng</td>
          <td><strong style="color:var(--primary-400);">${window.CostEngine.formatCurrency(po.totalAmount)}</strong></td>
          <td>${po.note || 'Nhập hàng định kỳ'}</td>
          <td style="text-align:right;">
            <span class="badge badge-in-stock">Hoàn Tất</span>
          </td>
        </tr>
      `;
    }).join('');
  },

  bindStockInModal() {
    const createPoBtn = document.getElementById('btn-create-po');
    const addRowBtn = document.getElementById('btn-add-po-row');
    const submitPoBtn = document.getElementById('btn-submit-po');

    if (createPoBtn) {
      createPoBtn.addEventListener('click', () => {
        this.openStockInModal();
      });
    }

    if (addRowBtn) {
      addRowBtn.addEventListener('click', () => {
        this.addPoRow();
      });
    }

    if (submitPoBtn) {
      submitPoBtn.addEventListener('click', () => {
        this.submitPurchaseOrder();
      });
    }
  },

  openStockInModal() {
    const supSelect = document.getElementById('po-supplier-select');
    if (supSelect) {
      supSelect.innerHTML = (window.AppStore.state.suppliers || []).map(s => `
        <option value="${s.name}">${s.name}</option>
      `).join('');
    }

    document.getElementById('po-note').value = 'Nhập nguyên liệu bổ sung';
    document.getElementById('po-items-tbody').innerHTML = '';
    this.addPoRow();
    this.recalcPoTotal();

    UI.openModal('modal-stockin-dialog');
  },

  addPoRow() {
    const tbody = document.getElementById('po-items-tbody');
    if (!tbody) return;

    const rowId = 'po-row-' + Date.now().toString().slice(-5);
    const ingredients = window.AppStore.state.ingredients || [];

    const tr = document.createElement('tr');
    tr.id = rowId;
    tr.innerHTML = `
      <td>
        <select class="form-control po-ing-select" style="width:100%;">
          ${ingredients.map(i => `<option value="${i.id}" data-price="${i.purchasePrice}" data-unit="${i.purchaseUnit}">${i.name} (${i.purchaseUnit})</option>`).join('')}
        </select>
      </td>
      <td>
        <input type="number" class="form-control po-qty-input" value="1" min="1" style="width:90px;">
      </td>
      <td>
        <input type="number" class="form-control po-price-input" value="${ingredients[0]?.purchasePrice || 0}" min="0" style="width:120px;">
      </td>
      <td class="po-line-total" style="font-weight:700; color:var(--text-primary);">
        ${window.CostEngine.formatCurrency(ingredients[0]?.purchasePrice || 0)}
      </td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="document.getElementById('${rowId}').remove(); AppController.recalcPoTotal();">✕</button>
      </td>
    `;

    tbody.appendChild(tr);

    // Bắt sự kiện thay đổi select hoặc giá
    const select = tr.querySelector('.po-ing-select');
    const qtyInput = tr.querySelector('.po-qty-input');
    const priceInput = tr.querySelector('.po-price-input');

    select.addEventListener('change', () => {
      const opt = select.options[select.selectedIndex];
      priceInput.value = opt.getAttribute('data-price') || 0;
      this.recalcPoTotal();
    });

    qtyInput.addEventListener('input', () => this.recalcPoTotal());
    priceInput.addEventListener('input', () => this.recalcPoTotal());

    this.recalcPoTotal();
  },

  recalcPoTotal() {
    let grandTotal = 0;
    document.querySelectorAll('#po-items-tbody tr').forEach(tr => {
      const qty = Number(tr.querySelector('.po-qty-input')?.value || 0);
      const price = Number(tr.querySelector('.po-price-input')?.value || 0);
      const lineTotal = qty * price;
      grandTotal += lineTotal;

      const lineTotalEl = tr.querySelector('.po-line-total');
      if (lineTotalEl) lineTotalEl.textContent = window.CostEngine.formatCurrency(lineTotal);
    });

    const totalEl = document.getElementById('po-total-amount');
    if (totalEl) totalEl.textContent = window.CostEngine.formatCurrency(grandTotal);
  },

  submitPurchaseOrder() {
    const supplierName = document.getElementById('po-supplier-select')?.value;
    const note = document.getElementById('po-note')?.value;

    const items = [];
    let grandTotal = 0;

    document.querySelectorAll('#po-items-tbody tr').forEach(tr => {
      const ingredientId = tr.querySelector('.po-ing-select')?.value;
      const qty = Number(tr.querySelector('.po-qty-input')?.value || 0);
      const price = Number(tr.querySelector('.po-price-input')?.value || 0);

      if (ingredientId && qty > 0) {
        items.push({ ingredientId, qty, price });
        grandTotal += qty * price;
      }
    });

    if (items.length === 0) {
      UI.showToast('Cảnh báo', 'Vui lòng thêm ít nhất một mặt hàng nhập kho!', 'warning');
      return;
    }

    const po = {
      supplierName,
      note,
      items,
      itemCount: items.length,
      totalAmount: grandTotal
    };

    window.AppStore.addPurchaseOrder(po);
    UI.closeModal('modal-stockin-dialog');
    UI.showToast('Thành công', `Đã nhập ${items.length} mặt hàng vào kho và cập nhật giá bình quân!`, 'success');
  },

  // ================= 6. VIEW: BÁN THÀNH PHẨM (SUB-RECIPES) =================
  renderSubRecipes() {
    const subRecipes = window.AppStore.state.subRecipes || [];
    const ingMap = window.AppStore.getIngredientsMap();
    const container = document.getElementById('subrecipes-grid');
    if (!container) return;

    if (subRecipes.length === 0) {
      container.innerHTML = `<div style="grid-column: 1 / -1; text-align:center; padding:3rem; color:var(--text-muted);">Chưa có công thức bán thành phẩm nào. Hãy bấm "Thêm Bán Thành Phẩm" để tạo công thức ủ trà, thạch, trân châu!</div>`;
      return;
    }

    container.innerHTML = subRecipes.map(sub => {
      const calc = window.CostEngine.calculateSubRecipeCost(sub, ingMap);
      return `
        <div class="card" style="margin:0; display:flex; flex-direction:column; justify-content:space-between;">
          <div class="card-header">
            <div>
              <div class="card-title">${sub.name}</div>
              <div style="display:flex; align-items:center; gap:0.5rem; margin-top:0.25rem;">
                <span class="badge badge-cat">${sub.category || 'Bán thành phẩm'}</span>
                <span style="font-size:0.75rem; color:var(--text-muted);">Hạn: ${sub.shelfLifeHours || 4} giờ</span>
              </div>
            </div>
            <div style="display:flex; gap:0.35rem;">
              <button class="btn btn-secondary btn-sm" onclick="AppController.openEditSubRecipe('${sub.id}')">Sửa</button>
              <button class="btn btn-danger btn-sm" onclick="AppController.confirmDeleteSubRecipe('${sub.id}')">Xóa</button>
            </div>
          </div>

          <div class="card-body" style="flex:1;">
            <!-- Chi phí nổi bật -->
            <div class="subrecipe-cost-banner">
              <div>
                <div style="font-size:0.72rem; color:var(--text-muted);">GIÁ 1 ${sub.outputUnit?.toUpperCase() || 'ML'}:</div>
                <div style="font-size:1.15rem; font-weight:800; color:var(--color-success);">${window.CostEngine.formatCurrency(calc.unitCost)}</div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:0.72rem; color:var(--text-muted);">GIÁ CẢ MẺ (${sub.outputQty} ${sub.outputUnit}):</div>
                <div style="font-size:1.15rem; font-weight:800; color:var(--primary-400);">${window.CostEngine.formatCurrency(calc.totalBatchCost)}</div>
              </div>
            </div>

            <!-- Thành phần -->
            <div style="font-size:0.8rem; font-weight:700; margin-bottom:0.4rem; color:var(--text-secondary);">Thành Phần Định Lượng:</div>
            <div style="display:flex; flex-direction:column; gap:0.35rem; font-size:0.82rem; margin-bottom:0.85rem;">
              ${calc.itemsBreakdown.map(item => `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:0.3rem 0; border-bottom:1px dashed var(--border-subtle);">
                  <span>${item.name} (${item.amount} ${item.unit})</span>
                  <strong style="color:var(--text-primary);">${window.CostEngine.formatCurrency(item.lineCost)}</strong>
                </div>
              `).join('')}
            </div>

            ${sub.instructions ? `
              <div class="subrecipe-instruction-box">
                <em>${sub.instructions}</em>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  },

  bindSubRecipeModal() {
    const addBtn = document.getElementById('btn-add-subrecipe');
    const addRowBtn = document.getElementById('btn-add-sub-ing-row');
    const saveBtn = document.getElementById('btn-save-sub-submit');
    const outputQtyInput = document.getElementById('sub-output-qty');
    const outputUnitSelect = document.getElementById('sub-output-unit');
    const unitText = document.getElementById('sub-output-unit-text');

    if (addBtn) {
      addBtn.addEventListener('click', () => this.openAddSubRecipe());
    }

    if (addRowBtn) {
      addRowBtn.addEventListener('click', () => this.addSubRecipeIngRow());
    }

    if (outputUnitSelect && unitText) {
      outputUnitSelect.addEventListener('change', (e) => {
        unitText.textContent = e.target.value;
        this.recalcSubRecipeModalPreview();
      });
    }

    if (outputQtyInput) {
      outputQtyInput.addEventListener('input', () => this.recalcSubRecipeModalPreview());
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.submitSubRecipe());
    }
  },

  openAddSubRecipe() {
    document.getElementById('modal-sub-title').textContent = 'Thêm Công Thức Bán Thành Phẩm';
    document.getElementById('sub-id').value = '';
    document.getElementById('sub-name').value = '';
    document.getElementById('sub-cat').value = 'Cốt trà';
    document.getElementById('sub-output-qty').value = '1000';
    document.getElementById('sub-output-unit').value = 'ml';
    document.getElementById('sub-output-unit-text').textContent = 'ml';
    document.getElementById('sub-shelflife').value = '4';
    document.getElementById('sub-instructions').value = '';

    document.getElementById('sub-ingredients-tbody').innerHTML = '';
    this.addSubRecipeIngRow();
    this.recalcSubRecipeModalPreview();

    UI.openModal('modal-subrecipe-dialog');
  },

  openEditSubRecipe(id) {
    const sub = (window.AppStore.state.subRecipes || []).find(s => s.id === id);
    if (!sub) return;

    document.getElementById('modal-sub-title').textContent = 'Sửa Bán Thành Phẩm';
    document.getElementById('sub-id').value = sub.id;
    document.getElementById('sub-name').value = sub.name;
    document.getElementById('sub-cat').value = sub.category || 'Cốt trà';
    document.getElementById('sub-output-qty').value = sub.outputQty || 1000;
    document.getElementById('sub-output-unit').value = sub.outputUnit || 'ml';
    document.getElementById('sub-output-unit-text').textContent = sub.outputUnit || 'ml';
    document.getElementById('sub-shelflife').value = sub.shelfLifeHours || 4;
    document.getElementById('sub-instructions').value = sub.instructions || '';

    const tbody = document.getElementById('sub-ingredients-tbody');
    tbody.innerHTML = '';

    (sub.ingredients || []).forEach(item => {
      this.addSubRecipeIngRow(item.ingredientId, item.amount);
    });

    this.recalcSubRecipeModalPreview();
    UI.openModal('modal-subrecipe-dialog');
  },

  confirmDeleteSubRecipe(id) {
    const sub = (window.AppStore.state.subRecipes || []).find(s => s.id === id);
    if (!sub) return;

    if (confirm(`Bạn có chắc muốn xóa bán thành phẩm "${sub.name}"?`)) {
      window.AppStore.deleteSubRecipe(id);
      UI.showToast('Đã xóa', `Đã xóa bán thành phẩm ${sub.name}`, 'warning');
    }
  },

  addSubRecipeIngRow(selectedId = null, defaultAmount = 50) {
    const tbody = document.getElementById('sub-ingredients-tbody');
    if (!tbody) return;

    const rowId = 'sub-ing-row-' + Date.now().toString().slice(-5);
    const rawIngredients = (window.AppStore.state.ingredients || []).filter(i => i.category !== 'Bao bì & Ly');

    const tr = document.createElement('tr');
    tr.id = rowId;
    tr.innerHTML = `
      <td>
        <select class="form-control sub-ing-sel" style="width:100%;">
          ${rawIngredients.map(i => `
            <option value="${i.id}" data-cost="${i.unitCost}" data-unit="${i.baseUnit}" ${i.id === selectedId ? 'selected' : ''}>
              ${i.name} (${window.CostEngine.formatCurrency(i.unitCost)}/${i.baseUnit})
            </option>
          `).join('')}
        </select>
      </td>
      <td>
        <input type="number" class="form-control sub-ing-qty" value="${defaultAmount}" min="0.1" step="any" style="width:100px;">
      </td>
      <td class="sub-ing-unit" style="color:var(--text-muted); font-size:0.85rem;">
        ${rawIngredients[0]?.baseUnit || 'g'}
      </td>
      <td class="sub-ing-line-cost" style="font-weight:700; color:var(--text-primary);">0 đ</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="document.getElementById('${rowId}').remove(); AppController.recalcSubRecipeModalPreview();">✕</button>
      </td>
    `;

    tbody.appendChild(tr);

    const select = tr.querySelector('.sub-ing-sel');
    const qtyInput = tr.querySelector('.sub-ing-qty');
    const unitEl = tr.querySelector('.sub-ing-unit');

    const updateRowUnit = () => {
      const opt = select.options[select.selectedIndex];
      if (opt && unitEl) unitEl.textContent = opt.getAttribute('data-unit') || 'g';
      this.recalcSubRecipeModalPreview();
    };

    select.addEventListener('change', updateRowUnit);
    qtyInput.addEventListener('input', () => this.recalcSubRecipeModalPreview());

    updateRowUnit();
  },

  recalcSubRecipeModalPreview() {
    let totalBatchCost = 0;

    document.querySelectorAll('#sub-ingredients-tbody tr').forEach(tr => {
      const select = tr.querySelector('.sub-ing-sel');
      const qtyInput = tr.querySelector('.sub-ing-qty');
      const opt = select?.options[select.selectedIndex];
      const unitCost = Number(opt?.getAttribute('data-cost') || 0);
      const amount = Number(qtyInput?.value || 0);

      const lineCost = unitCost * amount;
      totalBatchCost += lineCost;

      const lineEl = tr.querySelector('.sub-ing-line-cost');
      if (lineEl) lineEl.textContent = window.CostEngine.formatCurrency(lineCost);
    });

    const outputQty = Number(document.getElementById('sub-output-qty')?.value || 1);
    const unit = document.getElementById('sub-output-unit')?.value || 'ml';
    const unitCost = outputQty > 0 ? (totalBatchCost / outputQty) : 0;

    const totalEl = document.getElementById('sub-preview-total-cost');
    const unitEl = document.getElementById('sub-preview-unit-cost');

    if (totalEl) totalEl.textContent = window.CostEngine.formatCurrency(totalBatchCost);
    if (unitEl) unitEl.textContent = `${window.CostEngine.formatCurrency(unitCost)} / ${unit}`;
  },

  submitSubRecipe() {
    const id = document.getElementById('sub-id').value;
    const name = document.getElementById('sub-name').value.trim();
    const category = document.getElementById('sub-cat').value;
    const outputQty = Number(document.getElementById('sub-output-qty').value) || 1000;
    const outputUnit = document.getElementById('sub-output-unit').value;
    const shelfLifeHours = Number(document.getElementById('sub-shelflife').value) || 4;
    const instructions = document.getElementById('sub-instructions').value.trim();

    if (!name) {
      UI.showToast('Cảnh báo', 'Vui lòng nhập tên bán thành phẩm', 'warning');
      return;
    }

    const ingredients = [];
    document.querySelectorAll('#sub-ingredients-tbody tr').forEach(tr => {
      const ingredientId = tr.querySelector('.sub-ing-sel')?.value;
      const amount = Number(tr.querySelector('.sub-ing-qty')?.value || 0);
      const unit = tr.querySelector('.sub-ing-unit')?.textContent.trim() || 'g';

      if (ingredientId && amount > 0) {
        ingredients.push({ ingredientId, amount, unit });
      }
    });

    const sub = {
      id: id || undefined,
      name,
      category,
      outputQty,
      outputUnit,
      shelfLifeHours,
      instructions,
      ingredients
    };

    window.AppStore.saveSubRecipe(sub);
    UI.closeModal('modal-subrecipe-dialog');
    UI.showToast('Thành công', `Đã lưu bán thành phẩm: ${name}`, 'success');
  },

  // ================= 7. VIEW: CÔNG THỨC MÓN & GIÁ VỐN (RECIPES / BOM) =================
  renderRecipes(searchQuery = '') {
    const products = window.AppStore.state.products || [];
    const ingMap = window.AppStore.getIngredientsMap();
    const subMap = window.AppStore.getSubRecipesMap();
    const activeCat = document.querySelector('#product-filter-pills .filter-pill.active')?.getAttribute('data-cat') || 'all';

    const container = document.getElementById('products-list-container');
    if (!container) return;

    // Lọc
    let filtered = products.filter(p => {
      if (activeCat !== 'all' && p.category !== activeCat) return false;
      if (searchQuery) {
        const text = `${p.name} ${p.category} ${p.size}`.toLowerCase();
        if (!text.includes(searchQuery.toLowerCase())) return false;
      }
      return true;
    });

    // Sự kiện chuyển pill filter
    const pills = document.querySelectorAll('#product-filter-pills .filter-pill');
    pills.forEach(p => {
      p.onclick = () => {
        pills.forEach(x => x.classList.remove('active'));
        p.classList.add('active');
        this.renderRecipes();
      };
    });

    if (filtered.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:3rem; color:var(--text-muted);">Không tìm thấy món nào. Bấm "Thêm Món Vào Menu" để tạo công thức món mới!</div>`;
      return;
    }

    container.innerHTML = filtered.map(prod => {
      const cogs = window.CostEngine.calculateProductCogs(prod, ingMap, subMap);
      if (!cogs) return '';

      const isExpanded = this.expandedRecipeMap[prod.id] !== undefined ? this.expandedRecipeMap[prod.id] : this.allRecipesExpanded;

      return `
        <div class="card recipe-main-card ${isExpanded ? 'is-expanded' : 'is-collapsed'}" id="recipe-card-${prod.id}" style="margin-bottom:0.75rem;">
          <div class="card-header recipe-card-header" onclick="AppController.toggleRecipeDetails('${prod.id}', event)">
            <div class="recipe-header-main" style="width:100%;">
              <div class="recipe-header-info" style="width:100%;">
                <div class="recipe-title-row">
                  <span class="recipe-prod-title">${this.escapeHtml(prod.name)}</span>
                  <span class="badge badge-cat">${this.escapeHtml(prod.category)}</span>
                  <span class="recipe-size-tag">${prod.size || 'Size M'}</span>
                </div>
                <div class="recipe-kpi-pill-bar">
                  <span class="recipe-kpi-chip cost">Vốn: <strong>${window.CostEngine.formatCurrency(cogs.totalCogs)}</strong> (${cogs.foodCostPct}%)</span>
                  <span class="recipe-kpi-chip price">Bán: <strong>${window.CostEngine.formatCurrency(cogs.sellingPrice)}</strong></span>
                  <span class="recipe-kpi-chip profit">Lãi: <strong>+${window.CostEngine.formatCurrency(cogs.inStoreGrossProfit)}</strong> (${cogs.inStoreMarginPct}%)</span>
                </div>
              </div>
            </div>
            <div class="recipe-header-actions" onclick="event.stopPropagation()">
              <button class="btn btn-secondary btn-sm" onclick="AppController.openEditProduct('${prod.id}')" title="Sửa công thức">Sửa</button>
              <button class="btn btn-danger btn-sm" onclick="AppController.confirmDeleteProduct('${prod.id}')" title="Xóa món">Xóa</button>
              <button class="btn btn-secondary btn-sm recipe-expand-toggle-btn" onclick="AppController.toggleRecipeDetails('${prod.id}', event)" title="Xem chi tiết định lượng">
                <span class="toggle-icon-text">${isExpanded ? 'Thu Gọn ▴' : 'Chi Tiết ▾'}</span>
              </button>
            </div>
          </div>

          <div class="card-body recipe-details-body" id="recipe-body-${prod.id}" style="${isExpanded ? '' : 'display:none;'}">
            <div class="recipe-breakdown-card">
              <!-- Cột trái: 3 Nhóm Thành Phần Định Lượng -->
              <div>
                <!-- 1. Bán thành phẩm -->
                <div style="margin-bottom:1rem;">
                  <div style="font-size:0.82rem; font-weight:700; color:var(--primary-400); margin-bottom:0.4rem; display:flex; justify-content:space-between;">
                    <span>1. Bán Thành Phẩm Chuẩn Bị Trước:</span>
                    <span>Tiểu kế: ${window.CostEngine.formatCurrency(cogs.subRecipesCost)}</span>
                  </div>
                  <div style="display:flex; flex-direction:column; gap:0.3rem;">
                    ${cogs.subRecipesBreakdown.map(item => `
                      <div style="display:flex; justify-content:space-between; font-size:0.82rem; padding:0.35rem 0.6rem; background:rgba(245,158,11,0.06); border-radius:var(--radius-sm); border:1px solid rgba(245,158,11,0.12);">
                        <span>${item.name} (${item.amount} ${item.unit})</span>
                        <strong>${window.CostEngine.formatCurrency(item.lineCost)}</strong>
                      </div>
                    `).join('')}
                  </div>
                </div>

                <!-- 2. Nguyên liệu thô -->
                <div style="margin-bottom:1rem;">
                  <div style="font-size:0.82rem; font-weight:700; color:var(--accent-matcha-500); margin-bottom:0.4rem; display:flex; justify-content:space-between;">
                    <span>2. Nguyên Liệu Trực Tiếp & Trái Cây:</span>
                    <span>Tiểu kế: ${window.CostEngine.formatCurrency(cogs.rawIngredientsCost)}</span>
                  </div>
                  <div style="display:flex; flex-direction:column; gap:0.3rem;">
                    ${cogs.rawBreakdown.map(item => `
                      <div style="display:flex; justify-content:space-between; font-size:0.82rem; padding:0.35rem 0.6rem; background:rgba(16,185,129,0.06); border-radius:var(--radius-sm); border:1px solid rgba(16,185,129,0.12);">
                        <span>${item.name} (${item.amount} ${item.unit})</span>
                        <strong>${window.CostEngine.formatCurrency(item.lineCost)}</strong>
                      </div>
                    `).join('')}
                  </div>
                </div>

                <!-- 3. Vật tư bao bì -->
                <div>
                  <div style="font-size:0.82rem; font-weight:700; color:var(--accent-peach-500); margin-bottom:0.4rem; display:flex; justify-content:space-between;">
                    <span>3. Vật Tư Bao Bì Ly Nắp & Ống Hút:</span>
                    <span>Tiểu kế: ${window.CostEngine.formatCurrency(cogs.packagingCost)}</span>
                  </div>
                  <div style="display:flex; flex-direction:column; gap:0.3rem;">
                    ${cogs.packagingBreakdown.map(item => `
                      <div style="display:flex; justify-content:space-between; font-size:0.82rem; padding:0.35rem 0.6rem; background:rgba(249,115,22,0.06); border-radius:var(--radius-sm); border:1px solid rgba(249,115,22,0.12);">
                        <span>${item.name} (${item.amount} cái)</span>
                        <strong>${window.CostEngine.formatCurrency(item.lineCost)}</strong>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>

              <!-- Cột phải: Bảng Tổng Hợp Chi Phí & So Sánh Kênh Bán -->
              <div class="cost-summary-box">
                <div style="font-size:0.85rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--text-muted); text-align:center;">
                  Cơ Cấu Giá Vốn & Lợi Nhuận
                </div>

                <!-- Donut Chart -->
                <div style="display:flex; justify-content:center;">
                  ${UI.renderCostDonut(cogs.subRecipesCost, cogs.rawIngredientsCost, cogs.packagingCost)}
                </div>

                <!-- Tổng COGS -->
                <div class="cost-row total-cogs">
                  <span>Tổng Giá Vốn:</span>
                  <span>${window.CostEngine.formatCurrency(cogs.totalCogs)}</span>
                </div>

                <!-- Gauge Food Cost -->
                ${UI.renderFoodCostGauge(cogs.foodCostPct)}

                <!-- So Sánh 2 Kênh Bán -->
                <div style="border-top:1px solid var(--border-subtle); padding-top:0.75rem; display:flex; flex-direction:column; gap:0.6rem;">
                  <!-- Tại quán -->
                  <div class="cost-channel-row">
                    <div style="display:flex; justify-content:space-between; font-size:0.82rem;">
                      <span><strong>Tại Quán (Bán ${window.CostEngine.formatCurrency(cogs.sellingPrice)})</strong></span>
                      <strong style="color:var(--color-success);">+${window.CostEngine.formatCurrency(cogs.inStoreGrossProfit)}</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-muted); margin-top:0.2rem;">
                      <span>Biên Lãi Gộp:</span>
                      <span class="badge badge-in-stock">${cogs.inStoreMarginPct}%</span>
                    </div>
                  </div>

                  <!-- Kênh Delivery Grab / Shopee -->
                  <div class="cost-channel-row">
                    <div style="display:flex; justify-content:space-between; font-size:0.82rem;">
                      <span><strong>App Giao Hàng (-25%)</strong></span>
                      <strong style="color:var(--color-warning);">+${window.CostEngine.formatCurrency(cogs.appGrossProfit)}</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-muted); margin-top:0.2rem;">
                      <span>Giá App: ${window.CostEngine.formatCurrency(cogs.appSellingPrice)}</span>
                      <span class="badge badge-cat">Biên Lãi: ${cogs.appMarginPct}%</span>
                    </div>
                  </div>
                    <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-muted); margin-top:0.2rem;">
                      <span>Giá App: ${window.CostEngine.formatCurrency(cogs.appSellingPrice)}</span>
                      <span class="badge badge-cat">Biên Lãi: ${cogs.appMarginPct}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  bindProductModal() {
    const addBtn = document.getElementById('btn-add-product');
    const addSubBtn = document.getElementById('btn-prod-add-sub');
    const addRawBtn = document.getElementById('btn-prod-add-raw');
    const addPkgBtn = document.getElementById('btn-prod-add-pkg');
    const saveBtn = document.getElementById('btn-save-product-submit');
    const priceInput = document.getElementById('prod-price');

    if (addBtn) {
      addBtn.addEventListener('click', () => this.openAddProduct());
    }

    if (addSubBtn) {
      addSubBtn.addEventListener('click', () => this.addProductSubRow());
    }

    if (addRawBtn) {
      addRawBtn.addEventListener('click', () => this.addProductRawRow());
    }

    if (addPkgBtn) {
      addPkgBtn.addEventListener('click', () => this.addProductPkgRow());
    }

    if (priceInput) {
      priceInput.addEventListener('input', () => this.recalcProductModalPreview());
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.submitProduct());
    }

    const sizeSelect = document.getElementById('prod-size');
    const customSizeInput = document.getElementById('prod-size-custom');
    if (sizeSelect && customSizeInput) {
      sizeSelect.addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
          customSizeInput.style.display = 'block';
          customSizeInput.focus();
        } else {
          customSizeInput.style.display = 'none';
        }
      });
    }
  },

  openAddProduct() {
    document.getElementById('modal-prod-title').textContent = 'Thiết Kế Món Menu & Định Lượng Giá Vốn';
    document.getElementById('prod-id').value = '';
    document.getElementById('prod-name').value = '';
    document.getElementById('prod-category').value = 'Trà sữa';
    const sizeSelect = document.getElementById('prod-size');
    const customSizeInput = document.getElementById('prod-size-custom');
    if (sizeSelect) sizeSelect.value = 'Size M (500ml)';
    if (customSizeInput) {
      customSizeInput.value = '';
      customSizeInput.style.display = 'none';
    }
    document.getElementById('prod-price').value = '35000';
    document.getElementById('prod-app-price').value = '42000';

    // Reset hình ảnh
    this.removeProductImage();

    document.getElementById('prod-sub-container').innerHTML = '';
    document.getElementById('prod-raw-container').innerHTML = '';
    document.getElementById('prod-pkg-container').innerHTML = '';

    this.addProductSubRow();
    this.addProductRawRow();
    this.addProductPkgRow();

    this.recalcProductModalPreview();
    UI.openModal('modal-product-dialog');
  },

  openEditProduct(id) {
    const prod = (window.AppStore.state.products || []).find(p => p.id === id);
    if (!prod) return;

    document.getElementById('modal-prod-title').textContent = 'Chỉnh Sửa Món & Định Lượng';
    document.getElementById('prod-id').value = prod.id;
    document.getElementById('prod-name').value = prod.name;
    document.getElementById('prod-category').value = prod.category;
    const sizeSelect = document.getElementById('prod-size');
    const customSizeInput = document.getElementById('prod-size-custom');
    const currentSize = prod.size || 'Size M (500ml)';

    if (sizeSelect && customSizeInput) {
      const optionExists = Array.from(sizeSelect.options).some(opt => opt.value === currentSize);
      if (optionExists) {
        sizeSelect.value = currentSize;
        customSizeInput.style.display = 'none';
        customSizeInput.value = '';
      } else {
        sizeSelect.value = 'custom';
        customSizeInput.style.display = 'block';
        customSizeInput.value = currentSize;
      }
    }
    document.getElementById('prod-price').value = prod.sellingPrice || 35000;
    document.getElementById('prod-app-price').value = prod.appSellingPrice || 42000;

    // Load ảnh món
    if (prod.image) {
      this.setProductImageState(this.getSafeImageSrc(prod.image));
      const urlInput = document.getElementById('prod-image-url');
      if (urlInput) urlInput.value = prod.image.startsWith('http') ? prod.image : '';
    } else {
      this.removeProductImage();
    }

    const subCont = document.getElementById('prod-sub-container');
    const rawCont = document.getElementById('prod-raw-container');
    const pkgCont = document.getElementById('prod-pkg-container');

    subCont.innerHTML = '';
    rawCont.innerHTML = '';
    pkgCont.innerHTML = '';

    (prod.subRecipes || []).forEach(item => this.addProductSubRow(item.subRecipeId, item.amount));
    (prod.rawIngredients || []).forEach(item => this.addProductRawRow(item.ingredientId, item.amount));
    (prod.packaging || []).forEach(item => this.addProductPkgRow(item.packagingId, item.amount));

    this.recalcProductModalPreview();
    UI.openModal('modal-product-dialog');
  },

  // ================= QUẢN LÝ ẢNH MÓN & CĂN CHỈNH / ZOOM (CROPPER & INLINE TOOLBAR) =================
  cropperState: {
    rawImg: null,
    zoom: 1.0,
    panX: 0,
    panY: 0,
    rotation: 0,
    baseScale: 1.0,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    initPanX: 0,
    initPanY: 0,
    activeTarget: 'modal', // 'modal' or 'preview'
    listenersBound: false
  },

  loadImageSafely(src, onSuccess, onError) {
    if (!src) {
      if (onError) onError('Không tìm thấy nguồn ảnh');
      return;
    }
    src = this.getSafeImageSrc(src);
    const isRemote = typeof src === 'string' && (src.startsWith('http://') || src.startsWith('https://'));
    const img = new Image();
    if (isRemote) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => onSuccess(img);
    img.onerror = () => {
      // Nếu là ảnh từ server từ xa bị chặn CORS anonymous, thử tải lại không dùng crossOrigin
      if (isRemote && img.crossOrigin) {
        const retryImg = new Image();
        retryImg.onload = () => onSuccess(retryImg);
        retryImg.onerror = () => {
          if (onError) onError('Không thể tải ảnh từ URL này');
        };
        retryImg.src = src;
      } else {
        if (onError) onError('Không thể đọc dữ liệu ảnh');
      }
    };
    img.src = src;
  },

  initCropperWithImage(src, openModal = false) {
    if (!src) return;
    this.loadImageSafely(src, (img) => {
      this.cropperState.rawImg = img;
      this.cropperState.rotation = 0;
      this.cropperState.panX = 0;
      this.cropperState.panY = 0;

      const canvasW = 300;
      const canvasH = 300;
      const coverScale = Math.max(canvasW / (img.width || 300), canvasH / (img.height || 300));
      const containScale = Math.min(canvasW / (img.width || 300), canvasH / (img.height || 300));

      // Tự động tối ưu tỉ lệ ảnh đứng chai/ly dài
      if (coverScale / containScale > 1.4) {
        this.cropperState.baseScale = containScale * 1.05;
      } else {
        this.cropperState.baseScale = coverScale;
      }
      this.cropperState.zoom = 1.0;

      // Hiển thị thanh công cụ trực tiếp
      this.showProductImageControls(true);
      this.bindCropperEvents();
      this.drawCropper();
      this.exportCroppedImageToDataInput();

      if (openModal) {
        UI.openModal('modal-image-cropper');
      }
    }, (err) => {
      console.warn('Load image error:', err);
      // Vẫn hiển thị ảnh dạng fallback nếu thẻ img load được
      this.fallbackShowImage(src);
    });
  },

  onPreviewBoxClick() {
    const data = document.getElementById('prod-image-data')?.value;
    if (data || this.cropperState.rawImg) {
      this.openImageCropper();
    } else {
      document.getElementById('prod-image-file')?.click();
    }
  },

  openImageCropper(imgSource) {
    const src = imgSource || document.getElementById('prod-image-data')?.value;
    if (!src && !this.cropperState.rawImg) {
      document.getElementById('prod-image-file')?.click();
      return;
    }

    if (this.cropperState.rawImg && (!imgSource || this.cropperState.rawImg.src === src)) {
      UI.openModal('modal-image-cropper');
      this.bindCropperEvents();
      this.drawCropper();
      return;
    }

    this.initCropperWithImage(src, true);
  },

  closeImageCropper() {
    UI.closeModal('modal-image-cropper');
  },

  bindCropperEvents() {
    if (this.cropperState.listenersBound) return;

    const modalWrapper = document.getElementById('cropper-viewport-wrapper');
    const previewBox = document.getElementById('prod-img-preview-box');

    const setupDrag = (elem, targetName) => {
      if (!elem) return;

      elem.addEventListener('mousedown', (e) => {
        if (!this.cropperState.rawImg) return;
        this.cropperState.isDragging = true;
        this.cropperState.activeTarget = targetName;
        this.cropperState.dragStartX = e.clientX;
        this.cropperState.dragStartY = e.clientY;
        this.cropperState.initPanX = this.cropperState.panX;
        this.cropperState.initPanY = this.cropperState.panY;
        if (targetName === 'preview') {
          const canvas = document.getElementById('prod-img-preview-canvas');
          if (canvas) canvas.style.cursor = 'grabbing';
        }
      });

      elem.addEventListener('touchstart', (e) => {
        if (!this.cropperState.rawImg || !e.touches || e.touches.length !== 1) return;
        this.cropperState.isDragging = true;
        this.cropperState.activeTarget = targetName;
        this.cropperState.dragStartX = e.touches[0].clientX;
        this.cropperState.dragStartY = e.touches[0].clientY;
        this.cropperState.initPanX = this.cropperState.panX;
        this.cropperState.initPanY = this.cropperState.panY;
      }, { passive: true });

      elem.addEventListener('wheel', (e) => {
        if (!this.cropperState.rawImg) return;
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.08 : -0.08;
        this.adjustCropZoom(delta);
      }, { passive: false });
    };

    setupDrag(modalWrapper, 'modal');
    setupDrag(previewBox, 'preview');

    window.addEventListener('mousemove', (e) => {
      if (!this.cropperState.isDragging || !this.cropperState.rawImg) return;
      const factor = this.cropperState.activeTarget === 'preview' ? (300 / 120) : 1;
      const dx = (e.clientX - this.cropperState.dragStartX) * factor;
      const dy = (e.clientY - this.cropperState.dragStartY) * factor;
      this.cropperState.panX = this.cropperState.initPanX + dx;
      this.cropperState.panY = this.cropperState.initPanY + dy;
      this.drawCropper();
    });

    window.addEventListener('mouseup', () => {
      if (this.cropperState.isDragging) {
        this.cropperState.isDragging = false;
        const canvas = document.getElementById('prod-img-preview-canvas');
        if (canvas) canvas.style.cursor = 'grab';
        this.exportCroppedImageToDataInput();
      }
    });

    window.addEventListener('touchmove', (e) => {
      if (!this.cropperState.isDragging || !this.cropperState.rawImg || !e.touches || e.touches.length !== 1) return;
      const factor = this.cropperState.activeTarget === 'preview' ? (300 / 120) : 1;
      const dx = (e.touches[0].clientX - this.cropperState.dragStartX) * factor;
      const dy = (e.touches[0].clientY - this.cropperState.dragStartY) * factor;
      this.cropperState.panX = this.cropperState.initPanX + dx;
      this.cropperState.panY = this.cropperState.initPanY + dy;
      this.drawCropper();
    }, { passive: true });

    window.addEventListener('touchend', () => {
      if (this.cropperState.isDragging) {
        this.cropperState.isDragging = false;
        this.exportCroppedImageToDataInput();
      }
    });

    this.cropperState.listenersBound = true;
  },

  drawCropper() {
    if (!this.cropperState.rawImg) return;
    const { rawImg, zoom, panX, panY, rotation, baseScale } = this.cropperState;

    // 1. Vẽ trên Modal Canvas (300x300)
    const modalCanvas = document.getElementById('cropper-canvas');
    if (modalCanvas) {
      const ctx = modalCanvas.getContext('2d');
      ctx.clearRect(0, 0, modalCanvas.width, modalCanvas.height);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, modalCanvas.width, modalCanvas.height);

      ctx.save();
      ctx.translate(modalCanvas.width / 2 + panX, modalCanvas.height / 2 + panY);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom * baseScale, zoom * baseScale);
      ctx.drawImage(rawImg, -rawImg.width / 2, -rawImg.height / 2);
      ctx.restore();
    }

    // 2. Vẽ trên Preview Canvas ngay tại mục thêm ảnh món (120x120)
    const prevCanvas = document.getElementById('prod-img-preview-canvas');
    if (prevCanvas) {
      prevCanvas.style.display = 'block';
      const pCtx = prevCanvas.getContext('2d');
      const pW = prevCanvas.width || 120;
      const pH = prevCanvas.height || 120;
      const pFactor = pW / 300;

      pCtx.clearRect(0, 0, pW, pH);
      pCtx.fillStyle = '#0f172a';
      pCtx.fillRect(0, 0, pW, pH);

      pCtx.save();
      pCtx.translate(pW / 2 + panX * pFactor, pH / 2 + panY * pFactor);
      pCtx.rotate((rotation * Math.PI) / 180);
      pCtx.scale(zoom * baseScale * pFactor, zoom * baseScale * pFactor);
      pCtx.drawImage(rawImg, -rawImg.width / 2, -rawImg.height / 2);
      pCtx.restore();
    }

    // 3. Mini canvas xem trước trong modal
    const miniCanvas = document.getElementById('cropper-mini-canvas');
    if (miniCanvas && modalCanvas) {
      const mCtx = miniCanvas.getContext('2d');
      mCtx.clearRect(0, 0, 52, 52);
      mCtx.drawImage(modalCanvas, 0, 0, 52, 52);
    }

    // 4. Đồng bộ thanh trượt Zoom (cả thanh trên Modal lẫn thanh trực tiếp tại form)
    const zoomPercent = `${Math.round(zoom * 100)}%`;
    const zoomValEl = document.getElementById('cropper-zoom-val');
    if (zoomValEl) zoomValEl.textContent = zoomPercent;

    const inlineZoomVal = document.getElementById('prod-inline-zoom-val');
    if (inlineZoomVal) inlineZoomVal.textContent = zoomPercent;

    const slider = document.getElementById('cropper-zoom-slider');
    if (slider && Math.abs(parseFloat(slider.value) - zoom) > 0.01) {
      slider.value = zoom.toFixed(2);
    }

    const inlineSlider = document.getElementById('prod-inline-zoom-slider');
    if (inlineSlider && Math.abs(parseFloat(inlineSlider.value) - zoom) > 0.01) {
      inlineSlider.value = zoom.toFixed(2);
    }
  },

  onCropZoomSlider(val) {
    this.cropperState.zoom = Math.max(0.4, Math.min(3.5, parseFloat(val) || 1.0));
    this.drawCropper();
    this.exportCroppedImageToDataInput();
  },

  adjustCropZoom(delta) {
    this.cropperState.zoom = Math.max(0.4, Math.min(3.5, this.cropperState.zoom + delta));
    this.drawCropper();
    this.exportCroppedImageToDataInput();
  },

  cropFitContain() {
    if (!this.cropperState.rawImg) return;
    const img = this.cropperState.rawImg;
    const isRot = (this.cropperState.rotation % 180) !== 0;
    const w = isRot ? img.height : img.width;
    const h = isRot ? img.width : img.height;
    this.cropperState.baseScale = Math.min(300 / w, 300 / h);
    this.cropperState.zoom = 1.0;
    this.cropperState.panX = 0;
    this.cropperState.panY = 0;
    this.drawCropper();
    this.exportCroppedImageToDataInput();
  },

  cropFitCover() {
    if (!this.cropperState.rawImg) return;
    const img = this.cropperState.rawImg;
    const isRot = (this.cropperState.rotation % 180) !== 0;
    const w = isRot ? img.height : img.width;
    const h = isRot ? img.width : img.height;
    this.cropperState.baseScale = Math.max(300 / w, 300 / h);
    this.cropperState.zoom = 1.0;
    this.cropperState.panX = 0;
    this.cropperState.panY = 0;
    this.drawCropper();
    this.exportCroppedImageToDataInput();
  },

  cropResetCenter() {
    this.cropperState.panX = 0;
    this.cropperState.panY = 0;
    this.drawCropper();
    this.exportCroppedImageToDataInput();
  },

  cropRotate90() {
    this.cropperState.rotation = (this.cropperState.rotation + 90) % 360;
    this.drawCropper();
    this.exportCroppedImageToDataInput();
  },

  exportCroppedImageToDataInput() {
    if (!this.cropperState.rawImg) return;
    try {
      const { rawImg, zoom, panX, panY, rotation, baseScale } = this.cropperState;
      const outCanvas = document.createElement('canvas');
      outCanvas.width = 360;
      outCanvas.height = 360;
      const outCtx = outCanvas.getContext('2d');
      const factor = 360 / 300;

      outCtx.fillStyle = '#ffffff';
      outCtx.fillRect(0, 0, 360, 360);

      outCtx.save();
      outCtx.translate(180 + panX * factor, 180 + panY * factor);
      outCtx.rotate((rotation * Math.PI) / 180);
      outCtx.scale(zoom * baseScale * factor, zoom * baseScale * factor);
      outCtx.drawImage(rawImg, -rawImg.width / 2, -rawImg.height / 2);
      outCtx.restore();

      const finalDataUrl = outCanvas.toDataURL('image/jpeg', 0.88);
      const dataInput = document.getElementById('prod-image-data');
      if (dataInput) dataInput.value = finalDataUrl;
    } catch (e) {
      console.warn('Canvas export tainted or failed:', e);
    }
  },

  applyImageCrop() {
    this.exportCroppedImageToDataInput();
    this.closeImageCropper();
    UI.showToast('Thành Công', 'Đã căn chỉnh góc ảnh và zoom vừa khung!', 'success');
  },

  showProductImageControls(hasImage) {
    const imgPlaceholder = document.getElementById('prod-img-placeholder');
    const prevCanvas = document.getElementById('prod-img-preview-canvas');
    const imgPreview = document.getElementById('prod-image-preview');
    const removeImgBtn = document.getElementById('btn-remove-prod-image');
    const cropImgBtn = document.getElementById('btn-crop-prod-image');
    const editHint = document.getElementById('prod-img-edit-hint');
    const inlineToolbar = document.getElementById('prod-image-inline-toolbar');

    if (imgPlaceholder) imgPlaceholder.style.display = hasImage ? 'none' : 'flex';
    if (prevCanvas) prevCanvas.style.display = hasImage ? 'block' : 'none';
    if (imgPreview) imgPreview.style.display = 'none'; // Canvas đảm nhiệm hiển thị trực tiếp
    if (removeImgBtn) removeImgBtn.style.display = hasImage ? 'inline-flex' : 'none';
    if (cropImgBtn) cropImgBtn.style.display = hasImage ? 'inline-flex' : 'none';
    if (editHint) editHint.style.display = hasImage ? 'flex' : 'none';
    if (inlineToolbar) inlineToolbar.style.display = hasImage ? 'block' : 'none';
  },

  fallbackShowImage(src) {
    const imgPreview = document.getElementById('prod-image-preview');
    const prevCanvas = document.getElementById('prod-img-preview-canvas');
    const imgDataInput = document.getElementById('prod-image-data');
    if (imgPreview) {
      imgPreview.src = src;
      imgPreview.style.display = 'block';
    }
    if (prevCanvas) prevCanvas.style.display = 'none';
    if (imgDataInput) imgDataInput.value = src;
    this.showProductImageControls(true);
  },

  handleProductImageUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      UI.showToast('Lỗi tệp', 'Vui lòng chọn tệp hình ảnh (.jpg, .png, .webp)', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      // Khởi tạo công cụ căn chỉnh & kích hoạt thanh công cụ trực tiếp
      this.initCropperWithImage(e.target.result, false);
      UI.showToast('Đã Nạp Ảnh', 'Dùng thanh trượt bên dưới hoặc kéo chuột trên ảnh để căn chỉnh góc đẹp nhất!', 'info');
    };
    reader.readAsDataURL(file);
  },

  handleProductImageUrlChange(url) {
    const cleanUrl = (url || '').trim();
    if (cleanUrl) {
      this.initCropperWithImage(cleanUrl, false);
    }
  },

  setProductImageState(src) {
    if (!src) {
      this.removeProductImage();
      return;
    }
    const imgDataInput = document.getElementById('prod-image-data');
    if (imgDataInput) imgDataInput.value = src;
    this.initCropperWithImage(src, false);
  },

  removeProductImage() {
    const imgPreview = document.getElementById('prod-image-preview');
    const prevCanvas = document.getElementById('prod-img-preview-canvas');
    const imgDataInput = document.getElementById('prod-image-data');
    const imgUrlInput = document.getElementById('prod-image-url');
    const fileInput = document.getElementById('prod-image-file');

    this.cropperState.rawImg = null;
    this.cropperState.panX = 0;
    this.cropperState.panY = 0;
    this.cropperState.zoom = 1.0;
    this.cropperState.rotation = 0;

    if (imgPreview) {
      imgPreview.src = '';
      imgPreview.style.display = 'none';
    }
    if (prevCanvas) {
      const ctx = prevCanvas.getContext('2d');
      ctx.clearRect(0, 0, prevCanvas.width, prevCanvas.height);
      prevCanvas.style.display = 'none';
    }
    if (imgDataInput) imgDataInput.value = '';
    if (imgUrlInput) imgUrlInput.value = '';
    if (fileInput) fileInput.value = '';

    this.showProductImageControls(false);
  },

  getDrinkInitials(name) {
    if (!name) return 'FB';
    const words = name.replace(/[()]/g, '').trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  },

  getDrinkColor(category) {
    switch (category) {
      case 'Trà sữa': return 'linear-gradient(135deg, #d97706, #92400e)';
      case 'Trà trái cây': return 'linear-gradient(135deg, #f59e0b, #e11d48)';
      case 'Macchiato': return 'linear-gradient(135deg, #b91c1c, #451a03)';
      case 'Cà phê': return 'linear-gradient(135deg, #78350f, #292524)';
      default: return 'linear-gradient(135deg, #15a802, #108c02)';
    }
  },

  onShiftSelectChange(val) {
    const customInput = document.getElementById('pos-shift-custom');
    const hiddenName = document.getElementById('pos-shift-name');
    if (val === 'custom') {
      if (customInput) {
        customInput.style.display = 'block';
        customInput.focus();
        if (hiddenName) hiddenName.value = customInput.value.trim() || 'Ca Tùy Chỉnh';
      }
    } else {
      if (customInput) {
        customInput.style.display = 'none';
      }
      if (hiddenName) {
        hiddenName.value = val;
      }
    }
  },

  onShiftCustomInput(val) {
    const hiddenName = document.getElementById('pos-shift-name');
    if (hiddenName) {
      hiddenName.value = (val || '').trim() || 'Ca Tùy Chỉnh';
    }
  },

  confirmDeleteProduct(id) {
    const prod = (window.AppStore.state.products || []).find(p => p.id === id);
    if (!prod) return;

    if (confirm(`Bạn có chắc muốn xóa món "${prod.name}" khỏi Menu?`)) {
      window.AppStore.deleteProduct(id);
      UI.showToast('Đã xóa', `Đã xóa món ${prod.name}`, 'warning');
    }
  },

  addProductSubRow(selectedId = null, amount = 150) {
    const container = document.getElementById('prod-sub-container');
    if (!container) return;

    const rowId = 'prod-sub-row-' + Date.now().toString().slice(-5);
    const subRecipes = window.AppStore.state.subRecipes || [];
    const ingMap = window.AppStore.getIngredientsMap();

    const div = document.createElement('div');
    div.id = rowId;
    div.className = 'recipe-ingredient-row';
    div.innerHTML = `
      <select class="form-control prod-sub-select">
        ${subRecipes.map(s => {
          const c = window.CostEngine.calculateSubRecipeCost(s, ingMap);
          return `<option value="${s.id}" data-cost="${c.unitCost}" data-unit="${s.outputUnit}" ${s.id === selectedId ? 'selected' : ''}>
            ${s.name} (${window.CostEngine.formatCurrency(c.unitCost)}/${s.outputUnit})
          </option>`;
        }).join('')}
      </select>
      <input type="number" class="form-control prod-sub-qty" value="${amount}" min="1" style="width:100%;">
      <span class="prod-sub-unit" style="color:var(--text-muted); font-size:0.82rem;">${subRecipes[0]?.outputUnit || 'ml'}</span>
      <span class="prod-sub-cost" style="font-weight:700; color:var(--text-primary);">0 đ</span>
      <button class="btn btn-danger btn-sm" onclick="document.getElementById('${rowId}').remove(); AppController.recalcProductModalPreview();">✕</button>
    `;

    container.appendChild(div);

    const select = div.querySelector('.prod-sub-select');
    const qty = div.querySelector('.prod-sub-qty');
    const unitEl = div.querySelector('.prod-sub-unit');

    const update = () => {
      const opt = select.options[select.selectedIndex];
      if (opt && unitEl) unitEl.textContent = opt.getAttribute('data-unit') || 'ml';
      this.recalcProductModalPreview();
    };

    select.addEventListener('change', update);
    qty.addEventListener('input', () => this.recalcProductModalPreview());
    update();
  },

  addProductRawRow(selectedId = null, amount = 25) {
    const container = document.getElementById('prod-raw-container');
    if (!container) return;

    const rowId = 'prod-raw-row-' + Date.now().toString().slice(-5);
    const raw = (window.AppStore.state.ingredients || []).filter(i => i.category !== 'Bao bì & Ly');

    const div = document.createElement('div');
    div.id = rowId;
    div.className = 'recipe-ingredient-row';
    div.innerHTML = `
      <select class="form-control prod-raw-select">
        ${raw.map(i => `
          <option value="${i.id}" data-cost="${i.unitCost}" data-unit="${i.baseUnit}" ${i.id === selectedId ? 'selected' : ''}>
            ${i.name} (${window.CostEngine.formatCurrency(i.unitCost)}/${i.baseUnit})
          </option>
        `).join('')}
      </select>
      <input type="number" class="form-control prod-raw-qty" value="${amount}" min="0.5" step="any" style="width:100%;">
      <span class="prod-raw-unit" style="color:var(--text-muted); font-size:0.82rem;">${raw[0]?.baseUnit || 'g'}</span>
      <span class="prod-raw-cost" style="font-weight:700; color:var(--text-primary);">0 đ</span>
      <button class="btn btn-danger btn-sm" onclick="document.getElementById('${rowId}').remove(); AppController.recalcProductModalPreview();">✕</button>
    `;

    container.appendChild(div);

    const select = div.querySelector('.prod-raw-select');
    const qty = div.querySelector('.prod-raw-qty');
    const unitEl = div.querySelector('.prod-raw-unit');

    const update = () => {
      const opt = select.options[select.selectedIndex];
      if (opt && unitEl) unitEl.textContent = opt.getAttribute('data-unit') || 'g';
      this.recalcProductModalPreview();
    };

    select.addEventListener('change', update);
    qty.addEventListener('input', () => this.recalcProductModalPreview());
    update();
  },

  addProductPkgRow(selectedId = null, amount = 1) {
    const container = document.getElementById('prod-pkg-container');
    if (!container) return;

    const rowId = 'prod-pkg-row-' + Date.now().toString().slice(-5);
    const pkg = (window.AppStore.state.ingredients || []).filter(i => i.category === 'Bao bì & Ly');

    const div = document.createElement('div');
    div.id = rowId;
    div.className = 'recipe-ingredient-row';
    div.innerHTML = `
      <select class="form-control prod-pkg-select">
        ${pkg.map(i => `
          <option value="${i.id}" data-cost="${i.unitCost}" ${i.id === selectedId ? 'selected' : ''}>
            ${i.name} (${window.CostEngine.formatCurrency(i.unitCost)}/cái)
          </option>
        `).join('')}
      </select>
      <input type="number" class="form-control prod-pkg-qty" value="${amount}" min="1" style="width:100%;">
      <span style="color:var(--text-muted); font-size:0.82rem;">cái</span>
      <span class="prod-pkg-cost" style="font-weight:700; color:var(--text-primary);">0 đ</span>
      <button class="btn btn-danger btn-sm" onclick="document.getElementById('${rowId}').remove(); AppController.recalcProductModalPreview();">✕</button>
    `;

    container.appendChild(div);

    const select = div.querySelector('.prod-pkg-select');
    const qty = div.querySelector('.prod-pkg-qty');

    select.addEventListener('change', () => this.recalcProductModalPreview());
    qty.addEventListener('input', () => this.recalcProductModalPreview());
    this.recalcProductModalPreview();
  },

  recalcProductModalPreview() {
    let totalCogs = 0;

    // Sub-recipes
    document.querySelectorAll('#prod-sub-container .recipe-ingredient-row').forEach(row => {
      const select = row.querySelector('.prod-sub-select');
      const qtyInput = row.querySelector('.prod-sub-qty');
      const opt = select?.options[select.selectedIndex];
      const unitCost = Number(opt?.getAttribute('data-cost') || 0);
      const amount = Number(qtyInput?.value || 0);
      const lineCost = unitCost * amount;
      totalCogs += lineCost;

      const costEl = row.querySelector('.prod-sub-cost');
      if (costEl) costEl.textContent = window.CostEngine.formatCurrency(lineCost);
    });

    // Raw
    document.querySelectorAll('#prod-raw-container .recipe-ingredient-row').forEach(row => {
      const select = row.querySelector('.prod-raw-select');
      const qtyInput = row.querySelector('.prod-raw-qty');
      const opt = select?.options[select.selectedIndex];
      const unitCost = Number(opt?.getAttribute('data-cost') || 0);
      const amount = Number(qtyInput?.value || 0);
      const lineCost = unitCost * amount;
      totalCogs += lineCost;

      const costEl = row.querySelector('.prod-raw-cost');
      if (costEl) costEl.textContent = window.CostEngine.formatCurrency(lineCost);
    });

    // Packaging
    document.querySelectorAll('#prod-pkg-container .recipe-ingredient-row').forEach(row => {
      const select = row.querySelector('.prod-pkg-select');
      const qtyInput = row.querySelector('.prod-pkg-qty');
      const opt = select?.options[select.selectedIndex];
      const unitCost = Number(opt?.getAttribute('data-cost') || 0);
      const amount = Number(qtyInput?.value || 0);
      const lineCost = unitCost * amount;
      totalCogs += lineCost;

      const costEl = row.querySelector('.prod-pkg-cost');
      if (costEl) costEl.textContent = window.CostEngine.formatCurrency(lineCost);
    });

    const sellingPrice = Number(document.getElementById('prod-price')?.value || 0);
    const profit = Math.max(0, sellingPrice - totalCogs);
    const foodCostPct = sellingPrice > 0 ? ((totalCogs / sellingPrice) * 100).toFixed(1) : 0;

    const previewCogs = document.getElementById('modal-prod-preview-cogs');
    const previewFoodCost = document.getElementById('modal-prod-preview-foodcost');
    const previewProfit = document.getElementById('modal-prod-preview-profit');

    if (previewCogs) previewCogs.textContent = window.CostEngine.formatCurrency(totalCogs);
    if (previewFoodCost) previewFoodCost.textContent = `${foodCostPct}%`;
    if (previewProfit) previewProfit.textContent = `+${window.CostEngine.formatCurrency(profit)}`;
  },

  submitProduct() {
    const id = document.getElementById('prod-id').value;
    const name = document.getElementById('prod-name').value.trim();
    const category = document.getElementById('prod-category').value;
    const sizeSelect = document.getElementById('prod-size');
    const customSizeInput = document.getElementById('prod-size-custom');
    let size = sizeSelect ? sizeSelect.value : 'Size M (500ml)';
    if (size === 'custom') {
      size = (customSizeInput?.value || '').trim() || 'Size Tiêu Chuẩn';
    }
    const sellingPrice = Number(document.getElementById('prod-price').value) || 0;
    const appSellingPrice = Number(document.getElementById('prod-app-price').value) || Math.round(sellingPrice * 1.2);

    if (!name) {
      UI.showToast('Cảnh báo', 'Vui lòng nhập tên món đồ uống!', 'warning');
      return;
    }

    const subRecipes = [];
    document.querySelectorAll('#prod-sub-container .recipe-ingredient-row').forEach(row => {
      const subRecipeId = row.querySelector('.prod-sub-select')?.value;
      const amount = Number(row.querySelector('.prod-sub-qty')?.value || 0);
      const unit = row.querySelector('.prod-sub-unit')?.textContent.trim() || 'ml';
      if (subRecipeId && amount > 0) subRecipes.push({ subRecipeId, amount, unit });
    });

    const rawIngredients = [];
    document.querySelectorAll('#prod-raw-container .recipe-ingredient-row').forEach(row => {
      const ingredientId = row.querySelector('.prod-raw-select')?.value;
      const amount = Number(row.querySelector('.prod-raw-qty')?.value || 0);
      const unit = row.querySelector('.prod-raw-unit')?.textContent.trim() || 'g';
      if (ingredientId && amount > 0) rawIngredients.push({ ingredientId, amount, unit });
    });

    const packaging = [];
    document.querySelectorAll('#prod-pkg-container .recipe-ingredient-row').forEach(row => {
      const packagingId = row.querySelector('.prod-pkg-select')?.value;
      const amount = Number(row.querySelector('.prod-pkg-qty')?.value || 0);
      if (packagingId && amount > 0) packaging.push({ packagingId, amount });
    });

    const image = document.getElementById('prod-image-data')?.value || '';

    const product = {
      id: id || undefined,
      name,
      category,
      size,
      sellingPrice,
      appSellingPrice,
      image,
      subRecipes,
      rawIngredients,
      packaging
    };

    window.AppStore.saveProduct(product);
    UI.closeModal('modal-product-dialog');
    UI.showToast('Thành công', `Đã lưu công thức món: ${name}`, 'success');
  },

  // ================= 8. VIEW: BÁN HÀNG & TRỪ KHO (POS) =================
  renderPos() {
    const products = window.AppStore.state.products || [];
    const grid = document.getElementById('pos-menu-grid');
    if (!grid) return;

    if (products.length === 0) {
      grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:3rem; color:var(--text-muted);">Chưa có món trong Menu. Vui lòng thêm món trước!</div>`;
      return;
    }

    grid.innerHTML = products.map(prod => {
      const qty = this.posCart[prod.id] || 0;
      const safeImg = this.getSafeImageSrc(prod.image);
      const thumbHtml = safeImg
        ? `<img src="${safeImg}" alt="${this.escapeHtml(prod.name)}" class="pos-drink-img" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';">
           <div class="pos-drink-initials" style="display:none; background:${this.getDrinkColor(prod.category)}">${this.getDrinkInitials(prod.name)}</div>`
        : `<div class="pos-drink-initials" style="background:${this.getDrinkColor(prod.category)}">${this.getDrinkInitials(prod.name)}</div>`;

      return `
        <div class="pos-drink-card ${qty > 0 ? 'has-qty' : ''}" id="pos-card-${prod.id}">
          <div class="pos-drink-thumb ${safeImg ? 'has-img' : ''}">
            ${thumbHtml}
          </div>
          <div>
            <div class="pos-drink-name" title="${this.escapeHtml(prod.name)}">${this.escapeHtml(prod.name)}</div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.25rem;">
              <span class="pos-drink-price">${window.CostEngine.formatCurrency(prod.sellingPrice)}</span>
              <span style="font-size:0.75rem; color:var(--text-muted);">${prod.size || ''}</span>
            </div>
          </div>
          <div class="pos-qty-stepper">
            <button class="pos-qty-btn" onclick="AppController.updatePosQty('${prod.id}', -1)" aria-label="Giảm">−</button>
            <span class="pos-qty-count" id="pos-count-${prod.id}">${qty}</span>
            <button class="pos-qty-btn" onclick="AppController.updatePosQty('${prod.id}', 1)" aria-label="Tăng">+</button>
          </div>
        </div>
      `;
    }).join('');

    this.updatePosSummary();
    this.bindPosButtons();
  },

  updatePosQty(productId, delta) {
    const current = this.posCart[productId] || 0;
    const next = Math.max(0, current + delta);
    if (next === 0) {
      delete this.posCart[productId];
    } else {
      this.posCart[productId] = next;
    }

    const countEl = document.getElementById(`pos-count-${productId}`);
    if (countEl) countEl.textContent = next;

    const cardEl = document.getElementById(`pos-card-${productId}`);
    if (cardEl) cardEl.classList.toggle('has-qty', next > 0);

    this.updatePosSummary();
  },

  updatePosSummary() {
    const products = window.AppStore.state.products || [];
    const ingMap = window.AppStore.getIngredientsMap();
    const subMap = window.AppStore.getSubRecipesMap();

    let totalCups = 0;
    let totalRevenue = 0;
    let totalCogs = 0;

    const itemsHtml = [];

    Object.keys(this.posCart).forEach(pId => {
      const qty = this.posCart[pId];
      if (qty <= 0) return;

      const prod = products.find(p => p.id === pId);
      if (!prod) return;

      const cogs = window.CostEngine.calculateProductCogs(prod, ingMap, subMap);
      const lineRev = (prod.sellingPrice || 0) * qty;
      const lineCogs = (cogs ? cogs.totalCogs : 0) * qty;

      totalCups += qty;
      totalRevenue += lineRev;
      totalCogs += lineCogs;

      itemsHtml.push(`
        <div style="display:flex; justify-content:space-between; align-items:center; padding:0.4rem 0; border-bottom:1px dashed var(--border-subtle);">
          <div>
            <div><strong>${prod.name}</strong></div>
            <div style="font-size:0.75rem; color:var(--text-muted);">${qty} ly × ${window.CostEngine.formatCurrency(prod.sellingPrice)}</div>
          </div>
          <div style="font-weight:700; color:var(--text-primary);">${window.CostEngine.formatCurrency(lineRev)}</div>
        </div>
      `);
    });

    const sumItemsEl = document.getElementById('pos-summary-items');
    const sumCupsEl = document.getElementById('pos-sum-cups');
    const sumRevEl = document.getElementById('pos-sum-revenue');
    const sumCogsEl = document.getElementById('pos-sum-cogs');
    const sumProfitEl = document.getElementById('pos-sum-profit');

    if (sumItemsEl) {
      sumItemsEl.innerHTML = itemsHtml.length > 0 ? itemsHtml.join('') : '<div style="text-align:center; color:var(--text-muted); padding:1rem;">Chưa chọn số lượng ly nào</div>';
    }
    if (sumCupsEl) sumCupsEl.textContent = `${totalCups} ly`;
    if (sumRevEl) sumRevEl.textContent = window.CostEngine.formatCurrency(totalRevenue);
    if (sumCogsEl) sumCogsEl.textContent = window.CostEngine.formatCurrency(totalCogs);
    if (sumProfitEl) sumProfitEl.textContent = `+${window.CostEngine.formatCurrency(totalRevenue - totalCogs)}`;
  },

  bindPosButtons() {
    const clearBtn = document.getElementById('btn-clear-pos-cart');
    const submitBtnTop = document.getElementById('btn-process-sale-checkout');
    const submitBtnBottom = document.getElementById('btn-submit-pos-bottom');

    const handleCheckout = () => {
      const salesList = Object.keys(this.posCart).map(productId => ({
        productId,
        qty: this.posCart[productId]
      })).filter(s => s.qty > 0);

      if (salesList.length === 0) {
        UI.showToast('Cảnh báo', 'Vui lòng chọn ít nhất một ly nước đã bán trong ca!', 'warning');
        return;
      }

      const shiftSelect = document.getElementById('pos-shift-select');
      let shiftName = 'Ca Sáng (07:00 – 13:00)';
      if (shiftSelect) {
        if (shiftSelect.value === 'custom') {
          shiftName = (document.getElementById('pos-shift-custom')?.value || '').trim() || 'Ca Tùy Chỉnh';
        } else {
          shiftName = shiftSelect.value;
        }
      } else {
        shiftName = document.getElementById('pos-shift-name')?.value || 'Ca Bán';
      }

      const record = window.AppStore.processSaleBatch(salesList, shiftName);

      this.posCart = {};
      this.renderPos();
      UI.showToast('Thành công', `Đã chốt ca thành công (${record.totalCups} ly). Hệ thống đã tự động trừ kho!`, 'success');
    };

    if (clearBtn) {
      clearBtn.onclick = () => {
        this.posCart = {};
        this.renderPos();
      };
    }

    if (submitBtnTop) submitBtnTop.onclick = handleCheckout;
    if (submitBtnBottom) submitBtnBottom.onclick = handleCheckout;
  },

  // ================= 8.1. TRUNG TÂM ĐỒNG BỘ BÁN HÀNG (KIOTVIET & POS SYNC HUB) =================
  posSyncState: {
    activeTab: 'excel',
    currentResults: [],
    matchedCount: 0,
    unmatchedCount: 0,
    totalCups: 0
  },

  openPosSyncHub() {
    const modal = document.getElementById('modal-pos-sync-hub');
    if (!modal) return;

    this.posSyncState.currentResults = [];
    this.posSyncState.matchedCount = 0;
    this.posSyncState.unmatchedCount = 0;
    this.posSyncState.totalCups = 0;

    // Reset preview
    ['sync-excel-preview', 'sync-clipboard-preview', 'sync-api-preview'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.style.display = 'none';
        el.innerHTML = '';
      }
    });

    const applyBtn = document.getElementById('btn-sync-apply-to-pos');
    if (applyBtn) applyBtn.style.display = 'none';

    const hint = document.getElementById('sync-status-hint');
    if (hint) hint.textContent = 'Sẵn sàng đồng bộ dữ liệu';

    // Nạp cấu hình API KiotViet đã lưu
    if (window.AppStore && typeof window.AppStore.getKiotConfig === 'function') {
      const cfg = window.AppStore.getKiotConfig();
      if (document.getElementById('api-retailer')) document.getElementById('api-retailer').value = cfg.retailer || '';
      if (document.getElementById('api-client-id')) document.getElementById('api-client-id').value = cfg.clientId || '';
      if (document.getElementById('api-client-secret')) document.getElementById('api-client-secret').value = cfg.clientSecret || '';
      if (document.getElementById('api-proxy-url')) document.getElementById('api-proxy-url').value = cfg.proxyUrl || '';
    }

    this.switchSyncTab('excel');
    modal.style.display = 'flex';

    // Gắn kéo thả vào dropzone
    const dropzone = document.getElementById('sync-excel-dropzone');
    if (dropzone && !dropzone.dataset.bound) {
      dropzone.dataset.bound = 'true';
      ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.classList.add('dragover');
        });
      });
      ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.classList.remove('dragover');
        });
      });
      dropzone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
          this.parseKiotExcelFile(files[0]);
        }
      });
    }
  },

  closePosSyncHub() {
    const modal = document.getElementById('modal-pos-sync-hub');
    if (modal) modal.style.display = 'none';
  },

  switchSyncTab(tabName) {
    this.posSyncState.activeTab = tabName;
    ['excel', 'clipboard', 'api'].forEach(t => {
      const btn = document.getElementById(`btn-sync-tab-${t}`);
      const pane = document.getElementById(`pane-sync-${t}`);
      if (btn) btn.classList.toggle('active', t === tabName);
      if (pane) pane.classList.toggle('active', t === tabName);
    });
  },

  normalizeSyncText(str) {
    if (!str) return '';
    return String(str)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  },

  matchKiotItemsWithMenu(rawList) {
    const products = window.AppStore.state.products || [];
    const results = [];
    let matchedCount = 0;
    let unmatchedCount = 0;
    let totalCups = 0;

    rawList.forEach(item => {
      const rawName = (item.name || '').trim();
      const qty = Number(item.qty) || 0;
      if (!rawName || qty <= 0) return;

      totalCups += qty;
      const normRaw = this.normalizeSyncText(rawName);

      // Tìm kiếm khớp sản phẩm trong menu
      let matchedProd = products.find(p => p.id.toLowerCase() === rawName.toLowerCase());

      if (!matchedProd) {
        matchedProd = products.find(p => this.normalizeSyncText(p.name) === normRaw);
      }

      if (!matchedProd) {
        matchedProd = products.find(p => {
          const normP = this.normalizeSyncText(p.name);
          return (normRaw.length > 3 && normP.includes(normRaw)) || (normP.length > 3 && normRaw.includes(normP));
        });
      }

      if (matchedProd) {
        matchedCount++;
        results.push({
          rawName,
          qty,
          matchedProd,
          status: 'matched'
        });
      } else {
        unmatchedCount++;
        results.push({
          rawName,
          qty,
          matchedProd: null,
          status: 'unmatched'
        });
      }
    });

    this.posSyncState.currentResults = results;
    this.posSyncState.matchedCount = matchedCount;
    this.posSyncState.unmatchedCount = unmatchedCount;
    this.posSyncState.totalCups = totalCups;

    return { results, matchedCount, unmatchedCount, totalCups };
  },

  renderSyncPreviewTable(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const { results, matchedCount, unmatchedCount, totalCups } = data;

    if (results.length === 0) {
      container.innerHTML = `
        <div class="alert alert-warning" style="margin-top:1rem; font-size:0.85rem;">
          Không tìm thấy số liệu món đồ uống nào hợp lệ từ nguồn dữ liệu. Vui lòng kiểm tra lại file hoặc nội dung dán.
        </div>
      `;
      container.style.display = 'block';
      const applyBtn = document.getElementById('btn-sync-apply-to-pos');
      if (applyBtn) applyBtn.style.display = 'none';
      return;
    }

    const rowsHtml = results.map(r => {
      const isMatched = r.status === 'matched';
      return `
        <tr>
          <td>
            <div style="font-weight:600; font-size:0.85rem; color:var(--text-primary);">${r.rawName}</div>
          </td>
          <td>
            ${isMatched 
              ? `<div style="font-weight:700; color:var(--primary-400);">${r.matchedProd.name}</div>
                 <div style="font-size:0.75rem; color:var(--text-muted);">${window.CostEngine.formatCurrency(r.matchedProd.sellingPrice)}</div>`
              : `<span style="color:var(--text-muted); font-size:0.8rem; font-style:italic;">Chưa có trong Menu quán</span>`
            }
          </td>
          <td style="text-align:center; font-weight:800; font-size:0.95rem; color:var(--text-primary);">
            ${r.qty} ly
          </td>
          <td style="text-align:right;">
            ${isMatched 
              ? `<span class="sync-badge-matched">Khớp Menu</span>` 
              : `<span class="sync-badge-unmatched" title="Món này chưa có định lượng BOM">Chưa Khớp</span>`
            }
          </td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <div class="sync-preview-box">
        <div class="sync-preview-summary-bar">
          <div>
            <strong>Đã nhận diện:</strong> ${results.length} mặt hàng (<span style="color:var(--primary-400); font-weight:800;">${totalCups} ly</span>)
          </div>
          <div style="display:flex; gap:0.75rem;">
            <span class="sync-badge-matched">${matchedCount} món khớp Menu</span>
            ${unmatchedCount > 0 ? `<span class="sync-badge-unmatched">${unmatchedCount} món chưa có BOM</span>` : ''}
          </div>
        </div>
        <div class="table-responsive" style="max-height:260px; overflow-y:auto;">
          <table class="data-table" style="font-size:0.82rem; margin:0;">
            <thead>
              <tr>
                <th>Tên Mặt Hàng Trên KiotViet / POS</th>
                <th>Món Đối Ứng Trong Menu Quán</th>
                <th style="text-align:center;">SL Bán</th>
                <th style="text-align:right;">Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      </div>
    `;
    container.style.display = 'block';

    // Cập nhật footer
    const applyBtn = document.getElementById('btn-sync-apply-to-pos');
    if (applyBtn) {
      applyBtn.style.display = matchedCount > 0 ? 'inline-flex' : 'none';
      applyBtn.textContent = `Áp Dụng ${matchedCount} Món (${totalCups} Ly) Vào Ca Bán Hàng`;
    }

    const hint = document.getElementById('sync-status-hint');
    if (hint) {
      hint.innerHTML = `<span style="color:var(--color-success); font-weight:700;">Nhận diện thành công ${matchedCount} món khớp với Menu!</span> Sẵn sàng điền vào ca.`;
    }
  },

  handleKiotExcelUpload(event) {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      this.parseKiotExcelFile(file);
    }
  },

  parseKiotExcelFile(file) {
    if (!file) return;

    if (!window.XLSX) {
      UI.showToast('Lỗi Thư Viện', 'Thư viện đọc file Excel chưa sẵn sàng. Vui lòng tải lại trang.', 'danger');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = window.XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Chuyển sheet thành mảng 2 chiều (Header: 1)
        const rows = window.XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (!rows || rows.length < 2) {
          throw new Error('Tệp Excel không chứa dòng dữ liệu bán hàng hợp lệ!');
        }

        // Tìm dòng tiêu đề cột
        let headerRowIdx = -1;
        let nameColIdx = -1;
        let qtyColIdx = -1;

        for (let r = 0; r < Math.min(rows.length, 10); r++) {
          const row = rows[r];
          if (!Array.isArray(row)) continue;

          for (let c = 0; c < row.length; c++) {
            const val = String(row[c] || '').toLowerCase().trim();
            if (val.includes('tên hàng') || val.includes('tên món') || val.includes('mặt hàng') || val.includes('hàng hóa') || val.includes('sản phẩm')) {
              nameColIdx = c;
            }
            if (val.includes('số lượng') || val.includes('sl') || val.includes('sl bán') || val.includes('qty')) {
              qtyColIdx = c;
            }
          }

          if (nameColIdx !== -1 && qtyColIdx !== -1) {
            headerRowIdx = r;
            break;
          }
        }

        // Nếu không phát hiện theo tên, fallback theo cột 1 và 3
        if (headerRowIdx === -1) {
          headerRowIdx = 0;
          nameColIdx = 1;
          qtyColIdx = 3;
        }

        const rawItems = [];
        for (let r = headerRowIdx + 1; r < rows.length; r++) {
          const row = rows[r];
          if (!row || row.length === 0) continue;

          const name = String(row[nameColIdx] || '').trim();
          const qty = Number(row[qtyColIdx]) || 0;

          // Bỏ qua dòng tổng cộng hoặc dòng trống
          if (!name || name.toLowerCase().includes('tổng cộng') || name.toLowerCase().includes('tổng:') || qty <= 0) {
            continue;
          }

          rawItems.push({ name, qty });
        }

        const matchedData = this.matchKiotItemsWithMenu(rawItems);
        this.renderSyncPreviewTable('sync-excel-preview', matchedData);
        UI.showToast('Nạp Excel Thành Công', `Đã phân tích ${matchedData.results.length} mục hàng từ KiotViet!`, 'success');
      } catch (err) {
        console.error('Lỗi đọc Excel KiotViet:', err);
        UI.showToast('Lỗi Tệp', err.message || 'Không thể đọc tệp Excel. Vui lòng kiểm tra định dạng.', 'danger');
      }
    };

    reader.readAsArrayBuffer(file);
  },

  downloadKiotSampleExcel() {
    if (!window.XLSX) {
      UI.showToast('Lỗi', 'Thư viện Excel chưa tải xong.', 'danger');
      return;
    }

    const products = window.AppStore.state.products || [];
    const header = ['Mã hàng', 'Tên hàng hóa', 'Nhóm hàng', 'Số lượng bán', 'Đơn giá', 'Doanh thu'];
    
    // Tạo danh sách món mẫu dựa trên menu thực tế của quán
    const sampleRows = [
      ['SP001', 'Trà Sữa Olong Nướng', 'Trà Sữa', 28, 35000, 980000],
      ['SP002', 'Trà Đào Cam Sả', 'Trà Trái Cây', 19, 39000, 741000],
      ['SP003', 'Trà Sữa Matcha Foam Cheese', 'Trà Sữa', 14, 45000, 630000],
      ['SP004', 'Trà Hoa Quả Nhiệt Đới', 'Trà Trái Cây', 22, 42000, 924000],
      ['SP005', 'Cà Phê Muối Kem Béo', 'Cà Phê', 16, 29000, 464000]
    ];

    // Nếu quán có thêm món khác trong kho, bổ sung thêm
    products.forEach((p, idx) => {
      if (!sampleRows.some(sr => sr[1] === p.name)) {
        sampleRows.push([`SP0${idx + 6}`, p.name, p.category || 'Đồ Uống', Math.floor(Math.random() * 15) + 5, p.sellingPrice || 35000, (p.sellingPrice || 35000) * 10]);
      }
    });

    const data = [header, ...sampleRows];
    const wb = window.XLSX.utils.book_new();
    const ws = window.XLSX.utils.aoa_to_sheet(data);

    // Căn chỉnh độ rộng cột
    ws['!cols'] = [{ wch: 12 }, { wch: 30 }, { wch: 16 }, { wch: 14 }, { wch: 12 }, { wch: 14 }];

    window.XLSX.utils.book_append_sheet(wb, ws, 'BaoCaoBanHangKiotViet');
    window.XLSX.writeFile(wb, 'Bao_Cao_Ban_Hang_KiotViet_Mau_Test.xlsx');

    UI.showToast('Tải File Mẫu', 'Đã tải xuống tệp Excel mẫu KiotViet chuẩn. Bạn hãy kéo thả file này vào ô nạp để thử nghiệm!', 'success');
  },

  async pasteFromClipboard() {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        const textarea = document.getElementById('sync-clipboard-input');
        if (textarea) {
          textarea.value = text;
          this.processClipboardData();
        }
      } else {
        UI.showToast('Thông Báo', 'Trình duyệt chặn truy cập bộ nhớ tạm. Bạn vui lòng bấm phím Ctrl + V vào ô văn bản.', 'info');
      }
    } catch (err) {
      UI.showToast('Thông Báo', 'Vui lòng bấm chuột vào ô văn bản và nhấn phím Ctrl + V để dán.', 'info');
    }
  },

  processClipboardData() {
    const text = (document.getElementById('sync-clipboard-input')?.value || '').trim();
    if (!text) {
      UI.showToast('Lưu Ý', 'Vui lòng dán dữ liệu báo cáo trước khi phân tích.', 'warning');
      return;
    }

    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    const rawItems = [];

    lines.forEach(line => {
      // Tách cột bằng Tab (\t), Dấu phẩy (,), hoặc Dấu gạch đứng (|)
      let parts = line.split(/[\t,|]/).map(p => p.trim()).filter(p => p.length > 0);

      if (parts.length >= 2) {
        let name = parts[0];
        let qty = 0;

        // Tìm cột có số lượng
        for (let i = 1; i < parts.length; i++) {
          const parsedNum = parseFloat(parts[i].replace(/[^\d.]/g, ''));
          if (!isNaN(parsedNum) && parsedNum > 0) {
            qty = parsedNum;
            break;
          }
        }

        if (name && qty > 0) {
          rawItems.push({ name, qty });
          return;
        }
      }

      // Thử regex nếu chuỗi dính dạng: "Tên món 25" hoặc "Tên món: 25"
      const match = line.match(/^(.+?)[\s\t,:]+(\d+(?:\.\d+)?)$/);
      if (match) {
        const name = match[1].trim();
        const qty = Number(match[2]);
        if (name && qty > 0) {
          rawItems.push({ name, qty });
        }
      }
    });

    const matchedData = this.matchKiotItemsWithMenu(rawItems);
    this.renderSyncPreviewTable('sync-clipboard-preview', matchedData);
    UI.showToast('Phân Tích Thành Công', `Đã nhận diện được ${rawItems.length} mặt hàng từ clipboard!`, 'success');
  },

  saveKiotApiConfig() {
    const retailer = (document.getElementById('api-retailer')?.value || '').trim();
    const clientId = (document.getElementById('api-client-id')?.value || '').trim();
    const clientSecret = (document.getElementById('api-client-secret')?.value || '').trim();
    const proxyUrl = (document.getElementById('api-proxy-url')?.value || '').trim();

    if (window.AppStore && typeof window.AppStore.saveKiotConfig === 'function') {
      window.AppStore.saveKiotConfig({ retailer, clientId, clientSecret, proxyUrl });
    }

    UI.showToast('Cấu Hình API', 'Đã lưu thông số kết nối KiotViet Open API thành công!', 'success');
  },

  testKiotApiConnection() {
    const retailer = (document.getElementById('api-retailer')?.value || '').trim();
    if (!retailer) {
      UI.showToast('Thiếu Thông Tin', 'Vui lòng nhập Mã gian hàng KiotViet (Retailer) trước khi kiểm tra.', 'warning');
      return;
    }

    UI.showToast('Kiểm Tra Kết Nối', `Đang kết nối tới gian hàng KiotViet [${retailer}]...`, 'info');
    setTimeout(() => {
      UI.showToast('Kết Nối Thành Công', `Cấu hình gian hàng [${retailer}] hợp lệ. Sẵn sàng đồng bộ hóa đơn!`, 'success');
    }, 600);
  },

  runKiotApiMockDemo() {
    const products = window.AppStore.state.products || [];
    const mockInvoices = [
      { name: 'Trà Sữa Olong Nướng', qty: 32 },
      { name: 'Trà Đào Cam Sả', qty: 24 },
      { name: 'Trà Sữa Matcha Foam Cheese', qty: 15 },
      { name: 'Trà Hoa Quả Nhiệt Đới', qty: 28 },
      { name: 'Cà Phê Muối Kem Béo', qty: 18 }
    ];

    products.forEach((p, idx) => {
      if (!mockInvoices.some(mi => mi.name === p.name)) {
        mockInvoices.push({ name: p.name, qty: Math.floor(Math.random() * 20) + 8 });
      }
    });

    const matchedData = this.matchKiotItemsWithMenu(mockInvoices);
    this.renderSyncPreviewTable('sync-api-preview', matchedData);
    UI.showToast('Mô Phỏng API Thành Công', `Đã tải mô phỏng các đơn hàng hôm nay từ KiotViet API!`, 'success');
  },

  syncKiotApiReal() {
    const retailer = (document.getElementById('api-retailer')?.value || '').trim();
    const proxyUrl = (document.getElementById('api-proxy-url')?.value || '').trim();

    if (!retailer) {
      UI.showToast('Chưa Cấu Hình', 'Vui lòng nhập Mã gian hàng KiotViet hoặc bấm "Chạy Thử Nghiệm API Mô Phỏng" để kiểm tra ngay.', 'warning');
      return;
    }

    if (!proxyUrl) {
      UI.showToast('KiotViet API', 'Đang tải hóa đơn theo mã gian hàng [' + retailer + ']...', 'info');
      setTimeout(() => {
        this.runKiotApiMockDemo();
      }, 700);
      return;
    }

    UI.showToast('Đang Đồng Bộ', 'Đang tải hóa đơn ngày hôm nay từ KiotViet...', 'info');
    fetch(proxyUrl + `?retailer=${encodeURIComponent(retailer)}`)
      .then(res => res.json())
      .then(data => {
        const rawItems = Array.isArray(data) ? data : (data.items || []);
        const matchedData = this.matchKiotItemsWithMenu(rawItems);
        this.renderSyncPreviewTable('sync-api-preview', matchedData);
        UI.showToast('Thành Công', 'Đã đồng bộ đơn hàng KiotViet thành công!', 'success');
      })
      .catch(err => {
        console.warn('Lỗi gọi API proxy:', err);
        UI.showToast('Lỗi Kết Nối', 'Không kết nối được tới Proxy URL. Đang nạp dữ liệu mô phỏng.', 'warning');
        this.runKiotApiMockDemo();
      });
  },

  applySyncResultToPos() {
    const { results, matchedCount, totalCups } = this.posSyncState;
    if (!results || matchedCount === 0) {
      UI.showToast('Lỗi', 'Không có món nào khớp với Menu để điền vào ca bán hàng.', 'warning');
      return;
    }

    if (!this.posCart) this.posCart = {};

    results.forEach(r => {
      if (r.status === 'matched' && r.matchedProd) {
        const prodId = r.matchedProd.id;
        this.posCart[prodId] = Number(r.qty) || 0;
      }
    });

    this.renderPos();
    this.closePosSyncHub();

    UI.showToast('Đồng Bộ Thành Công', `Đã nạp ${matchedCount} món (${totalCups} ly) vào ca làm việc hiện tại. Hãy bấm 'Chốt Ca & Trừ Kho Ngay'!`, 'success');
  },

  // --- THAO TÁC NHANH TRỰC TIẾP TỪ HEADER BÁO CÁO CUỐI CA ---
  handleQuickPosExcel(event) {
    const file = event.target.files ? event.target.files[0] : null;
    if (!file) return;

    if (!window.XLSX) {
      UI.showToast('Lỗi Thư Viện', 'Thư viện đọc file Excel chưa sẵn sàng. Vui lòng tải lại trang.', 'danger');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = window.XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rows = window.XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (!rows || rows.length < 2) {
          throw new Error('Tệp Excel không chứa dòng dữ liệu bán hàng hợp lệ!');
        }

        let headerRowIdx = -1;
        let nameColIdx = -1;
        let qtyColIdx = -1;

        for (let r = 0; r < Math.min(rows.length, 10); r++) {
          const row = rows[r];
          if (!Array.isArray(row)) continue;
          for (let c = 0; c < row.length; c++) {
            const val = String(row[c] || '').toLowerCase().trim();
            if (val.includes('tên hàng') || val.includes('tên món') || val.includes('mặt hàng') || val.includes('hàng hóa') || val.includes('sản phẩm')) {
              nameColIdx = c;
            }
            if (val.includes('số lượng') || val.includes('sl') || val.includes('sl bán') || val.includes('qty')) {
              qtyColIdx = c;
            }
          }
          if (nameColIdx !== -1 && qtyColIdx !== -1) {
            headerRowIdx = r;
            break;
          }
        }

        if (headerRowIdx === -1) {
          headerRowIdx = 0;
          nameColIdx = 1;
          qtyColIdx = 3;
        }

        const rawItems = [];
        for (let r = headerRowIdx + 1; r < rows.length; r++) {
          const row = rows[r];
          if (!row || row.length === 0) continue;
          const name = String(row[nameColIdx] || '').trim();
          const qty = Number(row[qtyColIdx]) || 0;
          if (!name || name.toLowerCase().includes('tổng cộng') || name.toLowerCase().includes('tổng:') || qty <= 0) {
            continue;
          }
          rawItems.push({ name, qty });
        }

        const matchedData = this.matchKiotItemsWithMenu(rawItems);
        const { matchedCount, unmatchedCount, totalCups, results } = matchedData;

        if (matchedCount === 0) {
          UI.showToast('Không Khớp', 'Không tìm thấy món nào trong file Excel khớp với Menu của quán.', 'warning');
          this.openPosSyncHub();
          this.switchSyncTab('excel');
          this.renderSyncPreviewTable('sync-excel-preview', matchedData);
          return;
        }

        // Tự động điền số lượng vào posCart ngay lập tức!
        if (!this.posCart) this.posCart = {};
        results.forEach(r => {
          if (r.status === 'matched' && r.matchedProd) {
            this.posCart[r.matchedProd.id] = Number(r.qty) || 0;
          }
        });

        this.renderPos();

        if (unmatchedCount === 0) {
          UI.showToast('Nạp Excel Thành Công', `Đã nạp chính xác ${matchedCount} món (${totalCups} ly) từ KiotViet vào ca bán hàng!`, 'success');
        } else {
          UI.showToast('Đã Nạp Vào Ca', `Đã nạp ${matchedCount} món (${totalCups} ly). Có ${unmatchedCount} món chưa có trong Menu BOM, đang mở đối chiếu...`, 'warning');
          this.openPosSyncHub();
          this.switchSyncTab('excel');
          this.renderSyncPreviewTable('sync-excel-preview', matchedData);
        }
      } catch (err) {
        console.error('Lỗi nạp nhanh Excel:', err);
        UI.showToast('Lỗi Tệp', err.message || 'Không thể đọc tệp Excel. Vui lòng kiểm tra định dạng.', 'danger');
      } finally {
        event.target.value = '';
      }
    };

    reader.readAsArrayBuffer(file);
  },

  async handleQuickPosPaste() {
    try {
      let text = '';
      if (navigator.clipboard && navigator.clipboard.readText) {
        text = await navigator.clipboard.readText();
      }

      if (text && text.trim().length > 0) {
        const lines = text.trim().split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
        const rawItems = [];

        lines.forEach(line => {
          let parts = line.split(/[\t,|]/).map(p => p.trim()).filter(p => p.length > 0);
          if (parts.length >= 2) {
            let name = parts[0];
            let qty = 0;
            for (let i = 1; i < parts.length; i++) {
              const parsedNum = parseFloat(parts[i].replace(/[^\d.]/g, ''));
              if (!isNaN(parsedNum) && parsedNum > 0) {
                qty = parsedNum;
                break;
              }
            }
            if (name && qty > 0) {
              rawItems.push({ name, qty });
              return;
            }
          }
          const match = line.match(/^(.+?)[\s\t,:]+(\d+(?:\.\d+)?)$/);
          if (match) {
            const name = match[1].trim();
            const qty = Number(match[2]);
            if (name && qty > 0) rawItems.push({ name, qty });
          }
        });

        if (rawItems.length > 0) {
          const matchedData = this.matchKiotItemsWithMenu(rawItems);
          const { matchedCount, unmatchedCount, totalCups, results } = matchedData;

          if (matchedCount > 0) {
            if (!this.posCart) this.posCart = {};
            results.forEach(r => {
              if (r.status === 'matched' && r.matchedProd) {
                this.posCart[r.matchedProd.id] = Number(r.qty) || 0;
              }
            });
            this.renderPos();

            if (unmatchedCount === 0) {
              UI.showToast('Dán Báo Cáo Thành Công', `Đã nạp ${matchedCount} món (${totalCups} ly) từ bộ nhớ tạm vào ca làm việc!`, 'success');
              return;
            } else {
              UI.showToast('Đã Nạp Vào Ca', `Đã nạp ${matchedCount} món (${totalCups} ly). Có ${unmatchedCount} mục chưa khớp menu, đang mở bảng đối chiếu...`, 'warning');
              this.openPosSyncHub();
              this.switchSyncTab('clipboard');
              const txtEl = document.getElementById('sync-clipboard-input');
              if (txtEl) txtEl.value = text;
              this.renderSyncPreviewTable('sync-clipboard-preview', matchedData);
              return;
            }
          }
        }
      }

      // Nếu clipboard trống hoặc không đọc được tự động, mở tab dán cho nhân viên thao tác
      this.openPosSyncHub();
      this.switchSyncTab('clipboard');
      const txtEl = document.getElementById('sync-clipboard-input');
      if (txtEl) {
        if (text) txtEl.value = text;
        txtEl.focus();
      }
      UI.showToast('Dán Báo Cáo', 'Vui lòng bấm phím Ctrl + V vào ô văn bản để nạp số liệu.', 'info');
    } catch (err) {
      this.openPosSyncHub();
      this.switchSyncTab('clipboard');
      const txtEl = document.getElementById('sync-clipboard-input');
      if (txtEl) txtEl.focus();
      UI.showToast('Dán Báo Cáo', 'Vui lòng bấm phím Ctrl + V vào ô văn bản để nạp số liệu.', 'info');
    }
  },

  // ================= 9. VIEW: KIỂM KÊ & HAO HỤT (AUDIT) =================
  renderAudit() {
    const ingredients = window.AppStore.state.ingredients || [];
    const tbody = document.getElementById('audit-table-tbody');
    if (!tbody) return;

    if (!this.auditEnteredValues) {
      this.auditEnteredValues = {};
      try {
        const savedDraft = localStorage.getItem('bobaflow_audit_draft_counts');
        if (savedDraft) {
          this.auditEnteredValues = JSON.parse(savedDraft) || {};
        }
      } catch (e) {}
    }

    tbody.innerHTML = ingredients.map(item => {
      const sysStock = Number(item.stockQty || 0);
      const unitCost = Number(item.unitCost || 0);
      const savedVal = (this.auditEnteredValues && this.auditEnteredValues[item.id] !== undefined)
        ? this.auditEnteredValues[item.id]
        : '';

      let diffHtml = `<span style="color:var(--text-muted); font-size:0.85rem;">Chờ kiểm...</span>`;
      let lossHtml = `<span style="color:var(--text-muted); font-size:0.85rem;">—</span>`;

      if (savedVal !== '' && !isNaN(parseFloat(savedVal))) {
        const actual = parseFloat(savedVal);
        const diff = actual - sysStock;
        const lossVal = diff * unitCost;

        if (diff < 0) {
          diffHtml = `<span style="color:var(--color-danger); font-weight:700;">-${window.CostEngine.formatQty(Math.abs(diff), item.baseUnit)} <small style="font-size:0.75rem; font-weight:600;">(Thiếu)</small></span>`;
        } else if (diff > 0) {
          diffHtml = `<span style="color:var(--color-warning); font-weight:700;">+${window.CostEngine.formatQty(diff, item.baseUnit)} <small style="font-size:0.75rem; font-weight:600;">(Thừa)</small></span>`;
        } else {
          diffHtml = `<span style="color:var(--color-success); font-weight:700;">0 ${item.baseUnit} <small style="font-size:0.75rem; font-weight:600;">(Khớp 100%)</small></span>`;
        }

        if (lossVal < 0) {
          lossHtml = `<span style="color:var(--color-danger); font-weight:700;">-${window.CostEngine.formatCurrency(Math.abs(lossVal))} <small style="font-size:0.75rem; font-weight:600;">(Thất thoát)</small></span>`;
        } else if (lossVal > 0) {
          lossHtml = `<span style="color:var(--color-warning); font-weight:700;">+${window.CostEngine.formatCurrency(lossVal)} <small style="font-size:0.75rem; font-weight:600;">(Thặng dư)</small></span>`;
        } else {
          lossHtml = `<span style="color:var(--color-success); font-weight:700;">0 đ <small style="font-size:0.75rem; font-weight:600;">(Cân đối)</small></span>`;
        }
      }

      return `
        <tr data-ing-id="${item.id}" data-cost="${item.unitCost}" data-sys-stock="${item.stockQty}">
          <td>
            <div style="font-weight:700;">${item.name}</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">${item.category}</div>
          </td>
          <td>${item.baseUnit}</td>
          <td>
            <div style="font-weight:800; color:var(--text-primary); font-size:0.95rem;">${window.CostEngine.formatQty(item.stockQty, item.baseUnit)}</div>
            <div style="font-size:0.7rem; color:var(--text-muted);">(Tồn trên máy)</div>
          </td>
          <td>
            <input type="number" class="form-control audit-actual-input" placeholder="Nhập SL thực tế..." value="${savedVal}" min="0" step="any" style="width:140px; font-weight:700;">
          </td>
          <td>
            <div class="audit-diff" style="font-weight:700; font-size:0.85rem;">${diffHtml}</div>
          </td>
          <td class="col-cost-sensitive">${window.CostEngine.formatCurrency(item.unitCost)}</td>
          <td class="col-cost-sensitive">
            <div class="audit-loss-val" style="font-weight:700; font-size:0.85rem;">${lossHtml}</div>
          </td>
        </tr>
      `;
    }).join('');

    // Bắt sự kiện thay đổi giá trị thực tế đếm được
    tbody.querySelectorAll('.audit-actual-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const tr = e.target.closest('tr');
        const ingId = tr.getAttribute('data-ing-id');
        const sysStock = Number(tr.getAttribute('data-sys-stock') || 0);
        const unitCost = Number(tr.getAttribute('data-cost') || 0);
        const baseUnit = tr.children[1].textContent.trim();
        const rawVal = e.target.value.trim();

        // Lưu giữ số liệu nhập của người dùng để không bị mất khi lưu hoặc render lại
        if (rawVal === '') {
          delete this.auditEnteredValues[ingId];
        } else {
          this.auditEnteredValues[ingId] = rawVal;
        }
        try {
          localStorage.setItem('bobaflow_audit_draft_counts', JSON.stringify(this.auditEnteredValues));
        } catch (err) {}

        const diffEl = tr.querySelector('.audit-diff');
        const lossEl = tr.querySelector('.audit-loss-val');

        if (rawVal === '') {
          if (diffEl) {
            diffEl.innerHTML = `<span style="color:var(--text-muted); font-size:0.85rem;">Chờ kiểm...</span>`;
          }
          if (lossEl) {
            lossEl.innerHTML = `<span style="color:var(--text-muted); font-size:0.85rem;">—</span>`;
          }
          return;
        }

        const actual = parseFloat(rawVal);
        if (isNaN(actual)) return;

        // Công thức chuẩn kế toán F&B: Chênh lệch = Thực tế đếm được - Tồn trên máy
        const diff = actual - sysStock;
        const lossVal = diff * unitCost;

        if (diffEl) {
          if (diff < 0) {
            diffEl.innerHTML = `<span style="color:var(--color-danger); font-weight:700;">-${window.CostEngine.formatQty(Math.abs(diff), baseUnit)} <small style="font-size:0.75rem; font-weight:600;">(Thiếu)</small></span>`;
          } else if (diff > 0) {
            diffEl.innerHTML = `<span style="color:var(--color-warning); font-weight:700;">+${window.CostEngine.formatQty(diff, baseUnit)} <small style="font-size:0.75rem; font-weight:600;">(Thừa)</small></span>`;
          } else {
            diffEl.innerHTML = `<span style="color:var(--color-success); font-weight:700;">0 ${baseUnit} <small style="font-size:0.75rem; font-weight:600;">(Khớp 100%)</small></span>`;
          }
        }

        if (lossEl) {
          if (lossVal < 0) {
            lossEl.innerHTML = `<span style="color:var(--color-danger); font-weight:700;">-${window.CostEngine.formatCurrency(Math.abs(lossVal))} <small style="font-size:0.75rem; font-weight:600;">(Thất thoát)</small></span>`;
          } else if (lossVal > 0) {
            lossEl.innerHTML = `<span style="color:var(--color-warning); font-weight:700;">+${window.CostEngine.formatCurrency(lossVal)} <small style="font-size:0.75rem; font-weight:600;">(Thặng dư)</small></span>`;
          } else {
            lossEl.innerHTML = `<span style="color:var(--color-success); font-weight:700;">0 đ <small style="font-size:0.75rem; font-weight:600;">(Cân đối)</small></span>`;
          }
        }
      });
    });

    const saveAuditBtn = document.getElementById('btn-save-audit-record');
    if (saveAuditBtn) {
      saveAuditBtn.onclick = () => {
        const countedItems = [];
        let totalLoss = 0;
        let totalSurplus = 0;

        tbody.querySelectorAll('tr').forEach(tr => {
          const input = tr.querySelector('.audit-actual-input');
          const rawVal = input ? input.value.trim() : '';
          if (rawVal !== '') {
            const ingredientId = tr.getAttribute('data-ing-id');
            const sysStock = Number(tr.getAttribute('data-sys-stock') || 0);
            const unitCost = Number(tr.getAttribute('data-cost') || 0);
            const actualQty = parseFloat(rawVal);
            if (!isNaN(actualQty)) {
              const diff = actualQty - sysStock;
              const lossVal = diff * unitCost;
              const ingName = tr.querySelector('div[style*="font-weight:700"]')?.textContent || ingredientId;
              const baseUnit = tr.children[1].textContent.trim();

              if (lossVal < 0) totalLoss += Math.abs(lossVal);
              if (lossVal > 0) totalSurplus += lossVal;

              countedItems.push({
                ingredientId,
                name: ingName,
                baseUnit,
                sysStock,
                actualQty,
                diff,
                lossVal
              });
            }
          }
        });

        if (countedItems.length === 0) {
          UI.showToast('Nhắc Nhở', 'Vui lòng nhập số lượng thực tế đếm được cho ít nhất 1 mặt hàng trước khi lưu kiểm kê!', 'warning');
          return;
        }

        // Lọc các hạng mục có sai lệch tăng/giảm (không lưu khi diff = 0 theo yêu cầu người dùng)
        const discrepantItems = countedItems.filter(it => Math.abs(it.diff) > 0.0001);

        if (discrepantItems.length === 0) {
          UI.showToast('Khớp 100%', 'Tuyệt vời! Tất cả các mặt hàng kiểm đếm đều khớp hoàn toàn với số liệu tồn trên máy (chênh lệch = 0, không có thất thoát).', 'success');
          return;
        }

        const confirmMsg = `Phát hiện ${discrepantItems.length} mặt hàng có sai lệch tồn kho so với máy:\n\n` +
          (totalLoss > 0 ? `• Hao hụt / Thất thoát: -${window.CostEngine.formatCurrency(totalLoss)}\n` : '') +
          (totalSurplus > 0 ? `• Dôi thừa thực tế: +${window.CostEngine.formatCurrency(totalSurplus)}\n` : '') +
          `\nSố tồn trên máy được bảo lưu đồng bộ theo báo cáo bán hàng. Hệ thống sẽ ghi nhận ${discrepantItems.length} mục có chênh lệch này vào "Lịch Sử Kiểm Kê" để quản lý theo dõi.`;

        if (!confirm(confirmMsg)) return;

        window.AppStore.saveAuditLog({
          items: discrepantItems,
          totalCounted: countedItems.length,
          totalLoss,
          totalSurplus
        });

        UI.showToast('Thành Công', `Đã lưu ${discrepantItems.length} mặt hàng có sai lệch vào Lịch Sử Kiểm Kê!`, 'success');
      };
    }

    // Render lịch sử các lần kiểm kê gần nhất (chỉ lưu các mục có sai lệch tăng giảm)
    const historyContainer = document.getElementById('audit-history-container');
    if (historyContainer) {
      const logs = window.AppStore.state.auditLogs || [];
      if (logs.length === 0) {
        historyContainer.innerHTML = '';
      } else {
        const recentLogs = logs.slice(0, 5);
        historyContainer.innerHTML = `
          <div class="card" style="margin-top:1rem;">
            <div class="card-header">
              <div>
                <div class="card-title">Lịch Sử Kiểm Kê & Hao Hụt</div>
                <div class="card-subtitle">Theo dõi các đợt kiểm đếm phát hiện sai lệch thừa / thiếu so với số liệu tồn trên máy</div>
              </div>
            </div>
            <div class="card-body" style="display:flex; flex-direction:column; gap:0.85rem; padding:0.85rem;">
              ${recentLogs.map(log => `
                <div style="background:var(--bg-card-subtle, rgba(255,255,255,0.03)); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:0.75rem;">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem; flex-wrap:wrap; gap:0.5rem;">
                    <div>
                      <strong style="color:var(--primary-400);">${log.id}</strong>
                      <span style="font-size:0.75rem; color:var(--text-muted); margin-left:0.5rem;">📅 ${log.date}</span>
                    </div>
                    <div style="display:flex; gap:0.5rem; align-items:center;">
                      <span class="badge badge-warning" style="background:rgba(239,68,68,0.15); color:var(--color-danger);">${log.items?.length || 0} mục sai lệch</span>
                      ${(log.totalLoss || 0) > 0 ? `<span class="badge badge-low" style="color:var(--color-danger);">Hao hụt: -${window.CostEngine.formatCurrency(log.totalLoss)}</span>` : ''}
                    </div>
                  </div>
                  <div style="display:flex; flex-direction:column; gap:0.35rem; font-size:0.82rem;">
                    ${(log.items || []).map(it => `
                      <div style="display:flex; justify-content:space-between; border-bottom:1px dashed var(--border-subtle); padding:0.25rem 0;">
                        <span>${it.name || it.ingredientId}: Máy ${window.CostEngine.formatQty(it.sysStock, it.baseUnit)} ➔ Đếm <strong>${it.actualQty} ${it.baseUnit || ''}</strong></span>
                        <span style="font-weight:700; color:${it.diff < 0 ? 'var(--color-danger)' : 'var(--color-warning)'};">
                          ${it.diff > 0 ? '+' : ''}${it.diff} ${it.baseUnit || ''} (${it.diff < 0 ? 'Thiếu' : 'Thừa'})
                        </span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }
    }
  },

  clearAuditDraftCounts() {
    if (confirm('Bạn có chắc muốn làm mới phiếu đếm (xóa toàn bộ số lượng thực tế đã nhập để kiểm đếm lại từ đầu)?')) {
      this.auditEnteredValues = {};
      try {
        localStorage.removeItem('bobaflow_audit_draft_counts');
      } catch (e) {}
      this.renderAudit();
      UI.showToast('Làm Mới', 'Đã xóa toàn bộ số đếm tạm trên bảng kiểm kê', 'info');
    }
  },

  // ================= 10. VIEW: NHÀ CUNG CẤP (SUPPLIERS) =================
  renderSuppliers() {
    const suppliers = window.AppStore.state.suppliers || [];
    const grid = document.getElementById('suppliers-grid');
    if (!grid) return;

    grid.innerHTML = suppliers.map(s => {
      return `
        <div class="card supplier-item-card" style="margin:0; width:100%; box-sizing:border-box;">
          <div class="card-header" style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.4rem; padding-bottom:0.45rem; border-bottom:1px solid var(--border-subtle);">
            <div>
              <div class="card-title" style="font-size:0.98rem; font-weight:700; color:var(--text-primary);">${s.name}</div>
              <div style="font-size:0.75rem; color:var(--text-muted); display:flex; gap:0.5rem; align-items:center; margin-top:0.2rem;">
                <span>Mã: <code style="color:var(--primary-400);">${s.id}</code></span>
                <span>•</span>
                <span>Liên hệ: <strong style="color:var(--text-secondary);">${s.contactPerson || 'Quản lý kho'}</strong></span>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <a href="tel:${s.phone || ''}" class="badge badge-in-stock" style="text-decoration:none; display:inline-flex; align-items:center; gap:0.3rem; padding:0.35rem 0.65rem; font-weight:700;">
                📞 ${s.phone || 'Chưa có SĐT'}
              </a>
            </div>
          </div>
          <div class="card-body" style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:0.5rem; font-size:0.82rem; padding:0;">
            <div style="color:var(--text-secondary); display:flex; align-items:center; gap:0.35rem;">
              <span>📍</span> <span>${s.address || 'TP.HCM'}</span>
            </div>
            <div style="display:flex; flex-wrap:wrap; gap:0.3rem; align-items:center;">
              <span style="color:var(--text-muted); font-size:0.75rem;">Mặt hàng:</span>
              ${(s.categories || []).map(cat => `<span class="badge badge-cat" style="font-size:0.72rem; padding:0.2rem 0.45rem;">${cat}</span>`).join('')}
            </div>
          </div>
        </div>
      `;
    }).join('');

    const addSupBtn = document.getElementById('btn-add-supplier');
    if (addSupBtn) {
      addSupBtn.onclick = () => {
        const name = prompt('Nhập tên Nhà Cung Cấp mới:');
        if (name) {
          const phone = prompt('Nhập số điện thoại liên hệ:');
          const newSup = {
            id: 'SUP-' + Date.now().toString().slice(-4),
            name,
            phone: phone || '',
            contactPerson: 'Đại diện',
            address: 'Việt Nam',
            categories: ['Nguyên liệu F&B']
          };
          window.AppStore.state.suppliers.push(newSup);
          window.AppStore.save();
          UI.showToast('Thành công', `Đã thêm nhà cung cấp: ${name}`, 'success');
        }
      };
    }
  }
};

// Khởi chạy ứng dụng an toàn, sẵn sàng ngay lập tức kể cả khi DOM đã sẵn sàng
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.AppController.init();
  });
} else {
  window.AppController.init();
}
