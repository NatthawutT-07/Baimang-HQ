import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Gift, Users, FileText, Menu, X, LayoutDashboard, ChevronRight, LogOut, Activity, Info } from 'lucide-react';
import { authService } from '../../services/authService';
import BranchSection from './sections/BranchSection';
import RewardSection from './sections/RewardSection';
import EmployeeSection from './sections/EmployeeSection';
import LogSection from './sections/LogSection';
import GuideSection from './sections/GuideSection';

const SECTIONS = {
  BRANCHES: 'branches',
  REWARDS: 'rewards',
  EMPLOYEES: 'employees',
  LOGS: 'logs',
  GUIDE: 'guide',
};

const sectionMeta = {
  [SECTIONS.BRANCHES]: { description: '' },
  [SECTIONS.REWARDS]: { description: '' },
  [SECTIONS.EMPLOYEES]: { description: '' },
  [SECTIONS.LOGS]: { description: '' },
  [SECTIONS.GUIDE]: { description: '' },
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(() => {
    const saved = localStorage.getItem('hq_dashboard_section');
    return Object.values(SECTIONS).includes(saved) ? saved : SECTIONS.BRANCHES;
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    localStorage.setItem('hq_dashboard_section', activeSection);
  }, [activeSection]);

  useEffect(() => { setUser(authService.getCurrentUser()); }, []);

  const handleLogout = () => { authService.logout(); navigate('/'); };

  const menuItems = [
    { id: SECTIONS.BRANCHES, label: 'Branches', sublabel: 'สาขา', icon: Building2, accent: 'from-blue-500 to-blue-600' },
    { id: SECTIONS.REWARDS, label: 'Rewards', sublabel: 'รางวัล', icon: Gift, accent: 'from-amber-500 to-orange-500' },
    { id: SECTIONS.EMPLOYEES, label: 'Employees', sublabel: 'พนักงาน', icon: Users, accent: 'from-violet-500 to-purple-600' },
    { id: SECTIONS.LOGS, label: 'Logs', sublabel: 'บันทึกระบบ', icon: FileText, accent: 'from-emerald-500 to-teal-600' },
    { id: SECTIONS.GUIDE, label: 'Guide', sublabel: 'คำแนะนำการใช้งาน', icon: Info, accent: 'from-blue-500 to-indigo-600' },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case SECTIONS.BRANCHES: return <BranchSection />;
      case SECTIONS.REWARDS: return <RewardSection />;
      case SECTIONS.EMPLOYEES: return <EmployeeSection />;
      case SECTIONS.LOGS: return <LogSection />;
      case SECTIONS.GUIDE: return <GuideSection />;
      default: return <BranchSection />;
    }
  };

  const activeItem = menuItems.find(item => item.id === activeSection);
  const meta = sectionMeta[activeSection];

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex font-[Inter,system-ui,sans-serif]">

      {/* Mobile Toggle */}
      {!isSidebarOpen && (
        <button onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-slate-800 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700 transition-all shadow-lg shadow-slate-900/20">
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Sidebar Overlay (mobile) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-[100dvh] w-[240px] bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-slate-100 flex flex-col
        transition-transform duration-300 ease-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand */}
        <div className="h-[64px] flex items-center justify-between px-5 border-b border-white/[0.06]">
          <div className="flex items-center justify-center gap-3">
            <div className="">
              <span className="text-[13px] font-bold text-white tracking-tight block leading-tight text-center">HQ Admin</span>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button key={item.id} id={`nav-${item.id}`}
                onClick={() => { setActiveSection(item.id); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-200 group relative
                  ${isActive
                    ? 'bg-white/[0.08] text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'}`}
              >
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-blue-400 rounded-r-full shadow-[0_0_8px_rgba(96,165,250,0.5)]" />}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200
                  ${isActive
                    ? `bg-gradient-to-br ${item.accent} shadow-md`
                    : 'bg-white/[0.05] group-hover:bg-white/[0.08]'}`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                </div>
                <div className="text-left">
                  <span className="block leading-tight">{item.label}</span>
                  {isActive && <span className="text-[10px] text-slate-500 leading-none">{item.sublabel}</span>}
                </div>
              </button>
            );
          })}
        </nav>

        {/* User / Logout */}
        <div className="border-t border-white/[0.06] p-3">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group">
            <div className="w-9 h-9 rounded-xl bg-slate-800 group-hover:bg-red-500/15 flex items-center justify-center text-white text-[12px] font-bold shrink-0 transition-all border border-white/[0.06] group-hover:border-red-500/20">
              {user?.nickname ? user.nickname.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="flex-1 text-left overflow-hidden min-w-0">
              <p className="text-[12px] font-semibold text-slate-300 group-hover:text-red-400 truncate transition-colors !m-0">{user?.nickname || 'Admin'}</p>
              <p className="text-[10px] text-slate-600 group-hover:text-red-400/60 transition-colors !m-0">ออกจากระบบ</p>
            </div>
            <LogOut className="w-4 h-4 shrink-0 opacity-0 group-hover:opacity-100 text-red-400 transition-all" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-[56px] bg-white border-b border-slate-200/60 flex items-center justify-between px-5 sm:px-8 sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2 text-[13px] text-slate-400 ml-10 lg:ml-0">
            <span className="hidden sm:inline hover:text-slate-600 cursor-pointer transition-colors">Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5 hidden sm:inline text-slate-300" />
            <span className="font-semibold text-slate-800">{activeItem?.label}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
              <Activity className="w-3 h-3 text-emerald-500" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.25)] animate-pulse" />
              <span className="text-slate-600 font-medium">ระบบออนไลน์</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-5">
            {/* Page Title */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5 !m-0">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${activeItem?.accent} flex items-center justify-center shadow-sm sm:hidden`}>
                    {activeItem && <activeItem.icon className="w-4 h-4 text-white" />}
                  </div>
                  {activeItem?.label}
                  <span className="text-[13px] font-normal text-slate-400 hidden sm:inline">/ {activeItem?.sublabel}</span>
                </h1>
                <p className="text-[13px] text-slate-500 mt-1">{meta?.description}</p>
              </div>
            </div>

            {/* Section Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 p-4 sm:p-6 lg:p-7 min-h-[500px]">
              {renderSection()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
