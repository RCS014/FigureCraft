'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

// 🟢 โครงสร้างข้อมูลหมวดหมู่ (จากตาราง categories)
interface Category {
  id: number
  code: string
  name: string
}

// 🟢 โครงสร้างข้อมูลรายการฟิกเกอร์
interface FigureItem {
  item_id: string
  figure_name?: string
  name?: string
  categories?: Category | null
  assembly_status: string
  price?: number
  image_url?: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total: 0,
    assembled: 0,
    unassembled: 0,
    totalPrice: 0,
    progress: 0,
  })
  const [categoryStats, setCategoryStats] = useState<{ [key: string]: number }>({})
  const [unassembledItems, setUnassembledItems] = useState<FigureItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Pop-up Notification State
  const [showPopup, setShowPopup] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. ดึงข้อมูลโปรไฟล์เพื่อเช็คการเปิดแจ้งเตือน
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_notification_enabled')
        .eq('id', user.id)
        .single()

      // 2. ดึงรายการฟิกเกอร์ของผู้ใช้ พร้อม Join ข้อมูลจากตาราง categories
      const { data: items, error } = await supabase
        .from('figure_items')
        .select(`
          *,
          categories (
            id,
            code,
            name
          )
        `)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error fetching dashboard data:', error)
        return
      }

      if (items) {
        const total = items.length

        // นับจำนวนที่ต่อเสร็จแล้ว
        const assembled = items.filter(
          (item) =>
            item.assembly_status === 'built' ||
            item.assembly_status === 'assembled' ||
            item.assembly_status === 'completed'
        ).length

        // นับจำนวนที่ยังไม่ได้ต่อ
        const unassembled = items.filter(
          (item) => item.assembly_status === 'unbuilt'
        ).length

        // คำนวณราคารวม และ % ความคืบหน้า
        const totalPrice = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0)
        const progress = total > 0 ? Math.round((assembled / total) * 100) : 0

        setStats({
          total,
          assembled,
          unassembled,
          totalPrice,
          progress,
        })

        // 🟢 สรุปจำนวนแยกตามหมวดหมู่ Dynamic (อ่านจากตาราง categories)
        const catCounts: { [key: string]: number } = {}
        items.forEach((item) => {
          const catName = item.categories?.name || 'ไม่ระบุหมวดหมู่'
          catCounts[catName] = (catCounts[catName] || 0) + 1
        })
        setCategoryStats(catCounts)

        // กรองเฉพาะรายการที่ยังไม่ได้ต่อ
        const unbuiltList = items.filter((item) => item.assembly_status === 'unbuilt')
        setUnassembledItems(unbuiltList)

        // แสดง Pop-up แจ้งเตือน ถ้าผู้ใช้เปิดรับแจ้งเตือนและมีฟิกเกอร์ดอง
        if (profile?.is_notification_enabled && unbuiltList.length > 0) {
          setShowPopup(true)
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err)
    } finally {
      setLoading(false)
    }
  }

  // ฟังก์ชันเปลี่ยนสถานะเป็นต่อเสร็จแล้ว (Mark as Built)
  const handleMarkAsBuilt = async (itemId: string) => {
    try {
      setUpdatingId(itemId)
      const { error } = await supabase
        .from('figure_items')
        .update({ assembly_status: 'built' })
        .eq('item_id', itemId)

      if (error) throw error

      // ดึงข้อมูลใหม่เพื่ออัปเดตหน้า Dashboard ทันที
      await fetchDashboardData()
    } catch (err) {
      console.error('Error updating status:', err)
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-600">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
        กำลังโหลดข้อมูล...
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>

      {/* การ์ดสรุปสถิติหลัก */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* โมเดลทั้งหมด */}
        <div className="p-5 bg-white rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">โมเดลทั้งหมด</p>
          <p className="text-3xl font-bold text-slate-800">{stats.total} <span className="text-sm font-normal text-slate-500">ตัว</span></p>
        </div>

        {/* ต่อแล้ว */}
        <div className="p-5 bg-emerald-50 rounded-2xl shadow-sm border border-emerald-100">
          <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider mb-1">ต่อเสร็จแล้ว</p>
          <p className="text-3xl font-bold text-emerald-700">{stats.assembled} <span className="text-sm font-normal text-emerald-600">ตัว</span></p>
        </div>

        {/* ยังไม่ได้ต่อ */}
        <div className="p-5 bg-amber-50 rounded-2xl shadow-sm border border-amber-100">
          <p className="text-xs font-medium text-amber-600 uppercase tracking-wider mb-1">ยังไม่ได้ต่อ (งานดอง)</p>
          <p className="text-3xl font-bold text-amber-700">{stats.unassembled} <span className="text-sm font-normal text-amber-600">ตัว</span></p>
        </div>

        {/* มูลค่ารวม */}
        <div className="p-5 bg-blue-50 rounded-2xl shadow-sm border border-blue-100">
          <p className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-1">มูลค่าคลังรวม</p>
          <p className="text-3xl font-bold text-blue-700">฿{stats.totalPrice.toLocaleString()}</p>
        </div>
      </div>

      {/* Progress Bar ความคืบหน้าการต่อ */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="font-semibold text-slate-700">ความคืบหน้าการประกอบ</span>
          <span className="font-bold text-blue-600">{stats.progress}%</span>
        </div>
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${stats.progress}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* สรุปจำนวนแยกตามหมวดหมู่ */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4">จำนวนแบ่งตามหมวดหมู่</h2>
          {Object.keys(categoryStats).length === 0 ? (
            <p className="text-slate-400 text-sm">ยังไม่มีข้อมูลหมวดหมู่</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(categoryStats).map(([catName, count]) => (
                <div key={catName} className="flex justify-between items-center text-sm border-b pb-2 border-slate-50">
                  <span className="text-slate-700 font-medium">{catName}</span>
                  <span className="bg-slate-100 text-slate-700 font-semibold px-2.5 py-0.5 rounded-full text-xs">
                    {count} ตัว
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* รายการค้างต่อล่าสุด พร้อมปุ่มทางลัด */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4">รายการค้างต่อล่าสุด</h2>
          {unassembledItems.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-sm">
              🎉 ยินดีด้วย! คุณไม่มีงานดองค้างอยู่เลย
            </div>
          ) : (
            <div className="space-y-3">
              {unassembledItems.slice(0, 5).map((item) => (
                <div
                  key={item.item_id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-slate-800 text-sm truncate">
                      {item.figure_name || item.name || 'ไม่มีชื่อโมเดล'}
                    </p>
                    {item.categories && (
                      <span className="inline-block mt-1 text-[11px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-medium">
                        {item.categories.name}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleMarkAsBuilt(item.item_id)}
                    disabled={updatingId === item.item_id}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg shadow-sm transition-colors shrink-0 disabled:bg-emerald-300 cursor-pointer"
                  >
                    {updatingId === item.item_id ? 'กำลังบันทึก...' : 'ต่อเสร็จแล้ว'}
                  </button>
                </div>
              ))}

              {unassembledItems.length > 5 && (
                <p className="text-xs text-center text-slate-400 pt-1">
                  + อีก {unassembledItems.length - 5} รายการในคลังของคุณ
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pop-up แจ้งเตือนประจำวัน */}
      {showPopup && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-xl border border-slate-100">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
              🔔
            </div>
            <h3 className="text-xl font-bold text-slate-800">แจ้งเตือนประจำวัน!</h3>
            <p className="text-sm text-slate-600">
              คุณยังมีฟิกเกอร์ที่ยังไม่ได้ต่อค้างอยู่ในคลังจำนวน{' '}
              <span className="font-bold text-amber-600">{stats.unassembled} รายการ</span>
            </p>

            <div className="max-h-40 overflow-y-auto space-y-2 border-y py-2 text-left">
              {unassembledItems.slice(0, 3).map((item) => (
                <div key={item.item_id} className="flex items-center space-x-2 text-sm">
                  <span className="w-2 h-2 bg-amber-500 rounded-full shrink-0"></span>
                  <span className="truncate text-slate-700 font-medium">
                    {item.figure_name || item.name || 'ไม่มีชื่อโมเดล'}
                  </span>
                  {item.categories && (
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded shrink-0">
                      {item.categories.code || item.categories.name}
                    </span>
                  )}
                </div>
              ))}
              {unassembledItems.length > 3 && (
                <p className="text-xs text-slate-400 text-center">
                  + อีก {unassembledItems.length - 3} รายการในคลังของคุณ
                </p>
              )}
            </div>

            <button
              onClick={() => setShowPopup(false)}
              className="w-full bg-blue-600 text-white font-medium py-2 rounded-xl hover:bg-blue-700 transition-colors shadow cursor-pointer"
            >
              รับทราบ
            </button>
          </div>
        </div>
      )}
    </div>
  )
}