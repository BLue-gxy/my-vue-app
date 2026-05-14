import { createApp, provide } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import i18n from './lang'
import { DefaultApolloClient } from '@vue/apollo-composable'
import { apolloClient } from '@/apollo/index'
import Antd from 'ant-design-vue'
import './assets/css/font.css'
import './assets/css/resetAnt.less'

const pinia = createPinia()

const app = createApp({
  setup() {
    // 3. 【核心】在全局提供 Apollo 客户端
    // 这样 Apollo 浏览器插件能识别到你的请求，且兼容 @vue/apollo-composable
    provide(DefaultApolloClient, apolloClient)
  },
  render: () => h(App)
})

app.use(router).use(i18n).use(pinia).use(Antd).mount('#app')
