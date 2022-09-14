<template>
  <el-upload :data="dataObj" :multiple="true" :action="uploadUrl" drag>
    <i class="el-icon-upload" />
    <div class="el-upload__text">
      将文件拖到此处，或<em>点击上传</em>
    </div>
  </el-upload>
</template>

<script>

export default {
  data() {
    return {
      uploadUrl: process.env.VUE_APP_UPLOAD_API,
      dataObj: { token: '', key: '' },
      image_uri: [],
      fileList: []
    }
  },
  methods: {

  }
}
</script>
