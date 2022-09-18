<template>
  <div class="app-container">

    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增用户
      </el-button>
    </div>

    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%; margin-top:20px;">
      <el-table-column align="center" label="ID" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column width="100" label="头像">
        <template slot-scope="{row}">
          <el-image :src="row.avatar" :preview-src-list="[row.avatar]" />
        </template>
      </el-table-column>

      <el-table-column min-width="80px" label="用户名">
        <template slot-scope="{row}">
          <span>{{ row.nickname }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" width="200">
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
            @click="handledEdit(row) "
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

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" min-width="400px">
      <el-form ref="dataForm" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px; min-width: 400px">
        <el-form-item v-if="dialogStatus === 'create'" label="用户名" prop="title">
          <el-input v-model="temp.username" />
        </el-form-item>
        <el-form-item v-if="dialogStatus === 'create'" label="密码" prop="title">
          <el-input v-model="temp.password" />
        </el-form-item>
        <el-form-item label="昵称" prop="title">
          <el-input v-model="temp.nickname" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="temp.status" class="filter-item" placeholder="请选择状态">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="头像">
          <el-upload class="avatar-uploader" :action="GLOBAL.base_upload_url" :show-file-list="false" :on-success="handleImageUploadSuccess" :before-upload="beforeImageUpload">
            <div v-if="temp.avatar">
              <img :src="temp.avatar" class="avatar">
            </div>
            <i v-else class="el-icon-plus avatar-uploader-icon" />
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          Confirm
        </el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="dialogImageUploadVisible">
      <img width="100%" :src="dialogImageUrl" alt="">
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, createUser, updateUser } from '@/api/user'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'User',
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
        limit: 10
      },
      temp: {
        id: undefined,
        nickname: '',
        avatar: '',
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
      dialogStatus: '',
      dialogImageUploadVisible: false,
      dialogImageUrl: '',
      disabled: false
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
      this.total = total_count
      this.list = items.map(v => {
        this.$set(v, 'edit', false) // https://vuejs.org/v2/guide/reactivity.html
        v.originalNickname = v.nickname //  will be used when user click the cancel botton
        return v
      })
      this.listLoading = false
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        name: '',
        avatar: '',
        status: 1
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handledEdit(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'edit'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleModifyStatus(row, status) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.status = status
      const tempData = this.temp
      updateUser(tempData).then(() => {
        const index = this.list.findIndex(v => v.id === this.temp.id)
        this.list.splice(index, 1, this.temp) // //成功后替换
        this.dialogFormVisible = false
        this.$notify({
          title: 'Success',
          message: 'Update Successfully',
          type: 'success',
          duration: 2000
        })
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createUser(this.temp).then(response => {
            this.list.unshift(response.data)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Created Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateUser(tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp) // //成功后替换
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Update Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleImageUploadSuccess(res, file) {
      console.log(res)
      if (res.data[0]) {
        this.temp.avatar = res.data[0]
      }
    },
    beforeImageUpload(file) {
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      return isLt2M
    }
  }
}
</script>

<style scoped>
.avatar{
  width: 200px;
  height: 200px;
  border-radius: 50%;
}

.list-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
}
</style>
