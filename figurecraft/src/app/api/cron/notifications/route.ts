// src/app/api/cron/notifications/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export async function GET(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;

    // ตรวจสอบว่ามี Environment Variables ก่อนเริ่มทำงาน
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase environment variables' },
        { status: 500 }
      );
    }

    // สร้าง Client ไว้ภายใน Handler
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    // 1. ดึงข้อมูล Profile ที่เปิดใช้งานแจ้งเตือน (is_notification_enabled = true)
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, name, is_notification_enabled')
      .eq('is_notification_enabled', true);

    if (error) throw error;

    // 2. วนลูปตรวจสอบและส่งอีเมล (ตัวอย่างภาพรวม)
    if (profiles) {
      for (const profile of profiles) {
        // ดึง email ผู้ใช้จาก auth.users หรือส่งผ่าน Resend
        // และดึง unbuilt_count จาก figure_items มาประมวลผล
        
        /* ตัวอย่างส่งอีเมล:
        await resend.emails.send({
          from: 'Onboarding <onboarding@resend.dev>',
          to: ['user@example.com'],
          subject: 'แจ้งเตือนประจำวัน: รายการฟิกเกอร์ที่ยังไม่ได้ต่อ',
          html: `<p>คุณมีฟิกเกอร์ยังไม่ได้ต่ออยู่ในคอลเลกชัน!</p>`
        });
        */
      }
    }

    return NextResponse.json({ success: true, processed: profiles?.length || 0 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}