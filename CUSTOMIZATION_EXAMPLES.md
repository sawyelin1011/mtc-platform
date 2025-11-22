# Template Customization Examples

## Quick Examples for Common Customizations

### Example 1: Corporate Blue Theme

\`\`\`typescript
const customThemeCSS = \`
  <style>
    /* Corporate Blue Theme */
    body {
      background: #003366 !important;
    }
    
    .dark\\:bg-zinc-900 {
      background: #003366 !important;
    }
    
    nav[aria-label="Sidebar"] {
      background: linear-gradient(180deg, #002244 0%, #003366 100%) !important;
    }
    
    .bg-zinc-950 {
      background: #0066cc !important;
    }
    
    .dark\\:text-white {
      color: #e6f2ff !important;
    }
  </style>
\`
\`\`\`

### Example 2: Dark Purple Theme

\`\`\`typescript
const customThemeCSS = \`
  <style>
    /* Dark Purple Theme */
    body {
      background: #1a0033 !important;
    }
    
    .dark\\:bg-zinc-900 {
      background: #1a0033 !important;
    }
    
    nav[aria-label="Sidebar"] {
      background: linear-gradient(180deg, #2d0052 0%, #4a0080 100%) !important;
    }
    
    .bg-zinc-950 {
      background: #7b2cbf !important;
    }
  </style>
\`
\`\`\`

### Example 3: Minimal Light Theme

\`\`\`typescript
const customThemeCSS = \`
  <style>
    /* Minimal Light Theme */
    html {
      color-scheme: light !important;
    }
    
    body {
      background: #ffffff !important;
    }
    
    .dark\\:bg-zinc-900 {
      background: #f5f5f5 !important;
    }
    
    nav[aria-label="Sidebar"] {
      background: #ffffff !important;
      border-right: 1px solid #e0e0e0 !important;
    }
    
    .dark\\:text-white {
      color: #333333 !important;
    }
    
    .dark\\:text-zinc-400 {
      color: #666666 !important;
    }
  </style>
\`
\`\`\`

### Example 4: Hide Specific Menu Items

\`\`\`typescript
const customThemeCSS = \`
  <style>
    /* Hide Community Plugins */
    a[href="/admin/community-plugins"] {
      display: none !important;
    }
    
    /* Hide Settings */
    a[href="/admin/settings"] {
      display: none !important;
    }
  </style>
\`
\`\`\`

### Example 5: Custom Branding

\`\`\`typescript
const customThemeCSS = \`
  <style>
    /* Replace logo text */
    .sidebar-logo-text {
      font-size: 0 !important;
    }
    
    .sidebar-logo-text::after {
      content: "My Company CMS" !important;
      font-size: 1.125rem !important;
    }
    
    /* Custom footer */
    .footer {
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%) !important;
      color: white !important;
    }
  </style>
\`
\`\`\`

### Example 6: Larger Sidebar

\`\`\`typescript
const customThemeCSS = \`
  <style>
    /* Wider sidebar */
    nav[aria-label="Sidebar"] {
      width: 320px !important;
    }
    
    /* Adjust main content */
    .main-content {
      margin-left: 320px !important;
    }
    
    @media (max-width: 1024px) {
      nav[aria-label="Sidebar"] {
        width: 260px !important;
      }
      
      .main-content {
        margin-left: 260px !important;
      }
    }
  </style>
\`
\`\`\`

### Example 7: Compact Mode

\`\`\`typescript
const customThemeCSS = \`
  <style>
    /* Reduce padding everywhere */
    .p-4 {
      padding: 0.75rem !important;
    }
    
    .p-6 {
      padding: 1rem !important;
    }
    
    /* Smaller text */
    body {
      font-size: 13px !important;
    }
    
    /* Compact sidebar */
    .nav-item {
      padding: 0.5rem 0.75rem !important;
    }
  </style>
\`
\`\`\`

### Example 8: High Contrast Theme

\`\`\`typescript
const customThemeCSS = \`
  <style>
    /* High Contrast for Accessibility */
    body {
      background: #000000 !important;
    }
    
    .dark\\:bg-zinc-900 {
      background: #000000 !important;
    }
    
    .dark\\:text-white {
      color: #ffffff !important;
      font-weight: 600 !important;
    }
    
    .dark\\:border-white\\/5 {
      border-color: #ffffff !important;
    }
    
    /* High contrast buttons */
    .bg-zinc-950 {
      background: #ffff00 !important;
      color: #000000 !important;
    }
  </style>
\`
\`\`\`

### Example 9: Glassmorphism Effect

\`\`\`typescript
const customThemeCSS = \`
  <style>
    /* Glassmorphism */
    nav[aria-label="Sidebar"] {
      background: rgba(255, 255, 255, 0.1) !important;
      backdrop-filter: blur(10px) !important;
      border-right: 1px solid rgba(255, 255, 255, 0.2) !important;
    }
    
    .dark\\:bg-zinc-800 {
      background: rgba(255, 255, 255, 0.05) !important;
      backdrop-filter: blur(10px) !important;
    }
  </style>
\`
\`\`\`

### Example 10: Animated Gradient Background

\`\`\`typescript
const customThemeCSS = \`
  <style>
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    
    body {
      background: linear-gradient(270deg, #0c4a6e, #075985, #0369a1) !important;
      background-size: 600% 600% !important;
      animation: gradientShift 15s ease infinite !important;
    }
  </style>
\`
\`\`\`

## Testing Your Customizations

After making changes:

1. **Build template**: \`cd packages/template-modern-dark && npm run build\`
2. **Restart dev server**: \`npm run dev\`
3. **Test all pages**: Dashboard, Collections, Content, Media, Users, Plugins
4. **Test responsive**: Mobile, tablet, desktop
5. **Test functionality**: All buttons, forms, and features work

## Tips

- Use browser DevTools to inspect elements and find class names
- Test with hard refresh (Ctrl+Shift+R) to clear cache
- Check console for \`[TEMPLATE] CSS injected successfully\`
- Start with small changes and test incrementally
- Keep a backup of working CSS before major changes
