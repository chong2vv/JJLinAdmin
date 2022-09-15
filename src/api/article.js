import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/vue-admin-template/blog/list',
    method: 'get',
    params: query
  })
}

export function fetchArticle(id) {
  return request({
    url: '/vue-admin-template/blog/detail',
    method: 'get',
    params: { id }
  })
}

export function fetchPv(pv) {
  return request({
    url: '/vue-admin-template/blog/pv',
    method: 'get',
    params: { pv }
  })
}

export function createArticle(data) {
  return request({
    url: '/vue-admin-template/blog/create',
    method: 'post',
    data
  })
}

export function updateArticle(data) {
  return request({
    url: '/vue-admin-template/blog/update',
    method: 'post',
    data
  })
}
