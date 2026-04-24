import { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, Search, Users, Shield, ShieldCheck, ChevronLeft, ChevronRight, X, Star, RotateCcw, Zap, AlertCircle, TrendingDown } from 'lucide-react';
import { employeeService } from '../../../services/employeeService';
import { logService } from '../../../services/logService';
import { toast } from 'react-toastify';

export default function EmployeeSection() {
  // --- States ---
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    employee_code: '',
    nickname: '',
    position: '',
    organizational_unit: '',
    role: 'user',
    password: '',
    status: 'active'
  });
  const [pagination, setPagination] = useState({ total: 0, limit: 10, offset: 0 });

  // Point Adjustment States
  const [pointSearchCode, setPointSearchCode] = useState('');
  const [targetEmployee, setTargetEmployee] = useState(null);
  const [pointAmount, setPointAmount] = useState('');
  const [pointNote, setPointNote] = useState('');
  const [adjustLoading, setAdjustLoading] = useState(false);

  // Point Deduction States (Admin Rules)
  const [deductSearchCode, setDeductSearchCode] = useState('');
  const [targetDeductEmployee, setTargetDeductEmployee] = useState(null);
  const [deductLoading, setDeductLoading] = useState(false);

  const [confirmModal, setConfirmModal] = useState({ show: false, type: '', message: '', data: null });

  // --- Effects ---
  useEffect(() => {
    fetchEmployees();
  }, []);

  // --- Data Fetching ---
  const fetchEmployees = async (offset = 0, searchOverride) => {
    setLoading(true);
    try {
      const currentSearch = searchOverride !== undefined ? searchOverride : searchTerm;
      const res = await employeeService.getAll({ limit: 10, offset, search: currentSearch });

      if (res.ok) {
        setEmployees(res.data || []);
        setPagination(res.meta || { total: 0, limit: 10, offset });
      }
    } catch (err) {
      toast.error('ไม่สามารถโหลดข้อมูลพนักงานได้');
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (editingEmployee) {
        res = await employeeService.update(editingEmployee.id, formData);
        if (res.ok) toast.success('แก้ไขข้อมูลพนักงานสำเร็จ');
      } else {
        res = await employeeService.create(formData);
        if (res.ok) toast.success('เพิ่มพนักงานสำเร็จ');
      }

      if (res.ok) {
        fetchEmployees(pagination.offset);
        handleCloseModal();
      }
    } catch (err) {
      toast.error(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('คุณต้องการลบข้อมูลพนักงานนี้ใช่หรือไม่? การดำเนินการนี้ไม่สามารถเรียกคืนได้')) return;

    try {
      const res = await employeeService.delete(id);
      if (res.ok) {
        toast.success('ลบข้อมูลพนักงานสำเร็จ');
        fetchEmployees(pagination.offset);
      }
    } catch (err) {
      toast.error('ไม่สามารถลบข้อมูลพนักงานได้');
    }
  };

  const handleEdit = (emp) => {
    setEditingEmployee(emp);
    setFormData({
      employee_code: emp.employee_code,
      nickname: emp.nickname,
      position: emp.position,
      organizational_unit: emp.organizational_unit,
      role: emp.role,
      password: '',
      status: emp.status || 'active'
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEmployee(null);
    setFormData({
      employee_code: '',
      nickname: '',
      position: '',
      organizational_unit: '',
      role: 'user',
      password: '',
      status: 'active'
    });
  };

  const handleSearch = (e) => { e.preventDefault(); fetchEmployees(0); };
  const handleClear = () => { setSearchTerm(''); fetchEmployees(0, ''); };

  // --- Point Adjustment Handlers ---
  const handleSearchForPoints = async (e) => {
    e.preventDefault();
    if (!pointSearchCode) return;
    setAdjustLoading(true);
    try {
      const res = await employeeService.getByCode(pointSearchCode);
      if (res.ok) {
        setTargetEmployee(res.data);
        setPointAmount('');
        setPointNote('');
      }
      else toast.error(res.message || 'ไม่พบพนักงานรหัสนี้');
    } catch (err) { toast.error('เกิดข้อผิดพลาดในการค้นหา'); }
    finally { setAdjustLoading(false); }
  };

  const handleUpdatePoints = async (type) => {
    if (!targetEmployee) return;
    let confirmMsg = '';
    if (type === 'reset') confirmMsg = `ยืนยันการล้างแต้มของคุณ ${targetEmployee.nickname} เป็น 0 ทั้งหมด`;
    else if (type === 'add') confirmMsg = `ยืนยันการเพิ่มแต้มจำนวน ${pointAmount} แต้ม ให้กับคุณ ${targetEmployee.nickname}${pointNote ? ` สาเหตุ: ${pointNote}` : ''}`;
    setConfirmModal({ show: true, type, message: confirmMsg });
  };

  const handleResetAllPoints = () => {
    setConfirmModal({
      show: true,
      type: 'reset-all',
      message: 'คุณแน่ใจหรือไม่ว่าต้องการ "ล้างแต้มพนักงานทุกคน" เป็น 0 การดำเนินการนี้ไม่สามารถเรียกคืนได้'
    });
  };

  // --- Point Deduction Handlers (Admin Rules) ---
  const handleSearchForDeduct = async (e) => {
    e.preventDefault();
    if (!deductSearchCode) return;
    setDeductLoading(true);
    try {
      const res = await employeeService.getByCode(deductSearchCode);
      if (res.ok) setTargetDeductEmployee(res.data);
      else toast.error(res.message || 'ไม่พบพนักงานรหัสนี้');
    } catch (err) { toast.error('เกิดข้อผิดพลาดในการค้นหา'); }
    finally { setDeductLoading(false); }
  };

  const handleDeductPoints = (points, reason) => {
    if (!targetDeductEmployee) return;
    setConfirmModal({
      show: true,
      type: 'deduct',
      message: `ยืนยันการหักคะแนนคุณ ${targetDeductEmployee.nickname} จำนวน ${Math.abs(points)} แต้ม สาเหตุ: ${reason}?`,
      data: { points, reason }
    });
  };

  const executeUpdatePoints = async () => {
    const { type, data } = confirmModal;
    setConfirmModal({ ...confirmModal, show: false });

    if (type === 'deduct') {
      setDeductLoading(true);
      try {
        const { points, reason } = data;
        const newBalance = targetDeductEmployee.point_redeemed + points; // points is negative (-5 or -20)

        // 1. Update Employee Points
        const resEmp = await employeeService.update(targetDeductEmployee.id, { point_redeemed: Math.max(0, newBalance) });

        if (resEmp.ok) {
          // 2. Create Log
          await logService.create({
            employee_code: targetDeductEmployee.employee_code,
            branch_code: null,
            branch_name: null,
            date: new Date().toISOString(),
            action: 'หักคะแนน',
            target: null,
            sales: null,
            point: points,
            reward: reason === 'ใบเตือน' ? 'ใบเตือน' : 'ยอดไม่ถึงเป้ารายเดือน'
          });

          toast.success('หักคะแนนและบันทึกกิจกรรมเรียบร้อยแล้ว');
          setTargetDeductEmployee(resEmp.data);
          fetchEmployees(pagination.offset);
        }
      } catch (err) {
        toast.error('ไม่สามารถหักคะแนนได้');
      } finally {
        setDeductLoading(false);
      }
      return;
    }

    setAdjustLoading(true);
    try {
      if (type === 'reset-all') {
        const res = await employeeService.resetAllPoints();
        if (res.ok) {
          toast.success('ล้างแต้มพนักงานทุกคนสำเร็จ');
          fetchEmployees(pagination.offset);
          setTargetEmployee(null);
        }
        return;
      }

      let updateData = {};
      if (type === 'reset') {
        updateData = { point_earned: 0, point_redeemed: 0 };
      } else if (type === 'add') {
        const val = parseInt(pointAmount);
        if (isNaN(val)) return toast.warning('กรุณาระบุตัวเลขที่ถูกต้อง');
        updateData = {
          point_earned: targetEmployee.point_earned + val,
          point_redeemed: targetEmployee.point_redeemed + val
        };
      }

      const res = await employeeService.update(targetEmployee.id, updateData);
      if (res.ok) {
        if (type === 'add') {
          await logService.create({
            employee_code: targetEmployee.employee_code,
            branch_code: null,
            branch_name: null,
            date: new Date().toISOString(),
            action: 'เพิ่มคะแนน',
            target: null,
            sales: null,
            point: parseInt(pointAmount),
            reward: pointNote || 'เพิ่มคะแนนโดยผู้บริหาร'
          });
        }
        toast.success('ปรับปรุงแต้มพนักงานสำเร็จ');
        setTargetEmployee(res.data);
        setPointAmount('');
        setPointNote('');
        fetchEmployees(pagination.offset);
      }
    } catch (err) {
      toast.error('ไม่สามารถปรับปรุงข้อมูลแต้มได้');
    } finally {
      setAdjustLoading(false);
    }
  };

  const toggleEmployeeStatus = async (emp) => {
    const newStatus = emp.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await employeeService.update(emp.id, { status: newStatus });
      if (res.ok) {
        toast.success(`เปลี่ยนสถานะพนักงานเป็น ${newStatus === 'active' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'} สำเร็จ`);
        setEmployees(prev => prev.map(e => e.id === emp.id ? { ...e, status: newStatus } : e));
      }
    } catch (err) { toast.error('ไม่สามารถเปลี่ยนสถานะได้'); }
  };

  // --- Memos ---
  const totalPages = useMemo(() => Math.ceil(pagination.total / pagination.limit), [pagination.total, pagination.limit]);
  const currentPage = useMemo(() => Math.floor(pagination.offset / pagination.limit) + 1, [pagination.offset, pagination.limit]);

  // --- Styles ---
  const inputCls = "w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white transition-all placeholder:text-slate-400";

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">จัดการพนักงาน</h2>
          <p className="text-xs text-slate-400 mt-1">ทั้งหมด {pagination.total} รายชื่อ</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>เพิ่มพนักงาน</span>
        </button>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="ค้นหาด้วยรหัส หรือชื่อเล่นพนักงาน..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 bg-white transition-all shadow-sm"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition-all active:scale-95 disabled:opacity-50"
        >
          ค้นหา
        </button>
      </form>

      {/* Employee Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-xs text-slate-400 font-medium">กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50/80 border-b border-slate-200">
                  <tr className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                    <th className="px-4 py-3 text-center">ID</th>
                    <th className="px-4 py-3">ข้อมูลพนักงาน</th>
                    <th className="px-4 py-3">ตำแหน่ง / หน่วยงาน</th>
                    <th className="px-4 py-3 text-center">แต้มสะสม</th>
                    <th className="px-4 py-3 text-center">แต้มคงเหลือ</th>
                    <th className="px-4 py-3 text-center">บทบาท</th>
                    <th className="px-4 py-3 text-center">สถานะ</th>
                    <th className="px-4 py-3 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-4 py-3 text-center text-slate-400 font-mono text-[11px]">{emp.id}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{emp.nickname}</span>
                          <span className="text-[10px] text-slate-400 font-mono">CODE: {emp.employee_code}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col max-w-[200px]">
                          <span className="text-slate-600 font-medium truncate">{emp.position}</span>
                          <span className="text-[11px] text-slate-400 truncate">{emp.organizational_unit}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-emerald-600">{emp.point_earned.toLocaleString()}</td>
                      <td className="px-4 py-3 text-center font-bold text-blue-600">{emp.point_redeemed.toLocaleString()}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${emp.role === 'admin' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-50 text-slate-600 border border-slate-200'
                          }`}>
                          {emp.role === 'admin' ? <ShieldCheck className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                          {emp.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => toggleEmployeeStatus(emp)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${emp.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${emp.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                          {emp.status === 'active' ? 'ใช้งาน' : 'ปิดใช้งาน'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => handleEdit(emp)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="แก้ไข"><Edit2 className="h-4 w-4" /></button>
                          <button onClick={() => handleDelete(emp.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="ลบ"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {employees.length === 0 && (
              <div className="text-center py-20 bg-slate-50/30">
                <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-sm text-slate-400 font-medium">ไม่พบข้อมูลพนักงานในขณะนี้</p>
              </div>
            )}

            {/* Pagination */}
            {pagination.total > 0 && (
              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500 font-medium">
                  แสดงหน้า <span className="text-slate-800">{currentPage}</span> จาก <span className="text-slate-800">{totalPages}</span> หน้า (รวม {pagination.total} รายการ)
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchEmployees(Math.max(0, pagination.offset - pagination.limit))}
                    disabled={pagination.offset === 0}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 transition-all shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4" /> ก่อนหน้า
                  </button>
                  <button
                    onClick={() => fetchEmployees(pagination.offset + pagination.limit)}
                    disabled={pagination.offset + pagination.limit >= pagination.total}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 transition-all shadow-sm"
                  >
                    ถัดไป <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Point Adjustment System */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">ระบบเพิ่มแต้มคะแนน</h3>
            </div>
          </div>
          <button
            onClick={handleResetAllPoints}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all shadow-sm"
          >
            <Zap className="w-4 h-4" /> ล้างแต้มพนักงานทุกคน
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Search Card */}
          <div className="space-y-4">
            <form onSubmit={handleSearchForPoints} className="flex gap-2">
              <input
                type="text"
                placeholder="ระบุรหัสพนักงาน..."
                value={pointSearchCode}
                onChange={(e) => setPointSearchCode(e.target.value)}
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
              />
              <button
                type="submit"
                disabled={adjustLoading}
                className="px-6 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {adjustLoading ? 'ค้นหา...' : 'ค้นหา'}
              </button>
            </form>

            {targetEmployee && (
              <div className="p-5 bg-emerald-50/30 rounded-2xl border border-emerald-100 animate-in fade-in slide-in-from-top-2">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-mono tracking-tighter">({targetEmployee.employee_code})</span>
                    <h4 className="font-bold text-slate-800">{targetEmployee.nickname}</h4>
                  </div>
                  <span className="text-[10px] bg-white px-2 py-1 rounded-md text-emerald-600 font-bold border border-emerald-100 shadow-sm">ข้อมูลพบ</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <span className="block text-[9px] text-slate-400 uppercase font-bold mb-1">สะสม</span>
                    <span className="text-sm font-bold text-slate-700">{targetEmployee.point_earned}</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-[9px] text-slate-400 uppercase font-bold mb-1">ใช้ไป</span>
                    <span className="text-sm font-bold text-slate-500">{targetEmployee.point_earned - targetEmployee.point_redeemed}</span>
                  </div>
                  <div className="text-center p-2 bg-white rounded-xl border border-emerald-100/50 shadow-sm">
                    <span className="block text-[9px] text-emerald-500 uppercase font-bold mb-1">คงเหลือ</span>
                    <span className="text-lg font-black text-emerald-600 leading-none">{targetEmployee.point_redeemed}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Card */}
          <div className={`space-y-4 transition-all duration-300 ${targetEmployee ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-5">
              <div>
                <span className="block text-[11px] text-slate-400 mb-2 font-medium">จำนวนแต้มที่ต้องการเพิ่ม</span>
                <input
                  type="number"
                  placeholder="0"
                  value={pointAmount}
                  onChange={(e) => setPointAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-center"
                />
              </div>
              <div>
                <span className="block text-[11px] text-slate-400 mb-2 font-medium">หมายเหตุการเพิ่มแต้ม</span>
                <input
                  type="text"
                  placeholder="ระบุสาเหตุการเพิ่มแต้ม..."
                  value={pointNote}
                  onChange={(e) => setPointNote(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleUpdatePoints('add')}
                  disabled={adjustLoading || !pointAmount}
                  className="flex-[7] flex items-center justify-center gap-2 py-3.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-sm shadow-blue-200 disabled:opacity-50"
                >
                  เพิ่มแต้ม
                </button>
                <button
                  onClick={() => handleUpdatePoints('reset')}
                  disabled={adjustLoading}
                  className="flex-[3] flex items-center justify-center gap-2 py-3.5 text-rose-600 bg-white border border-rose-100 rounded-xl text-sm font-bold hover:bg-rose-50 transition-all active:scale-95 disabled:opacity-50"
                >
                  ล้าง
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Point Deduction Section (Admin Rules) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full -mr-16 -mt-16 opacity-50" />

        <div className="flex items-center gap-4 mb-8 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-inner">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">ระบบหักแต้มพนักงาน</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10">
          {/* Search Column */}
          <div className="space-y-4">
            <form onSubmit={handleSearchForDeduct} className="flex gap-2">
              <input
                type="text"
                placeholder="ระบุรหัสพนักงาน..."
                value={deductSearchCode}
                onChange={(e) => setDeductSearchCode(e.target.value)}
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all"
              />
              <button
                type="submit"
                disabled={deductLoading}
                className="px-6 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {deductLoading ? '...' : 'ค้นหา'}
              </button>
            </form>

            {targetDeductEmployee && (
              <div className="p-5 bg-rose-50/30 rounded-2xl border border-rose-100 animate-in fade-in slide-in-from-top-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-mono tracking-tighter">({targetDeductEmployee.employee_code})</span>
                    <h4 className="font-bold text-slate-800 leading-none">{targetDeductEmployee.nickname}</h4>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] text-slate-400 font-bold uppercase mb-1">แต้มคงเหลือ</span>
                    <span className="text-xl font-black text-rose-600 leading-none">{targetDeductEmployee.point_redeemed}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Rules Column */}
          <div className={`space-y-4 transition-all duration-300 ${targetDeductEmployee ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">เลือกหัวข้อการหักคะแนน</label>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => handleDeductPoints(-20, 'ใบเตือน')}
                disabled={deductLoading}
                className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-rose-300 hover:bg-rose-50/50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="text-left">
                    <span className="block font-bold text-slate-800 text-sm">ใบเตือน</span>
                  </div>
                </div>
                <span className="text-lg font-black text-rose-600">-20</span>
              </button>

              <button
                onClick={() => handleDeductPoints(-5, 'ยอดไม่ถึง 80%')}
                disabled={deductLoading}
                className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-amber-300 hover:bg-amber-50/50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="text-left">
                    <span className="block font-bold text-slate-800 text-sm">ยอดไม่ถึง 80% ของเป้า</span>
                  </div>
                </div>
                <span className="text-lg font-black text-amber-600">-5</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modals & CRUD Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[70] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xs overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">

              <h3 className="text-lg font-bold text-slate-800 mb-2">ยืนยันการดำเนินการ</h3>
              <p className="text-sm text-slate-500 leading-relaxed px-2">{confirmModal.message}</p>
            </div>
            <div className="flex p-4 gap-3 bg-slate-50/50 border-t border-slate-100">
              <button
                onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                className="flex-1 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={executeUpdatePoints}
                className={`flex-2 px-8 py-3 rounded-xl text-sm font-bold text-white shadow-sm transition-all active:scale-95 ${confirmModal.type === 'deduct' || confirmModal.type.includes('reset') ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                  }`}
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4 overflow-y-auto" onClick={handleCloseModal}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md my-8 border border-slate-100 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{editingEmployee ? 'แก้ไขข้อมูลพนักงาน' : 'เพิ่มพนักงานใหม่'}</h3>
                <p className="text-xs text-slate-400 mt-0.5">ระบุรายละเอียดข้อมูลให้ครบถ้วน</p>
              </div>
              <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">รหัสพนักงาน</label>
                  <input
                    type="text"
                    value={formData.employee_code}
                    onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
                    required
                    disabled={!!editingEmployee}
                    placeholder="ระบุรหัสพนักงาน (เช่น EMP001)"
                    className={`${inputCls} disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-100`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">ชื่อเล่น / ชื่อเรียก</label>
                  <input
                    type="text"
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    required
                    placeholder="ระบุชื่อเล่นพนักงาน"
                    className={inputCls}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">ตำแหน่ง</label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      required
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">หน่วยงาน</label>
                    <input
                      type="text"
                      value={formData.organizational_unit}
                      onChange={(e) => setFormData({ ...formData, organizational_unit: e.target.value })}
                      required
                      className={inputCls}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">บทบาทผู้ใช้งาน (Role)</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'user' })}
                      className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all ${formData.role === 'user' ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                        }`}
                    >
                      User
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'admin' })}
                      className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all ${formData.role === 'admin' ? 'bg-amber-50 border-amber-200 text-amber-600 shadow-sm' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                        }`}
                    >
                      Admin
                    </button>
                  </div>
                </div>

                {formData.role === 'admin' && (
                  <div className="animate-in slide-in-from-top-2 duration-200">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      รหัสผ่านสำหรับการเข้าสู่ระบบ {editingEmployee && <span className="text-slate-400 font-normal lowercase">(เว้นว่างหากไม่ต้องการเปลี่ยน)</span>}
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={!editingEmployee}
                      className={inputCls}
                      placeholder="••••••••"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">สถานะบัญชี</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className={`${inputCls} bg-no-repeat bg-right pr-10`}
                  >
                    <option value="active">เปิดใช้งาน (Active)</option>
                    <option value="inactive">ระงับการใช้งาน (Inactive)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] px-4 py-3.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-2xl transition-all shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'กำลังบันทึก...' : (editingEmployee ? 'บันทึกการเปลี่ยนแปลง' : 'ยืนยันเพิ่มพนักงาน')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
