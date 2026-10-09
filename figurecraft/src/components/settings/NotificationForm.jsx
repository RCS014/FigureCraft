'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function NotificationForm({ userId }) {
  const [loading, setLoading] = useState(false)
  const [isEnabled, setIsEnabled] = useState(true)

  useEffect(() => {
    if (userId) {
      supabase.from('profiles').select('is_notification_enabled').eq('id', userId).single().then(({ data }) => {
        if (data) {
          setIsEnabled(data.is_notification_enabled ?? true)
        }
      })
    }
  }, [userId])

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from('profiles')
      .update({ is_notification_enabled: isEnabled })
      .eq('id', userId)

    setLoading(false)
    if (error) alert('เกิดข้อผิดพลาด: ' + error.message)
    else alert('บันทึกการตั้งค่าการแจ้งเตือนแล้ว')
  }

  return (
    <form onSubmit={handleSave} className="space-y-4 bg-white p-4 rounded shadow border">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-medium text-gray-800">แจ้งเตือน Pop-up ประจำวัน</span>
          <p className="text-xs text-gray-500">แจ้งเตือนสรุปรายการฟิกเกอร์ยังไม่ได้ต่อวันละ 1 ครั้ง</p>
        </div>
        <input 
          type="checkbox" 
          checked={isEnabled}
          onChange={(e) => setIsEnabled(e.target.checked)}
          className="w-5 h-5 accent-blue-600 cursor-pointer"
        />
      </div>
      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-blue-600 text-white text-sm py-2 rounded hover:bg-blue-700"
      >
        {loading ? 'กำลังบันทึก...' : 'บันทึก'}
      </button>
    </form>
  )
}