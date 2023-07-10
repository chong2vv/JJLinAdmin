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
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增题目
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
      <el-table-column label="问题" min-width="150">
        <template slot-scope="scope">
          {{ scope.row.question }}
        </template>
      </el-table-column>
      <el-table-column label="答案" min-width="200">
        <template slot-scope="scope">
          {{ scope.row.answer }}
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="时间" width="110">
        <template slot-scope="scope">
          <i class="el-icon-time" />
          <span>{{ scope.row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="200">
        <template slot-scope="scope">
          <el-button type="success" size="mini" @click="handleUpdate(scope.row)">
            编辑
          </el-button>
          <el-button size="mini" @click="handleModifyStatus(scope.row,0)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.count" @pagination="getList" />

    <el-dialog :title="dialogStatus" :visible.sync="dialogFormVisible">
      <template label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <div>
          <label class="radio-label" style="padding-left:0;">问题: </label>
          <el-input v-model="temp.question" />
        </div>
        <div>
          <label class="radio-label" style="padding-left:0;">答案: </label>
          <el-input v-model="temp.answer" />
        </div>
      </template>

      <div slot="footer" class="dialog-footer">
        <el-button type="success" @click="saveData">
          确定
        </el-button>
        <el-button type="info" @click="dialogFormVisible = false">
          取消
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>

import { fetchList, updateQuestion, createQuestion } from '@/api/question'
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'
import waves from '@/directive/waves' // secondary package based on el-pagination

export default {
  name: 'Question',
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
        0: '已隐藏',
        1: '显示中'
      }
      return statusMap[status]
    },
    // 来源type
    fromTypeFilter(status) {
      const statusMap = {
        0: '联系我们'
      }
      return statusMap[status]
    },
    // 来源站点
    fromWebsiteFilter(type) {
      const typeMap = {
        0: '主站',
        1: '副站1'
      }
      return typeMap[type]
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
        createTime: '',
        question: '',
        answer: '',
        status: 1
      },
      isEdit: false,
      statusOptions: [{ label: '下线', value: 0 }, { label: '显示', value: 1 }],
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
        status: undefined
      }
    },
    formatJson(filterVal) {
      return parseTime(filterVal)
    },
    saveData() {
      const self = this
      if (this.isEdit === false) {
        this.temp.status = 1
        createQuestion(this.temp).then(response => {
          this.$message({
            message: '操作Success',
            type: 'success'
          })
          self.getList()
          self.resetTemp()
        })
      } else {
        updateQuestion(this.temp).then(response => {
          this.$message({
            message: '操作Success',
            type: 'success'
          })
          const index = self.list.findIndex(v => v.id === this.temp.id)
          self.list.splice(index, 1, this.temp)
          self.resetTemp()
        })
      }
    },
    handleModifyStatus(row, status) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.status = status
      const self = this
      updateQuestion(this.temp).then(response => {
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
      updateQuestion(this.temp).then(response => {
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
    handleCreate() {
      this.isEdit = false
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleUpdate(row) {
      this.isEdit = true
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
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
