import Navbar from '@/components/layout/Navbar'[cite: 3]
import '@/app/globals.css'[cite: 3]

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