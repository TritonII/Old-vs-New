import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    base: './', // Ensures relative paths for assets, helpful for GitHub Pages
    define: {
      // Safely expose the API key to the client code.
      // Note: In a real production app, be cautious about exposing keys.
      // Since this app has a robust fallback mode, it's safe to run without a key too.
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});