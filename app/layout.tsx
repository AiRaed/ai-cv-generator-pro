import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientProviders from './client-providers'

const inter = Inter({ subsets: ['latin'] })

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ai-cv-pro.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: 'AI CV Generator Pro',
  description: 'Create professional CVs and Cover Letters with AI in minutes.',
  keywords: ['CV generator', 'resume builder', 'AI resume', 'ATS optimization', 'cover letter', 'professional CV', 'GPT-4', 'CV maker'],
  authors: [{ name: 'AI CV Generator Pro' }],
  creator: 'AI CV Generator Pro',
  publisher: 'AI CV Generator Pro',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: appUrl,
    siteName: 'AI CV Generator Pro',
    title: 'AI CV Generator Pro',
    description: 'Create professional CVs and Cover Letters with AI in minutes.',
    images: [
      {
        url: `${appUrl}/og-image`,
        width: 1200,
        height: 630,
        alt: 'AI CV Generator Pro',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI CV Generator Pro',
    description: 'Create professional CVs and Cover Letters with AI in minutes.',
    images: [`${appUrl}/og-image`],
    creator: '@aicvpro',
    site: '@aicvpro',
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/icon.svg',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AI CV Generator Pro',
  },
  formatDetection: {
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#7C3AED" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
                {/* Google Analytics */}
                <script async src="https://www.googletagmanager.com/gtag/js?id=G-4C7FJMZQFJ"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-4C7FJMZQFJ');
            `,
          }}
        />

      </head>
      <body className={`${inter.className} transition-colors duration-300`}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
