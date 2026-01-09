<script setup lang="ts">
import { queryAsync } from '@/apollo/request'
import gql from 'graphql-tag'
import { useCommonStore } from '@/store/common'

const commonStore = useCommonStore()

const aaaa = gql`
  query QueryHotTopic {
    queryHotTopic {
      data {
        id
        name
        enable
        createdAt
        meta
      }
      totalCount
    }
  }
`
onMounted(async () => {
  const a = await queryAsync(aaaa)
  console.log(' a : ', a)
  const b = commonStore.getParams('queryHotTopic')
  console.log('b : ', b)
})
</script>

<template>
  <div>layout</div>
</template>

<style lang="less" scoped></style>
