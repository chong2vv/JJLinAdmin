const Mock = require('mockjs')

const List = []
const count = 100

const baseContent = '<p>I am testing data, I am testing data.</p><p><img src="https://wpimg.wallstcn.com/4c69009c-0fd4-4153-b112-6cb53d1cf943"></p>'
const image_uri = 'https://wpimg.wallstcn.com/e4558086-631c-425c-9430-56ffb46e70b3'

for (let i = 0; i < count; i++) {
  List.push(Mock.mock({
    author: '@first',
    categories: {
      id: '@increment',
      title: '分类1'
    },
    content: baseContent,
    create_at: '@datetime',
    excerpt: 'mock data',
    id: '@increment',
    img: image_uri,
    'status|1': [0, 1],
    tags: ['CN', 'US', 'JP', 'EU'],
    title: '@title(5, 10)',
    view: '@integer(300, 5000)'
  }))
}

module.exports = [
  {
    url: '/vue-admin-template/diary/list',
    type: 'get',
    response: config => {
      const { search_str, page = 1, count = 20, sort } = config.query

      let mockList = List.filter(item => {
        if (search_str && item.title.indexOf(search_str) < 0) return false
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
    url: '/vue-admin-template/diary/detail',
    type: 'get',
    response: config => {
      const { id } = config.query
      for (const diary of List) {
        if (diary.id === +id) {
          return {
            code: 200,
            data: diary
          }
        }
      }
    }
  },

  {
    url: '/vue-admin-template/diary/pv',
    type: 'get',
    response: _ => {
      return {
        code: 200,
        data: {
          pvData: [
            { key: 'PC', pv: 1024 },
            { key: 'mobile', pv: 1024 },
            { key: 'ios', pv: 1024 },
            { key: 'android', pv: 1024 }
          ]
        }
      }
    }
  },

  {
    url: '/vue-admin-template/diary/create',
    type: 'post',
    response: _ => {
      return {
        code: 200,
        data: 'success'
      }
    }
  },

  {
    url: '/vue-admin-template/diary/update',
    type: 'post',
    response: _ => {
      return {
        code: 200,
        data: 'success'
      }
    }
  }
]

