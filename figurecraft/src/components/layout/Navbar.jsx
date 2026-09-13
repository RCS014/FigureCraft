'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const [user, setUser] = useState(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    // ดึงข้อมูล User ปัจจุบัน
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    // ติดตามสถานะเปลี่ยนแปลง Login / Logout
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="flex justify-between items-center p-4 bg-gray-800 text-white">
      <Link href="/" className="font-bold text-xl">FigureCraft</Link>
      
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <Link href="/settings" className="hover:underline">Settings</Link>
            <button 
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition"
            >
              Sign out
            </button>
          </>
        ) : (
          <Link 
            href="/login" 
            className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded transition"
          >
            Sign in
          </Link>
        )}
      </div>
    </nav>
  )
}