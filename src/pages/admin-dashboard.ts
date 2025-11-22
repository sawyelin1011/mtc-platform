/**
 * Modern Dark Dashboard Page
 * Same data interface as core, different design
 */

import { renderAdminLayout, AdminLayoutData } from '../layouts/admin-layout'
import { escapeHtml } from '../theme'

export interface DashboardStats {
  collections: number
  contentItems: number
  mediaFiles: number
  users: number
  databaseSize?: number
  mediaSize?: number
  recentActivity?: ActivityItem[]
  analytics?: AnalyticsData
}

export interface ActivityItem {
  id: string
  type: 'content' | 'media' | 'user' | 'collection'
  action: string
  description: string
  timestamp: string
  user: string
}

export interface AnalyticsData {
  pageViews: number
  uniqueVisitors: number
  contentPublished: number
  mediaUploaded: number
  weeklyGrowth: {
    pageViews: number
    visitors: number
    content: number
    media: number
  }
}

export interface DashboardPageData {
  user?: {
    name: string
    email: string
    role: string
  }
  stats?: DashboardStats
  version?: string
  dynamicMenuItems?: Array<{
    label: string
    path: string
    icon?: string
    isPlugin?: boolean
  }>
}

export function renderDashboardPage(data: DashboardPageData): string {
  const stats = data.stats || {
    collections: 0,
    contentItems: 0,
    mediaFiles: 0,
    users: 0,
  }

  const pageContent = `
    <div>
      <h1>Dashboard</h1>
      <p style="color: var(--color-text-secondary); margin-bottom: var(--spacing-lg);">Welcome to your CF-CMS admin dashboard</p>

      <!-- Stats Grid -->
      <div class="grid grid-4" style="margin-bottom: var(--spacing-xl);">
        ${renderStatCard('📚 Collections', stats.collections, '#3b82f6')}
        ${renderStatCard('📝 Content Items', stats.contentItems, '#8b5cf6')}
        ${renderStatCard('🖼️ Media Files', stats.mediaFiles, '#ec4899')}
        ${renderStatCard('👥 Users', stats.users, '#10b981')}
      </div>

      <!-- Main Grid -->
      <div class="grid" style="grid-template-columns: 2fr 1fr; gap: var(--spacing-lg); margin-bottom: var(--spacing-xl);">
        <!-- Analytics Card -->
        <div class="card">
          <h2>Analytics Overview</h2>
          <div style="margin-top: var(--spacing-lg);">
            ${renderAnalyticsChart(stats.analytics)}
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="card">
          <h2>Quick Stats</h2>
          <div style="margin-top: var(--spacing-lg); display: flex; flex-direction: column; gap: var(--spacing-md);">
            ${renderQuickStat('Page Views', stats.analytics?.pageViews || 0)}
            ${renderQuickStat('Unique Visitors', stats.analytics?.uniqueVisitors || 0)}
            ${renderQuickStat('Content Published', stats.analytics?.contentPublished || 0)}
            ${renderQuickStat('Media Uploaded', stats.analytics?.mediaUploaded || 0)}
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      ${stats.recentActivity && stats.recentActivity.length > 0 ? `
        <div class="card">
          <h2>Recent Activity</h2>
          <div style="margin-top: var(--spacing-lg);">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Action</th>
                  <th>User</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                ${stats.recentActivity.slice(0, 5).map(activity => `
                  <tr>
                    <td><span style="background: var(--color-primary); color: white; padding: 4px 8px; border-radius: 4px; font-size: var(--font-size-xs);">${escapeHtml(activity.type)}</span></td>
                    <td>${escapeHtml(activity.action)}</td>
                    <td>${escapeHtml(activity.user)}</td>
                    <td style="color: var(--color-text-secondary);">${escapeHtml(activity.timestamp)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}

      <!-- Action Buttons -->
      <div style="margin-top: var(--spacing-xl); display: flex; gap: var(--spacing-md); flex-wrap: wrap;">
        <a href="/admin/content" class="btn btn-primary">Create Content</a>
        <a href="/admin/media" class="btn btn-secondary">Upload Media</a>
        <a href="/admin/users" class="btn btn-secondary">Manage Users</a>
        <a href="/admin/settings" class="btn btn-secondary">Settings</a>
      </div>
    </div>
  `

  const layoutData: AdminLayoutData = {
    title: 'Dashboard - CF-CMS',
    content: pageContent,
    user: data.user,
    version: data.version,
    dynamicMenuItems: data.dynamicMenuItems,
  }

  return renderAdminLayout(layoutData)
}

function renderStatCard(label: string, value: number, color: string): string {
  return `
    <div class="card" style="text-align: center;">
      <div style="font-size: 32px; margin-bottom: var(--spacing-md);">
        ${label.split(' ')[0]}
      </div>
      <div style="font-size: 28px; font-weight: 700; color: ${color}; margin-bottom: var(--spacing-sm);">
        ${value.toLocaleString()}
      </div>
      <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">
        ${label.split(' ').slice(1).join(' ')}
      </div>
    </div>
  `
}

function renderAnalyticsChart(analytics?: AnalyticsData): string {
  if (!analytics) {
    return `
      <div style="text-align: center; padding: var(--spacing-xl); color: var(--color-text-secondary);">
        <p>No analytics data available</p>
      </div>
    `
  }

  const maxValue = Math.max(
    analytics.weeklyGrowth.pageViews,
    analytics.weeklyGrowth.visitors,
    analytics.weeklyGrowth.content,
    analytics.weeklyGrowth.media
  )

  return `
    <div style="display: flex; align-items: flex-end; gap: var(--spacing-md); height: 200px;">
      ${renderChartBar('Page Views', analytics.weeklyGrowth.pageViews, maxValue, '#3b82f6')}
      ${renderChartBar('Visitors', analytics.weeklyGrowth.visitors, maxValue, '#8b5cf6')}
      ${renderChartBar('Content', analytics.weeklyGrowth.content, maxValue, '#ec4899')}
      ${renderChartBar('Media', analytics.weeklyGrowth.media, maxValue, '#10b981')}
    </div>
  `
}

function renderChartBar(label: string, value: number, maxValue: number, color: string): string {
  const height = maxValue > 0 ? (value / maxValue) * 100 : 0
  return `
    <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: var(--spacing-sm);">
      <div style="width: 100%; height: ${height}%; background: ${color}; border-radius: 4px 4px 0 0; min-height: 20px;"></div>
      <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary);">${label}</div>
      <div style="font-weight: 600; font-size: var(--font-size-sm);">${value}</div>
    </div>
  `
}

function renderQuickStat(label: string, value: number): string {
  return `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md); background: var(--color-background); border-radius: 8px;">
      <span style="color: var(--color-text-secondary);">${escapeHtml(label)}</span>
      <span style="font-weight: 700; font-size: var(--font-size-lg);">${value.toLocaleString()}</span>
    </div>
  `
}
