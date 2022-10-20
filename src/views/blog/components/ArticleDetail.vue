<template>
  <div class="createPost-container">
    <el-form ref="postForm" :model="postForm" :rules="rules" class="form-container">

      <sticky :z-index="10" :class-name="'sub-navbar '+postForm.status" style="margin-top: 20px">
        <SourceUrlDropdown v-model="postForm.source_uri" style="margin-left: 10px" />
        <el-button v-loading="loading" style="margin-left: 10px;" type="success" @click="submitForm">
          Publish
        </el-button>
        <el-button v-loading="loading" type="warning" @click="draftForm">
          Draft
        </el-button>
      </sticky>

      <div class="createPost-main-container">
        <el-row>
          <el-col :span="24">
            <el-form-item style="margin-bottom: 40px;" prop="title">
              <MDinput v-model="postForm.title" :maxlength="100" name="name" required>
                标题
              </MDinput>
            </el-form-item>

            <div class="postInfo-container">
              <el-row>
                <el-col :span="8">
                  <el-form-item label-width="60px" label="作者:" class="postInfo-container-item">
                    <el-input v-model="postForm.author" />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </el-col>
        </el-row>

        <el-form-item style="margin-bottom: 40px;" label-width="60px" label="简介:">
          <el-input v-model="postForm.excerpt" :rows="1" type="textarea" class="article-textarea" autosize placeholder="请填写简介" />
          <span v-show="contentShortLength" class="word-counter">{{ contentShortLength }}words</span>
        </el-form-item>

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

        <el-form-item prop="content" style="margin-bottom: 30px;">
          <Tinymce ref="editor" v-model="postForm.content" :height="400" />
        </el-form-item>

        <el-form-item prop="img" label="封面图" style="margin-bottom: 30px;">
          <el-button size="small" type="primary" @click="dialogCoverVisible = true; dialogStatus = 1">链接添加</el-button>
          <Upload v-model="postForm.img" />
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
import Tinymce from '@/components/Tinymce'
import MDinput from '@/components/MDinput'
import Sticky from '@/components/Sticky' // 粘性header组件
import { validURL } from '@/utils/validate'
import { fetchArticle, createArticle, updateArticle } from '@/api/article'
import { SourceUrlDropdown } from './Dropdown'
import Upload from '@/components/Upload/SingleImage3'
import { fetchList } from '@/api/classify'

const defaultForm = {
  status: 'draft',
  title: '', // 文章题目
  content: '', // 文章内容
  excerpt: '', // 文章摘要
  source_uri: '', // 文章外链
  img: '', // 文章图片
  create_at: '', // 前台展示时间
  timestamp: undefined,
  id: undefined,
  img_list: [], // 图片数组
  video_list: [], // ytb链接数组
  tags: [], // 标签数组
  classify_id: undefined,
  classify: {
    id: undefined,
    title: '',
    image_url: ''
  }, // 分类
  author: '',
  view: ''
}

export default {
  name: 'ArticleDetail',
  components: { Tinymce, MDinput, Sticky, SourceUrlDropdown, Upload },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const validateRequire = (rule, value, callback) => {
      if (value === '') {
        this.$message({
          message: rule.field + '为必传项',
          type: 'error'
        })
        callback(new Error(rule.field + '为必传项'))
      } else {
        callback()
      }
    }
    const validateSourceUri = (rule, value, callback) => {
      if (value) {
        if (validURL(value)) {
          callback()
        } else {
          this.$message({
            message: '图片url填写不正确',
            type: 'error'
          })
          callback(new Error('图片url填写不正确'))
        }
      } else {
        callback()
      }
    }
    return {
      postForm: Object.assign({}, defaultForm),
      loading: false,
      userListOptions: [],
      rules: {
        excerpt: [{ validator: validateRequire }],
        title: [{ validator: validateRequire }],
        content: [{ validator: validateRequire }],
        img: [{ validator: validateSourceUri, trigger: 'blur' }]
      },
      tempRoute: {},
      classListOptions: [],
      fileList: [],
      dialogCoverVisible: false,
      inputUrl: '',
      dialogStatus: undefined,
      inputVisible: false, // 是否可编辑标签
      inputValue: '' // 新输入标签值
    }
  },
  computed: {
    contentShortLength() {
      if (this.postForm.excerpt) {
        this.postForm.excerpt.length
      }
      return 0
    },
    displayTime: {
      get() {
        console.log(new Date(this.postForm.timestamp))
        return (+new Date(this.postForm.timestamp))
      },
      set(val) {
        this.postForm.timestamp = new Date(val).getTime()
      }
    }
  },
  created() {
    if (this.isEdit) {
      const id = this.$route.params && this.$route.params.id
      this.fetchData(id)
    }
    // Why need to make a copy of this.$route here?
    // Because if you enter this page and quickly switch tag, may be in the execution of the setTagsViewTitle function, this.$route is no longer pointing to the current page
    // https://github.com/PanJiaChen/vue-element-admin/issues/1221
    this.tempRoute = Object.assign({}, this.$route)
  },
  methods: {
    fetchData(id) {
      fetchArticle(id).then(response => {
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
      const title = 'Edit Blog'
      const route = Object.assign({}, this.tempRoute, { title: `${title}-${this.postForm.id}` })
      this.$store.dispatch('tagsView/updateVisitedView', route)
    },
    setPageTitle() {
      const title = 'Edit Article'
      document.title = `${title} - ${this.postForm.id}`
    },
    submitForm() {
      this.$refs.postForm.validate(valid => {
        if (valid) {
          this.postForm.status = 1
          if (this.fileList.length > 0) {
            this.postForm.img_list = this.fileList.map((item) => {
              return item.url
            })
          }
          this.postForm.classify_id = this.postForm.classify.id
          const data = this.postForm
          if (this.isEdit) {
            this.handleUpdateArticle(data)
          } else {
            this.handleCreateArticle(data)
          }
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    draftForm() {
      if (this.postForm.content.length === 0 || this.postForm.title.length === 0) {
        this.$message({
          message: '请填写必要的标题和内容',
          type: 'warning'
        })
        return
      }
      this.postForm.status = 0
      const data = this.postForm
      if (this.isEdit) {
        this.handleUpdateArticle(data)
      } else {
        this.handleCreateArticle(data)
      }
    },
    handleCreateArticle(data) {
      this.loading = true
      createArticle(data).then(response => {
        this.loading = false
        this.postForm = response.data
        this.$notify({
          title: '成功',
          message: '发布商品成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    handleUpdateArticle(data) {
      this.loading = true
      updateArticle(data).then(response => {
        this.loading = false
        this.$notify({
          title: '成功',
          message: '更新商品成功',
          type: 'success',
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
      this.postForm.img = this.inputUrl
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
