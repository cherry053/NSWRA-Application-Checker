import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the built bundle works from a project sub-path
// (GitHub Pages, a nested static host) as well as from a domain root.
export default defineConfig({
  base: './',
  plugins: [react()],
});
