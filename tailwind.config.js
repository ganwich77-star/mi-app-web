/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
    darkMode: ['selector', '[data-theme="dark"]'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.4s ease-out',
                'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                'slide-right': 'slideRight 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                'scale-in': 'scaleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
            },
            keyframes: {
                fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
                slideUp: { '0%': { transform: 'translateY(24px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
                slideRight: { '0%': { transform: 'translateX(24px)', opacity: '0' }, '100%': { transform: 'translateX(0)', opacity: '1' } },
                scaleIn: { '0%': { transform: 'scale(0.9)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
            },
            boxShadow: {
                'glow-indigo': '0 0 30px rgba(99, 102, 241, 0.3)',
                'glow-green': '0 0 30px rgba(16, 185, 129, 0.3)',
                'glow-amber': '0 0 20px rgba(245, 158, 11, 0.25)',
                'glass': '0 8px 32px rgba(0, 0, 0, 0.4)',
                'card': '0 2px 8px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04)',
                'card-hover': '0 8px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.3)',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'mesh': 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
            },
            colors: {
                primary: '#1E293B',
                secondary: '#64748B',
                main: {
                    DEFAULT: '#FDFBFA',
                    dark: '#0B0E14'
                }
            }
        },
    },
    plugins: [],
};
