import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { PackageCheck, ShieldCheck } from 'lucide-react';
import yanoLogo from '../assets/yano-logo.png';

const FALLBACK_USERS = {
  admin: { id: 1, name: '田中 管理者', role: 'admin' },
  vendor: { id: 2, name: '山田 納入業者', role: 'vendor' }
};

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
    const user = users.find((apiUser) => apiUser.role === role) || FALLBACK_USERS[role];
    selectUser(user);
    setTimeout(() => {
      navigate(`/${role}`);
    }, 100);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="w-full max-w-xl mx-auto mb-5 px-2">
            <img src={yanoLogo} alt="矢野造船株式会社" className="w-full h-auto object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-blue-900 mb-2" style={{ fontFamily: 'Arial, sans-serif' }}>DockFlow</h1>
          <p className="text-gray-700" style={{ fontFamily: 'Arial, sans-serif' }}>造船部材リアルタイム管理システム</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            ユーザーを選択してください
          </h2>

          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <button
              onClick={() => handleDirectNavigation('admin')}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 w-full sm:w-44 min-h-11"
            >
              <ShieldCheck className="w-5 h-5 flex-shrink-0" />
              <span className="text-base font-semibold whitespace-nowrap">管理者</span>
            </button>
            <button
              onClick={() => handleDirectNavigation('vendor')}
              className="bg-green-50 hover:bg-green-100 text-green-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 w-full sm:w-44 min-h-11"
            >
              <PackageCheck className="w-5 h-5 flex-shrink-0" />
              <span className="text-base font-semibold whitespace-nowrap">納入業者</span>
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
