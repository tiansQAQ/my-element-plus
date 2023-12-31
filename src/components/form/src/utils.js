import { ensureArray } from '@/utils'
import { computed, ref, unref } from 'vue'

export const filterFields = (fields, props) => {
  const normalized = ensureArray(props)
  return normalized.length > 0 ? fields.filter((field) => field.prop && normalized.includes(field.prop)) : fields
}

export function useFormLabelWidth() {
  const potentialLabelWidthArr = ref([])

  const autoLabelWidth = computed(() => {
    if (!potentialLabelWidthArr.value.length) return '0'
    const max = Math.max(...potentialLabelWidthArr.value)
    return max ? `${max}px` : ''
  })

  function getLabelWidthIndex(width) {
    const index = potentialLabelWidthArr.value.indexOf(width)
    if (index === -1 && autoLabelWidth.value === '0') {
      debugWarn(SCOPE, `unexpected width ${width}`)
    }
    return index
  }

  function registerLabelWidth(val, oldVal) {
    if (val && oldVal) {
      const index = getLabelWidthIndex(oldVal)
      potentialLabelWidthArr.value.splice(index, 1, val)
    } else if (val) {
      potentialLabelWidthArr.value.push(val)
    }
  }

  function deregisterLabelWidth(val) {
    const index = getLabelWidthIndex(val)
    if (index > -1) {
      potentialLabelWidthArr.value.splice(index, 1)
    }
  }

  return {
    autoLabelWidth,
    registerLabelWidth,
    deregisterLabelWidth
  }
}
