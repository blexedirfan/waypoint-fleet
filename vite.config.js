import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // Without this, Vite's default "localhost" binding can end up listening
    // on only one of IPv4/IPv6 loopback depending on the machine's network
    // config — if the browser resolves "localhost" to the other one, the
    // page can still load (cached/racy) while later fetch() calls to the
    // API fail with a bare "Failed to fetch". Binding all interfaces removes
    // the ambiguity.
    host: true,
  },
})