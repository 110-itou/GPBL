import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { getVendors, createVendor, updateVendor, deleteVendor, getItems, createItem, updateItem, deleteItem, getUsers } from '../services/api';
import { ArrowLeft, Plus, Edit, Trash2, Users, Package, Settings } from 'lucide-react';

const MasterManagement = () => {
  const navigate = useNavigate();
  const { selectedUser } = useUser();
  const [activeTab, setActiveTab] = useState('vendors');
  const [vendors, setVendors] = useState([]);
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (selectedUser?.role !== 'admin') {
      navigate('/admin');
      return;
    }
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'vendors') {
        const response = await getVendors();
        setVendors(response.data);
      } else if (activeTab === 'items') {
        const response = await getItems();
        setItems(response.data);
      } else if (activeTab === 'users') {
        const response = await getUsers();
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({});
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setShowForm(true);
  };

  const handleDelete = async (id, type) => {
    if (!confirm('本当に削除してもよろしいですか？')) return;

    try {
      if (type === 'vendor') {
        await deleteVendor(id);
      } else if (type === 'item') {
        await deleteItem(id);
      }
      loadData();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('削除に失敗しました。');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === 'vendors') {
        if (editingItem) {
          await updateVendor(editingItem.id, formData);
        } else {
          const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
          const randomColor = colors[Math.floor(Math.random() * colors.length)];
          await createVendor({
            ...formData,
            color_code: formData.color_code || randomColor,
            created_by: selectedUser.id
          });
        }
      } else if (activeTab === 'items') {
        if (editingItem) {
          await updateItem(editingItem.id, formData);
        } else {
          await createItem(formData);
        }
      }
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error('Error saving:', error);
      alert('保存に失敗しました。');
    }
  };

  const handleBack = () => {
    navigate('/admin');
  };

  const renderVendorForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">業者名</label>
        <input
          type="text"
          value={formData.vendor_name || ''}
          onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
          required
          className="input-field"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">色コード</label>
        <input
          type="color"
          value={formData.color_code || '#4ECDC4'}
          onChange={(e) => setFormData({ ...formData, color_code: e.target.value })}
          className="w-full h-10 rounded cursor-pointer"
        />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={() => setShowForm(false)} className="btn-secondary sm:w-auto">
          キャンセル
        </button>
        <button type="submit" className="btn-primary sm:w-auto">
          {editingItem ? '更新' : '追加'}
        </button>
      </div>
    </form>
  );

  const renderItemForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">品名</label>
        <input
          type="text"
          value={formData.item_name || ''}
          onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
          required
          className="input-field"
        />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={() => setShowForm(false)} className="btn-secondary sm:w-auto">
          キャンセル
        </button>
        <button type="submit" className="btn-primary sm:w-auto">
          {editingItem ? '更新' : '追加'}
        </button>
      </div>
    </form>
  );

  const renderVendors = () => (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-800">業者管理</h3>
        <button onClick={handleAdd} className="btn-primary sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          業者追加
        </button>
      </div>

      {showForm && renderVendorForm()}

      <div className="space-y-3 md:hidden">
        {vendors.map((vendor) => (
          <div key={vendor.id} className="rounded-lg bg-white p-4 shadow">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="break-words font-medium text-gray-900">{vendor.vendor_name}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div
                    className="h-5 w-5 flex-shrink-0 rounded"
                    style={{ backgroundColor: vendor.color_code }}
                  ></div>
                  <span className="text-sm text-gray-600">{vendor.color_code}</span>
                </div>
              </div>
              <div className="flex flex-shrink-0 gap-1">
                <button
                  onClick={() => handleEdit(vendor)}
                  className="touch-target rounded p-2 text-navy-600 hover:bg-navy-50"
                  aria-label={`${vendor.vendor_name}を編集`}
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(vendor.id, 'vendor')}
                  className="touch-target rounded p-2 text-red-600 hover:bg-red-50"
                  aria-label={`${vendor.vendor_name}を削除`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-lg bg-white shadow md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">業者名</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">色</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {vendors.map((vendor) => (
              <tr key={vendor.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{vendor.vendor_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div
                      className="w-6 h-6 rounded mr-2"
                      style={{ backgroundColor: vendor.color_code }}
                    ></div>
                    <span className="text-sm text-gray-600">{vendor.color_code}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(vendor)}
                      className="text-navy-600 hover:text-navy-900"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(vendor.id, 'vendor')}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderItems = () => (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-800">品名管理</h3>
        <button onClick={handleAdd} className="btn-primary sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          品名追加
        </button>
      </div>

      {showForm && renderItemForm()}

      <div className="space-y-3 md:hidden">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg bg-white p-4 shadow">
            <p className="min-w-0 break-words font-medium text-gray-900">{item.item_name}</p>
            <div className="flex flex-shrink-0 gap-1">
              <button
                onClick={() => handleEdit(item)}
                className="touch-target rounded p-2 text-navy-600 hover:bg-navy-50"
                aria-label={`${item.item_name}を編集`}
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(item.id, 'item')}
                className="touch-target rounded p-2 text-red-600 hover:bg-red-50"
                aria-label={`${item.item_name}を削除`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-lg bg-white shadow md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">品名</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{item.item_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-navy-600 hover:text-navy-900"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, 'item')}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">ユーザー管理</h3>
      </div>

      <div className="space-y-3 md:hidden">
        {users.map((user) => (
          <div key={user.id} className="rounded-lg bg-white p-4 shadow">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="break-words font-medium text-gray-900">{user.name}</p>
                <p className="mt-1 break-words text-sm text-gray-500">{user.email || '-'}</p>
              </div>
              <span className={`flex-shrink-0 rounded-full px-2 py-1 text-xs font-medium ${
                user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {user.role === 'admin' ? '管理者' : '納入業者'}
              </span>
            </div>
            <p className="text-sm text-gray-600">業者: {user.vendor_id || '-'}</p>
          </div>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-lg bg-white shadow md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">名前</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">メール</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">役割</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">業者</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role === 'admin' ? '管理者' : '納入業者'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{user.vendor_id || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg bg-blue-50 p-4">
        <h4 className="font-medium text-blue-900 mb-2">ユーザー管理について</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 現在、ユーザーの追加・編集・削除機能は実装されていません</li>
          <li>• ユーザー管理はデータベース直接操作またはシードデータで行います</li>
          <li>• 将来的にはGUIでのユーザー管理機能を追加予定です</li>
        </ul>
      </div>
    </div>
  );

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
          <div className="flex min-h-16 items-center py-3 sm:py-0">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="touch-target mr-2 rounded-lg p-2 transition-colors hover:bg-gray-100 sm:mr-3"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex min-w-0 items-center rounded-lg p-1 pr-3 transition-colors hover:bg-gray-50"
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
      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h2 className="mb-4 text-xl font-bold text-navy-800 sm:mb-6 sm:text-2xl">マスタ管理</h2>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex overflow-x-auto scrollbar-soft">
              <button
                onClick={() => setActiveTab('vendors')}
                className={`flex items-center space-x-2 whitespace-nowrap border-b-2 px-4 py-4 text-sm font-medium sm:px-6 ${
                  activeTab === 'vendors'
                    ? 'border-navy-500 text-navy-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>業者</span>
              </button>
              <button
                onClick={() => setActiveTab('items')}
                className={`flex items-center space-x-2 whitespace-nowrap border-b-2 px-4 py-4 text-sm font-medium sm:px-6 ${
                  activeTab === 'items'
                    ? 'border-navy-500 text-navy-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>品名</span>
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center space-x-2 whitespace-nowrap border-b-2 px-4 py-4 text-sm font-medium sm:px-6 ${
                  activeTab === 'users'
                    ? 'border-navy-500 text-navy-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>ユーザー</span>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'vendors' && renderVendors()}
            {activeTab === 'items' && renderItems()}
            {activeTab === 'users' && renderUsers()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MasterManagement;
