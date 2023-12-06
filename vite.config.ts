import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => ({
  plugins: [react()],
  base: command == 'build' ? '/metro-x/' : '/'
}));
