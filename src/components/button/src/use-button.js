import { computed, ref } from 'vue'
import { buttonGroupContextKey } from './constants'

export const useButton = (props, emit) => {
  // TODO: buttonGroupContext && buttonGroupContext.type
  const _type = computed(() => props.type || '')

  const _ref = ref()
  const _disabled = props.disabled || props.loading
  //  TODO
  // : _disabled.value || props.loading,
  // disabled: _disabled.value || props.loading,
  const _props = computed(() => {
    if (props.tag === 'button') {
      return {
        ariaDisabled: props.disabled || props.loading,
        disabled: _disabled,
        autofocus: props.autofocus,
        type: props.nativeType
      }
    }
    return {}
  })

  // const _size = useFormSize(computed(() => buttonGroupContextKey && buttonGroupContext.size))
  const _size = props.size

  const handleClick = (evt) => {
    // TODO
    // if (props.nativeType === 'reset') {
    //   form?.resetFields()
    // }
    emit('click', evt)
  }

  return {
    _ref,
    _type,
    _props,
    _size,
    _disabled,
    handleClick
  }
}
