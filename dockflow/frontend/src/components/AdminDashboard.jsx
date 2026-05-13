import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { getCalendarData, getDashboardSummary, getDeliveries, exportDeliveriesCSV } from '../services/api';
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

const formatJapaneseDate = (date) => {
  const value = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(value.getTime())) return date || '';

  return value.toLocaleDateString('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short'
  });
};

const isNotReceivedDelivery = (delivery, today) => {
  const scheduledDate = formatDate(delivery.scheduled_date || delivery.deliveryDate);
  return Boolean(
    scheduledDate &&
    scheduledDate < today &&
    !['使用済', '納入済'].includes(delivery.status)
  );
};

const dedupeLatestDeliveries = (sourceDeliveries = []) => {
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

const MobileCalendarAgenda = ({ events, onEventClick }) => {
  const sortedEvents = [...events]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 30);

  if (sortedEvents.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-8 text-center">
        <Calendar className="mx-auto mb-2 h-10 w-10 text-gray-400" />
        <p className="text-sm text-gray-500">表示できるカレンダー項目がありません</p>
      </div>
    );
  }

  const groupedEvents = sortedEvents.reduce((groups, event) => {
    const key = event.date;
    return {
      ...groups,
      [key]: [...(groups[key] || []), event]
    };
  }, {});

  return (
    <div className="space-y-3">
      <div className="rounded-lg bg-navy-50 px-4 py-3">
        <p className="text-sm font-medium text-navy-800">スマホでは日付ごとの一覧で表示しています</p>
        <p className="mt-1 text-xs text-navy-600">項目をタップすると詳細を開きます</p>
      </div>

      {Object.entries(groupedEvents).map(([date, dateEvents]) => (
        <section key={date} className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-800">{formatJapaneseDate(date)}</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {dateEvents.map((event) => (
              <button
                type="button"
                key={event.id}
                onClick={() => onEventClick(event.extendedProps.deliveryId)}
                className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-inset"
              >
                <span
                  className="mt-1 h-3 w-3 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: event.backgroundColor }}
                ></span>
                <span className="min-w-0 flex-1">
                  <span className="block break-words text-sm font-medium text-gray-900">{event.extendedProps.itemName}</span>
                  <span className="mt-1 block text-xs text-gray-500">
                    {event.extendedProps.vendorName || '業者未設定'} / {event.extendedProps.status}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { selectedUser, clearUser } = useUser();
  const [summary, setSummary] = useState({ scheduled_today: 0, not_received: 0, updated_today: 0 });
  const [deliveries, setDeliveries] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('today');
  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState('');
  const detailSectionRef = useRef(null);
  const today = formatDate(new Date());

  const detailTabs = [
    {
      key: 'today',
      summaryKey: 'scheduled_today',
      label: '本日納入予定',
      emptyText: '本日納入予定の納入物はありません',
      matches: (delivery) => formatDate(delivery.scheduled_date || delivery.deliveryDate) === today
    },
    {
      key: 'notReceived',
      summaryKey: 'not_received',
      label: '未受け取り',
      emptyText: '未受け取りの納入物はありません',
      matches: (delivery) => isNotReceivedDelivery(delivery, today)
    },
    {
      key: 'updated',
      summaryKey: 'updated_today',
      label: '本日更新',
      emptyText: '本日更新された納入物はありません',
      matches: (delivery) => formatDate(deliveryUpdatedDate(delivery)) === today
    }
  ];
  const activeDetail = detailTabs.find((tab) => tab.key === activeTab) || detailTabs[0];
  const detailDeliveries = deliveries.filter(activeDetail.matches);

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
      not_received: sourceDeliveries.filter(d => isNotReceivedDelivery(d, today)).length,
      updated_today: sourceDeliveries.filter(d => formatDate(deliveryUpdatedDate(d)) === today).length
    };
  };

  const normalizeSummary = (summaryData, fallbackSummary) => ({
    scheduled_today: Number(summaryData?.scheduled_today ?? fallbackSummary.scheduled_today),
    not_received: Number(summaryData?.not_received ?? fallbackSummary.not_received),
    updated_today: Number(summaryData?.updated_today ?? fallbackSummary.updated_today)
  });

  const buildCalendarEvents = (sourceDeliveries) => {
    return dedupeLatestDeliveries(sourceDeliveries)
      .map((delivery) => {
        const eventDate = formatDate(delivery.event_date || deliveryUpdatedDate(delivery));
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
      setDashboardError('');

      const [summaryResult, deliveriesResult, calendarResult] = await Promise.allSettled([
        getDashboardSummary(),
        getDeliveries(),
        getCalendarData()
      ]);

      const deliveryRows = deliveriesResult.status === 'fulfilled' && Array.isArray(deliveriesResult.value.data)
        ? deliveriesResult.value.data
        : [];
      const latestDeliveries = dedupeLatestDeliveries(deliveryRows);
      const fallbackSummary = calculateSummary(latestDeliveries);
      const summaryData = summaryResult.status === 'fulfilled'
        ? normalizeSummary(summaryResult.value.data, fallbackSummary)
        : fallbackSummary;
      const calendarRows = calendarResult.status === 'fulfilled' && Array.isArray(calendarResult.value.data)
        ? calendarResult.value.data
        : latestDeliveries;
      const failedApis = [
        summaryResult.status === 'rejected' ? 'ダッシュボード集計' : null,
        deliveriesResult.status === 'rejected' ? '納入一覧' : null,
        calendarResult.status === 'rejected' ? 'カレンダー' : null
      ].filter(Boolean);

      setSummary(summaryData);
      setDeliveries(latestDeliveries);
      setCalendarEvents(buildCalendarEvents(calendarRows));

      if (failedApis.length > 0) {
        setDashboardError(`${failedApis.join('、')}APIの取得に失敗しました。バックエンドの状態とVITE_API_URLを確認してください。`);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setSummary(calculateSummary([]));
      setDeliveries([]);
      setCalendarEvents([]);
      setDashboardError('APIの取得に失敗しました。バックエンドに接続できないため、本番データを表示できません。');
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

  const handleSummaryClick = (tabKey) => {
    setActiveTab(tabKey);
    window.setTimeout(() => {
      detailSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  const getDetailDateText = (delivery) => {
    if (activeTab === 'updated') {
      return `更新日: ${formatDate(deliveryUpdatedDate(delivery)) || '-'}`;
    }

    return `納入予定日: ${formatDate(delivery.scheduled_date || delivery.deliveryDate) || '-'}`;
  };

  const getSummaryCardClass = (tabKey, colorClass) => (
    `w-full bg-white rounded-lg shadow p-4 sm:p-6 border-l-4 ${colorClass} text-left transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 ${
      activeTab === tabKey ? 'ring-2 ring-navy-200' : ''
    }`
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-16 flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:py-0">
            <button
              type="button"
              className="flex min-w-0 items-center rounded-lg p-1 pr-3 transition-colors hover:bg-gray-50"
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
            <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
              <span className="min-w-0 truncate text-sm text-gray-600">
                {selectedUser?.name}（管理者）
              </span>
              <button
                onClick={() => {
                  clearUser();
                  navigate('/');
                }}
                className="flex-shrink-0 text-sm text-gray-500 hover:text-gray-700"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
        {/* Notifications */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 lg:gap-6">
          <button
            type="button"
            onClick={() => handleSummaryClick('today')}
            className={getSummaryCardClass('today', 'border-blue-500')}
            aria-pressed={activeTab === 'today'}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">本日納入予定</p>
                <p className="text-2xl font-bold text-blue-600">{summary.scheduled_today}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </button>
          
          <button
            type="button"
            onClick={() => handleSummaryClick('notReceived')}
            className={getSummaryCardClass('notReceived', 'border-orange-500')}
            aria-pressed={activeTab === 'notReceived'}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">未受け取り</p>
                <p className="text-2xl font-bold text-orange-600">{summary.not_received}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>
          </button>
          
          <button
            type="button"
            onClick={() => handleSummaryClick('updated')}
            className={getSummaryCardClass('updated', 'border-green-500')}
            aria-pressed={activeTab === 'updated'}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">本日更新</p>
                <p className="text-2xl font-bold text-green-600">{summary.updated_today}</p>
              </div>
              <RefreshCw className="w-8 h-8 text-green-500" />
            </div>
          </button>
        </div>

        {dashboardError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {dashboardError}
          </div>
        )}

        {/* Calendar */}
        <div className="mb-6 rounded-lg bg-white shadow sm:mb-8">
          <div className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">カレンダー</h2>
            <div className="md:hidden">
              <MobileCalendarAgenda
                events={calendarEvents}
                onEventClick={(deliveryId) => {
                  if (deliveryId) navigate(`/delivery/${deliveryId}`);
                }}
              />
            </div>
            <div className="hidden md:block">
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
        </div>

        {/* Tabs and Content */}
        <div ref={detailSectionRef} className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto" aria-label="集計詳細">
              {detailTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`whitespace-nowrap px-4 py-4 text-sm font-medium border-b-2 sm:px-6 ${
                    activeTab === tab.key
                      ? 'border-navy-500 text-navy-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 text-xs text-gray-400">{summary[tab.summaryKey]}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-600 mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800">{activeDetail.label}</h2>
                  <span className="text-sm text-gray-500">{detailDeliveries.length} 件</span>
                </div>

                {detailDeliveries.map((delivery) => (
                  <div
                    key={delivery.id || delivery.system_id}
                    className="cursor-pointer rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
                    onClick={() => navigate(`/delivery/${delivery.id}`)}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="h-3 w-3 flex-shrink-0 rounded-full" style={{ backgroundColor: getVendorColor(getVendorName(delivery), delivery.color_code) }}></div>
                        <div className="min-w-0">
                          <p className="break-words font-medium text-gray-900">{getItemName(delivery)}</p>
                          <p className="text-sm text-gray-500">{getVendorName(delivery)} - 場所: {delivery.current_location}</p>
                          <p className="text-xs text-gray-400">{getDetailDateText(delivery)}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(delivery.status)}`}>
                          {delivery.status}
                        </span>
                        <p className="text-sm text-gray-500">個数: {delivery.quantity}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {detailDeliveries.length === 0 && (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">{activeDetail.emptyText}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Menu */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 md:grid-cols-4 md:gap-4">
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
