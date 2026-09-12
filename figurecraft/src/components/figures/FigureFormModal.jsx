'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function FigureFormModal({ userId, isOpen, onClose, onRefresh }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    figure_name: '',
    merchant_name: '',
    manufacturer_name: '',
    status: 'UNBUILT',
    purchase_date: '',
  })
  const [imageFile, setImageFile] = useState(null)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let imageUrl = null

      // 1. อัปโหลดรูปภาพเข้า Supabase Storage (ถ้ามีเลือกไฟล์)
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const filePath = `${userId}/${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('figure-covers')
          .upload(filePath, imageFile)

        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase.storage
          .from('figure-covers')
          .getPublicUrl(filePath)

        imageUrl = publicUrlData.publicUrl
      }

      // 2. บันทึกข้อมูลลงตาราง figure_items
      const { error: insertError } = await supabase
        .from('figure_items')
        .insert([
          {
            ...formData,
            user_id: userId,
            cover_image: imageUrl,
          },
        ])

      if (insertError) throw insertError

      onRefresh()
      onClose()
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">เพิ่มฟิกเกอร์ใหม่</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input 
            type="text" placeholder="ชื่อฟิกเกอร์/โมเดล *" required
            className="w-full border p-2 rounded text-sm"
            onChange={(e) => setFormData({...formData, figure_name: e.target.value})}
          />
          <div className="grid grid-cols-2 gap-2">
            <input 
              type="text" placeholder="ค่ายผู้ผลิต"
              className="border p-2 rounded text-sm"
              onChange={(e) => setFormData({...formData, manufacturer_name: e.target.value})}
            />
            <input 
              type="text" placeholder="ร้านค้าที่ซื้อ"
              className="border p-2 rounded text-sm"
              onChange={(e) => setFormData({...formData, merchant_name: e.target.value})}
            />
          </div>
          <select 
            className="w-full border p-2 rounded text-sm"
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
          >
            <option value="IN_TRANSIT">🚚 กำลังมาส่ง (In Transit)</option>
            <option value="UNBUILT">📦 ยังไม่ได้ต่อ (Unbuilt)</option>
            <option value="COMPLETED">✨ ต่อเสร็จแล้ว (Completed)</option>
          </select>
          <div>
            <label className="text-xs text-gray-500 block mb-1">รูปภาพปก</label>
            <input 
              type="file" accept="image/*"
              className="w-full text-sm"
              onChange={(e) => setImageFile(e.target.files[0])}
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded text-sm">ยกเลิก</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded text-sm">
              {loading ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}