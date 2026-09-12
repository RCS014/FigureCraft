// src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { LogIn, UserPlus, Lock, Mail, User, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isSignUp) {
        // 1. สมัครสมาชิกผ่าน Supabase Auth
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
            },
          },
        });

        if (error) throw error;

        // บันทึกข้อมูลโปรไฟล์เริ่มต้นลงตาราง profiles
        if (data.user) {
          await supabase.from('profiles').insert([
            {
              id: data.user.id,
              name: formData.name,
            },
          ]);
        }

        setSuccessMsg('สมัครสมาชิกสำเร็จ! หากตั้งค่าให้ยืนยันอีเมล กรุณาตรวจสอบอีเมลก่อนเข้าสู่ระบบ');
      } else {
        // 2. เข้าสู่ระบบด้วย Email และ Password
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        // เมื่อล็อกอินสำเร็จ นำทางไปที่หน้าหลัก
        router.push('/');
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 p-6 text-white text-center">
          <h1 className="text-2xl font-bold">FigureCraft</h1>
          <p className="text-blue-100 text-sm mt-1">
            {isSignUp ? 'สร้างบัญชีใหม่เพื่อจัดการคอลเลกชัน' : 'เข้าสู่ระบบเพื่อจัดการคอลเลกชันฟิกเกอร์'}
          </p>
        </div>

        {/* Form Content */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ชื่อผู้ใช้ (เฉพาะโหมดสมัครสมาชิก) */}
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อแสดง (Name)</label>
                <div className="relative">
                  <User className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Collector Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 text-slate-800"
                  />
                </div>
              </div>
            )}

            {/* อีเมล */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">อีเมล (Email)</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 text-slate-800"
                />
              </div>
            </div>

            {/* รหัสผ่าน */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">รหัสผ่าน (Password)</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 text-slate-800"
                />
              </div>
            </div>

            {/* ปุ่มกดส่งข้อมูล */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2.5 rounded-lg shadow transition-colors cursor-pointer mt-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isSignUp ? (
                <>
                  <UserPlus className="w-5 h-5" /> สมัครสมาชิก
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" /> เข้าสู่ระบบ
                </>
              )}
            </button>
          </form>

          {/* ปุ่มสลับโหมด LogIn / SignUp */}
          <div className="mt-6 text-center border-t border-slate-200 pt-4 text-sm text-slate-600">
            {isSignUp ? (
              <p>
                มีบัญชีอยู่แล้ว?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-blue-600 font-semibold hover:underline cursor-pointer"
                >
                  เข้าสู่ระบบ
                </button>
              </p>
            ) : (
              <p>
                ยังไม่มีบัญชี?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-blue-600 font-semibold hover:underline cursor-pointer"
                >
                  สมัครสมาชิก
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}