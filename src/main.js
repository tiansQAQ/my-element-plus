import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import myAffix from './components/affix'

const app = createApp(App)
app.use(myAffix)
app.mount('#app')
