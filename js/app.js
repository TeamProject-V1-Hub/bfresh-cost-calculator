/**
 * APP.JS - App Pha Chế
 * Gồm 2 module: Hướng Dẫn Pha Chế & Định Lượng Món
 * Tách từ BFresh Station - Không ảnh hưởng dự án gốc
 */

// --- ROUTER QUẢN LÝ CHUYỂN TAB ---
window.AppRouter = {
  currentTab: 'subrecipes',

  init() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const tab = item.getAttribute('data-tab');
        if (tab) this.navigate(tab);
      });
    });

    // Xử lý menu mobile
    const mobileBtn = document.getElementById('mobile-menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');

    const closeMobileMenu = () => {
      if (sidebar) sidebar.classList.remove('mobile-open');
      if (backdrop) backdrop.classList.remove('active');
    };

    if (mobileBtn) {
      mobileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (sidebar) {
          const isOpen = sidebar.classList.toggle('mobile-open');
          if (backdrop) backdrop.classList.toggle('active', isOpen);
        }
      });
    }

    if (backdrop) {
      backdrop.addEventListener('click', closeMobileMenu);
      backdrop.addEventListener('touchstart', closeMobileMenu, { passive: true });
    }

    document.addEventListener('click', (e) => {
      if (sidebar && sidebar.classList.contains('mobile-open')) {
        if (!sidebar.contains(e.target) && e.target !== mobileBtn && !mobileBtn?.contains(e.target)) {
          closeMobileMenu();
        }
      }
    });

    this.navigate('subrecipes');
  },

  navigate(tabName) {
    this.currentTab = tabName;

    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-tab') === tabName);
    });

    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('mobile-open');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (backdrop) backdrop.classList.remove('active');

    document.querySelectorAll('.view-pane').forEach(pane => {
      pane.classList.toggle('active', pane.id === `view-${tabName}`);
    });

    switch (tabName) {
      case 'subrecipes':
        AppController.renderSubRecipes();
        break;
      case 'recipes':
        AppController.renderRecipes();
        break;
    }

    const viewport = document.getElementById('viewport-content');
    if (viewport) viewport.scrollTop = 0;
    window.scrollTo(0, 0);
  }
};

// ================= THEME MANAGER =================
window.ThemeManager = {
  init() {
    const saved = localStorage.getItem('phache_theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
  },

  toggle() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('phache_theme', next);
    if (window.UI && typeof window.UI.showToast === 'function') {
      window.UI.showToast('Giao Diện', next === 'dark' ? 'Đã chuyển sang chế độ Tối' : 'Đã chuyển sang chế độ Sáng', 'info');
    }
  }
};

// ================= APP CONTROLLER =================
window.AppController = {

  expandedRecipeMap: {},
  allRecipesExpanded: true,

  init() {
    window.AppStore.init();
    window.ThemeManager.init();
    window.AppRouter.init();
    this.bindSubRecipeModal();
    this.bindProductModal();

    // Tìm kiếm toàn cục
    const searchInput = document.getElementById('global-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (window.AppRouter.currentTab === 'recipes') {
          this.renderRecipes(query);
        } else if (window.AppRouter.currentTab === 'subrecipes') {
          this.renderSubRecipes(query);
        }
      });
    }

    // Sao lưu / nạp file
    const exportBtn = document.getElementById('btn-export-backup');
    if (exportBtn) exportBtn.onclick = () => window.AppStore.exportBackupJSON();

    const importBtn = document.getElementById('btn-open-restore-modal');
    if (importBtn) importBtn.onclick = () => UI.openModal('modal-restore');

    const fileInput = document.getElementById('input-import-backup');
    if (fileInput) {
      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        try {
          await window.AppStore.importBackupJSON(file);
          UI.showToast('Nạp file thành công', 'Dữ liệu đã được khôi phục!', 'success');
          window.AppRouter.navigate(window.AppRouter.currentTab);
        } catch (err) {
          UI.showToast('Lỗi', 'Không thể đọc file sao lưu: ' + err.message, 'warning');
        }
        fileInput.value = '';
      });
    }

    // Nút xác nhận nạp file trong modal
    const confirmRestoreBtn = document.getElementById('btn-confirm-restore-text');
    if (confirmRestoreBtn) {
      confirmRestoreBtn.onclick = () => {
        const text = document.getElementById('restore-text-input')?.value?.trim();
        if (!text) { UI.showToast('Lỗi', 'Vui lòng dán dữ liệu JSON vào ô bên trên!', 'warning'); return; }
        try {
          const data = JSON.parse(text);
          window.AppStore.loadState(data);
          UI.closeModal('modal-restore');
          UI.showToast('Thành công', 'Đã nạp dữ liệu thành công!', 'success');
          window.AppRouter.navigate(window.AppRouter.currentTab);
        } catch (err) {
          UI.showToast('Lỗi', 'Dữ liệu không hợp lệ: ' + err.message, 'warning');
        }
      };
    }
  },

  toggleTheme() {
    window.ThemeManager.toggle();
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  // ================= MODULE 1: HƯỚNG DẪN PHA CHẾ (SUB-RECIPES) =================
  renderSubRecipes(searchQuery = '') {
    const allSubRecipes = window.AppStore.state.subRecipes || [];
    const ingMap = window.AppStore.getIngredientsMap();
    const container = document.getElementById('subrecipes-grid');
    if (!container) return;

    let subRecipes = allSubRecipes;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      subRecipes = allSubRecipes.filter(s =>
        (s.name || '').toLowerCase().includes(q) ||
        (s.category || '').toLowerCase().includes(q) ||
        (s.instructions || '').toLowerCase().includes(q)
      );
    }

    if (subRecipes.length === 0) {
      container.innerHTML = `<div style="grid-column: 1 / -1; text-align:center; padding:3rem; color:var(--text-muted);">
        ${searchQuery ? 'Không tìm thấy công thức nào phù hợp.' : 'Chưa có công thức bán thành phẩm nào. Hãy bấm "Thêm Bán Thành Phẩm" để tạo!'}
      </div>`;
      return;
    }

    container.innerHTML = subRecipes.map(sub => {
      const calc = window.CostEngine.calculateSubRecipeCost(sub, ingMap);
      return `
        <div class="card" style="margin:0; display:flex; flex-direction:column; justify-content:space-between;">
          <div class="card-header">
            <div>
              <div class="card-title">${this.escapeHtml(sub.name)}</div>
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
            <div class="subrecipe-cost-banner">
              <div>
                <div style="font-size:0.72rem; color:var(--text-muted);">GIÁ 1 ${(sub.outputUnit || 'ml').toUpperCase()}:</div>
                <div style="font-size:1.15rem; font-weight:800; color:var(--color-success);">${window.CostEngine.formatCurrency(calc.unitCost)}</div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:0.72rem; color:var(--text-muted);">GIÁ CẢ MẺ (${sub.outputQty} ${sub.outputUnit}):</div>
                <div style="font-size:1.15rem; font-weight:800; color:var(--primary-400);">${window.CostEngine.formatCurrency(calc.totalBatchCost)}</div>
              </div>
            </div>

            <div style="font-size:0.8rem; font-weight:700; margin-bottom:0.4rem; color:var(--text-secondary);">Thành Phần Định Lượng:</div>
            <div style="display:flex; flex-direction:column; gap:0.35rem; font-size:0.82rem; margin-bottom:0.85rem;">
              ${calc.itemsBreakdown.map(item => `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:0.3rem 0; border-bottom:1px dashed var(--border-subtle);">
                  <span>${this.escapeHtml(item.name)} (${item.amount} ${item.unit})</span>
                  <strong style="color:var(--text-primary);">${window.CostEngine.formatCurrency(item.lineCost)}</strong>
                </div>
              `).join('')}
            </div>

            ${sub.instructions ? `
              <div class="subrecipe-instruction-box">
                <em>${this.escapeHtml(sub.instructions)}</em>
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

    if (addBtn) addBtn.addEventListener('click', () => this.openAddSubRecipe());
    if (addRowBtn) addRowBtn.addEventListener('click', () => this.addSubRecipeIngRow());

    if (outputUnitSelect && unitText) {
      outputUnitSelect.addEventListener('change', (e) => {
        unitText.textContent = e.target.value;
        this.recalcSubRecipeModalPreview();
      });
    }

    if (outputQtyInput) outputQtyInput.addEventListener('input', () => this.recalcSubRecipeModalPreview());
    if (saveBtn) saveBtn.addEventListener('click', () => this.submitSubRecipe());
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
    (sub.ingredients || []).forEach(item => this.addSubRecipeIngRow(item.ingredientId, item.amount));

    this.recalcSubRecipeModalPreview();
    UI.openModal('modal-subrecipe-dialog');
  },

  confirmDeleteSubRecipe(id) {
    const sub = (window.AppStore.state.subRecipes || []).find(s => s.id === id);
    if (!sub) return;
    if (confirm(`Bạn có chắc muốn xóa bán thành phẩm "${sub.name}"?`)) {
      window.AppStore.deleteSubRecipe(id);
      this.renderSubRecipes();
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
      if (ingredientId && amount > 0) ingredients.push({ ingredientId, amount, unit });
    });

    const sub = { id: id || undefined, name, category, outputQty, outputUnit, shelfLifeHours, instructions, ingredients };
    window.AppStore.saveSubRecipe(sub);
    UI.closeModal('modal-subrecipe-dialog');
    this.renderSubRecipes();
    UI.showToast('Thành công', `Đã lưu bán thành phẩm: ${name}`, 'success');
  },

  // ================= MODULE 2: ĐỊNH LƯỢNG MÓN (RECIPES) =================
  renderRecipes(searchQuery = '') {
    const products = window.AppStore.state.products || [];
    const ingMap = window.AppStore.getIngredientsMap();
    const subMap = window.AppStore.getSubRecipesMap();
    const activeCat = document.querySelector('#product-filter-pills .filter-pill.active')?.getAttribute('data-cat') || 'all';
    const container = document.getElementById('products-list-container');
    if (!container) return;

    let filtered = products.filter(p => {
      if (activeCat !== 'all' && p.category !== activeCat) return false;
      if (searchQuery) {
        const text = `${p.name} ${p.category} ${p.size}`.toLowerCase();
        if (!text.includes(searchQuery.toLowerCase())) return false;
      }
      return true;
    });

    const pills = document.querySelectorAll('#product-filter-pills .filter-pill');
    pills.forEach(p => {
      p.onclick = () => {
        pills.forEach(x => x.classList.remove('active'));
        p.classList.add('active');
        this.renderRecipes();
      };
    });

    if (filtered.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:3rem; color:var(--text-muted);">Không tìm thấy món nào. Bấm "Thêm Món Vào Menu" để tạo công thức!</div>`;
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
              <button class="btn btn-secondary btn-sm" onclick="AppController.openEditProduct('${prod.id}')">Sửa</button>
              <button class="btn btn-danger btn-sm" onclick="AppController.confirmDeleteProduct('${prod.id}')">Xóa</button>
              <button class="btn btn-secondary btn-sm recipe-expand-toggle-btn" onclick="AppController.toggleRecipeDetails('${prod.id}', event)">
                <span class="toggle-icon-text">${isExpanded ? 'Thu Gọn ▴' : 'Chi Tiết ▾'}</span>
              </button>
            </div>
          </div>

          <div class="card-body recipe-details-body" id="recipe-body-${prod.id}" style="${isExpanded ? '' : 'display:none;'}">
            <div class="recipe-breakdown-card">
              <div>
                <div style="margin-bottom:1rem;">
                  <div style="font-size:0.82rem; font-weight:700; color:var(--primary-400); margin-bottom:0.4rem; display:flex; justify-content:space-between;">
                    <span>1. Bán Thành Phẩm Chuẩn Bị Trước:</span>
                    <span>Tiểu kế: ${window.CostEngine.formatCurrency(cogs.subRecipesCost)}</span>
                  </div>
                  <div style="display:flex; flex-direction:column; gap:0.3rem;">
                    ${cogs.subRecipesBreakdown.map(item => `
                      <div style="display:flex; justify-content:space-between; font-size:0.82rem; padding:0.35rem 0.6rem; background:rgba(245,158,11,0.06); border-radius:var(--radius-sm); border:1px solid rgba(245,158,11,0.12);">
                        <span>${this.escapeHtml(item.name)} (${item.amount} ${item.unit || 'ml'})</span>
                        <strong>${window.CostEngine.formatCurrency(item.lineCost)}</strong>
                      </div>
                    `).join('')}
                  </div>
                </div>

                <div style="margin-bottom:1rem;">
                  <div style="font-size:0.82rem; font-weight:700; color:var(--accent-matcha-500); margin-bottom:0.4rem; display:flex; justify-content:space-between;">
                    <span>2. Nguyên Liệu Trực Tiếp & Trái Cây:</span>
                    <span>Tiểu kế: ${window.CostEngine.formatCurrency(cogs.rawIngredientsCost)}</span>
                  </div>
                  <div style="display:flex; flex-direction:column; gap:0.3rem;">
                    ${cogs.rawBreakdown.map(item => `
                      <div style="display:flex; justify-content:space-between; font-size:0.82rem; padding:0.35rem 0.6rem; background:rgba(16,185,129,0.06); border-radius:var(--radius-sm); border:1px solid rgba(16,185,129,0.12);">
                        <span>${this.escapeHtml(item.name)} (${item.amount} ${item.unit})</span>
                        <strong>${window.CostEngine.formatCurrency(item.lineCost)}</strong>
                      </div>
                    `).join('')}
                  </div>
                </div>

                <div>
                  <div style="font-size:0.82rem; font-weight:700; color:var(--accent-peach-500); margin-bottom:0.4rem; display:flex; justify-content:space-between;">
                    <span>3. Vật Tư Bao Bì Ly Nắp & Ống Hút:</span>
                    <span>Tiểu kế: ${window.CostEngine.formatCurrency(cogs.packagingCost)}</span>
                  </div>
                  <div style="display:flex; flex-direction:column; gap:0.3rem;">
                    ${cogs.packagingBreakdown.map(item => `
                      <div style="display:flex; justify-content:space-between; font-size:0.82rem; padding:0.35rem 0.6rem; background:rgba(249,115,22,0.06); border-radius:var(--radius-sm); border:1px solid rgba(249,115,22,0.12);">
                        <span>${this.escapeHtml(item.name)} (${item.amount} cái)</span>
                        <strong>${window.CostEngine.formatCurrency(item.lineCost)}</strong>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>

              <div class="cost-summary-box">
                <div style="font-size:0.85rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--text-muted); text-align:center;">
                  Cơ Cấu Giá Vốn & Lợi Nhuận
                </div>

                ${UI.renderCostDonut(cogs.subRecipesCost, cogs.rawIngredientsCost, cogs.packagingCost)}

                <div class="cost-row total-cogs">
                  <span>Tổng Giá Vốn:</span>
                  <span>${window.CostEngine.formatCurrency(cogs.totalCogs)}</span>
                </div>

                ${UI.renderFoodCostGauge(cogs.foodCostPct)}

                <div style="border-top:1px solid var(--border-subtle); padding-top:0.75rem; display:flex; flex-direction:column; gap:0.6rem;">
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
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  toggleRecipeDetails(prodId, event) {
    if (event) event.stopPropagation();
    const bodyEl = document.getElementById(`recipe-body-${prodId}`);
    const cardEl = document.getElementById(`recipe-card-${prodId}`);
    const isHidden = bodyEl?.style.display === 'none';
    if (bodyEl) bodyEl.style.display = isHidden ? 'block' : 'none';
    if (cardEl) {
      cardEl.classList.toggle('is-expanded', isHidden);
      cardEl.classList.toggle('is-collapsed', !isHidden);
      const iconText = cardEl.querySelector('.toggle-icon-text');
      if (iconText) iconText.textContent = isHidden ? 'Thu Gọn ▴' : 'Chi Tiết ▾';
    }
    this.expandedRecipeMap[prodId] = isHidden;
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
    if (lbl) lbl.textContent = this.allRecipesExpanded ? '▴ Thu Gọn Chi Tiết Tất Cả' : '▾ Mở Rộng Chi Tiết Tất Cả';
  },

  bindProductModal() {
    const addBtn = document.getElementById('btn-add-product');
    const addSubBtn = document.getElementById('btn-prod-add-sub');
    const addRawBtn = document.getElementById('btn-prod-add-raw');
    const addPkgBtn = document.getElementById('btn-prod-add-pkg');
    const saveBtn = document.getElementById('btn-save-product-submit');
    const priceInput = document.getElementById('prod-price');

    if (addBtn) addBtn.addEventListener('click', () => this.openAddProduct());
    if (addSubBtn) addSubBtn.addEventListener('click', () => this.addProductSubRow());
    if (addRawBtn) addRawBtn.addEventListener('click', () => this.addProductRawRow());
    if (addPkgBtn) addPkgBtn.addEventListener('click', () => this.addProductPkgRow());
    if (priceInput) priceInput.addEventListener('input', () => this.recalcProductModalPreview());
    if (saveBtn) saveBtn.addEventListener('click', () => this.submitProduct());

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
    if (sizeSelect) sizeSelect.value = 'Size M (500ml)';
    document.getElementById('prod-price').value = '35000';
    document.getElementById('prod-app-price').value = '42000';
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
      } else {
        sizeSelect.value = 'custom';
        customSizeInput.style.display = 'block';
        customSizeInput.value = currentSize;
      }
    }

    document.getElementById('prod-price').value = prod.sellingPrice || 35000;
    document.getElementById('prod-app-price').value = prod.appSellingPrice || 42000;

    document.getElementById('prod-sub-container').innerHTML = '';
    document.getElementById('prod-raw-container').innerHTML = '';
    document.getElementById('prod-pkg-container').innerHTML = '';

    (prod.subRecipes || []).forEach(item => this.addProductSubRow(item.subRecipeId, item.amount));
    (prod.rawIngredients || []).forEach(item => this.addProductRawRow(item.ingredientId, item.amount));
    (prod.packaging || []).forEach(item => this.addProductPkgRow(item.packagingId, item.amount));

    this.recalcProductModalPreview();
    UI.openModal('modal-product-dialog');
  },

  confirmDeleteProduct(id) {
    const prod = (window.AppStore.state.products || []).find(p => p.id === id);
    if (!prod) return;
    if (confirm(`Bạn có chắc muốn xóa món "${prod.name}" khỏi Menu?`)) {
      window.AppStore.deleteProduct(id);
      this.renderRecipes();
      UI.showToast('Đã xóa', `Đã xóa món ${prod.name}`, 'warning');
    }
  },

  addProductSubRow(selectedId = null, defaultAmount = 100) {
    const container = document.getElementById('prod-sub-container');
    if (!container) return;
    const subRecipes = window.AppStore.state.subRecipes || [];
    const ingMap = window.AppStore.getIngredientsMap();
    const rowId = 'prod-sub-row-' + Date.now().toString().slice(-6);

    const div = document.createElement('div');
    div.className = 'recipe-ingredient-row';
    div.id = rowId;
    div.innerHTML = `
      <select class="form-control prod-sub-select">
        ${subRecipes.map(s => {
          const c = window.CostEngine.calculateSubRecipeCost(s, ingMap);
          return `<option value="${s.id}" data-cost="${c.unitCost}" data-unit="${s.outputUnit || 'ml'}" ${s.id === selectedId ? 'selected' : ''}>
            ${s.name} (${window.CostEngine.formatCurrency(c.unitCost)}/${s.outputUnit || 'ml'})
          </option>`;
        }).join('')}
      </select>
      <input type="number" class="form-control prod-sub-qty" value="${defaultAmount}" min="0.1" step="any" style="width:100px;">
      <span class="prod-sub-unit" style="color:var(--text-muted); font-size:0.82rem;">${subRecipes[0]?.outputUnit || 'ml'}</span>
      <button class="btn btn-danger btn-sm" onclick="document.getElementById('${rowId}').remove(); AppController.recalcProductModalPreview();">✕</button>
    `;

    container.appendChild(div);
    const sel = div.querySelector('.prod-sub-select');
    const qty = div.querySelector('.prod-sub-qty');
    const unit = div.querySelector('.prod-sub-unit');

    const update = () => {
      const opt = sel.options[sel.selectedIndex];
      if (opt && unit) unit.textContent = opt.getAttribute('data-unit') || 'ml';
      this.recalcProductModalPreview();
    };
    sel.addEventListener('change', update);
    qty.addEventListener('input', () => this.recalcProductModalPreview());
    update();
  },

  addProductRawRow(selectedId = null, defaultAmount = 100) {
    const container = document.getElementById('prod-raw-container');
    if (!container) return;
    const rawIngs = (window.AppStore.state.ingredients || []).filter(i => i.category !== 'Bao bì & Ly');
    const rowId = 'prod-raw-row-' + Date.now().toString().slice(-6);

    const div = document.createElement('div');
    div.className = 'recipe-ingredient-row';
    div.id = rowId;
    div.innerHTML = `
      <select class="form-control prod-raw-select">
        ${rawIngs.map(i => `<option value="${i.id}" data-cost="${i.unitCost}" data-unit="${i.baseUnit}" ${i.id === selectedId ? 'selected' : ''}>
          ${i.name} (${window.CostEngine.formatCurrency(i.unitCost)}/${i.baseUnit})
        </option>`).join('')}
      </select>
      <input type="number" class="form-control prod-raw-qty" value="${defaultAmount}" min="0.1" step="any" style="width:100px;">
      <span class="prod-raw-unit" style="color:var(--text-muted); font-size:0.82rem;">${rawIngs[0]?.baseUnit || 'g'}</span>
      <button class="btn btn-danger btn-sm" onclick="document.getElementById('${rowId}').remove(); AppController.recalcProductModalPreview();">✕</button>
    `;

    container.appendChild(div);
    const sel = div.querySelector('.prod-raw-select');
    const qty = div.querySelector('.prod-raw-qty');
    const unit = div.querySelector('.prod-raw-unit');

    const update = () => {
      const opt = sel.options[sel.selectedIndex];
      if (opt && unit) unit.textContent = opt.getAttribute('data-unit') || 'g';
      this.recalcProductModalPreview();
    };
    sel.addEventListener('change', update);
    qty.addEventListener('input', () => this.recalcProductModalPreview());
    update();
  },

  addProductPkgRow(selectedId = null, defaultAmount = 1) {
    const container = document.getElementById('prod-pkg-container');
    if (!container) return;
    const pkgs = (window.AppStore.state.ingredients || []).filter(i => i.category === 'Bao bì & Ly');
    const rowId = 'prod-pkg-row-' + Date.now().toString().slice(-6);

    const div = document.createElement('div');
    div.className = 'recipe-ingredient-row';
    div.id = rowId;
    div.innerHTML = `
      <select class="form-control prod-pkg-select">
        ${pkgs.map(i => `<option value="${i.id}" data-cost="${i.unitCost}" ${i.id === selectedId ? 'selected' : ''}>
          ${i.name} (${window.CostEngine.formatCurrency(i.unitCost)}/cái)
        </option>`).join('')}
      </select>
      <input type="number" class="form-control prod-pkg-qty" value="${defaultAmount}" min="1" step="1" style="width:80px;">
      <span style="color:var(--text-muted); font-size:0.82rem;">cái</span>
      <button class="btn btn-danger btn-sm" onclick="document.getElementById('${rowId}').remove(); AppController.recalcProductModalPreview();">✕</button>
    `;

    container.appendChild(div);
    const sel = div.querySelector('.prod-pkg-select');
    const qty = div.querySelector('.prod-pkg-qty');
    sel.addEventListener('change', () => this.recalcProductModalPreview());
    qty.addEventListener('input', () => this.recalcProductModalPreview());
  },

  recalcProductModalPreview() {
    const ingMap = window.AppStore.getIngredientsMap();
    const subMap = window.AppStore.getSubRecipesMap();
    let totalCogs = 0;

    document.querySelectorAll('#prod-sub-container .recipe-ingredient-row').forEach(row => {
      const sel = row.querySelector('.prod-sub-select');
      const qty = Number(row.querySelector('.prod-sub-qty')?.value || 0);
      const opt = sel?.options[sel.selectedIndex];
      const unitCost = Number(opt?.getAttribute('data-cost') || 0);
      totalCogs += unitCost * qty;
    });

    document.querySelectorAll('#prod-raw-container .recipe-ingredient-row').forEach(row => {
      const sel = row.querySelector('.prod-raw-select');
      const qty = Number(row.querySelector('.prod-raw-qty')?.value || 0);
      const opt = sel?.options[sel.selectedIndex];
      const unitCost = Number(opt?.getAttribute('data-cost') || 0);
      totalCogs += unitCost * qty;
    });

    document.querySelectorAll('#prod-pkg-container .recipe-ingredient-row').forEach(row => {
      const sel = row.querySelector('.prod-pkg-select');
      const qty = Number(row.querySelector('.prod-pkg-qty')?.value || 0);
      const opt = sel?.options[sel.selectedIndex];
      const unitCost = Number(opt?.getAttribute('data-cost') || 0);
      totalCogs += unitCost * qty;
    });

    const price = Number(document.getElementById('prod-price')?.value || 0);
    const margin = price > 0 ? (((price - totalCogs) / price) * 100).toFixed(1) : 0;

    const el = document.getElementById('prod-preview-cogs');
    const elM = document.getElementById('prod-preview-margin');
    if (el) el.textContent = window.CostEngine.formatCurrency(totalCogs);
    if (elM) elM.textContent = `${margin}%`;
  },

  submitProduct() {
    const id = document.getElementById('prod-id').value;
    const name = document.getElementById('prod-name').value.trim();
    if (!name) { UI.showToast('Cảnh báo', 'Vui lòng nhập tên món', 'warning'); return; }

    const category = document.getElementById('prod-category').value;
    const sizeSelect = document.getElementById('prod-size');
    const customSizeInput = document.getElementById('prod-size-custom');
    let size = sizeSelect?.value || 'Size M (500ml)';
    if (size === 'custom') size = customSizeInput?.value.trim() || 'Size M';

    const sellingPrice = Number(document.getElementById('prod-price').value) || 35000;
    const appSellingPrice = Number(document.getElementById('prod-app-price').value) || Math.round(sellingPrice * 1.2);

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

    const prod = { id: id || undefined, name, category, size, sellingPrice, appSellingPrice, subRecipes, rawIngredients, packaging };
    window.AppStore.saveProduct(prod);
    UI.closeModal('modal-product-dialog');
    this.renderRecipes();
    UI.showToast('Thành công', `Đã lưu món: ${name}`, 'success');
  }
};

// Khởi chạy ứng dụng
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.AppController.init());
} else {
  window.AppController.init();
}
