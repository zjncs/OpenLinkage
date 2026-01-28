import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { setActivePinia } from 'pinia'
import router from './router'
import Vant from 'vant'
import 'vant/lib/index.css'
import './style.css'
import App from './App.vue'
import { useUserStore } from './store/user'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
setActivePinia(pinia)

// 从本地恢复登录态
useUserStore().init()

app.use(router)
app.use(Vant)

app.mount('#app')
