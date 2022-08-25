import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/vue-admin-template/classify/list',
    method: 'get',
    params: query
  })
}

export function fetchClassify(id) {
  return request({
    url: '/vue-admin-template/classify/detail',
    method: 'get',
    params: { id }
  })
}

export function createClassify(data) {
  return request({
    url: '/vue-admin-template/classify/create',
    method: 'post',
    data
  })
}

export function updateClassify(data) {
  return request({
    url: '/vue-admin-template/classify/update',
    method: 'post',
    data
  })
}
