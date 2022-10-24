import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/vue-admin-template/diary/list',
    method: 'get',
    params: query
  })
}

export function fetchDiary(id) {
  return request({
    url: '/vue-admin-template/diary/detail',
    method: 'get',
    params: { id }
  })
}

export function createDiary(data) {
  return request({
    url: '/vue-admin-template/diary/create',
    method: 'post',
    data
  })
}

export function updateDiary(data) {
  return request({
    url: '/vue-admin-template/diary/update',
    method: 'post',
    data
  })
}
