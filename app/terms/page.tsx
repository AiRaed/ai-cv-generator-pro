'use client'

import { motion } from 'framer-motion'
import { Sparkles, Scale } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-platinum dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-violet-accent" />
            <span className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
              AI CV Generator Pro
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/builder">
              <span className="text-sm text-violet-600 dark:text-violet-400 hover:underline">
                Get Started
              </span>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 md:py-20 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-violet-accent/10 rounded-xl flex items-center justify-center">
              <Scale className="w-6 h-6 text-violet-accent" />
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-violet-accent to-purple-600 bg-clip-text text-transparent">
              Terms & Conditions
            </h1>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Last updated: October 2025
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-8 md:p-12 shadow-soft space-y-8"
        >
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Welcome to AI CV Generator Pro. By accessing or using our service, you agree to the following terms:
            </p>

            <section className="mt-8">
              <h2 className="text-2xl font-heading font-semibold mb-4 text-gray-900 dark:text-white">
                1. Service Overview
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                AI CV Generator Pro provides AI-powered tools to create and enhance CVs and cover letters. You may use these tools for personal and professional purposes only.
              </p>
            </section>

            <section className="mt-8">
              <h2 className="text-2xl font-heading font-semibold mb-4 text-gray-900 dark:text-white">
                2. Payments
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Our payment system is securely powered by Stripe. Refunds are not issued for AI usage once access has been granted.
              </p>
            </section>

            <section className="mt-8">
              <h2 className="text-2xl font-heading font-semibold mb-4 text-gray-900 dark:text-white">
                3. Intellectual Property
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                All website content, design elements, and AI outputs remain the intellectual property of AI CV Generator Pro. You may use generated CVs and letters freely for personal use.
              </p>
            </section>

            <section className="mt-8">
              <h2 className="text-2xl font-heading font-semibold mb-4 text-gray-900 dark:text-white">
                4. Limitation of Liability
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We are not responsible for any job outcomes, losses, or damages resulting from the use of our AI tools.
              </p>
            </section>

            <section className="mt-8">
              <h2 className="text-2xl font-heading font-semibold mb-4 text-gray-900 dark:text-white">
                5. Updates to Terms
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We may update these terms occasionally to reflect platform improvements or new legal requirements.
              </p>
            </section>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <Link
            href="/"
            className="text-violet-600 dark:text-violet-400 hover:underline inline-flex items-center gap-2"
          >
            ← Back to Home
          </Link>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
            <p>© 2024 AI CV Generator Pro. Built with Next.js & OpenAI.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-violet-600 dark:hover:text-violet-400 hover:underline">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-violet-600 dark:hover:text-violet-400 hover:underline">
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}



