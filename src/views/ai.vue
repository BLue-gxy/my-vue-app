@ -0,0 +1,624 @@
<script setup lang="ts">
import { message } from 'ant-design-vue'
import { v4 as uuidv4 } from 'uuid'
import useCommon from '@/hooks/useCommon'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const { isWordFile, isExcelFile, isPPTFile, isImageFile, isPDFFile, isTextFile, isCsvFile } = useCommon()

const search = ref('')

const searchStatus = computed(() => {
  if (search.value.trim() || fileList.value.length > 0 || recordedBlob.value) {
    return 'canBeSent'
  }
  if (isRecording.value) {
    return 'canBeSent'
  }
  return 'notSent'
})

//audio
const maxDuration = 60000
const recordedBlob = ref<Blob | null>(null)
const isRecording = ref(false)
const shouldSendImmediately = ref(false)
const recordingTime = ref(0)
const startTime = ref(0)
let timer: number | null = null
let mediaRecorder: MediaRecorder | null = null
let audioChunks: Blob[] = []

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
    audioChunks = []
    recordedBlob.value = null

    startTime.value = Date.now()

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunks.push(e.data)
    }

    mediaRecorder.onstop = () => {
      if (isRecording.value || shouldSendImmediately.value) {
        recordedBlob.value = new Blob(audioChunks, { type: 'audio/webm' })
        if (shouldSendImmediately.value) {
          sendAudio()
          shouldSendImmediately.value = false
        }
      }
      resetTimer()
      stream.getTracks().forEach((track) => track.stop())
    }

    mediaRecorder.start()
    isRecording.value = true
    startTimer()
  } catch (err) {
    console.error('录音启动失败:', err)
    alert('请允许麦克风访问权限')
  }
}

const stopRecording = () => {
  if (mediaRecorder && isRecording.value) {
    mediaRecorder.stop()
    isRecording.value = false
  }
}

const delAudio = () => {
  isRecording.value = false

  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }
  recordedBlob.value = null
  recordingTime.value = 0
  startTime.value = 0
  resetTimer()
  audioChunks = []
}

const startTimer = () => {
  recordingTime.value = 0
  timer = window.setInterval(() => {
    const elapsed = Date.now() - startTime.value
    recordingTime.value = Math.floor(elapsed / 1000)
    if (elapsed >= maxDuration) {
      stopRecording()
    }
  }, 100)
}

const resetTimer = () => {
  if (timer) clearInterval(timer)
  timer = null
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const recordingProgress = computed(() => {
  if (!isRecording.value && !recordedBlob.value) return 0
  const percent = ((recordingTime.value * 1000) / maxDuration) * 100
  return Math.min(percent, 100)
})

//file
const fileList = ref<any>([])

const uploadFileRef = ref()

const uploadFileLoading = ref(false)

const triggerUpload = () => {
  if (uploadFileRef.value) {
    uploadFileRef.value.value = ''
    uploadFileRef.value.click()
  }
}

const handleFileChange = (event: any) => {
  const file = event.target.files[0]
  if (file) {
    const maxSizeInBytes = 20 * 1024 * 1024
    if (file.size > maxSizeInBytes) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2)
      return message.error('File size (' + fileSizeMB + 'MB) exceeds 20 MB limit')
    }
    const id: string = uuidv4()
    const fileObj = {
      id: id,
      originalname: file.name,
      loading: true,
      isError: false,
      type: file.type,
      image: null
    }
    const fileName = file.name.toLowerCase()
    const extension = fileName.split('.').pop()
    const mimeType = file.type
    if (isWordFile(extension, mimeType)) {
      fileObj.type = 'Word'
    } else if (isExcelFile(extension, mimeType)) {
      fileObj.type = 'Excel'
    } else if (isPPTFile(extension, mimeType)) {
      fileObj.type = 'PPT'
    } else if (isImageFile(extension, mimeType)) {
      const reader = new FileReader()
      reader.onload = (e: any) => {
        fileObj.image = e.target.result
      }
      reader.readAsDataURL(file)
      fileObj.type = 'Image'
    } else if (isPDFFile(extension, mimeType)) {
      fileObj.type = 'PDF'
    } else if (isTextFile(extension, mimeType)) {
      fileObj.type = 'TXT'
    } else if (isCsvFile(extension, mimeType)) {
      fileObj.type = 'CSV'
    }
    fileList.value.push(fileObj)
    uploadFile(file, fileObj)
    event.target.value = ''
  }
}

const uploadFile = (file: string | Blob, fileObj: any) => {
  const url = import.meta.env.VITE_APP_AXIOS_API_URL
  const formData = new FormData()
  formData.append('file', file)
  formData.append('conversationld', '')
  formData.append('uuid', fileObj.id)
  const token = localStorage.getItem('token')
  const temp = localStorage.getItem('user')
  const headers: Record<string, string> = {
    userId: String(temp ? JSON.parse(temp).id : null),
    ...(token ? { Authorization: token } : {}),
    tempSessionId: localStorage.getItem('sessionId') || ''
  }
  uploadFileLoading.value = true
  fetch(url + '/upload-agentx-attachment', {
    method: 'POST',
    headers,
    body: formData
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status) {
        uploadFileLoading.value = false
        fileList.value.forEach((item: any) => {
          if (data.data.uuid === item.id) {
            item.loading = false
            item.url = data.data.url
            item.mimetype = data.data.mimetype
            item.filename = data.data.filename
            item.size = data.data.size
            item.createdAt = data.data.createdAt
          }
        })
      }
    })
    .catch((error) => {
      fileList.value.forEach((item: any) => {
        if (error.data.uuid === item.id) {
          item.loading = false
          item.isError = true
        }
      })
    })
}

onUnmounted(() => resetTimer())

//is deepSearch
const deepSearch = ref(false)

const deepSearchClick = () => {
  deepSearch.value = !deepSearch.value
}

//input
const homeTextareaRef = ref<HTMLTextAreaElement>()
const isComposing = ref(false)

const inputFocus = () => {
  console.log('inputFocus')
}

const resizeTextarea = () => {
  if (homeTextareaRef.value) {
    homeTextareaRef.value.style.height = 'auto'
    homeTextareaRef.value.style.height = homeTextareaRef.value.scrollHeight + 'px'
  }
}

const handleKeydown = async (e: any) => {
  if (isComposing.value) return
  if (e.key === 'Enter') {
    if (e.shiftKey || e.ctrlKey) {
      return
    } else {
      e.preventDefault()
      console.log('sendMessage')
    }
  }
}

const handleCompositionEnd = () => {
  isComposing.value = false
}
//history
const historyVisible = ref(false)
const historyList = ref<any>([])
const showAll = ref(false)

const sendHistory = (text: any) => {
  search.value = text
}

//hot
const hotList = ref<any>([])

const toggleShowAll = () => {}

//send
const sendMessage = () => {
  if (isRecording.value) {
    shouldSendImmediately.value = true
    stopRecording()
    return
  }
  if (uploadFileLoading.value) {
    return
  }
  console.log(search.value)
}

const sendAudio = () => {
  console.log(recordedBlob.value)
  recordedBlob.value = null
}

const defile = (temp: any) => {
  fileList.value.forEach((item: any, index: any) => {
    if (item.id === temp.id) {
      fileList.value.splice(index, 1)
    }
  })
}
</script>

<template>
  <div class="search-wrapper">
    <div class="search-content">
      <Attachment v-for="(item, index) in fileList" :key="index" :item="item" @delFile="defile"></Attachment>
      <textarea
        ref="homeTextareaRef"
        class="input-textarea poppins-regular"
        rows="1"
        :placeholder="$t('Type your message here...')"
        v-model="search"
        @input="resizeTextarea"
        @keydown="handleKeydown"
        @compositionstart="isComposing = true"
        @compositionend="handleCompositionEnd"
        @focus="inputFocus"
      ></textarea>
      <div class="search-footer">
        <div class="model">
          <img src="@/assets/image/think-icon.svg" alt="" />
          <p class="poppins-regular">{{ $t('Reasoning · R1') }}</p>
        </div>
        <div class="deep-wrapper" :class="{ 'deep-wrapper-active': deepSearch }" @click="deepSearchClick">
          <svg width="15" height="17" viewBox="0 0 15 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M8.74821 12.8521L8.13602 12.2383L8.13425 12.2359L8.13362 12.2329L8.13425 12.2299L8.13602 12.2274L12.8407 7.52276L12.8432 7.52098L12.8461 7.52035L12.8491 7.52098L12.8516 7.52276L13.463 8.13573L13.4648 8.13821L13.4654 8.14119L13.4648 8.14418L13.463 8.14666L8.75836 12.8513L8.7529 12.8525L8.74743 12.8513L8.74821 12.8521ZM2.67004 3.73796L4.34888 2.05912L4.35059 2.05662L4.35119 2.05365L4.35059 2.05068L4.34888 2.04819L3.73669 1.436L3.73421 1.43422L3.73122 1.43359L3.72824 1.43422L3.72576 1.436L2.04692 3.11483L2.04514 3.11731L2.04452 3.1203L2.04514 3.12329L2.04692 3.12577L2.65911 3.73796L2.66161 3.73967L2.66458 3.74027L2.66754 3.73967L2.67004 3.73796ZM11.279 14.9932C11.279 15.051 11.2677 15.1083 11.2455 15.1618C11.2234 15.2152 11.191 15.2638 11.1501 15.3047C11.1092 15.3456 11.0606 15.3781 11.0072 15.4002C10.9537 15.4223 10.8964 15.4336 10.8386 15.4336H1.18642C1.06963 15.4336 0.957632 15.3872 0.875057 15.3046C0.792482 15.222 0.746094 15.11 0.746094 14.9932C0.746094 14.8764 0.792482 14.7644 0.875057 14.6818C0.957632 14.5992 1.06963 14.5528 1.18642 14.5528H4.84238C4.70026 14.4411 4.55268 14.3404 4.42384 14.2108C2.66536 12.4523 2.66536 9.60061 4.42384 7.84057C4.43477 7.82963 4.44727 7.82339 4.45976 7.81245C4.23644 7.4845 4.17397 7.09016 4.28407 6.72238L2.95193 5.38868C2.7869 5.2233 2.69421 4.9992 2.69421 4.76556C2.69421 4.53192 2.7869 4.30782 2.95193 4.14244L4.75492 2.33788C4.92033 2.1729 5.14442 2.08025 5.37804 2.08025C5.61167 2.08025 5.83576 2.1729 6.00117 2.33788L11.0299 7.36659C11.1949 7.532 11.2875 7.75608 11.2875 7.98971C11.2875 8.22333 11.1949 8.44742 11.0299 8.61283L9.22297 10.4158C9.05756 10.5808 8.83347 10.6735 8.59985 10.6735C8.36623 10.6735 8.14214 10.5808 7.97673 10.4158L5.8856 8.32469C5.76379 8.36061 5.64041 8.39653 5.51469 8.39653C5.4085 8.39653 5.30542 8.36218 5.20079 8.33563C5.15082 8.38092 5.09303 8.41527 5.04462 8.46369C3.63127 9.87703 3.63127 12.1743 5.04462 13.5877C5.52836 14.0708 6.1401 14.4057 6.80779 14.5528H10.8386C10.9553 14.5529 11.0672 14.5994 11.1498 14.682C11.2324 14.7645 11.2788 14.8764 11.279 14.9932ZM5.81532 6.79266C5.73589 6.71291 5.62803 6.66798 5.51547 6.66772C5.45982 6.66758 5.40469 6.67857 5.35334 6.70002C5.30198 6.72147 5.25543 6.75297 5.21641 6.79266C5.15712 6.85196 5.11675 6.92751 5.10039 7.00976C5.08404 7.092 5.09244 7.17725 5.12454 7.25472C5.15663 7.33219 5.21098 7.39841 5.2807 7.445C5.35043 7.49158 5.4324 7.51645 5.51626 7.51645C5.60011 7.51645 5.68209 7.49158 5.75181 7.445C5.82154 7.39841 5.87588 7.33219 5.90798 7.25472C5.94007 7.17725 5.94847 7.092 5.93212 7.00976C5.91577 6.92751 5.87461 6.85196 5.81532 6.79266ZM4.82364 6.01649C5.03837 5.87984 5.27029 5.78692 5.51547 5.78692C5.68693 5.78678 5.85673 5.82052 6.01512 5.88618C6.17351 5.95184 6.31737 6.04813 6.43844 6.16954C6.88041 6.6115 6.91477 7.27991 6.59149 7.78434L8.59985 9.7927L10.4036 7.98893L5.37492 2.96022H5.37258L3.57037 4.764L4.82364 6.01649Z"
              fill="#666666"
              stroke="#666666"
              stroke-width="0.2"
            />
          </svg>
          <i18n-t keypath="Inference Analysis Report (Beta)" tag="p">
            <template #beta>
              <span>{{ $t('(Beta)') }}</span>
            </template>
          </i18n-t>
        </div>
        <div class="btn-wrapper">
          <a-tooltip :overlayInnerStyle="{ fontSize: '14px', lineHeight: '20px', fontFamily: 'Poppins-Regular' }">
            <template #title>{{ $t('Supports file upload (max 5 files, 20 MB each) Accepts pdf, doc, xlsx, txt, images, etc.') }}</template>
            <div
              class="adjunct-wrapper"
              :class="{ 'adjunct-wrapper-disable': fileList.length >= 5 }"
              @click="fileList.length < 5 ? triggerUpload() : null"
            >
              <img src="@/assets/image/icon/adjunct.svg" alt="" />
              <input
                class="hidden"
                ref="uploadFileRef"
                type="file"
                accept=".pdf,.doc,.docx,.xlsx,.csv,.txt,.jpg,.jpeg,.png,.bmp,.webp"
                @change="handleFileChange"
              />
            </div>
          </a-tooltip>
          <div class="line"></div>
          <div
            class="search-btn"
            :class="{ 'opacity-10 hover:!bg-[#000]': uploadFileLoading }"
            v-if="searchStatus === 'canBeSent'"
            @click="sendMessage"
          >
            <img src="@/assets/image/icon/arrowUp-fff.svg" alt="" />
          </div>
          <div class="search-btn" v-if="searchStatus === 'notSent'" @click="startRecording">
            <img src="@/assets/image/icon/voice.svg" alt="" />
          </div>
          <div class="recording-loading" v-if="isRecording || recordedBlob">
            <div class="recording-content">
              <div class="recording-def"></div>
              <div class="recording-active" :style="{ width: recordingProgress + '%' }"></div>
            </div>
            <div class="duration">
              {{ formatTime(recordingTime) }}
            </div>
            <div class="del" @click="delAudio">
              <svg width="13" height="15" viewBox="0 0 13 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M1.63542 3.26043H0.96875C0.836142 3.26043 0.708965 3.20625 0.615197 3.1098C0.521429 3.01336 0.46875 2.88255 0.46875 2.74615C0.46875 2.60975 0.521429 2.47894 0.615197 2.38249C0.708965 2.28605 0.836142 2.23186 0.96875 2.23186H11.9688C12.1014 2.23186 12.2285 2.28605 12.3223 2.38249C12.4161 2.47894 12.4688 2.60975 12.4688 2.74615C12.4688 2.88255 12.4161 3.01336 12.3223 3.1098C12.2285 3.20625 12.1014 3.26043 11.9688 3.26043H2.63542V12.3461C2.63542 12.4587 2.65697 12.5702 2.69885 12.6742C2.74073 12.7782 2.80211 12.8726 2.87949 12.9522C2.95688 13.0318 3.04874 13.095 3.14985 13.138C3.25095 13.1811 3.35932 13.2033 3.46875 13.2033H9.46875C9.57819 13.2033 9.68655 13.1811 9.78765 13.138C9.88876 13.095 9.98062 13.0318 10.058 12.9522C10.1354 12.8726 10.1968 12.7782 10.2386 12.6742C10.2805 12.5702 10.3021 12.4587 10.3021 12.3461V4.80329C10.3021 4.66689 10.3548 4.53608 10.4485 4.43964C10.5423 4.34319 10.6695 4.28901 10.8021 4.28901C10.9347 4.28901 11.0619 4.34319 11.1556 4.43964C11.2494 4.53608 11.3021 4.66689 11.3021 4.80329V12.3461C11.3021 13.3876 10.4812 14.2319 9.46875 14.2319H3.46875C2.45625 14.2319 1.63542 13.3876 1.63542 12.3461V3.26043ZM5.13542 1.54615C5.00281 1.54615 4.87563 1.49197 4.78186 1.39552C4.6881 1.29907 4.63542 1.16826 4.63542 1.03186C4.63542 0.895467 4.6881 0.764656 4.78186 0.668209C4.87563 0.571762 5.00281 0.517578 5.13542 0.517578H7.80208C7.93469 0.517578 8.06187 0.571762 8.15564 0.668209C8.2494 0.764656 8.30208 0.895467 8.30208 1.03186C8.30208 1.16826 8.2494 1.29907 8.15564 1.39552C8.06187 1.49197 7.93469 1.54615 7.80208 1.54615H5.13542ZM4.63542 6.17472C4.63542 6.03832 4.6881 5.90751 4.78186 5.81107C4.87563 5.71462 5.00281 5.66044 5.13542 5.66043C5.26802 5.66043 5.3952 5.71462 5.48897 5.81107C5.58274 5.90751 5.63542 6.03832 5.63542 6.17472V10.289C5.63542 10.4254 5.58274 10.5562 5.48897 10.6527C5.3952 10.7491 5.26802 10.8033 5.13542 10.8033C5.00281 10.8033 4.87563 10.7491 4.78186 10.6527C4.6881 10.5562 4.63542 10.4254 4.63542 10.289V6.17472ZM7.30208 6.17472C7.30208 6.03832 7.35476 5.90751 7.44853 5.81107C7.5423 5.71462 7.66947 5.66044 7.80208 5.66043C7.93469 5.66043 8.06187 5.71462 8.15564 5.81107C8.2494 5.90751 8.30208 6.03832 8.30208 6.17472V10.289C8.30208 10.4254 8.2494 10.5562 8.15564 10.6527C8.06187 10.7491 7.93469 10.8033 7.80208 10.8033C7.66947 10.8033 7.5423 10.7491 7.44853 10.6527C7.35476 10.5562 7.30208 10.4254 7.30208 10.289V6.17472Z"
                  fill="black"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="history-wrapper" v-if="historyVisible">
      <div class="recent-wrapper">
        <div class="top">
          <p class="poppins-bold">Recent Searches</p>
          <!-- <img class="del" src="@/assets/image/chatHome/delete.svg" alt="" /> -->
        </div>
        <div
          v-for="(item, index) in showAll ? historyList.slice(0, 6) : historyList.slice(0, 3)"
          :key="index"
          class="history-list-item"
          @click="sendHistory(item.text)"
          :class="`${historyList.length > 3 && !showAll ? '' : 'history-list-item-mb-20'}`"
        >
          <img src="@/assets/image/history-list-icon.svg" alt="" />
          <p class="poppins-regular">{{ item.text ? item.text : 'New conversation started' }}</p>
        </div>
        <div class="showMore-wrapper" v-if="historyList.length > 3 && !showAll" @click.stop="toggleShowAll">
          <p>Show More</p>
          <img class="img" src="@/assets/image/showMore-icon.png" alt="" />
          <img class="hover-img" src="@/assets/image/showMore-hover-icon.png" alt="" />
        </div>
      </div>
      <div class="recommended-wrapper" v-if="hotList && hotList.length">
        <p class="title poppins-bold">{{ $t('Recommended') }}</p>
        <div
          v-for="(item, index) in hotList"
          :key="index"
          class="recommended-list-item"
          @click="sendHistory(item.meta ? (locale === 'en_US' ? item.meta.en : locale === 'zh_CN' ? item.meta.zh : item.meta.ja) : item.name)"
        >
          <img src="@/assets/image/search-black.svg" alt="" />
          <p class="poppins-regular">
            {{ item.meta ? (locale === 'en_US' ? item.meta.en : locale === 'zh_CN' ? item.meta.zh : item.meta.ja) : item.name }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.search-wrapper {
  width: 100%;
  max-width: 80rem;
  border-radius: 3rem;
  border: 1rem solid transparent;
  &:hover {
    border: 1rem solid #e6f3ff;
  }
  .search-content {
    border: 1px solid #eaeaea;
    border-radius: 20px;
    overflow: hidden;
    padding: 16px 14px 10px 16px;
    background: #f8f8fa;
    position: relative;
    .input-textarea {
      display: block;
      width: 100%;
      height: 50px;
      min-height: 50px;
      max-height: 100px;
      resize: none;
      font-size: 16px;
      line-height: 22px;
      border: none;
      outline: none;
      background: #f8f8fa;
      &::-webkit-scrollbar {
        display: none;
      }
      &::placeholder {
        font-family: 'Poppins-Regular';
        color: #aaaaaa;
      }
    }
    .search-footer {
      display: flex;
      justify-content: space-between;
      .model {
        display: flex;
        align-items: center;
        gap: 6px;
        img {
          width: 12px;
          height: 12px;
        }
        p {
          font-size: 14px;
          line-height: 22px;
        }
      }
      .deep-wrapper {
        display: flex;
        align-items: center;
        padding: 9px 10px;
        border: 1px solid #ddd;
        border-radius: 22px;
        margin-left: 10px;
        font-size: 13px;
        line-height: 14px;
        color: #666;
        gap: 6px;
        cursor: pointer;
        svg {
          width: 14px;
          height: 16px;
          display: block;
        }
        span {
          color: #aaa;
        }
        &:hover {
          background: #eeeeee;
        }
      }

      .deep-wrapper-active {
        border: 1px solid #cde7ff;
        color: #0284fa;
        background-color: #e6f3ff;
        svg {
          width: 14px;
          height: 16px;
          display: block;
        }
        svg path {
          fill: #0284fa;
        }
        span {
          color: #0284fa;
        }
      }
      .btn-wrapper {
        display: flex;
        align-items: center;
        margin-left: auto;
        .line {
          width: 1px;
          height: 18px;
          background-color: #d9d9d9;
          margin: 0 15px 0 6px;
        }
        .adjunct-wrapper {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          img {
            display: block;
          }
          &:hover {
            background-color: #eee;
          }
        }
        .adjunct-wrapper-disable {
          opacity: 0.5;
          &:hover {
            background-color: #f8f8fa;
          }
        }
        .search-btn {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #000;
          cursor: pointer;
          &:hover {
            background-color: #444;
          }
          img {
            display: block;
          }
        }
      }
    }

    .recording-loading {
      position: absolute;
      top: 16px;
      left: 16px;
      width: calc(100% - 30px);
      background-color: #f8f8fa;
      display: flex;
      align-items: center;
      .recording-content {
        flex: 1;
        position: relative;
        .recording-def {
          width: 100%;
          height: 24px;
          background-image: url('@/assets/image/icon/recording.svg');
          background-repeat: no-repeat;
        }
        .recording-active {
          position: absolute;
          left: 0;
          top: 0;
          max-width: 100%;
          height: 24px;
          overflow-x: hidden;
          background-image: url('@/assets/image/icon/recording-active.svg');
          background-repeat: no-repeat;
        }
      }
      .duration {
        margin: 0 14px 0 20px;
        font-size: 14px;
        width: 40px;
        font-family: 'Poppins-Regular';
      }
      .del {
        cursor: pointer;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        svg {
          display: block;
          width: 14px;
          height: 16px;
        }
        &:hover {
          background-color: #eeeeee;
        }
      }
    }
  }
}
</style>
