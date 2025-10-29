'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, FileText, CheckCircle, Rocket, CreditCard, LockOpen } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { startCheckout } from '@/lib/checkout'
import { usePaywall } from '@/lib/usePaywall'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const { isUnlocked } = usePaywall()
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  const handleCheckout = async () => {
    setCheckoutLoading(true)
    try {
      await startCheckout()
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      // Don't set loading to false if redirecting
      // The redirect will happen in startCheckout
    }
  }

  const handleOpenBuilder = () => {
    router.push('/builder')
  }
  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-platinum to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-violet-accent" />
            <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
              AI CV Generator Pro
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/builder">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="relative">
          {/* Background glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl opacity-90 -z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-fuchsia-500/20 blur-3xl -z-10"></div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto px-8 py-16 relative z-0"
          >
            {/* Marketing Tagline */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <p className="text-sm md:text-base text-violet-400 tracking-wide uppercase mb-3 text-center">
                Instant AI CV Builder — no signup required
              </p>
            </motion.div>
            
            {/* Main Headline with glow */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-accent to-purple-600 blur-2xl opacity-30 -z-10"></div>
              <h2 className="text-6xl font-heading font-bold mb-6 bg-gradient-to-r from-violet-accent to-purple-600 bg-clip-text text-transparent relative z-0">
                Redefine your Professional Presence with AI
              </h2>
            </motion.div>
            
            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                The most advanced AI-powered CV builder for professionals, executives, creatives, and academics. Generate, enhance, and optimize your resume with the power of GPT-4.
              </p>
            </motion.div>
            
            {/* Cover Letter Line */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <p className="text-base md:text-lg opacity-90 mt-2 text-gray-300 dark:text-gray-300 mb-12 leading-relaxed">
                Craft personalized Cover Letters that match your CV tone and style — all powered by the same AI engine.
              </p>
            </motion.div>
            
            {/* Buttons Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-col items-center justify-center gap-4 mb-4 w-full"
            >
              {/* Try Now Buttons */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full md:w-auto">
                <Link href="/builder" className="w-full md:w-auto">
                  <Button
                    className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-8 py-3 text-lg rounded-2xl shadow-lg hover:scale-105 transition-all w-full md:w-auto"
                  >
                    Try AI CV Generator
                  </Button>
                </Link>
                <Link href="/cover" className="w-full md:w-auto">
                  <Button
                    className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-8 py-3 text-lg rounded-2xl shadow-lg hover:scale-105 transition-all w-full md:w-auto"
                  >
                    Try AI Cover Letter Generator
                  </Button>
                </Link>
              </div>
              {isUnlocked ? (
                <Button
                  onClick={handleOpenBuilder}
                  className="border border-violet-400 text-violet-300 px-8 py-3 text-lg rounded-2xl hover:bg-violet-950/40 w-full md:w-auto"
                >
                  <LockOpen className="w-5 h-5 mr-2" />
                  Open Builder
                </Button>
              ) : (
                <Button
                  isLoading={checkoutLoading}
                  onClick={handleCheckout}
                  className="border border-violet-400 text-violet-300 px-8 py-3 text-lg rounded-2xl hover:bg-violet-950/40 w-full md:w-auto"
                >
                  Pay with Stripe — £1.99
                </Button>
              )}
            </motion.div>
            
            {/* Trust Caption */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <p className="text-xs text-gray-400 text-center mt-4">
                Secure checkout powered by Stripe · No account needed · Instant access
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-3 gap-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-soft hover:shadow-medium transition-shadow"
          >
            <div className="w-14 h-14 bg-violet-accent/10 rounded-2xl flex items-center justify-center mb-4">
              <Sparkles className="w-7 h-7 text-violet-accent" />
            </div>
            <h3 className="text-2xl font-heading font-semibold mb-3">AI-Powered</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Generate professional CVs and cover letters using GPT-4. Get expert-level content in seconds.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-soft hover:shadow-medium transition-shadow"
          >
            <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center mb-4">
              <CheckCircle className="w-7 h-7 text-green-500" />
            </div>
            <h3 className="text-2xl font-heading font-semibold mb-3">ATS Optimized</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Ensure your CV passes Applicant Tracking Systems. Industry-standard formats and keywords.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-soft hover:shadow-medium transition-shadow"
          >
            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4">
              <FileText className="w-7 h-7 text-blue-500" />
            </div>
            <h3 className="text-2xl font-heading font-semibold mb-3">Export Ready</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Download as PDF or DOCX. Multiple layout styles. Print-ready professional formats.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-violet-accent to-purple-600 rounded-3xl p-12 text-center text-white"
        >
          <Rocket className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-4xl font-heading font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of professionals who have elevated their careers with AI CV Generator Pro.
          </p>
          <Link href="/builder">
            <Button size="lg" className="bg-white text-violet-accent hover:bg-gray-100">
              Start Building Your CV
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
            <p>© 2024 AI CV Generator Pro · Built with Next.js & OpenAI</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-violet-600 dark:hover:text-violet-400 hover:underline">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-violet-600 dark:hover:text-violet-400 hover:underline">
                Terms & Conditions
              </Link>
            </div>
          </div>
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">AICVGenerator@outlook.com</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
