import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { getDeliveries, updateDelivery, getItems, getVendors } from '../services/api';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';

const DeliveryEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedUser } = useUser();
  const [delivery, setDelivery] = useState(null);
  const [items, setItems] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const [formData, setFormData] = useState({
    status: '',
    quantity: '',
    order_no: '',
    scheduled_date: '',
    received_date: '',
    memo: ''
  });

  useEffect(() => {
    loadDeliveryData();
  }, [id]);

  const loadDeliveryData = async () => {
    try {
      setLoading(true);
      const [deliveryRes, itemsRes, vendorsRes] = await Promise.all([
        getDeliveries(),
        getItems(),
        getVendors()
      ]);

      const deliveryData = deliveryRes.data.find(d => d.id === parseInt(id));
      if (!deliveryData) {
        navigate('/delivery-list');
        return;
      }

      // Check edit permissions
      if (selectedUser?.role !== 'admin' && deliveryData.created_by !== selectedUser?.id) {
        navigate(`/delivery/${id}`);
        return;
      }

      setDelivery(deliveryData);
      setItems(itemsRes.data);
      setVendors(vendorsRes.data);

      setFormData({
        status: deliveryData.status,
        quantity: deliveryData.quantity,
        order_no: deliveryData.order_no || '',
        scheduled_date: deliveryData.scheduled_date || '',
        received_date: deliveryData.received_date || '',
        memo: deliveryData.memo || ''
      });
    } catch (error) {
      console.error('Error loading delivery data:', error);
    } finally {
      setLoading(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updateData = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        moved_by: selectedUser.id
      };

      const response = await updateDelivery(id, updateData);

      // TODO: Handle file uploads to Cloudinary
      // For now, just navigate to the detail page
      navigate(`/delivery/${id}`);
    } catch (error) {
      console.error('Error updating delivery:', error);
      alert('更新に失敗しました。もう一度お試しください。');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate(`/delivery/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-600"></div>
      </div>
    );
  }

  if (!delivery) {
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
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-navy-800 mb-2">
            納入情報編集
          </h2>
          <div className="bg-gray-100 rounded-lg p-3 inline-block">
            <span className="font-medium text-gray-700">{delivery.item_name}</span>
            <span className="mx-2 text-gray-500">|</span>
            <span className="font-medium text-gray-700">場所: {delivery.current_location}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Editable Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">編集可能項目</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* Read-only Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">固定情報</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  品名
                </label>
                <input
                  type="text"
                  value={delivery.item_name}
                  readOnly
                  className="input-field bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  業者
                </label>
                <input
                  type="text"
                  value={delivery.vendor_name}
                  readOnly
                  className="input-field bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  場所
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={delivery.current_location}
                    readOnly
                    className="flex-1 input-field bg-gray-100"
                  />
                  <button
                    type="button"
                    onClick={() => navigate(`/delivery/${id}/location-change`)}
                    className="btn-secondary whitespace-nowrap"
                  >
                    場所変更
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  システムID
                </label>
                <input
                  type="text"
                  value={delivery.system_id}
                  readOnly
                  className="input-field bg-gray-100"
                />
              </div>
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
                <span>ファイルを追加</span>
              </label>
              <p className="text-sm text-gray-500 mt-2">
                写真最大5枚、PDF最大1件（既存ファイルに追加）
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

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 btn-secondary"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 btn-primary"
            >
              {saving ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>保存中...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <Save className="w-4 h-4" />
                  <span>保存する</span>
                </span>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default DeliveryEdit;
