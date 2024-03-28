// nuxt.config.ts

export default defineNuxtConfig({
  // ... other Nuxt configs

  // Configure server-middleware for CORS
  serverMiddleware: [
    { path: '/(.*)', handler: '~/middleware/cors.js' },
  ],

  // Configure Content Security Policy (CSP)
  csp: {
    directives: {
      'script-src': ['self', "'unsafe-inline'"], // Allow inline scripts for specific use cases (review carefully)
      'script-src-elem': ['self'],
      'script-src-attr': ['none'],
      'style-src': ['self', 'unsafe-inline', 'https://fonts.googleapis.com'], // Allow inline styles for specific use cases (review carefully)
      'img-src': ['self', 'data:'], // Allow data URIs for inline images
      'font-src': ['self', 'https://fonts.gstatic.com'],
      'object-src': ['none'],
      'frame-ancestors': ['none'],
      'upgrade-insecure-requests': true,
      'block-all-mixed-content': true,
      'dns-prefetch': false,
      'report-uri': 'https://keycloak.report-uri.com/r/d/csp/enforce',
    },
  },

  // Other security headers
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'X-DNS-Prefetch-Control': 'off',
  },

  // HSTS configuration
  server: {
    hsts: {
      maxAge: 60 * 60 * 24, // One day in seconds
      includeSubDomains: true,
      preload: true,
    },
  },

  // X-Frame-Options header
  frameguard: {
    action: 'deny',
  },
});
