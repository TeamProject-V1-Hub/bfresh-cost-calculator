/**
 * ENGINE.JS - Bộ Máy Tính Toán Nghiệp Vụ Định Lượng, Giá Vốn & Tồn Kho F&B
 */

window.CostEngine = {
  /**
   * Tính giá vốn 1 mẻ bán thành phẩm (Sub-recipe) và đơn giá trên mỗi ml/g
   */
  calculateSubRecipeCost(subRecipe, ingredientsMap) {
    if (!subRecipe || !subRecipe.ingredients) {
      return { totalBatchCost: 0, unitCost: 0, itemsBreakdown: [] };
    }

    let totalBatchCost = 0;
    const itemsBreakdown = subRecipe.ingredients.map(item => {
      const ing = ingredientsMap[item.ingredientId];
      const unitCost = ing ? ing.unitCost : 0;
      const lineCost = unitCost * (item.amount || 0);
      totalBatchCost += lineCost;

      return {
        ingredientId: item.ingredientId,
        name: ing ? ing.name : 'Chưa rõ',
        amount: item.amount,
        unit: item.unit || (ing ? ing.baseUnit : ''),
        unitCost: unitCost,
        lineCost: Math.round(lineCost)
      };
    });

    const outputQty = subRecipe.outputQty || 1;
    const unitCost = totalBatchCost / outputQty;

    return {
      totalBatchCost: Math.round(totalBatchCost),
      unitCost: parseFloat(unitCost.toFixed(2)),
      outputQty: outputQty,
      outputUnit: subRecipe.outputUnit || 'g',
      itemsBreakdown
    };
  },

  /**
   * Tính toán toàn diện giá vốn (COGS) & Biên lợi nhuận của 1 Món Menu hoàn chỉnh
   */
  calculateProductCogs(product, ingredientsMap, subRecipesMap, appCommissionRate = 0.25) {
    if (!product) return null;

    let subRecipesCost = 0;
    const subRecipesBreakdown = (product.subRecipes || []).map(item => {
      const sub = subRecipesMap[item.subRecipeId];
      let itemUnitCost = 0;
      let subName = 'Bán thành phẩm';

      if (sub) {
        subName = sub.name;
        // Tính giá vốn tức thời của bán thành phẩm theo giá nguyên liệu hiện tại
        const calc = this.calculateSubRecipeCost(sub, ingredientsMap);
        itemUnitCost = calc.unitCost;
      }

      const lineCost = itemUnitCost * (item.amount || 0);
      subRecipesCost += lineCost;

      return {
        id: item.subRecipeId,
        name: subName,
        amount: item.amount,
        unit: item.unit,
        unitCost: itemUnitCost,
        lineCost: Math.round(lineCost)
      };
    });

    let rawIngredientsCost = 0;
    const rawBreakdown = (product.rawIngredients || []).map(item => {
      const ing = ingredientsMap[item.ingredientId];
      const unitCost = ing ? ing.unitCost : 0;
      const lineCost = unitCost * (item.amount || 0);
      rawIngredientsCost += lineCost;

      return {
        id: item.ingredientId,
        name: ing ? ing.name : 'Nguyên liệu',
        amount: item.amount,
        unit: item.unit || (ing ? ing.baseUnit : ''),
        unitCost: unitCost,
        lineCost: Math.round(lineCost)
      };
    });

    let packagingCost = 0;
    const packagingBreakdown = (product.packaging || []).map(item => {
      const pkg = ingredientsMap[item.packagingId];
      const unitCost = pkg ? pkg.unitCost : 0;
      const lineCost = unitCost * (item.amount || 0);
      packagingCost += lineCost;

      return {
        id: item.packagingId,
        name: pkg ? pkg.name : 'Bao bì',
        amount: item.amount,
        unit: 'cái',
        unitCost: unitCost,
        lineCost: Math.round(lineCost)
      };
    });

    // Tổng Giá Vốn (Total Cost of Goods Sold)
    const totalCogs = Math.round(subRecipesCost + rawIngredientsCost + packagingCost);
    const sellingPrice = product.sellingPrice || 0;
    const appSellingPrice = product.appSellingPrice || Math.round(sellingPrice * 1.2);

    // Biên lợi nhuận tại quán (In-store)
    const inStoreGrossProfit = sellingPrice - totalCogs;
    const foodCostPct = sellingPrice > 0 ? ((totalCogs / sellingPrice) * 100) : 0;
    const inStoreMarginPct = sellingPrice > 0 ? ((inStoreGrossProfit / sellingPrice) * 100) : 0;

    // Biên lợi nhuận trên App Giao Hàng (Grab/Shopee - commission 20-25%)
    const appNetRevenue = appSellingPrice * (1 - appCommissionRate);
    const appGrossProfit = Math.round(appNetRevenue - totalCogs);
    const appMarginPct = appSellingPrice > 0 ? ((appGrossProfit / appSellingPrice) * 100) : 0;

    // Phân bổ tỷ trọng chi phí
    const packagingSharePct = totalCogs > 0 ? ((packagingCost / totalCogs) * 100) : 0;
    const ingredientsSharePct = totalCogs > 0 ? (((subRecipesCost + rawIngredientsCost) / totalCogs) * 100) : 0;

    return {
      subRecipesCost: Math.round(subRecipesCost),
      rawIngredientsCost: Math.round(rawIngredientsCost),
      packagingCost: Math.round(packagingCost),
      totalCogs,
      sellingPrice,
      appSellingPrice,
      inStoreGrossProfit,
      foodCostPct: parseFloat(foodCostPct.toFixed(1)),
      inStoreMarginPct: parseFloat(inStoreMarginPct.toFixed(1)),
      appGrossProfit,
      appMarginPct: parseFloat(appMarginPct.toFixed(1)),
      packagingSharePct: parseFloat(packagingSharePct.toFixed(1)),
      ingredientsSharePct: parseFloat(ingredientsSharePct.toFixed(1)),
      subRecipesBreakdown,
      rawBreakdown,
      packagingBreakdown
    };
  },

  /**
   * Phân rã định lượng BOM để tự động trừ kho nguyên liệu khi bán món (BOM Explosion)
   */
  explodeProductConsumption(product, quantity, subRecipesMap) {
    const rawDeductions = {}; // { ingredientId: totalAmount }

    // 1. Trừ nguyên liệu dùng trực tiếp
    (product.rawIngredients || []).forEach(item => {
      rawDeductions[item.ingredientId] = (rawDeductions[item.ingredientId] || 0) + (item.amount * quantity);
    });

    // 2. Trừ bao bì vật tư
    (product.packaging || []).forEach(item => {
      rawDeductions[item.packagingId] = (rawDeductions[item.packagingId] || 0) + (item.amount * quantity);
    });

    // 3. Phân rã bán thành phẩm về nguyên liệu thô ban đầu
    (product.subRecipes || []).forEach(subItem => {
      const sub = subRecipesMap[subItem.subRecipeId];
      if (sub && sub.ingredients && sub.outputQty > 0) {
        const totalSubNeeded = subItem.amount * quantity;
        const ratio = totalSubNeeded / sub.outputQty;

        sub.ingredients.forEach(subIng => {
          const rawNeeded = subIng.amount * ratio;
          rawDeductions[subIng.ingredientId] = (rawDeductions[subIng.ingredientId] || 0) + rawNeeded;
        });
      }
    });

    return rawDeductions;
  },

  /**
   * Tính toán lại giá vốn bình quân gia quyền (Weighted Average Cost) khi nhập kho
   */
  calculateNewAverageCost(currentStock, currentUnitCost, incomingQty, incomingPurchasePrice, ratioToBase) {
    const validCurrentStock = Math.max(0, currentStock || 0);
    const validCurrentCost = currentUnitCost || 0;

    const incomingBaseQty = (incomingQty || 0) * (ratioToBase || 1);
    const incomingBaseUnitCost = incomingBaseQty > 0 ? (incomingPurchasePrice / (incomingQty || 1) / ratioToBase) : 0;

    const totalQty = validCurrentStock + incomingBaseQty;
    if (totalQty <= 0) return 0;

    const totalValue = (validCurrentStock * validCurrentCost) + (incomingBaseQty * incomingBaseUnitCost);
    return parseFloat((totalValue / totalQty).toFixed(2));
  },

  /**
   * Định dạng tiền tệ VND chuyên nghiệp
   */
  formatCurrency(num) {
    if (num === null || num === undefined || isNaN(num)) return '0 đ';
    return Math.round(num).toLocaleString('vi-VN') + ' đ';
  },

  /**
   * Định dạng số có dấu phân cách hàng nghìn
   */
  formatNumber(num) {
    if (num === null || num === undefined || isNaN(num)) return '0';
    return Number(num).toLocaleString('vi-VN');
  },

  /**
   * Định dạng số lượng đơn vị
   */
  formatQty(qty, unit = '') {
    if (qty === null || qty === undefined || isNaN(qty)) return '0';
    const formatted = Number(qty) % 1 === 0 ? Number(qty).toLocaleString('vi-VN') : Number(qty).toFixed(1);
    return unit ? `${formatted} ${unit}` : formatted;
  }
};
