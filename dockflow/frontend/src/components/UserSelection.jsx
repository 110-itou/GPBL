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
    <div className="flex min-h-screen items-center justify-center bg-white p-3 sm:p-4">
      <div className="max-w-2xl w-full">
        <div className="mb-6 text-center sm:mb-8">
          <div className="w-full max-w-xl mx-auto mb-5 px-2">
            <img src={yanoLogo} alt="矢野造船株式会社" className="w-full h-auto object-contain" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-blue-900 sm:text-3xl" style={{ fontFamily: 'Arial, sans-serif' }}>DockFlow</h1>
          <p className="text-sm text-gray-700 sm:text-base" style={{ fontFamily: 'Arial, sans-serif' }}>造船部材リアルタイム管理システム</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-5 max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <button
              onClick={() => handleDirectNavigation('admin')}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-50 px-4 py-2 font-medium text-blue-700 transition-colors hover:bg-blue-100 sm:w-44"
            >
              <ShieldCheck className="w-5 h-5 flex-shrink-0" />
              <span className="text-base font-semibold whitespace-nowrap">管理者</span>
            </button>
            <button
              onClick={() => handleDirectNavigation('vendor')}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-green-50 px-4 py-2 font-medium text-green-700 transition-colors hover:bg-green-100 sm:w-44"
            >
              <PackageCheck className="w-5 h-5 flex-shrink-0" />
              <span className="text-base font-semibold whitespace-nowrap">納入業者</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSelection;
