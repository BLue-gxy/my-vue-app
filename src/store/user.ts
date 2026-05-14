import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const modalvisible = ref(false)

  const token = ref<string | null>(localStorage.getItem('token'))

  const userInfo = ref<{ id: number; name: string } | null>(null)

  const isLoggedIn = computed(() => !!token.value)

  const setUserToken = (newToken: string | null) => {
    token.value = newToken || ''
    localStorage.setItem('token', newToken || '')
  }

  const setUserInfo = (data: any) => {
    userInfo.value = data
  }

  const logout = () => {
    token.value = null
    userInfo.value = null
    localStorage.removeItem('token')
  }

  const router = useRouter()

  const openModalOrPage = () => {
    if (window.innerWidth < 1024) {
      router.push('/login')
    } else {
      modalvisible.value = true
    }
  }

  return {
    openModalOrPage,
    modalvisible,
    isLoggedIn,
    setUserToken,
    setUserInfo,
    logout
  }
})
