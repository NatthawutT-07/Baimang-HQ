import React, { useState } from 'react';
import { Search, Gift, UserCircle2 } from 'lucide-react';
import { employeeService } from '../../../services/employeeService';

export default function PointChecker() {
  const [employeeCode, setEmployeeCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [lastCheckedCode, setLastCheckedCode] = useState('');

  const handleCheck = async (e) => {
    e.preventDefault();
    if (loading || !employeeCode.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const trimmedCode = employeeCode.trim();
      const res = await employeeService.getByCode(trimmedCode);
      if (res.data) {
        if (res.data.status === 'inactive') {
          setError('รหัสพนักงานนี้ถูกระงับการใช้งาน');
          return;
        }
        setLastCheckedCode(trimmedCode);
        // point_redeemed is the usable balance
        const availablePoints = res.data.point_redeemed || 0;
        const totalEarned = res.data.point_earned || 0;
        const pointsUsed = totalEarned - availablePoints;

        setResult({
          ...res.data,
          availablePoints: availablePoints,
          pointsUsed: pointsUsed >= 0 ? pointsUsed : 0
        });
      }
    } catch (err) {
      console.error(err);
      setError('ไม่พบข้อมูลพนักงานรหัสนี้ หรือเกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-emerald-100 w-full max-w-2xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="flex items-center space-x-2 px-4 sm:px-6 py-3 sm:py-4 border-b bg-gradient-to-r from-emerald-50 to-amber-50">
        <Gift className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
        <h2 className="text-base sm:text-xl font-bold text-gray-800">เช็คแต้มสะสม</h2>
      </div>

      <div className="p-4 sm:p-6 text-left">
        <form onSubmit={handleCheck} className="flex flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={employeeCode}
              onChange={(e) => setEmployeeCode(e.target.value)}
              placeholder="รหัสพนักงาน..."
              maxLength={5}
              className="block w-full pl-10 pr-3 py-3 border border-emerald-200 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 text-sm sm:text-lg transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={employeeCode.trim().length !== 5 || loading || (result && employeeCode.trim() === lastCheckedCode)}
            className="flex items-center justify-center space-x-2 bg-emerald-600 text-white px-4 sm:px-8 py-3 rounded-xl hover:bg-emerald-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-medium text-sm sm:text-lg shadow-sm whitespace-nowrap"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <span>ตรวจสอบ</span>
            )}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 sm:p-4 rounded-xl text-center border border-red-100 text-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="bg-emerald-50/60 rounded-xl border border-emerald-100 p-3 sm:p-6">
            <div className="flex flex-row items-center justify-between gap-1 sm:gap-3 border-b border-emerald-200 pb-3 sm:pb-4">
              <div className="flex items-center space-x-1.5 sm:space-x-3 min-w-0">
                <div className="bg-white p-1 sm:p-2 rounded-full shadow-sm flex-shrink-0">
                  <UserCircle2 className="h-5 w-5 sm:h-8 sm:w-8 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] sm:text-sm text-emerald-600 font-medium leading-tight whitespace-nowrap">รหัส: {result.employee_code}</div>
                  <div className="text-[13px] sm:text-lg font-bold text-gray-800 leading-tight whitespace-nowrap overflow-visible">{result.nickname}</div>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-1">
                <div className="text-[10px] sm:text-sm text-emerald-600 font-medium leading-tight whitespace-nowrap">คะแนนที่ใช้แลกได้จริง</div>
                <div className="text-xl sm:text-4xl font-black text-emerald-600 leading-none mt-0.5 whitespace-nowrap">
                  {result.availablePoints} <span className="text-[10px] sm:text-lg font-medium text-emerald-700">แต้ม</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
