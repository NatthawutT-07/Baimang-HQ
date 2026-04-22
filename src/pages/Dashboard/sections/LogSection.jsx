import { useState, useEffect } from 'react';
import { Search, FileText, ChevronLeft, ChevronRight, ArrowUpCircle, Gift } from 'lucide-react';
import { logService } from '../../../services/logService';
import { toast } from 'react-toastify';

export default function LogSection() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [pagination, setPagination] = useState({ total: 0, limit: 50, offset: 0 });

  useEffect(() => { fetchLogs(); }, [actionFilter]);

  const fetchLogs = async (offset = 0) => {
    setLoading(true);
    try {
      const params = { limit: 50, offset };
      if (actionFilter) params.action = actionFilter;
      const r = await logService.getAll(params);
      if (r.ok) { setLogs(r.data); setPagination(r.pagination); }
    } catch { toast.error('ไม่สามารถโหลดข้อมูลบันทึกได้'); } finally { setLoading(false); }
  };

  const filteredLogs = logs.filter(log =>
    log.employee_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.branch_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.branch_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.employee?.nickname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (d) => {
    const localStr = typeof d === 'string' && d.endsWith('Z') ? d.slice(0, -1) : d;
    return new Date(localStr).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };
  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-800 !m-0">บันทึกกิจกรรม</h2>
          <p className="text-xs text-slate-400 mt-0.5">{pagination.total} รายการทั้งหมด</p>
        </div>
        <div className="flex space-x-1 bg-slate-100/80 p-1 rounded-xl w-fit border border-slate-200/50">
          {[{ value: '', label: 'ทั้งหมด' }, { value: 'ขาย', label: 'ขาย' }, { value: 'แลกรางวัล', label: 'แลกรางวัล' }].map(f => (
            <button key={f.value} onClick={() => setActionFilter(f.value)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                actionFilter === f.value 
                  ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
              }`}>{f.label}</button>
          ))}
        </div>
      </div>

      <div className="mb-4 relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input id="search-log" type="text" placeholder="ค้นหาจากรหัสพนักงาน, ชื่อ, หรือสาขา..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white transition-all" />
      </div>

      {loading && (<div className="flex justify-center py-16"><div className="w-8 h-8 border-[3px] border-slate-200 border-t-blue-500 rounded-full animate-spin" /></div>)}

      {!loading && (
        <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/80 border-b border-slate-200/80">
              <tr className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                <th className="px-4 py-3.5">ประเภท</th>
                <th className="px-4 py-3.5">พนักงาน</th>
                <th className="px-4 py-3.5">สาขา</th>
                <th className="px-4 py-3.5 text-right">รายละเอียด</th>
                <th className="px-4 py-3.5 text-right">แต้ม</th>
                <th className="px-4 py-3.5 text-right">วันที่</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      log.action === 'ขาย' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' : 'bg-blue-50 text-blue-700 border border-blue-200/50'
                    }`}>
                      {log.action === 'ขาย' ? <ArrowUpCircle className="w-3 h-3" /> : <Gift className="w-3 h-3" />}
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-slate-800 !m-0">{log.employee?.nickname || log.employee_code}</p>
                    <p className="text-[11px] text-slate-400 font-mono !m-0">{log.employee_code}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-slate-700 !m-0">{log.branch_name}</p>
                    <p className="text-[11px] text-slate-400 font-mono !m-0">{log.branch_code}</p>
                  </td>
                  <td className="px-4 py-3.5 text-right text-slate-600">
                    {log.action === 'ขาย' && <span>{log.sales?.toLocaleString()} / {log.target?.toLocaleString()} ฿</span>}
                    {log.action === 'แลกรางวัล' && <span>{log.reward}</span>}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="font-semibold text-slate-700">{log.point}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right text-xs text-slate-500">{formatDate(log.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLogs.length === 0 && !loading && (
            <div className="text-center py-16"><FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" /><p className="text-sm text-slate-400">ไม่พบบันทึกกิจกรรม</p></div>
          )}
        </div>
      )}

      {pagination.total > 0 && (
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            แสดง <span className="font-semibold text-slate-700">{filteredLogs.length}</span> จาก <span className="font-semibold text-slate-700">{pagination.total}</span> รายการ
            {totalPages > 1 && <span className="ml-2 text-slate-400">• หน้า {currentPage} / {totalPages}</span>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => fetchLogs(Math.max(0, pagination.offset - pagination.limit))} disabled={pagination.offset === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              <ChevronLeft className="w-3.5 h-3.5" />ก่อนหน้า
            </button>
            <button onClick={() => fetchLogs(pagination.offset + pagination.limit)} disabled={pagination.offset + pagination.limit >= pagination.total}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              ถัดไป<ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
