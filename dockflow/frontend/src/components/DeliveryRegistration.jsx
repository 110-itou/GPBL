import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { createDelivery, getItems, getVendors, createVendor } from '../services/api';
import { ArrowLeft, Upload, Plus, X } from 'lucide-react';

const DeliveryRegistration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedUser } = useUser();
  const [selectedLocation] = useState(location.state?.selectedLocation || '');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [newVendorName, setNewVendorName] = useState('');
  const [showNewVendorForm, setShowNewVendorForm] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const [formData, setFormData] = useState({
    item_id: '',
    vendor_id: selectedUser?.vendor_id || '',
    status: '納入予定',
    current_location: selectedLocation,
    quantity: '',
    order_no: '',
    scheduled_date: '',
    received_date: '',
    memo: ''
  });

  useEffect(() => {
    if (!selectedLocation) {
      navigate('/map-selector');
      return;
    }
    loadMasters();
  }, [selectedLocation]);

  const loadMasters = async () => {
    try {
      const [itemsRes, vendorsRes] = await Promise.all([
        getItems(),
        getVendors()
      ]);
      setItems(itemsRes.data);
      setVendors(vendorsRes.data);
    } catch (error) {
      console.error('Error loading masters:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      if (file.type.startsWith('image/')) {
        return uploadedFiles.filter(f => f.type === 'photo').length < 5;
      } else if (file.type === 'application/pdf') {
        return uploadedFiles.filter(f => f.type === 'pdf').length < 1;
      }
      return false;
    });

    const newFiles = validFiles.map(file => ({
      file,
      type: file.type.startsWith('image/') ? 'photo' : 'pdf',
      name: file.name,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    const file = uploadedFiles[index];
    if (file.preview) {
      URL.revokeObjectURL(file.preview);
    }
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddVendor = async () => {
    if (!newVendorName.trim()) return;

    try {
      // Generate random color for new vendor
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      const response = await createVendor({
        vendor_name: newVendorName,
        color_code: randomColor,
        created_by: selectedUser.id
      });

      setVendors(prev => [...prev, response.data]);
      setFormData(prev => ({ ...prev, vendor_id: response.data.id }));
      setNewVendorName('');
      setShowNewVendorForm(false);
    } catch (error) {
      console.error('Error adding vendor:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const deliveryData = {
        ...formData,
        created_by: selectedUser.id,
        quantity: parseFloat(formData.quantity)
      };

      const response = await createDelivery(deliveryData);

      // TODO: Handle file uploads to Cloudinary
      // For now, just navigate to the detail page
      navigate(`/delivery/${response.data.id}`);
    } catch (error) {
      console.error('Error creating delivery:', error);
      alert('登録に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/map-selector');
  };

  if (!selectedLocation) {
    return null;
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
              <div className="w-10 h-10 bg-navy-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold">DF</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-navy-800">DockFlow</h1>
                <p className="text-sm text-gray-500">造船部材リアルタイム管理システム</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-navy-800 mb-2">
            納入登録
          </h2>
          <div className="bg-navy-600 text-white rounded-lg p-3 inline-block">
            <span className="font-medium">場所：{selectedLocation}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">基本情報</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  品名 <span className="text-red-500">*</span>
                </label>
                <select
                  name="item_id"
                  value={formData.item_id}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                >
                  <option value="">選択してください</option>
                  {items.map(item => (
                    <option key={item.id} value={item.id}>{item.item_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  業者 <span className="text-red-500">*</span>
                </label>
                {selectedUser?.role === 'admin' ? (
                  <div className="space-y-2">
                    <select
                      name="vendor_id"
                      value={formData.vendor_id}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                    >
                      <option value="">選択してください</option>
                      {vendors.map(vendor => (
                        <option key={vendor.id} value={vendor.id}>{vendor.vendor_name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowNewVendorForm(!showNewVendorForm)}
                      className="text-sm text-navy-600 hover:text-navy-700"
                    >
                      + 新規業者を追加
                    </button>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={vendors.find(v => v.id === formData.vendor_id)?.vendor_name || ''}
                    readOnly
                    className="input-field bg-gray-100"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  状態 <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                >
                  <option value="納入予定">納入予定</option>
                  <option value="納入済">納入済</option>
                  <option value="移動済">移動済</option>
                  <option value="使用済">使用済</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  個数 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                  placeholder="例: 10.5"
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Optional Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">追加情報</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  発注番号
                </label>
                <input
                  type="text"
                  name="order_no"
                  value={formData.order_no}
                  onChange={handleInputChange}
                  placeholder="任意"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  納入予定日
                </label>
                <input
                  type="date"
                  name="scheduled_date"
                  value={formData.scheduled_date}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  受取日
                </label>
                <input
                  type="date"
                  name="received_date"
                  value={formData.received_date}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                メモ
              </label>
              <textarea
                name="memo"
                value={formData.memo}
                onChange={handleInputChange}
                rows={3}
                placeholder="任意"
                className="input-field"
              />
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">ファイル添付</h3>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                id="file-upload"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer inline-flex items-center space-x-2 text-navy-600 hover:text-navy-700"
              >
                <Upload className="w-5 h-5" />
                <span>ファイルを選択</span>
              </label>
              <p className="text-sm text-gray-500 mt-2">
                写真最大5枚、PDF最大1件
              </p>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                    <div className="flex items-center space-x-3">
                      {file.type === 'photo' && file.preview && (
                        <img src={file.preview} alt={file.name} className="w-10 h-10 object-cover rounded" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">{file.type === 'photo' ? '写真' : 'PDF'}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* New Vendor Form */}
          {showNewVendorForm && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">新規業者追加</h3>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newVendorName}
                  onChange={(e) => setNewVendorName(e.target.value)}
                  placeholder="業者名"
                  className="flex-1 input-field"
                />
                <button
                  type="button"
                  onClick={handleAddVendor}
                  disabled={!newVendorName.trim()}
                  className="btn-primary"
                >
                  追加
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewVendorForm(false);
                    setNewVendorName('');
                  }}
                  className="btn-secondary"
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 btn-secondary"
            >
              戻る
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary"
            >
              {loading ? '登録中...' : '登録する'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default DeliveryRegistration;
