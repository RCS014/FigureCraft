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
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  // Notification State
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false)
  const [notificationDay, setNotificationDay] = useState('Monday')
  const [notificationTime, setNotificationTime] = useState('09:00')

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserId(user.id)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data && !error) {
        setName(data.name || '')
        setAvatarUrl(data.avatar_url || '')
        setIsNotificationEnabled(data.is_notification_enabled || false)
        setNotificationDay(data.notification_day || 'Monday')
        setNotificationTime(data.notification_time || '09:00')
      }
      setLoading(false)
    }

    fetchProfile()
  }, [supabase])

  // อัปโหลดรูปภาพโปรไฟล์ไปยัง Supabase Storage
  const uploadAvatar = async (file: File, uid: string) => {
    const fileExt = file.name.split('.').pop()
    const filePath = `${uid}/avatar.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (uploadError) throw uploadError

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
    return data.publicUrl
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    setSaving(true)
    try {
      let finalAvatarUrl = avatarUrl

      if (avatarFile) {
        finalAvatarUrl = await uploadAvatar(avatarFile, userId)
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          name,
          avatar_url: finalAvatarUrl,
          is_notification_enabled: isNotificationEnabled,
          notification_day: notificationDay,
          notification_time: notificationTime,
        })

      if (error) throw error
      alert('บันทึกข้อมูลเรียบร้อยแล้ว!')
      setAvatarUrl(finalAvatarUrl)
    } catch (err: any) {
      alert(`เกิดข้อผิดพลาด: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-center">กำลังโหลดข้อมูล...</div>

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded-lg my-8 text-gray-800">
      <h1 className="text-2xl font-bold mb-6">ตั้งค่าบัญชีและการแจ้งเตือน</h1>

      <form onSubmit={handleSave} className="space-y-6">
        {/* รูปโปรไฟล์ */}
        <div>
          <label className="block text-sm font-medium mb-2">รูปโปรไฟล์</label>
          <div className="flex items-center gap-4">
            <img
              src={avatarUrl || 'https://via.placeholder.com/100'}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && setAvatarFile(e.target.files[0])}
              className="text-sm"
            />
          </div>
        </div>

        {/* ชื่อผู้ใช้งาน */}
        <div>
          <label className="block text-sm font-medium mb-1">ชื่อผู้ใช้งาน</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        <hr className="my-4" />

        {/* การตั้งค่าการแจ้งเตือน */}
        <div>
          <h2 className="text-lg font-semibold mb-4">ตั้งค่าการแจ้งเตือนฟิกเกอร์ที่ยังไม่ได้ต่อ</h2>
          
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="enable-notify"
              checked={isNotificationEnabled}
              onChange={(e) => setIsNotificationEnabled(e.target.checked)}
              className="w-4 h-4 mr-2"
            />
            <label htmlFor="enable-notify" className="font-medium">
              เปิดการแจ้งเตือนทาง Email
            </label>
          </div>

          {isNotificationEnabled && (
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded border">
              <div>
                <label className="block text-sm font-medium mb-1">วันที่ต้องการแจ้งเตือน</label>
                <select
                  value={notificationDay}
                  onChange={(e) => setNotificationDay(e.target.value)}
                  className="w-full border p-2 rounded"
                >
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">เวลาที่ต้องการแจ้งเตือน</label>
                <input
                  type="time"
                  value={notificationTime}
                  onChange={(e) => setNotificationTime(e.target.value)}
                  className="w-full border p-2 rounded"
                />
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {saving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
        </button>
      </form>
    </div>
  )
}