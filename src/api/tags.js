import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/vue-admin-template/tag/list',
    method: 'get',
    params: query
  })
}

export function fetchTags(id) {
  return request({
    url: '/vue-admin-template/tag/detail',
    method: 'get',
    params: { id }
  })
}

export function createTags(data) {
  return request({
    url: '/vue-admin-template/tag/create',
    method: 'post',
    data
  })
}

export function updateTags(data) {
  return request({
    url: '/vue-admin-template/tag/update',
    method: 'post',
    data
  })
}

export function opTags(data) {
  return request({
    url: '/vue-admin-template/tag/op',
    method: 'post',
    data
  })
}
