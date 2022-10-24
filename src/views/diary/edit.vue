<template>
  <diary-detail :is-edit="true" />
</template>

<script>
import DiaryDetail from './components/DiaryDetail'

export default {
  name: 'EditDiary',
  components: { DiaryDetail }
}
</script>

