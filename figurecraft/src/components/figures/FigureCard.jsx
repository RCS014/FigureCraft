'use client'

export default function FigureCard({ item, onOpenNotes, onDelete }) {
  // กำหนดสีของ Badge ตามสถานะ
  const statusColors = {
    IN_TRANSIT: 'bg-orange-100 text-orange-800 border-orange-300',
    UNBUILT: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    COMPLETED: 'bg-green-100 text-green-800 border-green-300',
  }

  const statusLabels = {
    IN_TRANSIT: '🚚 กำลังมาส่ง',
    UNBUILT: '📦 ยังไม่ได้ต่อ (ดอง)',
    COMPLETED: '✨ ต่อเสร็จแล้ว',
  }

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm bg-white flex flex-col justify-between">
      {/* รูปภาพสินค้า */}
      <div className="h-48 bg-gray-100 relative overflow-hidden">
        {item.cover_image ? (
          <img src={item.cover_image} alt={item.figure_name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">ไม่มีรูปภาพ</div>
        )}
        <span className={`absolute top-2 right-2 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColors[item.status]}`}>
          {statusLabels[item.status]}
        </span>
      </div>

      {/* รายละเอียด */}
      <div className="p-4 flex-1">
        <h3 className="font-bold text-lg text-gray-800 line-clamp-1">{item.figure_name}</h3>
        <p className="text-sm text-gray-500">ค่าย: {item.manufacturer_name || '-'}</p>
        <p className="text-sm text-gray-500">ร้านค้า: {item.merchant_name || '-'}</p>
      </div>

      {/* ปุ่ม Actions */}
      <div className="p-4 border-t bg-gray-50 flex gap-2">
        <button 
          onClick={() => onOpenNotes(item)}
          className="flex-1 bg-indigo-600 text-white text-sm py-1.5 rounded hover:bg-indigo-700 transition"
        >
          🎨 Custom Notes
        </button>
        <button 
          onClick={() => onDelete(item.item_id)}
          className="px-3 bg-red-50 text-red-600 text-sm py-1.5 rounded border border-red-200 hover:bg-red-100"
        >
          ลบ
        </button>
      </div>
    </div>
  )
}