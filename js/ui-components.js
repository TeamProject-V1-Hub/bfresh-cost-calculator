/**
 * UI-COMPONENTS.JS - Quản lý Modal, Toast Thông Báo & Thành Phần Giao Diện Động
 */

window.UI = {
  /**
   * Hiển thị Toast thông báo nổi bên góc phải
   */
  showToast(title, desc = '', type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = {
      success: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15a802" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
      warning: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
      danger: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
      info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-icon" style="display:flex; align-items:center;">${icons[type] || '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>'}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        ${desc ? `<div class="toast-desc">${desc}</div>` : ''}
      </div>
    `;

    container.appendChild(toast);

    // Kích hoạt animation trượt vào
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Tự động biến mất sau 3.5s
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  /**
   * Mở Modal Dialog
   */
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'flex';
      void modal.offsetWidth; // Ép layout reflow để hiệu ứng CSS mượt mà tức thì
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';

      // Hỗ trợ bấm vào vùng tối bên ngoài (backdrop) để thoát / đóng modal tiện lợi
      if (!modal._hasBackdropListener) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            if (modalId === 'modal-theme-settings' && window.AppController && typeof window.AppController.closeThemeSettings === 'function') {
              window.AppController.closeThemeSettings();
            } else {
              this.closeModal(modalId);
            }
          }
        });
        modal._hasBackdropListener = true;
      }
    }
  },

  /**
   * Đóng Modal Dialog
   */
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      modal.style.display = 'none';
      // Chỉ mở lại scroll body nếu không còn modal nào active
      const remainingActive = document.querySelector('.modal-overlay.active');
      if (!remainingActive) {
        document.body.style.overflow = '';
      }
    }
  },

  /**
   * Tạo biểu đồ Donut SVG thuần trực quan cho cơ cấu chi phí món
   */
  renderCostDonut(subCost, rawCost, pkgCost) {
    const total = subCost + rawCost + pkgCost;
    if (total <= 0) {
      return `<div style="text-align:center; color:var(--text-muted); padding:1rem;">Chưa có chi phí</div>`;
    }

    const subPct = (subCost / total) * 100;
    const rawPct = (rawCost / total) * 100;
    const pkgPct = (pkgCost / total) * 100;

    // Tính toán chu vi đường tròn r=36 -> C = 2 * PI * 36 = ~226.2
    const C = 226.2;
    const subStroke = (subPct / 100) * C;
    const rawStroke = (rawPct / 100) * C;
    const pkgStroke = (pkgPct / 100) * C;

    const subOffset = 0;
    const rawOffset = -subStroke;
    const pkgOffset = -(subStroke + rawStroke);

    return `
      <div style="display:flex; align-items:center; gap:1.25rem;">
        <svg width="90" height="90" viewBox="0 0 100 100" style="transform: rotate(-90deg); flex-shrink:0;">
          <!-- Nền xám thích ứng theme -->
          <circle class="donut-bg-circle" cx="50" cy="50" r="36" fill="transparent" stroke-width="14" />
          
          <!-- Bán thành phẩm (Vàng Amber) -->
          <circle cx="50" cy="50" r="36" fill="transparent" stroke="#f59e0b" stroke-width="14"
            stroke-dasharray="${subStroke} ${C - subStroke}" stroke-dashoffset="${subOffset}" />
            
          <!-- Nguyên liệu trực tiếp (Xanh Matcha / Logo) -->
          <circle cx="50" cy="50" r="36" fill="transparent" stroke="#15a802" stroke-width="14"
            stroke-dasharray="${rawStroke} ${C - rawStroke}" stroke-dashoffset="${rawOffset}" />
            
          <!-- Bao bì & Ly (Cam Coral) -->
          <circle cx="50" cy="50" r="36" fill="transparent" stroke="#f97316" stroke-width="14"
            stroke-dasharray="${pkgStroke} ${C - pkgStroke}" stroke-dashoffset="${pkgOffset}" />
        </svg>

        <div style="display:flex; flex-direction:column; gap:0.35rem; font-size:0.75rem;">
          <div style="display:flex; align-items:center; gap:0.45rem;">
            <span style="width:10px; height:10px; border-radius:3px; background:#f59e0b; display:inline-block;"></span>
            <span>Bán thành phẩm: <strong>${Math.round(subPct)}%</strong></span>
          </div>
          <div style="display:flex; align-items:center; gap:0.45rem;">
            <span style="width:10px; height:10px; border-radius:3px; background:#15a802; display:inline-block;"></span>
            <span>Nguyên liệu thô: <strong>${Math.round(rawPct)}%</strong></span>
          </div>
          <div style="display:flex; align-items:center; gap:0.45rem;">
            <span style="width:10px; height:10px; border-radius:3px; background:#f97316; display:inline-block;"></span>
            <span>Bao bì & Ly: <strong>${Math.round(pkgPct)}%</strong></span>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Tạo thanh đo Food Cost % với màu sắc cảnh báo thông minh
   */
  renderFoodCostGauge(foodCostPct) {
    let statusClass = 'optimal';
    let statusText = 'Tỷ lệ lý tưởng (< 30%)';
    let textColor = 'var(--color-success)';

    if (foodCostPct > 35) {
      statusClass = 'danger';
      statusText = 'Cảnh báo: Lãi mỏng (> 35%)';
      textColor = 'var(--color-danger)';
    } else if (foodCostPct >= 30) {
      statusClass = 'warning';
      statusText = 'Mức trung bình (30% - 35%)';
      textColor = 'var(--color-warning)';
    }

    const fillWidth = Math.min(100, Math.max(5, foodCostPct));

    return `
      <div class="food-cost-gauge-container">
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.8rem;">
          <span style="color:var(--text-secondary);">Tỷ lệ Giá Vốn (Food Cost):</span>
          <span style="font-weight:700; color:${textColor};">${foodCostPct}% - ${statusText}</span>
        </div>
        <div class="gauge-bar">
          <div class="gauge-fill ${statusClass}" style="width: ${fillWidth}%;"></div>
        </div>
      </div>
    `;
  }
};

// Hỗ trợ phím Escape để đóng nhanh bất kỳ cửa sổ popup modal nào đang mở
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
      const activeModal = document.querySelector('.modal-overlay.active');
      if (activeModal && activeModal.id && window.UI) {
        window.UI.closeModal(activeModal.id);
      }
    }
  });
}
