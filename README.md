# AI CV Generator Pro

A premium, production-ready Next.js 14 application for generating AI-powered professional CVs and cover letters with GPT-4.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![License](https://img.shields.io/badge/license-Proprietary-red)

## 🚀 Features

- **AI-Powered Generation**: Generate professional CVs using GPT-4 Turbo
- **Multiple Rewrite Modes**: Enhance, Executive, Creative Portfolio, Academic Formal
- **AI Compare**: Compare 3 different CV variations side-by-side
- **Cover Letter Builder**: Generate tailored cover letters with AI
- **ATS Optimized**: Ensures compatibility with Applicant Tracking Systems
- **Export Ready**: PDF and DOCX export capabilities
- **Dark Mode**: Elegant light/dark theme switching with system preference detection
- **Responsive Design**: Mobile-friendly and beautifully designed
- **Toast Notifications**: Global toast system for user feedback
- **Sample Presets**: Quick-start templates for Executive, Creative, and Academic profiles

## 📸 Screenshots

_Coming soon - Add screenshots of the landing page, builder interface, and preview modes._

## 🛠️ Tech Stack

- **Next.js 14** (App Router + TypeScript)
- **TailwindCSS** + **Framer Motion**
- **OpenAI API** (GPT-4 Turbo)
- **Shadcn/UI** components
- **Lucide** icons
- **Zustand** state management
- **html2pdf.js** for PDF export
- **docx** for DOCX export

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation Steps

1. **Clone and install**
   ```bash
   cd ai-cv-launch-pro
   npm install
   ```

2. **Configure environment**
   Create `.env.local` in the root directory:
   ```bash
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```
   
4. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production
```bash
npm run build
npm start
```

## 🎨 Design System

- **Colors**: Graphite (#1C1C1E), Platinum (#EAEAEA), Violet Accent (#7C3AED)
- **Fonts**: Space Grotesk (headings), Inter/DM Sans (body)
- **Border Radius**: Rounded-2xl cards
- **Shadows**: Soft shadows with subtle motion

## 📁 Project Structure

```
ai-cv-launch-pro/
├── app/
│   ├── api/           # API routes (generate, rewrite, compare)
│   ├── builder/       # CV builder page
│   ├── preview/       # CV preview page
│   ├── upgrade/       # Upgrade page
│   ├── layout.tsx     # Root layout
│   ├── page.tsx       # Landing page
│   └── globals.css    # Global styles
├── components/        # Reusable components
├── lib/              # Utilities and state management
└── public/           # Static assets
```

## 🔑 API Routes

All API routes support graceful degradation when `OPENAI_API_KEY` is not configured - they return deterministic mock responses.

### `/api/generate`
Generate a CV from keywords
- **Method**: POST
- **Body**: `{ keywords: string, personalInfo?: object, tone?: string, type?: string }`
- **Response**: `{ ok: boolean, content: string }`

### `/api/rewrite`
Rewrite content in different modes
- **Method**: POST
- **Body**: `{ content: string, mode: 'enhance' | 'executive' | 'creative' | 'academic' | 'quantify' }`
- **Response**: `{ ok: boolean, content: string }`

### `/api/compare`
Compare CV variations - generates 3 variants
- **Method**: POST
- **Body**: `{ content: string, keywords?: string }`
- **Response**: `{ ok: boolean, variants: Array<{id: 'A'|'B'|'C', content: string}> }`

### `/api/cover`
Generate cover letters
- **Method**: POST
- **Body**: `{ fullName: string, roleTitle: string, recipientName?: string, company?: string, keywords?: string, tone?: 'Professional'|'Friendly', length?: 'Short'|'Medium'|'Long' }`
- **Response**: `{ ok: boolean, content: string }`

## 🎯 Pages

- **`/`** - Landing page with hero, features, and CTA
- **`/builder`** - Main CV builder with tabs, AI engine, and preview
- **`/preview`** - Full CV preview with style selector
- **`/upgrade`** - Subscription plans and upgrade page

## 🚦 Getting Started

1. Start with the landing page to learn about features
2. Go to `/builder` to start creating your CV
3. Use the AI Engine to generate content from keywords
4. Try different AI rewrite modes (Enhance, Executive, Creative, Academic)
5. Use AI Compare to see multiple variations
6. Select your preferred layout
7. Export as PDF or DOCX

## 📝 Notes

- **OpenAI API**: Make sure to add your API key in `.env.local`
- **Mock Mode**: If no API key is configured, the app uses mock responses
- **Production**: Deploy to Vercel for seamless integration

## 🔒 Environment Variables

```
OPENAI_API_KEY=your_openai_api_key_here
```

## 📄 License

© 2024 AI CV Generator Pro · Built with Next.js & OpenAI

---

**Ready for ProductHunt or Vercel Showcase** 🚀
