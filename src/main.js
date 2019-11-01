import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './App';
import router from './router';
import YmHeader from './components/YmHeader';
import axios from './http'
import ElementUI from 'element-ui'
import uploader from 'jun-simple-uploader'
import store from './store/store'
import 'element-ui/lib/theme-chalk/index.css'
import './assets/fonts/iconfont.js'
Vue.use(ElementUI)
Vue.prototype.$axios = axios;
Vue.component('ym-header', YmHeader)
Vue.use(uploader)
import './assets/css/style.css'
const app = new Vue({
    router,
    axios,
    store,
    render: h => h(App)
}).$mount('#app')