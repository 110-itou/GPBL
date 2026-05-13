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
    { id: 'A', x: 84.62, y: 62.74 },
    { id: 'B', x: 84.62, y: 43.75 },
    { id: 'C', x: 84.62, y: 24.76 },
    { id: 'D', x: 48.21, y: 62.74 },
    { id: 'E', x: 48.21, y: 43.75 },
    { id: 'F', x: 48.21, y: 24.76 },
    { id: 'G', x: 59.5, y: 24.76 },
    { id: 'H', x: 34.62, y: 38.56 },
    { id: 'I', x: 24.71, y: 38.56 },
    { id: 'J', x: 14.69, y: 38.56 },
    { id: 'K', x: 14.69, y: 23.46 }
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
      <main className="mx-auto max-w-4xl px-3 py-4 sm:px-4 sm:py-8">
        <div className="mb-6 text-center sm:mb-8">
          <h2 className="mb-2 text-xl font-bold text-navy-800 sm:text-2xl">
            場所変更
          </h2>
          <div className="mb-4 inline-flex max-w-full flex-col gap-1 rounded-lg bg-gray-100 p-3 text-sm sm:inline-block sm:text-base">
            <span className="font-medium text-gray-700">{delivery.item_name}</span>
            <span className="mx-2 hidden text-gray-500 sm:inline">|</span>
            <span className="font-medium text-gray-700">現在の場所: {delivery.current_location}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Location */}
          <div className="rounded-lg bg-white p-4 shadow sm:p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">現在の場所</h3>
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center border-2 border-gray-400">
                <span className="text-xl font-bold text-gray-600">{delivery.current_location}</span>
              </div>
            </div>
          </div>

          {/* Map Selection */}
          <div className="rounded-lg bg-white p-4 shadow sm:p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">新しい場所を選択</h3>
            
            {/* Selected Location Display */}
            {selectedLocation && selectedLocation !== delivery.current_location && (
              <div className="mb-4 rounded-lg bg-green-600 p-4 text-center text-white sm:mb-6">
                <div className="flex items-center justify-center space-x-2">
                  <MapPin className="w-6 h-6" />
                  <span className="text-lg font-bold sm:text-xl">新しい場所：{selectedLocation}</span>
                </div>
              </div>
            )}

            <div className="mb-4 grid grid-cols-6 gap-2 sm:hidden">
              {locations.map((location) => {
                const isCurrentLocation = location.id === delivery.current_location;
                const isSelectedLocation = location.id === selectedLocation;

                return (
                  <button
                    type="button"
                    key={location.id}
                    onClick={() => handleLocationSelect(location.id)}
                    disabled={isCurrentLocation}
                    className={`touch-target rounded-lg border text-sm font-semibold transition-colors ${
                      isCurrentLocation
                        ? 'cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400'
                        : isSelectedLocation
                        ? 'border-green-600 bg-green-600 text-white'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-green-500 hover:bg-green-50'
                    }`}
                  >
                    {location.id}
                  </button>
                );
              })}
            </div>

            <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 scrollbar-soft">
            <div className="relative mx-auto min-w-[620px] max-w-[868px] sm:min-w-0">
              <img
                src={mapImage}
                alt="保管場所図面"
                className="block w-full h-auto rounded-lg border border-gray-200"
              />
              
              {/* Location Overlays */}
              {locations.map((location) => {
                const isCurrentLocation = location.id === delivery.current_location;
                const isSelectedLocation = location.id === selectedLocation;
                
                return (
                  <button
                    type="button"
                    key={location.id}
                    onClick={() => handleLocationSelect(location.id)}
                    disabled={isCurrentLocation}
                    aria-label={`場所 ${location.id}`}
                    className={`absolute aspect-square w-[9.7%] border-2 transition-all duration-200 flex items-center justify-center ${
                      isCurrentLocation
                        ? 'bg-gray-300 bg-opacity-50 border-gray-500 cursor-not-allowed'
                        : isSelectedLocation
                        ? 'bg-green-600 bg-opacity-40 border-green-700 shadow-lg'
                        : 'border-transparent hover:border-green-600 hover:bg-green-100 hover:bg-opacity-30'
                    }`}
                    style={{
                      left: `${location.x}%`,
                      top: `${location.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    {isSelectedLocation && !isCurrentLocation && (
                      <Check className="w-6 h-6 text-green-900" />
                    )}
                  </button>
                );
              })}
            </div>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p>• 現在の場所は灰色で表示されています</p>
              <p>• 新しい場所をタップして選択してください</p>
              <p>• 選択した場所は緑色でハイライトされます</p>
            </div>
          </div>

          {/* Move Memo */}
          <div className="rounded-lg bg-white p-4 shadow sm:p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">移動メモ</h3>
            <textarea
              value={moveMemo}
              onChange={(e) => setMoveMemo(e.target.value)}
              placeholder="移動の理由や特記事項があれば入力してください（任意）"
              rows={3}
              className="input-field"
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
        <div className="mt-6 rounded-lg bg-blue-50 p-4 sm:mt-8">
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
