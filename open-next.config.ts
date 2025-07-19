import { defineCloudflareConfig } from '@opennextjs/cloudflare';

export default defineCloudflareConfig({
  // Next.js config options
  nextConfig: {
    // Enable Node.js runtime for all pages/APIs for better compatibility
    experimental: { 
      runtime: 'nodejs' 
    },
  },
  // D1 integration (binds to env.DB in code)
  bindings: {
    d1Databases: [{ 
      binding: 'DB', 
      id: '30768915-bb91-4955-a0a8-99e96742c717' 
    }],
  },
}); 