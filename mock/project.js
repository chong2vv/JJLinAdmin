const Mock = require('mockjs')

const List = []
const count = 100

const baseContent = '我是商品的描述我是商品的描述我是商品的描述我是商品的描述我是商品的描述我是商品的描述我是商品的描述我是商品的描述我是商品的描述我是商品的描述'
const image_uri = 'https://wpimg.wallstcn.com/e4558086-631c-425c-9430-56ffb46e70b3'

for (let i = 0; i < count; i++) {
  List.push(Mock.mock({
    id: '@increment',
    timestamp: +Mock.Random.date('T'),
    title: '@title(5, 10)',
    excerpt: 'mock data',
    content: baseContent,
    classify: {
      id: '@increment',
      title: '分类1'
    },
    tags: ['CN', 'US', 'JP', 'EU'],
    'status|1': [0, 1],
    create_at: '@datetime',
    size: '168cm (W) x 59.5cm (D) x 109.5cm (H)\n' +
      '66.14" (W) x 23.42" (D) x 43.11" (H)',
    material: 'Powder Coating Steel & PP Plastic',
    pack: 'Shrinkwrap/mail order box/gif box/PDQ box',
    qty: '1344pcs',
    timer: '25-30days',
    cover_img: image_uri,
    img_list: [image_uri, image_uri, image_uri],
    'is_home_list|1': [0, 1]
  }))
}

module.exports = [
  {
    url: '/vue-admin-template/project/list',
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
        total_count: mockList.length,
        data: pageList
      }
    }
  },

  {
    url: '/vue-admin-template/project/detail',
    type: 'get',
    response: config => {
      const { id } = config.query
      for (const project of List) {
        if (project.id === +id) {
          return {
            code: 200,
            data: project
          }
        }
      }
    }
  },

  {
    url: '/vue-admin-template/project/create',
    type: 'post',
    response: config => {
      const data = config.body
      data.id = 1111111
      return {
        code: 200,
        data: data
      }
    }
  },

  {
    url: '/vue-admin-template/project/update',
    type: 'post',
    response: _ => {
      return {
        code: 200,
        data: 'success'
      }
    }
  }
]
