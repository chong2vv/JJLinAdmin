import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/vue-admin-template/banner/list',
    method: 'get',
    params: query
  })
}

export function fetchBanner(id) {
  return request({
    url: '/vue-admin-template/banner/detail',
    method: 'get',
    params: { id }
  })
}

export function createBanner(data) {
  return request({
    url: '/vue-admin-template/banner/create',
    method: 'post',
    data
  })
}

export function updateBanner(data) {
  return request({
    url: '/vue-admin-template/banner/update',
    method: 'post',
    data
  })
}

export function opBanner(data) {
  return request({
    url: '/vue-admin-template/banner/op',
    method: 'post',
    data
  })
}
