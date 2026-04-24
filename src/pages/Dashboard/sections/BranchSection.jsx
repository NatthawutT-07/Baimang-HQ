import { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Search, Building2, Trash2, X, Target, Calendar } from 'lucide-react';
import { branchService } from '../../../services/branchService';
import { toast } from 'react-toastify';

export default function BranchSection() {
  // --- States ---
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [formData, setFormData] = useState({ 
    branch_code: '', 
    branch_name: '', 
    month: '', 
    day: '', 
    target: '', 
    status: 'active' 
  });

  // --- Effects ---
  useEffect(() => { 
    fetchBranches(); 
  }, []);

  // --- Data Fetching ---
  const fetchBranches = async () => {
    setLoading(true);
    try { 
      const res = await branchService.getAll(); 
      if (res.ok) {
        setBranches(res.data || []);
      }
    } catch (err) { 
      toast.error('ไม่สามารถโหลดข้อมูลสาขาได้'); 
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
      if (editingBranch) {
        res = await branchService.update(editingBranch.id, formData);
        if (res.ok) toast.success('แก้ไขข้อมูลสาขาสำเร็จ');
      } else {
        res = await branchService.create(formData);
        if (res.ok) toast.success('เพิ่มสาขาสำเร็จ');
      }
      
      if (res.ok) {
        fetchBranches();
        handleCloseModal();
      }
    } catch (err) {
      toast.error(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('คุณต้องการลบข้อมูลสาขานี้ใช่หรือไม่?')) return;
    try {
      const res = await branchService.delete(id);
      if (res.ok) {
        toast.success('ลบข้อมูลสาขาสำเร็จ');
        fetchBranches();
      }
    } catch (err) {
      toast.error('ไม่สามารถลบข้อมูลสาขาได้');
    }
  };

  const handleEdit = (branch) => {
    setEditingBranch(branch);
    setFormData({ 
      branch_code: branch.branch_code, 
      branch_name: branch.branch_name, 
      month: branch.month, 
      day: branch.day, 
      target: branch.target, 
      status: branch.status || 'active' 
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBranch(null);
    setFormData({ 
      branch_code: '', 
      branch_name: '', 
      month: '', 
      day: '', 
      target: '', 
      status: 'active' 
    });
  };

  const toggleBranchStatus = async (branch) => {
    const newStatus = branch.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await branchService.update(branch.id, { status: newStatus });
      if (res.ok) {
        toast.success(`เปลี่ยนสถานะสาขาเป็น ${newStatus === 'active' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'} สำเร็จ`);
        setBranches(prev => prev.map(b => b.id === branch.id ? { ...b, status: newStatus } : b));
      }
    } catch (err) {
      toast.error('ไม่สามารถเปลี่ยนสถานะได้');
    }
  };

  // --- Memos ---
  const filteredBranches = useMemo(() => {
    if (!searchTerm) return branches;
    const lowerSearch = searchTerm.toLowerCase();
    return branches.filter(b =>
      b.branch_code.toLowerCase().includes(lowerSearch) || 
      b.branch_name.toLowerCase().includes(lowerSearch)
    );
  }, [branches, searchTerm]);

  // --- Styles ---
  const inputCls = "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 bg-white transition-all placeholder:text-slate-400";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">จัดการสาขา</h2>
          <p className="text-xs text-slate-400 mt-1">ทั้งหมด {branches.length} สาขา</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>เพิ่มสาขา</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        <input 
          type="text" 
          placeholder="ค้นหาด้วยรหัส หรือชื่อสาขา..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 bg-white transition-all shadow-sm" 
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Branch Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-xs text-slate-400 font-medium">กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/80 border-b border-slate-200">
                <tr className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                  <th className="px-4 py-3">ข้อมูลสาขา</th>
                  <th className="px-4 py-3 text-center">เดือน / จำนวนวัน</th>
                  <th className="px-4 py-3 text-right">เป้าหมายรวม</th>
                  <th className="px-4 py-3 text-right">เฉลี่ยต่อวัน</th>
                  <th className="px-4 py-3 text-center">สถานะ</th>
                  <th className="px-4 py-3 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBranches.map((branch) => (
                  <tr key={branch.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{branch.branch_name}</span>
                        <span className="text-[10px] text-slate-400 font-mono tracking-tighter">CODE: {branch.branch_code}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-slate-600 font-bold">{branch.month}</span>
                        <span className="text-[10px] text-slate-400">({branch.day} วัน)</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-slate-800">{branch.target?.toLocaleString()}</span>
                      <span className="ml-1 text-[10px] text-slate-400">฿</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-black text-blue-600">
                        {(branch.avg_target || (branch.target / branch.day)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="ml-1 text-[10px] text-slate-400">฿</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleBranchStatus(branch)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${
                          branch.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${branch.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                        {branch.status === 'active' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleEdit(branch)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="แก้ไข"><Edit2 className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(branch.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="ลบ"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredBranches.length === 0 && (
              <div className="text-center py-20 bg-slate-50/30">
                <Building2 className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-sm text-slate-400 font-medium">ไม่พบข้อมูลสาขาในขณะนี้</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4 overflow-y-auto" onClick={handleCloseModal}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md my-8 border border-slate-100 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{editingBranch ? 'แก้ไขข้อมูลสาขา' : 'เพิ่มสาขาใหม่'}</h3>
                <p className="text-xs text-slate-400 mt-0.5">ระบุรายละเอียดเป้าหมายในแต่ละเดือน</p>
              </div>
              <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">รหัสสาขา</label>
                    <input 
                      type="text" 
                      value={formData.branch_code} 
                      onChange={(e) => setFormData({ ...formData, branch_code: e.target.value })} 
                      required 
                      placeholder="เช่น BKK01"
                      className={inputCls} 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">ชื่อสาขา</label>
                    <input 
                      type="text" 
                      value={formData.branch_name} 
                      onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })} 
                      required 
                      placeholder="ระบุชื่อสาขา"
                      className={inputCls} 
                    />
                  </div>
                </div>

                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">การกำหนดช่วงเวลา</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">เดือนที่บันทึก (1-12)</label>
                      <input 
                        type="number" 
                        min="1" 
                        max="12" 
                        value={formData.month} 
                        onChange={(e) => setFormData({ ...formData, month: e.target.value })} 
                        required 
                        className={inputCls} 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">จำนวนวันทั้งหมดในเดือน</label>
                      <input 
                        type="number" 
                        min="1" 
                        max="31" 
                        value={formData.day} 
                        onChange={(e) => setFormData({ ...formData, day: e.target.value })} 
                        required 
                        className={inputCls} 
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 space-y-4">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <Target className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">เป้าหมายการขาย (Target)</span>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">เป้าหมายรวมทั้งเดือน (฿)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={formData.target} 
                      onChange={(e) => setFormData({ ...formData, target: e.target.value })} 
                      required 
                      className={`${inputCls} font-bold text-emerald-600`} 
                    />
                  </div>
                  {formData.target && formData.day && (
                    <div className="bg-white p-3 rounded-xl border border-emerald-100 flex justify-between items-center shadow-sm">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">เฉลี่ยต่อวัน</span>
                      <span className="text-sm font-black text-emerald-600">
                        {(parseFloat(formData.target) / parseInt(formData.day)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">สถานะการใช้งาน</label>
                  <select 
                    value={formData.status} 
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })} 
                    className={`${inputCls} appearance-none bg-no-repeat bg-right pr-10`}
                  >
                    <option value="active">เปิดใช้งาน (Active)</option>
                    <option value="inactive">ปิดใช้งาน (Inactive)</option>
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
                  {loading ? 'กำลังบันทึก...' : (editingBranch ? 'บันทึกการเปลี่ยนแปลง' : 'ยืนยันเพิ่มสาขา')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
