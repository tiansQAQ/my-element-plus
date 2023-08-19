<template>
  <form :class="formClasses">
    <slot />
  </form>
</template>

<script setup>
import { computed, toRefs, watch, provide, reactive } from 'vue'
import { componentSizes } from '@/constants'
import { useNamespace } from '@/hooks'
import { filterFields, useFormLabelWidth } from './utils'
import { formContextKey } from './constants'
import { isBoolean, isString } from '@/utils'
const COMPONENT_NAME = 'ElForm'
defineOptions({ name: COMPONENT_NAME })
const ns = useNamespace('form')
const props = defineProps({
  // 表单数据对象
  model: Object,
  rules: {
    type: Object
  },
  // 行内表单模式
  inline: Boolean,
  // 表单域标签的位置， 当设置为 left 或 right 时，则也需要设置 label-width 属性
  labelPosition: {
    type: String,
    validator(value) {
      return ['left', 'right', 'top'].includes(value)
    },
    default: 'right'
  },
  // 标签的长度，例如 '50px'。 作为 Form 直接子元素的 form-item 会继承该值。 可以使用 auto。
  labelWidth: {
    type: [String, Number],
    default: ''
  },
  // 表单域标签的后缀
  labelSuffix: {
    type: String,
    default: ''
  },
  // 是否隐藏必填字段标签旁边的红色星号。
  hideRequiredAsterisk: Boolean,
  // 星号的位置。
  requireAsteriskPosition: {
    type: String,
    validator(value) {
      return ['left', 'right'].includes(value)
    },
    default: 'left'
  },
  // 是否显示校验错误信息
  showMessage: {
    type: Boolean,
    default: true
  },
  // 是否以行内形式展示校验信息
  inlineMessage: Boolean,
  // 是否在输入框中显示校验结果反馈图标
  statusIcon: Boolean,
  // 是否在 rules 属性改变后立即触发一次验证
  validateOnRuleChange: {
    type: Boolean,
    default: true
  },
  // 用于控制该表单内组件的尺寸
  size: {
    type: String,
    validator(value) {
      return componentSizes.includes(value)
    },
    default: ''
  },
  // 是否禁用该表单内的所有组件。 如果设置为 true, 它将覆盖内部组件的 disabled 属性
  disabled: Boolean,
  // 当校验失败时，滚动到第一个错误表单项
  scrollToError: Boolean,
  // 当校验有失败结果时，滚动到第一个失败的表单项目 可通过 scrollIntoView 配置
  scrollIntoViewOptions: {
    type: [Object, Boolean]
  }
})
const emit = defineEmits({
  validate: (prop, isValid, message) => (Array.isArray(prop) || isString(prop)) && isBoolean(isValid) && isString(message)
})
// 属性列表
const fields = []

// 绑定class
const formClasses = computed(() => {
  const { labelPosition, inline } = props
  // todo: in v2.2.0, we can remove default
  // in fact, remove it doesn't affect the final style
  // ns.m(formSize.value || 'default'),
  return [ns.b(), { [ns.m(`label-${labelPosition}`)]: labelPosition, [ns.m('inline')]: inline }]
})

// 添加属性
const addField = (field) => fields.push(field)

// 删除属性
const removeField = (field) => {
  if (field.prop) {
    fields.splice(fields.indexOf(field), 1)
  }
}
// 重置属性
const resetFields = (properties = []) => {
  if (!props.model) {
    debugWarn(COMPONENT_NAME, 'model is required for resetFields to work.')
    return
  }
  filterFields(fields, properties).forEach((field) => field.resetField())
}

// 清除验证
const clearValidate = (props = []) => {
  filterFields(fields, props).forEach((field) => field.clearValidate())
}

const isValidatable = computed(() => {
  const hasModel = !!props.model
  if (!hasModel) {
    debugWarn(COMPONENT_NAME, 'model is required for validate to work.')
  }
  return hasModel
})

const obtainValidateFields = (props) => {
  if (fields.length === 0) return []

  const filteredFields = filterFields(fields, props)
  if (!filteredFields.length) {
    debugWarn(COMPONENT_NAME, 'please pass correct props!')
    return []
  }
  return filteredFields
}

const validate = async (callback) => validateField(undefined, callback)

const doValidateField = async (props = []) => {
  if (!isValidatable.value) return false
  const fields = obtainValidateFields(props)
  if (fields.length === 0) return true

  let validationErrors = {}
  for (const field of fields) {
    try {
      await field.validate('')
    } catch (fields) {
      validationErrors = { ...validationErrors, ...fields }
    }
  }
  if (Object.keys(validationErrors).length === 0) return true
  return Promise.reject(validationErrors)
}

const validateField = async (modelProps = [], callback) => {
  const shouldThrow = !isFunction(callback)
  try {
    const result = await doValidateField(modelProps)
    // When result is false meaning that the fields are not validatable
    if (result === true) {
      callback?.(result)
    }
    return result
  } catch (e) {
    if (e instanceof Error) throw e
    const invalidFields = e
    if (props.scrollToError) {
      scrollToField(Object.keys(invalidFields)[0])
    }
    callback?.(false, invalidFields)
    return shouldThrow && Promise.reject(invalidFields)
  }
}

const scrollToField = (prop) => {
  const field = filterFields(fields, prop)[0]
  if (field) {
    field.$el?.scrollIntoView(props.scrollIntoViewOptions)
  }
}

watch(
  () => props.rules,
  () => {
    if (props.validateOnRuleChange) {
      validate().catch((err) => debugWarn(err))
    }
  },
  { deep: true }
)

provide(
  formContextKey,
  reactive({
    ...toRefs(props),
    emit,
    resetFields,
    clearValidate,
    validateField,
    addField,
    removeField,
    ...useFormLabelWidth()
  })
)
</script>
