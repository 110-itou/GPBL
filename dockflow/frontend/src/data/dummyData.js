// ダミーデータ

export const dummyDeliveries = [
  {
    id: 1,
    deliveryDate: '2024-05-13',
    deliveryTime: '09:00',
    vendorName: '山田鉄工株式会社',
    materialName: '鋼板 A-1234',
    quantity: 50,
    unit: '枚',
    location: 'A',
    status: '納入予定',
    notes: '船体部材用',
    createdAt: '2024-05-13T08:30:00Z',
    updatedAt: '2024-05-13T08:30:00Z'
  },
  {
    id: 2,
    deliveryDate: '2024-05-13',
    deliveryTime: '10:30',
    vendorName: '佐藤金属工業',
    materialName: '配管パイプ B-5678',
    quantity: 100,
    unit: '本',
    location: 'B',
    status: '納入済',
    notes: '配管工事用',
    createdAt: '2024-05-13T09:00:00Z',
    updatedAt: '2024-05-13T10:45:00Z'
  },
  {
    id: 3,
    deliveryDate: '2024-05-13',
    deliveryTime: '14:00',
    vendorName: '鈴木製作所',
    materialName: 'ボルトナットセット C-9012',
    quantity: 200,
    unit: 'セット',
    location: 'C',
    status: '移動済',
    notes: '締結用部材',
    createdAt: '2024-05-13T11:00:00Z',
    updatedAt: '2024-05-13T14:30:00Z'
  },
  {
    id: 4,
    deliveryDate: '2024-05-14',
    deliveryTime: '08:00',
    vendorName: '高橋建材',
    materialName: 'コンクリートブロック D-3456',
    quantity: 30,
    unit: '個',
    location: 'D',
    status: '使用済',
    notes: '基礎工事用',
    createdAt: '2024-05-13T15:00:00Z',
    updatedAt: '2024-05-14T09:00:00Z'
  },
  {
    id: 5,
    deliveryDate: '2024-05-14',
    deliveryTime: '11:00',
    vendorName: '伊藤機械',
    materialName: 'モーター E-7890',
    quantity: 5,
    unit: '台',
    location: 'E',
    status: '納入予定',
    notes: '推進機用',
    createdAt: '2024-05-13T16:00:00Z',
    updatedAt: '2024-05-13T16:00:00Z'
  }
];

export const dummyNotifications = [
  {
    id: 1,
    type: 'info',
    title: '新しい納入予定',
    message: '山田鉄工株式会社から鋼板の納入予定があります',
    timestamp: '2024-05-13T08:00:00Z',
    read: false
  },
  {
    id: 2,
    type: 'success',
    title: '納入完了',
    message: '佐藤金属工業の配管パイプが納入完了しました',
    timestamp: '2024-05-13T10:45:00Z',
    read: false
  },
  {
    id: 3,
    type: 'warning',
    title: '納入遅延',
    message: '鈴木製作所の納入が30分遅延しています',
    timestamp: '2024-05-13T14:30:00Z',
    read: false
  },
  {
    id: 4,
    type: 'error',
    title: '数量不一致',
    message: '高橋建材の納入数量が注文数と異なります',
    timestamp: '2024-05-14T09:00:00Z',
    read: true
  },
  {
    id: 5,
    type: 'info',
    title: '場所変更',
    message: '伊藤機械の納入場所をEからFに変更しました',
    timestamp: '2024-05-14T10:00:00Z',
    read: true
  }
];

export const dummyCalendarEvents = [
  {
    id: 1,
    title: '山田鉄工 - 鋼板納入',
    date: '2024-05-10',
    startTime: '09:00',
    endTime: '10:00',
    location: 'A',
    type: 'delivery',
    status: 'completed'
  },
  {
    id: 2,
    title: '佐藤金属 - 配管納入',
    date: '2024-05-11',
    startTime: '10:30',
    endTime: '11:30',
    location: 'B',
    type: 'delivery',
    status: 'completed'
  },
  {
    id: 3,
    title: '鈴木製作所 - ボルト納入',
    date: '2024-05-13',
    startTime: '14:00',
    endTime: '15:00',
    location: 'C',
    type: 'delivery',
    status: 'completed'
  },
  {
    id: 4,
    title: '高橋建材 - コンクリート納入',
    date: '2024-05-14',
    startTime: '08:00',
    endTime: '09:00',
    location: 'D',
    type: 'delivery',
    status: 'completed'
  },
  {
    id: 5,
    title: '伊藤機械 - モーター納入',
    date: '2024-05-15',
    startTime: '11:00',
    endTime: '12:00',
    location: 'E',
    type: 'delivery',
    status: 'completed'
  }
];

export const dummyVendors = [
  { id: 1, name: '山田鉄工株式会社', contact: '03-1234-5678', email: 'yamada@yamada-steel.co.jp' },
  { id: 2, name: '佐藤金属工業', contact: '03-2345-6789', email: 'sato@sato-metal.co.jp' },
  { id: 3, name: '鈴木製作所', contact: '03-3456-7890', email: 'suzuki@suzuki-factory.co.jp' },
  { id: 4, name: '高橋建材', contact: '03-4567-8901', email: 'takahashi@takahashi-materials.co.jp' },
  { id: 5, name: '伊藤機械', contact: '03-5678-9012', email: 'ito@ito-machinery.co.jp' }
];

export const dummyMaterials = [
  { id: 1, name: '鋼板 A-1234', category: '鋼材', unit: '枚', specifications: '厚さ10mm x 幅2000mm x 長さ6000mm' },
  { id: 2, name: '配管パイプ B-5678', category: '配管', unit: '本', specifications: '直径50mm x 長さ6000mm' },
  { id: 3, name: 'ボルトナットセット C-9012', category: '締結部材', unit: 'セット', specifications: 'M16ボルト + ナット + ワッシャー' },
  { id: 4, name: 'コンクリートブロック D-3456', category: '建材', unit: '個', specifications: '300mm x 200mm x 150mm' },
  { id: 5, name: 'モーター E-7890', category: '機械', unit: '台', specifications: '三相誘導電動機 15kW' }
];

export const dummyLocations = [
  { id: 'A', name: 'エリアA', description: '大型部材保管エリア', capacity: 100 },
  { id: 'B', name: 'エリアB', description: '中型部材保管エリア', capacity: 80 },
  { id: 'C', name: 'エリアC', description: '小型部材保管エリア', capacity: 120 },
  { id: 'D', name: 'エリアD', description: '締結部材保管エリア', capacity: 60 },
  { id: 'E', name: 'エリアE', description: '機械部材保管エリア', capacity: 40 },
  { id: 'F', name: 'エリアF', description: '配管部材保管エリア', capacity: 50 },
  { id: 'G', name: 'エリアG', description: '電気部材保管エリア', capacity: 30 },
  { id: 'H', name: 'エリアH', description: '塗装部材保管エリア', capacity: 45 },
  { id: 'I', name: 'エリアI', description: '計測器保管エリア', capacity: 25 },
  { id: 'J', name: 'エリアJ', description: '工具保管エリア', capacity: 35 },
  { id: 'K', name: 'エリアK', description: '臨時保管エリア', capacity: 20 }
];
