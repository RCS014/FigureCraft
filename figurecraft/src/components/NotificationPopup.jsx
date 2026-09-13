'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function NotificationPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [unbuiltCount, setUnbuiltCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    let timerId = null

    async function setupNotificationCheck() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. ดึงข้อมูลการตั้งค่าจาก profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_notification_enabled, notification_day, notification_time')
        .eq('id', user.id)
        .single()

      if (profileError || !profile || !profile.is_notification_enabled) {
        return
      }

      const { notification_day, notification_time } = profile
      if (!notification_time) return

      // 2. ดึงจำนวนรายการที่ยังไม่ได้ต่อ
      const { data: unbuiltItems } = await supabase
        .from('figure_items')
        .select('item_id')
        .eq('user_id', user.id)
        .neq('assembly_status', 'built')

      const count = unbuiltItems ? unbuiltItems.length : 0

      // 3. ฟังก์ชั่นตรวจสอบเวลา
      const checkAndTriggerPopup = () => {
        const now = new Date()

        // ตรวจสอบวันในสัปดาห์
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        const currentDay = days[now.getDay()]

        const isToday =
          !notification_day ||
          notification_day === 'Everyday' ||
          notification_day === 'Daily' ||
          notification_day.toLowerCase() === currentDay.toLowerCase()

        if (!isToday) return

        // ตรวจสอบเวลา HH:mm
        const currentHours = String(now.getHours()).padStart(2, '0')
        const currentMinutes = String(now.getMinutes()).padStart(2, '0')
        const currentTimeStr = `${currentHours}:${currentMinutes}`
        const targetTimeStr = notification_time.slice(0, 5) // รูปแบบ HH:mm

        // เช็คว่าวันนี้เคยแสดงแจ้งเตือนไปหรือยัง (กัน Pop Up เด้งรัวๆ ในนาทีเดียวกัน)
        const todayKey = `notified_${now.toISOString().slice(0, 10)}`
        const alreadyNotified = localStorage.getItem(todayKey)

        if (currentTimeStr === targetTimeStr && !alreadyNotified) {
          setUnbuiltCount(count)
          setIsOpen(true)
          localStorage.setItem(todayKey, 'true')
        }
      }

      // ตรวจสอบทันที และตั้งเวลาตรวจสอบทุกๆ 30 วินาที
      checkAndTriggerPopup()
      timerId = setInterval(checkAndTriggerPopup, 30000)
    }

    setupNotificationCheck()

    return () => {
      if (timerId) clearInterval(timerId)
    }
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4 text-center">
        <div className="text-4xl mb-2">🔔</div>
        <h3 className="text-lg font-bold text-gray-800">แจ้งเตือนประจำวัน</h3>
        <p className="text-gray-600 mt-2">
          คุณมีโมเดลที่ยังไม่ได้ต่ออีก <span className="font-bold text-amber-600">{unbuiltCount}</span> ตัว!
        </p>
        <div className="mt-6">
          <button
            onClick={() => setIsOpen(false)}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
          >
            รับทราบ
          </button>
        </div>
      </div>
    </div>
  )
}