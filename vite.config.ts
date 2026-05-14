import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  plugins: [
    vue(),
    AutoImport({
      // 自动导入 Vue, Vue Router, Pinia 的 API
      imports: ['vue', 'vue-router', 'pinia'],
      // 指定生成的 d.ts 文件位置
      dts: 'src/auto-imports.d.ts',
      // 解决 ESLint 报错
      eslintrc: {
        enabled: true
      }
    }),
    Components({
      // 自动导入 src/components 下的组件
      dts: 'src/components.d.ts'
    })
  ],
  server: {
    port: 5174
  }
})
