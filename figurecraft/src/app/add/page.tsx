// src/app/add/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function AddFigurePage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    figure_name: '',
    manufacturer_name: '',
    price: '',
    status: 'Pre-ordered',
    assembly_status: 'unbuilt', // 🟢 เพิ่มสถานะการต่อเริ่มต้น
    cover_image: '',
    purchase_date: '',
    merchant_name: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('กรุณาเข้าสู่ระบบก่อนทำการเพิ่มข้อมูล');
      }

      const { error } = await supabase.from('figure_items').insert([
        {
          user_id: user.id,
          figure_name: formData.figure_name,
          manufacturer_name: formData.manufacturer_name || null,
          price: formData.price ? parseFloat(formData.price) : null,
          status: formData.status,
          assembly_status: formData.assembly_status, // 🟢 ส่งค่า assembly_status ไป Supabase
          cover_image: formData.cover_image || null,
          purchase_date: formData.purchase_date || null,
          merchant_name: formData.merchant_name || null,
        },
      ]);

      if (error) throw error;

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-10">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          กลับหน้าหลัก
        </button>

        <div className="bg-blue-50 p-4 sm:p-6 rounded-2xl shadow-xl border border-blue-100 space-y-4">
          <div className="bg-white rounded-lg border-t-8 border-blue-600 p-6 shadow-sm border-x border-b border-slate-200">
            <h1 className="text-2xl font-bold text-slate-900">เพิ่มข้อมูลฟิกเกอร์ใหม่</h1>
            <p className="text-sm text-slate-500 mt-2">
              กรอกรายละเอียดฟิกเกอร์เพื่อบันทึกลงในระบบ Supabase
            </p>
            {errorMsg && (
              <p className="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                {errorMsg}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ชื่อฟิกเกอร์ */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 focus-within:border-l-4 focus-within:border-l-blue-600">
              <label className="block font-medium text-slate-800 mb-2">
                ชื่อฟิกเกอร์ (Figure Name) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="คำตอบของคุณ"
                value={formData.figure_name}
                onChange={(e) => setFormData({ ...formData, figure_name: e.target.value })}
                className="w-full border-b border-slate-300 focus:border-blue-600 focus:outline-none py-2 text-slate-800 bg-transparent placeholder:text-slate-400"
              />
            </div>

            {/* ค่ายผู้ผลิต & ร้านค้า */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 focus-within:border-l-4 focus-within:border-l-blue-600">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block font-medium text-slate-800 mb-2">ค่ายผู้ผลิต (Manufacturer)</label>
                  <input
                    type="text"
                    placeholder="เช่น Good Smile Company"
                    value={formData.manufacturer_name}
                    onChange={(e) => setFormData({ ...formData, manufacturer_name: e.target.value })}
                    className="w-full border-b border-slate-300 focus:border-blue-600 focus:outline-none py-2 text-slate-800 bg-transparent placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-800 mb-2">ร้านที่ซื้อ/สั่งจอง (Merchant)</label>
                  <input
                    type="text"
                    placeholder="เช่น AmiAmi, Tokyo Otaku Mode"
                    value={formData.merchant_name}
                    onChange={(e) => setFormData({ ...formData, merchant_name: e.target.value })}
                    className="w-full border-b border-slate-300 focus:border-blue-600 focus:outline-none py-2 text-slate-800 bg-transparent placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* ราคา & วันที่สั่งซื้อ */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 focus-within:border-l-4 focus-within:border-l-blue-600">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block font-medium text-slate-800 mb-2">ราคา (บาท)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full border-b border-slate-300 focus:border-blue-600 focus:outline-none py-2 text-slate-800 bg-transparent placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-800 mb-2">วันที่สั่งซื้อ (Purchase Date)</label>
                  <input
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                    className="w-full border-b border-slate-300 focus:border-blue-600 focus:outline-none py-2 text-slate-800 bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* 🟢 สถานะการครอบครอง & สถานะการต่อ */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 focus-within:border-l-4 focus-within:border-l-blue-600">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block font-medium text-slate-800 mb-2">สถานะสินค้า/สั่งซื้อ</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full border-b border-slate-300 focus:border-blue-600 focus:outline-none py-2 text-slate-800 bg-transparent cursor-pointer"
                  >
                    <option value="Pre-ordered">Pre-ordered (สั่งจองแล้ว)</option>
                    <option value="In Stock">In Stock (ได้รับสินค้าแล้ว)</option>
                    <option value="Wishlist">Wishlist (อยากได้)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-800 mb-2">สถานะการประกอบ/การต่อ</label>
                  <select
                    value={formData.assembly_status}
                    onChange={(e) => setFormData({ ...formData, assembly_status: e.target.value })}
                    className="w-full border-b border-slate-300 focus:border-blue-600 focus:outline-none py-2 text-slate-800 bg-transparent cursor-pointer"
                  >
                    <option value="unbuilt">ยังไม่ได้ต่อ (Unbuilt)</option>
                    <option value="built">ต่อเสร็จแล้ว (Built)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ลิงก์รูปภาพ */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 focus-within:border-l-4 focus-within:border-l-blue-600">
              <label className="block font-medium text-slate-800 mb-2">ลิงก์รูปภาพ (Cover Image URL)</label>
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={formData.cover_image}
                onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                className="w-full border-b border-slate-300 focus:border-blue-600 focus:outline-none py-2 text-slate-800 bg-transparent placeholder:text-slate-400"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="px-5 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium px-6 py-2.5 rounded-md shadow transition-all active:scale-95 cursor-pointer"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'กำลังบันทึก...' : 'ส่งข้อมูล (Submit)'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}