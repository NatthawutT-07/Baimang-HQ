import React, { useState } from 'react';
import { X, Save, TrendingUp, CheckCircle2, XCircle, Star, PartyPopper } from 'lucide-react';
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
      const normalEmployees = (empRes.data || []).filter(emp => emp.role !== 'admin');
      setEmployees(normalEmployees);
      setBranches(branchRes.data || []);
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
            <div className="flex items-center justify-between px-6 py-4 border-b bg-emerald-50/60">
              <h2 className="text-xl font-bold text-gray-800">ฟอร์มบันทึกยอดขาย</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-emerald-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {/* ---- Result Screen ---- */}
              {submitResult ? (
                <div className="text-center py-4">
                  {submitResult.type === 'success' ? (
                    <>
                      {/* Animated icon */}
                      <div className="relative mx-auto w-20 h-20 mb-5">
                        <div className={`absolute inset-0 rounded-full ${submitResult.point > 0 ? 'bg-emerald-100' : 'bg-amber-100'} animate-ping opacity-30`} />
                        <div className={`relative w-20 h-20 rounded-full ${submitResult.point > 0 ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' : 'bg-gradient-to-br from-amber-400 to-amber-500'} flex items-center justify-center shadow-lg`}>
                          {submitResult.point > 0
                            ? <CheckCircle2 className="w-10 h-10 text-white" />
                            : <Star className="w-10 h-10 text-white" />}
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-1">บันทึกสำเร็จ!</h3>
                      <p className="text-sm text-gray-500 mb-5">{submitResult.empName} • {submitResult.branchName}</p>

                      {/* Point result card */}
                      <div className={`rounded-2xl p-4 mb-5 border ${submitResult.point > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                        <p className="text-xs text-gray-500 mb-1">ยอดขาย / เป้าหมาย</p>
                        <p className="text-lg font-bold text-gray-800 mb-2">
                          {submitResult.sales?.toLocaleString()} / {submitResult.target?.toLocaleString()} ฿
                        </p>
                        <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold ${submitResult.point > 0 ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'}`}>
                          {submitResult.point > 0 ? (
                            <><Star className="w-4 h-4" /> ได้รับ 1 คะแนน</>
                          ) : (
                            'ยอดขายไม่ถึงเป้า (0 คะแนน)'
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => { setSubmitResult(null); setIsOpen(false); }}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-xl font-semibold transition-colors shadow-md shadow-emerald-600/20"
                      >
                        ปิดหน้าต่าง
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                        <XCircle className="w-9 h-9 text-red-500" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">เกิดข้อผิดพลาด</h3>
                      <p className="text-sm text-gray-500 mb-5">{submitResult.message}</p>
                      <button
                        onClick={() => setSubmitResult(null)}
                        className="w-full bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-xl font-semibold transition-colors"
                      >
                        ลองอีกครั้ง
                      </button>
                    </>
                  )}
                </div>
              ) : loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      พนักงาน
                    </label>
                    <select
                      name="employee_code"
                      value={formData.employee_code}
                      onChange={handleChange}
                      className="w-full border-emerald-200 rounded-lg shadow-sm focus:border-emerald-400 focus:ring-emerald-200 bg-white px-4 py-2 border"
                      required
                    >
                      <option value="">-- เลือกพนักงาน --</option>
                      {employees.map(emp => (
                        <option key={emp.employee_code} value={emp.employee_code}>
                          {emp.employee_code} - {emp.nickname}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      สาขา
                    </label>
                    <select
                      name="branch_code"
                      value={formData.branch_code}
                      onChange={handleChange}
                      className="w-full border-emerald-200 rounded-lg shadow-sm focus:border-emerald-400 focus:ring-emerald-200 bg-white px-4 py-2 border"
                      required
                    >
                      <option value="">-- เลือกสาขา --</option>
                      {branches.map(b => (
                        <option key={b.branch_code} value={b.branch_code}>
                          {b.branch_code} - {b.branch_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        วันที่
                      </label>
                      <input
                        type="date"
                        name="date"
                        min={MIN_DATE}
                        max={getThaiNow().toISOString().slice(0, 10)}
                        value={formData.date}
                        onChange={handleChange}
                        className="w-full border-emerald-200 rounded-lg shadow-sm focus:border-emerald-400 focus:ring-emerald-200 px-4 py-2 border"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        เวลา
                      </label>
                      <input
                        type="text"
                        value={currentTime + " น."}
                        readOnly
                        className="w-full border-gray-200 rounded-lg shadow-sm bg-gray-50 text-gray-500 px-4 py-2 border cursor-not-allowed text-center font-medium"
                      />
                    </div>
                  </div>
                  {/* 
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      การกระทำ
                    </label>
                    <input
                      type="text"
                      value="ขาย"
                      readOnly
                      className="w-full border-gray-200 rounded-lg shadow-sm bg-gray-100 text-gray-500 px-4 py-2 border cursor-not-allowed"
                    />
                  </div> */}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ยอดขาย
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="sales"
                      value={formData.sales}
                      onChange={handleChange}
                      className="w-full border-emerald-200 rounded-lg shadow-sm focus:border-emerald-400 focus:ring-emerald-200 px-4 py-2 border"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full flex justify-center items-center space-x-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition"
                    >
                      {submitting ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Save className="h-5 w-5" />
                          <span>บันทึกข้อมูล</span>
                        </>
                      )}
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
