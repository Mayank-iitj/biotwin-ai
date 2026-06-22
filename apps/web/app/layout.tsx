import type { Metadata } from 'next'
import { Instrument_Sans, Work_Sans } from 'next/font/google'
import './globals.css'

const instrumentSans = Instrument_Sans({ 
  subsets: ['latin'],
  variable: '--font-instrument-sans',
  weight: ['400', '500', '600', '700'],
})

const workSans = Work_Sans({
  subsets: ['latin'],
  variable: '--font-work-sans',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'BioTwin AI - Prevent Today. Protect Tomorrow.',
  description: 'Personalized digital health twin with disease risk forecasting and AI health coaching',
  keywords: ['health', 'wellness', 'AI', 'healthcare', 'disease prediction', 'digital twin'],
  authors: [{ name: 'BioTwin AI' }],
  openGraph: {
    title: 'BioTwin AI - Prevent Today. Protect Tomorrow.',
    description: 'Your personalized Digital Twin for preventive healthcare',
    type: 'website',
  },
}

import { AuthProvider } from '../lib/auth-context'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${instrumentSans.variable} ${workSans.variable}`}>
      <body className="font-sans antialiased text-white">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}