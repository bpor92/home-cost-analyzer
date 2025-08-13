export default defineNuxtConfig({
  devtools: { enabled: true },
  
  // CSS configuration
  css: ['~/assets/main.css'],
  
  // Runtime configuration
  runtimeConfig: {
    // Server-side environment variables
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    
    // Public client-side environment variables
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    }
  },
  
  // Modules
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt'
  ],
  
  // Tailwind configuration
  tailwindcss: {
    cssPath: '~/assets/main.css'
  },
  
  // TypeScript configuration
  typescript: {
    typeCheck: true
  },
  
  // Build configuration
  nitro: {
    esbuild: {
      options: {
        target: 'es2022'
      }
    }
  },
  
  // Compatibility for Vue 3 features
  vue: {
    propsDestructure: true
  },
  
  // App configuration
  app: {
    head: {
      title: 'Renovation Budget App',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/house-icon.svg' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  }
})