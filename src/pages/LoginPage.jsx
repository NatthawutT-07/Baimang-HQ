import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, ArrowRight } from 'lucide-react';
import { authService } from '../services/authService';
import { toast } from 'react-toastify';

export default function LoginPage() {
  // --- States ---
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employee_code: '',
    password: '',
  });

  // --- Handlers ---
  const handleChange = (e) => { 
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
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
        toast.error(res.message || 'เข้าสู่ระบบไม่สำเร็จ');
      }
    } catch (error) {
      toast.error(error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f7f6] px-4 py-8 relative overflow-hidden bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-100/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-teal-100/30 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[440px] animate-in fade-in zoom-in-95 duration-500 relative z-10">
        
        {/* Login Card */}
        <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-[0_20px_50px_rgba(15,118,110,0.08)] border border-slate-100 p-8 sm:p-10 relative overflow-hidden transition-all duration-300 hover:shadow-[0_25px_60px_rgba(15,118,110,0.12)]">
          
          {/* Subtle top decoration */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />
          
          {/* Brand/Logo Area */}
          <div className="flex flex-col items-center text-center mb-2 mt-2">
            {/* <div className="w-20 h-20 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-4 transform hover:rotate-3 transition-transform duration-300">
              <img 
                src="/images/NEW_Logo.png" 
                alt="BAIMIANG Logo" 
                className="h-14 w-14 object-contain" 
              />
            </div> */}
            <h1 className="text-2xl font-black text-emerald-600 tracking-tight">
              BAIMIANG
            </h1>
            <p className="text-xs font-bold text-emerald-600 tracking-[0.2em] uppercase mt-0.5">
              Healthy Shop
            </p>
            
            <div className="h-[2px] w-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full my-4" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Employee Code Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                Username
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors duration-300" />
                <input
                  type="text"
                  name="employee_code"
                  value={formData.employee_code}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200/80 rounded-2xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 shadow-sm transition-all duration-300"
                  placeholder=""
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors duration-300" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200/80 rounded-2xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 shadow-sm transition-all duration-300"
                  placeholder=""
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-bold text-base shadow-lg shadow-emerald-600/20 hover:from-emerald-500 hover:to-teal-500 hover:shadow-xl hover:shadow-emerald-500/30 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer info */}
        <div className="mt-8 flex items-center justify-center gap-2 opacity-50 hover:opacity-80 transition-opacity duration-300">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em]">
            BrightMind HQ System
          </p>
        </div>
      </div>
    </div>
  );
}
