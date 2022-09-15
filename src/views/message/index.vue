<template>
  <div class="app-container">
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
      <el-table-column label="标题" width="200">
        <template slot-scope="scope">
          {{ scope.row.title }}
        </template>
      </el-table-column>
      <el-table-column label="内容" width="400">
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
          <el-tag :type="scope.row.status | statusFilter">{{ getLabelWithStatus( scope.row.status ) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="来源" width="80" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.from_type | statusFilter">{{ getFromTypeWithStatus( scope.row.from_type ) }}</el-tag>
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
          <el-button v-if="scope.row.status!='1'" size="mini" @click="handleModifyStatus(scope.row,'1')">
            已处理
          </el-button>
          <el-button size="mini" type="success" @click="viewDetail(scope.row)">
            详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

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
          <label style="padding-left:0;">{{ getFromTypeWithStatus( temp.from_type ) }}</label>
        </div>
      </template>

      <div slot="footer" class="dialog-footer">
        <el-button type="success" @click="handleModifyStatusAndClose">
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

import { fetchList, opMessage } from '@/api/message'
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'Message',
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        0: 'success',
        1: 'gray'
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
        page: 1,
        limit: 10
      },
      temp: {
        id: undefined,
        title: '',
        name: '',
        content: '',
        email: '',
        phone: '',
        from_type: '0',
        status: '0'
      },
      statusOptions: ['已处理', '未处理'],
      fromTypeOptions: ['const', 'blog'],
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
      const { data } = await fetchList(this.listQuery)
      const items = data.items
      this.list = items
      this.total = data.total
      this.listLoading = false
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        title: '',
        name: '',
        content: '',
        email: '',
        phone: '',
        from_type: '0',
        status: '0'
      }
    },
    getLabelWithStatus(status) {
      const statusMap = {
        0: '未处理',
        1: '已处理'
      }
      return statusMap[status]
    },
    getFromTypeWithStatus(status) {
      const statusMap = {
        0: 'const',
        1: 'blog'
      }
      return statusMap[status]
    },
    formatJson(filterVal) {
      return parseTime(filterVal)
    },
    handleModifyStatus(row, status) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.status = status
      const self = this
      opMessage(this.temp).then(response => {
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
      this.temp.status = '1'
      const self = this
      opMessage(this.temp).then(response => {
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
