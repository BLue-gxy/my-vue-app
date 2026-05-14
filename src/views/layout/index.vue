<script setup lang="ts">
import { useCommonStore } from '@/store/common'

const commonStore = useCommonStore()

onMounted(() => {
  console.log('commonStore: ', commonStore)
})
</script>

<template>
  <div>layout</div>
</template>

<style lang="less" scoped></style>
