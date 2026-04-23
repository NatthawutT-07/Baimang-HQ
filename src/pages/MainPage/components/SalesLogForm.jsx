import React, { useState } from 'react';
import { X, Save, TrendingUp, CheckCircle2, XCircle, Star, PartyPopper, User, Store, Calendar, Clock, Banknote, ChevronDown } from 'lucide-react';
import { employeeService } from '../../../services/employeeService';
import { branchService } from '../../../services/branchService';
import { logService } from '../../../services/logService';

export default function SalesLogForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null); // { type: 'success'|'error', point, message }

  const getThaiNow = () => {
    const d = new Date();
    return new Date(d.getTime() + (7 * 60 * 60 * 1000));
  };

  const MIN_DATE = "2026-05-01";
  const getThaiDate = () => {
    const now = getThaiNow().toISOString().slice(0, 10);
    return now < MIN_DATE ? MIN_DATE : now;
  };
  const getThaiTime = () => getThaiNow().toISOString().slice(11, 16);

  // Form State
  const [formData, setFormData] = useState({
    employee_code: '',
    branch_code: '',
    date: getThaiDate(),
    sales: ''
  });
  const [currentTime, setCurrentTime] = useState(getThaiTime());

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, branchRes] = await Promise.all([
        employeeService.getAll(),
        branchService.getAll()
      ]);
      const normalEmployees = (empRes.data || []).filter(emp => emp.role !== 'admin' && emp.status === 'active');
      setEmployees(normalEmployees);
      const activeBranches = (branchRes.data || []).filter(b => b.status === 'active');
      setBranches(activeBranches);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      alert('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    if (loading) return;
    setIsOpen(true);
    setCurrentTime(getThaiTime());
    setFormData(prev => ({ ...prev, date: getThaiDate() }));
    fetchData();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'sales') {
      // Limit to 6 digits and 2 decimal places
      const regex = /^\d{0,6}(\.\d{0,2})?$/;
      if (value !== '' && !regex.test(value)) return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!formData.employee_code || !formData.branch_code || !formData.sales || !formData.date) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    setSubmitting(true);
    try {
      const selectedBranch = branches.find(b => b.branch_code === formData.branch_code);
      if (!selectedBranch) throw new Error('ไม่พบข้อมูลสาขาที่เลือก');

      const salesNum = parseFloat(formData.sales);
      const avgTarget = selectedBranch.avg_target || 0;
      const point = salesNum > avgTarget ? 1 : 0;

      const payload = {
        employee_code: formData.employee_code,
        branch_code: formData.branch_code,
        branch_name: selectedBranch.branch_name,
        date: formData.date + 'T' + currentTime,
        action: 'ขาย',
        sales: salesNum,
        target: avgTarget,
        point: point,
        reward: null
      };

      await logService.create(payload);

      const empName = employees.find(e => e.employee_code === formData.employee_code)?.nickname || formData.employee_code;
      setSubmitResult({
        type: 'success',
        point,
        empName,
        sales: salesNum,
        target: avgTarget,
        branchName: selectedBranch.branch_name,
      });
      setFormData(prev => ({ ...prev, sales: '' }));
    } catch (error) {
      console.error('Failed to submit:', error);
      let errorMsg = 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';

      const responseData = error.response?.data;
      if (responseData) {
        if (typeof responseData === 'object' && responseData.message) {
          errorMsg = responseData.message;
        } else if (typeof responseData === 'string') {
          try {
            const parsed = JSON.parse(responseData);
            errorMsg = parsed.message || responseData;
          } catch (e) {
            errorMsg = responseData;
          }
        }
      } else if (error.message) {
        errorMsg = error.message;
      }

      setSubmitResult({ type: 'error', message: errorMsg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={openModal}
        disabled={loading}
        className="flex items-center justify-center space-x-1.5 sm:space-x-2 bg-white text-emerald-600 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-emerald-50 transition-colors shadow-sm w-auto disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base"
      >
        <TrendingUp className="h-5 w-5" />
        <span className="text-base font-medium">{loading ? 'กำลังโหลด...' : 'บันทึกยอดขาย'}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-emerald-100">
            <div className="flex items-center justify-between px-5 py-3 border-b bg-emerald-50/60">
              <h2 className="text-lg font-bold text-gray-800">ฟอร์มบันทึกยอดขาย</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-emerald-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5">
              {/* ---- Result Screen ---- */}
              {submitResult ? (
                <div className="text-center py-2">
                  {submitResult.type === 'success' ? (
                    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">


                      <h3 className="text-xl font-black text-gray-900 mb-0.5 tracking-tight">
                        บันทึกสำเร็จ!
                      </h3>

                      <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-3 py-1.5 sm:py-1 bg-emerald-50 border border-emerald-100 rounded-xl sm:rounded-full text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-4 shadow-sm">
                        <span>{submitResult.empName}</span>
                        <span className="hidden sm:inline-block w-1 h-1 bg-emerald-300 rounded-full"></span>
                        <span>{submitResult.branchName}</span>
                      </div>

                      {/* Premium Result Card */}
                      <div className="w-full bg-white border border-gray-100 rounded-[1.5rem] p-4 sm:p-5 shadow-xl shadow-emerald-900/5 mb-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-50 rounded-full -mr-10 -mt-10 opacity-50"></div>

                        <div className="relative z-10">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2.5">ยอดขายที่บันทึก</p>

                          <div className="flex items-baseline justify-center gap-1.5 mb-4">
                            <span className="text-3xl font-black text-gray-900 leading-none tracking-tighter">
                              {submitResult.sales?.toLocaleString()}
                            </span>
                            <span className="text-lg font-bold text-emerald-600">฿</span>
                          </div>

                          <div className={`flex items-center justify-center gap-2.5 py-3 px-5 rounded-xl border-2 transition-all ${submitResult.point > 0
                            ? 'bg-emerald-600 border-emerald-500 shadow-lg shadow-emerald-200'
                            : 'bg-slate-50 border-slate-100'
                            }`}>
                            {submitResult.point > 0 ? (
                              <>
                                <div className="bg-white/20 p-1 rounded-lg">
                                  <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                                </div>
                                <div className="text-left">
                                  <p className="text-white text-sm font-black leading-none">ได้รับ 1 คะแนน</p>
                                  <p className="text-emerald-100 text-[9px] font-bold mt-0.5 uppercase tracking-wider">สะสมแต้มสำเร็จ</p>
                                </div>
                              </>
                            ) : (
                              <div className="text-center py-0.5">
                                <p className="text-slate-600 text-[13px] font-black uppercase tracking-wide">วันนี้ยังไม่ได้รับคะแนนน้า</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => { setSubmitResult(null); setIsOpen(false); }}
                        className="w-full bg-gray-900 hover:bg-black text-white py-3.5 rounded-xl font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-gray-200 text-sm"
                      >
                        ปิดหน้าต่าง
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="bg-rose-50 p-5 rounded-3xl mb-5 relative">
                        <XCircle className="w-12 h-12 text-rose-500" />
                        <div className="absolute -inset-1 bg-rose-500 rounded-3xl animate-ping opacity-10"></div>
                      </div>

                      <h3 className="text-xl font-black text-gray-900 mb-2">เกิดข้อผิดพลาด</h3>
                      <p className="text-gray-500 mb-6 max-w-[260px] mx-auto text-xs leading-relaxed font-medium">
                        {submitResult.message || 'ขออภัย ระบบขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้ง'}
                      </p>

                      <button
                        onClick={() => { setSubmitResult(null); setIsOpen(false); }}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-500 py-3.5 rounded-xl font-bold transition-all text-sm"
                      >
                        ปิด
                      </button>
                    </div>
                  )}
                </div>
              ) : loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="space-y-2.5">
                    {/* Employee Field */}
                    <div className="group">
                      <label className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1 group-focus-within:text-emerald-600 transition-colors">
                        <User className="w-3 h-3" />
                        พนักงาน
                      </label>
                      <div className="relative">
                        <select
                          name="employee_code"
                          value={formData.employee_code}
                          onChange={handleChange}
                          className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-3 py-2.5 focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all appearance-none cursor-pointer text-gray-700 text-sm font-medium"
                          required
                        >
                          <option value="">-- เลือกพนักงาน --</option>
                          {employees.map(emp => (
                            <option key={emp.employee_code} value={emp.employee_code}>
                              ({emp.employee_code}) {emp.nickname}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                          <ChevronDown className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>

                    {/* Branch Field */}
                    <div className="group">
                      <label className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1 group-focus-within:text-emerald-600 transition-colors">
                        <Store className="w-3 h-3" />
                        สาขา
                      </label>
                      <div className="relative">
                        <select
                          name="branch_code"
                          value={formData.branch_code}
                          onChange={handleChange}
                          className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-3 py-2.5 focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all appearance-none cursor-pointer text-gray-700 text-sm font-medium"
                          required
                        >
                          <option value="">-- เลือกสาขา --</option>
                          {branches.map(b => (
                            <option key={b.branch_code} value={b.branch_code}>
                              {b.branch_name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                          <ChevronDown className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>

                    {/* Date & Time Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="group">
                        <label className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1 group-focus-within:text-emerald-600 transition-colors">
                          <Calendar className="w-3 h-3" />
                          วันที่
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleChange}
                          className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-3 py-2.5 focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all text-gray-700 text-sm font-medium"
                          required
                        />
                      </div>
                      <div className="group">
                        <label className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">
                          <Clock className="w-3 h-3" />
                          เวลา
                        </label>
                        <div className="w-full bg-gray-100 border border-gray-100 rounded-xl px-3 py-2.5 text-gray-500 font-bold text-center text-sm">
                          {currentTime}
                        </div>
                      </div>
                    </div>

                    {/* Sales Field */}
                    <div className="group pt-1">
                      <label className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1 group-focus-within:text-emerald-600 transition-colors">
                        <Banknote className="w-3 h-3" />
                        ยอดขาย
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          max="999999.99"
                          name="sales"
                          value={formData.sales}
                          onChange={handleChange}
                          className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 pr-10 focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all text-xl font-black text-gray-800 placeholder:text-gray-300"
                          placeholder="0.00"
                          required
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                          บาท
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="group relative w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-200 active:scale-[0.98] overflow-hidden text-sm"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex justify-center items-center gap-2">
                        {submitting ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>บันทึกยอดขาย</span>
                          </>
                        )}
                      </div>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
