import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/vue-admin-template/message/list',
    method: 'get',
    params: query
  })
}

export function fetchMessageDetail(id) {
  return request({
    url: '/vue-admin-template/message/detail',
    method: 'get',
    params: { id }
  })
}

export function createMessage(data) {
  return request({
    url: '/vue-admin-template/message/create',
    method: 'post',
    data
  })
}

export function updateMessage(data) {
  return request({
    url: '/vue-admin-template/message/update',
    method: 'post',
    data
  })
}

export function opMessage(data) {
  return request({
    url: '/vue-admin-template/message/op',
    method: 'post',
    data
  })
}
