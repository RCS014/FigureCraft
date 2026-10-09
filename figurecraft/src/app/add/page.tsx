// src/app/add/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function AddFigurePage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Dynamic Categories State
  const [categories, setCategories] = useState<{ id: number; code: string; name: string }[]>([]);

  const [formData, setFormData] = useState({
    figure_name: '',
    manufacturer_name: '',
    category_id: '',
    price: '',
    status: 'Pre-ordered',
    assembly_status: 'unbuilt',
    purchase_date: '',
    merchant_name: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // ดึงหมวดหมู่จาก Supabase
  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from('categories')
        .select('id, code, name')
        .order('id', { ascending: true });

      if (!error && data) {
        setCategories(data);
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, category_id: String(data[0].id) }));
        }
      }
    }
    fetchCategories();
  }, [supabase]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('กรุณาเข้าสู่ระบบก่อนทำการเพิ่มข้อมูล');
      }

      let imageUrl = '';

      // 🟢 1. อัปโหลดรูปภาพไปยัง Bucket 'figure-covers'
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('figure-covers') // 👈 ใช้ Bucket 'figure-covers'
          .upload(fileName, imageFile);

        if (uploadError) {
          throw new Error(`อัปโหลดรูปภาพไม่สำเร็จ: ${uploadError.message}`);
        }

        // ดึง Public URL จาก Bucket 'figure-covers'
        const { data: urlData } = supabase.storage
          .from('figure-covers') // 👈 ใช้ Bucket 'figure-covers'
          .getPublicUrl(fileName);

        imageUrl = urlData.publicUrl;
      }

      // 🟢 2. บันทึกข้อมูลเข้า Database
      const { error: insertError } = await supabase.from('figure_items').insert({
        user_id: user.id,
        figure_name: formData.figure_name,
        manufacturer_name: formData.manufacturer_name || null,
        merchant_name: formData.merchant_name || null,
        category_id: formData.category_id ? Number(formData.category_id) : null,
        price: formData.price ? Number(formData.price) : 0,
        status: formData.status,
        assembly_status: formData.assembly_status,
        purchase_date: formData.purchase_date || null,
        image_url: imageUrl || null,
      });

      if (insertError) {
        throw new Error(`บันทึกข้อมูลไม่สำเร็จ: ${insertError.message}`);
      }

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6 font-medium cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> ย้อนกลับ
      </button>

      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">เพิ่มข้อมูลฟิกเกอร์ใหม่</h1>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ชื่อฟิกเกอร์ */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              ชื่อฟิกเกอร์ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="เช่น RG 1/144 RX-78-2 Gundam Ver.2.0"
              value={formData.figure_name}
              onChange={(e) => setFormData({ ...formData, figure_name: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-medium text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* ค่าย / ผู้ผลิต */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">ค่าย / ผู้ผลิต</label>
              <input
                type="text"
                placeholder="เช่น Bandai, Good Smile"
                value={formData.manufacturer_name}
                onChange={(e) => setFormData({ ...formData, manufacturer_name: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-medium text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* หมวดหมู่ */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">หมวดหมู่</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="text-slate-900 bg-white">
                    {cat.code} - {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* ร้านค้า */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">ร้านค้าที่ซื้อ</label>
              <input
                type="text"
                placeholder="เช่น Shopee, Yumeya"
                value={formData.merchant_name}
                onChange={(e) => setFormData({ ...formData, merchant_name: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-medium text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* ราคา */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">ราคา (บาท)</label>
              <input
                type="number"
                min="0"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-medium text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* วันที่ซื้อ */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">วันที่สั่งซื้อ / ได้รับ</label>
              <input
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
              />
            </div>

            {/* สถานะสินค้า */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">สถานะสินค้า</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
              >
                <option value="Pre-ordered">Pre-ordered</option>
                <option value="In Stock">In Stock</option>
                <option value="Wishlist">Wishlist</option>
              </select>
            </div>

            {/* สถานะการต่อ */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">สถานะการต่อ</label>
              <select
                value={formData.assembly_status}
                onChange={(e) => setFormData({ ...formData, assembly_status: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
              >
                <option value="unbuilt">ยังไม่ได้ต่อ</option>
                <option value="built">ต่อเสร็จแล้ว</option>
              </select>
            </div>
          </div>

          {/* อัปโหลดรูปภาพ */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <label className="block text-sm font-semibold text-slate-800 mb-2">รูปภาพปก (Cover Image)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-slate-700 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
            {previewUrl && (
              <div className="mt-4">
                <p className="text-xs text-slate-500 mb-2">ตัวอย่างรูปภาพ:</p>
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border border-slate-300 shadow-sm"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium px-6 py-2.5 rounded-lg shadow transition-all cursor-pointer"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'กำลังอัปโหลดและบันทึก...' : 'บันทึกข้อมูล'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}