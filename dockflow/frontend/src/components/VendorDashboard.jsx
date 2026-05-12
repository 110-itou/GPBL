import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { getDeliveries } from '../services/api';
import { Package, Plus, Calendar, List, LogOut } from 'lucide-react';
import { dummyDeliveries } from '../data/dummyData';

const VendorDashboard = () => {
  const navigate = useNavigate();
  const { selectedUser, clearUser } = useUser();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyDeliveries();
  }, []);

  const loadMyDeliveries = async () => {
    try {
      setLoading(true);
      // ダミーデータを直接使用（パフォーマンス向上のため）
      setDeliveries(dummyDeliveries);
    } catch (error) {
      console.error('Error loading deliveries:', error);
      setDeliveries(dummyDeliveries);
    } finally {
      setLoading(false);
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
            <div className="flex items-center">
              <div className="w-10 h-10 bg-navy-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold">DF</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-navy-800">DockFlow</h1>
                <p className="text-sm text-gray-500">造船部材リアルタイム管理システム</p>
              </div>
            </div>
            <button
              onClick={() => {
                clearUser();
                navigate('/');
              }}
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
            >
              <LogOut className="w-4 h-4" />
              <span>ログアウト</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome Message */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-navy-800 mb-2">
            {selectedUser?.name}様
          </h2>
          <p className="text-gray-600">
            納入管理メニュー
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-navy-600">{deliveries.length}</p>
            <p className="text-sm text-gray-600">登録件数</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {deliveries.filter(d => d.status === '納入予定').length}
            </p>
            <p className="text-sm text-gray-600">納入予定</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 mb-8">
          <button
            onClick={() => navigate('/map-selector')}
            className="w-full bg-navy-600 hover:bg-navy-700 text-white font-medium py-4 px-6 rounded-lg flex items-center justify-center space-x-3 transition-colors"
          >
            <Plus className="w-6 h-6" />
            <span className="text-lg">納入登録</span>
          </button>
          
          <button
            onClick={() => navigate('/delivery-list')}
            className="w-full bg-white hover:bg-gray-50 text-navy-600 border-2 border-navy-600 font-medium py-4 px-6 rounded-lg flex items-center justify-center space-x-3 transition-colors"
          >
            <List className="w-6 h-6" />
            <span className="text-lg">自分の登録一覧</span>
          </button>
          
                  </div>

        {/* Recent Deliveries */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">最近の登録</h3>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-600 mx-auto"></div>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {deliveries.slice(0, 5).map((delivery) => (
                <div
                  key={delivery.id}
                  className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/delivery/${delivery.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{delivery.item_name}</p>
                      <p className="text-sm text-gray-500">場所: {delivery.current_location} | 個数: {delivery.quantity}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(delivery.status)}`}>
                      {delivery.status}
                    </span>
                  </div>
                </div>
              ))}
              
              {deliveries.length === 0 && (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">登録がありません</p>
                  <p className="text-sm text-gray-400 mt-1">「納入登録」から最初の登録を行ってください</p>
                </div>
              )}
              
              {deliveries.length > 5 && (
                <button
                  onClick={() => navigate('/delivery-list')}
                  className="w-full text-center text-navy-600 font-medium py-2 hover:text-navy-700"
                >
                  すべて見る →
                </button>
              )}
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">ヘルプ</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 「納入登録」から新しい納入物を登録できます</li>
            <li>• 場所は図面をタップして選択してください</li>
            <li>• 写真やPDFファイルを添付できます</li>
            <li>• 登録後は「自分の登録一覧」で確認・編集できます</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default VendorDashboard;
