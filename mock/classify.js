const Mock = require('mockjs')

const List = []
const count = 100

const baseContent = '这是一条测试的信息，哈哈哈哈哈哈哈'
const image_uri = 'https://wpimg.wallstcn.com/e4558086-631c-425c-9430-56ffb46e70b3'

for (let i = 0; i < count; i++) {
  List.push(Mock.mock({
    id: '@increment',
    create_at: +Mock.Random.date('T'),
    title: '@title(1, 2)',
    remark: baseContent,
    image_url: image_uri,
    'status|1': [-1, 0, 1]
  }))
}

module.exports = [
  {
    url: '/vue-admin-template/classify/list',
    type: 'get',
    response: config => {
      const { title, page=1, count=10, sort } = config.query

      let mockList = List.filter(item => {
        if (title && item.title.indexOf(title) < 0) return false
        return true
      })

      if (sort === '-id') {
        mockList = mockList.reverse()
      }

      const pageList = mockList.filter((item, index) => index < count * page && index >= count * (page - 1) &&item.status !== -1)

      return {
        code: 200,
        total_count: mockList.length,
        data: pageList
      }
    }
  },

  {
    url: '/vue-admin-template/classify/detail',
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
    url: '/vue-admin-template/classify/create',
    type: 'post',
    response: config => {
      const { title, remark, status } = config.body
      console.log(config.body)
      let data = {}
      data.title = title
      data.remark = remark
      data.status = status
      data.id = 111222
      console.log(data.title)
      return {
        code: 200,
        data: data
      }
    }
  },

  {
    url: '/vue-admin-template/classify/update',
    type: 'post',
    response: _ => {
      return {
        code: 200,
        data: 'success'
      }
    }
  },

  {
    url: '/vue-admin-template/classify/op',
    type: 'post',
    response: _ => {
      return {
        code: 200,
        data: 'success'
      }
    }
  }
]
