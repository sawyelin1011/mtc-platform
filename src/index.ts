/**
 * Modern Dark Template Package
 * Complete frontend copy from core for easy customization
 * 
 * This package contains exact copies of all core templates
 * so you can customize the frontend without mistakes
 * 
 * Structure:
 * - layouts/ - Admin layout templates
 * - pages/ - Admin page templates (dashboard, content, media, users, etc.)
 * - components/ - Reusable UI components (logo, checkbox, table, etc.)
 * - theme.ts - Theme configuration and CSS
 */

// ============================================================================
// Layouts
// ============================================================================
export { renderAdminLayout } from './layouts/admin-layout'
export type { AdminLayoutData } from './layouts/admin-layout'

// ============================================================================
// Pages
// ============================================================================
export { renderDashboardPage } from './pages/admin-dashboard'
export type { DashboardPageData, DashboardStats, ActivityItem, AnalyticsData } from './pages/admin-dashboard'

// ============================================================================
// Components
// ============================================================================
export { renderLogo } from './components/logo.template'
export type { LogoData } from './components/logo.template'

// ============================================================================
// Theme
// ============================================================================
export { modernDarkTheme, getThemeCSS, escapeHtml } from './theme'
export type { ThemeConfig } from './theme'

// ============================================================================
// Template Package Info
// ============================================================================
export const TEMPLATE_INFO = {
  name: '@ylstack-dev/cf-cms-template-modern-dark',
  version: '3.0.19',
  description: 'Modern dark theme template package for CF-CMS',
  features: [
    'Complete frontend copy from core',
    'Easy customization without mistakes',
    'Responsive design',
    'Dark glass theme',
    'All admin pages supported'
  ],
  structure: {
    layouts: 'Admin layout templates',
    pages: 'Admin page templates',
    components: 'Reusable UI components',
    theme: 'Theme configuration'
  }
} as const
