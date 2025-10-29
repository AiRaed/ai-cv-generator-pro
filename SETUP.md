# AI CV Generator Pro - Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure OpenAI API Key

Create a `.env.local` file in the root directory:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

**Getting an OpenAI API Key:**
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy and paste it into your `.env.local` file

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
ai-cv-launch-pro/
├── app/
│   ├── api/           # API routes for OpenAI integration
│   ├── builder/       # CV builder page
│   ├── preview/       # CV preview page
│   ├── upgrade/      # Upgrade page
│   └── page.tsx      # Landing page
├── components/
│   ├── builder/      # Builder-specific components
│   └── theme-provider.tsx  # Theme (dark/light) provider
├── lib/
│   ├── cv-store.ts   # Zustand store for CV data
│   ├── export-utils.ts  # PDF/DOCX export utilities
│   └── utils.ts      # Utility functions
└── ...
```

## Features

### 🤖 AI-Powered CV Generation
- **Generate CV**: Enter keywords** and let AI generate a complete professional CV
- **AI Rewrite**: Modify your CV with different tones:
  - Enhance (Professional)
  - Executive Tone
  - Creative Portfolio
  - Academic Formal
- **AI Compare**: Generate 3 distinct CV variations for side-by-side comparison

### 🎨 Multiple Professional Layouts
Choose from 4 different layouts:
- **Minimal**: Clean and simple
- **Modern**: Contemporary design
- **Corporate**: Professional standard
- **Portfolio**: Creative showcase

### 💾 Export Options
- PDF export (using html2pdf.js)
- DOCX export (using docx library)

### 🌓 Dark Mode
Toggle between light and dark themes

### 📱 Fully Responsive
Optimized for desktop, tablet, and mobile devices

## Usage

### Building Your CV

1. **Navigate to Builder** (/builder)
2. **Fill in Personal Info**: Name, email, phone, location, LinkedIn, website
3. **Add Summary**: Professional summary of your experience
4. **Add Experience**: Previous work experience with descriptions
5. **Add Education**: Educational background
6. **Add Skills**: Technical and soft skills
7. **Select Layout**: Choose your preferred CV layout

### Using AI Features

#### Generate CV
1. Enter keywords describing your role and experience
2. Click "Generate CV"
3. AI will create professional CV content
4. Content appears in the preview panel

#### Rewrite CV
1. Select your desired tone from the dropdown
2. Click "AI Rewrite"
3. Your existing content gets rewritten in the selected tone

#### Compare CVs
1. Click "Generate Comparison"
2. AI creates 3 distinct CV variations
3. Compare and choose the best one

### Preview & Export

1. Click "Preview" button to view full CV
2. Switch between CV and Cover Letter views
3. Try different layout styles
4. Export to PDF or DOCX using the export buttons

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Animation**: Framer Motion
- **State Management**: Zustand
- **AI Integration**: OpenAI API (GPT-4 Turbo)
- **Icons**: Lucide React
- **Export**: html2pdf.js, docx, file-saver

## Environment Variables

```env
OPENAI_API_KEY=your_openai_api_key_here
```

## Building for Production

```bash
npm run build
npm start
```

## Troubleshooting

### OpenAI API Errors
- Ensure your API key is correct
- Check that you have credits in your OpenAI account
- Verify the key is in `.env.local` file

### Export Not Working
- PDF export requires html2pdf.js to be properly configured
- DOCX export requires additional server-side processing for full functionality

### Dark Mode Not Persisting
- Check browser localStorage permissions
- Clear cache and reload

## License

© 2024 AI CV Generator Pro

