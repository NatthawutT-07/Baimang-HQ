import { useState, useEffect } from 'react';
import { UploadCloud, Target, CheckCircle2, AlertCircle, Users, Save, CalendarDays } from 'lucide-react';
import * as XLSX from 'xlsx';
import { branchService } from '../../../services/branchService';
import { toast } from 'react-toastify';
import { logService } from '../../../services/logService';

export default function HitTargetSection() {
  const [salesFile, setSalesFile] = useState(null);
  const [attendanceFile, setAttendanceFile] = useState(null);
  const [branches, setBranches] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [savingPoints, setSavingPoints] = useState(false);
  const [saveReport, setSaveReport] = useState(null);
  const [salesDate, setSalesDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD default today
  });

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const res = await branchService.getAll();
      if (res.ok) {
        setBranches(res.data || []);
      }
    } catch (err) {
      toast.error('ไม่สามารถโหลดข้อมูลสาขาจาก API ได้');
    }
  };

  const handleSalesUpload = (e) => {
    if (e.target.files.length > 0) {
      setSalesFile(e.target.files[0]);
      setResults(null);
      setSaveReport(null);
    }
  };

  const handleAttendanceUpload = (e) => {
    if (e.target.files.length > 0) {
      setAttendanceFile(e.target.files[0]);
      setResults(null);
      setSaveReport(null);
    }
  };

  const readExcel = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
          resolve(json);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  const normalizeKeys = (obj) => {
    const newObj = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key.toString().trim().toLowerCase()] = obj[key];
      }
    }
    return newObj;
  };

  const processData = async () => {
    if (!salesFile || !attendanceFile) {
      toast.warning('กรุณาอัปโหลดไฟล์ให้ครบทั้ง 2 ไฟล์');
      return;
    }
    if (branches.length === 0) {
      toast.error('ไม่มีข้อมูลสาขาจากระบบ กรุณาลองใหม่อีกครั้ง');
      return;
    }

    setProcessing(true);
    setResults(null);
    setSaveReport(null);

    try {
      // อ่านและแปลงไฟล์
      const rawSalesData = await readExcel(salesFile);
      const rawAttendanceData = await readExcel(attendanceFile);

      // แปลงหัวคอลัมน์ให้เป็นพิมพ์เล็กทั้งหมดและตัดช่องว่าง
      const salesData = rawSalesData.map(normalizeKeys);
      const attendanceData = rawAttendanceData.map(normalizeKeys);

      // 1.2 ไฟล์ยอดขายประกอบไปด้วย store และ actual
      const branchHitTarget = [];
      const branchSummary = [];

      branches.forEach(branch => {
        const avgTarget = branch.avg_target || (branch.target / branch.day);

        // ค้นหาสาขาในไฟล์ยอดขาย (map branch_name กับ store)
        const matchingSales = salesData.find(row => {
          const storeName = row['store'];
          return storeName && storeName.toString().trim() === branch.branch_name;
        });

        if (matchingSales) {
          const actualSalesRaw = matchingSales['actual'];
          const actualSales = parseFloat((actualSalesRaw || '0').toString().replace(/,/g, ''));

          // ตรวจสอบ actual ของสาขานั้น ถ้า มากกว่าหรือเท่ากับ avg_target ให้เก็บข้อมูลไว้
          if (actualSales >= avgTarget) {
            branchHitTarget.push(branch.branch_name);
            branchSummary.push({
              branchName: branch.branch_name,
              target: avgTarget,
              actual: actualSales
            });
          }
        }
      });

      // หากไม่มีเลยให้ รีเทรินเป็น 0 และจบการทำงาน
      if (branchHitTarget.length === 0) {
        toast.info('ไม่มีสาขาที่ทำยอดผ่านเป้าหมาย (Hit Target = 0)');
        setResults({ hitTargets: [], employees: [] });
        setProcessing(false);
        return;
      }

      // 1.3 ไฟล์บันทึกเวลาทำงาน ดึงข้อมูล EmpCardNo, LocationName ตัดข้อมูลซ้ำกัน
      const uniqueAttendanceMap = new Map();
      attendanceData.forEach(row => {
        const empCardNo = row['empcardno'];
        const locationName = row['locationname'];

        if (empCardNo && locationName) {
          const emp = empCardNo.toString().trim();
          const loc = locationName.toString().trim();
          const key = `${emp}_${loc}`;
          // ใช้ Map เพื่อตัดข้อมูลซ้ำ (Duplicate) ของคู่พนักงานและสาขา
          if (!uniqueAttendanceMap.has(key)) {
            uniqueAttendanceMap.set(key, { empCardNo: emp, locationName: loc });
          }
        }
      });
      const uniqueAttendance = Array.from(uniqueAttendanceMap.values());

      // 1.4 map ข้อมูล branch_hit_target = locationName ให้เหลือไว้เพียง row ที่ตรง
      const hitEmployees = [];
      uniqueAttendance.forEach(att => {
        if (branchHitTarget.includes(att.locationName)) {
          hitEmployees.push(att);
        }
      });

      // จัดกลุ่มพนักงานตามสาขา (Group by LocationName)
      const groupedEmployeesMap = new Map();
      hitEmployees.forEach(att => {
        if (!groupedEmployeesMap.has(att.locationName)) {
          groupedEmployeesMap.set(att.locationName, []);
        }
        groupedEmployeesMap.get(att.locationName).push(att.empCardNo);
      });

      const groupedEmployees = Array.from(groupedEmployeesMap.entries()).map(([loc, emps]) => ({
        locationName: loc,
        employees: emps
      }));

      // 1.5 1 EmpCardNo สามารถมีได้หลาย LocationName

      // 1.6 เก็บผลลัพธ์เพื่อเตรียมแสดง
      setResults({
        hitTargets: branchSummary,
        employees: groupedEmployees
      });
      toast.success('ประมวลผลเสร็จสิ้น พบข้อมูลสาขาที่ Hit Target!');

    } catch (error) {
      console.error(error);
      toast.error('เกิดข้อผิดพลาด: โปรดตรวจสอบว่าไฟล์มีคอลัมน์ store, actual, EmpCardNo, LocationName ถูกต้อง');
    } finally {
      setProcessing(false);
    }
  };

  const handleSavePoints = async () => {
    if (!results || !results.employees || !results.hitTargets) return;

    // สร้าง map ของ branchName -> { target, actual } จาก hitTargets
    const branchInfoMap = {};
    results.hitTargets.forEach(b => {
      branchInfoMap[b.branchName] = { target: b.target, actual: b.actual };
    });

    // สร้าง entries สำหรับ log แต่ละคู่ employee+branch
    const entries = [];
    results.employees.forEach(group => {
      const info = branchInfoMap[group.locationName] || {};
      group.employees.forEach(empId => {
        entries.push({
          employee_code: empId,
          branch_name: group.locationName,
          target: info.target || null,
          sales: info.actual || null,
        });
      });
    });

    if (entries.length === 0) {
      toast.warning('ไม่มีข้อมูลที่ต้องบันทึก');
      return;
    }

    setSavingPoints(true);
    setSaveReport(null);

    try {
      const res = await logService.bulkHitTarget(entries, salesDate);
      if (res.ok) {
        toast.success(`บันทึกสำเร็จ: ${res.data.success.length} รายการ`);
        setSaveReport(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาดในการบันทึกเข้าสู่ระบบ');
    } finally {
      setSavingPoints(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Compact Header & Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Sales File Upload */}
          <label className="w-full sm:w-64 flex items-center px-4 py-2 border border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-400 transition-all cursor-pointer bg-slate-50 group">
            <UploadCloud className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
            <span className="text-xs font-bold text-slate-700 ml-2 flex-shrink-0">1. ไฟล์ยอดขาย</span>
            <span className="text-[11px] font-medium text-slate-500 truncate ml-auto pl-2">
              {salesFile ? salesFile.name : 'เลือกไฟล์'}
            </span>
            <input type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleSalesUpload} />
          </label>

          {/* Attendance File Upload */}
          <label className="w-full sm:w-64 flex items-center px-4 py-2 border border-slate-200 rounded-xl hover:bg-emerald-50 hover:border-emerald-400 transition-all cursor-pointer bg-slate-50 group">
            <UploadCloud className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors flex-shrink-0" />
            <span className="text-xs font-bold text-slate-700 ml-2 flex-shrink-0">2. ไฟล์เวลาทำงาน</span>
            <span className="text-[11px] font-medium text-slate-500 truncate ml-auto pl-2">
              {attendanceFile ? attendanceFile.name : 'เลือกไฟล์'}
            </span>
            <input type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleAttendanceUpload} />
          </label>

          {/* Action Button */}
          <div className="flex-shrink-0 w-full sm:w-auto">
            <button
              onClick={processData}
              disabled={processing || !salesFile || !attendanceFile || branches.length === 0 || results !== null}
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed w-full"
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-300 border-t-white rounded-full animate-spin" />
                  ตรวจสอบ...
                </>
              ) : (
                <>ตรวจสอบ</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {results && (
        <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="border-t border-slate-200 pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ผลลัพธ์การตรวจสอบ
              </h3>
              {results.hitTargets.length > 0 && (
                <div className="flex items-center gap-3">
                  <div 
                    className="relative flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={(e) => {
                      const input = e.currentTarget.querySelector('input[type="date"]');
                      if (input && input.showPicker) input.showPicker();
                    }}
                  >
                    <CalendarDays className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-semibold text-slate-800">
                      {salesDate ? `${salesDate.split('-')[2]} / ${salesDate.split('-')[1]} / ${salesDate.split('-')[0]}` : 'วัน / เดือน / ปี'}
                    </span>
                    <input
                      type="date"
                      value={salesDate}
                      onChange={(e) => setSalesDate(e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
                    />
                  </div>
                  <button
                    onClick={handleSavePoints}
                    disabled={savingPoints || saveReport !== null}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-emerald-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingPoints ? (
                      <><div className="w-4 h-4 border-2 border-emerald-300 border-t-white rounded-full animate-spin" />กำลังบันทึก...</>
                    ) : saveReport !== null ? (
                      <><CheckCircle2 className="w-4 h-4" />บันทึกแล้ว</>
                    ) : (
                      <>บันทึก</>
                    )}
                  </button>
                </div>
              )}
            </div>

            {results.hitTargets.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center mt-4">
                <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">ไม่พบสาขาที่ยอดขายผ่านเกณฑ์ (0)</p>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Info: Hit Target Branches Summary */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-500" />
                      สาขาที่ยอดขายผ่านเกณฑ์ ({results.hitTargets.length})
                    </h4>
                  </div>
                  <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left text-[12px] whitespace-nowrap">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                          <th className="px-4 py-2.5 text-center w-12">ลำดับ</th>
                          <th className="px-4 py-2.5">ชื่อสาขา</th>
                          <th className="px-4 py-2.5 text-right">เกณฑ์</th>
                          <th className="px-4 py-2.5 text-right">ยอดจริง</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {results.hitTargets.map((branch, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="px-4 py-2 text-center text-slate-400">{idx + 1}</td>
                            <td className="px-4 py-2 font-bold text-slate-800">{branch.branchName}</td>
                            <td className="px-4 py-2 text-right text-slate-500 tabular-nums">{branch.target.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="px-4 py-2 text-right font-black text-emerald-600 tabular-nums">{branch.actual.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 1.5 & 1.6 Show Employees who hit the target */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      รหัสพนักงาน ({results.employees.reduce((acc, curr) => acc + curr.employees.length, 0)} แต้ม)
                    </h4>
                  </div>
                  <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left text-[12px] whitespace-nowrap">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                          <th className="px-4 py-2.5 text-center w-12">ลำดับ</th>
                          <th className="px-4 py-2.5">ชื่อสาขา</th>
                          <th className="px-4 py-2.5">รหัสพนักงาน</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {results.employees.length > 0 ? (
                          results.employees.map((group, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="px-4 py-2 text-center text-slate-400">{idx + 1}</td>
                              <td className="px-4 py-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-blue-700 bg-blue-50/50 text-[11px] font-medium border border-blue-100">
                                  {group.locationName}
                                </span>
                              </td>
                              <td className="px-4 py-2">
                                <div className="flex flex-wrap gap-1.5">
                                  {group.employees.map((empId, i) => (
                                    <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                                      {empId}
                                    </span>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="px-4 py-6 text-center text-slate-400 text-xs">
                              ไม่พบพนักงาน
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Save Report Section */}
            {saveReport && (
              <div className="mt-6 bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-inner">
                <h4 className="text-[13px] font-bold text-slate-800 mb-4">สรุปการบันทึก ({salesDate})</h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex flex-col items-center justify-center">
                    <span className="text-[10px] text-emerald-600 font-bold uppercase">สำเร็จ</span>
                    <span className="text-xl font-black text-emerald-700">{saveReport.success.length}</span>
                  </div>
                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 flex flex-col items-center justify-center">
                    <span className="text-[10px] text-rose-600 font-bold uppercase">ไม่พบรหัส / ผิดพลาด</span>
                    <span className="text-xl font-black text-rose-700">{saveReport.failed.length}</span>
                  </div>
                </div>

                {saveReport.success.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-bold text-slate-700 mb-2">รายชื่อผู้ได้รับคะแนน:</p>
                    <div className="max-h-40 overflow-y-auto bg-white border border-slate-200 rounded-lg">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-slate-50 border-b border-slate-100 sticky top-0">
                          <tr className="text-slate-500">
                            <th className="px-3 py-2">รหัสพนักงาน</th>
                            <th className="px-3 py-2">ชื่อ</th>
                            <th className="px-3 py-2">สาขา</th>
                            <th className="px-3 py-2 text-center">+Point</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {saveReport.success.map((res, i) => (
                            <tr key={i}>
                              <td className="px-3 py-1.5 font-medium text-slate-800">{res.employee_code}</td>
                              <td className="px-3 py-1.5 text-slate-600">{res.nickname}</td>
                              <td className="px-3 py-1.5 text-slate-600">{res.branch_name}</td>
                              <td className="px-3 py-1.5 text-center">
                                <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">+{res.addedPoints}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {saveReport.failed.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-700 mb-2">รายการที่ไม่สามารถบันทึกได้:</p>
                    <div className="max-h-40 overflow-y-auto bg-white border border-slate-200 rounded-lg">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-slate-50 border-b border-slate-100 sticky top-0">
                          <tr className="text-slate-500">
                            <th className="px-3 py-2">รหัสพนักงาน</th>
                            <th className="px-3 py-2">สาขา</th>
                            <th className="px-3 py-2">สาเหตุ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {saveReport.failed.map((res, i) => (
                            <tr key={i}>
                              <td className="px-3 py-1.5 font-medium text-slate-800">{res.employee_code}</td>
                              <td className="px-3 py-1.5 text-slate-600">{res.branch_name}</td>
                              <td className="px-3 py-1.5 text-rose-500">{res.reason}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
