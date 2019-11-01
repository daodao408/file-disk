import Vue from 'vue';
import VueRouter from 'vue-router';
import config from '../config'
import store from '../store/store'
import base64 from "../utils/base64";
import axios from '../http';
// Vue.prototype.$axios = axios;
import * as types from '../store/types'
Vue.use(VueRouter);
const router = new VueRouter({
  mode: config.routeMode || 'hash', //hash 打包需要使用hash 无#： history
  routes: [{
      name: 'login',
      path: '/login',
      component: require('../login/login')
    },
    { //前台路由配置
      name: 'site',
      path: '/',
      component: require('../pages/root'),
      children: [{
          name: 'home',
          path: 'home',
          component: require('../pages/home')
        },
        {
          path: 'about',
          component: require('../pages/about')
        },
        {
          path: 'article/:type',
          component: require('../pages/article')
        },
        {
          name: 'detail',
          path: 'article/:type/:id',
          component: require('../pages/detail')
        },
      ],
      redirect: '/login/'
    },
    {
      name: 'admin',
      path: '/admin',
      component: require('../admin/root'),
      children: [{
          path: '/',
          component: require('../admin/myFile')
        },
        {
          path: 'myFile',
          meta: {
            requireAuth: true,
          },
          component: require('../admin/myFile')
        },
        {
          path: 'shareFile',
          component: require('../admin/shareFile')
        },
        {
          path: 'myShare',
          component: require('../admin/myShare')
        },
        // {
        //     path: 'recycleBin',
        //     component: require('../admin/recycleBin')
        // },
        {
          path: 'groupManage',
          component: require('../admin/groupManage')
        },
        {
          path: 'userManage',
          component: require('../admin/userManage')
        },
        {
          path: 'structure',
          component: require('../admin/structure')
        },
        // {
        //     path: 'operationLog',
        //     component: require('../admin/operationLog')
        // },
        {
          path: 'logManage',
          component: require('../admin/logManage')
        },
        {
          path: 'systemConfig',
          component: require('../admin/systemConfig')
        },
        {
          path: 'recyclingStation',
          component: require('../admin/recyclingStation')
        }
      ]
    },
  ]
})

// 页面刷新时，重新赋值token
if (sessionStorage.getItem('token')) {
  store.commit(types.LOGIN, sessionStorage.getItem('token'))
}

router.beforeEach((to, from, next) => {
  // console.log(`路由到：${to.path}`)

  if (to.path == '/admin/myFile' && to.query.name && to.query.password) {
    let params = {
      anotherName: to.query.name,
      password: to.query.password,
      remember: "1"
    }
    axios({
      method: "post",
      url: "/api/login/toLogin",
      data: params
    }).then(res => {
      if (res.data.code == 200) {
        store.commit(types.LOGIN, res.data.data.token);
        sessionStorage.isStaff = res.data.data.isStaff;
        sessionStorage.seafileUrl = res.data.data.seafileUrl;
        sessionStorage.user = JSON.stringify({
          username: to.query.name,
          password: to.query.password
        });
        next();
      }
    })
    return false
    // next();
  }

  if (store.state.token) {
    let leftMenuUlObj = document.querySelector('.el-menu-vertical-demo');
    if (sessionStorage.getItem('isStaff') === '0') {
      if (to.fullPath == '/admin/myFile' && leftMenuUlObj) {
        for (let i = 0; i < leftMenuUlObj.childNodes.length; i++) {
          if (i === 0) {
            leftMenuUlObj.childNodes[i].className = 'el-menu-item is-active';
          } else {
            leftMenuUlObj.childNodes[i].className = 'el-menu-item';
          }
        }
      } else if (to.fullPath == '/admin/shareFile' && leftMenuUlObj) {
        for (let i = 0; i < leftMenuUlObj.childNodes.length; i++) {
          if (i === 1) {
            leftMenuUlObj.childNodes[i].className = 'el-menu-item is-active';
          } else {
            leftMenuUlObj.childNodes[i].className = 'el-menu-item';
          }
        }
      } else if (to.fullPath == '/admin/myShare' && leftMenuUlObj) {
        for (let i = 0; i < leftMenuUlObj.childNodes.length; i++) {
          if (i === 2) {
            leftMenuUlObj.childNodes[i].className = 'el-menu-item is-active';
          } else {
            leftMenuUlObj.childNodes[i].className = 'el-menu-item';
          }
        }
      } else if (to.fullPath == '/admin/groupManage' && leftMenuUlObj) {
        for (let i = 0; i < leftMenuUlObj.childNodes.length; i++) {
          if (i === 3) {
            leftMenuUlObj.childNodes[i].className = 'el-menu-item is-active';
          } else {
            leftMenuUlObj.childNodes[i].className = 'el-menu-item';
          }
        }
      } else if (to.fullPath == '/admin/recyclingStation' && leftMenuUlObj) {
        for (let i = 0; i < leftMenuUlObj.childNodes.length; i++) {
          if (i === 4) {
            leftMenuUlObj.childNodes[i].className = 'el-menu-item is-active';
          } else {
            leftMenuUlObj.childNodes[i].className = 'el-menu-item';
          }
        }
      }
    } else if (sessionStorage.getItem('isStaff') === '1') {
      if (to.fullPath == '/admin/myFile' && leftMenuUlObj) {
        for (let i = 0; i < leftMenuUlObj.childNodes.length; i++) {
          if (i === 0) {
            leftMenuUlObj.childNodes[i].className = 'el-menu-item is-active';
          } else {
            leftMenuUlObj.childNodes[i].className = 'el-menu-item';
          }
        }
      } else if (to.fullPath == '/admin/shareFile' && leftMenuUlObj) {
        for (let i = 0; i < leftMenuUlObj.childNodes.length; i++) {
          if (i === 1) {
            leftMenuUlObj.childNodes[i].className = 'el-menu-item is-active';
          } else {
            leftMenuUlObj.childNodes[i].className = 'el-menu-item';
          }
        }
      } else if (to.fullPath == '/admin/myShare' && leftMenuUlObj) {
        for (let i = 0; i < leftMenuUlObj.childNodes.length; i++) {
          if (i === 2) {
            leftMenuUlObj.childNodes[i].className = 'el-menu-item is-active';
          } else {
            leftMenuUlObj.childNodes[i].className = 'el-menu-item';
          }
        }
      } else if (to.fullPath == '/admin/groupManage' && leftMenuUlObj) {
        for (let i = 0; i < leftMenuUlObj.childNodes.length; i++) {
          if (i === 3) {
            leftMenuUlObj.childNodes[i].className = 'el-menu-item is-active';
          } else {
            leftMenuUlObj.childNodes[i].className = 'el-menu-item';
          }
        }
      } else if (to.fullPath == '/admin/userManage' && leftMenuUlObj) {
        for (let i = 0; i < leftMenuUlObj.childNodes.length; i++) {
          if (i === 4) {
            leftMenuUlObj.childNodes[i].className = 'el-menu-item is-active';
          } else {
            leftMenuUlObj.childNodes[i].className = 'el-menu-item';
          }
        }
      } else if (to.fullPath == '/admin/structure' && leftMenuUlObj) {
        for (let i = 0; i < leftMenuUlObj.childNodes.length; i++) {
          if (i === 5) {
            leftMenuUlObj.childNodes[i].className = 'el-menu-item is-active';
          } else {
            leftMenuUlObj.childNodes[i].className = 'el-menu-item';
          }
        }
      } else if (to.fullPath == '/admin/logManage' && leftMenuUlObj) {
        for (let i = 0; i < leftMenuUlObj.childNodes.length; i++) {
          if (i === 6) {
            leftMenuUlObj.childNodes[i].className = 'el-menu-item is-active';
          } else {
            leftMenuUlObj.childNodes[i].className = 'el-menu-item';
          }
        }
      } else if (to.fullPath == '/admin/systemConfig' && leftMenuUlObj) {
        for (let i = 0; i < leftMenuUlObj.childNodes.length; i++) {
          if (i === 7) {
            leftMenuUlObj.childNodes[i].className = 'el-menu-item is-active';
          } else {
            leftMenuUlObj.childNodes[i].className = 'el-menu-item';
          }
        }
      } else if (to.fullPath == '/admin/recyclingStation' && leftMenuUlObj) {
        for (let i = 0; i < leftMenuUlObj.childNodes.length; i++) {
          if (i === 8) {
            leftMenuUlObj.childNodes[i].className = 'el-menu-item is-active';
          } else {
            leftMenuUlObj.childNodes[i].className = 'el-menu-item';
          }
        }
      }
    } else if (sessionStorage.getItem('isStaff') === '2') {
      if (to.fullPath == '/admin/myFile' && leftMenuUlObj) {
        for (let i = 0; i < leftMenuUlObj.childNodes.length; i++) {
          if (i === 0) {
            leftMenuUlObj.childNodes[i].className = 'el-menu-item is-active';
          } else {
            leftMenuUlObj.childNodes[i].className = 'el-menu-item';
          }
        }
      } else if (to.fullPath == '/admin/shareFile' && leftMenuUlObj) {
        for (let i = 0; i < leftMenuUlObj.childNodes.length; i++) {
          if (i === 1) {
            leftMenuUlObj.childNodes[i].className = 'el-menu-item is-active';
          } else {
            leftMenuUlObj.childNodes[i].className = 'el-menu-item';
          }
        }
      } else if (to.fullPath == '/admin/myShare' && leftMenuUlObj) {
        for (let i = 0; i < leftMenuUlObj.childNodes.length; i++) {
          if (i === 2) {
            leftMenuUlObj.childNodes[i].className = 'el-menu-item is-active';
          } else {
            leftMenuUlObj.childNodes[i].className = 'el-menu-item';
          }
        }
      } else if (to.fullPath == '/admin/groupManage' && leftMenuUlObj) {
        for (let i = 0; i < leftMenuUlObj.childNodes.length; i++) {
          if (i === 3) {
            leftMenuUlObj.childNodes[i].className = 'el-menu-item is-active';
          } else {
            leftMenuUlObj.childNodes[i].className = 'el-menu-item';
          }
        }
      } else if (to.fullPath == '/admin/userManage' && leftMenuUlObj) {
        for (let i = 0; i < leftMenuUlObj.childNodes.length; i++) {
          if (i === 4) {
            leftMenuUlObj.childNodes[i].className = 'el-menu-item is-active';
          } else {
            leftMenuUlObj.childNodes[i].className = 'el-menu-item';
          }
        }
      } else if (to.fullPath == '/admin/structure' && leftMenuUlObj) {
        for (let i = 0; i < leftMenuUlObj.childNodes.length; i++) {
          if (i === 5) {
            leftMenuUlObj.childNodes[i].className = 'el-menu-item is-active';
          } else {
            leftMenuUlObj.childNodes[i].className = 'el-menu-item';
          }
        }
      } else if (to.fullPath == '/admin/systemConfig' && leftMenuUlObj) {
        for (let i = 0; i < leftMenuUlObj.childNodes.length; i++) {
          if (i === 6) {
            leftMenuUlObj.childNodes[i].className = 'el-menu-item is-active';
          } else {
            leftMenuUlObj.childNodes[i].className = 'el-menu-item';
          }
        }
      } else if (to.fullPath == '/admin/recyclingStation' && leftMenuUlObj) {
        for (let i = 0; i < leftMenuUlObj.childNodes.length; i++) {
          if (i === 7) {
            leftMenuUlObj.childNodes[i].className = 'el-menu-item is-active';
          } else {
            leftMenuUlObj.childNodes[i].className = 'el-menu-item';
          }
        }
      }
    }
    next();
  } else {
    if (localStorage.getItem("requireAuthFlag")) {
      store.commit(types.LOGIN, localStorage.getItem("token"));
      sessionStorage.user = localStorage.user;
      sessionStorage.isStaff = localStorage.isStaff;
      sessionStorage.seafileUrl = localStorage.seafileUrl;
      sessionStorage.manageDepartmentId = localStorage.manageDepartmentId;
      next('/admin/myFile');
    } else {
      if (to.path == '/login') { //如果是登录页面路径，就直接next()
        next();
      } else { //不然就跳转到登录
        next()
      }
    }

  }
});

router.afterEach(route => {

})
export default router
