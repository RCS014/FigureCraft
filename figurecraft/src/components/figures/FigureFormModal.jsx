// src/components/figures/FigureFormModal.jsx
'use client';

import { useState } from 'react';

export default function FigureFormModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    figure_name: '',
    manufacturer_name: '',
    merchant_name: '',
    price: '',
    purchase_date: '',
    status: 'Pre-ordered',
    assembly_status: 'unbuilt',
  });

  // 🟢 1. State สำหรับไฟล์รูปภาพ
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

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
    
    // 🟢 2. ส่งข้อมูลฟอร์มพร้อมไฟล์รูปภาพออกไปให้ Component แม่ไปจัดการต่อ
    onSubmit({
      ...formData,
      imageFile: imageFile, 
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center p-4 sm:p-6 md:p-10">
      <div className="w-full max-w-2xl my-auto">
        <div className="bg-[#f0ebf8] p-4 sm:p-6 rounded-2xl shadow-2xl border border-purple-100 max-h-[90vh] overflow-y-auto space-y-4">
          
          <div className="bg-white rounded-lg border-t-10px border-purple-700 p-6 shadow-sm border-x border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900">เพิ่มข้อมูลฟิกเกอร์ใหม่</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* ... ฟิลด์อื่นๆ เช่น figure_name, price, status ... */}

            {/* 🟢 3. Input อัปโหลดรูปภาพ */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
              <label className="block font-medium text-slate-800 mb-2">รูปภาพปก (Cover Image)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
              />
              {previewUrl && (
                <div className="mt-3">
                  <img src={previewUrl} alt="Preview" className="w-32 h-32 object-cover rounded-lg border" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button type="button" onClick={onClose} className="px-5 py-2 text-slate-600">ยกเลิก</button>
              <button type="submit" className="bg-purple-700 text-white px-6 py-2.5 rounded-md">ส่งข้อมูล</button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}