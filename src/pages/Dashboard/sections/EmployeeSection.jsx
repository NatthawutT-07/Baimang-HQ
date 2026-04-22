import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Users, Shield, ShieldCheck } from 'lucide-react';
import { employeeService } from '../../../services/employeeService';
import { toast } from 'react-toastify';

export default function EmployeeSection() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({ employee_code: '', nickname: '', position: '', organizational_unit: '', role: 'user', password: '' });

  useEffect(() => { fetchEmployees(); }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try { const r = await employeeService.getAll(); if (r.ok) setEmployees(r.data); }
    catch { toast.error('ไม่สามารถโหลดข้อมูลพนักงานได้'); } finally { setLoading(false); }
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

  const filteredEmployees = employees.filter(e =>
    e.employee_code.toLowerCase().includes(searchTerm.toLowerCase()) || e.nickname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inputCls = "w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white transition-all placeholder:text-slate-400";

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-800 !m-0">จัดการพนักงาน</h2>
          <p className="text-xs text-slate-400 mt-0.5">{employees.length} พนักงานทั้งหมด</p>
        </div>
        <button id="btn-add-employee" onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/25">
          <Plus className="h-4 w-4" /><span>เพิ่มพนักงาน</span>
        </button>
      </div>

      <div className="mb-4 relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input id="search-employee" type="text" placeholder="ค้นหาด้วยรหัสหรือชื่อพนักงาน..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white transition-all" />
      </div>

      {loading && (<div className="flex justify-center py-16"><div className="w-8 h-8 border-[3px] border-slate-200 border-t-blue-500 rounded-full animate-spin" /></div>)}

      {!loading && (
        <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/80 border-b border-slate-200/80">
              <tr className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                <th className="px-4 py-3.5">พนักงาน</th>
                <th className="px-4 py-3.5">ตำแหน่ง</th>
                <th className="px-4 py-3.5">หน่วยงาน</th>
                <th className="px-4 py-3.5 text-center">แต้มสะสม</th>
                <th className="px-4 py-3.5 text-center">แต้มใช้แล้ว</th>
                <th className="px-4 py-3.5 text-center">Role</th>
                <th className="px-4 py-3.5 text-center w-24">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-blue-50/30 transition-colors group">
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
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/50">{emp.point_earned}</span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200/50">{emp.point_redeemed}</span>
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
          {filteredEmployees.length === 0 && !loading && (
            <div className="text-center py-16"><Users className="w-10 h-10 text-slate-200 mx-auto mb-3" /><p className="text-sm text-slate-400">ไม่พบข้อมูลพนักงาน</p></div>
          )}
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
