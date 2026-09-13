'use client';

import Link from 'next/link';
import { Trash2 } from 'lucide-react';

export default function FigureCard({ figure, onDelete, onUpdateStatus }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col justify-between relative">
      {/* ลิงก์รูปภาพ */}
      <Link href={`/figures/${figure.id}`} className="block relative aspect-3/4 bg-slate-100 overflow-hidden cursor-pointer">
        {figure.imageUrl ? (
          <img
            src={figure.imageUrl}
            alt={figure.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
        )}
      </Link>

      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <Link href={`/figures/${figure.id}`} className="block">
            <h3 className="font-bold text-slate-800 line-clamp-1 text-base hover:text-blue-600 transition-colors">
              {figure.name}
            </h3>
          </Link>
          <p className="text-xs text-slate-500 mt-1">{figure.manufacturer || 'Unknown Studio'}</p>
        </div>

        {/* ส่วนราคา & ปุ่มลบ */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">ราคา</span>
            <span className="font-bold text-slate-900">฿{Number(figure.price || 0).toLocaleString()}</span>
          </div>

          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(figure.id);
              }}
              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="ลบฟิกเกอร์"
              aria-label="ลบฟิกเกอร์"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ส่วนปรับเปลี่ยนสถานะ Real-time */}
        {onUpdateStatus && (
          <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex items-center justify-between gap-1">
              <span className="text-slate-500">สถานะสินค้า:</span>
              <select
                value={figure.status || 'Pre-ordered'}
                onChange={(e) => onUpdateStatus(figure.id, { status: e.target.value })}
                className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700 font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="Pre-ordered">Pre-ordered</option>
                <option value="In Stock">In Stock</option>
                <option value="Wishlist">Wishlist</option>
              </select>
            </div>

            <div className="flex items-center justify-between gap-1">
              <span className="text-slate-500">สถานะการต่อ:</span>
              <select
                value={figure.assemblyStatus || 'unbuilt'}
                onChange={(e) => onUpdateStatus(figure.id, { assembly_status: e.target.value })}
                className={`border rounded px-2 py-1 font-medium focus:outline-none cursor-pointer ${
                  figure.assemblyStatus === 'built'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                <option value="unbuilt">ยังไม่ได้ต่อ</option>
                <option value="built">ต่อเสร็จแล้ว</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}