export default defineNuxtConfig({
  devtools: { enabled: true },
  
  // CSS configuration
  css: ['~/assets/main.css'],
  
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
      ]
    }
  }
})