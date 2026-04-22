import { useState, useEffect } from 'react';
import { Plus, Edit2, Search, Building2, Trash2 } from 'lucide-react';
import { branchService } from '../../../services/branchService';
import { toast } from 'react-toastify';

export default function BranchSection() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [formData, setFormData] = useState({ branch_code: '', branch_name: '', month: '', day: '', target: '' });

  useEffect(() => { fetchBranches(); }, []);

  const fetchBranches = async () => {
    setLoading(true);
    try { const r = await branchService.getAll(); if (r.ok) setBranches(r.data); }
    catch { toast.error('ไม่สามารถโหลดข้อมูลสาขาได้'); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if (editingBranch) { const r = await branchService.update(editingBranch.id, formData); if (r.ok) toast.success('แก้ไขข้อมูลสาขาสำเร็จ'); }
      else { const r = await branchService.create(formData); if (r.ok) toast.success('เพิ่มสาขาสำเร็จ'); }
      fetchBranches(); handleCloseModal();
    } catch (err) { toast.error(err.response?.data?.message || 'เกิดข้อผิดพลาด'); } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('ต้องการลบสาขานี้หรือไม่?')) return;
    try { const r = await branchService.delete(id); if (r.ok) { toast.success('ลบสาขาสำเร็จ'); fetchBranches(); } }
    catch { toast.error('ไม่สามารถลบสาขาได้'); }
  };

  const handleEdit = (branch) => {
    setEditingBranch(branch);
    setFormData({ branch_code: branch.branch_code, branch_name: branch.branch_name, month: branch.month, day: branch.day, target: branch.target });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false); setEditingBranch(null);
    setFormData({ branch_code: '', branch_name: '', month: '', day: '', target: '' });
  };

  const filteredBranches = branches.filter(b =>
    b.branch_code.toLowerCase().includes(searchTerm.toLowerCase()) || b.branch_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inputCls = "w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white transition-all placeholder:text-slate-400";

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-800 !m-0">จัดการสาขา</h2>
          <p className="text-xs text-slate-400 mt-0.5">{branches.length} สาขาทั้งหมด</p>
        </div>
        <button id="btn-add-branch" onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/25">
          <Plus className="h-4 w-4" /><span>เพิ่มสาขา</span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input id="search-branch" type="text" placeholder="ค้นหาด้วยรหัสหรือชื่อสาขา..." value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white transition-all" />
      </div>

      {/* Loading */}
      {loading && (<div className="flex justify-center py-16"><div className="w-8 h-8 border-[3px] border-slate-200 border-t-blue-500 rounded-full animate-spin" /></div>)}

      {/* Table */}
      {!loading && (
        <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/80 border-b border-slate-200/80">
              <tr className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                <th className="px-4 py-3.5">รหัสสาขา</th>
                <th className="px-4 py-3.5">ชื่อสาขา</th>
                <th className="px-4 py-3.5">เดือน</th>
                <th className="px-4 py-3.5">วัน</th>
                <th className="px-4 py-3.5">เป้าหมาย</th>
                <th className="px-4 py-3.5 text-center w-24">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBranches.map((branch) => (
                <tr key={branch.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">{branch.branch_code}</span>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-800">{branch.branch_name}</td>
                  <td className="px-4 py-3.5 text-slate-600">{branch.month}</td>
                  <td className="px-4 py-3.5 text-slate-600">{branch.day}</td>
                  <td className="px-4 py-3.5 font-semibold text-slate-700">{branch.target.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-center">
                    <button onClick={() => handleEdit(branch)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                      <Edit2 className="h-3.5 w-3.5" /><span className="hidden sm:inline">แก้ไข</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredBranches.length === 0 && !loading && (
            <div className="text-center py-16"><Building2 className="w-10 h-10 text-slate-200 mx-auto mb-3" /><p className="text-sm text-slate-400">ไม่พบข้อมูลสาขา</p></div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-[modalIn_0.2s_ease-out] border border-slate-100" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800 !m-0">{editingBranch ? 'แก้ไขสาขา' : 'เพิ่มสาขาใหม่'}</h3>
              <p className="text-xs text-slate-500 mt-1">{editingBranch ? 'แก้ไขข้อมูลสาขาที่เลือก' : 'กรอกข้อมูลสาขาที่ต้องการเพิ่ม'}</p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">รหัสสาขา</label>
                <input type="text" value={formData.branch_code} onChange={(e) => setFormData({ ...formData, branch_code: e.target.value })} required className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">ชื่อสาขา</label>
                <input type="text" value={formData.branch_name} onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })} required className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">เดือน</label>
                  <input type="number" min="1" max="12" value={formData.month} onChange={(e) => setFormData({ ...formData, month: e.target.value })} required className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">วัน</label>
                  <input type="number" min="1" max="31" value={formData.day} onChange={(e) => setFormData({ ...formData, day: e.target.value })} required className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">เป้าหมาย</label>
                <input type="number" step="0.01" value={formData.target} onChange={(e) => setFormData({ ...formData, target: e.target.value })} required className={inputCls} />
                <p className="mt-1.5 text-[11px] text-slate-400">เป้าหมายเฉลี่ย: {formData.target && formData.day ? (parseFloat(formData.target) / parseInt(formData.day)).toLocaleString(undefined, {maximumFractionDigits: 2}) : '0'} / วัน</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={handleCloseModal} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors">ยกเลิก</button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-xl transition-all disabled:opacity-50 shadow-sm shadow-blue-500/20">
                  {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
