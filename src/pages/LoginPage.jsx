import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, User, Lock, UserPlus, Briefcase, Building } from 'lucide-react';
import { authService } from '../services/authService';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    employee_code: '',
    password: '',
    nickname: '',
    position: '',
    organizational_unit: '',
    role: 'user',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        const response = await authService.register(formData);

        if (response.ok) {
          toast.success('ลงทะเบียนสำเร็จ! กรุณาเข้าสู่ระบบ');
          setIsRegister(false);
          setFormData({
            employee_code: formData.employee_code,
            password: '',
            nickname: '',
            position: '',
            organizational_unit: '',
            role: 'user',
          });
        } else {
          toast.error(response.message || 'ลงทะเบียนไม่สำเร็จ');
        }
      } else {
        const response = await authService.login(formData.employee_code, formData.password);

        if (response.ok) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          toast.success('เข้าสู่ระบบสำเร็จ!');

          if (response.user.role === 'admin') {
            navigate('/dashboard');
          } else {
            navigate('/');
          }
        } else {
          toast.error(response.message || 'เข้าสู่ระบบไม่สำเร็จ');
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-amber-50 px-4 py-5">
      <div className="w-full max-w-md rounded-2xl border border-emerald-100 bg-white/90 p-6 shadow-xl backdrop-blur">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-full mb-4">
            {isRegister ? <UserPlus className="h-8 w-8 text-white" /> : <LogIn className="h-8 w-8 text-white" />}
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {isRegister ? 'ลงทะเบียน' : 'เข้าสู่ระบบ'}
          </h2>
          {/* <p className="text-gray-600">
            {isRegister ? 'สร้างบัญชีพนักงานใหม่' : 'กรุณากรอกรหัสพนักงานและรหัสผ่าน'}
          </p> */}
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รหัสพนักงาน
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="employee_code"
                  value={formData.employee_code}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-emerald-200 bg-white rounded-lg text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  placeholder=""
                />
              </div>
            </div>

            {isRegister && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ชื่อเล่น
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="nickname"
                      value={formData.nickname}
                      onChange={handleChange}
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-emerald-200 bg-white rounded-lg text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      placeholder="กรอกชื่อเล่น"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ตำแหน่ง
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Briefcase className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-emerald-200 bg-white rounded-lg text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      placeholder="กรอกตำแหน่ง"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    หน่วยงาน
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="organizational_unit"
                      value={formData.organizational_unit}
                      onChange={handleChange}
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-emerald-200 bg-white rounded-lg text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      placeholder="กรอกหน่วยงาน"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ประเภทบัญชี
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="block w-full px-3 py-3 border border-emerald-200 bg-white rounded-lg text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </>
            )}

            {(isRegister && formData.role === 'admin') || !isRegister ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  รหัสผ่าน {!isRegister}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={isRegister && formData.role === 'admin'}
                    className="block w-full pl-10 pr-3 py-3 border border-emerald-200 bg-white rounded-lg text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    placeholder=""
                  />
                </div>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-emerald-600 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? (isRegister ? 'กำลังลงทะเบียน...' : 'กำลังเข้าสู่ระบบ...')
                : (isRegister ? 'ลงทะเบียน' : 'เข้าสู่ระบบ')
              }
            </button>
          </form>
        </div>

        {/* <div className="mt-4 text-center">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setFormData({
                employee_code: '',
                password: '',
                nickname: '',
                position: '',
                organizational_unit: '',
                role: 'user',
              });
            }}
            className="text-emerald-700 hover:text-emerald-900 font-medium text-sm underline-offset-2 hover:underline"
          >
            {isRegister ? 'มีบัญชีแล้ว? เข้าสู่ระบบ' : 'ยังไม่มีบัญชี? ลงทะเบียน'}
          </button>
        </div>

        {!isRegister && (
          <div className="mt-3 text-center text-sm text-gray-500">
            <p>หมายเหตุ: สำหรับพนักงาน Admin เท่านั้นที่ต้องใช้รหัสผ่าน</p>
          </div>
        )} */}

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-4">
          BrightMind HQ Management System
        </p>
      </div>
    </div>
  );
}
