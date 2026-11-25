import './assets/main.css'

import { createApp } from 'vue'
import Cookies from 'js-cookie'

import ElementPlus from 'element-plus'

import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

// svg图标
import 'virtual:svg-icons-register'
import SvgIcon from '@/components/svgIcon'
import elementIcons from '@/components/svgIcon/svgicon'

import App from './App.vue'
import router from './router'
import store from './stores'

// 分页组件
import Pagination from '@/components/Pagination'
import RightToolbar from '@/components/RightToolbar'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(store)
app.use(elementIcons)
app.component('svg-icon', SvgIcon)
app.component('Pagination', Pagination)
app.component('RightToolbar', RightToolbar)

// 使用element-plus 并且设置全局的大小
app.use(ElementPlus, {
    // 支持 large、default、small
    size: Cookies.get('size') || 'default'
})

app.mount('#app')
