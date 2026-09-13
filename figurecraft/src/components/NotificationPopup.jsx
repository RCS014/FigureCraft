'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Bell, X, Package } from 'lucide-react'

export default function NotificationPopup() {
  const [show, setShow] = useState(false)
  const [unbuiltItems, setUnbuiltItems] = useState([])
  const supabase = createClient()

  useEffect(() => {
    const checkNotification = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // ตรวจสอบว่าเปิดใช้งาน Notification ใน Profile หรือไม่
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_notification_enabled')
        .eq('id', user.id)
        .single()

      if (profile?.is_notification_enabled) {
        // ดึงรายการที่ยังไม่ได้ต่อ
        const { data: figures } = await supabase
          .from('figure_items')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'unbuilt')

        if (figures && figures.length > 0) {
          setUnbuiltItems(figures)
          // ให้แสดง Pop-up เพียงครั้งเดียวต่อ session (หรือกดแล้วไม่แสดงซ้ำ)
          const hasShown = sessionStorage.getItem('popup_shown')
          if (!hasShown) {
            setShow(true)
            sessionStorage.setItem('popup_shown', 'true')
          }
        }
      }
    }

    checkNotification()
  }, [supabase])

  if (!show) return null

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-white rounded-2xl shadow-2xl border border-amber-200 p-5 animate-bounce-short">
      <button
        onClick={() => setShow(false)}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
      >
        <X size={18} />
      </button>

      <div className="flex items-center gap-3 text-amber-600 mb-3">
        <div className="p-2 bg-amber-100 rounded-full">
          <Bell size={22} />
        </div>
        <h4 className="font-bold text-gray-800 text-sm">แจ้งเตือนกล่องดอง 📦</h4>
      </div>

      <p className="text-xs text-gray-600 mb-3">
        อย่าลืมหาเวลาต่อฟิกเกอร์น้า! คุณมีกล่องดองรออยู่อีก <strong className="text-amber-600">{unbuiltItems.length}</strong> ชิ้น
      </p>

      <button
        onClick={() => setShow(false)}
        className="w-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold py-2 rounded-lg transition"
      >
        เข้าใจแล้ว
      </button>
    </div>
  )
}