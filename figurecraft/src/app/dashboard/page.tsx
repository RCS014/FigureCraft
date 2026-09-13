'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total: 0,
    assembled: 0,
    unassembled: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // ดึงรายการฟิกเกอร์ของผู้ใช้
        const { data: items, error } = await supabase
          .from('figure_items')
          .select('item_id, assembly_status')
          .eq('user_id', user.id)

        if (error) {
          console.error('Error fetching figure stats:', error)
          return
        }

        if (items) {
          const total = items.length
          // ตรวจสอบสถานะว่าต่อเสร็จแล้วหรือไม่ (ปรับ string ตามค่าที่คุณเก็บใน DB เช่น 'assembled' หรือ 'completed')
          const assembled = items.filter(
            (item) => item.assembly_status === 'assembled' || item.assembly_status === 'completed'
          ).length
          const unassembled = total - assembled

          setStats({ total, assembled, unassembled })
        }
      } catch (err) {
        console.error('Unexpected error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardStats()
  }, [])

  if (loading) return <div className="p-6">กำลังโหลดข้อมูล...</div>

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* โมเดลทั้งหมด */}
        <div className="p-4 bg-white rounded-xl shadow border border-gray-100">
          <p className="text-sm text-gray-500">โมเดลทั้งหมด</p>
          <p className="text-3xl font-bold text-gray-800">{stats.total} ตัว</p>
        </div>

        {/* ต่อแล้ว */}
        <div className="p-4 bg-green-50 rounded-xl shadow border border-green-200">
          <p className="text-sm text-green-600 font-medium">ต่อเสร็จแล้ว</p>
          <p className="text-3xl font-bold text-green-700">{stats.assembled} ตัว</p>
        </div>

        {/* ยังไม่ได้ต่อ */}
        <div className="p-4 bg-amber-50 rounded-xl shadow border border-amber-200">
          <p className="text-sm text-amber-600 font-medium">ยังไม่ได้ต่อ</p>
          <p className="text-3xl font-bold text-amber-700">{stats.unassembled} ตัว</p>
        </div>
      </div>
    </div>
  )
}