import en_US from './en.ts'
import zh_CN from './zh.ts'
import ja_JP from './jp.ts'
import { createI18n } from 'vue-i18n'

const messages = {
  en_US,
  zh_CN,
  ja_JP
}

const i18n = createI18n({
  legacy: false,
  locale: 'en_US',
  fallbackLocale: 'zh_CN',
  messages
})

export default i18n
