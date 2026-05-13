import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { MapPin, ArrowLeft, Check } from 'lucide-react';
import mapImage from '../assets/map.png';

const MapSelector = () => {
  const navigate = useNavigate();
  const { selectedUser } = useUser();
  const [selectedLocation, setSelectedLocation] = useState('');
  const [mapError, setMapError] = useState(false);

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

  const handleLocationSelect = (locationId) => {
    setSelectedLocation(locationId);
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      navigate('/delivery-registration', { state: { selectedLocation } });
    }
  };

  const handleBack = () => {
    if (selectedUser?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/vendor');
    }
  };

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
            場所を選択してください
          </h2>
          <p className="text-gray-600">
            図面の該当場所をタップして選択してください
          </p>
        </div>

        {/* Selected Location Display */}
        {selectedLocation && (
          <div className="bg-navy-600 text-white rounded-lg p-4 mb-6 text-center">
            <div className="flex items-center justify-center space-x-2">
              <MapPin className="w-6 h-6" />
              <span className="text-xl font-bold">選択中：{selectedLocation}</span>
            </div>
          </div>
        )}

        {/* Map Container */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6">
          <div className="relative mx-auto w-full max-w-[868px]">
            {mapError ? (
              <div className="text-red-600 text-center p-8 border-2 border-red-300 rounded-lg">
                <p className="text-lg font-semibold mb-2">map.png が見つかりません。</p>
                <p className="text-sm">frontend/src/assets/map.png に配置してください</p>
              </div>
            ) : (
              <>
                <img
                  src={mapImage}
                  alt="保管場所図面"
                  className="block w-full h-auto rounded-lg border border-gray-200"
                  onError={() => setMapError(true)}
                />
                
                {/* Click Areas for A-K Locations */}
                {locations.map((location) => (
                  <button
                    type="button"
                    key={location.id}
                    onClick={() => handleLocationSelect(location.id)}
                    className={`absolute aspect-square w-[9.7%] rounded-none transition-all duration-200 ${
                      selectedLocation === location.id
                        ? 'bg-blue-500 bg-opacity-35 border-4 border-blue-700 shadow-lg'
                        : 'border-2 border-transparent hover:border-blue-500 hover:bg-blue-400 hover:bg-opacity-10'
                    }`}
                    style={{
                      left: `${location.x}%`,
                      top: `${location.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    aria-label={`場所 ${location.id}`}
                  >
                    {selectedLocation === location.id && (
                      <div className="flex items-center justify-center h-full">
                        <Check className="w-6 h-6 text-blue-800" />
                      </div>
                    )}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleBack}
            className="flex-1 bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 font-medium py-3 px-6 rounded-lg transition-colors"
          >
            戻る
          </button>
          
          <button
            onClick={handleConfirm}
            disabled={!selectedLocation}
            className={`flex-1 font-medium py-3 px-6 rounded-lg transition-colors ${
              selectedLocation
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {selectedLocation ? (
              <span className="flex items-center justify-center space-x-2">
                <Check className="w-5 h-5" />
                <span>この場所で登録する</span>
              </span>
            ) : (
              '場所を選択してください'
            )}
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">使い方</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 図面上の A〜K のエリアをタップして場所を選択します</li>
            <li>• 選択した場所は青色でハイライトされます</li>
            <li>• 「この場所で登録する」ボタンで登録画面に進みます</li>
            <li>• 間違えた場合は再度別の場所をタップして選択し直してください</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default MapSelector;
