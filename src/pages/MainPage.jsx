import { useNavigate } from 'react-router-dom';
import { ArrowRight, LayoutDashboard } from 'lucide-react';
import { authService } from '../services/authService';
import SalesLogForm from './MainPage/components/SalesLogForm';
import Scoreboard from './MainPage/components/Scoreboard';
import PointChecker from './MainPage/components/PointChecker';
import RewardSection from './MainPage/components/RewardSection';

export default function MainPage() {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-emerald-50 via-white to-amber-50 px-3 py-4 sm:px-6 sm:py-8 lg:py-10">
      <div className="max-w-[1400px] w-full mx-auto">
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-10 items-start">
          {/* Left Column (Scoreboard) */}
          <div className="w-full lg:w-[60%] xl:w-[62%]">
            <Scoreboard />
          </div>

          {/* Right Column (Point Checker & Rewards) */}
          <div className="w-full lg:w-[40%] xl:w-[38%] flex flex-col gap-6 sm:gap-8">
            <PointChecker />
            <RewardSection />
          </div>
        </div>
      </div>
    </div>
  );
}

