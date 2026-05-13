import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { getDashboardSummary, getDeliveries, exportDeliveriesCSV } from '../services/api';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Calendar, Package, AlertCircle, RefreshCw, Users, Settings, Download, Search, Plus } from 'lucide-react';
import { dummyDeliveries, dummyCalendarEvents, dummyNotifications } from '../data/dummyData';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { selectedUser, clearUser } = useUser();
  const [summary, setSummary] = useState({ scheduled_today: 0, not_received: 0, updated_today: 0 });
  const [deliveries, setDeliveries] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('today');
  const [loading, setLoading] = useState(true);

  // 土日判定用関数
  const isWeekend = (date) => {
    const day = new Date(date).getDay();
    return day === 0 || day === 6; // 0=日曜, 6=土曜
  };

  // 祝日判定（簡易版）
  const isHoliday = (date) => {
    const holidays = ['2024-05-03', '2024-05-04', '2024-05-05']; // ゴールデンウィーク
    return holidays.includes(date);
  };

  // 業者別色分け
  const getVendorColor = (vendorName) => {
    if (vendorName.includes('山田')) return '#3b82f6'; // 青
    if (vendorName.includes('佐藤')) return '#10b981'; // 緑
    if (vendorName.includes('鈴木')) return '#f97316'; // オレンジ
    return '#6b7280'; // デフォルト（灰色）
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // ダミーデータを直接使用（パフォーマンス向上のため）
      setSummary({
        scheduled_today: dummyDeliveries.filter(d => d.status === '納入予定').length,
        not_received: dummyDeliveries.filter(d => d.status === '納入予定').length,
        updated_today: dummyDeliveries.filter(d => d.status === '納入済' || d.status === '移動済').length
      });
      setDeliveries(dummyDeliveries);
      
      // カレンダーイベントに変換（1納入物当たり最新の状態のみ表示）
      const latestDeliveryStatus = {};
      
      // 各納入物の最新状態を取得
      dummyDeliveries.forEach(delivery => {
        const key = `${delivery.vendor_name}_${delivery.material_name}`;
        if (!latestDeliveryStatus[key] || new Date(delivery.updatedAt) > new Date(latestDeliveryStatus[key].updatedAt)) {
          latestDeliveryStatus[key] = delivery;
        }
      });
      
      // 完全に重複を排除したカレンダーイベントを作成（1納入物当たり1件のみ）
      const uniqueEvents = [];
      
      // まず最新状態の納入物のみをフィルタリング
      const latestDeliveries = Object.values(latestDeliveryStatus);
      
      // デバッグ用：最新状態の納入物を確認
      console.log('Latest deliveries:', latestDeliveries);
      
      // 最新状態の納入物のみをカレンダーイベントに変換
      latestDeliveries.forEach(delivery => {
        // 日付を決定（納入物の更新日を優先）
        const eventDate = delivery.updatedAt?.split('T')[0] || new Date().toISOString().split('T')[0];
        
        uniqueEvents.push({
          title: `${delivery.material_name} - ${delivery.status}`,
          date: eventDate,
          backgroundColor: getVendorColor(delivery.vendor_name),
          textColor: '#ffffff',
          extendedProps: {
            deliveryId: delivery.id,
            status: delivery.status,
            vendorName: delivery.vendor_name,
            materialName: delivery.material_name
          }
        });
      });
      
      // デバッグ用：最終的なカレンダーイベントを確認
      console.log('Final calendar events:', uniqueEvents);
      
      setCalendarEvents(uniqueEvents);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // エラー時もダミーデータを使用
      setSummary({
        scheduled_today: dummyDeliveries.filter(d => d.status === 'registered').length,
        not_received: dummyDeliveries.filter(d => d.status === 'registered').length,
        updated_today: dummyDeliveries.filter(d => d.status === 'processing' || d.status === 'arrived').length
      });
      setDeliveries(dummyDeliveries);
      setCalendarEvents(dummyCalendarEvents);
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

  // ステータス表示用
  const getStatusText = (status) => {
    switch (status) {
      case '納入予定': return '納入予定';
      case '納入済': return '納入済';
      case '移動済': return '移動済';
      case '使用済': return '使用済';
      default: return '納入予定';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div 
              className="flex items-center cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
              onClick={() => navigate('/')}
            >
              <div className="w-10 h-10 bg-navy-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold">DF</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-navy-800">DockFlow</h1>
                <p className="text-sm text-gray-500">造船部材リアルタイム管理システム</p>
              </div>
            </div>
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
                const date = dateInfo.date.toISOString().split('T')[0];
                let classes = [];
                
                if (isWeekend(date)) {
                  if (new Date(date).getDay() === 0) {
                    classes.push('bg-red-50'); // 日曜日は薄い赤
                  } else {
                    classes.push('bg-blue-50'); // 土曜日は薄い青
                  }
                } else if (isHoliday(date)) {
                  classes.push('bg-red-50'); // 祝日は薄い赤
                }
                
                return classes;
              }}
              eventContent={(eventInfo) => {
                const { event } = eventInfo;
                const delivery = dummyDeliveries.find(d => d.id === event.extendedProps.deliveryId);
                
                return (
                  <div className="p-1">
                    <div className="text-xs font-semibold">{event.title}</div>
                    {delivery && (
                      <div className="text-xs mt-1">{getStatusText(delivery.status)}</div>
                    )}
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
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: delivery.color_code }}></div>
                        <div>
                          <p className="font-medium text-gray-900">{delivery.item_name}</p>
                          <p className="text-sm text-gray-500">{delivery.vendor_name} - 場所: {delivery.current_location}</p>
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
