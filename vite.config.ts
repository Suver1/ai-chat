import 'dotenv/config'
import { defineConfig } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import tailwindcss from '@tailwindcss/vite'

const port = parseInt(process.env.PORT || '3000')

export default defineConfig({
  server: {
    port: port,
  },
  plugins: [tsConfigPaths(), tanstackStart(), tailwindcss()],
})
