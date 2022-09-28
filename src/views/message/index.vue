<template>
  <div class="app-container">

    <div class="filter-container">
      <el-input v-model="listQuery.search_str" placeholder="搜索" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.status" placeholder="状态" clearable style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        Search
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="ID" width="70">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column label="标题" min-width="150">
        <template slot-scope="scope">
          {{ scope.row.title }}
        </template>
      </el-table-column>
      <el-table-column label="内容" min-width="200">
        <template slot-scope="scope">
          {{ scope.row.content }}
        </template>
      </el-table-column>
      <el-table-column label="名字" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="邮箱" width="160" align="center">
        <template slot-scope="scope">
          {{ scope.row.email }}
        </template>
      </el-table-column>
      <el-table-column label="电话" width="160" align="center">
        <template slot-scope="scope">
          {{ scope.row.phone }}
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="状态" width="80" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusTypeFilter">{{ scope.row.status | statusFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="来源" width="100" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.from_type | fromTypeFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="来源品名" width="150" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.from_title }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="发件时间" width="110">
        <template slot-scope="scope">
          <i class="el-icon-time" />
          <span>{{ formatJson(scope.row.timestamp) }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="200">
        <template slot-scope="scope">
          <el-button v-if="scope.row.status !== 1" size="mini" @click="handleModifyStatus(scope.row,1)">
            已处理
          </el-button>
          <el-button size="mini" type="success" @click="viewDetail(scope.row)">
            详情
          </el-button>
          <el-button size="mini" type="success" @click="sendMessage(scope.row)">
            发消息
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.count" @pagination="getList" />

    <el-dialog :title="dialogStatus" :visible.sync="dialogFormVisible">
      <template label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <div>
          <label class="radio-label" style="padding-left:0;">时间: </label>
          <label style="padding-left:0;">{{ formatJson(temp.timestamp) }}</label>
        </div>
        <div>
          <label class="radio-label" style="padding-left:0;">标题: </label>
          <label style="padding-left:0;">{{ temp.title }}</label>
        </div>
        <div>
          <label class="radio-label" style="padding-left:0;">邮箱: </label>
          <label style="padding-left:0;">{{ temp.email }}</label>
        </div>
        <div>
          <label class="radio-label" style="padding-left:0;">电话: </label>
          <label style="padding-left:0;">{{ temp.phone }}</label>
        </div>
        <div>
          <label class="radio-label" style="padding-left:0;">用户名: </label>
          <label style="padding-left:0;">{{ temp.name }}</label>
        </div>
        <div>
          <label class="radio-label" style="padding-left:0;">内容: </label>
          <label style="padding-left:0;">{{ temp.content }}</label>
        </div>
        <div>
          <label class="radio-label" style="padding-left:0;">来源: </label>
          <label style="padding-left:0;">{{ temp.from_type | fromTypeFilter }}</label>
        </div>
      </template>

      <div slot="footer" class="dialog-footer">
        <el-button v-if="temp.status !== 1" type="success" @click="handleModifyStatusAndClose">
          已处理
        </el-button>
        <el-button type="info" @click="dialogFormVisible = false">
          取消
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>

import { fetchList, updateMessage } from '@/api/message'
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'
import waves from '@/directive/waves' // secondary package based on el-pagination

export default {
  name: 'Message',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusTypeFilter(status) {
      const statusMap = {
        0: 'success',
        1: 'gray'
      }
      return statusMap[status]
    },
    statusFilter(status) {
      const statusMap = {
        0: '未处理',
        1: '已处理'
      }
      return statusMap[status]
    },
    // 来源type
    fromTypeFilter(status) {
      const statusMap = {
        0: '联系我们',
        1: '商品页',
        2: 'Blog页',
        3: '首页',
        4: '关于我们',
        5: '页脚'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: null,
      listLoading: true,
      total: 0,
      listQuery: {
        search_str: null,
        page: 1,
        count: 10,
        status: undefined
      },
      temp: {
        id: undefined,
        title: '',
        timestamp: undefined,
        create_at: '',
        name: '',
        content: '',
        email: '',
        phone: '',
        from_type: undefined,
        from_id: undefined,
        from_title: '',
        status: 0
      },
      sendMessageTemp: {
        email: '',
        content: ''
      },
      statusOptions: [{ label: '已处理', value: 0 }, { label: '未处理', value: 1 }],
      dialogFormVisible: false,
      dialogStatus: '详情'
    }
  },
  created() {
    this.getList()
  },
  methods: {
    async getList() {
      this.listLoading = true
      const { data, total_count } = await fetchList(this.listQuery)
      const items = data
      this.list = items
      this.total = total_count
      this.listLoading = false
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        title: '',
        name: '',
        timestamp: undefined,
        create_at: '',
        content: '',
        email: '',
        phone: '',
        from_type: undefined,
        from_id: undefined,
        from_title: '',
        status: undefined
      }
    },
    formatJson(filterVal) {
      return parseTime(filterVal)
    },
    handleModifyStatus(row, status) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.status = status
      const self = this
      updateMessage(this.temp).then(response => {
        this.$message({
          message: '操作Success',
          type: 'success'
        })
        row.status = status
        self.resetTemp()
      })
    },
    handleModifyStatusAndClose() {
      this.dialogFormVisible = false
      this.temp.status = 1
      const self = this
      updateMessage(this.temp).then(response => {
        const index = self.list.findIndex(v => v.id === this.temp.id)
        self.list.splice(index, 1, this.temp)
        self.resetTemp()
        this.$message({
          message: '操作Success',
          type: 'success'
        })
        self.listLoading = false
      })
    },
    viewDetail(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogFormVisible = true
    },
    sendMessage(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.sendMessageTemp.email = this.temp.email
      this.$message({
        message: '功能暂未开放',
        type: 'error'
      })
    }
  }
}
</script>

<style>
.radio-label {
  font-size: 14px;
  color: #606266;
  line-height: 40px;
  padding: 0 12px 0 30px;
}
</style>
