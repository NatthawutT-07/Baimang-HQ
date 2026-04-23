import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Users, Shield, ShieldCheck, ChevronLeft, ChevronRight, X, Star, RotateCcw, Save, AlertCircle, Zap } from 'lucide-react';
import { employeeService } from '../../../services/employeeService';
import { toast } from 'react-toastify';

export default function EmployeeSection() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ employee_code: '', nickname: '', position: '', organizational_unit: '', role: 'user', password: '' });
  const [pagination, setPagination] = useState({ total: 0, limit: 10, offset: 0 });
  const [pointSearchCode, setPointSearchCode] = useState('');
  const [targetEmployee, setTargetEmployee] = useState(null);
  const [pointAmount, setPointAmount] = useState('');
  const [adjustLoading, setAdjustLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ show: false, type: '', message: '' });

  useEffect(() => { fetchEmployees(); }, []);

  const fetchEmployees = async (offset = 0, searchOverride) => {
    setLoading(true);
    try {
      const currentSearch = searchOverride !== undefined ? searchOverride : searchTerm;
      const r = await employeeService.getAll({ limit: 10, offset, search: currentSearch });
      if (r.ok) {
        setEmployees(r.data);
        setPagination(r.pagination);
      }
    } catch { toast.error('ไม่สามารถโหลดข้อมูลพนักงานได้'); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if (editingEmployee) { const r = await employeeService.update(editingEmployee.id, formData); if (r.ok) toast.success('แก้ไขข้อมูลพนักงานสำเร็จ'); }
      else { const r = await employeeService.create(formData); if (r.ok) toast.success('เพิ่มพนักงานสำเร็จ'); }
      fetchEmployees(); handleCloseModal();
    } catch (err) { toast.error(err.response?.data?.message || 'เกิดข้อผิดพลาด'); } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('ต้องการลบพนักงานนี้หรือไม่?')) return;
    try { const r = await employeeService.delete(id); if (r.ok) { toast.success('ลบพนักงานสำเร็จ'); fetchEmployees(); } }
    catch { toast.error('ไม่สามารถลบพนักงานได้'); }
  };

  const handleEdit = (emp) => {
    setEditingEmployee(emp);
    setFormData({ employee_code: emp.employee_code, nickname: emp.nickname, position: emp.position, organizational_unit: emp.organizational_unit, role: emp.role, password: '' });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false); setEditingEmployee(null);
    setFormData({ employee_code: '', nickname: '', position: '', organizational_unit: '', role: 'user', password: '' });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEmployees(0);
  };

  const handleClear = () => {
    setSearchTerm('');
    fetchEmployees(0, '');
  };

  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  const handleSearchForPoints = async (e) => {
    e.preventDefault();
    if (!pointSearchCode) return;
    setAdjustLoading(true);
    try {
      const r = await employeeService.getByCode(pointSearchCode);
      if (r.ok) setTargetEmployee(r.data);
      else toast.error('ไม่พบพนักงานรหัสนี้');
    } catch { toast.error('ไม่พบพนักงานรหัสนี้'); }
    finally { setAdjustLoading(false); }
  };

  const handleUpdatePoints = async (type) => {
    if (!targetEmployee) return;

    let confirmMsg = '';
    if (type === 'reset') confirmMsg = `ยืนยันการล้างแต้มของคุณ ${targetEmployee.nickname} เป็น 0 ทั้งหมด`;
    else if (type === 'add') confirmMsg = `ยืนยันการเพิ่มแต้มจำนวน ${pointAmount} แต้ม ให้กับคุณ ${targetEmployee.nickname}`;
    else if (type === 'set') confirmMsg = `ยืนยันการแก้ไขแต้มสะสมของคุณ ${targetEmployee.nickname} เป็น ${pointAmount} แต้ม`;

    setConfirmModal({ show: true, type, message: confirmMsg });
  };

  const handleResetAllPoints = () => {
    setConfirmModal({
      show: true,
      type: 'reset-all',
      message: 'คุณแน่ใจหรือไม่ว่าต้องการ "ล้างแต้มพนักงานทุกคน" เป็น 0 การดำเนินการนี้ไม่สามารถเรียกคืนได้'
    });
  };

  const executeUpdatePoints = async () => {
    const { type } = confirmModal;
    setConfirmModal({ ...confirmModal, show: false });
    setAdjustLoading(true);
    try {
      if (type === 'reset-all') {
        const r = await employeeService.resetAllPoints();
        if (r.ok) {
          toast.success('ล้างแต้มพนักงานทุกคนสำเร็จ');
          fetchEmployees(pagination.offset);
          setTargetEmployee(null);
        }
        return;
      }

      let data = {};
      if (type === 'reset') {
        data = { point_earned: 0, point_redeemed: 0 };
      } else if (type === 'add') {
        const val = parseInt(pointAmount);
        if (isNaN(val)) return toast.warning('กรุณาระบุตัวเลข');
        data = {
          point_earned: targetEmployee.point_earned + val,
          point_redeemed: targetEmployee.point_redeemed + val
        };
      }

      const r = await employeeService.update(targetEmployee.id, data);
      if (r.ok) {
        toast.success('ปรับปรุงแต้มพนักงานสำเร็จ');
        setTargetEmployee(r.data);
        setPointAmount('');
        fetchEmployees(pagination.offset);
      }
    } catch { toast.error('ไม่สามารถปรับปรุงแต้มได้'); }
    finally { setAdjustLoading(false); }
  };

  const inputCls = "w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white transition-all placeholder:text-slate-400";

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-800 !m-0">จัดการพนักงาน</h2>
          <p className="text-xs text-slate-400 mt-0.5">{pagination.total} พนักงานทั้งหมด</p>
        </div>
        <div className="flex gap-2">
          <button id="btn-add-employee" onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/25">
            <Plus className="h-4 w-4" /><span>เพิ่มพนักงาน</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input id="search-employee" type="text" placeholder="ค้นหาด้วยรหัสหรือชื่อพนักงาน..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white transition-all" />
          {searchTerm && (
            <button type="button" onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button type="submit" disabled={loading}
          className="px-6 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors disabled:opacity-50">
          ค้นหา
        </button>
      </form>

      {loading && (<div className="flex justify-center py-16"><div className="w-8 h-8 border-[3px] border-slate-200 border-t-blue-500 rounded-full animate-spin" /></div>)}

      {!loading && (
        <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/80 border-b border-slate-200/80">
              <tr className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                <th className="px-4 py-3.5 w-12 text-center">ID</th>
                <th className="px-4 py-3.5">พนักงาน</th>
                <th className="px-4 py-3.5">ตำแหน่ง</th>
                <th className="px-4 py-3.5">หน่วยงาน</th>
                <th className="px-4 py-3.5 text-center">แต้มสะสม</th>
                <th className="px-4 py-3.5 text-center">แต้มคงเหลือ</th>
                <th className="px-4 py-3.5 text-center">Role</th>
                <th className="px-4 py-3.5 text-center w-24">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-4 py-3.5 text-center text-slate-400 font-mono text-xs">{emp.id}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium text-slate-800 !m-0">{emp.nickname}</p>
                        <p className="text-[11px] text-slate-400 font-mono !m-0">{emp.employee_code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">{emp.position}</td>
                  <td className="px-4 py-3.5 text-slate-600">{emp.organizational_unit}</td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold  text-emerald-700">{emp.point_earned}</span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-red-600">{emp.point_redeemed}</span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${emp.role === 'admin' ? 'bg-amber-50 text-amber-700 border border-amber-200/50' : 'bg-blue-50 text-blue-700 border border-blue-200/50'}`}>
                      {emp.role === 'admin' ? <ShieldCheck className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}{emp.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => handleEdit(emp)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(emp.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {employees.length === 0 && !loading && (
            <div className="text-center py-16"><Users className="w-10 h-10 text-slate-200 mx-auto mb-3" /><p className="text-sm text-slate-400">ไม่พบข้อมูลพนักงาน</p></div>
          )}
        </div>
      )}

      {pagination.total > 0 && (
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button onClick={() => fetchEmployees(Math.max(0, pagination.offset - pagination.limit))} disabled={pagination.offset === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              <ChevronLeft className="w-3.5 h-3.5" />ก่อนหน้า
            </button>
            <button onClick={() => fetchEmployees(pagination.offset + pagination.limit)} disabled={pagination.offset + pagination.limit >= pagination.total}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              ถัดไป<ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Point Adjustment Section */}
      <div className="mt-12 pt-10 border-t border-slate-200/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Star className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-800 !m-0">ระบบปรับปรุงคะแนนพนักงาน</h3>
            </div>
            <p className="text-xs text-slate-400">ค้นหาพนักงานเพื่อเพิ่ม ลด หรือล้างคะแนนสะสม</p>
          </div>
          <button onClick={handleResetAllPoints}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-xs font-semibold hover:bg-rose-100 transition-all shadow-sm">
            <Zap className="w-3.5 h-3.5" /> ล้างแต้มพนักงานทุกคน
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-50/50 rounded-2xl border border-slate-200/50 p-5">
            <label className="block text-xs font-semibold text-slate-600 mb-3">ระบุรหัสพนักงาน</label>
            <form onSubmit={handleSearchForPoints} className="flex gap-2">
              <input type="text" placeholder="กรอกรหัสพนักงาน..." value={pointSearchCode} onChange={(e) => setPointSearchCode(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
              <button type="submit" disabled={adjustLoading}
                className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors disabled:opacity-50">
                {adjustLoading ? 'ค้นหา...' : 'ค้นหา'}
              </button>
            </form>

            {targetEmployee && (
              <div className="mt-6 p-4 bg-white rounded-xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-top-1">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-shrink-0">
                    <h4 className="font-bold text-slate-800 text-sm mb-0.5">{targetEmployee.nickname}</h4>
                    <p className="text-[11px] text-slate-400 font-mono">{targetEmployee.employee_code}</p>
                  </div>

                  <div className="flex flex-1 justify-end gap-6 md:gap-10">
                    <div className="text-center">
                      <span className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">แต้มสะสมทั้งหมด</span>
                      <span className="text-sm font-bold text-slate-700">{targetEmployee.point_earned}</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">แต้มที่ใช้ไปแล้ว</span>
                      <span className="text-sm font-bold text-slate-600">{targetEmployee.point_earned - targetEmployee.point_redeemed}</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">แต้มคงเหลือ</span>
                      <span className="text-base font-bold text-blue-600">{targetEmployee.point_redeemed}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Card */}
          <div className={`bg-white rounded-2xl border p-5 transition-all ${targetEmployee ? 'border-slate-200 opacity-100' : 'border-slate-100 opacity-50 pointer-events-none'}`}>
            <label className="block text-xs font-semibold text-slate-600 mb-3">เลือกดำเนินการ</label>
            <div className="space-y-4">
              <div>
                <input type="number" placeholder="" value={pointAmount}
                  onChange={(e) => setPointAmount(e.target.value.slice(0, 2))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all mb-4" />

                <div className="flex gap-3">
                  <button onClick={() => handleUpdatePoints('add')} disabled={adjustLoading || !pointAmount}
                    className="flex-[7] flex items-center justify-center gap-2 py-3 px-4 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50 shadow-sm shadow-emerald-500/20">
                    <Plus className="w-4 h-4" /> เพิ่มแต้ม
                  </button>
                  <button onClick={() => handleUpdatePoints('reset')} disabled={adjustLoading}
                    className="flex-[3] flex items-center justify-center gap-2 py-3 px-4 text-rose-600 bg-rose-50/50 border border-rose-100 rounded-xl text-xs font-bold hover:bg-rose-100/50 transition-colors disabled:opacity-50 whitespace-nowrap">
                    <RotateCcw className="w-3.5 h-3.5" /> ล้างแต้ม
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${confirmModal.type.includes('reset') ? 'bg-rose-50 text-rose-500' : (confirmModal.type === 'add' ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-blue-500')
                }`}>
                {confirmModal.type.includes('reset') && <RotateCcw className="w-7 h-7" />}
                {confirmModal.type === 'add' && <Plus className="w-7 h-7" />}
                {confirmModal.type === 'set' && <Save className="w-7 h-7" />}
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">ยืนยันการทำรายการ</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{confirmModal.message}</p>
            </div>
            <div className="flex border-t border-slate-100">
              <button onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                className="flex-1 py-3.5 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition-colors border-r border-slate-100">
                ยกเลิก
              </button>
              <button onClick={executeUpdatePoints}
                className={`flex-1 py-3.5 text-sm font-bold transition-colors ${confirmModal.type.includes('reset') ? 'text-rose-600 hover:bg-rose-50' : (confirmModal.type === 'add' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-blue-600 hover:bg-blue-50')
                  }`}>
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={handleCloseModal}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-8 border border-slate-100" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800 !m-0">{editingEmployee ? 'แก้ไขพนักงาน' : 'เพิ่มพนักงานใหม่'}</h3>
              <p className="text-xs text-slate-500 mt-1">{editingEmployee ? 'แก้ไขข้อมูลพนักงานที่เลือก' : 'กรอกข้อมูลพนักงานที่ต้องการเพิ่ม'}</p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">รหัสพนักงาน</label>
                <input type="text" value={formData.employee_code} onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })} required disabled={!!editingEmployee} className={`${inputCls} disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed disabled:border-slate-100`} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">ชื่อเล่น</label>
                <input type="text" value={formData.nickname} onChange={(e) => setFormData({ ...formData, nickname: e.target.value })} required className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">ตำแหน่ง</label>
                <input type="text" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} required className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">หน่วยงาน</label>
                <input type="text" value={formData.organizational_unit} onChange={(e) => setFormData({ ...formData, organizational_unit: e.target.value })} required className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Role</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className={`${inputCls} appearance-none`}>
                  <option value="user">User</option><option value="admin">Admin</option>
                </select>
              </div>
              {formData.role === 'admin' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">รหัสผ่าน {editingEmployee && <span className="text-slate-400 font-normal">(เว้นว่างถ้าไม่ต้องการเปลี่ยน)</span>}</label>
                  <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required={!editingEmployee} className={inputCls} />
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={handleCloseModal} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors">ยกเลิก</button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-xl transition-all disabled:opacity-50 shadow-sm shadow-blue-500/20">{loading ? 'กำลังบันทึก...' : 'บันทึก'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
