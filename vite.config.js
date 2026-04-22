import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import obfuscator from 'vite-plugin-javascript-obfuscator';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync, exec } from 'child_process';

// Plugin: escribe el script JSX directamente en ~/Downloads (evita restricciones del navegador)
function downloadScriptPlugin() {
  return {
    name: 'download-script-api',
    configureServer(server) {
      server.middlewares.use('/api/download-script', (req, res) => {
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
      server.middlewares.use('/api/reveal-file', (req, res) => {
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
      server.middlewares.use('/api/save-as', (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end('Method not allowed'); return; }
        
        // Configurar cabeceras de CORS inmediatamente para permitir preflight si fuera necesario
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        if (req.method === 'OPTIONS') { res.end(); return; }

        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
          try {
            const { content, filename } = JSON.parse(body);

            // Ejecutamos AppleScript de forma asíncrona para no bloquear el proceso de Node/Vite
            const appleScript = `osascript -e 'POSIX path of (choose file name with prompt "Selecciona dónde guardar el script:" default name "${filename}")'`;

            exec(appleScript, (error, stdout, stderr) => {
              if (error) {
                // Probablemente el usuario pulsó "Cancelar"
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, cancelled: true }));
                return;
              }

              let chosenPath = stdout.toString().trim();
              if (chosenPath) {
                if (!chosenPath.toLowerCase().endsWith('.jsx')) {
                  chosenPath += '.jsx';
                }

                fs.writeFileSync(chosenPath, content, 'utf8');

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: true,
                  path: chosenPath,
                  filename: path.basename(chosenPath)
                }));
              } else {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, cancelled: true }));
              }
            });
          } catch (e) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: e.message }));
          }
        });
      });

      // Endpoint 4: Guardado directo de archivos CSV en la carpeta del proyecto
      server.middlewares.use('/api/save-csv', (req, res) => {
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
    port: 5173,
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
        start_url: '/graduaciones2026/index.html?utm_source=pwa',
        icons: [
          { src: 'favicon.svg', sizes: '32x32', type: 'image/svg+xml' },
          { src: 'logo.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 10000000,
        globPatterns: ['**/*.{js,css,ico,png,svg,woff2,webp}'], // Quitamos .html de aquí
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-cache',
              expiration: { maxEntries: 1 },
              networkTimeoutSeconds: 3 // Si no hay internet en 3s, usa el caché
            }
          },
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
    })
  ]
}));
