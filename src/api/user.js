import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/vue-admin-template/user/login',
    method: 'post',
    data
  })
}

export function getInfo(id) {
  return request({
    url: '/vue-admin-template/user/info',
    method: 'get',
    params: { id }
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

export function createUser(data) {
  return request({
    url: '/vue-admin-template/user/create',
    method: 'post',
    data
  })
}

export function updateUser(data) {
  return request({
    url: '/vue-admin-template/user/update',
    method: 'post',
    data
  })
}

export function opUser(data) {
  return request({
    url: '/vue-admin-template/user/op',
    method: 'post',
    data
  })
}
