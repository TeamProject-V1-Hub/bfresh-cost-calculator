/**
 * STORE.JS - Quản lý Trạng thái & Lưu trữ LocalStorage cho F&B Costing & Inventory
 */

const STORAGE_KEY = 'tea_cost_fnb_v1';

window.AppStore = {
  state: {
    ingredients: [],
    subRecipes: [],
    products: [],
    suppliers: [],
    purchaseLogs: [],
    salesLogs: [],
    auditLogs: [],
    settings: {
      storeName: 'Tiệm Trà & Cafe Artisanal',
      storeSlogan: 'Chủ Quán / Quản Lý',
      appCommission: 0.25, // 25% Grab/Shopee
      theme: 'light', // Mặc định luôn là 'light' (Giao diện Sáng)
      accent: 'matcha', // 'matcha' | 'peach' | 'coffee' | 'berry' | 'cyan'
      density: 'comfortable', // 'comfortable' | 'compact'
      fontSize: 'normal', // 'normal' | 'large' | 'small'
      currentRole: 'owner', // 'owner' | 'staff'
      securityPin: '8888', // Mặc định 8888
      kiotvietConfig: {
        retailer: '',
        clientId: '',
        clientSecret: '',
        proxyUrl: ''
      }
    }
  },

  listeners: [],

  /**
   * Đăng ký callback khi state thay đổi
   */
  subscribe(fn) {
    this.listeners.push(fn);
  },

  notify() {
    this.listeners.forEach(fn => fn(this.state));
  },

  /**
   * Khởi tạo dữ liệu từ LocalStorage hoặc Seed Data
   */
  init() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        this.state = Object.assign({}, this.state, parsed);
        
        // Đảm bảo settings đầy đủ các trường
        this.state.settings = Object.assign({
          storeName: 'Tiệm Trà & Cafe Artisanal',
          storeSlogan: 'Chủ Quán / Quản Lý',
          appCommission: 0.25,
          theme: 'light',
          accent: 'matcha',
          density: 'comfortable',
          fontSize: 'normal',
          currentRole: 'owner',
          securityPin: '8888',
          kiotvietConfig: {
            retailer: '',
            clientId: '',
            clientSecret: '',
            proxyUrl: ''
          }
        }, this.state.settings || {});

        // Đảm bảo mặc định ban đầu luôn là chế độ Sáng (Light Mode) theo yêu cầu
        if (!this.state.settings.theme || this.state.settings.theme === 'dark') {
          this.state.settings.theme = 'light';
        }

        // Tự động kiểm tra và đảm bảo có dữ liệu bán hàng cho 7 ngày gần nhất
        this.ensureWeeklySalesData();

        // Đồng bộ ảnh mặc định cho các món và chuẩn hóa ảnh SVG sang Base64 an toàn
        const sanitizeSvgImage = (img) => {
          if (!img || typeof img !== 'string') return img;
          let trimmed = img.trim();
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
          if (trimmed.startsWith('data:image/svg+xml;utf8,') || (trimmed.startsWith('data:image/svg+xml') && (trimmed.includes('"') || trimmed.includes('<') || trimmed.includes('%23')))) {
            const commaIdx = trimmed.indexOf(',');
            let rawSvg = commaIdx !== -1 ? trimmed.slice(commaIdx + 1) : trimmed;
            rawSvg = rawSvg.replace(/%23/g, '#');
            try {
              return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(rawSvg)));
            } catch (e) {
              return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(rawSvg);
            }
          }
          if (trimmed.startsWith('<svg')) {
            const clean = trimmed.replace(/%23/g, '#');
            try {
              return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(clean)));
            } catch (e) {
              return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(clean);
            }
          }
          return trimmed;
        };

        if (Array.isArray(this.state.products)) {
          this.state.products.forEach(p => {
            const seedProd = window.SEED_DATA && window.SEED_DATA.products ? window.SEED_DATA.products.find(sp => sp.id === p.id) : null;
            if (!p.image && seedProd && seedProd.image) {
              p.image = seedProd.image;
            } else if (seedProd && seedProd.image && (typeof p.image !== 'string' || p.image.includes('%23') || p.image.length < 60 || p.image.includes('%23teaM') || p.image.includes('%231e293b'))) {
              p.image = seedProd.image;
            }
            if (p.image) {
              p.image = sanitizeSvgImage(p.image);
            }
          });
        }
      } catch (err) {
        console.error('Lỗi phân tích LocalStorage, tải lại seed data:', err);
        this.resetToDefault();
      }
    } else {
      this.resetToDefault();
    }
    this.save(false);
  },

  /**
   * Cập nhật các tùy chọn giao diện và thông tin cửa hàng
   */
  updateSettings(newSettings) {
    this.state.settings = Object.assign({}, this.state.settings, newSettings);
    this.save(true);
    if (window.ThemeManager && typeof window.ThemeManager.applySettings === 'function') {
      window.ThemeManager.applySettings(this.state.settings);
    }
    return this.state.settings;
  },

  /**
   * Khôi phục cài đặt giao diện về mặc định ban đầu
   */
  resetSettingsToDefault() {
    this.state.settings = {
      storeName: 'Tiệm Trà & Cafe Artisanal',
      storeSlogan: 'Chủ Quán / Quản Lý',
      appCommission: 0.25,
      theme: 'light',
      accent: 'matcha',
      density: 'comfortable',
      fontSize: 'normal'
    };
    this.save(true);
    if (window.ThemeManager && typeof window.ThemeManager.applySettings === 'function') {
      window.ThemeManager.applySettings(this.state.settings);
    }
    return this.state.settings;
  },

  /**
   * Phân tích an toàn ngày tháng từ log bán hàng bất kể định dạng (ISO, VN, Timestamp)
   */
  parseDateHelper(log) {
    if (!log) return null;
    if (log.timestamp && !isNaN(log.timestamp)) return new Date(log.timestamp);
    if (log.date) {
      const str = String(log.date).trim();
      const iso = str.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
      if (iso) return new Date(parseInt(iso[1], 10), parseInt(iso[2], 10) - 1, parseInt(iso[3], 10));
      const vn = str.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
      if (vn) return new Date(parseInt(vn[3], 10), parseInt(vn[2], 10) - 1, parseInt(vn[1], 10));
      const d = new Date(str);
      if (!isNaN(d.getTime())) return d;
    }
    return null;
  },

  /**
   * Đảm bảo luôn có dữ liệu 7 ngày gần nhất để biểu đồ bán hàng không bị rỗng
   */
  ensureWeeklySalesData() {
    const logs = this.state.salesLogs;
    if (!Array.isArray(logs) || logs.length === 0) {
      if (typeof window.generateSeedSalesLogs === 'function') {
        this.state.salesLogs = window.generateSeedSalesLogs();
        return true;
      }
      return false;
    }

    const now = new Date();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);

    // Tự động loại bỏ bất kỳ log nào rơi vào ngày tương lai để bảo đảm số liệu tương lai = 0
    this.state.salesLogs = (this.state.salesLogs || []).filter(log => {
      const d = this.parseDateHelper(log);
      return !d || d <= todayEnd;
    });

    let hasRecentLog = false;
    for (const log of this.state.salesLogs) {
      const d = this.parseDateHelper(log);
      if (d && d >= sevenDaysAgo && d <= todayEnd) {
        hasRecentLog = true;
        break;
      }
    }

    if (!hasRecentLog && typeof window.generateSeedSalesLogs === 'function') {
      this.state.salesLogs = window.generateSeedSalesLogs();
      return true;
    }
    return false;
  },

  /**
   * Nạp lại dữ liệu 7 ngày bán hàng mẫu chuẩn F&B theo thời gian thực tế
   */
  resetSalesToWeeklySeed() {
    if (typeof window.generateSeedSalesLogs === 'function') {
      this.state.salesLogs = window.generateSeedSalesLogs();
      this.save(true);
      if (window.UI && typeof window.UI.showToast === 'function') {
        window.UI.showToast('success', 'Đã nạp thành công 7 ngày số liệu bán hàng mẫu!');
      }
      return true;
    }
    return false;
  },

  /**
   * Khôi phục toàn bộ dữ liệu mẫu chuẩn F&B
   */
  resetToDefault() {
    if (window.SEED_DATA) {
      this.state.ingredients = JSON.parse(JSON.stringify(window.SEED_DATA.ingredients || []));
      this.state.subRecipes = JSON.parse(JSON.stringify(window.SEED_DATA.subRecipes || []));
      this.state.products = JSON.parse(JSON.stringify(window.SEED_DATA.products || []));
      this.state.suppliers = JSON.parse(JSON.stringify(window.SEED_DATA.suppliers || []));
      this.state.purchaseLogs = JSON.parse(JSON.stringify(window.SEED_DATA.purchaseLogs || []));
      if (typeof window.generateSeedSalesLogs === 'function') {
        this.state.salesLogs = window.generateSeedSalesLogs();
      } else {
        this.state.salesLogs = JSON.parse(JSON.stringify(window.SEED_DATA.salesLogs || []));
      }
      this.state.auditLogs = [];
      this.save(true);
    }
  },

  save(shouldNotify = true) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    if (shouldNotify) {
      this.notify();
    }
  },

  // --- MAP HỖ TRỢ TRA CỨU NHANH THEO ID ---
  getIngredientsMap() {
    const map = {};
    (this.state.ingredients || []).forEach(item => {
      map[item.id] = item;
    });
    return map;
  },

  getSubRecipesMap() {
    const map = {};
    (this.state.subRecipes || []).forEach(item => {
      map[item.id] = item;
    });
    return map;
  },

  getSuppliersMap() {
    const map = {};
    (this.state.suppliers || []).forEach(item => {
      map[item.id] = item;
    });
    return map;
  },

  // --- THAO TÁC NGUYÊN LIỆU (INGREDIENTS) ---
  saveIngredient(data) {
    const isNew = !data.id;
    if (isNew) {
      data.id = 'ING-' + Date.now().toString().slice(-6);
      this.state.ingredients.unshift(data);
    } else {
      const idx = this.state.ingredients.findIndex(i => i.id === data.id);
      if (idx !== -1) {
        this.state.ingredients[idx] = Object.assign({}, this.state.ingredients[idx], data);
      }
    }
    this.save();
    return data;
  },

  deleteIngredient(id) {
    this.state.ingredients = this.state.ingredients.filter(i => i.id !== id);
    this.save();
  },

  // --- THAO TÁC BÁN THÀNH PHẨM (SUB-RECIPES) ---
  saveSubRecipe(data) {
    const isNew = !data.id;
    if (isNew) {
      data.id = 'SUB-' + Date.now().toString().slice(-6);
      this.state.subRecipes.unshift(data);
    } else {
      const idx = this.state.subRecipes.findIndex(s => s.id === data.id);
      if (idx !== -1) {
        this.state.subRecipes[idx] = Object.assign({}, this.state.subRecipes[idx], data);
      }
    }
    this.save();
    return data;
  },

  deleteSubRecipe(id) {
    this.state.subRecipes = this.state.subRecipes.filter(s => s.id !== id);
    this.save();
  },

  // --- THAO TÁC MÓN MENU (PRODUCTS) ---
  saveProduct(data) {
    const isNew = !data.id;
    if (isNew) {
      data.id = 'PROD-' + Date.now().toString().slice(-6);
      this.state.products.unshift(data);
    } else {
      const idx = this.state.products.findIndex(p => p.id === data.id);
      if (idx !== -1) {
        this.state.products[idx] = Object.assign({}, this.state.products[idx], data);
      }
    }
    this.save();
    return data;
  },

  deleteProduct(id) {
    this.state.products = this.state.products.filter(p => p.id !== id);
    this.save();
  },

  // --- NHẬP HÀNG & CẬP NHẬT TỒN KHO (STOCK IN) ---
  addPurchaseOrder(po) {
    po.id = 'PNK-' + Date.now().toString().slice(-5);
    po.date = new Date().toLocaleString('vi-VN');

    const ingredientsMap = this.getIngredientsMap();

    // Cập nhật từng dòng nhập
    (po.items || []).forEach(item => {
      const ing = ingredientsMap[item.ingredientId];
      if (ing) {
        const incomingQty = Number(item.qty);
        const incomingPrice = Number(item.price);
        const ratio = Number(ing.ratioToBase || 1);

        // Tính lại giá bình quân gia quyền
        const newCost = window.CostEngine.calculateNewAverageCost(
          ing.stockQty,
          ing.unitCost,
          incomingQty,
          incomingPrice,
          ratio
        );

        ing.unitCost = newCost;
        ing.purchasePrice = incomingPrice;
        ing.stockQty = (ing.stockQty || 0) + (incomingQty * ratio);
      }
    });

    this.state.purchaseLogs.unshift(po);
    this.save();
  },

  // --- BÁN HÀNG & TRỪ TỒN KHO TỰ ĐỘNG (POS CONSUMPTION) ---
  processSaleBatch(salesList, shiftName = 'Chốt Ca') {
    // salesList: [ { productId, qty, price } ]
    const ingredientsMap = this.getIngredientsMap();
    const subRecipesMap = this.getSubRecipesMap();

    let totalCups = 0;
    let totalRevenue = 0;
    let totalEstimatedCogs = 0;
    const deductionsAggregate = {}; // { ingredientId: totalAmount }

    salesList.forEach(sale => {
      if (!sale.qty || sale.qty <= 0) return;

      const prod = this.state.products.find(p => p.id === sale.productId);
      if (!prod) return;

      const qty = Number(sale.qty);
      totalCups += qty;
      totalRevenue += (sale.price || prod.sellingPrice) * qty;

      // Tính giá vốn món
      const cogsInfo = window.CostEngine.calculateProductCogs(prod, ingredientsMap, subRecipesMap);
      if (cogsInfo) {
        totalEstimatedCogs += cogsInfo.totalCogs * qty;
      }

      // Phân rã khấu trừ nguyên liệu
      const deductions = window.CostEngine.explodeProductConsumption(prod, qty, subRecipesMap);
      Object.keys(deductions).forEach(ingId => {
        deductionsAggregate[ingId] = (deductionsAggregate[ingId] || 0) + deductions[ingId];
      });
    });

    // Trừ kho thực tế
    Object.keys(deductionsAggregate).forEach(ingId => {
      const ing = ingredientsMap[ingId];
      if (ing) {
        ing.stockQty = Math.max(0, (ing.stockQty || 0) - deductionsAggregate[ingId]);
      }
    });

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const formattedDate = `${yyyy}-${mm}-${dd} ${hh}:${min}`;

    const enrichedSalesItems = salesList.map(s => {
      const prod = this.state.products.find(p => p.id === s.productId);
      const unitPrice = s.price || (prod ? prod.sellingPrice : 0);
      const qty = Number(s.qty) || 0;
      return {
        productId: s.productId,
        productName: prod ? prod.name : s.productId,
        qty: qty,
        unitPrice: unitPrice,
        revenue: qty * unitPrice
      };
    });

    const saleRecord = {
      id: 'POS-' + Date.now().toString().slice(-6),
      date: formattedDate,
      timestamp: now.getTime(),
      shift: shiftName,
      totalCups,
      revenue: totalRevenue,
      estimatedCogs: Math.round(totalEstimatedCogs),
      grossProfit: Math.round(totalRevenue - totalEstimatedCogs),
      salesItems: enrichedSalesItems,
      deductions: deductionsAggregate
    };

    this.state.salesLogs.unshift(saleRecord);
    this.save();

    return saleRecord;
  },

  // --- KIỂM KÊ KHO (STOCK AUDIT) ---
  saveAuditLog(auditData) {
    auditData.id = 'KK-' + Date.now().toString().slice(-5);
    auditData.date = new Date().toLocaleString('vi-VN');

    // Cột tồn trên máy chỉ thay đổi theo kết quả bán hàng/nhập hàng, KHÔNG bị biến đổi khi kiểm kê thực tế
    // Lịch sử kiểm kê chỉ lưu các hạng mục có sai lệch tăng/giảm để đối chiếu theo dõi (không lưu khi chênh lệch = 0)
    const discrepantItems = (auditData.items || []).filter(item => {
      const diff = Number(item.diff || 0);
      return Math.abs(diff) > 0.0001;
    });

    if (discrepantItems.length === 0) {
      return { success: false, reason: 'no_discrepancy' };
    }

    auditData.items = discrepantItems;
    auditData.totalDiscrepancies = discrepantItems.length;

    if (!Array.isArray(this.state.auditLogs)) {
      this.state.auditLogs = [];
    }
    this.state.auditLogs.unshift(auditData);
    this.save();
    return { success: true, count: discrepantItems.length };
  },

  // --- XUẤT / NHẬP DỮ LIỆU & SAO LƯU ---
  exportBackupJSON() {
    const dataStr = JSON.stringify(this.state, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BobaFlow_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  },

  loadState(data) {
    if (data && (data.ingredients || data.products)) {
      this.state = Object.assign({}, this.state, data);
      this.save(true);
      return true;
    }
    throw new Error('Dữ liệu sao lưu không hợp lệ!');
  },

  importBackupJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data && (data.ingredients || data.products)) {
            this.state = Object.assign({}, this.state, data);
            this.save(true);
            resolve(true);
          } else {
            reject(new Error('Định dạng tệp không hợp lệ!'));
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsText(file);
    });
  },

  exportIngredientsCSV() {
    let csv = '\uFEFF'; // BOM UTF-8 cho Excel tiếng Việt không bị lỗi font
    csv += 'Mã NVL,Tên Nguyên Liệu,Danh Mục,Đơn Vị Nhập,Đơn Vị Cơ Bản,Tỷ Lệ Quy Đổi,Đơn Giá Nhập,Giá Vốn Cơ Bản (VND),Tồn Kho Hiện Tại,Định Mức Tối Thiểu,Tình Trạng\n';

    this.state.ingredients.forEach(i => {
      const status = i.stockQty <= 0 ? 'Hết hàng' : (i.stockQty <= i.minStock ? 'Sắp hết' : 'Còn hàng');
      csv += `"${i.id}","${i.name}","${i.category}","${i.purchaseUnit}","${i.baseUnit}",${i.ratioToBase},${i.purchasePrice},${i.unitCost},${i.stockQty},${i.minStock},"${status}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TonKho_NguyenLieu_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  },

  /**
   * Tải về File Mẫu Excel (.xlsx) chuẩn có thanh cuộn Data Validation và tô vàng Cột D
   */
  downloadCsvTemplate() {
    // Tải file .xlsx chính thức có sẵn thanh cuộn Dropdown
    const link = document.createElement('a');
    link.href = 'templates/Bieu_Mau_Nhap_Nguyen_Lieu_BobaFlow.xlsx';
    link.download = 'Bieu_Mau_Nhap_Nguyen_Lieu_BobaFlow.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Chuẩn hóa đơn vị thông minh - Chống lỗi khi nhân viên tự gõ tay
   * (VD: gõ 'gram', 'gr', 'g.' -> 'g'; 'milit', 'mililit', 'cc' -> 'ml'; 'chiếc', 'ly', 'nắp' -> 'cái')
   */
  normalizeUnit(rawUnit, category = '', purchaseUnit = '') {
    if (!rawUnit || !rawUnit.trim()) {
      if (category.includes('Bao bì')) return 'cái';
      if ((purchaseUnit || '').toLowerCase().includes('ml') || (purchaseUnit || '').toLowerCase().includes('lít')) return 'ml';
      return 'g';
    }
    const u = rawUnit.toLowerCase().trim();
    if (['g', 'gr', 'gram', 'gam', 'g.', 'gr.'].includes(u)) return 'g';
    if (['ml', 'milit', 'mililit', 'mlit', 'cc', 'ml.', 'lit', 'lít', 'l'].includes(u)) return 'ml';
    if (['cái', 'cai', 'chiếc', 'chiec', 'ly', 'nắp', 'nap', 'ống', 'ong', 'túi', 'tui', 'cây', 'cuộn', 'muỗng', 'thìa'].includes(u)) return 'cái';
    if (['lát', 'lat', 'miếng', 'mieng'].includes(u)) return 'lát';
    if (['quả', 'qua', 'trái', 'trai'].includes(u)) return 'quả';
    if (['hộp', 'hop', 'lon', 'hũ', 'hu'].includes(u)) return 'hộp';
    return rawUnit.trim(); // Nếu là đơn vị tự nhập tay đặc thù khác, giữ nguyên
  },

  /**
   * Chuẩn hóa danh mục thông minh
   */
  normalizeCategory(rawCat) {
    if (!rawCat || !rawCat.trim()) return 'Trà lá';
    const c = rawCat.toLowerCase().trim();
    if (c.includes('trà') || c.includes('tra') || c.includes('tea')) return 'Trà lá';
    if (c.includes('sữa') || c.includes('sua') || c.includes('bột') || c.includes('bot') || c.includes('kem') || c.includes('cheese')) return 'Sữa & Bột béo';
    if (c.includes('đường') || c.includes('duong') || c.includes('siro') || c.includes('syrup') || c.includes('mứt') || c.includes('mut')) return 'Đường & Syrup';
    if (c.includes('topping') || c.includes('trân châu') || c.includes('thạch') || c.includes('flan') || c.includes('pudding')) return 'Topping thô';
    if (c.includes('trái cây') || c.includes('trai cay') || c.includes('hoa quả') || c.includes('cam') || c.includes('chanh') || c.includes('sả')) return 'Trái cây tươi';
    if (c.includes('bao bì') || c.includes('bao bi') || c.includes('ly') || c.includes('nắp') || c.includes('hút') || c.includes('túi')) return 'Bao bì & Ly';
    if (c.includes('đá') || c.includes('da')) return 'Đá & Khác';
    return rawCat.trim();
  },

  /**
   * Phân tích và nạp hàng loạt nguyên liệu từ nội dung file Excel / CSV
   */
  importIngredientsFromCSV(csvText) {
    if (!csvText || !csvText.trim()) throw new Error('Tệp dữ liệu trống!');

    // Tách dòng
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) throw new Error('Tệp không có dữ liệu hàng!');

    // Bỏ qua dòng tiêu đề
    let successCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Tách các cột có hỗ trợ dấu ngoặc kép
      const cols = [];
      let inQuote = false;
      let buffer = '';

      for (let c = 0; c < line.length; c++) {
        const char = line[c];
        if (char === '"') {
          inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
          cols.push(buffer.trim().replace(/^"|"$/g, ''));
          buffer = '';
        } else {
          buffer += char;
        }
      }
      cols.push(buffer.trim().replace(/^"|"$/g, ''));

      // Kiểm tra có tên nguyên liệu
      const name = cols[0];
      if (!name) continue;

      const category = this.normalizeCategory(cols[1]);
      const purchaseUnit = cols[2] || 'Gói 1kg';
      // Áp dụng bộ chuẩn hóa đơn vị tự động để nhân viên gõ tay không bị sai định dạng
      const baseUnit = this.normalizeUnit(cols[3], category, purchaseUnit);
      const ratioToBase = Number(cols[4]) || (baseUnit === 'ml' ? 1000 : (baseUnit === 'cái' ? 50 : 1000));
      const purchasePrice = Number(cols[5]) || 0;
      const stockQty = Number(cols[6]) || 0;
      const minStock = Number(cols[7]) || (ratioToBase > 100 ? 500 : 50);

      const unitCost = ratioToBase > 0 ? parseFloat((purchasePrice / ratioToBase).toFixed(2)) : purchasePrice;

      // Kiểm tra xem đã có nguyên liệu này chưa, nếu có thì cập nhật, chưa thì thêm mới
      const existing = this.state.ingredients.find(item => item.name.toLowerCase() === name.toLowerCase());
      if (existing) {
        existing.category = category;
        existing.purchaseUnit = purchaseUnit;
        existing.baseUnit = baseUnit;
        existing.ratioToBase = ratioToBase;
        existing.purchasePrice = purchasePrice;
        existing.unitCost = unitCost;
        if (stockQty > 0) existing.stockQty = stockQty;
        existing.minStock = minStock;
      } else {
        const newIng = {
          id: 'ING-' + Date.now().toString().slice(-5) + Math.floor(Math.random() * 100),
          name,
          category,
          supplierId: 'SUP-01',
          purchaseUnit,
          baseUnit,
          ratioToBase,
          purchasePrice,
          unitCost,
          stockQty,
          minStock,
          shelfLifeDays: 365
        };
        this.state.ingredients.push(newIng);
      }
      successCount++;
    }

    this.save();
    return successCount;
  },

  /**
   * Nạp nhanh danh sách nguyên liệu chọn từ Thư Viện F&B Chuẩn
   */
  addIngredientsFromCatalog(catalogItems) {
    if (!catalogItems || catalogItems.length === 0) return 0;
    let addedCount = 0;

    catalogItems.forEach(catItem => {
      const existing = this.state.ingredients.find(i => i.name.toLowerCase() === catItem.name.toLowerCase());
      const unitCost = parseFloat(((catItem.purchasePrice || 0) / (catItem.ratioToBase || 1)).toFixed(2));

      if (existing) {
        existing.purchasePrice = catItem.purchasePrice;
        existing.unitCost = unitCost;
        existing.ratioToBase = catItem.ratioToBase;
      } else {
        const newIng = {
          id: 'ING-' + Date.now().toString().slice(-5) + Math.floor(Math.random() * 1000),
          name: catItem.name,
          category: catItem.category,
          supplierId: 'SUP-01',
          purchaseUnit: catItem.purchaseUnit,
          baseUnit: catItem.baseUnit,
          ratioToBase: catItem.ratioToBase,
          purchasePrice: catItem.purchasePrice,
          unitCost: unitCost,
          stockQty: catItem.ratioToBase * 2, // Mặc định cho tồn 2 quy cách
          minStock: catItem.minStock || 500,
          shelfLifeDays: 365
        };
        this.state.ingredients.push(newIng);
        addedCount++;
      }
    });

    this.save();
    return addedCount;
  },

  // --- QUẢN TRỊ PHÂN QUYỀN (RBAC & SECURITY PIN) ---
  getRole() {
    return this.state.settings.currentRole || 'owner';
  },

  setRole(role) {
    this.state.settings.currentRole = (role === 'staff') ? 'staff' : 'owner';
    this.save();
    this.notify();
    return this.state.settings.currentRole;
  },

  verifyPin(pin) {
    const masterPin = String(this.state.settings.securityPin || '8888').trim();
    return String(pin).trim() === masterPin;
  },

  updatePin(oldPin, newPin) {
    if (!this.verifyPin(oldPin)) {
      return { success: false, message: 'Mã PIN hiện tại không chính xác!' };
    }
    const cleanNew = String(newPin || '').trim();
    if (!/^\d{4,6}$/.test(cleanNew)) {
      return { success: false, message: 'Mã PIN mới phải gồm 4 đến 6 chữ số!' };
    }
    this.state.settings.securityPin = cleanNew;
    this.save();
    return { success: true, message: 'Đổi Mã PIN quản trị thành công!' };
  },

  // --- CẤU HÌNH KẾT NỐI KIOTVIET OPEN API ---
  getKiotConfig() {
    return this.state.settings.kiotvietConfig || {
      retailer: '',
      clientId: '',
      clientSecret: '',
      proxyUrl: ''
    };
  },

  saveKiotConfig(config) {
    if (!this.state.settings.kiotvietConfig) {
      this.state.settings.kiotvietConfig = {};
    }
    this.state.settings.kiotvietConfig = Object.assign({}, this.getKiotConfig(), config || {});
    this.save();
    return this.state.settings.kiotvietConfig;
  }
};
