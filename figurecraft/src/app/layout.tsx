import Navbar from '@/components/layout/Navbar'
import '@/app/globals.css'

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body className="bg-slate-50 min-h-screen">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </body>
    </html>
  )
}