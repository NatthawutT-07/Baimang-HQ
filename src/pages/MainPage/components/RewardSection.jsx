import React, { useState, useEffect } from 'react';
import { Gift, X, CheckCircle2, UserCircle2, Star } from 'lucide-react';
import { rewardService } from '../../../services/rewardService';
import { employeeService } from '../../../services/employeeService';
import { logService } from '../../../services/logService';

export default function RewardSection() {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedReward, setSelectedReward] = useState(null);
  const [employeeCode, setEmployeeCode] = useState('');
  const [employee, setEmployee] = useState(null);
  const [checkLoading, setCheckLoading] = useState(false);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const res = await rewardService.getAll();
      setRewards(res.data || []);
    } catch (err) {
      console.error('Failed to fetch rewards:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRedeem = (reward) => {
    setSelectedReward(reward);
    setEmployeeCode('');
    setEmployee(null);
    setError('');
    setSuccess(false);
  };

  const handleClose = () => {
    if (redeemLoading) return;
    setSelectedReward(null);
  };

  const handleCheckEmployee = async (e) => {
    e.preventDefault();
    if (!employeeCode.trim()) return;

    setCheckLoading(true);
    setError('');
    setEmployee(null);

    try {
      const res = await employeeService.getByCode(employeeCode.trim());
      if (res.data) {
        if (res.data.status === 'inactive') {
          setError('รหัสพนักงานนี้ถูกระงับการใช้งาน');
          return;
        }
        // point_redeemed is the usable balance
        const available = res.data.point_redeemed || 0;
        res.data.availablePoints = available;
        setEmployee(res.data);

        // Check if enough points
        if (res.data.availablePoints < selectedReward.point_reward) {
          setError('แต้มสะสมไม่เพียงพอสำหรับแลกของรางวัลนี้');
        }
      }
    } catch (err) {
      setError('ไม่พบข้อมูลพนักงานรหัสนี้');
    } finally {
      setCheckLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!employee || employee.availablePoints < selectedReward.point_reward) return;

    setRedeemLoading(true);
    setError('');

    try {
      const getThaiDateTimeLocal = () => {
        const d = new Date();
        const formatter = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Asia/Bangkok',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        const parts = formatter.formatToParts(d);
        const getPart = (type) => parts.find(p => p.type === type).value;
        // Format: YYYY-MM-DDTHH:mm:ss+07:00
        return `${getPart('year')}-${getPart('month')}-${getPart('day')}T${getPart('hour')}:${getPart('minute')}:00+07:00`;
      };

      const logData = {
        employee_code: employee.employee_code,
        date: getThaiDateTimeLocal(),
        action: "แลกรางวัล",
        point: -selectedReward.point_reward,
        reward: selectedReward.title,
      };

      await logService.create(logData);
      setSuccess(true);

      // Update local available points visually
      setEmployee(prev => ({
        ...prev,
        availablePoints: prev.availablePoints - selectedReward.point_reward
      }));

    } catch (err) {
      console.error(err);
      setError(err.message || 'เกิดข้อผิดพลาดในการแลกรางวัล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setRedeemLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (rewards.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-emerald-100 w-full max-w-4xl mx-auto overflow-hidden">
        {/* Header */}
        <div className="flex items-center space-x-2 px-4 sm:px-6 py-3 sm:py-5 border-b bg-gradient-to-r from-amber-50 to-emerald-50">
          <Gift className="h-5 w-5 sm:h-7 sm:w-7 text-emerald-600 flex-shrink-0" />
          <div>
            <h2 className="text-base sm:text-xl font-bold text-gray-800">ของรางวัลสำหรับพนักงาน</h2>
            <p className="text-xs sm:text-sm text-emerald-600 font-medium mt-0.5">สะสมแต้มเพื่อแลกของรางวัลเหล่านี้!</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {rewards.map((reward, index) => (
              <div key={reward.id} className="bg-white border border-emerald-100 rounded-2xl shadow-sm hover:shadow-md transition-all relative overflow-hidden group flex flex-col">

                {/* Image Area */}
                <div className="relative w-full aspect-[2/1] bg-white flex items-center justify-center px-4 pt-3 pb-0">
                  <img
                    src={`/images/coupon${(index % 3) + 1}.png`}
                    alt={reward.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Point Badge - Top Right */}
                  <div className="absolute top-0 right-0 bg-[#008d5e] text-white px-5 py-2 rounded-bl-[1.5rem] text-lg sm:text-xl font-bold shadow-sm z-10 flex items-center gap-1.5">
                    {reward.point_reward} <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  </div>
                </div>

                {/* Footer Content */}
                <div className="px-4 pt-0 pb-4 flex items-center justify-between gap-3 bg-white">
                  <h3 className="font-bold text-sm sm:text-base md:text-m text-gray-800 flex-1">
                    {reward.title}
                  </h3>
                  <button
                    onClick={() => handleOpenRedeem(reward)}
                    className="shrink-0 bg-[#eefdf5] hover:bg-[#008d5e] text-[#008d5e] hover:text-white border border-[#008d5e]/20 py-2.5 px-6 rounded-lg transition-all font-medium text-sm sm:text-base"
                  >
                    แลกรางวัลนี้
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Redeem Modal */}
      {selectedReward && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md overflow-hidden border border-emerald-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b bg-emerald-50/60 sticky top-0">
              <h3 className="text-base sm:text-lg font-bold text-gray-800 flex items-center">
                <Gift className="h-5 w-5 mr-2 text-emerald-600" />
                แลกของรางวัล
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 p-1"
                disabled={redeemLoading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              {success ? (
                <div className="text-center py-4 sm:py-6">
                  <div className="mx-auto flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-emerald-100 mb-4">
                    <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-600" />
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">แลกรางวัลสำเร็จ!</h4>
                  <p className="text-sm sm:text-base text-gray-600 mb-6">
                    ยินดีด้วย! คุณได้ทำการแลก <strong>{selectedReward.title}</strong> เรียบร้อยแล้ว
                  </p>
                  <button
                    onClick={() => {
                      handleClose();
                      window.location.href = 'https://line.me/ti/p/bmphHYrGzm';
                    }}
                    className="w-full bg-emerald-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-emerald-500 transition-colors"
                  >
                    แจ้งรับรางวัลผ่าน Line
                  </button>
                </div>
              ) : (
                <>
                  <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-3 sm:p-4 rounded-xl mb-4 sm:mb-6 shadow-inner">
                    <div className="text-xs sm:text-sm text-emerald-100 mb-1">ของรางวัลที่เลือก:</div>
                    <div className="text-lg sm:text-xl font-bold">{selectedReward.title}</div>
                    <div className="mt-2 text-emerald-100 font-medium flex items-center text-sm">
                      ใช้ <span className="bg-white/20 px-2 py-0.5 rounded text-white font-bold mx-1">{selectedReward.point_reward}</span> แต้ม
                    </div>
                  </div>

                  {!employee ? (
                    <form onSubmit={handleCheckEmployee}>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          กรอกรหัสพนักงานของคุณ
                        </label>
                        <input
                          type="text"
                          value={employeeCode}
                          onChange={(e) => setEmployeeCode(e.target.value)}
                          className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 text-base"
                          placeholder=""
                          autoFocus
                          required
                        />
                      </div>

                      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

                      <button
                        type="submit"
                        disabled={checkLoading || !employeeCode.trim()}
                        className="w-full bg-emerald-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-emerald-500 transition-colors disabled:opacity-50 flex justify-center items-center"
                      >
                        {checkLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'ตรวจสอบสิทธิ์'}
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-4 sm:space-y-6">
                      <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 sm:p-4 flex items-center space-x-3 sm:space-x-4">
                        <div className="bg-emerald-100 p-2 sm:p-3 rounded-full">
                          <UserCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600" />
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm text-gray-500">{employee.employee_code}</div>
                          <div className="font-bold text-sm sm:text-base text-gray-900">{employee.nickname}</div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center bg-emerald-50/60 rounded-xl p-3 sm:p-4 border border-emerald-100">
                        <span className="text-sm sm:text-base text-gray-700 font-medium">แต้มสะสมของคุณ:</span>
                        <span className={`text-xl sm:text-2xl font-black ${employee.availablePoints >= selectedReward.point_reward ? 'text-emerald-600' : 'text-red-500'}`}>
                          {employee.availablePoints}
                        </span>
                      </div>

                      {error ? (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100 text-center">
                          {error}
                        </div>
                      ) : (
                        <button
                          onClick={handleRedeem}
                          disabled={redeemLoading}
                          className="w-full bg-emerald-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-emerald-500 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none flex justify-center items-center shadow-md"
                        >
                          {redeemLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'ยืนยันการแลกรางวัล'}
                        </button>
                      )}

                      {/* <button
                        onClick={() => setEmployee(null)}
                        className="w-full text-gray-500 hover:text-gray-700 text-sm font-medium mt-2"
                      >
                        เปลี่ยนรหัสพนักงาน
                      </button> */}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
