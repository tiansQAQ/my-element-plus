<template>
  <div v-if="isAutoWidth" ref="el" :class="[ns.be('item', 'label-wrap')]" :style="formLabelWrapStyle">
    <slot />
  </div>
  <Fragment v-else ref="el">
    <slot />
  </Fragment>
</template>

<script setup>
import { toRefs, inject, onMounted, computed, nextTick, useSlots } from 'vue'
import { formContextKey, formItemContextKey } from './constants'
import { useNamespace } from '@/hooks'
import { getStyle } from '@/utils'
import { useResizeObserver } from '@vueuse/core'

const COMPONENT_NAME = 'ElLabelWrap'
defineOptions({ name: COMPONENT_NAME })
const props = defineProps({ isAutoWidth: Boolean, updateAll: Boolean })

const ns = useNamespace('form')

const formContext = inject(formContextKey, undefined)
const formItemContext = inject(formItemContextKey)
if (!formItemContext) throwError(COMPONENT_NAME, 'usage: <el-form-item><label-wrap /></el-form-item>')

const slots = useSlots()

const el = ref()

const computedWidth = ref(0)

const getLabelWidth = () => {
  if (el.value?.firstElementChild) {
    const width = getStyle(el.value.firstElementChild, 'width')
    return Math.ceil(Number.parseFloat(width))
  } else {
    return 0
  }
}

const updateLabelWidth = async (action) => {
  await nextTick()
  if (slots.default && props.isAutoWidth) {
    if (action === 'update') {
      computedWidth.value = getLabelWidth()
    } else if (action === 'remove') {
      formContext?.deregisterLabelWidth(computedWidth.value)
    }
  }
}

const updateLabelWidthFn = () => updateLabelWidth('update')

onMounted(() => {
  updateLabelWidthFn()
})

onBeforeUnmount(() => updateLabelWidth('remove'))

onUpdated(() => updateLabelWidthFn())

// 处理 labelWidth:auto
watch(computedWidth, (val, oldVal) => {
  if (props.updateAll) {
    formContext?.registerLabelWidth(val, oldVal)
  }
})

useResizeObserver(
  computed(() => el.value?.firstElementChild ?? null),
  updateLabelWidthFn
)

const formLabelWrapStyle = computed(() => {
  const autoLabelWidth = formContext?.autoLabelWidth
  const hasLabel = formItemContext?.hasLabel
  const style = {}
  if (hasLabel && autoLabelWidth && autoLabelWidth !== 'auto') {
    const marginWidth = Math.max(0, Number.parseInt(autoLabelWidth, 10) - computedWidth.value)
  }
  const marginPosition = formContext.labelPosition === 'left' ? 'marginRight' : 'marginLeft'

  if (marginWidth) {
    style[marginPosition] = `${marginWidth}px`
  }
  return style
})
</script>
