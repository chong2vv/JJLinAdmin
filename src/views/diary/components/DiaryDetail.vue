<template>
  <div class="createPost-container">
    <el-form ref="postForm" :model="postForm" :rules="rules" class="form-container">

      <sticky :z-index="10" :class-name="'sub-navbar '+postForm.status" style="margin-top: 20px">
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

        <div class="postInfo-container">
          <el-row>
            <el-col :span="12">
              <el-form-item label-width="60px" label="分类:" class="postInfo-container-item">
                <el-select v-model="postForm.classify" value-key="id" clearable class="filter-item" placeholder="选择分类">
                  <el-option v-for="item in classListOptions" :key="item.id" :label="item.title" :value="item" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <el-form-item style="margin-bottom: 40px;" label-width="60px" label="简介:">
          <el-input v-model="postForm.excerpt" :rows="1" type="textarea" class="diary-textarea" autosize placeholder="请填写简介" />
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

        <el-form-item prop="img_list" label="图片/视频" style="margin-bottom: 30px;">
          <el-button size="small" type="primary" @click="dialogCoverVisible = true; dialogStatus = 3">通过链接添加</el-button>
          <el-upload
            ref="upload"
            class="upload-demo"
            :action="''"
            :http-request="uploadFile"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :on-change="handleChange"
            :on-success="handleImageSuccess"
            :limit="50"
            :multiple="true"
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
import MDinput from '@/components/MDinput'
import Sticky from '@/components/Sticky' // 粘性header组件
import { fetchDiary, createDiary, updateDiary } from '@/api/diary'
import { fetchList } from '@/api/classify'
import ajax from 'element-ui/packages/upload/src/ajax'
import Global from '@/Global'

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
  name: 'DiaryDetail',
  components: { MDinput, Sticky, 'el-image-viewer': () => import('element-ui/packages/image/src/image-viewer') },
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
    return {
      postForm: Object.assign({}, defaultForm),
      loading: false,
      userListOptions: [],
      rules: {
        excerpt: [{ validator: validateRequire }],
        title: [{ validator: validateRequire }]
      },
      tempRoute: {},
      classListOptions: [],
      imageShow: false,
      imageShowUrl: '',
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
    this.getRemoteClassList()
    // Why need to make a copy of this.$route here?
    // Because if you enter this page and quickly switch tag, may be in the execution of the setTagsViewTitle function, this.$route is no longer pointing to the current page
    // https://github.com/PanJiaChen/vue-element-admin/issues/1221
    this.tempRoute = Object.assign({}, this.$route)
  },
  methods: {
    fetchData(id) {
      fetchDiary(id).then(response => {
        this.postForm = response.data
        this.fileList = this.postForm.img_list.map((url) => {
          const data = {
            name: url,
            url: url
          }
          return data
        })
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
      const title = 'Edit Diary'
      document.title = `${title} - ${this.postForm.id}`
    },
    submitForm() {
      this.$refs.postForm.validate(valid => {
        if (valid) {
          this.postForm.status = 1
          if (this.fileList.length >= 0) {
            this.postForm.img_list = this.fileList.map((item) => {
              return item.url
            })
          }
          this.postForm.classify_id = this.postForm.classify.id
          const data = this.postForm
          console.log(data.img)
          if (this.isEdit) {
            this.handleUpdateDiary(data)
          } else {
            this.handleCreateDiary(data)
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
      if (this.fileList.length >= 0) {
        this.postForm.img_list = this.fileList.map((item) => {
          return item.url
        })
      }
      this.postForm.classify_id = this.postForm.classify.id
      const data = this.postForm
      console.log(data.img)
      if (this.isEdit) {
        this.handleUpdateDiary(data)
      } else {
        this.handleCreateDiary(data)
      }
    },
    handleCreateDiary(data) {
      this.loading = true
      createDiary(data).then(response => {
        this.loading = false
        this.postForm = response.data
        this.$notify({
          title: '成功',
          message: '发布日志成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    handleUpdateDiary(data) {
      this.loading = true
      updateDiary(data).then(response => {
        this.loading = false
        this.$notify({
          title: '成功',
          message: '更新日志成功',
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
      console.log('难道是你？？？？？？')
      this.fileList.some((item, i) => {
        if (item.name === file.name) {
          this.fileList.splice(i, 1)
          return true
        }
      })
    },
    // 覆盖默认的上传行为
    uploadFile(options) {
      const { file } = options
      if (file.type.indexOf('image/') > -1) {
        options.action = Global.base_upload_url
      } else {
        options.action = Global.base_upload_url
      }
      // this.isUploading = true;
      return ajax(options)
    },
    handleChange(fileList) {

    },
    handleImageSuccess(res, file, fileList) {
      const list = fileList.map((item) => {
        if (item.response) {
          const data = {
            name: item.response.data[0],
            url: item.response.data[0],
            uid: item.uid
          }
          return data
        } else if (!item.response && item.url) {
          const data = {
            name: item.name,
            url: item.url,
            uid: item.uid
          }
          return data
        }
      })

      list.some((item, i) => {
        if (item === undefined) {
          list.splice(i, 1)
        }
      })

      console.log('=============')
      console.log(list)
      console.log('-------------')
      this.fileList = list.map((item) => {
        if (item) {
          const data = {
            name: item.url,
            url: item.url,
            uid: item.uid
          }
          return data
        } else {
          return null
        }
      })
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

.diary-textarea ::v-deep {
  textarea {
    padding-right: 40px;
    resize: none;
    border: none;
    border-radius: 0px;
    border-bottom: 1px solid #bfcbd9;
  }
}
</style>
