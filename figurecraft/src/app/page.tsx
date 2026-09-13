'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import FigureCard from '@/components/figures/FigureCard';
import { Plus, Package, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function HomePage() {
  const [figures, setFigures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchFigures = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('figure_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setFigures(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFigures();
  }, []);

  const handleDeleteFigure = async (itemId: number) => {
    if (!confirm('คุณต้องการลบฟิกเกอร์นี้ใช่หรือไม่?')) return;

    const { error } = await supabase
      .from('figure_items')
      .delete()
      .eq('item_id', itemId);

    if (!error) {
      setFigures((prev) => prev.filter((item) => item.item_id !== itemId));
    } else {
      alert('เกิดข้อผิดพลาดในการลบข้อมูล: ' + error.message);
    }
  };

  // ระบุ Type ให้พารามิเตอร์ itemId และ updatedFields
  const handleUpdateStatus = async (itemId: number, updatedFields: Record<string, any>) => {
    const { error } = await supabase
      .from('figure_items')
      .update(updatedFields)
      .eq('item_id', itemId);

    if (!error) {
      setFigures((prev) =>
        prev.map((item) =>
          item.item_id === itemId ? { ...item, ...updatedFields } : item
        )
      );
    } else {
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ: ' + error.message);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
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

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : figures.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {figures.map((item) => (
              <FigureCard
                key={item.item_id}
                figure={{
                  id: item.item_id,
                  name: item.figure_name,
                  manufacturer: item.manufacturer_name,
                  price: item.price,
                  status: item.status,
                  assemblyStatus: item.assembly_status,
                  imageUrl: item.cover_image,
                  merchant: item.merchant_name,
                  purchaseDate: item.purchase_date,
                }}
                onDelete={() => handleDeleteFigure(item.item_id)}
                // ส่งฟังก์ชัน handleUpdateStatus เข้าไปโดยตรง
                onUpdateStatus={handleUpdateStatus}
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