import Navbar from '@/components/layout/Navbar'
import NotificationPopup from '@/components/NotificationPopup'
import '@/app/globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body className="bg-white min-h-screen">
        <Navbar />
        <main>{children}</main>
        <NotificationPopup />
      </body>
    </html>
  )
}