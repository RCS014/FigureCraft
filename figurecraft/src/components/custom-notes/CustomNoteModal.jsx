'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function CustomNoteModal({ item, isOpen, onClose }) {
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState({ detail_note: '', paint_note: '', decal_note: '' })

  // ดึงข้อมูลโน้ตเดิมขึ้นมาแสดงเมื่อเปิด Modal
  useEffect(() => {
    if (item?.item_id && isOpen) {
      const fetchNote = async () => {
        const { data } = await supabase
          .from('custom_build_notes')
          .select('*')
          .eq('item_id', item.item_id)
          .single()

        if (data) {
          setNotes({
            detail_note: data.detail_note || '',
            paint_note: data.paint_note || '',
            decal_note: data.decal_note || '',
          })
        } else {
          setNotes({ detail_note: '', paint_note: '', decal_note: '' })
        }
      }
      fetchNote()
    }
  }, [item, isOpen])

  if (!isOpen || !item) return null

  const handleSave = async () => {
    setLoading(true)
    const { error } = await supabase
      .from('custom_build_notes')
      .upsert({
        item_id: item.item_id,
        detail_note: notes.detail_note,
        paint_note: notes.paint_note,
        decal_note: notes.decal_note,
        updated_at: new Date()
      }, { onConflict: 'item_id' })

    setLoading(false)
    if (error) alert('Error: ' + error.message)
    else onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full space-y-4">
        <h2 className="text-lg font-bold">🎨 แผนงาน Custom Work: {item.figure_name}</h2>
        
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-600">✏️ งานดีเทล / เดินลาย (Detail Note)</label>
            <textarea 
              rows={2} className="w-full border p-2 rounded text-sm mt-1"
              value={notes.detail_note}
              onChange={(e) => setNotes({...notes, detail_note: e.target.value})}
              placeholder="เช่น เดินลายเพิ่มตรงหัวไหล่, เจาะรูใส่พาร์ทเสริม..."
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">🎨 งานทำสี / พ่นสี (Paint Note)</label>
            <textarea 
              rows={2} className="w-full border p-2 rounded text-sm mt-1"
              value={notes.paint_note}
              onChange={(e) => setNotes({...notes, paint_note: e.target.value})}
              placeholder="เช่น เกราะนอกใช้สีขาวมุก, เฟรมในใช้ Metallic Grey..."
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">🏷️ งานติดดีเคล (Decal Note)</label>
            <textarea 
              rows={2} className="w-full border p-2 rounded text-sm mt-1"
              value={notes.decal_note}
              onChange={(e) => setNotes({...notes, decal_note: e.target.value})}
              placeholder="เช่น ใช้ดีเคลน้ำค่าย EVO, ติดเน้นบริเวณโล่และปีก..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-1.5 border rounded text-sm">ปิด</button>
          <button onClick={handleSave} disabled={loading} className="px-4 py-1.5 bg-indigo-600 text-white rounded text-sm">
            {loading ? 'บันทึก...' : 'บันทึกโน้ต'}
          </button>
        </div>
      </div>
    </div>
  )
}