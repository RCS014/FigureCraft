'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function NotificationForm({ userId }) {
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    notification_day: 'MONDAY',
    notification_time: '09:00',
    is_notification_enabled: true
  })

  useEffect(() => {
    if (userId) {
      supabase.from('profiles').select('*').eq('id', userId).single().then(({ data }) => {
        if (data) {
          setSettings({
            notification_day: data.notification_day || 'MONDAY',
            notification_time: data.notification_time || '09:00',
            is_notification_enabled: data.is_notification_enabled ?? true
          })
        }
      })
    }
  }, [userId])

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from('profiles')
      .update({
        notification_day: settings.notification_day,
        notification_time: settings.notification_time,
        is_notification_enabled: settings.is_notification_enabled
      })
      .eq('id', userId)

    setLoading(false)
    if (error) alert('เกิดข้อผิดพลาด: ' + error.message)
    else alert('บันทึกการตั้งค่าการแจ้งเตือนเรียบร้อย!')
  }

  return (
    <form onSubmit={handleSave} className="bg-white p-6 rounded-lg border max-w-md space-y-4">
      <h3 className="font-bold text-lg border-b pb-2">🔔 ตั้งค่าระบบแจ้งเตือนกล่องดอง</h3>
      
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">เปิดใช้งานการแจ้งเตือน</span>
        <input 
          type="checkbox" className="w-5 h-5 accent-indigo-600"
          checked={settings.is_notification_enabled}
          onChange={(e) => setSettings({...settings, is_notification_enabled: e.target.checked})}
        />
      </div>

      <div>
        <label className="text-sm text-gray-600 block mb-1">วันแจ้งเตือนประจำสัปดาห์</label>
        <select 
          className="w-full border p-2 rounded text-sm"
          value={settings.notification_day}
          onChange={(e) => setSettings({...settings, notification_day: e.target.value})}
        >
          <option value="MONDAY">วันจันทร์</option>
          <option value="TUESDAY">วันอังคาร</option>
          <option value="WEDNESDAY">วันพุธ</option>
          <option value="THURSDAY">วันพฤหัสบดี</option>
          <option value="FRIDAY">วันศุกร์</option>
          <option value="SATURDAY">วันเสาร์</option>
          <option value="SUNDAY">วันอาทิตย์</option>
        </select>
      </div>

      <div>
        <label className="text-sm text-gray-600 block mb-1">เวลาแจ้งเตือน</label>
        <input 
          type="time" className="w-full border p-2 rounded text-sm"
          value={settings.notification_time}
          onChange={(e) => setSettings({...settings, notification_time: e.target.value})}
        />
      </div>

      <button 
        type="submit" disabled={loading}
        className="w-full bg-indigo-600 text-white py-2 rounded text-sm hover:bg-indigo-700 transition"
      >
        {loading ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
      </button>
    </form>
  )
}