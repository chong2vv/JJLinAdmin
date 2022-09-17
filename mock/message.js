const Mock = require('mockjs')

const List = []
const count = 100

const baseContent = '您好，我来联系你，请回信'
const image_uri = 'https://wpimg.wallstcn.com/e4558086-631c-425c-9430-56ffb46e70b3'

for (let i = 0; i < count; i++) {
  List.push(Mock.mock({
    id: '@increment',
    timestamp: +Mock.Random.date('T'),
    name: '@first',
    title: '@title(5, 10)',
    email: 'chong2vv@gmail.com',
    phone: '15712721839',
    content: baseContent,
    'from_type|1': [0, 1, 2, 3, 4, 5],
    from_id: '@increment',
    from_title: '@title(3, 6)',
    'status|1': [0, 1]
  }))
}

module.exports = [
  {
    url: '/vue-admin-template/message/list',
    type: 'get',
    response: config => {
      const { title, page = 1, count = 20, sort } = config.query

      let mockList = List.filter(item => {
        if (title && item.title.indexOf(title) < 0) return false
        return true
      })

      if (sort === '-id') {
        mockList = mockList.reverse()
      }

      const pageList = mockList.filter((item, index) => index < count * page && index >= count * (page - 1))

      return {
        code: 200,
        data: pageList,
        total_count: mockList.length
      }
    }
  },

  {
    url: '/vue-admin-template/message/detail',
    type: 'get',
    response: config => {
      const { id } = config.query
      for (const message of List) {
        if (message.id === +id) {
          return {
            code: 200,
            data: message
          }
        }
      }
    }
  },

  {
    url: '/vue-admin-template/message/create',
    type: 'post',
    response: _ => {
      return {
        code: 200,
        data: 'success'
      }
    }
  },

  {
    url: '/vue-admin-template/message/update',
    type: 'post',
    response: _ => {
      return {
        code: 200,
        data: 'success'
      }
    }
  },

  {
    url: '/vue-admin-template/message/op',
    type: 'post',
    response: _ => {
      return {
        code: 200,
        data: 'success'
      }
    }
  }
]
