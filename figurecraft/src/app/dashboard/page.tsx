'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

interface FigureItem {
  item_id: string
  name: string
  category?: string
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

      // 1. ดึงโปรไฟล์เพื่อเช็คการตั้งค่าการแจ้งเตือน
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_notification_enabled')
        .eq('id', user.id)
        .single()

      // 2. ดึงรายการฟิกเกอร์ทั้งหมดของผู้ใช้
      const { data: items, error } = await supabase
        .from('figure_items')
        .select('*')
        .eq('user_id', user.id)

      if (error) {
        console.error('Error fetching figure stats:', error)
        return
      }

      if (items) {
        const total = items.length
        
        // กรองรายการที่ต่อเสร็จแล้ว
        const assembledList = items.filter(
          (item) => 
            item.assembly_status === 'built' || 
            item.assembly_status === 'assembled' || 
            item.assembly_status === 'completed'
        )

        // กรองรายการที่ยังไม่ได้ต่อ
        const unbuiltList = items.filter(
          (item) => 
            item.assembly_status !== 'built' && 
            item.assembly_status !== 'assembled' && 
            item.assembly_status !== 'completed'
        )

        const assembled = assembledList.length
        const unassembled = unbuiltList.length
        const progress = total > 0 ? Math.round((assembled / total) * 100) : 0
        const totalPrice = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0)

        setStats({ total, assembled, unassembled, totalPrice, progress })
        setUnassembledItems(unbuiltList)

        // สรุปสถิติแยกตามหมวดหมู่ (US-3.2)
        const catMap: { [key: string]: number } = {}
        items.forEach((item) => {
          const cat = item.category || 'ทั่วไป'
          catMap[cat] = (catMap[cat] || 0) + 1
        })
        setCategoryStats(catMap)

        // 3. ตรวจสอบการแสดง Pop-up แจ้งเตือนวันละ 1 ครั้ง
        if (profile?.is_notification_enabled && unbuiltList.length > 0) {
          const today = new Date().toISOString().split('T')[0] // ได้วันที่ YYYY-MM-DD
          const lastShownDate = localStorage.getItem('figurecraft_last_popup_date')

          if (lastShownDate !== today) {
            setShowPopup(true)
            localStorage.setItem('figurecraft_last_popup_date', today)
          }
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // ทางลัดเปลี่ยนสถานะเป็น "ต่อแล้ว" (US-3.3)
  const handleMarkAsBuilt = async (itemId: string) => {
    try {
      setUpdatingId(itemId)
      const { error } = await supabase
        .from('figure_items')
        .update({ assembly_status: 'built' })
        .eq('item_id', itemId)

      if (error) {
        alert('อัปเดตสถานะไม่สำเร็จ: ' + error.message)
      } else {
        // รีโหลดข้อมูลสถิติใหม่
        await fetchDashboardData()
      }
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) return <div className="p-6 text-gray-600">กำลังโหลดข้อมูล Dashboard...</div>

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard ภาพรวมคลังฟิกเกอร์</h1>

      {/* US-3.1: การ์ดสรุปสถิติจำนวนและมูลค่า */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 bg-white rounded-xl shadow border border-gray-100">
          <p className="text-sm text-gray-500">โมเดลทั้งหมด</p>
          <p className="text-3xl font-bold text-gray-800">{stats.total} ตัว</p>
        </div>

        <div className="p-4 bg-green-50 rounded-xl shadow border border-green-200">
          <p className="text-sm text-green-600 font-medium">ต่อเสร็จแล้ว</p>
          <p className="text-3xl font-bold text-green-700">{stats.assembled} ตัว</p>
        </div>

        <div className="p-4 bg-amber-50 rounded-xl shadow border border-amber-200">
          <p className="text-sm text-amber-600 font-medium">ยังไม่ได้ต่อ</p>
          <p className="text-3xl font-bold text-amber-700">{stats.unassembled} ตัว</p>
        </div>

        <div className="p-4 bg-blue-50 rounded-xl shadow border border-blue-200">
          <p className="text-sm text-blue-600 font-medium">ความคืบหน้า</p>
          <p className="text-3xl font-bold text-blue-700">{stats.progress}%</p>
        </div>

        <div className="p-4 bg-purple-50 rounded-xl shadow border border-purple-200">
          <p className="text-sm text-purple-600 font-medium">มูลค่ารวมในคลัง</p>
          <p className="text-2xl font-bold text-purple-700">
            ฿{stats.totalPrice.toLocaleString()}
          </p>
        </div>
      </div>

      {/* US-3.2: หลอดแสดงความคืบหน้าการต่อ & สัดส่วนหมวดหมู่ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-5 rounded-xl shadow border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">ความคืบหน้าการประกอบฟิกเกอร์</h2>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-3 overflow-hidden">
            <div 
              className="bg-green-500 h-4 rounded-full transition-all duration-500" 
              style={{ width: `${stats.progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">
            ต่อเสร็จไปแล้ว {stats.assembled} จากทั้งหมด {stats.total} รายการ ({stats.progress}%)
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">จำแนกตามหมวดหมู่</h2>
          <div className="space-y-2">
            {Object.keys(categoryStats).length > 0 ? (
              Object.entries(categoryStats).map(([cat, count]) => (
                <div key={cat} className="flex justify-between items-center text-sm border-b pb-1">
                  <span className="text-gray-600">{cat}</span>
                  <span className="font-semibold text-gray-800">{count} รายการ</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">ยังไม่มีข้อมูลหมวดหมู่</p>
            )}
          </div>
        </div>
      </div>

      {/* US-3.3: รายการฟิกเกอร์ที่ยังไม่ได้ต่อล่าสุด พร้อมปุ่มทางลัด Mark as Built */}
      <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          รายการที่ยังไม่ได้ต่อล่าสุด (Quick Actions)
        </h2>

        {unassembledItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-green-50 rounded-lg">
            🎉 ยินดีด้วย! คุณต่อฟิกเกอร์ในคลังครบทุกชิ้นแล้ว
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {unassembledItems.slice(0, 6).map((item) => (
              <div 
                key={item.item_id} 
                className="flex items-center space-x-4 p-3 border rounded-lg hover:shadow-md transition"
              >
                <img 
                  src={item.image_url || 'https://via.placeholder.com/80?text=No+Image'} 
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded bg-gray-100"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=No+Image'
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{item.name}</p>
                  <p className="text-xs text-amber-600 font-medium">ยังไม่ได้ต่อ</p>
                  <button
                    onClick={() => handleMarkAsBuilt(item.item_id)}
                    disabled={updatingId === item.item_id}
                    className="mt-2 text-xs bg-green-600 hover:bg-green-700 text-white font-medium px-2.5 py-1 rounded transition disabled:bg-gray-300"
                  >
                    {updatingId === item.item_id ? 'กำลังบันทึก...' : '✓ ทำ Mark as Built'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pop-up แจ้งเตือนประจำวัน (Daily Pop-up Modal) */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-center space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
              🔔
            </div>
            <h3 className="text-xl font-bold text-gray-800">แจ้งเตือนประจำวัน!</h3>
            <p className="text-sm text-gray-600">
              คุณยังมีฟิกเกอร์ที่ยังไม่ได้ต่อค้างอยู่ในคลังจำนวน{' '}
              <span className="font-bold text-amber-600">{stats.unassembled} รายการ</span>
            </p>

            <div className="max-h-40 overflow-y-auto space-y-2 border-y py-2 text-left">
              {unassembledItems.slice(0, 3).map((item) => (
                <div key={item.item_id} className="flex items-center space-x-2 text-sm">
                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                  <span className="truncate text-gray-700 font-medium">{item.name}</span>
                </div>
              ))}
              {unassembledItems.length > 3 && (
                <p className="text-xs text-gray-400 text-center">
                  + อีก {unassembledItems.length - 3} รายการในคลังของคุณ
                </p>
              )}
            </div>

            <button
              onClick={() => setShowPopup(false)}
              className="w-full bg-blue-600 text-white font-medium py-2 rounded-xl hover:bg-blue-700 transition"
            >
              รับทราบ / เข้าสู่คลังของฉัน
            </button>
          </div>
        </div>
      )}
    </div>
  )
}