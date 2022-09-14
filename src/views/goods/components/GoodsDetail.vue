<template>
  <div class="createPost-container">
    <el-form ref="postForm" :model="postForm" class="form-container">

      <sticky :z-index="10" :class-name="'sub-navbar '+postForm.status">
        <el-button v-loading="loading" style="margin-left: 20px;margin-top: 12px" type="success" @click="submitForm">
          发布
        </el-button>
        <el-button v-loading="loading" type="warning" @click="draftForm">
          草稿
        </el-button>
      </sticky>

      <div class="createPost-main-container">
        <el-row>
          <el-col :span="24">
            <el-form-item label="商品名称:">
              <el-input v-model="postForm.title" />
            </el-form-item>

            <el-form-item label="尺寸:">
              <el-input v-model="postForm.size" />
            </el-form-item>

            <el-form-item label="材料:">
              <el-input v-model="postForm.material" />
            </el-form-item>

            <el-form-item label="打包方式:">
              <el-input v-model="postForm.pack" />
            </el-form-item>

            <el-form-item label="装箱量:">
              <el-input v-model="postForm.qty" />
            </el-form-item>

            <el-form-item label="准备时间:">
              <el-input v-model="postForm.timer" />
            </el-form-item>

            <div class="postInfo-container">
              <el-row>
                <el-col :span="12">
                  <el-form-item label-width="60px" label="分类:" class="postInfo-container-item">
                    <el-select v-model="postForm.classify" clearable class="filter-item" placeholder="选择分类">
                      <el-option v-for="item in classListOptions" :key="item.id" :label="item.title" :value="item.id" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label-width="200px" label="是否首页展示:" class="postInfo-container-item">
                    <el-switch
                      v-model="postForm.is_home_list"
                      active-color="#13ce66"
                      inactive-color="#ff4949"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </el-col>
        </el-row>

        <el-form-item label="简介:">
          <el-input v-model="postForm.excerpt" type="textarea" :autosize="{ minRows: 3, maxRows: 6}" placeholder="编辑内容" />
          <span v-show="contentShortLength" class="word-counter">{{ contentShortLength }}words</span>
        </el-form-item>

        <el-form-item prop="content" label="商品描述:" style="margin-bottom: 30px;">
          <el-input v-model="postForm.content" type="textarea" :autosize="{ minRows: 8, maxRows: 12}" placeholder="编辑内容" />
        </el-form-item>

        <el-form-item prop="image_uri" label="封面图" style="margin-bottom: 30px;">
          <Upload v-model="postForm.cover_img" />
        </el-form-item>

        <el-form-item prop="img_list" label="图片/视频" style="margin-bottom: 30px;">
          <el-upload
            class="upload-demo"
            :action="GLOBAL.base_upload_url"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :on-change="handleChange"
            multiple
            :limit="6"
            :on-exceed="handleExceed"
            :file-list="fileList"
          >
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<script>
import Upload from '@/components/Upload/SingleImage3'
import Sticky from '@/components/Sticky' // 粘性header组件
import { fetchGoods, createGoods, updateGoods } from '@/api/goods'
import { fetchList } from '@/api/classify'

const defaultForm = {
  id: undefined,
  status: 1,
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
  classify_id: undefined,
  classify: {
    id: undefined,
    title: '',
    image_url: ''
  }, // 分类
  is_home_list: true // 是否首页展示
}

export default {
  name: 'GoodsDetail',
  components: { Upload, Sticky },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      postForm: Object.assign({}, defaultForm),
      loading: false,
      classListOptions: [],
      tempRoute: {},
      fileList: [],
      value1: []
    }
  },
  computed: {
    contentShortLength() {
      return this.postForm.excerpt.length
    }
  },
  created() {
    if (this.isEdit) {
      const id = this.$route.params && this.$route.params.id
      this.fetchData(id)
    }
    this.getRemoteClassList()
    // Why need to make a copy of this.$route here?
    // Because if you enter this page and quickly switch tag, may be in the execution of the setTagsViewTitle function, this.$route is no longer pointing to the current page
    // https://github.com/PanJiaChen/vue-element-admin/issues/1221
    this.tempRoute = Object.assign({}, this.$route)
  },
  methods: {
    fetchData(id) {
      fetchGoods(id).then(response => {
        this.postForm = response.data

        // set tagsview title
        this.setTagsViewTitle()

        // set page title
        this.setPageTitle()
      }).catch(err => {
        console.log(err)
      })
    },
    setTagsViewTitle() {
      const title = '编辑商品'
      const route = Object.assign({}, this.tempRoute, { title: `${title}-${this.postForm.id}` })
      this.$store.dispatch('tagsView/updateVisitedView', route)
    },
    setPageTitle() {
      const title = '编辑商品'
      document.title = `${title} - ${this.postForm.id}`
    },
    // 提交信息，直接上架
    submitForm() {
      console.log(this.fileList)
      if (this.fileList.length > 0) {
        this.postForm.img_list = this.fileList.map((item) => {
          return item.response.data[0]
        })
      }
      console.log(this.postForm)
      this.$refs.postForm.validate(valid => {
        if (valid) {
          this.postForm.status = 1
          this.postForm.classify_id = this.postForm.classify.id
          const data = this.postForm
          if (this.isEdit) {
            this.handleUpdateGoods(data)
          } else {
            this.handleCreateGoods(data)
          }
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    // 草稿，为下架商品
    draftForm() {
      if (this.postForm.excerpt.length === 0 || this.postForm.title.length === 0) {
        this.$message({
          message: '请填写必要的标题和简介',
          type: 'warning'
        })
        return
      }
      if (this.fileList.length > 0) {
        this.postForm.img_list = this.fileList.map((item) => {
          return item.response.data[0]
        })
      }
      this.postForm.classify_id = this.postForm.classify.id
      this.postForm.status = 0
      const data = this.postForm
      if (this.isEdit) {
        this.handleUpdateGoods(data)
      } else {
        this.handleCreateGoods(data)
      }
    },
    handleCreateGoods(data) {
      this.loading = true
      createGoods(data).then(response => {
        this.loading = false
        this.$notify({
          title: '成功',
          message: '发布商品成功',
          type: 'success',
          duration: 2000
        })
        setTimeout(() => {
        }, 5 * 1000)
      })
    },
    handleUpdateGoods(data) {
      this.loading = true
      updateGoods(data).then(response => {
        this.loading = false
        this.$notify({
          title: '成功',
          message: '更新商品成功',
          type: 'success',
          duration: 2000
        })
        setTimeout(() => {
        }, 5 * 1000)
      })
    },
    // 获取分类列表
    getRemoteClassList() {
      fetchList().then(response => {
        if (!response.data) return
        this.classListOptions = response.data
      })
    },
    // 文件上传列表删除
    handleRemove(file, fileList) {
      console.log(file, fileList)
    },
    // 文件上传列表预览
    handlePreview(file) {
      console.log(file)
    },
    // 文件上传数量超出
    handleExceed(files, fileList) {
      this.$message.warning(`当前限制选择 8 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`)
    },
    // 文件上传列表变更
    handleChange(file, fileList) {
      this.fileList = fileList
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/styles/mixin.scss";

.createPost-container {
  position: relative;

  .createPost-main-container {
    padding: 40px 45px 20px 50px;

    .postInfo-container {
      position: relative;
      @include clearfix;
      margin-bottom: 10px;

      .postInfo-container-item {
        float: left;
      }
    }
  }

  .word-counter {
    width: 40px;
    position: absolute;
    right: 10px;
    top: 0px;
  }
}

.article-textarea ::v-deep {
  textarea {
    padding-right: 40px;
    resize: none;
    border: none;
    border-radius: 0px;
    border-bottom: 1px solid #bfcbd9;
  }
}
</style>
