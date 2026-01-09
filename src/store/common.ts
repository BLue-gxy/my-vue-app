import { defineStore } from 'pinia'

export const useCommonStore = defineStore('common', () => {
  const getParams = (params: any) => {
    return params
  }
  return {
    getParams
  }
})
