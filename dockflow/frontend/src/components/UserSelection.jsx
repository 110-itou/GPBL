import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-32 h-32 mx-auto mb-4 flex items-center justify-center">
            <img src="/yano-logo.png" alt="YANO Shipbuilding" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-blue-900 mb-2" style={{ fontFamily: 'Arial, sans-serif' }}>DockFlow</h1>
          <p className="text-gray-700" style={{ fontFamily: 'Arial, sans-serif' }}>造船部材リアルタイム管理システム</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            ユーザーを選択してください
          </h2>

          <div className="space-y-3">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => handleUserSelect(user)}
                className="w-full p-4 text-left bg-white border-2 border-gray-200 rounded-lg hover:border-navy-500 hover:bg-navy-50 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 group-hover:text-navy-700">
                      {user.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {user.role === 'admin' ? '管理者' : '納入業者'}
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-navy-100 rounded-full flex items-center justify-center group-hover:bg-navy-200">
                    <svg className="w-4 h-4 text-navy-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {users.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="text-gray-500">ユーザーが見つかりません</p>
            </div>
          )}
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
