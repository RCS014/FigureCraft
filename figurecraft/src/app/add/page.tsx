// src/app/add/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function AddFigurePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    series: '',
    manufacturer: '',
    scale: '1/7',
    price: '',
    status: 'Pre-ordered',
    imageUrl: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // บันทึกข้อมูลที่ต้องการ
    console.log('Submitted Figure Data:', formData);
    router.push('/');
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-10">
      <div className="max-w-2xl mx-auto">
        {/* ปุ่มย้อนกลับ */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          กลับหน้าหลัก
        </button>

        {/* Form Container สไตล์ Google Forms โทนสีน้ำเงิน */}
        <div className="bg-blue-50 p-4 sm:p-6 rounded-2xl shadow-xl border border-blue-100 space-y-4">
          
          {/* Header Card */}
          <div className="bg-white rounded-lg border-t-8 border-blue-600 p-6 shadow-sm border-x border-b border-slate-200">
            <h1 className="text-2xl font-bold text-slate-900">เพิ่มข้อมูลฟิกเกอร์ใหม่</h1>
            <p className="text-sm text-slate-500 mt-2">
              กรอกรายละเอียดฟิกเกอร์เพื่อบันทึกลงในคอลเลกชันส่วนตัวของคุณ
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-red-500">
              * จำเป็นต้องกรอก
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Card 1: ชื่อฟิกเกอร์ */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 focus-within:border-l-4 focus-within:border-l-blue-600 transition-all">
              <label className="block font-medium text-slate-800 mb-2">
                ชื่อฟิกเกอร์ (Figure Name) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="คำตอบของคุณ"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border-b border-slate-300 focus:border-blue-600 focus:outline-none py-2 text-slate-800 bg-transparent transition-colors placeholder:text-slate-400"
              />
            </div>

            {/* Card 2: ซีรีส์ & ผู้ผลิต */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 focus-within:border-l-4 focus-within:border-l-blue-600 transition-all">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block font-medium text-slate-800 mb-2">ซีรีส์/มาจากเรื่อง</label>
                  <input
                    type="text"
                    placeholder="คำตอบของคุณ"
                    value={formData.series}
                    onChange={(e) => setFormData({ ...formData, series: e.target.value })}
                    className="w-full border-b border-slate-300 focus:border-blue-600 focus:outline-none py-2 text-slate-800 bg-transparent transition-colors placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-800 mb-2">ค่ายผู้ผลิต (Manufacturer)</label>
                  <input
                    type="text"
                    placeholder="คำตอบของคุณ"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="w-full border-b border-slate-300 focus:border-blue-600 focus:outline-none py-2 text-slate-800 bg-transparent transition-colors placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Card 3: สเกล */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 focus-within:border-l-4 focus-within:border-l-blue-600 transition-all">
              <label className="block font-medium text-slate-800 mb-3">สเกล (Scale)</label>
              <div className="space-y-2">
                {['1/4', '1/6', '1/7', '1/8', 'Non-Scale (Nendoroid/Pop Up)'].map((scaleOption) => (
                  <label key={scaleOption} className="flex items-center gap-3 cursor-pointer py-1">
                    <input
                      type="radio"
                      name="scale"
                      value={scaleOption}
                      checked={formData.scale === scaleOption}
                      onChange={(e) => setFormData({ ...formData, scale: e.target.value })}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span className="text-sm text-slate-700">{scaleOption}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Card 4: ราคา & สถานะ */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 focus-within:border-l-4 focus-within:border-l-blue-600 transition-all">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block font-medium text-slate-800 mb-2">ราคา (บาท)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full border-b border-slate-300 focus:border-blue-600 focus:outline-none py-2 text-slate-800 bg-transparent transition-colors placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-800 mb-2">สถานะการสะสม</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full border-b border-slate-300 focus:border-blue-600 focus:outline-none py-2 text-slate-800 bg-transparent transition-colors cursor-pointer"
                  >
                    <option value="Pre-ordered">Pre-ordered (สั่งจองแล้ว)</option>
                    <option value="In Stock">In Stock (ได้รับสินค้าแล้ว)</option>
                    <option value="Wishlist">Wishlist (อยากได้)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Card 5: รูปภาพ URL */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 focus-within:border-l-4 focus-within:border-l-blue-600 transition-all">
              <label className="block font-medium text-slate-800 mb-2">ลิงก์รูปภาพ (Image URL)</label>
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full border-b border-slate-300 focus:border-blue-600 focus:outline-none py-2 text-slate-800 bg-transparent transition-colors placeholder:text-slate-400"
              />
            </div>

            {/* Form Footer Action */}
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
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-md shadow transition-all active:scale-95 cursor-pointer"
              >
                ส่งข้อมูล (Submit)
              </button>
            </div>
          </form>

        </div>
      </div>
    </main>
  );
}