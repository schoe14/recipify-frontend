// vite-env.d.ts (in your project root)
// FIX: Comment out to prevent TS error if vite/client types are not found in the environment.
// /// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
    // Add any other VITE_ environment variables your app uses or will use
    readonly VITE_API_BASE_URL?: string; 
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }

declare module '*.css' {
const content: { [className: string]: string }; // For CSS Modules
export default content; // For CSS Modules default export
// If you are just importing for side-effects (global styles), 
// you might not even need the above, or a simpler:
// const css: any; export default css;
// Or sometimes simply:
// export {}; // If just for side effects and no named/default exports
  }