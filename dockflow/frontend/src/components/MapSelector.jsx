import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import mapImage from '../assets/map.png';
import { MapPin, ArrowLeft, Check } from 'lucide-react';

const MapSelector = () => {
  const navigate = useNavigate();
  const { selectedUser } = useUser();
  const [selectedLocation, setSelectedLocation] = useState('');

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
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="relative inline-block">
            <img
              src={mapImage}
              alt="保管場所図面"
              className="max-w-full h-auto"
              style={{ maxHeight: '400px' }}
            />
            
            {/* Location Overlays */}
            {locations.map((location) => (
              <button
                key={location.id}
                onClick={() => handleLocationSelect(location.id)}
                className={`absolute w-16 h-16 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                  selectedLocation === location.id
                    ? 'bg-navy-600 border-navy-700 shadow-lg scale-110'
                    : 'bg-white bg-opacity-80 border-navy-500 hover:bg-navy-100 hover:scale-105'
                }`}
                style={{
                  left: `${location.x - 32}px`,
                  top: `${location.y - 32}px`
                }}
              >
                <span className={`font-bold text-lg ${
                  selectedLocation === location.id ? 'text-white' : 'text-navy-600'
                }`}>
                  {location.id}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleBack}
            className="flex-1 bg-white hover:bg-gray-50 text-navy-600 border-2 border-navy-600 font-medium py-3 px-6 rounded-lg transition-colors"
          >
            戻る
          </button>
          
          <button
            onClick={handleConfirm}
            disabled={!selectedLocation}
            className={`flex-1 font-medium py-3 px-6 rounded-lg transition-colors ${
              selectedLocation
                ? 'bg-navy-600 hover:bg-navy-700 text-white'
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
            <li>• 図面上の A〜K のボタンをタップして場所を選択します</li>
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
