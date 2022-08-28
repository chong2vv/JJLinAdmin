<template>
  <goods-detail :is-edit="true" />
</template>

<script>
import GoodsDetail from './components/GoodsDetail'

export default {
  name: 'EditGoods',
  components: { GoodsDetail }
}
</script>

