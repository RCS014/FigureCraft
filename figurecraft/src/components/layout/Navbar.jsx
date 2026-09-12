'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function Navbar({ user }) {
  const pathname = usePathname()
  const router = useRouter()

  // ฟังก์ชันออกจากระบบผ่าน Supabase Auth
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      router.push('/login')
      router.refresh()
    }
  }

  // รายการเมนูหลัก
  const navLinks = [
    { label: '📊 Dashboard', href: '/' },
    { label: '📦 คลังสะสม (Inventory)', href: '/inventory' },
    { label: '🔔 ตั้งค่าการแจ้งเตือน', href: '/settings' },
  ]

  return (
    <nav className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* 1. โลโก้แอปพลิเคชัน */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 text-xl font-extrabold tracking-wide text-indigo-400 hover:text-indigo-300 transition">
              <span>🎨</span>
              <span>FigureCraft</span>
            </Link>
          </div>

          {/* 2. เมนูนำทาง (Desktop) */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* 3. แสดงอีเมลผู้ใช้ และปุ่ม Logout */}
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-xs text-slate-400 hidden sm:inline-block border-r border-slate-700 pr-3">
                {user.email}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="bg-slate-800 hover:bg-red-600/80 border border-slate-700 hover:border-red-500 text-slate-300 hover:text-white px-3 py-1.5 rounded-md text-sm font-medium transition"
            >
              ออกจากระบบ
            </button>
          </div>

        </div>
      </div>
    </nav>
  )
}