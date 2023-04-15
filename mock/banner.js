const Mock = require('mockjs')

const List = []
const count = 100

const baseContent = '这是一条测试的信息，哈哈哈哈哈哈哈'
const image_uri = 'https://wpimg.wallstcn.com/e4558086-631c-425c-9430-56ffb46e70b3'
const push_url = 'https://baidu.com'

for (let i = 0; i < count; i++) {
  List.push(Mock.mock({
    id: '@increment',
    timestamp: +Mock.Random.date('T'),
    title: '@title(1, 2)',
    image_url: image_uri,
    url: push_url,
    remark: baseContent,
    'status|1': ['-1', '0', '1']
  }))
}

module.exports = [
  {
    url: '/vue-admin-template/banner/list',
    type: 'get',
    response: config => {
      const { title, page = 1, limit = 20, sort } = config.query

      let mockList = List.filter(item => {
        if (title && item.title.indexOf(title) < 0) return false
        return true
      })

      if (sort === '-id') {
        mockList = mockList.reverse()
      }

      const pageList = mockList.filter((item, index) => index < limit * page && index >= limit * (page - 1) && item.status !== '-1')

      return {
        code: 200,
        data: {
          total: mockList.length,
          items: pageList
        }
      }
    }
  },

  {
    url: '/vue-admin-template/banner/detail',
    type: 'get',
    response: config => {
      const { id } = config.query
      for (const classify of List) {
        if (classify.id === +id) {
          return {
            code: 200,
            data: classify
          }
        }
      }
    }
  },

  {
    url: '/vue-admin-template/banner/create',
    type: 'post',
    response: _ => {
      return {
        code: 200,
        data: 'success'
      }
    }
  },

  {
    url: '/vue-admin-template/banner/update',
    type: 'post',
    response: _ => {
      return {
        code: 200,
        data: 'success'
      }
    }
  },

  {
    url: '/vue-admin-template/banner/op',
    type: 'post',
    response: _ => {
      return {
        code: 200,
        data: 'success'
      }
    }
  }
]
