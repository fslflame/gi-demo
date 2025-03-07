import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import { resetRouter } from '@/router'
import { type UserInfo, getUserInfo as getUserInfoApi, login as loginApi, logout as logoutApi } from '@/apis/user'
import { clearToken, getToken, setToken } from '@/utils/auth'
import { resetHasRouteFlag } from '@/router/permission'

const storeSetup = () => {
  const userInfo = reactive<Pick<UserInfo, 'nickname' | 'avatar'>>({
    nickname: '',
    avatar: ''
  })
  const name = computed(() => userInfo.nickname)
  const avatar = computed(() => userInfo.avatar)

  const token = ref(getToken() || '')
  const roles = ref<string[]>([]) // 当前用户角色
  const permissions = ref<string[]>([]) // 当前角色权限标识集合

  // 重置token
  const resetToken = () => {
    token.value = ''
    clearToken()
    resetHasRouteFlag()
  }

  // 登录
  const login = async (params: any) => {
    const res = await loginApi(params)
    setToken(res.data.token)
    token.value = res.data.token
  }

  // 退出
  const logout = async () => {
    try {
      await logoutApi()
      token.value = ''
      roles.value = []
      permissions.value = []
      resetToken()
      resetRouter()
      return true
    } catch (error) {
      return false
    }
  }

  // 获取用户信息
  const getInfo = async () => {
    const res = await getUserInfoApi()
    userInfo.nickname = res.data.nickname
    userInfo.avatar = res.data.avatar
    if (res.data.roles && res.data.roles.length) {
      roles.value = res.data.roles
      permissions.value = res.data.permissions
    }
  }

  // 模拟用 临时模拟token过期
  const editToken = (value: string) => {
    token.value = value
    setToken(token.value)
  }

  return { userInfo, name, avatar, token, roles, permissions, login, logout, getInfo, resetToken, editToken }
}

export const useUserStore = defineStore('user', storeSetup, {
  persist: { paths: ['token', 'roles', 'permissions'], storage: localStorage }
})
