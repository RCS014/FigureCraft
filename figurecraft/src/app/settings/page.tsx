'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function SettingsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // Profile State
  const [name, setName] = useState('')

  // Daily Pop-up Notification State
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserId(user.id)
      const { data, error } = await supabase
        .from('profiles')
        .select('name, is_notification_enabled')
        .eq('id', user.id)
        .single()

      if (data && !error) {
        setName(data.name || '')
        setIsNotificationEnabled(data.is_notification_enabled ?? false)
      }
      setLoading(false)
    }

    fetchProfile()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        name,
        is_notification_enabled: isNotificationEnabled,
      })
      .eq('id', userId)

    setSaving(false)
    if (error) {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + error.message)
    } else {
      alert('บันทึกการตั้งค่าเรียบร้อยแล้ว!')
    }
  }

  if (loading) return <div className="p-6 text-gray-600">กำลังโหลดข้อมูลตั้งค่า...</div>

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow mt-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">ตั้งค่าโปรไฟล์และการแจ้งเตือน</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ชื่อผู้ใช้ */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">ชื่อที่แสดง</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="กรอกชื่อของคุณ"
            required
          />
        </div>

        {/* การแจ้งเตือน Pop-up วันละ 1 ครั้ง */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">แจ้งเตือน Pop-up ฟิกเกอร์ค้างต่อ</h3>
              <p className="text-sm text-gray-500">
                แสดง Pop-up สรุปรายการฟิกเกอร์ที่ยังไม่ได้ต่อวันละ 1 ครั้ง เมื่อเข้าใช้งาน Dashboard
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isNotificationEnabled}
                onChange={(e) => setIsNotificationEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 font-medium transition"
        >
          {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
        </button>
      </form>
    </div>
  )
}