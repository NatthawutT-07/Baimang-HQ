import { useState, useEffect, useMemo } from 'react';
import { Search, FileText, ChevronLeft, ChevronRight, ArrowUpCircle, Gift, X, Clock, AlertTriangle, Download, PlusCircle } from 'lucide-react';
import { logService } from '../../../services/logService';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

export default function LogSection() {
  // --- States ---
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [pagination, setPagination] = useState({ total: 0, limit: 10, offset: 0 });

  // Export States
  const [exportMonth, setExportMonth] = useState(new Date().getMonth() + 1);
  const [exportYear, setExportYear] = useState(new Date().getFullYear());
  const [exporting, setExporting] = useState(false);

  // --- Effects ---
  useEffect(() => {
    fetchLogs(0);
  }, [actionFilter]);

  // --- Data Fetching ---
  const fetchLogs = async (offset = 0, searchOverride) => {
    setLoading(true);
    try {
      const params = { limit: 10, offset };
      if (actionFilter) params.action = actionFilter;

      const currentSearch = searchOverride !== undefined ? searchOverride : searchTerm;
      if (currentSearch) params.search = currentSearch;

      const res = await logService.getAll(params);
      if (res.ok) {
        setLogs(res.data || []);
        setPagination(res.meta || { total: 0, limit: 10, offset });
      }
    } catch (err) {
      toast.error('ไม่สามารถโหลดข้อมูลบันทึกกิจกรรมได้');
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---
  const handleSearch = (e) => {
    e.preventDefault();
    fetchLogs(0);
  };

  const handleClear = () => {
    setSearchTerm('');
    fetchLogs(0, '');
  };

  const handleExportXLSX = async () => {
    setExporting(true);
    try {
      // Calculate start and end date for the selected month
      const startDate = `${exportYear}-${String(exportMonth).padStart(2, '0')}-01T00:00:00+07:00`;
      const lastDay = new Date(exportYear, exportMonth, 0).getDate();
      const endDate = `${exportYear}-${String(exportMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}T23:59:59+07:00`;

      // Fetch all logs for this period (large limit)
      const res = await logService.getAll({
        start_date: startDate,
        end_date: endDate,
        limit: 5000
      });

      if (!res.ok || !res.data || res.data.length === 0) {
        toast.info('ไม่พบข้อมูลในช่วงเวลาที่เลือก');
        return;
      }

      // Sort data by created_at DESC (newest first)
      const sortedData = [...res.data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      // Format data for Excel
      const excelData = sortedData.map(log => ({
        'รหัสพนักงาน': log.employee_code,
        'ชื่อพนักงาน': log.employee?.nickname || '-',
        'กิจกรรม': log.action,
        'สาขา': log.branch_name || (['หักคะแนน', 'เพิ่มคะแนน'].includes(log.action) ? 'HQ (ระบบ)' : '-'),
        'รหัสสาขา': log.branch_code || '-',
        'ยอดขาย': log.sales || 0,
        'เป้าหมาย': log.target || 0,
        'แต้มที่ได้รับ/ใช้': log.point || 0,
        'รางวัล/สาเหตุ': log.reward || '-',
        'เวลาที่บันทึกระบบ': formatDate(log.created_at)
      }));

      // Create workbook and sheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Activity Logs');

      // Download
      XLSX.writeFile(wb, `Log_Export_${exportYear}_${exportMonth}.xlsx`);
      toast.success('ดาวน์โหลดไฟล์สำเร็จ');
    } catch (err) {
      toast.error('เกิดข้อผิดพลาดในการส่งออกข้อมูล');
    } finally {
      setExporting(false);
    }
  };

  // --- Helper Functions ---
  const formatDate = (d) => {
    if (!d) return '-';
    // Use the Date object directly. If it's an ISO string with 'Z', 
    // new Date() will correctly convert it to the user's local time.
    return new Date(d).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // --- Memos ---
  const totalPages = useMemo(() => Math.ceil(pagination.total / pagination.limit), [pagination.total, pagination.limit]);
  const currentPage = useMemo(() => Math.floor(pagination.offset / pagination.limit) + 1, [pagination.offset, pagination.limit]);

  const months = [
    { v: 1, n: 'มกราคม' }, { v: 2, n: 'กุมภาพันธ์' }, { v: 3, n: 'มีนาคม' },
    { v: 4, n: 'เมษายน' }, { v: 5, n: 'พฤษภาคม' }, { v: 6, n: 'มิถุนายน' },
    { v: 7, n: 'กรกฎาคม' }, { v: 8, n: 'สิงหาคม' }, { v: 9, n: 'กันยายน' },
    { v: 10, n: 'ตุลาคม' }, { v: 11, n: 'พฤศจิกายน' }, { v: 12, n: 'ธันวาคม' }
  ];

  const years = [2025, 2026, 2027];

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">บันทึกกิจกรรม</h2>
          <p className="text-xs text-slate-400 mt-1">ประวัติการขาย แลกรางวัล และหักคะแนน รวมทั้งหมด {pagination.total} รายการ</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Export Controls */}
          {/* <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
            <select
              value={exportMonth}
              onChange={(e) => setExportMonth(parseInt(e.target.value))}
              className="bg-transparent text-xs font-bold text-slate-600 outline-none px-2 py-1"
            >
              {months.map(m => <option key={m.v} value={m.v}>{m.n}</option>)}
            </select>
            <select
              value={exportYear}
              onChange={(e) => setExportYear(parseInt(e.target.value))}
              className="bg-transparent text-xs font-bold text-slate-600 outline-none px-2 py-1 border-l border-slate-100"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button
              onClick={handleExportXLSX}
              disabled={exporting}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {exporting ? 'กำลังส่งออก...' : 'Export Excel'}
            </button>
          </div> */}

          <div className="h-8 w-px bg-slate-200 hidden sm:block" />

          {/* Filter Toggle */}
          <div className="flex p-1 bg-slate-100 rounded-xl w-fit border border-slate-200">
            {[
              { value: '', label: 'ทั้งหมด' },
              { value: 'ขาย', label: 'ขาย' },
              { value: 'แลกรางวัล', label: 'แลกรางวัล' },
              { value: 'หักคะแนน', label: 'หักคะแนน' },
              { value: 'เพิ่มคะแนน', label: 'เพิ่มคะแนน' }
            ].map(f => (
              <button
                key={f.value}
                onClick={() => setActionFilter(f.value)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${actionFilter === f.value
                  ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="ค้นหาด้วยรหัสพนักงานเท่านั้น..."
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

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-xs text-slate-400 font-medium">กำลังโหลดบันทึก...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50/80 border-b border-slate-200">
                  <tr className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                    <th className="px-4 py-3 text-center">ID</th>
                    <th className="px-4 py-3">กิจกรรม</th>
                    <th className="px-4 py-3">พนักงาน</th>
                    <th className="px-4 py-3">สาขา</th>
                    <th className="px-4 py-3 text-right">รายละเอียด</th>
                    <th className="px-4 py-3 text-center">แต้ม</th>
                    <th className="px-4 py-3 text-right">วันเวลา</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-4 py-3 text-center text-slate-400 font-mono text-[10px]">{log.id}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${log.action === 'ขาย'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : log.action === 'แลกรางวัล'
                            ? 'bg-blue-50 text-blue-700 border-blue-100'
                            : log.action === 'เพิ่มคะแนน'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              : 'bg-rose-50 text-rose-700 border-rose-100'
                          }`}>
                          {log.action === 'ขาย' ? <ArrowUpCircle className="w-3 h-3" /> : (log.action === 'แลกรางวัล' ? <Gift className="w-3 h-3" /> : (log.action === 'เพิ่มคะแนน' ? <PlusCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />))}
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] text-slate-600 font-mono lowercase tracking-tighter">({log.employee_code})</span>
                          <span className="font-bold text-slate-800">{log.employee?.nickname || 'ไม่ระบุ'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-slate-700 font-medium">{log.branch_name || (['หักคะแนน', 'เพิ่มคะแนน'].includes(log.action) ? 'HQ (ระบบ)' : '-')}</span>
                          <span className="text-[10px] text-slate-400 font-mono tracking-tighter">#{log.branch_code || 'ADMIN'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {log.action === 'ขาย' ? (
                          <div className="flex flex-col items-end">
                            <span className="text-slate-800 font-bold">{log.sales?.toLocaleString()} ฿</span>
                            <span className="text-[10px] text-slate-400">เป้าหมาย: {log.target?.toLocaleString()}</span>
                          </div>
                        ) : (
                          <span className={`font-bold ${['หักคะแนน'].includes(log.action) ? 'text-rose-600' : (['เพิ่มคะแนน', 'ขาย'].includes(log.action) ? 'text-emerald-600' : 'text-blue-600')}`}>{log.reward || '-'}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-black ${log.point >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {log.point > 0 ? `+${log.point}` : log.point}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-col items-end space-y-1">
                          <div className="flex flex-col items-end">
                            <span className="text-slate-700 font-bold">{formatDate(log.date || log.created_at)}</span>
                          </div>
                          {log.action === 'ขาย' && (
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                              <Clock className="w-3 h-3 text-slate-300" />
                              <span>บันทึกเมื่อ: {formatDate(log.created_at)}</span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {logs.length === 0 && (
              <div className="text-center py-20 bg-slate-50/30">
                <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-sm text-slate-400 font-medium">ไม่พบรายการบันทึกกิจกรรมในขณะนี้</p>
              </div>
            )}

            {/* Pagination */}
            {pagination.total > 0 && (
              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchLogs(Math.max(0, pagination.offset - pagination.limit))}
                    disabled={pagination.offset === 0}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 transition-all shadow-sm active:scale-95"
                  >
                    <ChevronLeft className="w-4 h-4" /> ก่อนหน้า
                  </button>
                  <button
                    onClick={() => fetchLogs(pagination.offset + pagination.limit)}
                    disabled={pagination.offset + pagination.limit >= pagination.total}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 transition-all shadow-sm active:scale-95"
                  >
                    ถัดไป <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
