/**
 * SEED DATA - Dữ liệu thực chiến quán Trà Sữa & Trà Trái Cây F&B Việt Nam
 */

window.SEED_DATA = {
  // 1. NHÀ CUNG CẤP (Suppliers)
  suppliers: [
    {
      id: 'SUP-01',
      name: 'Kho Nguyên Liệu Trà Bảo Lộc',
      phone: '0903 123 456',
      contactPerson: 'Anh Tuấn',
      address: 'Bảo Lộc, Lâm Đồng',
      categories: ['Trà Olong', 'Hồng trà', 'Trà lài']
    },
    {
      id: 'SUP-02',
      name: 'Công Ty Gia Thịnh Phát F&B',
      phone: '028 3812 3456',
      contactPerson: 'Chị Mai',
      address: 'Tân Bình, TP.HCM',
      categories: ['Topping', 'Bột béo', 'Bột flan']
    },
    {
      id: 'SUP-03',
      name: 'Tân Nhất Hương Bakery & Barista',
      phone: '028 6290 8888',
      contactPerson: 'Anh Dũng',
      address: 'Quận 10, TP.HCM',
      categories: ['Syrup', 'Kem Richs', 'Cream Cheese']
    },
    {
      id: 'SUP-04',
      name: 'Xưởng In Ly & Bao Bì Nhựa Sài Gòn',
      phone: '0918 888 999',
      contactPerson: 'Chị Trang',
      address: 'Bình Tân, TP.HCM',
      categories: ['Ly nhựa', 'Nắp tim', 'Ống hút', 'Túi mang đi']
    },
    {
      id: 'SUP-05',
      name: 'Nông Sản Tươi Chợ Đầu Mối Thủ Đức',
      phone: '0937 555 777',
      contactPerson: 'Cô Năm',
      address: 'Thủ Đức, TP.HCM',
      categories: ['Cam sành', 'Chanh tươi', 'Sả cây', 'Xoài']
    }
  ],

  // 2. NGUYÊN LIỆU THÔ & VẬT TƯ BAO BÌ (Ingredients & Packagings)
  ingredients: [
    // --- NHÓM LÁ TRÀ ---
    {
      id: 'ING-TRA-01',
      name: 'Trà Olong Nướng Cao Cấp',
      category: 'Trà lá',
      supplierId: 'SUP-01',
      purchaseUnit: 'Gói 1kg',
      baseUnit: 'g',
      ratioToBase: 1000,
      purchasePrice: 280000, // 280.000đ / 1kg
      unitCost: 280,         // 280đ / g
      stockQty: 8500,        // Đang tồn 8.5kg (8500g)
      minStock: 2000,        // Báo động dưới 2kg
      shelfLifeDays: 365
    },
    {
      id: 'ING-TRA-02',
      name: 'Trà Xanh Hoa Lài Thượng Hạng',
      category: 'Trà lá',
      supplierId: 'SUP-01',
      purchaseUnit: 'Gói 500g',
      baseUnit: 'g',
      ratioToBase: 500,
      purchasePrice: 110000, // 110.000đ / 500g
      unitCost: 220,         // 220đ / g
      stockQty: 6200,
      minStock: 1500,
      shelfLifeDays: 365
    },
    {
      id: 'ING-TRA-03',
      name: 'Hồng Trà Đặc Biệt (Black Tea)',
      category: 'Trà lá',
      supplierId: 'SUP-01',
      purchaseUnit: 'Gói 500g',
      baseUnit: 'g',
      ratioToBase: 500,
      purchasePrice: 95000,
      unitCost: 190,         // 190đ / g
      stockQty: 750,         // Đang tồn 750g (Dưới định mức 1kg -> Báo Động Hết)
      minStock: 1000,
      shelfLifeDays: 365
    },

    // --- NHÓM BỘT & SỮA ---
    {
      id: 'ING-SUA-01',
      name: 'Bột Kem Béo B-One Thái Lan',
      category: 'Sữa & Bột béo',
      supplierId: 'SUP-02',
      purchaseUnit: 'Bao 1kg',
      baseUnit: 'g',
      ratioToBase: 1000,
      purchasePrice: 75000,
      unitCost: 75,          // 75đ / g
      stockQty: 18000,       // 18kg
      minStock: 5000,
      shelfLifeDays: 540
    },
    {
      id: 'ING-SUA-02',
      name: 'Sữa Đặc Ngôi Sao Phương Nam (Xanh biển)',
      category: 'Sữa & Bột béo',
      supplierId: 'SUP-03',
      purchaseUnit: 'Hộp 1284g',
      baseUnit: 'g',
      ratioToBase: 1284,
      purchasePrice: 62000,
      unitCost: 48.28,       // ~48.3đ / g
      stockQty: 15408,       // ~12 hộp
      minStock: 3852,
      shelfLifeDays: 365
    },
    {
      id: 'ING-SUA-03',
      name: 'Kem Béo Thực Vật Rich\'s Non-Dairy Creamer',
      category: 'Sữa & Bột béo',
      supplierId: 'SUP-03',
      purchaseUnit: 'Hộp 454g',
      baseUnit: 'g',
      ratioToBase: 454,
      purchasePrice: 32000,
      unitCost: 70.48,       // ~70.5đ / g
      stockQty: 2000,        // Đang tồn 2000g (Sát ngưỡng 1816g -> Sắp Hết)
      minStock: 1816,
      shelfLifeDays: 365
    },
    {
      id: 'ING-SUA-04',
      name: 'Cream Cheese Anchor New Zealand',
      category: 'Sữa & Bột béo',
      supplierId: 'SUP-03',
      purchaseUnit: 'Khối 1kg',
      baseUnit: 'g',
      ratioToBase: 1000,
      purchasePrice: 185000,
      unitCost: 185,         // 185đ / g
      stockQty: 3000,
      minStock: 1000,
      shelfLifeDays: 180
    },

    // --- NHÓM ĐƯỜNG & SYRUP & MỨT ---
    {
      id: 'ING-DUONG-01',
      name: 'Đường Cát Trắng Biên Hòa Pure',
      category: 'Đường & Syrup',
      supplierId: 'SUP-02',
      purchaseUnit: 'Bao 50kg',
      baseUnit: 'g',
      ratioToBase: 50000,
      purchasePrice: 1150000,
      unitCost: 23,          // 23đ / g
      stockQty: 65000,       // 65kg
      minStock: 15000,
      shelfLifeDays: 730
    },
    {
      id: 'ING-SYRUP-01',
      name: 'Syrup Đào Teisseire Pháp 700ml',
      category: 'Đường & Syrup',
      supplierId: 'SUP-03',
      purchaseUnit: 'Chai 700ml',
      baseUnit: 'ml',
      ratioToBase: 700,
      purchasePrice: 195000,
      unitCost: 278.57,      // ~279đ / ml
      stockQty: 2800,        // 4 chai
      minStock: 700,
      shelfLifeDays: 730
    },
    {
      id: 'ING-MUT-01',
      name: 'Mứt Đào Boduo Miếng 1kg',
      category: 'Đường & Syrup',
      supplierId: 'SUP-02',
      purchaseUnit: 'Hộp 1kg',
      baseUnit: 'g',
      ratioToBase: 1000,
      purchasePrice: 135000,
      unitCost: 135,         // 135đ / g
      stockQty: 0,           // Đã hết sạch trong kho (Hết Hàng)
      minStock: 1000,
      shelfLifeDays: 365
    },

    // --- NHÓM TOPPING THÔ ---
    {
      id: 'ING-TOP-01',
      name: 'Trân Châu Đen Gia Thịnh Phát (Thô)',
      category: 'Topping thô',
      supplierId: 'SUP-02',
      purchaseUnit: 'Bao 3kg',
      baseUnit: 'g',
      ratioToBase: 3000,
      purchasePrice: 72000,
      unitCost: 24,          // 24đ / g
      stockQty: 18000,       // 6 bao = 18kg
      minStock: 6000,
      shelfLifeDays: 180
    },

    // --- NHÓM TRÁI CÂY TƯƠI & ĐÁ ---
    {
      id: 'ING-FRUIT-01',
      name: 'Cam Vàng Mỹ / Cam Sành Tươi',
      category: 'Trái cây tươi',
      supplierId: 'SUP-05',
      purchaseUnit: 'Kg',
      baseUnit: 'g',
      ratioToBase: 1000,
      purchasePrice: 42000,
      unitCost: 42,          // 42đ / g
      stockQty: 8500,        // 8.5kg
      minStock: 3000,
      shelfLifeDays: 5
    },
    {
      id: 'ING-FRUIT-02',
      name: 'Sả Cây Tươi Làm Trà Đào Sả',
      category: 'Trái cây tươi',
      supplierId: 'SUP-05',
      purchaseUnit: 'Kg',
      baseUnit: 'g',
      ratioToBase: 1000,
      purchasePrice: 22000,
      unitCost: 22,          // 22đ / g
      stockQty: 450,         // Đang tồn 450g (Dưới định mức 1kg -> Báo Động Hết)
      minStock: 1000,
      shelfLifeDays: 7
    },
    {
      id: 'ING-DA-01',
      name: 'Đá Viên Tinh Khiết Sạch',
      category: 'Đá & Khác',
      supplierId: 'SUP-05',
      purchaseUnit: 'Bao 20kg',
      baseUnit: 'g',
      ratioToBase: 20000,
      purchasePrice: 16000,
      unitCost: 0.8,         // 0.8đ / g
      stockQty: 80000,       // 4 bao = 80kg
      minStock: 20000,
      shelfLifeDays: 1
    },

    // --- NHÓM VẬT TƯ BAO BÌ (PACKAGING) ---
    {
      id: 'PKG-LY-500',
      name: 'Ly Nhựa PP Đáy Bầu 500ml (Size M)',
      category: 'Bao bì & Ly',
      supplierId: 'SUP-04',
      purchaseUnit: 'Cây 50 cái',
      baseUnit: 'cái',
      ratioToBase: 50,
      purchasePrice: 38000,
      unitCost: 760,         // 760đ / cái
      stockQty: 220,         // Đang tồn 220 ly (Sát ngưỡng 200 ly -> Sắp Hết)
      minStock: 200,
      shelfLifeDays: 1825
    },
    {
      id: 'PKG-LY-700',
      name: 'Ly Nhựa PP Thẳng 700ml (Size L)',
      category: 'Bao bì & Ly',
      supplierId: 'SUP-04',
      purchaseUnit: 'Cây 50 cái',
      baseUnit: 'cái',
      ratioToBase: 50,
      purchasePrice: 45000,
      unitCost: 900,         // 900đ / cái
      stockQty: 1100,        // 1100 ly
      minStock: 300,
      shelfLifeDays: 1825
    },
    {
      id: 'PKG-NAP-TIM',
      name: 'Nắp Tim Đen Cao Cấp Phi 95',
      category: 'Bao bì & Ly',
      supplierId: 'SUP-04',
      purchaseUnit: 'Cây 50 cái',
      baseUnit: 'cái',
      ratioToBase: 50,
      purchasePrice: 22000,
      unitCost: 440,         // 440đ / cái
      stockQty: 1250,
      minStock: 250,
      shelfLifeDays: 1825
    },
    {
      id: 'PKG-NAP-CAU',
      name: 'Nắp Cầu Trong Suốt Phi 95',
      category: 'Bao bì & Ly',
      supplierId: 'SUP-04',
      purchaseUnit: 'Cây 50 cái',
      baseUnit: 'cái',
      ratioToBase: 50,
      purchasePrice: 18000,
      unitCost: 360,         // 360đ / cái
      stockQty: 750,
      minStock: 150,
      shelfLifeDays: 1825
    },
    {
      id: 'PKG-HUT-12',
      name: 'Ống Hút Trân Châu Phi 12 Bọc Màng',
      category: 'Bao bì & Ly',
      supplierId: 'SUP-04',
      purchaseUnit: 'Gói 100 cái',
      baseUnit: 'cái',
      ratioToBase: 100,
      purchasePrice: 25000,
      unitCost: 250,         // 250đ / cái
      stockQty: 1800,
      minStock: 300,
      shelfLifeDays: 1825
    },
    {
      id: 'PKG-HUT-8',
      name: 'Ống Hút Trà Trái Cây Phi 8 Bọc Màng',
      category: 'Bao bì & Ly',
      supplierId: 'SUP-04',
      purchaseUnit: 'Gói 100 cái',
      baseUnit: 'cái',
      ratioToBase: 100,
      purchasePrice: 18000,
      unitCost: 180,         // 180đ / cái
      stockQty: 1400,
      minStock: 300,
      shelfLifeDays: 1825
    },
    {
      id: 'PKG-TUI-T',
      name: 'Túi Chữ T Mang Đi 1 Ly',
      category: 'Bao bì & Ly',
      supplierId: 'SUP-04',
      purchaseUnit: 'Gói 100 cái',
      baseUnit: 'cái',
      ratioToBase: 100,
      purchasePrice: 12000,
      unitCost: 120,         // 120đ / cái
      stockQty: 2400,
      minStock: 400,
      shelfLifeDays: 1825
    }
  ],

  // 3. BÁN THÀNH PHẨM (Sub-recipes / Prep Batches)
  subRecipes: [
    {
      id: 'SUB-TRA-OLONG',
      name: 'Nước Cốt Trà Olong Nướng (Mẻ 1.1L)',
      category: 'Cốt trà',
      outputUnit: 'ml',
      outputQty: 1100,       // Sau khi ủ và vắt bã, thu được 1100ml nước cốt
      shelfLifeHours: 5,     // Dùng trong 5 tiếng để đảm bảo hương thơm
      instructions: 'Ủ 50g trà olong nướng với 1200ml nước sôi 95°C trong 15 phút, lọc bỏ bã.',
      ingredients: [
        { ingredientId: 'ING-TRA-01', amount: 50, unit: 'g' } // 50g * 280đ = 14.000đ
      ]
      // Giá vốn mẻ = 14.000đ -> Giá 1ml cốt = 14000 / 1100 = 12.73đ/ml
    },
    {
      id: 'SUB-TRA-LAI',
      name: 'Nước Cốt Trà Lài Pha Trái Cây (Mẻ 1.1L)',
      category: 'Cốt trà',
      outputUnit: 'ml',
      outputQty: 1100,
      shelfLifeHours: 4,
      instructions: 'Ủ 45g trà lài với 1200ml nước 85°C trong 10 phút, không đậy nắp quá kín.',
      ingredients: [
        { ingredientId: 'ING-TRA-02', amount: 45, unit: 'g' } // 45g * 220đ = 9.900đ
      ]
      // Giá vốn mẻ = 9.900đ -> Giá 1ml cốt = 9đ/ml
    },
    {
      id: 'SUB-TRA-DEN',
      name: 'Nước Cốt Hồng Trà Truyền Thống (Mẻ 1.2L)',
      category: 'Cốt trà',
      outputUnit: 'ml',
      outputQty: 1200,
      shelfLifeHours: 6,
      instructions: 'Ủ 50g hồng trà với 1300ml nước sôi 100°C trong 15 phút, vắt bã nhẹ.',
      ingredients: [
        { ingredientId: 'ING-TRA-03', amount: 50, unit: 'g' } // 50g * 190đ = 9.500đ
      ]
      // Giá vốn mẻ = 9.500đ -> Giá 1ml cốt = 7.92đ/ml
    },
    {
      id: 'SUB-TRAN-CHAU',
      name: 'Trân Châu Đen Nấu Chín Ngâm Đường (Mẻ 1kg)',
      category: 'Topping nấu',
      outputUnit: 'g',
      outputQty: 1000,       // 500g trân châu thô + nước sôi nở ra + 150g đường = ~1000g thành phẩm
      shelfLifeHours: 8,     // Trân châu ăn trong ngày
      instructions: 'Luộc 500g hạt trân châu 30 phút, ủ 25 phút. Rửa sạch nhớt rồi ngâm 150g đường cát.',
      ingredients: [
        { ingredientId: 'ING-TOP-01', amount: 500, unit: 'g' },   // 500 * 24đ = 12.000đ
        { ingredientId: 'ING-DUONG-01', amount: 150, unit: 'g' }  // 150 * 23đ = 3.450đ
      ]
      // Tổng chi phí mẻ: 15.450đ -> Giá 1g trân châu chín = 15.45đ/g (1 vá 40g ~ 618đ)
    },
    {
      id: 'SUB-NUOC-DUONG',
      name: 'Nước Đường Pha Nước (Syrup Simple 2:1)',
      category: 'Nước đường',
      outputUnit: 'ml',
      outputQty: 1250,       // 1kg đường + 650ml nước sôi = 1250ml nước đường
      shelfLifeHours: 720,   // Dùng 1 tháng
      instructions: 'Đun tan 1000g đường cát với 650ml nước nóng, để nguội rót bình định lượng.',
      ingredients: [
        { ingredientId: 'ING-DUONG-01', amount: 1000, unit: 'g' } // 1000 * 23đ = 23.000đ
      ]
      // Giá 1ml nước đường = 23.000 / 1250 = 18.4đ/ml
    },
    {
      id: 'SUB-KEM-CHEESE',
      name: 'Kem Macchiato Cheese Béo Ngậy (Mẻ 450g)',
      category: 'Kem & Foam',
      outputUnit: 'g',
      outputQty: 450,
      shelfLifeHours: 24,
      instructions: 'Đánh mềm 150g Cream Cheese, cho 200g Kem Richs + 60g Sữa đặc + chút muối, đánh sệt.',
      ingredients: [
        { ingredientId: 'ING-SUA-04', amount: 150, unit: 'g' }, // 150 * 185đ = 27.750đ
        { ingredientId: 'ING-SUA-03', amount: 200, unit: 'g' }, // 200 * 70.48đ = 14.096đ
        { ingredientId: 'ING-SUA-02', amount: 60, unit: 'g' }   // 60 * 48.28đ = 2.897đ
      ]
      // Tổng chi phí mẻ: 44.743đ -> Giá 1g kem cheese = 99.4đ/g (1 lớp 50g ~ 4.970đ)
    }
  ],

  // 4. MENU MÓN HOÀN CHỈNH (Finished Menu Products)
  products: [
    {
      id: 'PROD-01',
      name: 'Trà Sữa Olong Nướng Trân Châu (Size M)',
      category: 'Trà sữa',
      size: 'Size M (500ml)',
      icon: '🧋',
      image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InRlYU0iIHgxPSIwIiB5MT0iMCIgeDI9IjAiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZmVmM2M3Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjZDk3NzA2Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHJ4PSIxNiIgZmlsbD0iIzFlMjkzYiIvPjxwYXRoIGQ9Ik0zMCAyNSBMNzAgMjUgTDY0IDg1IEwzNiA4NSBaIiBmaWxsPSJ1cmwoI3RlYU0pIi8+PHJlY3QgeD0iMjYiIHk9IjIwIiB3aWR0aD0iNDgiIGhlaWdodD0iNyIgcng9IjMiIGZpbGw9IiNjYmQ1ZTEiLz48bGluZSB4MT0iNTYiIHkxPSIxMCIgeDI9IjQ4IiB5Mj0iMzgiIHN0cm9rZT0iI2Y1OWUwYiIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48Y2lyY2xlIGN4PSI0MyIgY3k9Ijc0IiByPSI0LjUiIGZpbGw9IiMxZTFiMTgiLz48Y2lyY2xlIGN4PSI1NCIgY3k9Ijc2IiByPSI0LjUiIGZpbGw9IiMxZTFiMTgiLz48Y2lyY2xlIGN4PSI0OCIgY3k9IjY3IiByPSI0IiBmaWxsPSIjMWUxYjE4Ii8+PGNpcmNsZSBjeD0iNTgiIGN5PSI2NiIgcj0iNCIgZmlsbD0iIzFlMWIxOCIvPjxjaXJjbGUgY3g9IjM5IiBjeT0iNjUiIHI9IjMuNSIgZmlsbD0iIzFlMWIxOCIvPjwvc3ZnPg==',
      description: 'Đậm vị trà olong nướng thơm khói kết hợp bột béo Thái Lan và trân châu dẻo.',
      sellingPrice: 35000,
      appSellingPrice: 42000, // Bán trên Grab/Shopee
      subRecipes: [
        { subRecipeId: 'SUB-TRA-OLONG', amount: 150, unit: 'ml' }, // 150ml * 12.73 = 1.910đ
        { subRecipeId: 'SUB-TRAN-CHAU', amount: 45, unit: 'g' },   // 45g * 15.45 = 695đ
        { subRecipeId: 'SUB-NUOC-DUONG', amount: 15, unit: 'ml' }  // 15ml * 18.4 = 276đ
      ],
      rawIngredients: [
        { ingredientId: 'ING-SUA-01', amount: 25, unit: 'g' },    // Bột béo: 25g * 75 = 1.875đ
        { ingredientId: 'ING-SUA-02', amount: 25, unit: 'g' },    // Sữa đặc: 25g * 48.28 = 1.207đ
        { ingredientId: 'ING-DA-01', amount: 150, unit: 'g' }     // Đá: 150g * 0.8 = 120đ
      ],
      packaging: [
        { packagingId: 'PKG-LY-500', amount: 1 },                 // Ly 500ml: 760đ
        { packagingId: 'PKG-NAP-TIM', amount: 1 },                // Nắp tim: 440đ
        { packagingId: 'PKG-HUT-12', amount: 1 },                 // Ống hút 12: 250đ
        { packagingId: 'PKG-TUI-T', amount: 1 }                   // Túi T: 120đ
      ]
    },
    {
      id: 'PROD-02',
      name: 'Trà Sữa Olong Nướng Trân Châu (Size L)',
      category: 'Trà sữa',
      size: 'Size L (700ml)',
      icon: '🧋',
      image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InRlYUwiIHgxPSIwIiB5MT0iMCIgeDI9IjAiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZmRlNjhhIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjYjQ1MzA5Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHJ4PSIxNiIgZmlsbD0iIzFlMjkzYiIvPjxwYXRoIGQ9Ik0yOCAxOCBMNzIgMTggTDY1IDg4IEwzNSA4OCBaIiBmaWxsPSJ1cmwoI3RlYUwpIi8+PHJlY3QgeD0iMjUiIHk9IjE0IiB3aWR0aD0iNTAiIGhlaWdodD0iNiIgcng9IjMiIGZpbGw9IiNjYmQ1ZTEiLz48bGluZSB4MT0iNTgiIHkxPSI2IiB4Mj0iNDgiIHkyPSIzNSIgc3Ryb2tlPSIjZjU5ZTBiIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxjaXJjbGUgY3g9IjQyIiBjeT0iNzgiIHI9IjQuNSIgZmlsbD0iIzFlMWIxOCIvPjxjaXJjbGUgY3g9IjU1IiBjeT0iODAiIHI9IjQuNSIgZmlsbD0iIzFlMWIxOCIvPjxjaXJjbGUgY3g9IjQ4IiBjeT0iNzAiIHI9IjQiIGZpbGw9IiMxZTFiMTgiLz48Y2lyY2xlIGN4PSI1OSIgY3k9IjY5IiByPSI0IiBmaWxsPSIjMWUxYjE4Ii8+PGNpcmNsZSBjeD0iMzgiIGN5PSI2OCIgcj0iMy41IiBmaWxsPSIjMWUxYjE4Ii8+PGNpcmNsZSBjeD0iNTAiIGN5PSI2MCIgcj0iMy41IiBmaWxsPSIjMWUxYjE4Ii8+PC9zdmc+',
      description: 'Phiên bản ly lớn 700ml no nê, nhân đôi trân châu và độ đậm đà.',
      sellingPrice: 42000,
      appSellingPrice: 50000,
      subRecipes: [
        { subRecipeId: 'SUB-TRA-OLONG', amount: 200, unit: 'ml' },
        { subRecipeId: 'SUB-TRAN-CHAU', amount: 65, unit: 'g' },
        { subRecipeId: 'SUB-NUOC-DUONG', amount: 20, unit: 'ml' }
      ],
      rawIngredients: [
        { ingredientId: 'ING-SUA-01', amount: 35, unit: 'g' },
        { ingredientId: 'ING-SUA-02', amount: 35, unit: 'g' },
        { ingredientId: 'ING-DA-01', amount: 200, unit: 'g' }
      ],
      packaging: [
        { packagingId: 'PKG-LY-700', amount: 1 },
        { packagingId: 'PKG-NAP-TIM', amount: 1 },
        { packagingId: 'PKG-HUT-12', amount: 1 },
        { packagingId: 'PKG-TUI-T', amount: 1 }
      ]
    },
    {
      id: 'PROD-03',
      name: 'Trà Đào Cam Sả Tươi (Size L)',
      category: 'Trà trái cây',
      size: 'Size L (700ml)',
      icon: '🍑',
      image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InBUZWEiIHgxPSIwIiB5MT0iMCIgeDI9IjAiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZmJiZjI0Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjZWE1ODBjIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHJ4PSIxNiIgZmlsbD0iIzFlMjkzYiIvPjxwYXRoIGQ9Ik0yOCAxOCBMNzIgMTggTDY1IDg4IEwzNSA4OCBaIiBmaWxsPSJ1cmwoI3BUZWEpIi8+PHJlY3QgeD0iMjUiIHk9IjE0IiB3aWR0aD0iNTAiIGhlaWdodD0iNiIgcng9IjMiIGZpbGw9IiNjYmQ1ZTEiLz48bGluZSB4MT0iNTgiIHkxPSI2IiB4Mj0iNDgiIHkyPSIzNSIgc3Ryb2tlPSIjMTBiOTgxIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjE0IiBmaWxsPSIjZmI5MjNjIiBvcGFjaXR5PSIwLjg1Ii8+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iOCIgZmlsbD0iI2ZlZDdhYSIvPjxyZWN0IHg9IjQyIiB5PSI2NiIgd2lkdGg9IjEyIiBoZWlnaHQ9IjEyIiByeD0iMyIgZmlsbD0iI2ZmZmZmZiIgb3BhY2l0eT0iMC42Ii8+PHJlY3QgeD0iNTIiIHk9IjMyIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHJ4PSIyIiBmaWxsPSIjZmZmZmZmIiBvcGFjaXR5PSIwLjYiLz48L3N2Zz4=',
      description: 'Hương vị thanh mát giải nhiệt từ cốt trà lài, syrup đào Pháp và cam vàng tươi.',
      sellingPrice: 45000,
      appSellingPrice: 54000,
      subRecipes: [
        { subRecipeId: 'SUB-TRA-LAI', amount: 160, unit: 'ml' },   // 160ml * 9 = 1.440đ
        { subRecipeId: 'SUB-NUOC-DUONG', amount: 20, unit: 'ml' }  // 20ml * 18.4 = 368đ
      ],
      rawIngredients: [
        { ingredientId: 'ING-SYRUP-01', amount: 25, unit: 'ml' }, // Syrup Đào: 25ml * 278.57 = 6.964đ
        { ingredientId: 'ING-MUT-01', amount: 30, unit: 'g' },    // Mứt đào miếng: 30g * 135 = 4.050đ
        { ingredientId: 'ING-FRUIT-01', amount: 35, unit: 'g' },  // 2 lát cam tươi: 35g * 42 = 1.470đ
        { ingredientId: 'ING-FRUIT-02', amount: 15, unit: 'g' },  // Sả cây đập dập: 15g * 22 = 330đ
        { ingredientId: 'ING-DA-01', amount: 220, unit: 'g' }     // Đá: 220 * 0.8 = 176đ
      ],
      packaging: [
        { packagingId: 'PKG-LY-700', amount: 1 },                 // 900đ
        { packagingId: 'PKG-NAP-CAU', amount: 1 },                // 360đ
        { packagingId: 'PKG-HUT-8', amount: 1 },                  // 180đ
        { packagingId: 'PKG-TUI-T', amount: 1 }                   // 120đ
      ]
    },
    {
      id: 'PROD-04',
      name: 'Hồng Trà Macchiato Kem Cheese (Size M)',
      category: 'Macchiato',
      size: 'Size M (500ml)',
      icon: '🧀',
      image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9Im1UZWEiIHgxPSIwIiB5MT0iMCIgeDI9IjAiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjYjkxYzFjIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjN2YxZDFkIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHJ4PSIxNiIgZmlsbD0iIzFlMjkzYiIvPjxwYXRoIGQ9Ik0zMCAyNSBMNzAgMjUgTDY0IDg1IEwzNiA4NSBaIiBmaWxsPSJ1cmwoI21UZWEpIi8+PHBhdGggZD0iTTMwIDI1IEw3MCAyNSBMNjggNDUgTDMyIDQ1IFoiIGZpbGw9IiNmZmZiZWIiLz48cmVjdCB4PSIyNiIgeT0iMjAiIHdpZHRoPSI0OCIgaGVpZ2h0PSI3IiByeD0iMyIgZmlsbD0iI2NiZDVlMSIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iMzUiIHI9IjIuNSIgZmlsbD0iI2Y1OWUwYiIvPjxyZWN0IHg9IjQ0IiB5PSI1NSIgd2lkdGg9IjEyIiBoZWlnaHQ9IjEyIiByeD0iMyIgZmlsbD0iI2ZmZmZmZiIgb3BhY2l0eT0iMC41Ii8+PHJlY3QgeD0iMzgiIHk9IjcwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHJ4PSIyIiBmaWxsPSIjZmZmZmZmIiBvcGFjaXR5PSIwLjQiLz48L3N2Zz4=',
      description: 'Lớp kem cheese mằn mặn béo ngậy phủ trên nền hồng trà nguyên bản đậm đà.',
      sellingPrice: 38000,
      appSellingPrice: 46000,
      subRecipes: [
        { subRecipeId: 'SUB-TRA-DEN', amount: 160, unit: 'ml' },   // 160 * 7.92 = 1.267đ
        { subRecipeId: 'SUB-KEM-CHEESE', amount: 55, unit: 'g' },  // 55g * 99.4 = 5.467đ
        { subRecipeId: 'SUB-NUOC-DUONG', amount: 25, unit: 'ml' }  // 25 * 18.4 = 460đ
      ],
      rawIngredients: [
        { ingredientId: 'ING-DA-01', amount: 150, unit: 'g' }     // 150 * 0.8 = 120đ
      ],
      packaging: [
        { packagingId: 'PKG-LY-500', amount: 1 },                 // 760đ
        { packagingId: 'PKG-NAP-TIM', amount: 1 },                // 440đ
        { packagingId: 'PKG-TUI-T', amount: 1 }                   // 120đ
      ]
    },
    {
      id: 'PROD-05',
      name: 'Trà Lài Cam Vàng Dưa Hấu (Size L)',
      category: 'Trà trái cây',
      size: 'Size L (700ml)',
      icon: '🍉',
      image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImZUZWEiIHgxPSIwIiB5MT0iMCIgeDI9IjAiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZjU5ZTBiIi8+PHN0b3Agb2Zmc2V0PSI2MCUiIHN0b3AtY29sb3I9IiNmNDNmNWUiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlMTFkNDgiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgcng9IjE2IiBmaWxsPSIjMWUyOTNiIi8+PHBhdGggZD0iTTI4IDE4IEw3MiAxOCBMNjUgODggTDM1IDg4IFoiIGZpbGw9InVybCgjZlRlYSkiLz48cmVjdCB4PSIyNSIgeT0iMTQiIHdpZHRoPSI1MCIgaGVpZ2h0PSI2IiByeD0iMyIgZmlsbD0iI2NiZDVlMSIvPjxsaW5lIHgxPSI1OCIgeTE9IjYiIHgyPSI0OCIgeTI9IjM1IiBzdHJva2U9IiMxMGI5ODEiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PGNpcmNsZSBjeD0iNDgiIGN5PSI0MCIgcj0iMTIiIGZpbGw9IiNmYmJmMjQiIG9wYWNpdHk9IjAuOSIvPjxyZWN0IHg9IjQwIiB5PSI1OCIgd2lkdGg9IjE0IiBoZWlnaHQ9IjE0IiByeD0iMyIgZmlsbD0iI2ZmZmZmZiIgb3BhY2l0eT0iMC41NSIvPjxjaXJjbGUgY3g9IjUyIiBjeT0iNzUiIHI9IjIiIGZpbGw9IiMwMDAiIG9wYWNpdHk9IjAuNCIvPjxjaXJjbGUgY3g9IjQ1IiBjeT0iNzgiIHI9IjIiIGZpbGw9IiMwMDAiIG9wYWNpdHk9IjAuNCIvPjwvc3ZnPg==',
      description: 'Trà trái cây nhiệt đới tươi mát với cam sành mọng nước và cốt trà lài ngát hương.',
      sellingPrice: 42000,
      appSellingPrice: 50000,
      subRecipes: [
        { subRecipeId: 'SUB-TRA-LAI', amount: 180, unit: 'ml' },
        { subRecipeId: 'SUB-NUOC-DUONG', amount: 25, unit: 'ml' }
      ],
      rawIngredients: [
        { ingredientId: 'ING-FRUIT-01', amount: 50, unit: 'g' },
        { ingredientId: 'ING-DA-01', amount: 220, unit: 'g' }
      ],
      packaging: [
        { packagingId: 'PKG-LY-700', amount: 1 },
        { packagingId: 'PKG-NAP-CAU', amount: 1 },
        { packagingId: 'PKG-HUT-8', amount: 1 },
        { packagingId: 'PKG-TUI-T', amount: 1 }
      ]
    }
  ],

  // 5. LỊCH SỬ BÁN HÀNG & PHIẾU NHẬP MẪU (Mock Sales & Purchases)
  purchaseLogs: [
    {
      id: 'PNK-001',
      date: '2026-09-18 09:30',
      supplierName: 'Kho Nguyên Liệu Trà Bảo Lộc',
      totalAmount: 1845000,
      itemCount: 3,
      note: 'Nhập trà Olong nướng & trà lài đầu tuần'
    },
    {
      id: 'PNK-002',
      date: '2026-09-19 14:15',
      supplierName: 'Xưởng In Ly & Bao Bì Nhựa Sài Gòn',
      totalAmount: 2450000,
      itemCount: 4,
      note: 'Nhập 1000 ly 700ml và ống hút phi 12'
    }
  ],

  salesLogs: (function() {
    window.generateSeedSalesLogs = function() {
      const now = new Date();
      const currentDay = now.getDay();
      const diffToMonday = (currentDay + 6) % 7;
      const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday, 0, 0, 0, 0);

      const daysData = [
        // Thứ 2 (T2)
        { dayIndex: 0, shift: 'Ca Chiều Tối', cups: 65, items: [ { id: 'PROD-01', qty: 26 }, { id: 'PROD-02', qty: 20 }, { id: 'PROD-03', qty: 12 }, { id: 'PROD-04', qty: 5 }, { id: 'PROD-05', qty: 2 } ] },
        // Thứ 3 (T3)
        { dayIndex: 1, shift: 'Ca Cả Ngày', cups: 74, items: [ { id: 'PROD-01', qty: 30 }, { id: 'PROD-02', qty: 22 }, { id: 'PROD-03', qty: 15 }, { id: 'PROD-04', qty: 5 }, { id: 'PROD-05', qty: 2 } ] },
        // Thứ 4 (T4)
        { dayIndex: 2, shift: 'Ca Cả Ngày', cups: 82, items: [ { id: 'PROD-01', qty: 34 }, { id: 'PROD-02', qty: 25 }, { id: 'PROD-03', qty: 16 }, { id: 'PROD-04', qty: 6 }, { id: 'PROD-05', qty: 1 } ] },
        // Thứ 5 (T5)
        { dayIndex: 3, shift: 'Ca Cả Ngày', cups: 88, items: [ { id: 'PROD-01', qty: 38 }, { id: 'PROD-02', qty: 26 }, { id: 'PROD-03', qty: 16 }, { id: 'PROD-04', qty: 6 }, { id: 'PROD-05', qty: 2 } ] },
        // Thứ 6 (T6)
        { dayIndex: 4, shift: 'Ca Cả Ngày', cups: 118, items: [ { id: 'PROD-01', qty: 48 }, { id: 'PROD-02', qty: 35 }, { id: 'PROD-03', qty: 22 }, { id: 'PROD-04', qty: 10 }, { id: 'PROD-05', qty: 3 } ] },
        // Thứ 7 (T7 - Bùng Nổ Cuối Tuần)
        { dayIndex: 5, shift: 'Ca Cuối Tuần Bùng Nổ', cups: 165, items: [ { id: 'PROD-01', qty: 68 }, { id: 'PROD-02', qty: 52 }, { id: 'PROD-03', qty: 30 }, { id: 'PROD-04', qty: 11 }, { id: 'PROD-05', qty: 4 } ] },
        // Chủ Nhật (CN)
        { dayIndex: 6, shift: 'Ca Sáng & Chiều', cups: 135, items: [ { id: 'PROD-01', qty: 56 }, { id: 'PROD-02', qty: 42 }, { id: 'PROD-03', qty: 24 }, { id: 'PROD-04', qty: 10 }, { id: 'PROD-05', qty: 3 } ] }
      ];

      const priceMap = {
        'PROD-01': { name: 'Trà Sữa Olong Nướng Trân Châu (Size M)', price: 35000, cogsUnit: 10323 },
        'PROD-02': { name: 'Trà Sữa Olong Nướng Trân Châu (Size L)', price: 42000, cogsUnit: 13580 },
        'PROD-03': { name: 'Trà Đào Cam Sả Tươi (Size L)', price: 45000, cogsUnit: 15308 },
        'PROD-04': { name: 'Hồng Trà Macchiato Kem Cheese (Size M)', price: 38000, cogsUnit: 9027 },
        'PROD-05': { name: 'Trà Lài Cam Vàng Dưa Hấu (Size L)', price: 42000, cogsUnit: 12450 }
      };

      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      // QUY TẮC CHUẨN: Chỉ tạo dữ liệu bán hàng cho các ngày đã diễn ra đến hôm nay (targetDate <= todayEnd)
      // Các ngày ở tương lai chưa có số liệu bắt buộc = 0 theo thực tế
      return daysData
        .map((d, index) => {
          const targetDate = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index, 12, 0, 0, 0);
          return { d, index, targetDate };
        })
        .filter(item => item.targetDate <= todayEnd)
        .map(({ d, index, targetDate }) => {
          const yyyy = targetDate.getFullYear();
          const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
          const dd = String(targetDate.getDate()).padStart(2, '0');
          const dateStr = `${yyyy}-${mm}-${dd} 21:00`;

          let totalRevenue = 0;
          let totalCogs = 0;
          const salesItems = d.items.map(it => {
            const info = priceMap[it.id] || { name: it.id, price: 35000, cogsUnit: 10000 };
            const rev = it.qty * info.price;
            const cogs = it.qty * info.cogsUnit;
            totalRevenue += rev;
            totalCogs += cogs;
            return {
              productId: it.id,
              productName: info.name,
              qty: it.qty,
              unitPrice: info.price,
              revenue: rev
            };
          });

          return {
            id: `POS-CA-${String(7 - index).padStart(2, '0')}`,
            date: dateStr,
            timestamp: targetDate.getTime(),
            shift: d.shift,
            totalCups: d.cups,
            revenue: totalRevenue,
            estimatedCogs: Math.round(totalCogs),
            grossProfit: Math.round(totalRevenue - totalCogs),
            channel: 'Tại quán & Delivery',
            salesItems
          };
        });
    };

    return window.generateSeedSalesLogs();
  })()
};

// THƯ VIỆN 35+ NGUYÊN LIỆU F&B PHỔ BIẾN NHẤT THỊ TRƯỜNG (Để người dùng chọn nhanh 1-click)
window.FNB_CATALOG_LIBRARY = [
  // --- TRÀ LÁ ---
  { name: 'Trà Xanh Thái Xanh (Cha Tra Mue)', category: 'Trà lá', purchaseUnit: 'Gói 200g', baseUnit: 'g', ratioToBase: 200, purchasePrice: 48000, minStock: 400 },
  { name: 'Trà Đỏ Thái Lan (Cha Tra Mue)', category: 'Trà lá', purchaseUnit: 'Gói 400g', baseUnit: 'g', ratioToBase: 400, purchasePrice: 75000, minStock: 800 },
  { name: 'Trà Bá Tước (Earl Grey Tea)', category: 'Trà lá', purchaseUnit: 'Hộp 500g', baseUnit: 'g', ratioToBase: 500, purchasePrice: 165000, minStock: 500 },
  { name: 'Trà Thiết Quan Âm Hảo Hạng', category: 'Trà lá', purchaseUnit: 'Gói 1kg', baseUnit: 'g', ratioToBase: 1000, purchasePrice: 320000, minStock: 1000 },
  { name: 'Trà Sen Tây Hồ Thơm Dịu', category: 'Trà lá', purchaseUnit: 'Gói 500g', baseUnit: 'g', ratioToBase: 500, purchasePrice: 140000, minStock: 500 },
  { name: 'Bột Trà Xanh Matcha Uji Nhật Bản', category: 'Trà lá', purchaseUnit: 'Gói 100g', baseUnit: 'g', ratioToBase: 100, purchasePrice: 180000, minStock: 100 },

  // --- SỮA & BỘT BÉO ---
  { name: 'Bột Béo Kievit Vana Blanca Hà Lan', category: 'Sữa & Bột béo', purchaseUnit: 'Bao 25kg', baseUnit: 'g', ratioToBase: 25000, purchasePrice: 1550000, minStock: 5000 },
  { name: 'Bột Kem Béo Almer Malaysia', category: 'Sữa & Bột béo', purchaseUnit: 'Bao 1kg', baseUnit: 'g', ratioToBase: 1000, purchasePrice: 72000, minStock: 2000 },
  { name: 'Bột Sữa Frima Hàn Quốc', category: 'Sữa & Bột béo', purchaseUnit: 'Bao 1kg', baseUnit: 'g', ratioToBase: 1000, purchasePrice: 85000, minStock: 2000 },
  { name: 'Sữa Tươi Tiệt Trùng Vinamilk 100%', category: 'Sữa & Bột béo', purchaseUnit: 'Thùng 12 hộp 1L', baseUnit: 'ml', ratioToBase: 12000, purchasePrice: 360000, minStock: 3000 },
  { name: 'Sữa Tươi Thanh Trùng Dalat Milk 450ml', category: 'Sữa & Bột béo', purchaseUnit: 'Chai 450ml', baseUnit: 'ml', ratioToBase: 450, purchasePrice: 21000, minStock: 900 },
  { name: 'Kem Sữa Whipping Cream Anchor 1L', category: 'Sữa & Bột béo', purchaseUnit: 'Hộp 1L', baseUnit: 'ml', ratioToBase: 1000, purchasePrice: 165000, minStock: 1000 },

  // --- ĐƯỜNG & SYRUP & MỨT ---
  { name: 'Syrup Monin Dâu Tây 700ml', category: 'Đường & Syrup', purchaseUnit: 'Chai 700ml', baseUnit: 'ml', ratioToBase: 700, purchasePrice: 245000, minStock: 700 },
  { name: 'Syrup Monin Vải Thiều 700ml', category: 'Đường & Syrup', purchaseUnit: 'Chai 700ml', baseUnit: 'ml', ratioToBase: 700, purchasePrice: 245000, minStock: 700 },
  { name: 'Syrup Torani Bạc Hà Trắng 750ml', category: 'Đường & Syrup', purchaseUnit: 'Chai 750ml', baseUnit: 'ml', ratioToBase: 750, purchasePrice: 185000, minStock: 750 },
  { name: 'Mứt Dâu Boduo Hạt Lựu 1kg', category: 'Đường & Syrup', purchaseUnit: 'Hộp 1kg', baseUnit: 'g', ratioToBase: 1000, purchasePrice: 145000, minStock: 1000 },
  { name: 'Mứt Xoài Boduo Có Xác 1kg', category: 'Đường & Syrup', purchaseUnit: 'Hộp 1kg', baseUnit: 'g', ratioToBase: 1000, purchasePrice: 140000, minStock: 1000 },
  { name: 'Đường Đen Nữ Hoàng Hàn Quốc Beksul', category: 'Đường & Syrup', purchaseUnit: 'Gói 1kg', baseUnit: 'g', ratioToBase: 1000, purchasePrice: 52000, minStock: 2000 },

  // --- TOPPING THÔ ---
  { name: 'Trân Châu Trắng 3Q Ngọc Trai Sea Jelly', category: 'Topping thô', purchaseUnit: 'Bịch 2kg', baseUnit: 'g', ratioToBase: 2000, purchasePrice: 85000, minStock: 2000 },
  { name: 'Bột Pudding Flan Trứng Mole Đài Loan', category: 'Topping thô', purchaseUnit: 'Bao 1kg', baseUnit: 'g', ratioToBase: 1000, purchasePrice: 135000, minStock: 1000 },
  { name: 'Thạch Dừa Giòn Hương Trái Cây', category: 'Topping thô', purchaseUnit: 'Hộp 1kg', baseUnit: 'g', ratioToBase: 1000, purchasePrice: 38000, minStock: 1000 },
  { name: 'Trân Châu Hoàng Kim Wings', category: 'Topping thô', purchaseUnit: 'Bao 2kg', baseUnit: 'g', ratioToBase: 2000, purchasePrice: 65000, minStock: 2000 },

  // --- TRÁI CÂY TƯƠI ---
  { name: 'Chanh Dây Tươi (Lạc Tiên)', category: 'Trái cây tươi', purchaseUnit: 'Kg', baseUnit: 'g', ratioToBase: 1000, purchasePrice: 32000, minStock: 2000 },
  { name: 'Thơm (Dứa) Chín Cắt Gọt', category: 'Trái cây tươi', purchaseUnit: 'Kg', baseUnit: 'g', ratioToBase: 1000, purchasePrice: 20000, minStock: 1500 },
  { name: 'Dưa Hấu Đỏ Ruột Ngọt', category: 'Trái cây tươi', purchaseUnit: 'Kg', baseUnit: 'g', ratioToBase: 1000, purchasePrice: 18000, minStock: 3000 },
  { name: 'Lá Bạc Hà Tươi (Mint)', category: 'Trái cây tươi', purchaseUnit: 'Hộp 200g', baseUnit: 'g', ratioToBase: 200, purchasePrice: 25000, minStock: 200 },

  // --- BAO BÌ & LY ---
  { name: 'Ly Giấy Trắng Cao Cấp 16oz (500ml)', category: 'Bao bì & Ly', purchaseUnit: 'Cây 50 cái', baseUnit: 'cái', ratioToBase: 50, purchasePrice: 42000, minStock: 150 },
  { name: 'Nắp Uống Trực Tiếp Nóng/Lạnh Phi 90', category: 'Bao bì & Ly', purchaseUnit: 'Cây 50 cái', baseUnit: 'cái', ratioToBase: 50, purchasePrice: 20000, minStock: 150 },
  { name: 'Muỗng Nhựa Trà Sữa Dài Bọc Màng', category: 'Bao bì & Ly', purchaseUnit: 'Gói 100 cái', baseUnit: 'cái', ratioToBase: 100, purchasePrice: 15000, minStock: 200 },
  { name: 'Cuộn Màng Ép Miệng Ly (In Họa Tiết)', category: 'Bao bì & Ly', purchaseUnit: 'Cuộn 2400 nắp', baseUnit: 'cái', ratioToBase: 2400, purchasePrice: 145000, minStock: 300 },
  { name: 'Túi Đôi Mang Đi (Túi 2 Ly)', category: 'Bao bì & Ly', purchaseUnit: 'Gói 100 cái', baseUnit: 'cái', ratioToBase: 100, purchasePrice: 18000, minStock: 200 }
];

