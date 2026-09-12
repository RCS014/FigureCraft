'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'[cite: 3]

export default function Navbar({ user, onAddFigureClick }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const dropdownRef = useRef(null)
  const supabase = createClient()

  // ปิด Dropdown เมื่อคลิกนอกพื้นที่เมนู
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ฟังก์ชัน Logout ผ่าน Supabase Auth
  const handleLogout = async () => {
    setIsProfileOpen(false)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navItems = [
    {
      label: 'Home',
      href: '/',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      ),
    },
    {
      label: 'Add Figure',
      href: '/add',
      onClick: onAddFigureClick,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      ),
    },
    {
      label: 'Stats',
      href: '/stats',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M4 9h4v11H4zm6-5h4v16h-4zm6 8h4v8h-4z" />
        </svg>
      ),
    },
  ]

  return (
    <nav className="bg-white border-b border-gray-300 relative z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        
        {/* 1. เมนูนำทางฝั่งซ้าย (Home, Add Figure, Stats) */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const itemClasses = `flex items-center gap-2 px-3 py-1.5 rounded-md text-base font-semibold transition-colors ${
              isActive
                ? 'bg-gray-200 text-black' // Highlight พื้นหลังสีเทาอ่อนตามรูปที่ 2
                : 'text-black hover:bg-gray-100'
            }`

            if (item.onClick) {
              return (
                <button key={item.label} onClick={item.onClick} className={itemClasses}>
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              )
            }

            return (
              <Link key={item.label} href={item.href} className={itemClasses}>
                {item.icon}
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>

        {/* 2. เมนูโปรไฟล์วงกลมฝั่งขวา + Dropdown (รูป 3) */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-9 h-9 rounded-full bg-gray-300 hover:bg-gray-400 flex items-center justify-center transition focus:outline-none"
            aria-label="User menu"
          >
            <div className="w-full h-full rounded-full bg-gray-300" />
          </button>

          {/* Popover Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-800 rounded-lg shadow-md py-1.5 z-50">
              <Link
                href="/settings"
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition"
              >
                <svg className="w-5 h-5 stroke-current fill-none" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Settings</span>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition"
              >
                <svg className="w-5 h-5 stroke-current fill-none" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </nav>
  )
}