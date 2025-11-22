# Modern Dark Theme Template for CF-CMS

A production-ready, modern dark theme template package for CF-CMS with beautiful UI, responsive design, and customizable colors.

## Features

✨ **Modern Design**
- Clean, minimalist interface
- Dark theme optimized for reduced eye strain
- Smooth animations and transitions
- Professional color scheme

📱 **Responsive**
- Mobile-first design
- Tablet and desktop optimized
- Touch-friendly interface
- Adaptive layouts

🎨 **Customizable**
- CSS variables for easy theming
- Configurable colors, typography, spacing
- Easy to extend and modify
- No build step required

⚡ **Performance**
- Minimal CSS (~5KB)
- No JavaScript dependencies
- Fast rendering
- Edge-compatible

## Installation

```bash
npm install @ylstack-dev/cf-cms-template-modern-dark
```

## Usage

### In starter-app

1. **Update `starter-app/package.json`**:

```json
{
  "dependencies": {
    "@ylstack-dev/cf-cms-template-modern-dark": "^1.0.0"
  }
}
```

2. **Update `starter-app/src/index.ts`**:

```typescript
import { createCfCmsApp } from '@ylstack-dev/cf-cms-core'
import * as modernDarkTemplate from '@ylstack-dev/cf-cms-template-modern-dark'

const app = createCfCmsApp({
  templates: modernDarkTemplate
})

export default app
```

3. **Build and run**:

```bash
npm install
npm run build
npm run dev
```

## Customization

### Change Colors

Create a custom theme by modifying `theme.ts`:

```typescript
import { modernDarkTheme, getThemeCSS } from '@ylstack-dev/cf-cms-template-modern-dark'

const customTheme = {
  ...modernDarkTheme,
  colors: {
    ...modernDarkTheme.colors,
    primary: '#ff6b6b',      // Change primary color
    secondary: '#4ecdc4',    // Change secondary color
    background: '#1a1a2e',   // Change background
  }
}

export function getCustomThemeCSS() {
  return getThemeCSS(customTheme)
}
```

### Extend Templates

Create new templates by extending existing ones:

```typescript
import { renderAdminLayout, AdminLayoutData } from '@ylstack-dev/cf-cms-template-modern-dark'

export function renderCustomPage(data: any): string {
  const pageContent = `
    <div>
      <!-- Your custom content -->
    </div>
  `

  return renderAdminLayout({
    title: 'Custom Page',
    content: pageContent,
    user: data.user,
    version: data.version,
  })
}
```

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | #3b82f6 | Buttons, links, highlights |
| Secondary | #8b5cf6 | Accents, secondary actions |
| Accent | #ec4899 | Alerts, important elements |
| Background | #0f172a | Page background |
| Surface | #1e293b | Cards, panels |
| Border | #334155 | Dividers, borders |
| Text | #f1f5f9 | Primary text |
| Text Secondary | #cbd5e1 | Secondary text |
| Success | #10b981 | Success states |
| Warning | #f59e0b | Warning states |
| Error | #ef4444 | Error states |

## Typography

- **Font Family**: System fonts (Apple, Segoe UI, Roboto, etc.)
- **Base Size**: 16px
- **Sizes**: xs (12px), sm (14px), base (16px), lg (18px), xl (20px), 2xl (24px)

## Spacing

- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- CSS Size: ~5KB
- No JavaScript
- No external dependencies
- Renders in < 100ms

## License

MIT

## Support

For issues, questions, or suggestions, please open an issue on GitHub or contact the CF-CMS team.

## Credits

Created for CF-CMS by the YLStack team.
