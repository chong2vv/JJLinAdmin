import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/vue-admin-template/project/list',
    method: 'get',
    params: query
  })
}

export function fetchProject(id) {
  return request({
    url: '/vue-admin-template/project/detail',
    method: 'get',
    params: { id }
  })
}

export function createProject(data) {
  return request({
    url: '/vue-admin-template/project/create',
    method: 'post',
    data
  })
}

export function updateProject(data) {
  return request({
    url: '/vue-admin-template/project/update',
    method: 'post',
    data
  })
}

export function opProject(data) {
  return request({
    url: '/vue-admin-template/user/op',
    method: 'post',
    data
  })
}

export function downLoadProjectExcel(data) {
  return request({
    url: '/vue-admin-template/project/exportProjectExcelFile',
    method: 'post',
    data
  })
}

