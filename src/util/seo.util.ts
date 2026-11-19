import type { SEOProps } from '../components/seo/SEO'

/**
 * SEO configuration for different routes
 */
export const SEO_CONFIG: Record<string, SEOProps> = {
  // Home/Login
  '/': {
    title: 'Login',
    noindex: true,
  },
  
  // Dashboard
  '/dashboard': {
    title: 'Overview',
  },
  
  // Transactions
  '/dashboard/transactions': {
    title: 'Transactions',
  },
  
  // Users
  '/dashboard/users': {
    title: 'Users',
  },
  
  // Disputes
  '/dashboard/disputes': {
    title: 'Disputes',
  },
  
  // Coin Management
  '/dashboard/coin-management': {
    title: 'Coin Management',
  },
  
  // Notifications
  '/dashboard/notifications': {
    title: 'Notifications',
  },
  
  // Audit Trails
  '/dashboard/audit-trails': {
    title: 'Audit Trails',
  },
  
  // Admin Management
  '/dashboard/manage-admins': {
    title: 'Admins',
    noindex: true,
  },
  
  // Testimonials
  '/dashboard/testimonials': {
    title: 'Testimonials',
  },
}

/**
 * Get SEO configuration for a specific route
 */
export const getSEOForRoute = (pathname: string): SEOProps => {
  // Try exact match first
  if (SEO_CONFIG[pathname]) {
    return SEO_CONFIG[pathname]
  }
  
  // Try to match dynamic routes (e.g., /dashboard/users/:id)
  for (const [route, seo] of Object.entries(SEO_CONFIG)) {
    if (pathname.startsWith(route)) {
      return seo
    }
  }
  
  // Default SEO
  return {
    title: 'CryptoNow CRM',
    description: 'Cryptocurrency Transaction Management System',
  }
}

/**
 * Build canonical URL from pathname
 */
export const buildCanonicalUrl = (pathname: string): string => {
  // In production, replace with your actual domain
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://cryptonow-crm.com'
  
  return `${baseUrl}${pathname}`
}
