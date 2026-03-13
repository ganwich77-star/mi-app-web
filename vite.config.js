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
            const { content, filename, folderName } = JSON.parse(body);
            let targetDir = path.join(os.homedir(), 'Downloads');
            if (folderName) {
              targetDir = path.join(targetDir, folderName);
              if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
              }
            }
            const filePath = path.join(targetDir, filename);
            fs.writeFileSync(filePath, content, 'utf8');
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({ success: true, filename, path: filePath, folder: folderName }));
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

      // Endpoint 3: Diálogo "Guardar como" nativo de macOS (vía AppleScript)
      server.middlewares.use('/graduaciones2026/api/save-as', (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end('Method not allowed'); return; }
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
          try {
            const { content, filename } = JSON.parse(body);

            // Ejecutamos AppleScript para abrir el diálogo de macOS "Guardar como"
            const appleScript = `osascript -e 'POSIX path of (choose file name with prompt "Selecciona dónde guardar el script:" default name "${filename}")'`;

            let chosenPath;
            try {
              chosenPath = execSync(appleScript).toString().trim();
            } catch (err) {
              // El usuario canceló el diálogo
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end(JSON.stringify({ success: false, cancelled: true }));
              return;
            }

            if (chosenPath) {
              // Asegurar extensión .jsx si el usuario la borró
              if (!chosenPath.toLowerCase().endsWith('.jsx')) {
                chosenPath += '.jsx';
              }

              fs.writeFileSync(chosenPath, content, 'utf8');

              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end(JSON.stringify({
                success: true,
                path: chosenPath,
                filename: path.basename(chosenPath)
              }));
            }
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
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
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
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'logo.png'],
      manifest: {
        name: 'Orlas 2026 - Pujalte Studio',
        short_name: 'Pujalte Orlas',
        description: 'Gestor de pedidos de orlas escolares de alta calidad',
        theme_color: '#4f46e5', // Brand indigo
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/graduaciones2026/?utm_source=pwa',
        icons: [
          { src: 'favicon.svg', sizes: '32x32', type: 'image/svg+xml' },
          { src: 'logo.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 10000000,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webp}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|webp)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'images-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
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
        domainLock: ['basecode.es', 'www.basecode.es', 'localhost', '127.0.0.1'] // Permitir local y www para evitar bloqueos
      },
    })
  ].filter(Boolean)
}));
