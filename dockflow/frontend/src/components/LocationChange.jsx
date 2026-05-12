import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { getDeliveries, updateDelivery } from '../services/api';
import mapImage from '../assets/map.png';
import { ArrowLeft, MapPin, Check } from 'lucide-react';

const LocationChange = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedUser } = useUser();
  const [delivery, setDelivery] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [moveMemo, setMoveMemo] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const locations = [
    { id: 'A', x: 90, y: 90 },
    { id: 'B', x: 220, y: 90 },
    { id: 'C', x: 350, y: 90 },
    { id: 'D', x: 480, y: 90 },
    { id: 'E', x: 610, y: 90 },
    { id: 'F', x: 700, y: 90 },
    { id: 'G', x: 90, y: 220 },
    { id: 'H', x: 220, y: 220 },
    { id: 'I', x: 350, y: 220 },
    { id: 'J', x: 480, y: 220 },
    { id: 'K', x: 610, y: 220 }
  ];

  useEffect(() => {
    loadDeliveryData();
  }, [id]);

  const loadDeliveryData = async () => {
    try {
      setLoading(true);
      const response = await getDeliveries();
      const deliveryData = response.data.find(d => d.id === parseInt(id));
      
      if (!deliveryData) {
        navigate('/delivery-list');
        return;
      }

      setDelivery(deliveryData);
      setSelectedLocation(deliveryData.current_location);
    } catch (error) {
      console.error('Error loading delivery data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (locationId) => {
    if (locationId !== delivery.current_location) {
      setSelectedLocation(locationId);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedLocation || selectedLocation === delivery.current_location) {
      alert('新しい場所を選択してください');
      return;
    }

    setSaving(true);
    try {
      await updateDelivery(id, {
        current_location: selectedLocation,
        moved_by: selectedUser.id,
        memo: moveMemo
      });

      navigate(`/delivery/${id}`);
    } catch (error) {
      console.error('Error updating location:', error);
      alert('場所の更新に失敗しました。もう一度お試しください。');
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
            場所変更
          </h2>
          <div className="bg-gray-100 rounded-lg p-3 inline-block mb-4">
            <span className="font-medium text-gray-700">{delivery.item_name}</span>
            <span className="mx-2 text-gray-500">|</span>
            <span className="font-medium text-gray-700">現在の場所: {delivery.current_location}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Location */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">現在の場所</h3>
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center border-2 border-gray-400">
                <span className="text-xl font-bold text-gray-600">{delivery.current_location}</span>
              </div>
            </div>
          </div>

          {/* Map Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">新しい場所を選択</h3>
            
            {/* Selected Location Display */}
            {selectedLocation && selectedLocation !== delivery.current_location && (
              <div className="bg-green-600 text-white rounded-lg p-4 mb-6 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <MapPin className="w-6 h-6" />
                  <span className="text-xl font-bold">新しい場所：{selectedLocation}</span>
                </div>
              </div>
            )}

            <div className="relative inline-block">
              <img
                src={mapImage}
                alt="保管場所図面"
                className="max-w-full h-auto"
                style={{ maxHeight: '400px' }}
              />
              
              {/* Location Overlays */}
              {locations.map((location) => {
                const isCurrentLocation = location.id === delivery.current_location;
                const isSelectedLocation = location.id === selectedLocation;
                
                return (
                  <button
                    key={location.id}
                    onClick={() => handleLocationSelect(location.id)}
                    disabled={isCurrentLocation}
                    className={`absolute w-16 h-16 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                      isCurrentLocation
                        ? 'bg-gray-300 border-gray-400 cursor-not-allowed opacity-50'
                        : isSelectedLocation
                        ? 'bg-green-600 border-green-700 shadow-lg scale-110'
                        : 'bg-white bg-opacity-80 border-navy-500 hover:bg-green-100 hover:scale-105'
                    }`}
                    style={{
                      left: `${location.x - 32}px`,
                      top: `${location.y - 32}px`
                    }}
                  >
                    <span className={`font-bold text-lg ${
                      isCurrentLocation
                        ? 'text-gray-600'
                        : isSelectedLocation
                        ? 'text-white'
                        : 'text-navy-600'
                    }`}>
                      {location.id}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p>• 現在の場所は灰色で表示されています</p>
              <p>• 新しい場所をタップして選択してください</p>
              <p>• 選択した場所は緑色でハイライトされます</p>
            </div>
          </div>

          {/* Move Memo */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">移動メモ</h3>
            <textarea
              value={moveMemo}
              onChange={(e) => setMoveMemo(e.target.value)}
              placeholder="移動の理由や特記事項があれば入力してください（任意）"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
            />
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
              disabled={saving || !selectedLocation || selectedLocation === delivery.current_location}
              className={`flex-1 font-medium py-3 px-6 rounded-lg transition-colors ${
                selectedLocation && selectedLocation !== delivery.current_location && !saving
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {saving ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>更新中...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <Check className="w-5 h-5" />
                  <span>場所を更新する</span>
                </span>
              )}
            </button>
          </div>
        </form>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">場所変更について</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 場所の変更は社内の担当者が行うことを想定しています</li>
            <li>• 変更履歴が自動的に記録されます</li>
            <li>• 移動メモには変更理由や特記事項を記録できます</li>
            <li>• 変更後は納入物詳細画面で履歴を確認できます</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default LocationChange;
