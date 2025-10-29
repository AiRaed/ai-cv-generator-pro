'use client'

import { Download, FileText } from 'lucide-react'
import { useCVStore } from '@/lib/cv-store'
import { exportToPDF, exportToDOCX } from '@/lib/export-utils'

export default function PreviewPanel() {
  const { cvData, generatedCV, setLayout } = useCVStore()

  const handleExportPDF = async () => {
    try {
      await exportToPDF()
    } catch (error) {
      console.error('PDF export error:', error)
      alert('PDF export is not fully implemented. Please use browser print feature as alternative.')
    }
  }

  const handleExportDOCX = async () => {
    try {
      await exportToDOCX()
    } catch (error) {
      console.error('DOCX export error:', error)
      alert('DOCX export is not fully implemented.')
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg sticky top-24">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-display font-bold text-graphite dark:text-platinum">Preview</h2>
        <div className="flex gap-2">
          <button
            onClick={handleExportPDF}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
            title="Export PDF"
          >
            <Download size={20} />
          </button>
          <button
            onClick={handleExportDOCX}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
            title="Export DOCX"
          >
            <FileText size={20} />
          </button>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-950 rounded-xl p-6 min-h-[400px] max-h-[600px] overflow-y-auto">
        {generatedCV ? (
          <div id="cv-preview" className="prose prose-sm max-w-none dark:prose-invert">
            <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{generatedCV}</div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 bg-violet/10 rounded-full flex items-center justify-center mb-4">
              <FileText className="text-violet" size={32} />
            </div>
            <p className="text-gray-500 dark:text-gray-400">Your CV will appear here...</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Fill in your information and use AI to generate content.</p>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">💡 Pro Tip</p>
        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">Try different layouts to see which style fits your profession best.</p>
      </div>
    </div>
  )
}

