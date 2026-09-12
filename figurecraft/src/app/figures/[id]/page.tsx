// src/app/figures/[id]/page.tsx
'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit3, Loader2, Calendar, Store, Tag, DollarSign, Palette } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import CustomNoteModal from '@/components/custom-notes/CustomNoteModal';

export default function FigureDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [figure, setFigure] = useState<any>(null);
  const [customNotes, setCustomNotes] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchFigureData = async () => {
    setLoading(true);
    // 1. ดึงข้อมูลฟิกเกอร์
    const { data: figureData, error: figureError } = await supabase
      .from('figure_items')
      .select('*')
      .eq('item_id', id)
      .single();

    if (!figureError && figureData) {
      setFigure(figureData);

      // 2. ดึงข้อมูล Custom Notes
      const { data: noteData } = await supabase
        .from('custom_build_notes')
        .select('*')
        .eq('item_id', id)
        .maybeSingle();

      if (noteData) {
        setCustomNotes(noteData);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFigureData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!figure) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center">
        <p className="text-slate-600 text-lg mb-4">ไม่พบข้อมูลฟิกเกอร์</p>
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-blue-600 hover:underline font-medium cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" /> กลับหน้าหลัก
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ปุ่มกลับ */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          กลับหน้าหลัก
        </button>

        {/* ข้อมูลฟิกเกอร์ */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-6 p-6">
          {/* รูปภาพ */}
          <div className="md:col-span-5 aspect-3/4 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
            {figure.cover_image ? (
              <img
                src={figure.cover_image}
                alt={figure.figure_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                ไม่มีรูปภาพ
              </div>
            )}
          </div>

          {/* รายละเอียด */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                  {figure.status || 'Owned'}
                </span>
                <span className="text-xs text-slate-400">ID: {figure.item_id}</span>
              </div>

              <h1 className="text-2xl font-bold text-slate-900">{figure.figure_name}</h1>
              <p className="text-sm font-medium text-slate-500">
                ผู้ผลิต: <span className="text-slate-800">{figure.manufacturer_name || 'ไม่ระบุ'}</span>
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="text-xs text-slate-400 block">ราคา</span>
                    <span className="font-bold text-slate-900">
                      {figure.price ? `฿${Number(figure.price).toLocaleString()}` : 'ไม่ระบุ'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-600">
                  <Store className="w-4 h-4 text-indigo-600" />
                  <div>
                    <span className="text-xs text-slate-400 block">ร้านค้า</span>
                    <span className="font-medium text-slate-800">{figure.merchant_name || 'ไม่ระบุ'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="text-xs text-slate-400 block">วันที่สั่งซื้อ</span>
                    <span className="font-medium text-slate-800">
                      {figure.purchase_date || 'ไม่ระบุ'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-600">
                  <Tag className="w-4 h-4 text-purple-600" />
                  <div>
                    <span className="text-xs text-slate-400 block">สถานะ</span>
                    <span className="font-medium text-slate-800">{figure.status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ปุ่มเปิด Modal เพิ่ม/แก้ไข Custom Note */}
            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl shadow transition-colors cursor-pointer"
              >
                <Palette className="w-4 h-4" />
                {customNotes ? 'แก้ไข Custom Notes' : 'เพิ่ม Custom Notes'}
              </button>
            </div>
          </div>
        </div>

        {/* แสดงส่วน Custom Notes */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Palette className="w-5 h-5 text-indigo-600" />
              Custom Notes (บันทึกงานปรับแต่ง)
            </h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              แก้ไข
            </button>
          </div>

          {customNotes ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="font-semibold text-slate-700 mb-1">✏️ งานดีเทล / เดินลาย</p>
                <p className="text-slate-600 whitespace-pre-wrap">{customNotes.detail_note || '-'}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="font-semibold text-slate-700 mb-1">🎨 งานทำสี / พ่นสี</p>
                <p className="text-slate-600 whitespace-pre-wrap">{customNotes.paint_note || '-'}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="font-semibold text-slate-700 mb-1">🏷️ งานติดดีเคล</p>
                <p className="text-slate-600 whitespace-pre-wrap">{customNotes.decal_note || '-'}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              ยังไม่มี Custom Notes สำหรับฟิกเกอร์นี้
            </div>
          )}
        </div>
      </div>

      {/* Modal Custom Note */}
      <CustomNoteModal
        item={figure}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchFigureData}
      />
    </main>
  );
}