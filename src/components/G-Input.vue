<script setup lang="ts">
const props = defineProps({
  modelValue: [String, Number],
  valueType: { type: String, default: 'string' },
  placeholder: { type: String, default: 'Input' },
  type: { type: String, default: 'text' },
  showClear: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'customAction'])

const clearInput = () => {
  emit('update:modelValue', '')
}

// const handleCustomAction = () => {
//   emit('customAction')
// }

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value
  const emittedValue = props.valueType === 'number' ? parseFloat(value) || 0 : value
  emit('update:modelValue', emittedValue)
}
</script>

<template>
  <div class="input-container">
    <input :type="type" class="input-field" :placeholder="placeholder" :value="modelValue" @input="handleInput" :disabled="disabled" />
    <img v-if="showClear && modelValue" class="clear-btn" @click="clearInput" src="@/assets/image/close.png" alt="" />
    <slot> </slot>
    <!-- <slot name="custom-button">
      <button class="custom-btn" @click="handleCustomAction"></button>
    </slot> -->
  </div>
</template>

<style lang="less" scoped>
.input-container {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  border: 1px solid transparent;
  border-radius: 999px;
  background-color: #efefef;
  overflow: hidden;
  font-family: 'Poppins-Regular';
  box-sizing: border-box;
  &:hover {
    border-color: #000;
  }
  .input-field {
    flex: 1;
    border: none;
    outline: none;
    background-color: transparent;
    box-sizing: border-box;
    font-family: 'Poppins-Regular';
    &::placeholder {
      font-family: 'Poppins-Regular';
      color: #999;
    }
  }
  .clear-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 5px;
    font-size: 16px;
  }
}
</style>
