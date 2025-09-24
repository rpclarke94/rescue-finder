import './globals.css'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import Image from 'next/image'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Rescue Finder - Find Your Perfect Companion',
  description: 'Discover loving rescue dogs looking for their forever homes across the UK',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link href="/" className="flex items-center">
                  <Image
                    src="/images/rflogo3.png"
                    alt="Rescue Finder"
                    width={300}
                    height={75}
                    className="h-16 w-auto"
                  />
                </Link>
              </div>
              <div className="block">
                <div className="ml-4 md:ml-10 flex items-baseline space-x-2 md:space-x-4">
                  <Link href="/faq" className="text-gray-600 hover:text-blue-300 px-2 md:px-3 py-2 rounded-md text-sm md:text-base font-medium">
                    FAQ
                  </Link>
                  <Link href="/about" className="text-gray-600 hover:text-blue-300 px-2 md:px-3 py-2 rounded-md text-sm md:text-base font-medium">
                    About
                  </Link>
                  <Link href="/contact" className="text-gray-600 hover:text-blue-300 px-2 md:px-3 py-2 rounded-md text-sm md:text-base font-medium">
                    Contact
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="min-h-screen">
          {children}
        </main>

        <footer className="bg-gray-800 text-white">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-300 mb-6">
                Rescue Finder - Helping rescue dogs find their forever homes across the UK
              </p>

              {/* All Navigation Links */}
              <div className="mb-6">
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
                  <Link href="/" className="text-gray-400 hover:text-white underline transition-colors">
                    Home
                  </Link>
                  <Link href="/faq" className="text-gray-400 hover:text-white underline transition-colors">
                    FAQ
                  </Link>
                  <Link href="/about" className="text-gray-400 hover:text-white underline transition-colors">
                    About
                  </Link>
                  <Link href="/contact" className="text-gray-400 hover:text-white underline transition-colors">
                    Contact
                  </Link>
                  <Link href="/terms" className="text-gray-400 hover:text-white underline transition-colors">
                    Terms & Conditions
                  </Link>
                  <Link href="/privacy" className="text-gray-400 hover:text-white underline transition-colors">
                    Privacy Policy
                  </Link>
                </div>
              </div>

              <p className="text-sm text-gray-400">
                © 2024 Rescue Finder. Made with ❤️ for rescue dogs everywhere.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}