import { defineStore } from 'pinia'

export const useCommonStore = defineStore('common', () => {
  const isMobile = ref(false)

  const getParams = (params: any) => {
    return params
  }
  return {
    isMobile,
    getParams
  }
})
