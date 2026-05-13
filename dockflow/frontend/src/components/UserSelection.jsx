import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { dummyDeliveries, dummyCalendarEvents, dummyNotifications } from '../data/dummyData';
import yanoLogo from '../assets/yano-logo.png';

const UserSelection = () => {
  const navigate = useNavigate();
  const { users, selectUser } = useUser();

  const handleUserSelect = (user) => {
    selectUser(user);
    setTimeout(() => {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/vendor');
      }
    }, 100);
  };

  const handleDirectNavigation = (role) => {
    const user = role === 'admin' 
      ? { id: 1, name: '田中 管理者', role: 'admin' }
      : { id: 2, name: '山田 納入業者', role: 'vendor' };
    selectUser(user);
    setTimeout(() => {
      navigate(`/${role}`);
    }, 100);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-32 h-32 mx-auto mb-4 flex items-center justify-center">
            <img src={yanoLogo} alt="YANO Shipbuilding" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-blue-900 mb-2" style={{ fontFamily: 'Arial, sans-serif' }}>DockFlow</h1>
          <p className="text-gray-700" style={{ fontFamily: 'Arial, sans-serif' }}>造船部材リアルタイム管理システム</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            ユーザーを選択してください
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <button
              onClick={() => handleDirectNavigation('admin')}
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium py-4 px-8 rounded-lg transition-colors flex items-center justify-center gap-3 w-full sm:w-48"
            >
              <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-lg font-semibold whitespace-nowrap">管理者</span>
            </button>
            <button
              onClick={() => handleDirectNavigation('vendor')}
              className="bg-green-100 hover:bg-green-200 text-green-800 font-medium py-4 px-8 rounded-lg transition-colors flex items-center justify-center gap-3 w-full sm:w-48"
            >
              <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="text-lg font-semibold whitespace-nowrap">納入業者</span>
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            © 2024 DockFlow. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserSelection;
