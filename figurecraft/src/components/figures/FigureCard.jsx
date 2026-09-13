import { useState } from 'react';

export default function FigureCard({ figure, onUpdateStatus }) {
  const [status, setStatus] = useState(figure.status || 'wishlist');
  const [assemblyStatus, setAssemblyStatus] = useState(figure.assembly_status || 'unassembled');

  // ฟังก์ชันอัปเดตสถานะสินค้า
  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    await onUpdateStatus(figure.id, { status: newStatus, assembly_status: assemblyStatus });
  };

  // ฟังก์ชันอัปเดตสถานะการต่อ
  const handleAssemblyStatusChange = async (e) => {
    const newAssemblyStatus = e.target.value;
    setAssemblyStatus(newAssemblyStatus);
    await onUpdateStatus(figure.id, { status, assembly_status: newAssemblyStatus });
  };

  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white flex flex-col gap-3">
      {/* รูปภาพและข้อมูลทั่วไป */}
      <img src={figure.image_url || '/placeholder.png'} alt={figure.name} className="w-full h-48 object-cover rounded" />
      <h3 className="font-bold text-lg">{figure.name}</h3>

      {/* ส่วนควบคุมและแก้ไขสถานะบนการ์ด */}
      <div className="flex flex-col gap-2 pt-2 border-t">
        {/* แก้ไขสถานะการสั่งซื้อ */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">สถานะสินค้า:</span>
          <select
            value={status}
            onChange={handleStatusChange}
            className="p-1 border rounded text-xs bg-gray-50 font-medium"
          >
            <option value="wishlist">อยากได้</option>
            <option value="preorder">สั่งจองแล้ว</option>
            <option value="received">ได้รับสินค้าแล้ว</option>
          </select>
        </div>

        {/* แก้ไขสถานะการต่อ */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">สถานะการต่อ:</span>
          <select
            value={assemblyStatus}
            onChange={handleAssemblyStatusChange}
            className={`p-1 border rounded text-xs font-medium ${
              assemblyStatus === 'assembled' 
                ? 'bg-green-100 text-green-800 border-green-300' 
                : 'bg-amber-100 text-amber-800 border-amber-300'
            }`}
          >
            <option value="unassembled">ยังไม่ได้ต่อ</option>
            <option value="assembled">ต่อแล้ว</option>
          </select>
        </div>
      </div>
    </div>
  );
}