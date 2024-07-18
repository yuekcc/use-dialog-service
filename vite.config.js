import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { resolve } from 'path';

/**
 * @type {import('vite').UserConfig}
 */
export default {
  build: {
    target: "modules",
    modulePreload: false,
    lib: {
      entry: resolve(__dirname, 'src/use-dialog-service.tsx'),
      fileName: 'index',
      name: 'useDialogService'
    },
    rollupOptions: {
      external: ['vue'],
    }
  },
  plugins: [vue(), vueJsx()],
};

