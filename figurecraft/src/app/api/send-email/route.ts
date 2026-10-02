// src/app/api/send-email/route.ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { to, subject, figureName, unbuiltCount } = await req.json();

    const data = await resend.emails.send({
      from: 'Onboarding <onboarding@resend.dev>', // หรือใช้โดเมนของคุณเองเมื่อ Verify domain แล้ว
      to: [to],
      subject: subject || 'แจ้งเตือนรายการฟิกเกอร์ของคุณ',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>สวัสดีครับ! แจ้งเตือนจากระบบสะสมฟิกเกอร์</h2>
          <p>คุณมีรายการฟิกเกอร์ที่ยังไม่ได้ต่อค้างอยู่: <strong>${unbuiltCount} รายการ</strong></p>
          ${figureName ? `<p>รายการล่าสุด: <strong>${figureName}</strong></p>` : ''}
          <hr />
          <p style="font-size: 12px; color: #888;">อีเมลนี้ส่งจากระบบอัตโนมัติ</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}