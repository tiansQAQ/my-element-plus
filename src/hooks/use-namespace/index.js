/**
 * CSS BEM
 */
import { computed, inject, unref, getCurrentInstance, ref } from 'vue'

export const defaultNamespace = 'el'
const statePrefix = 'is-'
/**
 *
 * @param {*} namespace string 命名空间
 * @param {*} block string 块
 * @param {*} blockSuffix string 块后缀
 * @param {*} element string 元素
 * @param {*} modifier string  修饰符
 */
const _bem = (namespace, block, blockSuffix, element, modifier) => {
  let cls = `${namespace}-${block}` // el-tree
  if (blockSuffix) {
    cls += `-${blockSuffix}` // el-tree-node
  }
  if (element) {
    cls += `__${element}` // el-tree-node__content
  }
  if (modifier) {
    cls += `--${modifier}` // el-tree--success
  }
  return cls
}

// https://element-plus.org/zh-CN/guide/namespace.html 自定义命名空间
export const namespaceContextKey = Symbol('namespaceContextKey')

/**
 * TODO
 * @param {*} namespaceOverrides  Ref<string | undefined>
 */
export const useGetDerivedNamespace = (namespaceOverrides) => {
  const derivedNamespace = namespaceOverrides || (getCurrentInstance() ? inject(namespaceContextKey, ref(defaultNamespace)) : ref(defaultNamespace))
  const namespace = computed(() => {
    return unref(derivedNamespace) || defaultNamespace
  })
  return namespace
}

/**
 *
 * @param {*} block string 块
 * @param {*} namespaceOverrides  Ref<string | undefined>
 */
export const useNamespace = (block, namespaceOverrides) => {
  // const namespace = useGetDerivedNamespace(namespaceOverrides)
  const namespace = defaultNamespace // 默认命名空间
  // b() => el-tree
  const b = (blockSuffix = '') => _bem(namespace, block, blockSuffix, '', '')

  // e('content') => el-tree__content
  const e = (element) => (element ? _bem(namespace, block, '', element, '') : '')

  // m('success') => el-button--success
  const m = (modifier) => (modifier ? _bem(namespace, block, '', '', modifier) : '')

  //  m('node',content') => el-node__content
  const be = (blockSuffix, element) => (blockSuffix && element ? _bem(namespace.value, block, blockSuffix, element, '') : '')

  // em('content','success') => el-tree__content--success
  const em = (element, modifier) => (element && modifier ? _bem(namespace, block, '', element, modifier) : '')

  // bm('node','success') => el-tree-node--success
  const bm = (blockSuffix, modifier) => (blockSuffix && modifier ? _bem(namespace, block, blockSuffix, '', modifier) : '')

  // bm('node','content','success') => el-tree-node__content--success
  const bem = (blockSuffix, element, modifier) => (blockSuffix && element && modifier ? _bem(namespace, block, blockSuffix, element, modifier) : '')

  /**
   *
   * @param {*} name  string
   * @param  {...any} args
   * @returns  is(disabled) => is-disabled
   */
  const is = (name, ...args) => {
    const state = args.length >= 1 ? args[0] : true
    return name && state ? `${statePrefix}${name}` : ''
  }
  return {
    namespace,
    b,
    e,
    m,
    be,
    em,
    bm,
    bem,
    is
  }
}
