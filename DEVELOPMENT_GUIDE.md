# CF-CMS Template Development Guide

## Overview

This guide explains how to customize the CF-CMS admin panel frontend using templates. Templates allow you to change colors, layout, styling, and UI elements **without affecting backend logic**.

## ✅ What You CAN Customize

### Frontend Only (Safe to Change)
- ✅ **Colors** - Background, text, borders, buttons
- ✅ **Fonts** - Typography, sizes, weights
- ✅ **Layout** - Sidebar width, spacing, positioning
- ✅ **Styling** - CSS classes, animations, effects
- ✅ **UI Elements** - Hide/show components, reorder items
- ✅ **Icons** - Change icons, add custom SVGs
- ✅ **Branding** - Logo, app name, footer text

### Backend (DO NOT Change)
- ❌ **Routes** - API endpoints, route handlers
- ❌ **Data Structure** - Database schema, data models
- ❌ **Business Logic** - Authentication, permissions, validation
- ❌ **Functionality** - CRUD operations, file uploads, etc.

## 📁 Template Structure

\`\`\`
packages/template-modern-dark/
├── src/
│   ├── layouts/
│   │   └── admin-layout.ts          # Main layout with CSS injection
│   ├── pages/
│   │   └── admin-dashboard.ts       # Page-specific templates (optional)
│   ├── components/
│   │   └── logo.template.ts         # Reusable components
│   ├── theme.ts                     # Theme configuration
│   └── index.ts                     # Package exports
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── README.md
\`\`\`

## 🎨 How Templates Work

### 1. Template is Loaded
\`\`\`typescript
// starter-app/src/index.ts
import * as modernDarkTemplate from '@ylstack-dev/cf-cms-template-modern-dark'

const bindings = {
  TEMPLATE_PROVIDER: modernDarkTemplate  // ← Template loaded here
}
\`\`\`

### 2. Middleware Intercepts Pages
\`\`\`typescript
// packages/core/src/middleware/admin-layout-middleware.ts
const templateProvider = c.env.TEMPLATE_PROVIDER

if (templateProvider) {
  // Call template's renderAdminLayout function
  const modifiedHtml = templateProvider.renderAdminLayout({
    _fullHtml: originalHtml  // Pass full HTML to template
  })
}
\`\`\`

### 3. Template Injects Custom CSS
\`\`\`typescript
// packages/template-modern-dark/src/layouts/admin-layout.ts
export function renderAdminLayout(data: AdminLayoutData & { _fullHtml?: string }): string {
  if (data._fullHtml) {
    // Inject custom CSS into existing HTML
    const modifiedHtml = data._fullHtml.replace(
      '<script src="https://unpkg.com/htmx.org@2.0.3"></script>',
      \`\${customThemeCSS}\\n  <script src="https://unpkg.com/htmx.org@2.0.3"></script>\`
    )
    return modifiedHtml
  }
}
\`\`\`

## 🎯 Customization Guide

### Change Colors

Edit \`src/layouts/admin-layout.ts\`:

\`\`\`typescript
const customThemeCSS = \`
  <style>
    /* Change background colors */
    body {
      background: #YOUR_COLOR !important;
    }
    
    .dark\\\\:bg-zinc-900 {
      background: #YOUR_COLOR !important;
    }
    
    /* Change sidebar colors */
    nav[aria-label="Sidebar"] {
      background: linear-gradient(180deg, #COLOR1 0%, #COLOR2 100%) !important;
    }
    
    /* Change button colors */
    .bg-zinc-950 {
      background: #YOUR_ACCENT !important;
    }
    
    /* Change text colors */
    .dark\\\\:text-white {
      color: #YOUR_TEXT_COLOR !important;
    }
  </style>
\`
\`\`\`

### Change Fonts

\`\`\`typescript
const customThemeCSS = \`
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Your+Font:wght@400;600;700&display=swap');
    
    body {
      font-family: 'Your Font', system-ui, sans-serif !important;
    }
    
    h1, h2, h3 {
      font-family: 'Your Font', sans-serif !important;
    }
  </style>
\`
\`\`\`

### Change Layout

\`\`\`typescript
const customThemeCSS = \`
  <style>
    /* Change sidebar width */
    .sidebar {
      width: 300px !important;  /* Default: 260px */
    }
    
    /* Change spacing */
    .content {
      padding: 2rem !important;  /* Default: 1.5rem */
    }
    
    /* Change border radius */
    .rounded-lg {
      border-radius: 1rem !important;  /* Default: 0.5rem */
    }
  </style>
\`
\`\`\`

### Hide/Show Elements

\`\`\`typescript
const customThemeCSS = \`
  <style>
    /* Hide specific menu items */
    a[href="/admin/community-plugins"] {
      display: none !important;
    }
    
    /* Hide footer */
    .footer {
      display: none !important;
    }
    
    /* Show/hide on mobile */
    @media (max-width: 768px) {
      .user-info {
        display: block !important;  /* Show on mobile */
      }
    }
  </style>
\`
\`\`\`

### Add Custom Branding

\`\`\`typescript
const customThemeCSS = \`
  <style>
    /* Custom logo */
    .sidebar-logo-text::before {
      content: "Your Brand" !important;
    }
    
    /* Custom footer */
    .footer::after {
      content: " | Powered by Your Company";
    }
    
    /* Add watermark */
    body::after {
      content: "Your Brand";
      position: fixed;
      bottom: 10px;
      right: 10px;
      opacity: 0.3;
      font-size: 12px;
    }
  </style>
\`
\`\`\`

## 🔧 Development Workflow

### 1. Make Changes
Edit files in \`packages/template-modern-dark/src/\`

### 2. Build Template
\`\`\`bash
cd packages/template-modern-dark
npm run build
\`\`\`

### 3. Rebuild Core (if needed)
\`\`\`bash
npm run build:core
\`\`\`

### 4. Test Changes
\`\`\`bash
npm run dev
\`\`\`

Visit \`http://localhost:8787/admin\` to see changes

### 5. Debug
Check browser console for:
- \`[TEMPLATE] Modern Dark template renderAdminLayout called\`
- \`[TEMPLATE] CSS injected successfully\`

## 📋 CSS Class Reference

### Tailwind Classes Used

#### Background Colors
- \`bg-white\` / \`dark:bg-zinc-900\` - Main background
- \`dark:bg-zinc-800\` - Cards and panels
- \`dark:bg-zinc-700\` - Hover states

#### Text Colors
- \`text-zinc-950\` / \`dark:text-white\` - Primary text
- \`text-zinc-500\` / \`dark:text-zinc-400\` - Secondary text
- \`text-zinc-400\` / \`dark:text-zinc-500\` - Muted text

#### Borders
- \`border-zinc-950/5\` / \`dark:border-white/5\` - Light borders
- \`ring-zinc-950/5\` / \`dark:ring-white/10\` - Focus rings

#### Spacing
- \`p-4\` - Padding (1rem)
- \`gap-4\` - Gap between elements (1rem)
- \`space-y-4\` - Vertical spacing (1rem)

#### Layout
- \`flex\` - Flexbox layout
- \`grid\` - Grid layout
- \`rounded-lg\` - Border radius (0.5rem)

### Custom Classes

#### Sidebar
- \`.sidebar\` - Main sidebar container
- \`.sidebar-logo\` - Logo area
- \`.sidebar-nav\` - Navigation container
- \`.nav-item\` - Navigation link
- \`.nav-item.active\` - Active navigation link

#### Content
- \`.main-content\` - Main content area
- \`.content\` - Content wrapper
- \`.header\` - Page header
- \`.footer\` - Page footer

## ⚠️ Important Rules

### DO's ✅
1. **Use \`!important\`** - Override Tailwind classes
   \`\`\`css
   body { background: #000 !important; }
   \`\`\`

2. **Escape Tailwind Classes** - Use double backslash
   \`\`\`css
   .dark\\\\:bg-zinc-900 { background: #000 !important; }
   \`\`\`

3. **Test on All Pages** - Dashboard, Collections, Content, etc.

4. **Test Responsive** - Mobile, tablet, desktop

5. **Keep Backend Intact** - Only modify CSS, not HTML structure

### DON'Ts ❌
1. **Don't Modify Core Files** - Only edit template package
2. **Don't Change HTML Structure** - Only inject CSS
3. **Don't Break Functionality** - Test all features work
4. **Don't Remove Required Elements** - Keep forms, buttons, etc.
5. **Don't Modify Routes** - Backend logic must stay unchanged

## 🎨 Example: Create Custom Theme

### 1. Copy Template
\`\`\`bash
cp -r packages/template-modern-dark packages/template-custom
\`\`\`

### 2. Update package.json
\`\`\`json
{
  "name": "@ylstack-dev/cf-cms-template-custom",
  "version": "1.0.0",
  "description": "Custom theme for CF-CMS"
}
\`\`\`

### 3. Customize Colors
Edit \`packages/template-custom/src/layouts/admin-layout.ts\`:
\`\`\`typescript
const customThemeCSS = \`
  <style>
    /* Your custom colors */
    body { background: #1a1a2e !important; }
    nav[aria-label="Sidebar"] { background: #16213e !important; }
    .bg-zinc-950 { background: #0f3460 !important; }
  </style>
\`
\`\`\`

### 4. Build Template
\`\`\`bash
cd packages/template-custom
npm run build
\`\`\`

### 5. Use in Starter App
\`\`\`typescript
// starter-app/src/index.ts
import * as customTemplate from '@ylstack-dev/cf-cms-template-custom'

const bindings = {
  TEMPLATE_PROVIDER: customTemplate
}
\`\`\`

## 🐛 Troubleshooting

### Template Not Applied
**Check:**
1. Template is enabled in \`starter-app/src/index.ts\`
2. Template is built: \`cd packages/template-modern-dark && npm run build\`
3. Core is built: \`npm run build:core\`
4. Browser console shows: \`[TEMPLATE] CSS injected successfully\`

### Colors Not Changing
**Check:**
1. Using \`!important\` flag
2. Escaping Tailwind classes correctly: \`dark\\\\:bg-zinc-900\`
3. CSS is injected after Tailwind loads
4. Hard refresh browser (Ctrl+Shift+R)

### Layout Broken
**Check:**
1. Not modifying HTML structure
2. Only injecting CSS
3. Not hiding required elements
4. Testing on all pages

## 📚 Additional Resources

- **Tailwind CSS Docs**: https://tailwindcss.com/docs
- **CSS Selectors**: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors
- **Flexbox Guide**: https://css-tricks.com/snippets/css/a-guide-to-flexbox/
- **Grid Guide**: https://css-tricks.com/snippets/css/complete-guide-grid/

## 🎯 Summary

**Template System Benefits:**
- ✅ Customize frontend without touching backend
- ✅ Easy to create multiple themes
- ✅ Safe - backend logic protected
- ✅ Fast - just CSS injection
- ✅ Flexible - change anything visual

**Remember:**
- Templates = Frontend customization only
- Backend = Completely unchanged
- CSS injection = Safe and fast
- Test everything = All pages, all devices
