/**
 * Modern Dark Theme Configuration
 * Color scheme, typography, and spacing
 */

export interface ThemeConfig {
  colors: {
    primary: string
    primaryDark: string
    secondary: string
    accent: string
    background: string
    surface: string
    border: string
    text: string
    textSecondary: string
    success: string
    warning: string
    error: string
  }
  typography: {
    fontFamily: string
    fontSize: {
      xs: string
      sm: string
      base: string
      lg: string
      xl: string
      '2xl': string
    }
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
}

export const modernDarkTheme: ThemeConfig = {
  colors: {
    primary: '#3b82f6',      // Blue
    primaryDark: '#1e40af',  // Dark Blue
    secondary: '#8b5cf6',    // Purple
    accent: '#ec4899',       // Pink
    background: '#0f172a',   // Very Dark Blue
    surface: '#1e293b',      // Dark Slate
    border: '#334155',       // Slate
    text: '#f1f5f9',         // Light Slate
    textSecondary: '#cbd5e1',// Medium Slate
    success: '#10b981',      // Green
    warning: '#f59e0b',      // Amber
    error: '#ef4444',        // Red
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
}

export function getThemeCSS(theme: ThemeConfig = modernDarkTheme): string {
  return `
    :root {
      --color-primary: ${theme.colors.primary};
      --color-primary-dark: ${theme.colors.primaryDark};
      --color-secondary: ${theme.colors.secondary};
      --color-accent: ${theme.colors.accent};
      --color-background: ${theme.colors.background};
      --color-surface: ${theme.colors.surface};
      --color-border: ${theme.colors.border};
      --color-text: ${theme.colors.text};
      --color-text-secondary: ${theme.colors.textSecondary};
      --color-success: ${theme.colors.success};
      --color-warning: ${theme.colors.warning};
      --color-error: ${theme.colors.error};
      
      --font-family: ${theme.typography.fontFamily};
      --font-size-xs: ${theme.typography.fontSize.xs};
      --font-size-sm: ${theme.typography.fontSize.sm};
      --font-size-base: ${theme.typography.fontSize.base};
      --font-size-lg: ${theme.typography.fontSize.lg};
      --font-size-xl: ${theme.typography.fontSize.xl};
      --font-size-2xl: ${theme.typography.fontSize['2xl']};
      
      --spacing-xs: ${theme.spacing.xs};
      --spacing-sm: ${theme.spacing.sm};
      --spacing-md: ${theme.spacing.md};
      --spacing-lg: ${theme.spacing.lg};
      --spacing-xl: ${theme.spacing.xl};
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html {
      font-family: var(--font-family);
      font-size: var(--font-size-base);
      color: var(--color-text);
      background: var(--color-background);
    }

    body {
      background: var(--color-background);
      color: var(--color-text);
      line-height: 1.6;
    }

    /* Typography */
    h1 { font-size: var(--font-size-2xl); font-weight: 700; margin-bottom: var(--spacing-md); }
    h2 { font-size: var(--font-size-xl); font-weight: 600; margin-bottom: var(--spacing-md); }
    h3 { font-size: var(--font-size-lg); font-weight: 600; margin-bottom: var(--spacing-sm); }
    p { margin-bottom: var(--spacing-md); color: var(--color-text-secondary); }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm) var(--spacing-md);
      border-radius: 8px;
      font-weight: 500;
      font-size: var(--font-size-sm);
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
    }

    .btn-primary {
      background: var(--color-primary);
      color: white;
    }

    .btn-primary:hover {
      background: var(--color-primary-dark);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    .btn-secondary {
      background: var(--color-surface);
      color: var(--color-text);
      border: 1px solid var(--color-border);
    }

    .btn-secondary:hover {
      background: var(--color-border);
    }

    /* Cards */
    .card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: var(--spacing-lg);
      transition: all 0.2s ease;
    }

    .card:hover {
      border-color: var(--color-primary);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
    }

    /* Forms */
    input, textarea, select {
      width: 100%;
      padding: var(--spacing-sm) var(--spacing-md);
      background: var(--color-background);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      color: var(--color-text);
      font-family: inherit;
      font-size: inherit;
      transition: all 0.2s ease;
    }

    input:focus, textarea:focus, select:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
    }

    th {
      background: var(--color-background);
      color: var(--color-text-secondary);
      padding: var(--spacing-md);
      text-align: left;
      font-weight: 600;
      font-size: var(--font-size-sm);
      border-bottom: 1px solid var(--color-border);
    }

    td {
      padding: var(--spacing-md);
      border-bottom: 1px solid var(--color-border);
    }

    tr:hover {
      background: var(--color-background);
    }

    /* Alerts */
    .alert {
      padding: var(--spacing-md) var(--spacing-lg);
      border-radius: 8px;
      margin-bottom: var(--spacing-md);
      display: flex;
      gap: var(--spacing-md);
      align-items: flex-start;
    }

    .alert-success {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid var(--color-success);
      color: var(--color-success);
    }

    .alert-warning {
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid var(--color-warning);
      color: var(--color-warning);
    }

    .alert-error {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid var(--color-error);
      color: var(--color-error);
    }

    /* Layout */
    .container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 var(--spacing-lg);
    }

    .grid {
      display: grid;
      gap: var(--spacing-lg);
    }

    .grid-2 { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
    .grid-3 { grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
    .grid-4 { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }

    /* Utilities */
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .mt-md { margin-top: var(--spacing-md); }
    .mb-md { margin-bottom: var(--spacing-md); }
    .p-md { padding: var(--spacing-md); }
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .gap-md { gap: var(--spacing-md); }
    .items-center { align-items: center; }
    .justify-between { justify-content: space-between; }

    /* Scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    ::-webkit-scrollbar-track {
      background: var(--color-background);
    }

    ::-webkit-scrollbar-thumb {
      background: var(--color-border);
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: var(--color-primary);
    }
  `
}

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

export { escapeHtml }
