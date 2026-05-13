import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { getDashboardSummary, getDeliveries, exportDeliveriesCSV } from '../services/api';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Calendar, Package, AlertCircle, RefreshCw, Settings, Download, Search, Plus } from 'lucide-react';

const VENDOR_COLOR_OVERRIDES = [
  { keyword: '山田鉄工', color: '#3b82f6' },
  { keyword: '山田', color: '#3b82f6' },
  { keyword: '佐藤金属', color: '#10b981' },
  { keyword: '佐藤', color: '#10b981' },
  { keyword: '鈴木製作所', color: '#f97316' },
  { keyword: '鈴木', color: '#f97316' }
];

const JAPAN_HOLIDAYS = new Set([
  '2024-01-01', '2024-01-08', '2024-02-11', '2024-02-12', '2024-02-23', '2024-03-20',
  '2024-04-29', '2024-05-03', '2024-05-04', '2024-05-05', '2024-05-06', '2024-07-15',
  '2024-08-11', '2024-08-12', '2024-09-16', '2024-09-22', '2024-09-23', '2024-10-14',
  '2024-11-03', '2024-11-04', '2024-11-23',
  '2025-01-01', '2025-01-13', '2025-02-11', '2025-02-23', '2025-02-24', '2025-03-20',
  '2025-04-29', '2025-05-03', '2025-05-04', '2025-05-05', '2025-05-06', '2025-07-21',
  '2025-08-11', '2025-09-15', '2025-09-23', '2025-10-13', '2025-11-03', '2025-11-23',
  '2025-11-24',
  '2026-01-01', '2026-01-12', '2026-02-11', '2026-02-23', '2026-03-20', '2026-04-29',
  '2026-05-03', '2026-05-04', '2026-05-05', '2026-05-06', '2026-07-20', '2026-08-11',
  '2026-09-21', '2026-09-22', '2026-09-23', '2026-10-12', '2026-11-03', '2026-11-23'
]);

const formatDate = (date) => {
  if (!date) return '';
  const value = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(value.getTime())) {
    return typeof date === 'string' ? date.split('T')[0] : '';
  }
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const deliveryUpdatedDate = (delivery) => (
  delivery.updated_at ||
  delivery.updatedAt ||
  delivery.received_date ||
  delivery.receivedDate ||
  delivery.scheduled_date ||
  delivery.deliveryDate ||
  delivery.created_at ||
  delivery.createdAt
);

const getItemName = (delivery) => delivery.item_name || delivery.materialName || delivery.material_name || '品名未設定';
const getVendorName = (delivery) => delivery.vendor_name || delivery.vendorName || '';

const dateWithOffset = (offsetDays, time = '09:00:00') => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return `${formatDate(date)}T${time}`;
};

const buildDemoDeliveries = () => [
  {
    id: 9001,
    system_id: 'DEMO-9001',
    item_name: '鋼板 A-1234',
    vendor_name: '山田鉄工株式会社',
    color_code: '#3b82f6',
    status: '納入予定',
    current_location: 'A',
    quantity: 50,
    scheduled_date: formatDate(new Date()),
    updated_at: dateWithOffset(0, '09:00:00'),
    created_at: dateWithOffset(-4, '09:00:00')
  },
  {
    id: 9001,
    system_id: 'DEMO-9001',
    item_name: '鋼板 A-1234',
    vendor_name: '山田鉄工株式会社',
    color_code: '#3b82f6',
    status: '移動済',
    current_location: 'K',
    quantity: 50,
    scheduled_date: formatDate(new Date()),
    updated_at: dateWithOffset(-1, '15:30:00'),
    created_at: dateWithOffset(-4, '09:00:00')
  },
  {
    id: 9002,
    system_id: 'DEMO-9002',
    item_name: '配管パイプ B-5678',
    vendor_name: '佐藤金属工業',
    color_code: '#10b981',
    status: '納入済',
    current_location: 'B',
    quantity: 18,
    scheduled_date: formatDate(new Date()),
    received_date: formatDate(new Date()),
    updated_at: dateWithOffset(0, '10:15:00'),
    created_at: dateWithOffset(-2, '11:00:00')
  },
  {
    id: 9003,
    system_id: 'DEMO-9003',
    item_name: 'ボルトナットセット C-9012',
    vendor_name: '鈴木製作所',
    color_code: '#f97316',
    status: '移動済',
    current_location: 'C',
    quantity: 200,
    scheduled_date: formatDate(new Date()),
    received_date: formatDate(new Date()),
    updated_at: dateWithOffset(1, '14:00:00'),
    created_at: dateWithOffset(-3, '13:00:00')
  },
  {
    id: 9004,
    system_id: 'DEMO-9004',
    item_name: 'ポンプ P-204',
    vendor_name: '山田鉄工株式会社',
    color_code: '#3b82f6',
    status: '使用済',
    current_location: 'D',
    quantity: 4,
    scheduled_date: formatDate(new Date()),
    received_date: formatDate(new Date()),
    updated_at: dateWithOffset(3, '08:45:00'),
    created_at: dateWithOffset(-6, '10:00:00')
  },
  {
    id: 9005,
    system_id: 'DEMO-9005',
    item_name: '電装品 E-7890',
    vendor_name: '佐藤金属工業',
    color_code: '#10b981',
    status: '納入予定',
    current_location: 'E',
    quantity: 9,
    scheduled_date: formatDate(new Date()),
    updated_at: dateWithOffset(4, '16:00:00'),
    created_at: dateWithOffset(-1, '16:00:00')
  }
];

const dedupeLatestDeliveries = (sourceDeliveries) => {
  const latestById = new Map();

  sourceDeliveries.forEach((delivery) => {
    const key = delivery.id || delivery.system_id || `${getVendorName(delivery)}-${getItemName(delivery)}`;
    const currentDate = new Date(deliveryUpdatedDate(delivery) || 0);
    const existing = latestById.get(key);
    const existingDate = existing ? new Date(deliveryUpdatedDate(existing) || 0) : null;

    if (!existing || currentDate >= existingDate) {
      latestById.set(key, delivery);
    }
  });

  return Array.from(latestById.values());
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { selectedUser, clearUser } = useUser();
  const [summary, setSummary] = useState({ scheduled_today: 0, not_received: 0, updated_today: 0 });
  const [deliveries, setDeliveries] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('today');
  const [loading, setLoading] = useState(true);

  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // 0=日曜, 6=土曜
  };

  const isHoliday = (date) => {
    return JAPAN_HOLIDAYS.has(formatDate(date));
  };

  const getVendorColor = (vendorName, fallbackColor = '#6b7280') => {
    const override = VENDOR_COLOR_OVERRIDES.find(({ keyword }) => vendorName?.includes(keyword));
    return override?.color || fallbackColor;
  };

  const calculateSummary = (sourceDeliveries) => {
    const today = formatDate(new Date());
    return {
      scheduled_today: sourceDeliveries.filter(d => formatDate(d.scheduled_date || d.deliveryDate) === today).length,
      not_received: sourceDeliveries.filter(d => d.status === '納入予定').length,
      updated_today: sourceDeliveries.filter(d => formatDate(deliveryUpdatedDate(d)) === today).length
    };
  };

  const buildCalendarEvents = (sourceDeliveries) => {
    return dedupeLatestDeliveries(sourceDeliveries)
      .map((delivery) => {
        const eventDate = formatDate(deliveryUpdatedDate(delivery));
        if (!eventDate) return null;

        const vendorColor = getVendorColor(getVendorName(delivery), delivery.color_code);
        return {
          id: `delivery-${delivery.id || delivery.system_id}`,
          title: `${getItemName(delivery)} ${delivery.status}`,
          date: eventDate,
          backgroundColor: vendorColor,
          borderColor: vendorColor,
          textColor: '#ffffff',
          extendedProps: {
            deliveryId: delivery.id,
            status: delivery.status,
            vendorName: getVendorName(delivery),
            itemName: getItemName(delivery)
          }
        };
      })
      .filter(Boolean);
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [summaryRes, deliveriesRes] = await Promise.all([
        getDashboardSummary(),
        getDeliveries()
      ]);

      const latestDeliveries = dedupeLatestDeliveries(deliveriesRes.data || []);
      setSummary(summaryRes.data || calculateSummary(latestDeliveries));
      setDeliveries(latestDeliveries);
      setCalendarEvents(buildCalendarEvents(latestDeliveries));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      const demoDeliveries = dedupeLatestDeliveries(buildDemoDeliveries());
      setSummary(calculateSummary(demoDeliveries));
      setDeliveries(demoDeliveries);
      setCalendarEvents(buildCalendarEvents(demoDeliveries));
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await exportDeliveriesCSV();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'deliveries.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case '納入予定': return 'text-blue-600 bg-blue-50';
      case '納入済': return 'text-green-600 bg-green-50';
      case '移動済': return 'text-orange-600 bg-orange-50';
      case '使用済': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              type="button"
              className="flex items-center rounded-lg p-1 pr-3 transition-colors hover:bg-gray-50"
              onClick={() => navigate('/')}
              aria-label="トップへ戻る"
            >
              <div className="w-10 h-10 bg-navy-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold">DF</span>
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold text-navy-800">DockFlow</h1>
                <p className="text-sm text-gray-500">造船部材リアルタイム管理システム</p>
              </div>
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {selectedUser?.name}（管理者）
              </span>
              <button
                onClick={() => {
                  clearUser();
                  navigate('/');
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notifications */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">本日納入予定</p>
                <p className="text-2xl font-bold text-blue-600">{summary.scheduled_today}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">未受取</p>
                <p className="text-2xl font-bold text-orange-600">{summary.not_received}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">本日更新</p>
                <p className="text-2xl font-bold text-green-600">{summary.updated_today}</p>
              </div>
              <RefreshCw className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">カレンダー</h2>
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={calendarEvents}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,dayGridWeek'
              }}
              height="auto"
              eventClick={(info) => {
                navigate(`/delivery/${info.event.extendedProps.deliveryId}`);
              }}
              dayCellClassNames={(dateInfo) => {
                let classes = [];
                
                if (isWeekend(dateInfo.date)) {
                  if (dateInfo.date.getDay() === 0) {
                    classes.push('bg-red-50'); // 日曜日は薄い赤
                  } else {
                    classes.push('bg-blue-50'); // 土曜日は薄い青
                  }
                } else if (isHoliday(dateInfo.date)) {
                  classes.push('bg-red-50'); // 祝日は薄い赤
                }
                
                return classes;
              }}
              eventContent={(eventInfo) => {
                return (
                  <div className="p-1 leading-tight">
                    <div className="text-xs font-semibold whitespace-normal">{eventInfo.event.title}</div>
                  </div>
                );
              }}
            />
          </div>
        </div>

        {/* Tabs and Content */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('today')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'today'
                    ? 'border-navy-500 text-navy-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                本日予定
              </button>
              <button
                onClick={() => setActiveTab('recent')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'recent'
                    ? 'border-navy-500 text-navy-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                最新更新
              </button>
            </nav>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-600 mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {deliveries.map((delivery) => (
                  <div
                    key={delivery.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/delivery/${delivery.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getVendorColor(getVendorName(delivery), delivery.color_code) }}></div>
                        <div>
                          <p className="font-medium text-gray-900">{getItemName(delivery)}</p>
                          <p className="text-sm text-gray-500">{getVendorName(delivery)} - 場所: {delivery.current_location}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(delivery.status)}`}>
                          {delivery.status}
                        </span>
                        <p className="text-sm text-gray-500">個数: {delivery.quantity}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {deliveries.length === 0 && (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">該当する納入物がありません</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Menu */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/delivery-list')}
            className="flex items-center justify-center space-x-2 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <Search className="w-5 h-5 text-navy-600" />
            <span className="text-navy-600 font-medium">一覧</span>
          </button>
          
          <button
            onClick={() => navigate('/map-selector')}
            className="flex items-center justify-center space-x-2 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <Plus className="w-5 h-5 text-navy-600" />
            <span className="text-navy-600 font-medium">登録</span>
          </button>
          
          <button
            onClick={() => navigate('/master-management')}
            className="flex items-center justify-center space-x-2 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <Settings className="w-5 h-5 text-navy-600" />
            <span className="text-navy-600 font-medium">マスタ管理</span>
          </button>
          
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center space-x-2 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <Download className="w-5 h-5 text-navy-600" />
            <span className="text-navy-600 font-medium">CSV出力</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
