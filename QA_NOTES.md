# QA Notes - AI CV Builder Restoration

## ✅ Build Status
- `npm run build` passes with zero TypeScript errors
- All pages compile successfully

## 🧪 Test Checklist

### Builder Page (`/builder`)

#### Generate
- [ ] Enter keywords in the "Generate from Keywords" field
- [ ] Click "Generate" button
- [ ] Verify preview updates with generated content
- [ ] Verify toast notification appears (success/error)
- [ ] Verify mock response works without OPENAI_API_KEY

#### Rewrite
- [ ] Generate content first
- [ ] Select rewrite mode (enhance/executive/creative/academic)
- [ ] Click "Rewrite" button
- [ ] Verify preview updates with rewritten content
- [ ] Verify mock response works without OPENAI_API_KEY

#### Compare
- [ ] Generate content first
- [ ] Click "Compare (3 variations)" button
- [ ] Verify Compare panel opens with 3 variants (A, B, C)
- [ ] Click "Use This" on one variant
- [ ] Verify preview updates with selected variant
- [ ] Verify panel closes automatically
- [ ] Verify mock variants appear without OPENAI_API_KEY

#### Layout
- [ ] Change layout style (minimal/modern/corporate/portfolio)
- [ ] Verify preview updates instantly without regenerating content
- [ ] Verify layout change affects preview appearance only

#### Export
- [ ] Generate content
- [ ] Click "PDF" export button
- [ ] Verify PDF downloads with proper filename: `{FullName}-{YYYY-MM-DD}-cv.pdf`
- [ ] Click "DOCX" export button
- [ ] Verify DOCX downloads with proper filename: `{FullName}-{YYYY-MM-DD}-cv.docx`
- [ ] Verify exported files match preview content

#### Preview
- [ ] Verify header displays: Name, Title, Contact info
- [ ] Verify empty fields are hidden (no placeholders)
- [ ] Verify summary/preview content displays correctly
- [ ] Verify layout styles apply correctly

---

### Cover Letter Page (`/cover`)

#### Generate
- [ ] Fill in required fields: Full Name, Role Title
- [ ] Fill in optional fields: Email, Phone, LinkedIn, City/State
- [ ] Fill in Recipient Name, Company
- [ ] Enter Keywords
- [ ] Select Tone (Professional/Friendly)
- [ ] Select Length (Short/Medium/Long)
- [ ] Click "Generate Cover Letter"
- [ ] Verify preview updates with generated content
- [ ] Verify exactly ONE greeting appears: "Dear {Recipient}," or "Dear Hiring Manager,"
- [ ] Verify exactly ONE signature appears at the end
- [ ] Verify contact info appears after signature
- [ ] Verify mock response works without OPENAI_API_KEY

#### Rewrite
- [ ] Generate cover letter first
- [ ] Change Tone and/or Length if desired
- [ ] Click "Rewrite" button
- [ ] Verify preview updates with rewritten content
- [ ] Verify normalization removes duplicate greetings/signatures
- [ ] Verify mock rewrite works without OPENAI_API_KEY

#### Compare
- [ ] Generate cover letter first
- [ ] Click "Compare (3 variations)" button
- [ ] Verify Compare panel opens with 3 variants (A, B, C)
- [ ] Click "Use This" on one variant
- [ ] Verify preview updates with selected variant
- [ ] Verify panel closes automatically
- [ ] Verify mock variants appear without OPENAI_API_KEY

#### Export
- [ ] Generate cover letter
- [ ] Click "PDF" export button
- [ ] Verify PDF downloads with proper filename: `{FullName}-{Role}-cover-{YYYY-MM-DD}.pdf`
- [ ] Click "DOCX" export button
- [ ] Verify DOCX downloads with proper filename: `{FullName}-{Role}-cover-{YYYY-MM-DD}.docx`
- [ ] Verify exported files match preview content exactly

#### Preview
- [ ] Verify greeting: "Dear {Recipient}," or "Dear Hiring Manager,"
- [ ] Verify 2-4 paragraphs in body (according to selected length)
- [ ] Verify closing: "Sincerely,"
- [ ] Verify signature: {FullName}
- [ ] Verify contact info: Email · Phone
- [ ] Verify social info: LinkedIn · City/State (if provided)
- [ ] Verify empty fields are hidden (no placeholders)

---

## 🌍 Language & Localization

- [ ] All UI text is English only
- [ ] No i18n functionality
- [ ] No automatic translation of user input
- [ ] AI only updates preview content, not user input fields

---

## 🎨 Design & Theme

- [ ] Dark theme is default
- [ ] Theme toggle works on both pages
- [ ] Colors: Graphite × Violet scheme
- [ ] Fonts: Space Grotesk (headings) + Inter (body)
- [ ] Layout is clean and professional

---

## 🔑 API Key Behavior

### Without OPENAI_API_KEY (Mock Mode)
- [ ] Generate returns mock content
- [ ] Rewrite returns mock rewritten content
- [ ] Compare returns 3 mock variants
- [ ] Cover Generate returns mock cover letter
- [ ] No crashes or errors
- [ ] Console shows `[AI MOCK]` warnings

### With OPENAI_API_KEY
- [ ] Generate calls OpenAI API
- [ ] Rewrite calls OpenAI API
- [ ] Compare calls OpenAI API
- [ ] Cover Generate calls OpenAI API
- [ ] Cover Rewrite calls OpenAI API
- [ ] Cover Compare calls OpenAI API
- [ ] Responses are real AI-generated content
- [ ] All responses are in English only

---

## 🐛 Known Issues / Edge Cases

- Verify no TypeScript errors on `npm run build`
- Verify no console errors in browser DevTools
- Verify all buttons have loading states
- Verify toast notifications appear and auto-dismiss
- Verify empty states show friendly messages

---

## 📝 Acceptance Criteria

### Must Pass
- ✅ `npm run build` with zero TypeScript errors
- ✅ Builder page: Generate/Rewrite/Compare work
- ✅ Cover page: Generate with single greeting/signature
- ✅ Mock mode works without OPENAI_API_KEY
- ✅ Export PDF/DOCX matches preview
- ✅ Layout changes update preview instantly
- ✅ All buttons call server routes
- ✅ All previews update correctly

### Optional (Nice to Have)
- Better error handling for network failures
- More sophisticated cover letter templates
- Progress indicators for long AI operations
- Draft save/load functionality

---

## 🚀 Deployment

- Port 3000 configured in package.json
- Environment variables: OPENAI_API_KEY (optional)
- Production build successful
- Static generation enabled for pages

---

## 📦 Commit Message
```
feat: restore AI wiring & pro cover letter with mocks

- Fixed all API routes with proper mock fallbacks
- Created unified app-store for Builder and Cover state
- Implemented Generate/Rewrite/Compare for both pages
- Added PDF/DOCX export functionality
- Cover letter normalization (single greeting/signature)
- Layout instant preview updates
- Zero TypeScript errors on build
- English-only content, no i18n
```
