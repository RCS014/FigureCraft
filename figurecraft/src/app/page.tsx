// src/app/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import FigureCard from '@/components/figures/FigureCard';
import { Plus, Package } from 'lucide-react';

export default function HomePage() {
  const [figures, setFigures] = useState([
    {
      id: '1',
      name: 'Hatsune Miku - Vocaloid',
      series: 'Vocaloid',
      manufacturer: 'Good Smile Company',
      price: 4500,
      scale: '1/7',
      status: 'Pre-ordered',
      imageUrl: 'https://via.placeholder.com/300x400?text=Miku+Figure',
    },
  ]);

  const handleDeleteFigure = (id: string) => {
    setFigures((prev) => prev.filter((figure) => figure.id !== id));
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">My Figure Collection</h1>
            <p className="text-slate-500 text-sm mt-1">จัดการและสะสมคอลเลกชันฟิกเกอร์ของคุณ</p>
          </div>
          <Link
            href="/add"
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl shadow-md transition-all hover:shadow-lg active:scale-95"
          >
            <Plus className="w-5 h-5" />
            เพิ่มฟิกเกอร์ใหม่
          </Link>
        </div>

        {/* Figure Cards Grid */}
        {figures.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {figures.map((figure) => (
              <FigureCard
                key={figure.id}
                figure={figure}
                onDelete={handleDeleteFigure}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-700">ยังไม่มีข้อมูลฟิกเกอร์</h3>
            <p className="text-slate-500 text-sm mb-4">เริ่มต้นบันทึกคอลเลกชันแรกของคุณได้เลย</p>
            <Link
              href="/add"
              className="text-blue-600 font-semibold hover:underline inline-block"
            >
              + เพิ่มฟิกเกอร์ใหม่
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}