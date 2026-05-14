<script setup lang="ts">
import { useCommonStore } from './store/common'
import LoginModal from './views/login/modal/index.vue'
import { useUserStore } from './store/user'

const userStore = useUserStore()

onMounted(() => {
  const commonStore = useCommonStore()
  commonStore.isMobile = window.innerWidth < 1024
})
</script>

<template>
  <a-config-provider :wave="{ disabled: true }">
    <router-view></router-view>
    <LoginModal :modelValue="userStore.modalvisible"></LoginModal>
  </a-config-provider>
</template>

<style>
html,
body,
#app {
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: 'Poppins-Regular';
}
</style>
