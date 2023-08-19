export * from './use-namespace'
import { useGetDerivedNamespace } from './use-namespace'
import { computed, inject, unref, getCurrentInstance, ref } from 'vue'
import { isClient } from '@vueuse/core'
import { formContextKey, formItemContextKey } from '../components/form/src/constants'
/** use-prop.js */

export const useProp = (name) => {
  // 获取当前组件实例
  const vm = getCurrentInstance()
  return computed(() => vm?.proxy?.$props?.[name])
}

/** use-form-common-props.ts */
// fallback?: MaybeRef<ComponentSize | undefined>,
// ignore: Partial<Record<'prop' | 'form' | 'formItem' | 'global', boolean>> = {}
export const useFormSize = (fallback, ignore = {}) => {
  const emptyRef = ref(undefined)
  //
  const size = ignore.prop ? emptyRef : useProp('size')

  // global
  const globalConfig = ignore.global ? emptyRef : useGlobalSize()
  // form
  const form = ignore.form ? { size: undefined } : inject(formContextKey, undefined)

  // formItem TODO inject到底formItemContextKey在做什么？
  const formItem = ignore.formItem ? { size: undefined } : inject(formItemContextKey, undefined)
  console.log(inject(formItemContextKey, undefined))

  return computed(() => size.value || unref(fallback) || formItem?.size || form?.size || globalConfig.value || '')
}

export const SIZE_INJECTION_KEY = Symbol('size')

export const useGlobalSize = () => {
  const injectedSize = inject(SIZE_INJECTION_KEY, {})
  return computed(() => {
    return unref(injectedSize.size) || ''
  })
}

/* use-id */

const defaultIdInjection = {
  prefix: Math.floor(Math.random() * 10000),
  current: 0
}
export const ID_INJECTION_KEY = Symbol('elIdInjection')

export const useIdInjection = () => {
  return getCurrentInstance() ? inject(ID_INJECTION_KEY, defaultIdInjection) : defaultIdInjection
}

export const useId = (deterministicId) => {
  const idInjection = useIdInjection()
  if (!isClient && idInjection === defaultIdInjection) {
    debugWarn(
      'IdInjection',
      `Looks like you are using server rendering, you must provide a id provider to ensure the hydration process to be succeed
usage: app.provide(ID_INJECTION_KEY, {
  prefix: number,
  current: number,
})`
    )
  }

  const namespace = useGetDerivedNamespace()
  const idRef = computed(() => unref(deterministicId) || `${namespace.value}-id-${idInjection.prefix}-${idInjection.current++}`)

  return idRef
}
