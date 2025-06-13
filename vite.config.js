import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

export default defineConfig({
    plugins: [],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    build: {
        outDir: 'dist',
        lib: {
            entry: './src/index.js',
            name: 'index',
            fileName: 'index',
            formats: ['es', 'cjs', 'umd']
        }
    }
})
