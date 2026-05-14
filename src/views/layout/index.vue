<script setup lang="ts">
import HomeIcon from '@/assets/image/old/menu/home-menu-icon.svg'
import ModelApiIcon from '@/assets/image/old/menu/modelApi-menu-icon.svg'
import ClusterIcon from '@/assets/image/old/menu/cluster-menu-icon.svg'
import DedicatedIcon from '@/assets/image/old/menu/dedicated-menu-icon.svg'
import OndemandIcon from '@/assets/image/old/menu/ondemand-icon.svg'
import PricingIcon from '@/assets/image/old/menu/pricing-menu-icon.svg'
import Mapping from '@/assets/image/old/menu/mapping.svg'
import RequestsIcon from '@/assets/image/old/menu/requests-menu-icon.svg'
import HistoryIcon from '@/assets/image/old/menu/history-menu-icon.svg'
import OfferComputeIcon from '@/assets/image/old/menu/offerCompute.svg'
import AiEventsIcon from '@/assets/image/old/menu/aiEvents.svg'
import AboutUsIcon from '@/assets/image/old/menu/aboutUs.svg'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

const menuList = ref<any>([
  {
    type: '',
    menu: [
      {
        label: 'Home',
        key: 'home',
        icon: HomeIcon,
        path: '/home',
        tooltip: 'Home'
      }
    ]
  },
  {
    type: 'GET COMPUTE',
    menu: [
      {
        label: 'Instant Model APIs',
        key: 'modelApi',
        icon: ModelApiIcon,
        path: '/modelLibrary',
        tooltip: 'Instant Model APIs'
      },
      {
        label: 'Dedicated Deployment',
        key: 'dedicatedDeployment',
        icon: DedicatedIcon,
        path: '/template',
        tooltip: 'Dedicated Deployment'
      },
      {
        label: 'GPU Clusters On-demand',
        key: 'paas',
        icon: OndemandIcon,
        path: '/paas',
        tooltip: 'GPU Clusters On-demand'
      },
      {
        label: 'GPU Clusters Reserved',
        key: 'cluster',
        icon: ClusterIcon,
        path: '/cluster',
        tooltip: 'GPU Clusters Reserved'
      }
    ]
  },
  {
    type: 'PRICING',
    menu: [
      {
        label: 'Daily Pricing',
        key: 'pricing',
        icon: PricingIcon,
        path: '/pricing',
        tooltip: 'Daily Pricing'
      }
    ]
  },
  {
    type: 'EXPLORE ECOSYSTEM',
    menu: [
      {
        label: 'AGI Landscape',
        key: 'mapping',
        icon: Mapping,
        path: '/mapping',
        tooltip: 'AGI Landscape'
      }
      // {
      //   label: 'DeepSeek Global Access',
      //   key: 'deepSeekAccess',
      //   icon: DeepSeekIcon,
      //   path: '/deepSeekAccess',
      //   tooltip: 'DeepSeek Global Access'
      // }
    ]
  },
  {
    type: 'PARTNERSHIP & COLLABORATION',
    menu: [
      {
        label: 'Offer Compute',
        key: 'offerCompute',
        icon: OfferComputeIcon,
        path: '/offerCompute',
        tooltip: 'Offer Compute'
      },
      {
        label: 'More Request',
        key: 'requests',
        icon: RequestsIcon,
        path: '/requests',
        tooltip: 'More Request'
      },
      {
        label: 'AI Events',
        key: 'aiEvents',
        icon: AiEventsIcon,
        path: '/aiEvents',
        tooltip: 'AI Events'
      },
      {
        label: 'About Us',
        key: 'aboutUs',
        icon: AboutUsIcon,
        path: '/aboutUs',
        tooltip: 'About Us'
      }
    ]
  },
  {
    type: 'HISTORY',
    menu: [
      {
        label: 'Thread History',
        key: 'chatHistory',
        icon: HistoryIcon,
        path: '',
        tooltip: 'Thread History',
        children: []
      }
    ]
  }
])

const router = useRouter()

const toPage = (item: any) => {
  router.push(item.path)
}

const isActive = (item: any) => {
  return router.currentRoute.value.path === item.path
}

const subMenuVisibleKey = ref<any>([])

const isSubActive = ref<any>([])

const toChat = (item: any) => {
  router.push(item.path)
}

const del = (id: string) => {
  console.log(id)
}

const login = () => {
  userStore.openModalOrPage()
}
</script>

<template>
  <div class="flex layout">
    <div class="menu">
      <div class="header">
        <img class="logo" src="@/assets/image/menu-logo.png" alt="" />
        <img class="icon" src="@/assets/image/old/expanding.svg" alt="" />
      </div>
      <div class="thread">
        <div class="btn">
          <img src="@/assets/image/add-newthread.png" alt="" />
          <p>New Thread</p>
        </div>
      </div>
      <div class="menu-list">
        <div class="menu-type" v-for="(item, index) in menuList" :key="index">
          <p class="menu-type-title" v-if="item.type">{{ item.type ? $t(item.type) : '' }}</p>
          <div class="menu-type-list-item" v-for="(item2, index2) in item.menu" :key="index2" @click="toPage(item2)">
            <div class="menu-type-list-item-parent" :class="`${isActive(item2) ? 'active' : ''}`">
              <img class="menu-type-list-item-icon" :src="item2.icon" alt="" />
              <p class="menu-type-list-item-label">{{ item2.label ? $t(item2.label) : '' }}</p>
              <div
                v-if="item2.children && item2.children.length > 0"
                class="menu-type-list-item-arrow"
                :class="`${subMenuVisibleKey.indexOf(item2.key) !== -1 ? '' : 'rotate-180'}`"
              >
                <img class="block" src="@/assets/image/old/icon/arrow.svg" alt="" />
              </div>
            </div>

            <div class="menu-type-list-item-children" v-if="subMenuVisibleKey.indexOf(item2.key) !== -1">
              <div
                v-for="(item3, index3) in item2.children"
                :class="{
                  'sub-active': isSubActive(item3)
                }"
                :key="index3"
                @click.stop="toChat(item3)"
                class="menu-item-subItem"
              >
                <img class="menu-item-subItem-icon" @click.stop="del(item3.conversationId)" src="@/assets/image/old/del.svg" alt="" />
                <p class="menu-item-subItem-label">{{ item3?.text ? item3.text : 'New conversation started' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="user-state">
        <div class="" v-if="!userStore.isLoggedIn">
          <p class="btn" @click="login">Login</p>
        </div>
        <div v-else>
          <p class="btn" @click="userStore.logout">Logout</p>
        </div>
      </div>
    </div>
    <div class="main">
      <router-view></router-view>
    </div>
  </div>
</template>

<style lang="less" scoped>
.layout {
  width: 100%;
  height: 100%;
  background-color: #f8f8fa;
}
.menu {
  width: 258px;
  padding: 8px 20px 20px 20px;
  box-sizing: border-box;
  .header {
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
  }

  .thread {
    padding: 0 0 0;
    margin-bottom: 16px;
    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 5px 0;
      cursor: pointer;
      gap: 8px;
      border: 1px solid #000000;
      border-radius: 20px;
      font-size: 14px;
      line-height: 24px;
      &:hover {
        background-color: #ededed;
      }
    }
  }
  .menu-list {
    .menu-type {
      .menu-type-title {
        font-size: 12px;
        line-height: 16px;
        color: #999;
        text-transform: uppercase;
        margin-bottom: 4px;
      }
      .menu-type-list-item {
        .menu-type-list-item-parent {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 4px 10px 4px 0;
          cursor: pointer;
          margin-bottom: 4px;
          .menu-type-list-item-icon {
            width: 14px;
            height: 14px;
            display: block;
          }
          .menu-type-list-item-label {
            font-size: 14px;
            line-height: 24px;
            color: #000;
          }
        }
        &:last-child {
          margin-bottom: 12px;
        }
      }
    }
  }
  .user-state {
    margin-top: auto;
    .btn {
      margin-top: auto;
      border-radius: 20px;
      padding: 7px 0;
      cursor: pointer;
      margin: 0 auto;
      background-color: #000;
      color: #fff;
      font-size: 14px;
      line-height: 24px;
      text-align: center;
    }
  }
}
.main {
  flex: 1;
  background: #fff;
}
</style>
