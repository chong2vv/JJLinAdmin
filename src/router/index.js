import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'DashboardAdmin',
      component: () => import('@/views/dashboard/index'),
      meta: { title: 'Dashboard', icon: 'dashboard' }
    }]
  },

  {
    path: '/user',
    component: Layout,
    children: [
      {
        path: 'user',
        name: 'user',
        component: () => import('@/views/user/user'),
        meta: { title: '用户', icon: 'peoples' }
      }
    ]
  },

  {
    path: '/classify',
    component: Layout,
    children: [
      {
        path: 'classify',
        name: 'classify',
        component: () => import('@/views/classify/classify'),
        meta: { title: '模块', icon: 'table' }
      }
    ]
  },

  {
    path: '/blog',
    component: Layout,
    name: 'Blog',
    redirect: '/blog/blog',
    meta: { title: '文章', icon: 'documentation' },
    children: [
      {
        path: 'list',
        name: 'ArticleList',
        component: () => import('@/views/blog/list'),
        meta: { title: '文章列表', icon: 'nested' }
      },
      {
        path: 'create',
        name: 'CreateArticle',
        component: () => import('@/views/blog/create'),
        meta: { title: '创建文章', icon: 'tree' }
      },
      {
        path: 'edit/:id(\\d+)',
        component: () => import('@/views/blog/edit'),
        name: 'EditArticle',
        meta: { title: '编辑文章', noCache: true, activeMenu: '/blog/blog' },
        hidden: true
      }
    ]
  },

  {
    path: '/message',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'message',
        component: () => import('@/views/message/index'),
        meta: { title: '信息', icon: 'email' }
      }
    ]
  },

  // {
  //   path: '/goods',
  //   component: Layout,
  //   name: 'Goods',
  //   redirect: '/goods/goods',
  //   meta: { title: '商品', icon: 'el-icon-s-help' },
  //   children: [
  //     {
  //       path: 'goods',
  //       name: 'goods',
  //       component: () => import('@/views/goods/list'),
  //       meta: { title: '商品列表', icon: 'shopping' }
  //     },
  //     {
  //       path: 'create',
  //       name: 'create',
  //       component: () => import('@/views/goods/create'),
  //       meta: { title: '创建商品', icon: 'tree' }
  //     },
  //     {
  //       path: 'edit/:id(\\d+)',
  //       component: () => import('@/views/goods/edit'),
  //       name: 'edit',
  //       meta: { title: '编辑商品', noCache: true, activeMenu: '/goods/goods' },
  //       hidden: true
  //     }
  //   ]
  // },

  // {
  //   path: 'external-link',
  //   component: Layout,
  //   children: [
  //     {
  //       path: 'http://8.142.125.160:9528/',
  //       meta: { title: 'HouseIn官网', icon: 'link' }
  //     }
  //   ]
  // },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router

export class asyncRoutes {
}
