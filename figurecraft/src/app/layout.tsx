import Navbar from '@/components/layout/Navbar'
import '@/app/globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body className="bg-gray-400 min-h-screen">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}