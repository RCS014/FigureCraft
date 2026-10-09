// src/app/add/page.tsx
'use client';

import { useState, useEffect } from 'react'; // 🟢 1. Import useEffect เพิ่มเติม
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Upload } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function AddFigurePage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 🟢 2. เพิ่ม State สำหรับเก็บหมวดหมู่ที่ดึงมาจากฐานข้อมูล
  const [categories, setCategories] = useState<{ id: number; code: string; name: string }[]>([]);

  const [formData, setFormData] = useState({
    figure_name: '',
    manufacturer_name: '',
    category_id: '', // 🟢 เปลี่ยนมาเก็บเป็น category_id (BIGINT)
    price: '',
    status: 'Pre-ordered',
    assembly_status: 'unbuilt',
    purchase_date: '',
    merchant_name: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // 🟢 3. เพิ่ม useEffect ดึงหมวดหมู่ Dynamic จาก Supabase ตาราง categories
  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from('categories')
        .select('id, code, name')
        .order('id', { ascending: true });

      if (!error && data) {
        setCategories(data);
        if (data.length > 0) {
          // ตั้งค่า default เป็นหมวดหมู่แรกที่ดึงมาได้
          setFormData((prev) => ({ ...prev, category_id: data[0].id.toString() }));
        }
      }
    }
    fetchCategories();
  }, []);

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
        setErrorMsg('กรุณาเข้าสู่ระบบก่อนทำการเพิ่มข้อมูล');
        setLoading(false);
        return;
      }

      let publicUrl = '';

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('figures')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('figures')
          .getPublicUrl(filePath);

        publicUrl = publicUrlData.publicUrl;
      }

      const { error: insertError } = await supabase
        .from('figure_items')
        .insert([
          {
            user_id: user.id,
            figure_name: formData.figure_name,
            manufacturer_name: formData.manufacturer_name,
            category_id: formData.category_id ? parseInt(formData.category_id) : null, // 🟢 บันทึก category_id
            price: formData.price ? parseFloat(formData.price) : 0,
            status: formData.status,
            assembly_status: formData.assembly_status,
            purchase_date: formData.purchase_date || null,
            merchant_name: formData.merchant_name || null,
            image_url: publicUrl,
          },
        ]);

      if (insertError) throw insertError;

      router.push('/');
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการเพิ่มข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-slate-50 min-h-screen">
      <button
        onClick={() => router.back()}
        className="flex items-center text-slate-600 hover:text-slate-900 mb-6 font-medium cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5 mr-1" /> ย้อนกลับ
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">เพิ่มฟิกเกอร์ / กันพลาใหม่</h1>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              ชื่อฟิกเกอร์ / โมเดล <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.figure_name}
              onChange={(e) => setFormData({ ...formData, figure_name: e.target.value })}
              placeholder="เช่น RX-78-2 Gundam"
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ค่าย / ผู้ผลิต</label>
              <input
                type="text"
                value={formData.manufacturer_name}
                onChange={(e) => setFormData({ ...formData, manufacturer_name: e.target.value })}
                placeholder="เช่น Bandai, Kotobukiya"
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* 🟢 4. จุดวาง Dropdown Dynamic */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">หมวดหมู่ / เกรด</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white cursor-pointer"
              >
                {categories.length === 0 ? (
                  <option value="">กำลังโหลดหมวดหมู่...</option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ราคา (บาท)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">สถานะสินค้า</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white cursor-pointer"
              >
                <option value="Pre-ordered">Pre-ordered</option>
                <option value="In Stock">In Stock (มีของพร้อมต่อ)</option>
                <option value="Wishlist">Wishlist (อยากได้)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">สถานะการประกอบ</label>
              <select
                value={formData.assembly_status}
                onChange={(e) => setFormData({ ...formData, assembly_status: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white cursor-pointer"
              >
                <option value="unbuilt">ยังไม่ได้ต่อ</option>
                <option value="built">ต่อเสร็จแล้ว</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ร้านค้าที่ซื้อ</label>
              <input
                type="text"
                value={formData.merchant_name}
                onChange={(e) => setFormData({ ...formData, merchant_name: e.target.value })}
                placeholder="เช่น Shopee, ร้าน Gunpla Shop"
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">รูปภาพปก</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-slate-600 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
            {previewUrl && (
              <div className="mt-4">
                <p className="text-xs text-slate-500 mb-2">ตัวอย่างรูปภาพ:</p>
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border border-slate-200 shadow-sm"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium px-6 py-2.5 rounded-lg shadow transition-all cursor-pointer"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'กำลังบันทึก...' : 'บันทึกฟิกเกอร์'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}