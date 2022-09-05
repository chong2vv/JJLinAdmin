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
    categories: {
      id: '@increment',
      title: '分类1'
    },
    tags:  ['CN', 'US', 'JP', 'EU'],
    'status|1': ['0', '1'],
    create_at: '@datetime',
    size: '168cm (W) x 59.5cm (D) x 109.5cm (H)\n' +
      '66.14" (W) x 23.42" (D) x 43.11" (H)',
    material: 'Powder Coating Steel & PP Plastic',
    pack: 'Shrinkwrap/mail order box/gif box/PDQ box',
    qty: '1344pcs',
    timer: '25-30days',
    cover_img: image_uri,
    img_list: [image_uri, image_uri, image_uri],
    'is_home_list:1': [true, false]
  }))
}
