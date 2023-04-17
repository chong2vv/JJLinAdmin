import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/vue-admin-template/categories/list',
    method: 'get',
    params: query
  })
}

export function fetchCategories(id) {
  return request({
    url: '/vue-admin-template/categories/detail',
    method: 'get',
    params: { id }
  })
}

export function createCategories(data) {
  return request({
    url: '/vue-admin-template/categories/create',
    method: 'post',
    data
  })
}

export function updateCategories(data) {
  return request({
    url: '/vue-admin-template/categories/update',
    method: 'post',
    data
  })
}

export function opCategories(data) {
  return request({
    url: '/vue-admin-template/categories/op',
    method: 'post',
    data
  })
}
