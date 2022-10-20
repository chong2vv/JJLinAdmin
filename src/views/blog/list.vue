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
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        Search
      </el-button>
    </div>

    <el-table v-loading="listLoading" :data="list" fixed border fit highlight-current-row style="width: 100%">
      <el-table-column align="center" fixed label="ID" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="120px" fixed label="标题">
        <template slot-scope="scope">
          <router-link :to="'/blog/edit/'+scope.row.id" class="link-type">
            <span>{{ scope.row.title }}</span>
          </router-link>
        </template>
      </el-table-column>

      <el-table-column min-width="120px" align="center" label="简介">
        <template slot-scope="scope">
          <span>{{ scope.row.excerpt }}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="110px" align="center" label="分类">
        <template slot-scope="scope">
          <span v-if="scope.row.classify">{{ scope.row.classify.title }}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="140" label="封面" align="center">
        <template slot-scope="scope">
          <el-image :src="scope.row.img" :preview-src-list="[scope.row.img]" />
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" label="时间">
        <template slot-scope="scope">
          <span>{{ scope.row.create_at | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>

      <el-table-column width="120px" align="center" label="作者">
        <template slot-scope="scope">
          <span>{{ scope.row.author }}</span>
        </template>
      </el-table-column>

      <el-table-column label="状态" class-name="status-col" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusFilter">
            {{ scope.row.status | statusLabel }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column fixed="right" label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <router-link :to="'/blog/edit/'+scope.row.id">
            <el-button type="primary" size="small" icon="el-icon-edit">
              编辑
            </el-button>
          </router-link>

          <el-button v-if="scope.row.status !== 1" size="mini" type="success" style="margin-left: 10px;" @click="handleModifyStatus(row,1)">
            上架
          </el-button>

          <el-button v-if="scope.row.status !== 0" size="mini" style="margin-left: 10px;" @click="handleModifyStatus(row,0)">
            下架
          </el-button>

        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.count" @pagination="getList" />
  </div>
</template>

<script>
import { fetchList } from '@/api/article'
import { fetchList as fetchClassList } from '@/api/classify'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import waves from '@/directive/waves'

export default {
  name: 'ArticleList',
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
      list: null,
      total: 0,
      listLoading: true,
      classList: null,
      statusOptions: [{ label: '已下架', value: 0 }, { label: '上架中', value: 1 }],
      listQuery: {
        page: 1,
        search_str: undefined,
        classify_id: undefined,
        status: null,
        count: 20
      }
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
      })
    },
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data
        console.log(this.list)
        this.total = response.total_count
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleExport(row) {
      const openUrl = process.env.VUE_APP_WEB_URL + 'blog-detail/' + row.id
      window.open(openUrl, '_blank')
    },
    handleModifyStatus(row, status) {

    }
  }
}
</script>

<style scoped>
.edit-input {
  padding-right: 100px;
}
.cancel-btn {
  position: absolute;
  right: 15px;
  top: 10px;
}
</style>
