<script setup lang="ts">
import { PhoneNumberUtil } from 'google-libphonenumber'
import phoneRegionList from '@/utils/region-list'

const props = defineProps({
  modelValue: {
    default: false,
    type: Boolean
  }
})

const emit = defineEmits(['update:modelValue', 'refresh'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const errorStatus = ref(0)

const errorList = ref([
  {
    status: 1,
    error: 'Please agree to the Terms of Use and  Privacy Policy.'
  },
  {
    status: 2,
    error: 'Please fill in Email.'
  },
  {
    status: 3,
    error: 'Email is not valid.'
  },
  {
    status: 4,
    error: 'Please enter password.'
  },
  {
    status: 5,
    error: 'This email does not exist. Please sign up.'
  },
  {
    status: 6,
    error: 'Incorrect username or password.'
  },
  {
    status: 7,
    error: 'Please enter phone.'
  },
  {
    status: 8,
    error: 'Please fill in verification code.'
  },
  {
    status: 9,
    error: 'Country and phone number do not match.'
  },
  {
    status: 10,
    error: 'Verification code is incorrect.'
  },
  {
    status: 11,
    error: 'Please fill in Phone Number or Email.'
  },
  {
    status: 12,
    error: 'Verification code is not valid.'
  }
])

const activeError = computed(() => {
  return errorList.value.find((item) => item.status === errorStatus.value)?.error
})

const phoneList = ref<any>([])

watch(visible, (val) => {
  if (val) {
    const phoneUtil = PhoneNumberUtil.getInstance()
    const supportedRegions = phoneUtil.getSupportedRegions()
    phoneList.value = phoneRegionList.map((country) => {
      if (supportedRegions.includes(country.code.toLocaleUpperCase())) {
        const num = phoneUtil.getCountryCodeForRegion(country.code)
        return { name: country.name, code: country.code, num: num }
      }
    })
    areaCodeId.value = phoneList.value[0].num
  }
})

const tabIndex = ref(0)

const showPassword = ref(false)

const emailOrPhone = ref('')
const code = ref('')
const areaCodeId = ref('1')

const account = ref('')
const password = ref('')

const serachQuery = ref()

const optionsDom = ref({ width: 0, top: 0, left: 0 })

const emailOrPhoneType = ref<'email' | 'phone' | 'unknown'>('unknown')

const emailPhoneWrapperRef = ref()

const phoneOptionsVisible = ref(false)

const changeTabIndex = (e: number) => {
  tabIndex.value = e
}

watch(tabIndex, () => {
  errorStatus.value = 0
  showPassword.value = false
  emailOrPhone.value = ''
  code.value = ''
  emailOrPhoneType.value = 'email'
  areaCodeId.value = phoneList.value[0].num
  account.value = ''
  password.value = ''
})

const filterList = computed(() => {
  if (!serachQuery.value) return phoneList.value
  return phoneList.value.filter((item: any) => {
    return (
      item.name.toString().toLowerCase().includes(serachQuery.value.toLowerCase()) ||
      item.num.toString().toLowerCase().includes(serachQuery.value.toLowerCase())
    )
  })
})

const changOptionsVisible = () => {
  phoneOptionsVisible.value = !phoneOptionsVisible.value
  if (phoneOptionsVisible.value) {
    const selectDom = emailPhoneWrapperRef.value as any
    const selectDomRect = selectDom.getBoundingClientRect()
    if (window.innerHeight - selectDomRect.bottom < 300) {
      optionsDom.value = {
        width: selectDomRect.width,
        top: selectDomRect.top - 180,
        left: selectDomRect.left
      }
    } else {
      optionsDom.value = {
        width: selectDomRect.width,
        top: selectDomRect.bottom + 10,
        left: selectDomRect.left
      }
    }
  }
}

const onInput = () => {
  const val = emailOrPhone.value.trim()
  if (val.includes('@')) {
    emailOrPhoneType.value = 'email'
  } else if (/^\d{4,}$/.test(val)) {
    emailOrPhoneType.value = 'phone'
  } else {
    emailOrPhoneType.value = 'unknown'
  }
}

const selectOption = (item: any) => {
  areaCodeId.value = item.num
  phoneOptionsVisible.value = false
}

const s3Url = import.meta.env.VITE_S3_URL

const active = ref([2] as any)

const changeActive = (e: any) => {
  if (active.value.includes(e)) {
    active.value.splice(active.value.indexOf(e), 1)
  } else {
    active.value.push(e)
  }
}
const signInEvent = () => {
  console.log('22')
  errorStatus.value = 1
}

const signUpEvent = () => {
  errorStatus.value = 1
}
</script>

<template>
  <a-modal v-model:open="visible" :closable="false" :footer="null" centered class="reset-modal login-modal" :keyboard="false" :maskClosable="false">
    <div class="close-btn">
      <img class="close" src="@/assets/image/close.svg" alt="" />
    </div>
    <div class="login-header">
      <i18n-t keypath="100,000,000 FREE TOKENS FOR NEW USERS!" tag="p" class="login-header-title">
        <template #num>
          <span>100,000,000</span>
        </template>
      </i18n-t>
      <img src="@/assets/image/login-header-2.png" alt="" />
    </div>
    <div class="modal-body poppins-regular main">
      <div class="tab-wrapper" v-if="tabIndex === 0 || tabIndex === 1" :class="{ 'tab-wrapper-mb': !activeError }">
        <p class="tab-item" :class="{ 'tab-item-active': !tabIndex }" @click="changeTabIndex(0)">{{ $t('Verification Code') }}</p>
        <p class="tab-item" :class="{ 'tab-item-active': tabIndex }" @click="changeTabIndex(1)">{{ $t('Password') }}</p>
      </div>
      <p v-else class="create-account-title" :class="{ 'create-account-title-mb20': activeError }">{{ $t('Create an account') }}</p>
      <div v-if="activeError" class="error-container">
        <img src="@/assets/image/login-error-icon.svg" alt="" />
        <p>{{ activeError }}</p>
      </div>
      <div v-if="tabIndex === 0" class="code-login">
        <div class="email-phone-wrapper" ref="emailPhoneWrapperRef">
          <div class="phone-select-wrapper" @click="changOptionsVisible" v-if="emailOrPhoneType === 'phone'">
            <p>+{{ areaCodeId }}</p>
            <div>
              <svg width="25" height="12" viewBox="0 0 25 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M1.1745 0.430907C1.30515 0.29562 1.46656 0.187143 1.6478 0.112805C1.82904 0.0384664 2.0259 -1.98558e-06 2.22508 -1.96817e-06C2.42427 -1.95075e-06 2.62113 0.0384664 2.80237 0.112805C2.98361 0.187143 3.14501 0.29562 3.27567 0.430907L12.7389 8.58793L22.2022 0.430909C22.3329 0.295622 22.4943 0.187145 22.6755 0.112807C22.8568 0.0384682 23.0536 -1.47277e-07 23.2528 -1.29864e-07C23.452 -1.12451e-07 23.6489 0.0384683 23.8301 0.112807C24.0113 0.187145 24.1727 0.295622 24.3034 0.430909C24.5837 0.718477 24.7383 1.08796 24.7383 1.47048C24.7383 1.85301 24.5837 2.22249 24.3034 2.51006L13.7922 11.5705C13.4989 11.8572 13.1189 12.0012 12.7376 12C12.3563 12.0012 11.975 11.8572 11.6844 11.5705L1.17316 2.51006C0.892844 2.22249 0.738282 1.85301 0.738282 1.47048C0.738282 1.08795 0.894177 0.718475 1.1745 0.430907Z"
                  fill="black"
                />
              </svg>
            </div>
          </div>
          <a-input class="reset-input phone-input" v-model:value="emailOrPhone" :placeholder="'Phone Number or Email'" @input="onInput"></a-input>
        </div>
        <div class="code-input-wrapper">
          <a-input class="reset-input code-input" v-model:value="code" :placeholder="$t('Verification Code')"></a-input>
          <a-button class="reset-btn send-btn">Send Code</a-button>
        </div>
      </div>
      <div v-if="tabIndex === 1" class="password-login">
        <a-input class="reset-input email-input" v-model:value="account" :placeholder="$t('Email')"></a-input>
        <a-input class="reset-affix-input affix-input" v-model:value="password" :type="showPassword ? 'text' : 'password'" :placeholder="$t('Email')">
          <template #suffix>
            <img v-if="showPassword" @click="showPassword = !showPassword" class="view-icon" src="@/assets/image/password-view.png" alt="" />
            <img v-else @click="showPassword = !showPassword" class="hide-icon" src="@/assets/image/password-hiden.png" alt="" />
          </template>
        </a-input>
        <p class="forgot-text cursor-pointer">{{ $t('Forgot password?') }}</p>
      </div>
      <div v-if="tabIndex === 2" class="signUp-wrapper">
        <a-input class="reset-input email-input" v-model:value="account" :placeholder="$t('Email')"></a-input>
        <a-input class="reset-affix-input affix-input" v-model:value="password" :type="showPassword ? 'text' : 'password'" :placeholder="$t('Email')">
          <template #suffix>
            <img v-if="showPassword" @click="showPassword = !showPassword" class="view-icon" src="@/assets/image/password-view.png" alt="" />
            <img v-else @click="showPassword = !showPassword" class="hide-icon" src="@/assets/image/password-hiden.png" alt="" />
          </template>
        </a-input>
      </div>
      <a-button
        v-if="tabIndex === 0 || tabIndex === 1"
        class="reset-btn sign-btn"
        :class="{ 'sign-btn-mb10': tabIndex === 1 }"
        @click="signInEvent"
        >{{ $t('Sign In') }}</a-button
      >
      <a-button v-if="tabIndex === 2" class="reset-btn signUp-btn" @click="signUpEvent">{{ $t('Sign Up') }}</a-button>
      <p v-if="tabIndex == 1" class="signIn-text">
        {{ $t("Don't have an account? Sign up") }}<span @click="tabIndex = 2">{{ $t('Sign up') }}</span>
      </p>
      <i18n-t v-if="tabIndex === 2" keypath="Already have an account? Log in" tag="p" class="signIn-text">
        <template #login>
          <span @click="tabIndex = 0">{{ $t('Log in') }}</span>
        </template>
      </i18n-t>
      <p class="or-text" v-if="tabIndex !== 2">{{ $t('OR') }}</p>
      <div class="orLogin-wrapper" v-if="tabIndex !== 2">
        <div class="item">
          <img src="@/assets/image/google-login.png" alt="" />
        </div>
        <div class="item">
          <img src="@/assets/image/twitter-login.png" alt="" />
        </div>
      </div>

      <div class="check-wrapper">
        <div class="radio-item" @click="changeActive(1)">
          <div class="radio" :class="`${active.includes(1) ? 'active' : ''}`"></div>
          <i18n-t
            keypath="By clicking, you agree to Terms of Use and acknowledge the Privacy Policy of PBD ID provided by PaleBlueDot AI Ltd."
            tag="p"
          >
            <template #terms>
              <a :href="`${s3Url}/terms.html`" target="_blank">{{ $t('Terms of Use') }}</a>
            </template>
            <template #policy>
              <a :href="`${s3Url}/policy.html`" target="_blank">{{ $t('Privacy Policy') }}</a>
            </template>
          </i18n-t>
        </div>
        <div class="radio-item" @click="changeActive(2)">
          <div class="radio" :class="`${active.includes(2) ? 'active' : ''}`"></div>
          <p>{{ $t('By clicking, you agree to receive news, promotions, and discount information from PaleBlueDot AI') }}</p>
        </div>
      </div>
    </div>
    <teleport to="body" v-if="phoneOptionsVisible">
      <div
        ref="customOptionRef"
        class="custom-option"
        :style="{ width: `${optionsDom.width}px`, top: `${optionsDom.top}px`, left: `${optionsDom.left}px` }"
      >
        <div class="search-wrapper">
          <div class="input-search">
            <img class="search-icon" src="@/assets/image/search.svg" alt="" />
            <input v-model="serachQuery" placeholder="Search" class="search-input" type="text" />
            <div v-if="serachQuery" class="clear-icon" @click.stop="serachQuery = null">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M2.28153 1.45623L5.99904 5.17315L9.71655 1.45623C9.81713 1.35565 9.95096 1.29523 10.0929 1.28631C10.2349 1.27738 10.3752 1.32056 10.4876 1.40775L10.5425 1.45623C10.652 1.56577 10.7136 1.71433 10.7136 1.86922C10.7136 2.02412 10.652 2.17267 10.5425 2.28221L6.82502 5.99972L10.5425 9.71723C10.6473 9.82235 10.7081 9.96341 10.7126 10.1118C10.7172 10.2601 10.6651 10.4046 10.5669 10.5159C10.4688 10.6272 10.3319 10.697 10.1842 10.7111C10.0364 10.7252 9.88887 10.6825 9.77146 10.5917L9.71655 10.5432L5.99904 6.8257L2.28153 10.5432L2.22662 10.5917C2.10921 10.6825 1.96165 10.7252 1.81391 10.7111C1.66616 10.697 1.52932 10.6272 1.43116 10.5159C1.333 10.4046 1.2809 10.2601 1.28543 10.1118C1.28996 9.96341 1.35078 9.82235 1.45555 9.71723L5.17247 5.99972L1.45555 2.28221C1.34914 2.17204 1.29026 2.02449 1.29159 1.87132C1.29292 1.71816 1.35436 1.57165 1.46266 1.46335C1.57097 1.35504 1.71748 1.29361 1.87064 1.29228C2.0238 1.29094 2.17136 1.34982 2.28153 1.45623Z"
                  fill="black"
                />
              </svg>
            </div>
          </div>
        </div>
        <div class="custom-option-list">
          <p class="custom-option-item" v-for="(item, index) in filterList" :key="index" @click="selectOption(item)">
            +{{ item.num }} {{ item.name }}
          </p>
        </div>
      </div>
    </teleport>
  </a-modal>
</template>

<style lang="less">
.login-modal.ant-modal {
  width: 430px !important;
  .ant-modal-content {
    padding: 0;
    border-radius: 30px;
    position: relative;

    .ant-modal-body {
      position: relative;

      .close-btn {
        position: absolute;
        right: 10px;
        top: 10px;
        padding: 10px;
        cursor: pointer;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1;

        img {
          width: 14px;
          height: 14px;
        }

        &:hover {
          background: #0000001a;
        }
      }

      .login-header {
        width: 100%;
        background-image: url('@/assets/image/login-header.png');
        background-size: 100% 100%;
        position: relative;
        text-align: center;
        font-family: 'Ethnocentric-Regular';
        color: #23325d;
        text-shadow: 0px 4px 4px #7aafcb66;
        font-size: 14px;
        line-height: 18px;
        padding: 12px 0 8px;
        .login-header-title {
          max-width: 250px;
          margin: 0 auto;
        }
        span {
          font-size: 16px;
          line-height: 18px;
          background: linear-gradient(90deg, #0284fa 13.08%, #00e1d0 65.58%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        img {
          position: absolute;
          width: 70px;
          height: 70px;
          left: 20px;
          top: 100%;
          transform: translateY(-63%);
        }
      }
    }
  }
}
.main {
  padding: 30px;
  .tab-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 36px;
    margin-bottom: 16px;
    .tab-item {
      font-size: 16px;
      line-height: 22px;
      color: #999;
      cursor: pointer;

      &:hover {
        color: #000;
      }
    }

    .tab-item-active {
      color: #0284fa;
      position: relative;
      font-family: 'Poppins-Bold';

      &::after {
        content: '';
        position: absolute;
        bottom: -6px;
        left: 50%;
        transform: translateX(-50%);
        width: 30px;
        height: 2px;
        background-color: #0284fa;
        border-radius: 999px;
      }

      &:hover {
        color: #0284facc;
      }
    }
  }
  .tab-wrapper-mb {
    margin-bottom: 38px;
  }
  .create-account-title {
    font-family: 'Poppins-Bold';
    font-size: 24px;
    line-height: 28px;
    text-align: center;
    margin-bottom: 36px;
  }
  .create-account-title-mb20 {
    margin-bottom: 20px;
  }
  .error-container {
    background-color: #ffecef;
    border-radius: 10px;
    padding: 9px 14px;
    display: flex;
    align-items: flex-start;
    gap: 6px;
    color: #ff5a5a;
    margin-bottom: 10px;
    img {
      width: 14px;
      margin-top: 5px;
    }
  }
  .code-login {
    margin-bottom: 48px;
    .email-phone-wrapper {
      display: flex;
      align-items: center;
      padding: 11px 16px;
      background-color: #f5f5f5;
      border-radius: 30px;
      margin-bottom: 24px;
      border: 1px solid transparent;
      img {
        margin-right: 8px;
      }
      .phone-select-wrapper {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-right: 12px;
        svg {
          display: block;
          width: 12px;
        }
      }
      &:hover {
        border: 1px solid #d9d9d9;
      }
      .phone-input {
        flex: 1;
        background-color: #f5f5f5;
        border: none;
        outline: none;
        font-size: 14px;
        line-height: 20px;
        font-family: 'Poppins-Regular';
        &:focus {
          outline: none;
        }
        &::placeholder {
          color: #999;
        }
      }
    }
    .code-input-wrapper {
      display: flex;
      align-items: center;
      gap: 6px;
      .code-input {
        padding: 11px 16px;
        border-radius: 30px;
        border: 1px solid transparent;
        background-color: #f5f5f5;
        font-size: 14px;
        line-height: 20px;
        &::placeholder {
          color: #999;
        }
        &:hover {
          border: 1px solid #d9d9d9;
        }
      }
      .send-btn {
        padding: 12px 16px;
        border-radius: 30px;
        background-color: #f5f5f5;
        cursor: pointer;
        font-family: 'Poppins-Regular';
        font-size: 14px;
        line-height: 20px;
        box-sizing: border-box;
        white-space: nowrap;
        &:hover {
          background-color: #eeeeee;
        }
      }
    }
  }

  .signUp-wrapper,
  .password-login {
    .email-input {
      padding: 11px 16px;
      border-radius: 30px;
      border: 1px solid transparent;
      background-color: #f5f5f5;
      font-size: 14px;
      line-height: 20px;
      margin-bottom: 24px;
      &::placeholder {
        color: #999;
      }
      &:hover {
        border: 1px solid #d9d9d9;
      }
    }
    .affix-input {
      padding: 11px 16px;
      font-family: 'Poppins-regular';
      border-radius: 30px;
      border: 1px solid transparent;
      background-color: #f5f5f5;
      margin-bottom: 10px;
      input {
        background-color: #f5f5f5;
        color: #000;
        &::placeholder {
          color: #999;
          font-family: 'Poppins-regular';
        }
      }
      .ant-input-suffix {
        width: 16px;
        cursor: pointer;
      }
    }
  }
  .password-login {
    .forgot-text {
      margin-bottom: 10px;
    }
  }
  .signUp-wrapper {
    .affix-input {
      margin-bottom: 32px;
    }
  }
  .sign-btn {
    width: 100% !important;
    height: auto !important;
    font-size: 14px !important;
    line-height: 20px !important;
    font-family: 'Poppins-Regular', sans-serif !important;
    background-color: #000;
    border: none !important;
    border-radius: 999px !important;
    padding: 12px 0 !important;
    color: #fff !important;
    margin-bottom: 48px;
    &:hover {
      background-color: #0284fa !important;
    }
  }
  .sign-btn-mb10 {
    margin-bottom: 10px;
  }

  .signUp-btn {
    width: 100% !important;
    height: auto !important;
    font-size: 14px !important;
    line-height: 20px !important;
    font-family: 'Poppins-Regular', sans-serif !important;
    background-color: #000;
    border: none !important;
    border-radius: 999px !important;
    padding: 12px 0 !important;
    color: #fff !important;
    margin-bottom: 10px;
    &:hover {
      background-color: #0284fa !important;
    }
  }
  .forgot-text {
    color: #0284fa;
    font-size: 14px;
    line-height: 18px;
    &:hover {
      text-decoration: underline;
    }
  }
  .signIn-text {
    margin-bottom: 10px;
    font-size: 14px;
    line-height: 18px;
    color: #666;
    margin-bottom: 20px;
    span {
      color: #0284fa;
      cursor: pointer;
      &:hover {
        text-decoration: underline;
      }
    }
  }
  .or-text {
    color: #999999;
    font-size: 14px;
    line-height: 18px;
    position: relative;
    text-align: center;
    margin-bottom: 10px;

    &::after {
      content: '';
      width: 159px;
      height: 1px;
      background-color: #f5f5f5;
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
    }

    &::before {
      content: '';
      width: 159px;
      height: 1px;
      background-color: #f5f5f5;
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
    }
  }

  .orLogin-wrapper {
    display: flex;
    justify-content: center;
    gap: 40px;
    margin-bottom: 20px;

    .item {
      width: 50px;
      height: 50px;
      background-color: #f5f5f5;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      &:hover {
        background-color: #e5e5e5;
      }

      img {
        width: 22px;
        height: 22px;
      }
    }
  }

  .check-wrapper {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .radio-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      cursor: pointer;
      color: #aaaaaa;

      .radio {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 1px solid #ccc;
        position: relative;
        margin-top: 1px;
      }

      .active {
        background-color: #000;
        border: 1px solid transparent;

        &::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background-color: #fff;
          transform: translate(-50%, -50%);
        }
      }

      p {
        flex: 1;
        font-size: 12px;
        line-height: 16px;

        a {
          color: #0284fa;
        }
      }
    }
  }
}
</style>
