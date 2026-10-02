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

    if (!supabaseUrl || !supabaseServiceKey || !gmailUser || !gmailAppPassword) {
      return NextResponse.json(
        { error: 'Environment variables missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. ดึง Profile ที่เปิดใช้งานการแจ้งเตือน
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, name, is_notification_enabled')
      .eq('is_notification_enabled', true);

    if (error) throw error;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });

    const logs: any[] = [];

    if (profiles && profiles.length > 0) {
      for (const profile of profiles) {
        // 2. ดึงข้อมูล User จาก auth.users
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(profile.id);
        
        if (userError) {
          logs.push({ profileId: profile.id, status: 'error_fetch_user', error: userError.message });
          continue;
        }

        const userEmail = userData?.user?.email;

        if (userEmail) {
          // 3. ส่งอีเมล
          await transporter.sendMail({
            from: `"FigureCraft" <${gmailUser}>`,
            to: userEmail,
            subject: '🧪 [Test] ทดสอบส่งอีเมลจาก Supabase Auth - FigureCraft',
            html: `
              <div style="font-family: sans-serif; padding: 20px;">
                <h2>สวัสดีครับคุณ ${profile.name}</h2>
                <p>อีเมลนี้ส่งมาจากระบบทดสอบ โดยดึงอีเมล <strong>(${userEmail})</strong> จาก Supabase Auth สำเร็จ!</p>
              </div>
            `,
          });

          logs.push({ profileId: profile.id, email: userEmail, status: 'sent' });
        } else {
          logs.push({ profileId: profile.id, status: 'no_email_found' });
        }
      }
    }

    return NextResponse.json({ success: true, processed: profiles?.length || 0, logs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}