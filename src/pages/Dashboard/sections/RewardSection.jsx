import { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, Search, Gift, Star, X, Sparkles } from 'lucide-react';
import { rewardService } from '../../../services/rewardService';
import { toast } from 'react-toastify';

export default function RewardSection() {
  // --- States ---
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [formData, setFormData] = useState({ title: '', point_reward: '' });

  // --- Effects ---
  useEffect(() => { 
    fetchRewards(); 
  }, []);

  // --- Data Fetching ---
  const fetchRewards = async () => {
    setLoading(true);
    try { 
      const res = await rewardService.getAll(); 
      if (res.ok) {
        setRewards(res.data || []);
      }
    } catch (err) { 
      toast.error('ไม่สามารถโหลดข้อมูลรางวัลได้'); 
    } finally { 
      setLoading(false); 
    }
  };

  // --- Handlers ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        point_reward: parseInt(formData.point_reward)
      };

      let res;
      if (editingReward) {
        res = await rewardService.update(editingReward.id, payload);
        if (res.ok) toast.success('แก้ไขข้อมูลรางวัลสำเร็จ');
      } else {
        res = await rewardService.create(payload);
        if (res.ok) toast.success('เพิ่มรางวัลสำเร็จ');
      }
      
      if (res.ok) {
        fetchRewards();
        handleCloseModal();
      }
    } catch (err) {
      toast.error(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('คุณต้องการลบรางวัลนี้ใช่หรือไม่?')) return;
    try {
      const res = await rewardService.delete(id);
      if (res.ok) {
        toast.success('ลบรางวัลสำเร็จ');
        fetchRewards();
      }
    } catch (err) {
      toast.error('ไม่สามารถลบรางวัลได้');
    }
  };

  const handleEdit = (rw) => {
    setEditingReward(rw);
    setFormData({ title: rw.title, point_reward: rw.point_reward });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingReward(null);
    setFormData({ title: '', point_reward: '' });
  };

  // --- Memos ---
  const filteredRewards = useMemo(() => {
    if (!searchTerm) return rewards;
    const lowerSearch = searchTerm.toLowerCase();
    return rewards.filter(r => r.title.toLowerCase().includes(lowerSearch));
  }, [rewards, searchTerm]);

  // --- Styles ---
  const inputCls = "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 bg-white transition-all placeholder:text-slate-400";

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">จัดการของรางวัล</h2>
            <p className="text-xs text-slate-400 mt-1">ทั้งหมด {rewards.length} รายการสำหรับพนักงาน</p>
          </div>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>เพิ่มรางวัล</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        <input 
          type="text" 
          placeholder="ค้นหาชื่อของรางวัล..." 
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

      {/* Reward Grid/Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-xs text-slate-400 font-medium">กำลังโหลดรางวัล...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50/80 border-b border-slate-200">
                  <tr className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                    <th className="px-6 py-4">ชื่อของรางวัล</th>
                    <th className="px-6 py-4 text-right">แต้มที่ต้องใช้</th>
                    <th className="px-6 py-4 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRewards.map((reward) => (
                    <tr key={reward.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-slate-800">{reward.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black bg-amber-50 text-amber-600 border border-amber-100">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          {reward.point_reward?.toLocaleString()} แต้ม
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => handleEdit(reward)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors" title="แก้ไข"><Edit2 className="h-4 w-4" /></button>
                          <button onClick={() => handleDelete(reward.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors" title="ลบ"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredRewards.length === 0 && (
              <div className="text-center py-24 bg-slate-50/30">
                <Gift className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <p className="text-sm text-slate-400 font-medium">ไม่พบข้อมูลรางวัลในขณะนี้</p>
                <button 
                  onClick={() => setShowModal(true)}
                  className="mt-4 text-blue-600 text-xs font-bold hover:underline"
                >
                  คลิกเพื่อเพิ่มรางวัลใหม่
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4 overflow-y-auto" onClick={handleCloseModal}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md my-8 border border-slate-100 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{editingReward ? 'แก้ไขข้อมูลรางวัล' : 'เพิ่มรางวัลใหม่'}</h3>
                <p className="text-xs text-slate-400 mt-0.5">ระบุชื่อและจำนวนแต้มที่พนักงานต้องใช้แลก</p>
              </div>
              <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">ชื่อของรางวัล</label>
                  <input 
                    type="text" 
                    value={formData.title} 
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                    required 
                    placeholder="เช่น บัตรกำนัล Starbucks 100 บาท"
                    className={inputCls} 
                  />
                </div>

                <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-100/50 space-y-4">
                  <div className="flex items-center gap-2 text-amber-600">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-xs font-bold uppercase tracking-wider">แต้มที่ต้องใช้แลก</span>
                  </div>
                  <input 
                    type="number" 
                    min="0" 
                    value={formData.point_reward} 
                    onChange={(e) => setFormData({ ...formData, point_reward: e.target.value })} 
                    required 
                    placeholder="ระบุจำนวนแต้ม"
                    className={`${inputCls} font-bold text-amber-700 text-lg`} 
                  />
                  <p className="text-[10px] text-amber-600/70 font-medium">พนักงานต้องมีแต้มสะสมเท่ากับหรือมากกว่าจำนวนนี้เพื่อแลกรับ</p>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
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
                  {loading ? 'กำลังบันทึก...' : (editingReward ? 'บันทึกการเปลี่ยนแปลง' : 'ยืนยันเพิ่มรางวัล')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
