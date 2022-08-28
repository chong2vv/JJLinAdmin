<template>
  <article-detail :is-edit="false" />
</template>

<script>
import ArticleDetail from './components/GoodsDetail'

export default {
  name: 'CreateArticle',
  components: { ArticleDetail }
}
</script>
