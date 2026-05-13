import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { getDeliveries, getItems, getVendors } from '../services/api';
import { Search, Filter, ArrowLeft, Eye, Edit, Trash2, Calendar, Package } from 'lucide-react';

const DeliveryList = () => {
  const navigate = useNavigate();
  const { selectedUser } = useUser();
  const [deliveries, setDeliveries] = useState([]);
  const [items, setItems] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    item_id: '',
    vendor_id: '',
    current_location: '',
    status: '',
    date: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, deliveries]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [deliveriesRes, itemsRes, vendorsRes] = await Promise.all([
        getDeliveries(),
        getItems(),
        getVendors()
      ]);
      
      let filteredDeliveries = deliveriesRes.data;
      if (selectedUser?.role === 'vendor') {
        filteredDeliveries = filteredDeliveries.filter(d => d.vendor_id === selectedUser.vendor_id);
      }
      
      setDeliveries(filteredDeliveries);
      setItems(itemsRes.data);
      setVendors(vendorsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    // This is handled in the backend API call
    // For now, we'll just use the loaded deliveries
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const searchParams = { ...filters };
      if (selectedUser?.role === 'vendor') {
        searchParams.vendor_id = selectedUser.vendor_id;
      }
      
      const response = await getDeliveries(searchParams);
      setDeliveries(response.data);
    } catch (error) {
      console.error('Error searching deliveries:', error);
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

  const filteredDeliveries = deliveries.filter(delivery => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      delivery.item_name?.toLowerCase().includes(searchLower) ||
      delivery.vendor_name?.toLowerCase().includes(searchLower) ||
      delivery.order_no?.toLowerCase().includes(searchLower) ||
      delivery.system_id?.toLowerCase().includes(searchLower)
    );
  });

  const handleBack = () => {
    if (selectedUser?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/vendor');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="mr-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex items-center rounded-lg p-1 pr-3 transition-colors hover:bg-gray-50"
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-navy-800 mb-6">
            {selectedUser?.role === 'admin' ? '納入物一覧' : '自分の登録一覧'}
          </h2>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="品名、業者、発注番号で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" />
              <span>フィルター</span>
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">品名</label>
                  <select
                    value={filters.item_id}
                    onChange={(e) => handleFilterChange('item_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
                  >
                    <option value="">すべて</option>
                    {items.map(item => (
                      <option key={item.id} value={item.id}>{item.item_name}</option>
                    ))}
                  </select>
                </div>

                {selectedUser?.role === 'admin' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">業者</label>
                    <select
                      value={filters.vendor_id}
                      onChange={(e) => handleFilterChange('vendor_id', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
                    >
                      <option value="">すべて</option>
                      {vendors.map(vendor => (
                        <option key={vendor.id} value={vendor.id}>{vendor.vendor_name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">場所</label>
                  <select
                    value={filters.current_location}
                    onChange={(e) => handleFilterChange('current_location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
                  >
                    <option value="">すべて</option>
                    {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'].map(loc => (
                      <option key={loc} value={loc}>場所 {loc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">状態</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
                  >
                    <option value="">すべて</option>
                    <option value="納入予定">納入予定</option>
                    <option value="納入済">納入済</option>
                    <option value="移動済">移動済</option>
                    <option value="使用済">使用済</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
                  <input
                    type="date"
                    value={filters.date}
                    onChange={(e) => handleFilterChange('date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleSearch}
                    className="w-full btn-primary"
                  >
                    適用
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="mb-4 text-sm text-gray-600">
            {filteredDeliveries.length} 件の結果
          </div>
        </div>

        {/* Delivery List */}
        {isMobile ? (
          // Mobile Card View
          <div className="space-y-4">
            {filteredDeliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/delivery/${delivery.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: delivery.color_code }}></div>
                    <span className="font-medium text-gray-900">{delivery.item_name}</span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(delivery.status)}`}>
                    {delivery.status}
                  </span>
                </div>
                
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>システムID:</span>
                    <span>{delivery.system_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>業者:</span>
                    <span>{delivery.vendor_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>場所:</span>
                    <span>{delivery.current_location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>個数:</span>
                    <span>{delivery.quantity}</span>
                  </div>
                  {delivery.scheduled_date && (
                    <div className="flex justify-between">
                      <span>納入予定日:</span>
                      <span>{delivery.scheduled_date}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2 mt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/delivery/${delivery.id}`);
                    }}
                    className="p-2 text-navy-600 hover:bg-navy-50 rounded"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {selectedUser?.role === 'admin' || delivery.created_by === selectedUser?.id ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/delivery/${delivery.id}/edit`);
                      }}
                      className="p-2 text-navy-600 hover:bg-navy-50 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Desktop Table View
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状態
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    品名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    発注番号
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    業者
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    場所
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    個数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    納入予定日
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDeliveries.map((delivery) => (
                  <tr key={delivery.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(delivery.status)}`}>
                        {delivery.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: delivery.color_code }}></div>
                        <span className="text-sm font-medium text-gray-900">{delivery.item_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {delivery.order_no || '未設定'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {delivery.vendor_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {delivery.current_location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {delivery.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {delivery.scheduled_date || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/delivery/${delivery.id}`)}
                          className="text-navy-600 hover:text-navy-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {selectedUser?.role === 'admin' || delivery.created_by === selectedUser?.id ? (
                          <button
                            onClick={() => navigate(`/delivery/${delivery.id}/edit`)}
                            className="text-navy-600 hover:text-navy-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredDeliveries.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">該当する納入物がありません</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default DeliveryList;
