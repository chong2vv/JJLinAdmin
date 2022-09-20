<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.search_str" placeholder="搜索" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.classify_id" placeholder="分类名" clearable class="filter-item" style="width: 130px" @change="handleFilter">
        <el-option v-for="item in classList" :key="item.id" :label="item.title" :value="item.id" />
      </el-select>
      <el-select v-model="listQuery.status" placeholder="状态" clearable style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-select v-model="listQuery.is_home_list" placeholder="首页展示" clearable style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in isHomeShowOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        Search
      </el-button>
      <router-link :to="'/goods/create'">
        <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit">
          Add
        </el-button>
      </router-link>
      <el-button v-waves :loading="downloadLoading" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-download" @click="handleGoodsExport">
        Export
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-upload" @click="dialogUploadVisible = true">
        UploadExcel
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-download" @click="fileDownload">
        下载Excel模板
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      stripe
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        width="55"
      />
      <el-table-column fixed label="ID" prop="id" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column fixed label="商品名" min-width="100px">
        <template slot-scope="{row}">
          <span class="link-type">{{ row.title }}</span>
        </template>
      </el-table-column>

      <el-table-column width="140" label="封面">
        <template slot-scope="{row}">
          <el-image :src="row.cover_img" :preview-src-list="[row.cover_img]" />
        </template>
      </el-table-column>

      <el-table-column label="简介" min-width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.excerpt }}</span>
        </template>
      </el-table-column>

      <el-table-column label="分类" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.classify.title }}</span>
        </template>
      </el-table-column>

      <el-table-column label="首页显示" width="80px">
        <template slot-scope="{row}">
          <span v-if="row.is_home_list" style="color:green;">是</span>
          <span v-else style="color:red;">否</span>
        </template>
      </el-table-column>

      <el-table-column label="访问量" align="center" width="95">
        <template slot-scope="{row}">
          <span v-if="row.view" class="link-type">{{ row.view }}</span>
          <span v-else>0</span>
        </template>
      </el-table-column>

      <el-table-column label="状态" class-name="status-col" width="100">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status | statusLabel }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column fixed="right" label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <router-link :to="'/goods/edit/'+row.id">
            <el-button type="primary" size="small" icon="el-icon-edit">
              编辑
            </el-button>
          </router-link>
          <el-button v-if="row.status !== 1" size="mini" type="success" style="margin-left: 10px;" @click="handleModifyStatus(row,1)">
            上架
          </el-button>
          <el-button v-if="row.status !== 0" size="mini" style="margin-left: 10px;" @click="handleModifyStatus(row,0)">
            下架
          </el-button>
          <el-button size="mini" type="primary" @click="handleExport(row)">
            预览
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-loading="upLoading" :visible.sync="dialogUploadVisible" :before-close="handleUploadClose">
      <el-upload
        ref="upload"
        class="upload-demo"
        accept=".xlsx,.xls,.cvs,.CVS.XLSX,.XLS"
        :multiple="false"
        :limit="1"
        :action="GLOBAL.base_excel_upload_url"
        :auto-upload="false"
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError"
        :on-change="handleUploadChange"
        :file-list="uploadList"
      >
        <el-button slot="trigger" size="small" type="primary">
          选取导入的Excel文件
        </el-button>
      </el-upload>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogUploadVisible = false">
          取 消
        </el-button>
        <el-button type="primary" @click="startUpload">
          上传
        </el-button>
      </span>
    </el-dialog>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.count" @pagination="getList" />
  </div>
</template>

<script>
import { downLoadGoodsExcel, fetchList } from '@/api/goods'
import { fetchList as fetchClassList } from '@/api/classify'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        '1': 'success',
        '0': 'info',
        '-1': 'danger'
      }
      return statusMap[status]
    },
    statusLabel(status) {
      const statusMap = {
        '1': '上架中',
        '0': '已下架',
        '-1': '已删除'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      dialogUploadVisible: false,
      isUploadError: false,
      uploadList: [],
      tableKey: 0,
      list: null,
      selectList: null,
      classList: null,
      total: 0,
      listLoading: true,
      upLoading: false,
      listQuery: {
        page: 1,
        count: 20,
        search_str: undefined,
        classify_id: undefined,
        status: null,
        is_home_list: null
      },
      isHomeShowOptions: [{ label: '是', value: 1 }, { label: '否', value: 0 }],
      statusOptions: [{ label: '已下架', value: 0 }, { label: '上架中', value: 1 }],
      showReviewer: false,
      temp: {
        id: undefined,
        status: undefined,
        title: '', // 商品名
        content: '', // 商品描述
        excerpt: 'test', // 短描述
        size: 'test', // 尺寸
        material: '', // 材料
        pack: '', // 打包方式
        qty: '', // 装箱量
        timer: '', // 准备时长
        cover_img: '', // 封面图
        img_list: [], // 图片数组
        tags: [], // 标签数组
        classify: {
          id: undefined,
          title: '',
          image_url: ''
        }, // 分类
        is_home_list: 0, // 是否首页展示
        view: 0
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
    this.getClassList()
  },
  methods: {
    resetTemp() {
      this.temp = {
        id: undefined,
        status: undefined,
        title: '', // 商品名
        content: '', // 商品描述
        excerpt: '', // 短描述
        size: '', // 尺寸
        material: '', // 材料
        pack: '', // 打包方式
        qty: '', // 装箱量
        timer: '', // 准备时长
        cover_img: '', // 封面图
        img_list: [], // 图片数组
        tags: [], // 标签数组
        classify: {
          id: undefined,
          title: '',
          image_url: ''
        }, // 分类
        is_home_list: 0 // 是否首页展示
      }
    },
    getClassList() {
      fetchClassList().then(response => {
        this.classList = response.data
      })
    },
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data
        this.total = response.total_count
        this.listLoading = false
      })
    },
    handleSelectionChange(val) {
      this.selectList = val
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作Success',
        type: 'success'
      })
      row.status = status
    },
    handleExport(row) {
      const openUrl = process.env.VUE_APP_WEB_URL + 'product-detail/' + row.id
      window.open(openUrl, '_blank')
    },
    handleGoodsExport() {
      const data = {
        goods: this.selectList
      }
      downLoadGoodsExcel(data).then(response => {
        console.log(response)
        // 创建a标签
        const link = document.createElement('a')
        // 设置a标签的href（点击地址）
        link.href = response.data
        console.log(response)
        // 设置a标签属性
        link.setAttribute('download', '商品模板.xlsx')
        // 点击a标签
        document.body.appendChild(link)
        link.click()
        // 移除a标签
        document.body.removeChild(link)
      })
    },
    handleDownload() {
      if (this.selectList === null) {
        this.$message({
          message: '请选择要导出的列',
          type: 'warning'
        })
        return
      }
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['id', 'create_at', 'title', 'content', 'excerpt', 'size', 'material', 'pack', 'qty', 'timer', 'cover_img', 'img_list', 'tags', 'categories', 'is_home_list']
        const filterVal = ['id', 'create_at', 'title', 'content', 'excerpt', 'size', 'material', 'pack', 'qty', 'timer', 'cover_img', 'img_list', 'tags', 'categories', 'is_home_list']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    startUpload() {
      if (this.uploadList.length === 0) {
        this.$message.error('请选择Excel文件')
        return
      }
      this.isUploadError = false
      this.upLoading = true
      this.$refs.upload.submit()
    },
    handleUploadSuccess(response, file, fileList) {
      this.isUploadError = false
      this.upLoading = false
      this.dialogUploadVisible = false
      this.$refs.upload.clearFiles()
      this.$notify({
        title: 'Success',
        message: '上传成功',
        type: 'success',
        duration: 2000
      })
    },
    handleUploadError() {
      this.isUploadError = false
      this.upLoading = false
      this.$notify({
        title: 'Error',
        message: '上传失败',
        type: 'error',
        duration: 2000
      })
    },
    handleUploadChange(file, fileList) {
      this.uploadList = fileList
    },
    handleUploadClose(done) {
      if (!this.isUploadError) {
        done()
      }
    },
    formatJson(filterVal) {
      return this.selectList.map(v => filterVal.map(j => {
        if (j === 'create_at') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    fileDownload() {
      // 创建a标签
      const link = document.createElement('a')
      // 设置a标签的href（点击地址）
      link.href = process.env.VUE_APP_BASE_API + '/vue-admin-template/goods/downloadExcelFile'
      // 设置a标签属性
      link.setAttribute('download', '商品模板.xlsx')
      // 点击a标签
      document.body.appendChild(link)
      link.click()
      // 移除a标签
      document.body.removeChild(link)
    }
  }
}
</script>
