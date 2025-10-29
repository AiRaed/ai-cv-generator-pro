import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI CV Generator Pro – Resume Builder',
  description: 'Create, edit, and optimize your professional CV. Professional AI-powered CV builder for executives, creatives, and academics.',
}

export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}



