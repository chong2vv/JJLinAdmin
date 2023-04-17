<template>
  <div class="app-container">

    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增分类
      </el-button>
    </div>

    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%; margin-top:20px;">
      <el-table-column align="center" label="ID" width="80" type="index" />

      <el-table-column min-width="80px" label="类名">
        <template slot-scope="{row}">
          <span>{{ row.title }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="状态" width="200">
        <template slot-scope="{row}">
          <el-tag v-if="row.status === 1" type="success" effect="dark">使用中</el-tag>
          <el-tag v-if="row.status === 0" type="danger" effect="dark">已禁用</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" width="300">
        <template slot-scope="{row}">
          <el-button
            type="primary"
            size="small"
            icon="el-icon-edit"
            @click="handledEdit(row)"
          >
            编辑
          </el-button>
          <el-button v-if="row.status!== 1" size="mini" type="success" @click="handleModifyStatus(row,1)">
            启用
          </el-button>
          <el-button v-if="row.status!== 0" size="mini" @click="handleModifyStatus(row,0)">
            禁用
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.count" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="标题" prop="title">
          <el-input v-model="temp.title" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="temp.status" class="filter-item" placeholder="Please select">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, createTags, updateTags } from '@/api/tags'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'TagsEditTable',
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
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
        count: 10
      },
      temp: {
        id: undefined,
        title: '',
        status: 1
      },
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      statusOptions: [
        {
          value: 1,
          label: '启用'
        },
        {
          value: 0,
          label: '禁用'
        }
      ],
      dialogFormVisible: false,
      dialogStatus: ''
    }
  },
  created() {
    this.getList()
  },
  methods: {
    async getList() {
      this.listLoading = true
      const { data, total_count } = await fetchList(this.listQuery)
      this.list = data
      this.total = total_count
      this.listLoading = false
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        title: '',
        status: 1
      }
    },
    handledEdit(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'edit'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleModifyStatus(row, status) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.status = status
      this.updateData()
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.listLoading = true
          const self = this
          createTags(this.temp).then(response => {
            self.listLoading = false
            self.list.unshift(response.data)
            self.dialogFormVisible = false
            self.resetTemp()
            this.$notify({
              title: 'Success',
              message: 'Created Successfully',
              type: 'success',
              duration: 2000
            })
          }).catch(error => {
            console.log(error)
            self.listLoading = false
          })
        }
      })
    },
    updateData() {
      const self = this
      const tempData = Object.assign({}, this.temp)
      updateTags(tempData).then(() => {
        const index = this.list.findIndex(v => v.id === this.temp.id)
        this.temp.edit = false
        self.list.splice(index, 1, this.temp) // //成功后替换
        self.dialogFormVisible = false
        this.listLoading = false
        this.$notify({
          title: 'Success',
          message: 'Update Successfully',
          type: 'success',
          duration: 2000
        })
      })
    }
  }
}
</script>

<style scoped>

</style>
