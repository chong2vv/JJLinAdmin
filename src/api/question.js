import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/vue-admin-template/question/list',
    method: 'get',
    params: query
  })
}

export function fetchQuestionDetail(id) {
  return request({
    url: '/vue-admin-template/question/detail',
    method: 'get',
    params: { id }
  })
}

export function createQuestion(data) {
  return request({
    url: '/vue-admin-template/question/create',
    method: 'post',
    data
  })
}

export function updateQuestion(data) {
  return request({
    url: '/vue-admin-template/question/update',
    method: 'post',
    data
  })
}

export function opQuestion(data) {
  return request({
    url: '/vue-admin-template/question/op',
    method: 'post',
    data
  })
}
