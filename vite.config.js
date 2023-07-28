import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    css: {
      preprocessorOptions: {
        // 导入scss预编译程序
        /* 加载无效的原因：app.vue里面style 没有加上 lang="scss" */
        scss: {
          additionalData: `@import "./src/theme-chalk/index.scss";`
        }
      }
    }
  }
})
