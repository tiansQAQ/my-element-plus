<template>
  <div ref="formItemRef" :class="formItemClasses">
    <slot />
  </div>
</template>

<script>
const formItemValidateStates = ['', 'error', 'validating', 'success']
</script>
<script setup>
import { useSlots, inject, ref, computed, reactive, onMounted, onBeforeUnmount, watch, provide, toRefs } from 'vue'
import { formContextKey, formItemContextKey } from './constants'
import { useNamespace, useFormSize, useId } from '@/hooks'
import { componentSizes } from '@/constants'
import { refDebounced } from '@vueuse/core'
import { addUnit, ensureArray, getProp } from '@/utils'
defineOptions({ name: 'ElFormItem' })

const props = defineProps({
  // model 的键名。 它可以是一个路径数组(例如 ['a', 'b', 0])。 在定义了 validate、resetFields 的方法时，该属性是必填的
  prop: {
    type: [String, Array]
  },
  // 标签文本
  label: String,
  // 标签宽度，例如 '50px'。 可以使用 auto。
  labelWidth: {
    type: [String, Number],
    default: ''
  },
  // 	是否为必填项，如不设置，则会根据校验规则确认
  required: {
    type: Boolean,
    default: undefined
  },
  // 表单验证规则,更多内容可以参考async-validator
  rules: {
    type: [Object, Array]
  },
  // 表单域验证错误时的提示信息。设置该值会导致表单验证状态变为 error，并显示该错误信息。
  error: String,
  // 是否显示校验错误信息
  showMessage: {
    type: Boolean,
    default: true
  },
  // 是否在行内显示校验信息
  inlineMessage: {
    type: [String, Boolean],
    default: ''
  },
  // 用于控制该表单域下组件的默认尺寸
  size: {
    type: String,
    validator(value) {
      return componentSizes.includes(value)
    },
    default: ''
  },
  // 和原生标签相同能力
  for: String,
  // formitem 校验的状态
  validateStatus: {
    validator(value) {
      return formItemValidateStates.includes(value)
    },
    default: ''
  }
})
const ns = useNamespace('form-item')
const slots = useSlots()
const formContext = inject(formContextKey, undefined)

// 父FormItem
const parentFormItemContext = inject(formItemContextKey, undefined)

// 是否是嵌套
const isNested = !!parentFormItemContext

// TODO
const _size = useFormSize(undefined, { formItem: false })

// useId() 生成挺麻烦,不建议使用
const labelId = useId().value
// console.log('labelId: ', labelId)

const inputIds = ref([])

const validateState = ref('')
const validateStateDebounced = refDebounced(validateState, 100)
const validateMessage = ref('')

const formItemRef = ref()

// special inline value.
let initialValue = undefined
let isResettingField = false

const labelStyle = computed(() => {
  if (formContext?.labelPosition === 'top') {
    return {}
  }
  const labelWidth = addUnit(props.labelWidth || formContext?.labelWidth || '')
  if (labelWidth) return { width: labelWidth }
  return {}
})

const contentStyle = computed(() => {})

/**
 * size
 * error
 * validating
 * success
 * required
 * no-asterisk
 */
const formItemClasses = computed(() => [
  ns.b(),
  ns.m(_size.value),
  ns.is('error', validateState.value === 'error'),
  ns.is('validating', validateState.value === 'validating'),
  ns.is('success', validateState.value === 'success')
  // ns.is('required', isRequired.value || props.required)
])

const _inlineMessage = computed(() => {})

const validateClasses = computed(() => {})

const propString = computed(() => {})

const hasLabel = computed(() => {})

const labelFor = computed(() => {})

const isGroup = computed(() => {})

const fieldValue = computed(() => {})

// rules
const normalizedRules = computed(() => {
  // 获取required 属性
  // const { required } = props
  const rules = []
  // formItem Rules 如果有表单验证规则	object array
  if (props.rules) {
    rules.push(...ensureArray(props.rules))
  }
  // formRules
  const formRules = formContext?.rules

  if (formRules && props.prop) {
    const _rules = getProp(formRules, props.prop).v
    if (_rules) {
      rules.push(...ensureArray(_rules))
    }
  }
})

const validateEnabled = computed(() => {})

const getFilteredRule = (trigger) => {}

const isRequired = computed(() => {})

const shouldShowError = computed({})

const currentLabel = computed({})

// 设置validateState状态
const setValidationState = (state) => {
  validateState.value = state
}

const onValidationFailed = (error) => {}

const onValidationSucceeded = () => {}

const doValidate = async (rules) => {}

const validate = async (trigger, callback) => {}

const clearValidate = () => {}

const resetField = async () => {}

const addInputId = (id) => {}

const removeInputId = (id) => {}

watch(
  () => props.error,
  (val) => {},
  { immediate: true }
)

watch(
  () => props.validateStatus,
  (val) => setValidationState(val || '')
)

const context = reactive({ ...toRefs(props), $el: formItemRef, size: _size })

provide(formItemContextKey, context)

onMounted(() => {})

onBeforeUnmount(() => {})

defineExpose({})
</script>
