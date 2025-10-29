import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI CV Generator Pro — Cover Letter',
  description: 'Generate personalized Cover Letters that match your CV style.',
}

export default function CoverLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

