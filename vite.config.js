import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import obfuscator from 'vite-plugin-javascript-obfuscator';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';

// Plugin: escribe el script JSX directamente en ~/Downloads (evita restricciones del navegador)
function downloadScriptPlugin() {
  return {
    name: 'download-script-api',
    configureServer(server) {
      server.middlewares.use('/graduaciones2026/api/download-script', (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end('Method not allowed'); return; }
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
          try {
            const { content, filename } = JSON.parse(body);
            const filePath = path.join(os.homedir(), 'Downloads', filename);
            fs.writeFileSync(filePath, content, 'utf8');
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({ success: true, filename, path: filePath }));
          } catch (e) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: e.message }));
          }
        });
      });

      // Endpoint 2: revela el fichero en Finder (macOS: open -R)
      server.middlewares.use('/graduaciones2026/api/reveal-file', (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end('Method not allowed'); return; }
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
          try {
            const { path: filePath } = JSON.parse(body);
            execSync(`open -R "${filePath}"`);
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({ success: true }));
          } catch (e) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: e.message }));
          }
        });
      });
    }
  };
}

export default defineConfig(({ mode }) => ({
  base: '/graduaciones2026/',
  server: {
    watch: {
      ignored: ['**/backups/**', '**/*.json', '**/*.log', '**/dist/**']
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'firebase/app', 'firebase/firestore', 'lucide-react']
  },
  plugins: [
    react({ jsxRuntime: 'automatic' }),
    downloadScriptPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Orlas 2026 - Pujalte Studio',
        short_name: 'Orlas 2026',
        description: 'Gestor de pedidos de orlas escolares',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        icons: [
          { src: 'favicon.svg', sizes: '32x32', type: 'image/svg+xml' }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5000000,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache' }
          }
        ]
      }
    }),
    mode === 'production' && obfuscator({
      options: {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 1,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 1,
        debugProtection: true,
        debugProtectionInterval: 4000,
        disableConsoleOutput: true,
        identifierNamesGenerator: 'hexadecimal',
        log: false,
        numbersToExpressions: true,
        renameGlobals: false,
        selfDefending: true,
        simplify: true,
        splitStrings: true,
        splitStringsChunkLength: 5,
        stringArray: true,
        stringArrayEncoding: ['rc4'],
        stringArrayThreshold: 1,
        unicodeEscapeSequence: false,
        domainLock: ['basecode.es', 'localhost', '127.0.0.1'] // Permitir local para pruebas
      },
    })
  ].filter(Boolean)
}));
