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
            <el-form-item label="标题:">
              <el-input v-model="postForm.title" />
            </el-form-item>

            <div class="postInfo-container">
              <el-row>
                <el-col :span="12">
                  <el-form-item label-width="60px" label="分类:" class="postInfo-container-item">
                    <el-select v-model="postForm.classify" value-key="id" clearable class="filter-item" placeholder="选择分类">
                      <el-option v-for="item in classListOptions" :key="item.id" :label="item.title" :value="item" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label-width="120px" label="首页展示:" class="postInfo-container-item">
                    <el-switch
                      v-model="postForm.is_home_list"
                      active-color="#13ce66"
                      inactive-color="#ff4949"
                      active-value="1"
                      inactive-value="0"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </el-col>
        </el-row>

        <el-form-item label="标签">
          <el-tag
            v-for="tag in postForm.tags"
            :key="tag"
            closable
            :disable-transitions="false"
            @close="handleTagClose(tag)"
          >
            {{ tag }}
          </el-tag>
          <el-input
            v-if="inputVisible"
            ref="saveTagInput"
            v-model="inputValue"
            class="input-new-tag"
            size="small"
            @keyup.enter.native="handleTagInputConfirm"
            @blur="handleTagInputConfirm"
          />
          <el-button v-else class="button-new-tag" size="small" @click="showTagInput">+ 新标签</el-button>
        </el-form-item>

        <el-form-item label="子标题:">
          <el-input v-model="postForm.excerpt" type="textarea" :autosize="{ minRows: 3, maxRows: 6}" placeholder="编辑内容" />
          <span v-show="contentShortLength" class="word-counter">{{ contentShortLength }}words</span>
        </el-form-item>

        <el-form-item prop="content" label="项目描述:" style="margin-bottom: 30px;">
          <el-input v-model="postForm.content" type="textarea" :autosize="{ minRows: 8, maxRows: 12}" placeholder="编辑内容" />
        </el-form-item>

        <el-form-item prop="content" label="项目外链:" style="margin-bottom: 30px;">
          <el-input v-model="postForm.project_url" type="textarea" :autosize="{ minRows: 1, maxRows: 2}" placeholder="编辑内容" />
        </el-form-item>

        <el-form-item prop="image_uri" label="项目封面图" style="margin-bottom: 30px;">
          <el-button size="small" type="primary" @click="dialogCoverVisible = true; dialogStatus = 1">链接添加</el-button>
          <Upload v-model="postForm.cover_img" />
        </el-form-item>

        <el-form-item prop="content" style="margin-bottom: 30px;">
          <Tinymce ref="editor" v-model="postForm.project_body" :height="400" />
        </el-form-item>

        <el-form-item
          v-for="(video, index) in postForm.video_list"
          :key="index"
          :label="'链接' + `${index + 1}`"
          :rules="{required: true, message: '链接不能为空', trigger: 'blur'}"
        >
          <el-input v-model="postForm.video_list[index]" />
          <el-button @click.prevent="removeVideo(video)">
            删除
          </el-button>
        </el-form-item>

        <el-form-item>
          <el-button @click="addVideo">新增视频外链</el-button>
        </el-form-item>

        <el-form-item prop="img_list" label="图片/视频" style="margin-bottom: 30px;">
          <el-button size="small" type="primary" @click="dialogCoverVisible = true; dialogStatus = 3">通过链接添加</el-button>
          <el-upload
            class="upload-demo"
            :action="GLOBAL.base_upload_url"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :on-success="handleImageSuccess"
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

    <el-image-viewer
      v-if="imageShow"
      :on-close="()=>{imageShow = false}"
      :url-list="[imageShowUrl]"
    />

    <el-dialog title="输入图片链接添加" :visible.sync="dialogCoverVisible">
      <el-input v-model="inputUrl" />
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogCoverVisible = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="changeCoverImage">
          Confirm
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Upload from '@/components/Upload/SingleImage3'
import Sticky from '@/components/Sticky' // 粘性header组件
import Tinymce from '@/components/Tinymce'
import { createProject, fetchProject, updateProject } from '@/api/project'
import { fetchList } from '@/api/classify'

const defaultForm = {
  id: undefined,
  status: 1,
  title: '', // 项目名
  content: '', // 描述描述
  excerpt: '', // 短描述
  project_body: '',
  video_url: '',
  video_img: '',
  cover_img: '', // 封面图
  img_list: [], // 图片数组
  video_list: [], // ytb链接数组
  project_url: '', // 项目外链
  tags: [], // 标签数组
  classify_id: undefined,
  classify: {
    id: undefined,
    title: '',
    image_url: ''
  }, // 分类
  is_home_list: 0 // 是否首页展示
}

export default {
  name: 'ProjectDetail',
  components: { Upload, Sticky, Tinymce, 'el-image-viewer': () => import('element-ui/packages/image/src/image-viewer') },
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
      value1: [],
      imageShow: false,
      imageShowUrl: '',
      inputVisible: false, // 是否可编辑标签
      inputValue: '', // 新输入标签值
      dialogCoverVisible: false,
      dialogStatus: undefined,
      inputUrl: ''
    }
  },
  computed: {
    contentShortLength() {
      if (this.postForm.excerpt === null) {
        return 0
      }
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
      fetchProject(id).then(response => {
        this.postForm = response.data
        this.fileList = this.postForm.img_list.map((url) => {
          const data = {
            name: url,
            url: url
          }
          return data
        })
        console.log(this.fileList)
        // set tagsview title
        this.setTagsViewTitle()

        // set page title
        this.setPageTitle()
      }).catch(err => {
        console.log(err)
      })
    },
    setTagsViewTitle() {
      const title = '编辑项目'
      const route = Object.assign({}, this.tempRoute, { title: `${title}-${this.postForm.id}` })
      this.$store.dispatch('tagsView/updateVisitedView', route)
    },
    setPageTitle() {
      const title = '编辑项目'
      document.title = `${title} - ${this.postForm.id}`
    },
    // 提交信息，直接上架
    submitForm() {
      if (this.fileList.length > 0) {
        this.postForm.img_list = this.fileList.map((item) => {
          return item.url
        })
      }
      console.log(this.postForm.classify)
      this.$refs.postForm.validate(valid => {
        if (valid) {
          this.postForm.status = 1
          this.postForm.classify_id = this.postForm.classify.id
          const data = this.postForm
          if (this.isEdit) {
            this.handleUpdateProject(data)
          } else {
            this.handleCreateProject(data)
          }
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    // 草稿，为下架项目
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
          return item.url
        })
      }
      this.postForm.classify_id = this.postForm.classify.id
      this.postForm.status = 0
      const data = this.postForm
      if (this.isEdit) {
        this.handleUpdateProject(data)
      } else {
        this.handleCreateProject(data)
      }
    },
    handleCreateProject(data) {
      this.loading = true
      console.log(data)
      createProject(data).then(response => {
        this.loading = false
        this.$router.go(-1)
        this.$notify({
          title: '成功',
          message: '发布项目成功',
          type: 'success',
          duration: 2000
        })
      }).catch(error => {
        this.loading = false
        this.$notify({
          title: '失败',
          message: error.toString(),
          type: 'error',
          duration: 2000
        })
      })
    },
    handleUpdateProject(data) {
      this.loading = true
      updateProject(data).then(response => {
        this.loading = false
        this.$router.go(-1)
        this.$notify({
          title: '成功',
          message: '更新项目成功',
          type: 'success',
          duration: 2000
        })
      }).catch(error => {
        this.loading = false
        this.$notify({
          title: '失败',
          message: error.toString(),
          type: 'error',
          duration: 2000
        })
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
      this.fileList.some((item, i) => {
        if (item.name === file.name) {
          this.fileList.splice(i, 1)
          return true
        }
      })
    },
    handleImageSuccess(res, file) {
      if (res.data[0]) {
        const data = {
          name: res.data[0],
          url: res.data[0]
        }
        this.fileList.push(data)
      }
    },
    // 文件上传列表预览
    handlePreview(file) {
      this.imageShow = true
      this.imageShowUrl = file.url
    },
    // 文件上传数量超出
    handleExceed(files, fileList) {
      this.$message.warning(`当前限制选择 6 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`)
    },
    // 取消标签输入
    handleTagClose(tag) {
      this.postForm.tags.splice(this.postForm.tags.indexOf(tag), 1)
    },
    // 显示标签编辑框
    showTagInput() {
      this.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 添加最新输入的标签
    handleTagInputConfirm() {
      const inputValue = this.inputValue
      if (inputValue) {
        this.postForm.tags.push(inputValue)
      }
      this.inputVisible = false
      this.inputValue = ''
    },
    removeVideo(video) {
      const index = this.postForm.video_list.indexOf(video)
      if (index !== -1) {
        this.postForm.video_list.splice(index, 1)
      }
    },
    // 添加视频
    addVideo() {
      this.postForm.video_list.push('')
    },
    // 链接添加
    changeCoverImage() {
      if (this.dialogStatus === 1) {
        this.postForm.cover_img = this.inputUrl
      } else if (this.dialogStatus === 2) {
        this.postForm.video_img = this.inputUrl
      } else if (this.dialogStatus === 3) {
        this.fileList.push({
          name: this.inputUrl,
          url: this.inputUrl
        })
      }
      this.inputUrl = ''
      this.dialogCoverVisible = false
      this.dialogStatus = undefined
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
