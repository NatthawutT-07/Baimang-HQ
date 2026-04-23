import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Award } from 'lucide-react';
import { employeeService } from '../../../services/employeeService';

export default function Scoreboard() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = async () => {
    try {
      const res = await employeeService.getAll({ limit: 1000 });
      const normalEmployees = (res.data || [])
        .filter(emp => emp.role !== 'admin' && emp.status === 'active')
        .sort((a, b) => (b.point_earned || 0) - (a.point_earned || 0));

      setEmployees(normalEmployees);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      alert('ไม่สามารถโหลดข้อมูลกระดานคะแนนได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getTierInfo = (points) => {
    const p = points || 0;
    if (p >= 65) return { name: 'Diamond', color: '', rowColor: 'bg-blue-50', icon: '' };
    if (p >= 31) return { name: 'Gold', color: '', rowColor: 'bg-yellow-50', icon: '' };
    if (p >= 20) return { name: 'Silver', color: '', rowColor: 'bg-gray-50', icon: '' };
    return { name: 'Non', color: '', rowColor: 'bg-orange-50', icon: '' };
  };

  const getTierCounts = () => {
    const counts = { Diamond: 0, Gold: 0, Silver: 0, Non: 0 };
    employees.forEach(emp => {
      counts[getTierInfo(emp.point_earned).name]++;
    });
    return counts;
  };

  const tierCounts = getTierCounts();
  const totalPages = Math.ceil(employees.length / itemsPerPage);
  const currentData = employees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  return (
    <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-emerald-100 w-full max-w-4xl mx-auto overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b bg-gradient-to-r from-amber-50 to-emerald-50 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Award className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
          <h2 className="text-base sm:text-xl font-bold text-gray-800">ตารางคะแนนพนักงาน</h2>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-6 flex-1 text-left">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-2 sm:gap-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-1.5 sm:p-4 text-center shadow-sm">
                {/* <div className="text-lg sm:text-2xl mb-0.5 sm:mb-1">💎</div> */}
                <div className="font-bold text-blue-800 text-xs sm:text-base">Diamond</div>
                <div className="text-[10px] sm:text-sm text-blue-600">65+ คะแนน</div>
                <div className="text-base sm:text-xl font-black text-blue-700 mt-0.5 sm:mt-1">{tierCounts.Diamond}</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-1.5 sm:p-4 text-center shadow-sm">
                {/* <div className="text-lg sm:text-2xl mb-0.5 sm:mb-1">🥇</div> */}
                <div className="font-bold text-yellow-800 text-xs sm:text-base">Gold</div>
                <div className="text-[10px] sm:text-sm text-yellow-600">31-64 คะแนน</div>
                <div className="text-base sm:text-xl font-black text-yellow-700 mt-0.5 sm:mt-1">{tierCounts.Gold}</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-1.5 sm:p-4 text-center shadow-sm">
                {/* <div className="text-lg sm:text-2xl mb-0.5 sm:mb-1">🥈</div> */}
                <div className="font-bold text-gray-700 text-xs sm:text-base">Silver</div>
                <div className="text-[10px] sm:text-sm text-gray-500">20-30 คะแนน</div>
                <div className="text-base sm:text-xl font-black text-gray-600 mt-0.5 sm:mt-1">{tierCounts.Silver}</div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-1.5 sm:p-4 text-center shadow-sm">
                {/* <div className="text-lg sm:text-2xl mb-0.5 sm:mb-1">🟤</div> */}
                <div className="font-bold text-orange-800 text-xs sm:text-base">Non</div>
                <div className="text-[10px] sm:text-sm text-orange-600">0-19 คะแนน</div>
                <div className="text-base sm:text-xl font-black text-orange-700 mt-0.5 sm:mt-1">{tierCounts.Non}</div>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden space-y-2">
              {currentData.length > 0 ? (
                currentData.map((emp, index) => {
                  const rank = (currentPage - 1) * itemsPerPage + index + 1;
                  const tier = getTierInfo(emp.point_earned);
                  return (
                    <div key={emp.employee_code} className={`flex items-center justify-between border border-emerald-50 rounded-xl px-3 py-3 shadow-sm transition-colors ${tier.rowColor}`}>
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          rank === 1 ? 'bg-amber-100 text-amber-600 scale-110 shadow-sm shadow-amber-200' : 
                          rank === 2 ? 'bg-slate-100 text-slate-500 shadow-sm shadow-slate-200' : 
                          rank === 3 ? 'bg-orange-50 text-orange-600 shadow-sm shadow-orange-200' : 
                          'bg-emerald-50 text-emerald-700'
                        }`}>
                          {rank === 1 ? '👑' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">{emp.nickname}</div>
                          <div className="text-xs text-gray-500">{emp.employee_code}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <div className="text-right flex items-baseline space-x-1">
                          <span className="text-base font-bold text-gray-900">{emp.point_earned || 0}</span>
                          <span className="text-[10px] text-gray-500 font-medium">คะแนน</span>
                        </div>
                        <span className={`inline-block w-4 h-1 rounded-full ${tier.color}`}></span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-gray-500 py-8">ไม่พบข้อมูลพนักงาน</div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block border border-emerald-100 rounded-xl overflow-hidden shadow-sm">
              <table className="min-w-full divide-y divide-emerald-100">
                <thead className="bg-emerald-50/60">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider w-16 text-center">อันดับ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">พนักงาน</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-emerald-700 uppercase tracking-wider">คะแนน</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-emerald-700 uppercase tracking-wider">ระดับ (Tier)</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-emerald-50">
                  {currentData.length > 0 ? (
                    currentData.map((emp, index) => {
                      const rank = (currentPage - 1) * itemsPerPage + index + 1;
                      const tier = getTierInfo(emp.point_earned);
                      return (
                        <tr key={emp.employee_code} className={`transition-colors ${tier.rowColor}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold text-center">
                            {rank === 1 ? <span className="text-xl">👑</span> : 
                             rank === 2 ? <span className="text-xl">🥈</span> : 
                             rank === 3 ? <span className="text-xl">🥉</span> : 
                             rank}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {emp.employee_code} - {emp.nickname}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center font-bold">
                            {emp.point_earned || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${tier.color}`}>
                              <span className="mr-1">{tier.icon}</span>
                              {tier.name}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                        ไม่พบข้อมูลพนักงาน
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white px-3 py-2 sm:px-6 sm:py-3 rounded-xl border border-emerald-100">
                <button
                  onClick={handlePrev}
                  disabled={currentPage === 1}
                  className="inline-flex items-center rounded-lg border border-emerald-200 bg-white px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-emerald-50 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">ก่อนหน้า</span>
                </button>
                <p className="text-xs sm:text-sm text-gray-700">
                  หน้า <span className="font-medium">{currentPage}</span> / <span className="font-medium">{totalPages}</span>
                </p>
                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center rounded-lg border border-emerald-200 bg-white px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-emerald-50 disabled:opacity-50"
                >
                  <span className="hidden sm:inline">ถัดไป</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
