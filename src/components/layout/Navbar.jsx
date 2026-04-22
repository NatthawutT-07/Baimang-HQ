import { LogIn, LogOut, Building2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';
import SalesLogForm from '../../pages/MainPage/components/SalesLogForm';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  // Hide Navbar on admin dashboard pages
  const isDashboard = location.pathname.startsWith('/dashboard');
  if (isDashboard) return null;

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  return (
    <nav className="bg-emerald-600 shadow-lg relative z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <img src="/images/favicon.png" alt="Logo" className="h-6 w-6 sm:h-8 sm:w-8" />
            <span className="text-white text-base sm:text-lg font-bold">Baimiang Healthy Shop</span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <SalesLogForm />
          </div>
          {/* 
          <div className="flex items-center space-x-2 sm:space-x-4">
            {isAuthenticated ? (
              <>
                <div className="text-white hidden sm:block">
                  <span className="font-medium">{user?.nickname}</span>
                  {user?.role === 'admin' && (
                    <span className="ml-2 px-2 py-1 bg-white text-emerald-700 text-xs rounded-full font-semibold">
                      Admin
                    </span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 sm:space-x-2 bg-white text-emerald-600 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-emerald-50 transition-colors font-medium text-sm sm:text-base"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">ออกจากระบบ</span>
                  <span className="sm:hidden">ออก</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="flex items-center space-x-1.5 sm:space-x-2 bg-white text-emerald-600 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-emerald-50 transition-colors font-medium text-sm sm:text-base"
              >
                <LogIn className="h-4 w-4" />
                <span>เข้าสู่ระบบ</span>
              </button>
            )}
          </div> */}
        </div>
      </div>
    </nav>
  );
}
