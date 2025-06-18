/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    // Add other paths here if you have more directories with .tsx or .html files
    // For example, if you create a 'src' directory for App.tsx and components:
    // "./src/**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'Roboto', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'], // For explicit font-poppins usage if needed
        roboto: ['Roboto', 'sans-serif'],   // For explicit font-roboto usage
      },
      colors: {
        'recipify-mint-fresh': '#80CBC4',    // Primary accent
        'recipify-deep-blue': '#394240',     // Primary text
        'recipify-cloud-white': '#FAFAFA',   // Background
        'recipify-green-tea': '#9CCC65',     // Success, generate button
        'recipify-soft-coral': '#FF8A65',    // Warnings, errors, surprise button
        'recipify-slate-gray': '#607D8B',    // Secondary text
        'recipify-light-mint': '#E0F2F1',    // Light accent background
        'recipify-darker-teal': '#00796B',   // Darker accent for text on light mint
        'recipify-error-bg': '#FFF0E6',      // Background for error messages
        'recipify-error-text': '#D84315',    // Text for error messages
        'recipify-error-border': '#FFCCBC',   // Border for error messages
        'recipify-premium-gold': '#FF8F00',  // Premium features
        'recipify-premium-bg': '#FFECB3',    // Premium background
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out forwards',
        fadeInScale: 'fadeInScale 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        fadeInScale: {
          '0%': { opacity: 0, transform: 'scale(0.95) translateY(10px)' },
          '100%': { opacity: 1, transform: 'scale(1) translateY(0)' },
        }
      }
    },
  },
  plugins: [],
};