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
      <el-button v-waves :loading="downloadLoading" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-download" @click="handleDownload">
        Export
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="ID" prop="id" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品名" min-width="100px">
        <template slot-scope="{row}">
          <span class="link-type">{{ row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column label="简介" min-width="250px" align="center">
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
      <el-table-column label="Actions" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <router-link :to="'/goods/edit/'+row.id">
            <el-button type="primary" size="small" icon="el-icon-edit">
              编辑
            </el-button>
          </router-link>
          <el-button v-if="row.status !== 1" size="mini" type="success" @click="handleModifyStatus(row,1)">
            上架
          </el-button>
          <el-button v-if="row.status !== 0" size="mini" @click="handleModifyStatus(row,0)">
            下架
          </el-button>
          <el-button v-if="row.status !== -1" size="mini" type="danger" @click="handleDelete(row,$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.count" @pagination="getList" />
  </div>
</template>

<script>
import { fetchList } from '@/api/goods'
import { fetchList as fetchClassList } from '@/api/classify'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

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
      tableKey: 0,
      list: null,
      classList: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        count: 20,
        search_str: undefined,
        classify_id: undefined,
        status: null,
        is_home_list: null
      },
      isHomeShowOptions: [{ label: '是', value: true }, { label: '否', value: false }],
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
        is_home_list: true, // 是否首页展示
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
    getClassList() {
      fetchClassList().then(response => {
        this.classList = response.data
        setTimeout(() => {
        }, 5 * 1000)
      })
    },
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data
        this.total = response.total_count

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
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
        is_home_list: true // 是否首页展示
      }
    },
    handleDelete(row, index) {
      this.$notify({
        title: 'Success',
        message: 'Delete Successfully',
        type: 'success',
        duration: 2000
      })
      this.list.splice(index, 1)
    },
    handleDownload() {
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
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'create_at') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    }
  }
}
</script>
