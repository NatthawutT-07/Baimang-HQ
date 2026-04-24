import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, User, Lock, UserPlus, Briefcase, Building, ArrowRight } from 'lucide-react';
import { authService } from '../services/authService';
import { toast } from 'react-toastify';

export default function LoginPage() {
  // --- States ---
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employee_code: '',
    password: '',
    nickname: '',
    position: '',
    organizational_unit: '',
    role: 'user',
  });

  // --- Handlers ---
  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        const res = await authService.register(formData);
        if (res.ok) {
          toast.success('ลงทะเบียนสำเร็จ! กรุณาเข้าสู่ระบบ');
          setIsRegister(false);
        } else {
          toast.error(res.message || 'ลงทะเบียนไม่สำเร็จ');
        }
      } else {
        const res = await authService.login(formData.employee_code, formData.password);
        if (res.ok) {
          toast.success('เข้าสู่ระบบสำเร็จ!');
          const user = authService.getCurrentUser();
          if (user?.role === 'admin') {
            navigate('/dashboard');
          } else {
            navigate('/');
          }
        } else {
          // If the request was successful but ok: false (standardized failure)
          toast.error(res.message || 'เข้าสู่ระบบไม่สำเร็จ');
        }
      }
    } catch (error) {
      // If the request failed (4xx/5xx) - use the standardized message from interceptor
      toast.error(error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  // --- Styles ---
  const inputCls = "w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all";
  const labelCls = "block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4 py-8 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]">
      <div className="w-full max-w-[440px] animate-in fade-in zoom-in-95 duration-500">
        
        {/* Logo/Brand Area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-600 rounded-[2rem] shadow-xl shadow-emerald-200 mb-6 rotate-3 hover:rotate-0 transition-transform duration-300">
            {isRegister ? <UserPlus className="h-10 w-10 text-white" /> : <LogIn className="h-10 w-10 text-white" />}
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            {isRegister ? 'สร้างบัญชีใหม่' : 'ยินดีต้อนรับกลับมา'}
          </h1>
          <p className="text-slate-400 text-sm mt-2 font-medium">
            {isRegister ? 'กรอกรายละเอียดเพื่อเริ่มต้นใช้งาน' : 'เข้าสู่ระบบบริหารจัดการ HQ'}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 p-8 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50" />
          
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div>
              <label className={labelCls}>รหัสพนักงาน</label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="text"
                  name="employee_code"
                  value={formData.employee_code}
                  onChange={handleChange}
                  required
                  className={inputCls}
                  placeholder=""
                />
              </div>
            </div>

            {isRegister && (
              <div className="space-y-5 animate-in slide-in-from-top-4 duration-300">
                <div>
                  <label className={labelCls}>ชื่อเล่น</label>
                  <div className="relative group">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type="text"
                      name="nickname"
                      value={formData.nickname}
                      onChange={handleChange}
                      required
                      className={inputCls}
                      placeholder="ระบุชื่อเล่น"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>ตำแหน่ง</label>
                    <div className="relative group">
                      <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                      <input
                        type="text"
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                        required
                        className={inputCls}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>หน่วยงาน</label>
                    <div className="relative group">
                      <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                      <input
                        type="text"
                        name="organizational_unit"
                        value={formData.organizational_unit}
                        onChange={handleChange}
                        required
                        className={inputCls}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>ประเภทบัญชี</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['user', 'admin'].map(role => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, role }))}
                        className={`py-3 rounded-xl text-xs font-bold border transition-all ${formData.role === role
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                          }`}
                      >
                        {role.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {(!isRegister || formData.role === 'admin') && (
              <div className="animate-in slide-in-from-top-4 duration-300">
                <label className={labelCls}>รหัสผ่าน</label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={!isRegister || formData.role === 'admin'}
                    className={inputCls}
                    placeholder=""
                  />
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-emerald-600 text-white rounded-2xl font-bold text-base shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:shadow-emerald-300 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isRegister ? 'ยืนยันการลงทะเบียน' : 'เข้าสู่ระบบ'}</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer info */}
        <div className="mt-8 flex items-center justify-center gap-6 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">BrightMind HQ System v2.0</p>
        </div>
      </div>
    </div>
  );
}
