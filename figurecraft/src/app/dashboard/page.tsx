import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. ตรวจสอบ Session ผู้ใช้
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // 2. ดึงรายการ figure ทั้งหมดของผู้ใช้นี้
  const { data: figures, error } = await supabase
    .from('figure_items')
    .select('status, price')
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching figures:', error);
  }

  // 3. คำนวณ สถิติต่างๆ
  const totalFigures = figures?.length || 0;
  const builtCount = figures?.filter(item => item.status === 'built').length || 0;
  const unbuiltCount = figures?.filter(item => item.status === 'unbuilt').length || 0;
  const orderedCount = figures?.filter(item => item.status === 'ordered').length || 0;

  // (Optional) คำนวณมูลค่ารวม
  const totalPrice = figures?.reduce((sum, item) => sum + (Number(item.price) || 0), 0) || 0;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Overview Dashboard</h1>

      {/* Grid แสดง Card สรุปข้อมูล 4 ช่อง */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* Card 1: ฟิกเกอร์ทั้งหมด */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500">ฟิกเกอร์ทั้งหมด</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-2">{totalFigures} <span className="text-base font-normal text-gray-500">ตัว</span></p>
        </div>

        {/* Card 2: ต่อเสร็จแล้ว */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-emerald-600">ต่อเสร็จแล้ว</p>
          <p className="text-3xl font-extrabold text-emerald-600 mt-2">{builtCount} <span className="text-base font-normal text-gray-500">ตัว</span></p>
        </div>

        {/* Card 3: ยังไม่ได้ต่อ (Dอง) */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-amber-600">ยังไม่ได้ต่อ (ดอง)</p>
          <p className="text-3xl font-extrabold text-amber-600 mt-2">{unbuiltCount} <span className="text-base font-normal text-gray-500">ตัว</span></p>
        </div>

        {/* Card 4: สั่งซื้อแล้ว (รอของ) */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-blue-600">สั่งแล้ว (รอของ)</p>
          <p className="text-3xl font-extrabold text-blue-600 mt-2">{orderedCount} <span className="text-base font-normal text-gray-500">ตัว</span></p>
        </div>

      </div>

      {/* สรุปมูลค่าสะสม (แถม) */}
      <div className="bg-slate-900 text-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold text-slate-300">มูลค่ากรุรวมทั้งหมด</h2>
        <p className="text-3xl font-bold mt-1">
          ฿{totalPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
}