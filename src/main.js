import Vue from 'vue'
import Router from 'vue-router'
import App from './App.vue'
import Login from './components/Login.vue'
import Register from './components/Register.vue'
import CatalogView from './components/CatalogView.vue'
import CatalogList from './components/CatalogList.vue'
import CatalogAdd from './components/CatalogAdd.vue'
import TrackAdd from './components/TrackAdd.vue'
import Axios from 'axios'

Vue.use(Router)
Vue.prototype.$http = Axios;

const router = new Router({
  routes: [
    {
      path: '/',
      name:'home',
      component: CatalogView,
    },
    {
      path: '/catalog/add',
      name: 'catalog-add',
      component: CatalogView,
      children: [
        { path: '/catalog/add', name:'catalog-add', component: CatalogAdd },
      ],
      meta: { 
         requiresAuth: true
      }
    },
    {
      path: '/track/add/:id',
      name: 'track-add',
      component: CatalogView,
      children: [
        { path: '', name:'track-add', component: TrackAdd, props:true  },
      ],
      meta: { 
         requiresAuth: true
      }
    },
    {
      path: '/catalog/:id',
      name: 'catalog',
      component: CatalogView,
      children: [
        { path: '', name:'catalog', component: CatalogList, props:true },
      ]
    },
    {
      path: '/login',
      component: Login,
      meta: { 
        guest: true
      }
    },
    {
      path: '/register',
      component: Register,
      meta: { 
        guest: true
      }
    }
  ]
})

router.beforeEach((to, from, next) => {
    if(to.fullPath == '/logout')
    {
        localStorage.removeItem('jwt');
        next({name:'home'});
    } else if(to.matched.some(record => record.meta.requiresAuth)) {
        if (localStorage.getItem('jwt') == null) {
            next({
                path: '/login',
                params: { nextUrl: to.fullPath }
            })
        } else {
            next()
        }
    } else if(to.matched.some(record => record.meta.guest)) {
        if(localStorage.getItem('jwt') == null){
            next()
        }
        else{
            next({ name: 'home'})
        }
    }else {
        next() 
    }
})

const vm = new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
}).$mount('#app')
