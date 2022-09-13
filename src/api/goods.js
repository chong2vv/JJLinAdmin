import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/vue-admin-template/goods/list',
    method: 'get',
    params: query
  })
}

export function fetchGoods(id) {
  return request({
    url: '/vue-admin-template/goods/detail',
    method: 'get',
    params: { id }
  })
}

export function createAGoods(data) {
  return request({
    url: '/vue-admin-template/goods/create',
    method: 'post',
    data
  })
}

export function updateGoods(data) {
  return request({
    url: '/vue-admin-template/goods/update',
    method: 'post',
    data
  })
}

export function opGoods(data) {
  return request({
    url: '/vue-admin-template/user/op',
    method: 'post',
    data
  })
}
