import request from '@/utils/upload-request'

export function upload(data) {
  return request({
    method: 'post',
    data
  })
}
