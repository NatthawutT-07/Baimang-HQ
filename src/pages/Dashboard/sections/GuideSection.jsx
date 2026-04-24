import { Info, User, ShieldAlert, CheckCircle2, Clock, Image as ImageIcon, Gift, Calendar, Zap } from 'lucide-react';

export default function GuideSection() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
          <Info className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 !m-0">คู่มือและกฎเกณฑ์การใช้งานระบบ</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Normal Employee Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 px-1">
            <User className="w-4 h-4 text-slate-400" />
            <h3 className="text-base font-bold text-slate-700 !m-0">ส่วน: พนักงานปกติ</h3>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
            {/* Rule 1 */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-slate-800">1. ระบบบันทึกยอดขายรายวัน</h4>
                <p className="text-[13px] text-slate-600 leading-relaxed">
                  พนักงานสามารถบันทึกยอดขายได้ <span className="font-bold text-emerald-600">วันละ 1 ครั้ง ต่อรหัสพนักงานเท่านั้น</span>
                  ระบบจะไม่อนุญาตให้บันทึกซ้ำในวันเดียวกัน เมื่อบันทึกสำเร็จแล้วจะไม่สามารถแก้ไขได้
                </p>
                <div className="flex items-center gap-2 mt-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-[11px] text-slate-500">ระบบจะรีเซ็ตสิทธิ์การบันทึกใหม่ทุกเวลา <span className="font-bold">00:00 น. (เที่ยงคืน)</span> ของทุกวัน</span>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Rule 2 */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <Gift className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-slate-800">2. ระบบแลกรางวัลและคะแนน</h4>
                <p className="text-[13px] text-slate-600 leading-relaxed">
                  เมื่อพนักงานกดแลกรางวัลสำเร็จ <span className="font-bold text-rose-600">คะแนนจะถูกหักออกจากระบบทันที</span>
                </p>
                <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                    สำหรับการส่งมอบของรางวัล: เมื่อมีการแลกรางวัลเกิดขึ้นในระบบ ผู้ดูแลระบบ (Admin) จะเป็นผู้ดำเนินการตรวจสอบและส่งมอบรางวัลให้แก่พนักงานด้วยตนเอง
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 px-1">
            <ShieldAlert className="w-4 h-4 text-slate-400" />
            <h3 className="text-base font-bold text-slate-700 !m-0">ส่วน: ผู้ดูแลระบบ (Admin)</h3>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center shrink-0 border border-white/10">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white">การจัดการรูปภาพคูปอง</h4>
                <p className="text-[13px] text-slate-400 leading-relaxed">
                  หากมีความประสงค์จะ <span className="text-white font-medium">เปลี่ยนรูปภาพคูปองหรือของรางวัลใหม่</span>
                </p>
                <div className="mt-2 py-2.5 px-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <p className="text-[12px] text-blue-400 font-bold !m-0 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                    แจ้งผ่านผู้พัฒนาระบบ (Dev) เพื่อแก้ไขรูปภาพ
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Future Updates Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 !m-0">อัปเดตระบบในอนาคต</h4>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex gap-3">
                <div className="mt-0.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-[12px] font-bold text-slate-700">กำหนดการ: 1 พฤษภาคม 2569</p>
                  <p className="text-[12px] text-slate-500 leading-relaxed">
                    ระบบจะมีการเพิ่ม <span className="font-semibold text-slate-700 underline decoration-amber-300">Delay สำหรับ Scoreboard</span> โดยข้อมูลยอดขายรวมจะทำการอัปเดตใหม่ในทุกๆ <span className="font-bold text-slate-800">5 นาที</span> เพื่อลดภาระการทำงานของเซิร์ฟเวอร์
                  </p>
                </div>
              </div>

              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex gap-3">
                <div className="mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-[12px] font-bold text-slate-700">การเลือกวันที่บันทึกยอดขาย</p>
                  <p className="text-[12px] text-slate-500 leading-relaxed">
                    ระบบกำหนดให้บันทึกยอดขายได้ <span className="font-bold text-slate-700">เฉพาะวันปัจจุบันเท่านั้น</span> และบันทึกได้ <span className="font-bold text-slate-700">วันละ 1 ครั้งต่อคน</span> โดยไม่สามารถเลือกบันทึกย้อนหลังหรือล่วงหน้าได้
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
