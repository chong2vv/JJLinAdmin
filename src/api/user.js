import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/vue-admin-template/user/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/vue-admin-template/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/vue-admin-template/user/logout',
    method: 'post'
  })
}

export function fetchList(query) {
  return request({
    url: '/vue-admin-template/user/list',
    method: 'get',
    params: query
  })
}

export function getUserInfoWithId(id) {
  return request({
    url: '/vue-admin-template/user/detail',
    method: 'get',
    params: { id }
  })
}

export function createUser(data) {
  return request({
    url: '/vue-admin-template/user/create',
    method: 'post',
    data
  })
}
