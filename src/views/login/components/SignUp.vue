<script setup lang="ts">
const errorText = ref([
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
    error: 'Please input the correct email address.'
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
    error: 'Email already exists.'
  },
  {
    status: 8,
    error: 'Password must be at least 8 characters and contain upper and lower letters, numbers and special characters.'
  }
])

const errorStatus = ref(0)

const activeError = computed(() => {
  return errorText.value.find((item) => item.status === errorStatus.value)?.error
})

const emits = defineEmits(['changePage'])

const showPassword = ref(false)

const formData = ref({
  email: '',
  password: ''
})

const s3Url = import.meta.env.VITE_S3_URL

const active = ref([2] as any)

const changeActive = (e: any) => {
  if (active.value.includes(e)) {
    active.value.splice(active.value.indexOf(e), 1)
  } else {
    active.value.push(e)
  }
}

const router = useRouter()

const toPage = (path: any) => {
  router.push(path)
}

const signInloading = ref(false)

const signIn = () => {
  if (!active.value.includes(1)) {
    return (errorStatus.value = 1)
  }
  if (!formData.value.email) {
    return (errorStatus.value = 2)
  }
  if (!formData.value.password) {
    return (errorStatus.value = 3)
  }
  signInloading.value = true
  errorStatus.value = 0
  console.log('注册')
}
</script>

<template>
  <div class="modal-wrapper">
    <div class="modal-body">
      <p class="title" :class="activeError ? 'mb-[20px]' : 'mb-[36px]'">{{ $t('Create an account') }}</p>
      <div class="error-wrapper" v-if="activeError">
        <img src="@/assets/image/login-error-icon.svg" alt="" />
        <p>{{ activeError }}</p>
      </div>
      <div class="form-input">
        <a-input class="reset-input input" v-model:value="formData.email" :placeholder="$t('Email')"></a-input>
        <a-input
          class="reset-affix-input affix-input"
          v-model:value="formData.password"
          :type="showPassword ? 'text' : 'password'"
          :placeholder="$t('Email')"
        >
          <template #suffix>
            <img v-if="showPassword" @click="showPassword = !showPassword" class="view-icon" src="@/assets/image/password-view.png" alt="" />
            <img v-else @click="showPassword = !showPassword" class="hide-icon" src="@/assets/image/password-hiden.png" alt="" />
          </template>
        </a-input>
      </div>
      <a-button class="btn" @click="signIn" :loading="signInloading">{{ $t('Sign Up') }}</a-button>
      <i18n-t keypath="Already have an account? Log in" tag="p" class="sign-text">
        <template #login>
          <span @click="emits('changePage', 'login')">{{ $t('Log in') }}</span>
        </template>
      </i18n-t>
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
  </div>
</template>

<style lang="less" scoped>
.modal-wrapper {
  .modal-body {
    padding: 36px 30px 24px;
    .title {
      font-family: 'Poppins-Bold';
      font-size: 24px;
      line-height: 28px;
      text-align: center;
      margin-bottom: 36px;
    }
    .form-input {
      margin-bottom: 36px;
      .input {
        margin-bottom: 24px;
      }
    }
    .forgot-text {
      color: #0284fa;
      font-size: 14px;
      line-height: 18px;
      margin-bottom: 32px;
    }
    .btn {
      width: 100%;
      height: auto;
      font-size: 14px;
      line-height: 20px;
      font-family: 'Poppins-Regular', sans-serif;
      background-color: #000;
      border: none;
      border-radius: 999px;
      padding: 12px 0;
      color: #fff;
      margin-bottom: 10px;
      &:hover {
        background-color: #0284fa;
      }
    }
    .sign-text {
      font-size: 14px;
      line-height: 18px;
      color: #666;
      margin-bottom: 50px;
      span {
        color: #0284fa;
        cursor: pointer;
        &:hover {
          text-decoration: underline;
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
          margin-top: 2px;
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
    .error-wrapper {
      background-color: #ffecef;
      border-radius: 10px;
      display: flex;
      align-items: flex-start;
      padding: 9px 14px;
      gap: 6px;
      margin-bottom: 10px;
      img {
        width: 14px;
        height: 14px;
        margin-top: 5px;
      }
      p {
        color: #ff5a5a;
      }
    }
  }
}

:deep(.reset-input.input) {
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

:deep(.reset-btn.btn) {
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
:deep(.reset-affix-input.affix-input) {
  padding: 11px 16px;
  font-family: 'Poppins-regular';
  border-radius: 30px;
  border: 1px solid transparent;
  background-color: #f5f5f5;

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
@media (max-width: 1024px) {
  .modal-wrapper {
    .modal-body {
      padding: 10rem 7rem 12rem;
      .title {
        font-size: 4.6rem;
        line-height: 6rem;
        text-align: center;
        margin-bottom: 6rem;
      }
      .form-input {
        margin-bottom: 6rem;
        :deep(.input-container) {
          border-radius: 999px;
          padding: 2rem 3rem;
          font-size: 2.6rem;
          line-height: 4rem;
          background-color: #f5f5f5;
          .input-field {
            &::placeholder {
              font-family: 'Poppins-Regular';
              color: #999999;
              font-size: 2.6rem;
              line-height: 4rem;
            }
          }
          .view-icon {
            width: 16px;
            height: 11px;
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            right: 20px;
            cursor: pointer;
          }
          .hide-icon {
            width: 16px;
            height: 8px;
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            right: 20px;
            cursor: pointer;
          }
        }
        .email-input {
          margin-bottom: 3.2rem;
        }
      }
      .forgot-text {
        color: #0284fa;
        font-size: 14px;
        line-height: 18px;
        margin-bottom: 32px;
      }
      .btn {
        width: 100%;
        height: auto;
        font-size: 2.6rem;
        line-height: 4rem;
        font-family: 'Poppins-Regular', sans-serif;
        background-color: #000;
        border: none;
        border-radius: 999px;
        padding: 2rem 0;
        color: #fff;
        margin-bottom: 1.6rem;
        &:active {
          background-color: #0284fa;
        }
      }
      .sign-text {
        font-size: 2.6rem;
        line-height: 3.2rem;
        color: #666;
        margin-bottom: 6rem;
        span {
          color: #0284fa;
          cursor: pointer;
          &:hover {
            text-decoration: underline;
          }
        }
      }
      .check-wrapper {
        display: flex;
        flex-direction: column;
        gap: 3rem;
        .radio-item {
          display: flex;
          align-items: flex-start;
          gap: 1.4rem;
          cursor: pointer;
          color: #aaaaaa;
          .radio {
            width: 2.6rem;
            height: 2.6rem;
            border-radius: 50%;
            border: 1px solid #ccc;
            position: relative;
            margin-top: 2px;
          }
          .active {
            background-color: #000;
            border: 1px solid transparent;
            &::after {
              content: '';
              position: absolute;
              top: 50%;
              left: 50%;
              width: 0.9rem;
              height: 0.9rem;
              border-radius: 50%;
              background-color: #fff;
              transform: translate(-50%, -50%);
            }
          }
          p {
            flex: 1;
            font-size: 2.4rem;
            line-height: 3rem;
            a {
              color: #0284fa;
            }
          }
        }
      }
      .error-wrapper {
        background-color: #ffecef;
        border-radius: 2rem;
        display: flex;
        align-items: flex-start;
        padding: 1.8rem 2.8rem;
        gap: 1.2rem;
        margin-bottom: 2rem;
        img {
          width: 2.4rem;
          height: 2.4rem;
          margin-top: 0.5rem;
        }
        p {
          font-family: 'Poppins-Regular';
          font-size: 2.4rem;
          line-height: 3.2rem;
          color: #ff5a5a;
        }
      }
    }
  }
}
</style>
