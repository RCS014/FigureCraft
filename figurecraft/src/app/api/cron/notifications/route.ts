// src/app/api/cron/notifications/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

export async function GET(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

    // 1. ตรวจสอบ Environment Variables
    if (!supabaseUrl || !supabaseServiceKey || !gmailUser || !gmailAppPassword) {
      return NextResponse.json(
        { error: 'Environment variables missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 2. ดึงข้อมูล Profile ที่เปิดการแจ้งเตือน
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, name, is_notification_enabled')
      .eq('is_notification_enabled', true);

    if (error) throw error;

    // 3. สร้าง Transporter สำหรับเชื่อมต่อ Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });

    // 4. วนลูปส่งอีเมล
    if (profiles && profiles.length > 0) {
  for (const profile of profiles) {
    // ดึงข้อมูลผู้ใช้จาก auth.users ด้วย Service Role Key
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(profile.id);
    
    const userEmail = userData?.user?.email;

    if (userEmail) {
      await transporter.sendMail({
        from: `"FigureCraft" <${gmailUser}>`,
        to: userEmail, // 👈 ใช้อีเมลที่ดึงจาก auth.users
        subject: '🔔 รายงานคอลเลกชันฟิกเกอร์ประจำวัน - FigureCraft',
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>สวัสดีครับคุณ ${profile.name}</h2>
            <p>อย่าลืมกลับมาอัปเดตสถานะคอลเลกชันฟิกเกอร์ของคุณในวันนี้!</p>
          </div>
        `,
      });
    }
  }
}

    return NextResponse.json({ success: true, processed: profiles?.length || 0 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}