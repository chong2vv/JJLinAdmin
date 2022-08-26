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
          {{ scope.$index }}
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
          <span>{{ formatJson(scope.row.timestamp) | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="120">
        <template slot-scope="scope">
          <el-button v-if="scope.row.status!='1'" size="mini" type="success" @click="handleModifyStatus(scope.row,'1')">
            完成处理
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

  </div>
</template>

<script>

import { fetchList } from '@/api/message'
import { parseTime } from '@/utils'

export default {
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
      statusOptions: ['已处理', '未处理']
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
    }
  }
}
</script>
