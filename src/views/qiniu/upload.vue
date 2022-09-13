<template>
  <el-upload :data="dataObj" :multiple="true" action="http://localhost:8090/upload/ossFile" drag>
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
      dataObj: { token: '', key: '' },
      image_uri: [],
      fileList: []
    }
  },
  methods: {

  }
}
</script>
