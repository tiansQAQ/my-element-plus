import { computed } from 'vue'
import { buttonGroupContextKey } from './constants'

export const useButton = (props, emit) => {
  // TODO: buttonGroupContext && buttonGroupContext.type
  const _type = computed(() => props.type || '')

  //  TODO
  // : _disabled.value || props.loading,
  // disabled: _disabled.value || props.loading,
  const _props = computed(() => {
    if (props.tag === 'button') {
      return {
        ariaDisabled: props.disabled || props.loading,
        disabled: props.disabled || props.loading,
        autofocus: props.autofocus,
        type: props.nativeType
      }
    }
    return {}
  })

  // const _size = useFormSize(computed(() => buttonGroupContextKey && buttonGroupContext.size))
  const _size = props.size
  return {
    _type,
    _props,
    _size
  }
}
