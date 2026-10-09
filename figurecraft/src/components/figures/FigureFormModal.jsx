// src/components/figures/FigureFormModal.jsx
'use client';

import { useState, useEffect } from 'react'; // 🟢 1. Import useEffect เพิ่ม
import { createClient } from '@/utils/supabase/client'; // 🟢 2. Import Supabase Client

export default function FigureFormModal({ isOpen, onClose, onSubmit }) {
  const supabase = createClient();

  // 🟢 3. เพิ่ม State เก็บหมวดหมู่
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    figure_name: '',
    manufacturer_name: '',
    merchant_name: '',
    category_id: '', // 🟢 ใช้ category_id
    price: '',
    purchase_date: '',
    status: 'Pre-ordered',
    assembly_status: 'unbuilt',
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // 🟢 4. เพิ่ม useEffect ดึงหมวดหมู่จาก Supabase เมื่อเปิด Modal
  useEffect(() => {
    if (!isOpen) return;

    async function fetchCategories() {
      const { data, error } = await supabase
        .from('categories')
        .select('id, code, name')
        .order('id', { ascending: true });

      if (!error && data) {
        setCategories(data);
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, category_id: data[0].id }));
        }
      }
    }
    fetchCategories();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      imageFile: imageFile,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 mb-4">เพิ่มข้อมูลฟิกเกอร์ใหม่</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อโมเดล / ฟิกเกอร์ *</label>
            <input
              type="text"
              required
              value={formData.figure_name}
              onChange={(e) => setFormData({ ...formData, figure_name: e.target.value })}
              className="w-full border p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="กรอกชื่อโมเดล"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ผู้ผลิต / ค่าย</label>
              <input
                type="text"
                value={formData.manufacturer_name}
                onChange={(e) => setFormData({ ...formData, manufacturer_name: e.target.value })}
                className="w-full border p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 🟢 5. Dropdown Dynamic ใน Modal */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">หมวดหมู่ / เกรด</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full border p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ราคา (บาท)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full border p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">สถานะสินค้า</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full border p-2 rounded-lg text-sm bg-white cursor-pointer"
              >
                <option value="Pre-ordered">Pre-ordered</option>
                <option value="In Stock">In Stock</option>
                <option value="Wishlist">Wishlist</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">รูปภาพปก</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-xs text-slate-600 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 cursor-pointer"
            />
            {previewUrl && (
              <img src={previewUrl} alt="Preview" className="w-20 h-20 object-cover rounded mt-2 border" />
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium cursor-pointer"
            >
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}