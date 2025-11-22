/**
 * Modern Dark Admin Layout
 * Uses core Catalyst layout with custom theme colors
 * Maintains exact functionality while allowing theme customization
 */

// Import the exact Catalyst layout function from core (using relative path)
import { renderAdminLayoutCatalyst } from '../../../core/src/templates/layouts/admin-layout-catalyst.template'

// Custom theme CSS - Dark Blue & Sky Blue
const customThemeCSS = `
  <style>
    /* Modern Dark Theme - Dark Blue & Sky Blue */
    :root {
      --theme-primary: #0ea5e9;
      --theme-secondary: #38bdf8;
      --theme-accent: #7dd3fc;
    }
    
    /* DARK BLUE Background */
    body {
      background: #0c4a6e !important;
    }
    
    .dark\\:bg-zinc-900 {
      background: #0c4a6e !important;
    }
    
    .dark\\:lg\\:bg-zinc-950 {
      background: #082f49 !important;
    }
    
    /* Sidebar - Dark Blue */
    nav[aria-label="Sidebar"] {
      background: linear-gradient(180deg, #0c4a6e 0%, #075985 100%) !important;
      border-right-color: rgba(125, 211, 252, 0.2) !important;
    }
    
    /* Main content area - Dark Blue */
    .dark\\:lg\\:bg-zinc-900 {
      background: #075985 !important;
    }
    
    /* Cards and panels - Lighter Dark Blue */
    .dark\\:bg-zinc-800 {
      background: #0369a1 !important;
    }
    
    .dark\\:bg-zinc-800\\/50 {
      background: rgba(3, 105, 161, 0.5) !important;
    }
    
    /* Borders - Sky Blue tint */
    .dark\\:border-white\\/5 {
      border-color: rgba(125, 211, 252, 0.15) !important;
    }
    
    .dark\\:ring-white\\/10 {
      --tw-ring-color: rgba(125, 211, 252, 0.2) !important;
    }
    
    /* Text colors - Light blue tints */
    .dark\\:text-white {
      color: #f0f9ff !important;
    }
    
    .dark\\:text-zinc-400 {
      color: #bae6fd !important;
    }
    
    /* Buttons - Sky Blue */
    .bg-zinc-950 {
      background: #0ea5e9 !important;
    }
    
    .dark\\:bg-white {
      background: #0ea5e9 !important;
    }
    
    .hover\\:bg-zinc-800:hover {
      background: #0284c7 !important;
    }
  </style>
`

export interface AdminLayoutData {
  title?: string
  content: string
  user?: {
    name: string
    email: string
    role: string
  }
  version?: string
  currentPath?: string
  dynamicMenuItems?: Array<{
    label: string
    path: string
    icon?: string
    isPlugin?: boolean
  }>
}

/**
 * Render admin layout using core Catalyst layout with theme customization
 * This ensures 100% compatibility with all core pages while allowing theme colors
 */
export function renderAdminLayout(data: AdminLayoutData & { _fullHtml?: string }): string {
  console.log('[TEMPLATE] Modern Dark template renderAdminLayout called')
  
  // If full HTML is provided, inject CSS into it
  if (data._fullHtml) {
    console.log('[TEMPLATE] Injecting CSS into existing HTML')
    const fullHtml = data._fullHtml
    
    // Inject custom CSS after Tailwind script
    const modifiedHtml = fullHtml.replace(
      '<script src="https://unpkg.com/htmx.org@2.0.3"></script>',
      `${customThemeCSS}\n  <script src="https://unpkg.com/htmx.org@2.0.3"></script>`
    )
    
    console.log('[TEMPLATE] CSS injected successfully')
    return modifiedHtml
  }
  
  // Normal flow: render with core layout
  console.log('[TEMPLATE] Rendering with core layout')
  const dataWithTemplate = {
    ...data,
    templateName: 'Modern Dark',
    templateVersion: '1.0.0'
  }
  
  const coreLayout = renderAdminLayoutCatalyst(dataWithTemplate as any)
  
  // Inject custom CSS after Tailwind script
  const customizedLayout = coreLayout.replace(
    '<script src="https://unpkg.com/htmx.org@2.0.3"></script>',
    `${customThemeCSS}\n  <script src="https://unpkg.com/htmx.org@2.0.3"></script>`
  )
  
  console.log('[TEMPLATE] CSS injected into core layout')
  return customizedLayout
}
