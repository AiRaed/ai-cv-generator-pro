import { CVData } from '@/lib/cv-state'

export type LayoutStyle = 'minimal' | 'modern' | 'corporate' | 'portfolio'

interface RenderOptions {
  layout: LayoutStyle
  data: CVData
}

// ATS Mode sanitization
function sanitizeForATS(text: string): string {
  if (!text) return ''
  // Remove emojis
  return text.replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
    .replace(/[^\w\s\-\.,;:!?'"()\[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function renderSkill(skill: any): string {
  if (typeof skill === 'string') return skill
  return skill.name
}

export function renderCVLayout({ layout, data }: RenderOptions): string {
  switch (layout) {
    case 'minimal':
      return renderMinimalLayout(data)
    case 'modern':
      return renderModernLayout(data)
    case 'corporate':
      return renderCorporateLayout(data)
    case 'portfolio':
      return renderPortfolioLayout(data)
    default:
      return renderModernLayout(data)
  }
}

function renderMinimalLayout(data: CVData): string {
  const { personalInfo, summary, experiences, educations, skills } = data
  
  return `
    <div class="cv-minimal font-sans text-gray-900 dark:text-gray-100 space-y-6">
      <!-- Header -->
      <div class="text-center border-b border-gray-300 dark:border-gray-700 pb-4 mb-6">
        <h1 class="text-3xl font-heading font-bold mb-2">${personalInfo.name}</h1>
        <div class="flex flex-wrap justify-center gap-3 text-sm text-gray-600 dark:text-gray-400">
          ${personalInfo.email && `<span>${personalInfo.email}</span>`}
          ${personalInfo.phone && `<span>• ${personalInfo.phone}</span>`}
          ${personalInfo.portfolio && `<span>• ${personalInfo.portfolio}</span>`}
        </div>
        ${personalInfo.linkedin && `<p class="text-sm mt-2">${personalInfo.linkedin}</p>`}
      </div>

      <!-- Summary -->
      ${summary ? `
        <div>
          <h2 class="text-lg font-semibold mb-2 uppercase tracking-wide">Summary</h2>
          <p class="text-sm leading-relaxed whitespace-pre-wrap">${summary}</p>
        </div>
      ` : ''}

      <!-- Experience -->
      ${experiences.length > 0 ? `
        <div>
          <h2 class="text-lg font-semibold mb-4 uppercase tracking-wide">Experience</h2>
          <div class="space-y-4">
            ${experiences.map(exp => `
              <div>
                <div class="flex justify-between items-start mb-1">
                  <h3 class="font-semibold">${exp.title}</h3>
                  <span class="text-sm text-gray-600 dark:text-gray-400">${exp.startDate} - ${exp.endDate}</span>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">${exp.company}</p>
                <p class="text-sm leading-relaxed whitespace-pre-wrap">${exp.description}</p>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Education -->
      ${educations.length > 0 ? `
        <div>
          <h2 class="text-lg font-semibold mb-4 uppercase tracking-wide">Education</h2>
          <div class="space-y-3">
            ${educations.map(edu => `
              <div>
                <h3 class="font-semibold">${edu.degree}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">${edu.school} - ${edu.year}</p>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Skills -->
      ${skills.length > 0 ? `
        <div>
          <h2 class="text-lg font-semibold mb-2 uppercase tracking-wide">Skills</h2>
          <p class="text-sm">${skills.map(renderSkill).join(' • ')}</p>
        </div>
      ` : ''}
    </div>
  `.trim()
}

function renderModernLayout(data: CVData): string {
  const { personalInfo, summary, experiences, educations, skills } = data
  
  return `
    <div class="cv-modern bg-white dark:bg-gray-900 rounded-2xl shadow-md p-8">
      <!-- Header -->
      <div class="border-b-2 border-violet-accent pb-4 mb-6">
        <h1 class="text-4xl font-heading font-bold mb-2">${personalInfo.name}</h1>
        <div class="flex flex-wrap gap-4 text-gray-600 dark:text-gray-400">
          ${personalInfo.email && `<span>✉ ${personalInfo.email}</span>`}
          ${personalInfo.phone && `<span>📱 ${personalInfo.phone}</span>`}
          ${personalInfo.portfolio && `<span>📍 ${personalInfo.portfolio}</span>`}
        </div>
        ${personalInfo.linkedin && `<p class="text-violet-accent mt-2">🔗 ${personalInfo.linkedin}</p>`}
      </div>

      <!-- Summary -->
      ${summary ? `
        <div class="mb-6">
          <h2 class="text-2xl font-heading font-semibold mb-3 text-violet-accent">Professional Summary</h2>
          <p class="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">${summary}</p>
        </div>
      ` : ''}

      <!-- Experience -->
      ${experiences.length > 0 ? `
        <div class="mb-6">
          <h2 class="text-2xl font-heading font-semibold mb-4 text-violet-accent">Professional Experience</h2>
          <div class="space-y-6">
            ${experiences.map((exp, i) => `
              <div class="border-l-4 border-violet-accent pl-4">
                <div class="flex justify-between items-start mb-2">
                  <h3 class="text-xl font-semibold">${exp.title}</h3>
                  <span class="text-sm text-gray-600 dark:text-gray-400">${exp.startDate} - ${exp.endDate}</span>
                </div>
                <p class="text-violet-accent font-medium mb-2">${exp.company}</p>
                <p class="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">${exp.description}</p>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Education -->
      ${educations.length > 0 ? `
        <div class="mb-6">
          <h2 class="text-2xl font-heading font-semibold mb-4 text-violet-accent">Education</h2>
          <div class="space-y-4">
            ${educations.map(edu => `
              <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <h3 class="text-lg font-semibold">${edu.degree}</h3>
                <p class="text-gray-600 dark:text-gray-400">${edu.school}</p>
                <p class="text-sm text-gray-500">${edu.year}</p>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Skills -->
      ${skills.length > 0 ? `
        <div>
          <h2 class="text-2xl font-heading font-semibold mb-4 text-violet-accent">Skills</h2>
          <div class="flex flex-wrap gap-2">
            ${skills.map(skill => `
              <span class="px-4 py-2 bg-violet-accent/10 text-violet-accent rounded-xl text-sm font-medium">
                ${renderSkill(skill)}
              </span>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `.trim()
}

function renderCorporateLayout(data: CVData): string {
  const { personalInfo, summary, experiences, educations, skills } = data
  
  return `
    <div class="cv-corporate bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-lg p-8">
      <!-- Header -->
      <div class="bg-violet-accent/10 dark:bg-violet-accent/5 rounded-2xl p-6 mb-6">
        <h1 class="text-5xl font-heading font-bold mb-4">${personalInfo.name}</h1>
        <div class="grid grid-cols-2 gap-3 text-sm">
          ${personalInfo.email && `<div class="flex items-center gap-2">📧 ${personalInfo.email}</div>`}
          ${personalInfo.phone && `<div class="flex items-center gap-2">📞 ${personalInfo.phone}</div>`}
          ${personalInfo.portfolio && `<div class="flex items-center gap-2">📍 ${personalInfo.portfolio}</div>`}
          ${personalInfo.linkedin && `<div class="flex items-center gap-2">🔗 ${personalInfo.linkedin}</div>`}
        </div>
      </div>

      <!-- Summary -->
      ${summary ? `
        <div class="mb-8">
          <h2 class="text-xl font-bold mb-3 text-gray-800 dark:text-gray-200">EXECUTIVE SUMMARY</h2>
          <div class="h-1 w-20 bg-violet-accent mb-3"></div>
          <p class="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">${summary}</p>
        </div>
      ` : ''}

      <!-- Experience -->
      ${experiences.length > 0 ? `
        <div class="mb-8">
          <h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">PROFESSIONAL EXPERIENCE</h2>
          <div class="h-1 w-20 bg-violet-accent mb-4"></div>
          <div class="space-y-6">
            ${experiences.map(exp => `
              <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <h3 class="text-xl font-bold">${exp.title}</h3>
                    <p class="text-violet-accent font-semibold">${exp.company}</p>
                  </div>
                  <span class="text-sm text-gray-600 dark:text-gray-400">${exp.startDate} - ${exp.endDate}</span>
                </div>
                <p class="text-gray-700 dark:text-gray-300 mt-2 leading-relaxed whitespace-pre-wrap">${exp.description}</p>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Education -->
      ${educations.length > 0 ? `
        <div class="mb-8">
          <h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">EDUCATION</h2>
          <div class="h-1 w-20 bg-violet-accent mb-4"></div>
          <div class="space-y-3">
            ${educations.map(edu => `
              <div class="flex justify-between items-center">
                <div>
                  <h3 class="font-semibold">${edu.degree}</h3>
                  <p class="text-gray-600 dark:text-gray-400">${edu.school}</p>
                </div>
                <span class="text-sm text-gray-500">${edu.year}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Skills -->
      ${skills.length > 0 ? `
        <div>
          <h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">CORE COMPETENCIES</h2>
          <div class="h-1 w-20 bg-violet-accent mb-4"></div>
          <div class="flex flex-wrap gap-3">
            ${skills.map(skill => `
              <span class="px-6 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-medium">
                ${renderSkill(skill)}
              </span>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `.trim()
}

function renderPortfolioLayout(data: CVData): string {
  const { personalInfo, summary, experiences, educations, skills } = data
  
  return `
    <div class="cv-portfolio bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 text-white rounded-2xl shadow-2xl overflow-hidden">
      <!-- Header -->
      <div class="bg-white/10 backdrop-blur-sm p-8 mb-8">
        <h1 class="text-5xl font-heading font-bold mb-2">${personalInfo.name}</h1>
        <div class="flex flex-wrap gap-4 text-white/90 text-sm">
          ${personalInfo.email && `<span>${personalInfo.email}</span>`}
          ${personalInfo.phone && `<span>${personalInfo.phone}</span>`}
          ${personalInfo.portfolio && `<span>${personalInfo.portfolio}</span>`}
        </div>
        ${personalInfo.linkedin && `<p class="text-white/80 mt-2">${personalInfo.linkedin}</p>`}
      </div>

      <!-- Content -->
      <div class="p-8 space-y-8">
        <!-- Summary -->
        ${summary ? `
          <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <h2 class="text-2xl font-heading font-bold mb-3">About</h2>
            <p class="text-white/90 leading-relaxed whitespace-pre-wrap">${summary}</p>
          </div>
        ` : ''}

        <!-- Experience -->
        ${experiences.length > 0 ? `
          <div>
            <h2 class="text-2xl font-heading font-bold mb-4">Work Experience</h2>
            <div class="space-y-4">
              ${experiences.map(exp => `
                <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <div class="flex justify-between items-start mb-2">
                    <h3 class="text-xl font-bold">${exp.title}</h3>
                    <span class="text-white/80 text-sm">${exp.startDate} - ${exp.endDate}</span>
                  </div>
                  <p class="text-white/80 font-medium mb-2">${exp.company}</p>
                  <p class="text-white/70 leading-relaxed whitespace-pre-wrap">${exp.description}</p>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Education -->
        ${educations.length > 0 ? `
          <div>
            <h2 class="text-2xl font-heading font-bold mb-4">Education</h2>
            <div class="space-y-3">
              ${educations.map(edu => `
                <div class="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4">
                  <h3 class="font-bold">${edu.degree}</h3>
                  <p class="text-white/80">${edu.school} • ${edu.year}</p>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Skills -->
        ${skills.length > 0 ? `
          <div>
            <h2 class="text-2xl font-heading font-bold mb-4">Skills</h2>
            <div class="flex flex-wrap gap-2">
              ${skills.map(skill => `
                <span class="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                  ${renderSkill(skill)}
                </span>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `.trim()
}
