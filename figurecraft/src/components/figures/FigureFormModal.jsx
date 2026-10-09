// src/components/figures/FigureFormModal.jsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function FigureFormModal({ isOpen, onClose, onSubmit }) {
  const supabase = createClient();

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    figure_name: '',
    manufacturer_name: '',
    merchant_name: '',
    category_id: '',
    price: '',
    purchase_date: '',
    status: 'Pre-ordered',
    assembly_status: 'unbuilt',
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    async function fetchCategories() {
      const { data, error } = await supabase
        .from('categories')
        .select('id, code, name')
        .order('id', { ascending: true });

      if (!error && data) {
        setCategories(data);
        if (data.length > 0 && !formData.category_id) {
          setFormData((prev) => ({ ...prev, category_id: String(data[0].id) }));
        }
      }
    }

    fetchCategories();
  }, [isOpen, supabase]);

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
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-bold text-slate-900">เพิ่มฟิกเกอร์ใหม่</h2>
          <button
            onClick={onClose}
            type="button"
            className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              ชื่อฟิกเกอร์ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="กรอกชื่อฟิกเกอร์"
              value={formData.figure_name}
              onChange={(e) => setFormData({ ...formData, figure_name: e.target.value })}
              className="w-full border border-slate-300 p-2.5 rounded-lg text-sm font-medium text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">ค่าย/ผู้ผลิต</label>
              <input
                type="text"
                placeholder="เช่น Bandai"
                value={formData.manufacturer_name}
                onChange={(e) => setFormData({ ...formData, manufacturer_name: e.target.value })}
                className="w-full border border-slate-300 p-2.5 rounded-lg text-sm font-medium text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">หมวดหมู่</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full border border-slate-300 p-2.5 rounded-lg text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="text-slate-900 bg-white">
                    {cat.code} - {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">ร้านค้าที่ซื้อ</label>
              <input
                type="text"
                placeholder="ชื่อร้านค้า"
                value={formData.merchant_name}
                onChange={(e) => setFormData({ ...formData, merchant_name: e.target.value })}
                className="w-full border border-slate-300 p-2.5 rounded-lg text-sm font-medium text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">ราคา (บาท)</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full border border-slate-300 p-2.5 rounded-lg text-sm font-medium text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">วันที่ซื้อ</label>
              <input
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                className="w-full border border-slate-300 p-2.5 rounded-lg text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">สถานะสินค้า</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full border border-slate-300 p-2.5 rounded-lg text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="Pre-ordered">Pre-ordered</option>
                <option value="In Stock">In Stock</option>
                <option value="Wishlist">Wishlist</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">รูปภาพปก</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-xs text-slate-700 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 cursor-pointer"
            />
            {previewUrl && (
              <img src={previewUrl} alt="Preview" className="w-20 h-20 object-cover rounded-lg mt-2 border border-slate-200" />
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition-colors cursor-pointer"
            >
              บันทึกข้อมูล
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}