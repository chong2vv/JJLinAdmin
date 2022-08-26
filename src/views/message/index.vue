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
      <el-table-column label="邮箱" width="180" align="center">
        <template slot-scope="scope">
          {{ scope.row.email }}
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="状态" width="80" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusFilter">{{ getLabelWithStatus( scope.row.status ) }}</el-tag>
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
        <label class="radio-label" style="padding-left:0;">时间: </label>
        <label style="padding-left:0;">{{ formatJson(temp.timestamp) }}</label>
        <label class="radio-label" style="padding-left:0;">标题: </label>
        <label style="padding-left:0;">{{ temp.title }}</label>
        <label class="radio-label" style="padding-left:0;">邮箱: </label>
        <label style="padding-left:0;">{{ temp.email }}</label>
        <label class="radio-label" style="padding-left:0;">用户名: </label>
        <label style="padding-left:0;">{{ temp.name }}</label>
        <label class="radio-label" style="padding-left:0;">内容: </label>
        <label style="padding-left:0;">{{ temp.content }}</label>
      </template>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          Cancel
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
        status: '0'
      },
      statusOptions: ['已处理', '未处理'],
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
    formatJson(filterVal) {
      return parseTime(filterVal)
    },
    handleModifyStatus(row, status) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.status = status
      console.log('status ==== ' + status)
      console.log('title ==== ' + this.temp.title)
      opMessage(this.temp).then(response => {
        this.$message({
          message: '操作Success',
          type: 'success'
        })
        row.status = status
        setTimeout(() => {
          this.listLoading = false
        }, 5 * 1000)
      })
    },
    viewDetail(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogFormVisible = true
    },
    closeViewDetail() {
      this.dialogFormVisible = false
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
