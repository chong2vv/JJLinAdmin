const Mock = require('mockjs')

const tokens = {
  admin: {
    token: 'admin-token'
  },
  editor: {
    token: 'editor-token'
  }
}

const users = {
  'admin-token': {
    roles: ['admin'],
    introduction: 'I am a super administrator',
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    name: 'Super Admin'
  },
  'editor-token': {
    roles: ['editor'],
    introduction: 'I am an editor',
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    name: 'Normal Editor'
  }
}

const List = []
const count = 100

const baseContent = '这是一条测试的信息，哈哈哈哈哈哈哈'
const image_uri = 'https://wpimg.wallstcn.com/e4558086-631c-425c-9430-56ffb46e70b3'

for (let i = 0; i < count; i++) {
  List.push(Mock.mock({
    id: '@increment',
    nickname: '@title(1, 2)',
    avatar: image_uri,
    'status|1': [-1, 0, 1]
  }))
}

module.exports = [
  // user login
  {
    url: '/vue-admin-template/user/login',
    type: 'post',
    response: config => {
      const { username } = config.body
      const info = users["admin-token"]
      return {
        code: 200,
        data: info
      }
    }
  },

  // get user info
  {
    url: '/vue-admin-template/user/info\.*',
    type: 'get',
    response: config => {
      const { id } = config.query
      const info = users["admin-token"]

      // mock error
      if (!info) {
        return {
          code: 50008,
          message: 'Login failed, unable to get user details.'
        }
      }

      return {
        code: 200,
        data: info
      }
    }
  },

  // user logout
  {
    url: '/vue-admin-template/user/logout',
    type: 'post',
    response: _ => {
      return {
        code: 200,
        data: 'success'
      }
    }
  },

  {
    url: '/vue-admin-template/user/list',
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
      console.log(pageList)
      return {
        code: 200,
        total_count: mockList.length,
        data: pageList
      }
    }
  },

  {
    url: '/vue-admin-template/user/detail',
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
    url: '/vue-admin-template/user/create',
    type: 'post',
    response: _ => {
      return {
        code: 200,
        data: 'success'
      }
    }
  },

  {
    url: '/vue-admin-template/user/update',
    type: 'post',
    response: _ => {
      return {
        code: 200,
        data: 'success'
      }
    }
  },

  {
    url: '/vue-admin-template/user/op',
    type: 'post',
    response: _ => {
      return {
        code: 200,
        data: 'success'
      }
    }
  }
]
