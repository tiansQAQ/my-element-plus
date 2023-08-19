import { isClient } from '@vueuse/core'
import { capitalize as toCapitalize, isString, camelize } from '@vue/shared'

export { isString } from '@vue/shared'

class ElementPlusError extends Error {
  constructor(m) {
    super(m)
    this.name = 'ElementPlusError'
  }
}

export function throwError(scope, m) {
  throw new ElementPlusError(`[${scope}] ${m}`)
}

/**
 * browser.js
 */

export const isFirefox = () => isClient && /firefox/i.test(window.navigator.userAgent)

/**
 * strings.js
 */

export const capitalize = (str) => toCapitalize(str)

/**
 * types.js
 */

export const isNumber = (val) => typeof val === 'number'

export const isBoolean = (val) => typeof val === 'boolean'

export const isStringNumber = (val) => {
  if (!isString(val)) {
    return false
  }
  return !Number.isNaN(Number(val))
}
/**
 * style.js
 */
const SCOPE = 'utils/dom/style'
export function addUnit(value, defaultUnit = 'px') {
  if (!value) return ''
  if (isNumber(value) || isStringNumber(value)) {
    return `${value}${defaultUnit}`
  } else if (isString(value)) {
    return value
  }
  // debugWarn(SCOPE, 'binding value must be a string or number')
}

export function getStyle(element, styleName) {
  if (!element || !styleName) return ''
  let key = camelize(styleName)
  if (key === 'float') key = 'cssFloat'
  try {
    const style = element.style[key]
    if (style) return style
    const computed = document.defaultView.getComputedStyle(element, '')
    return computed ? computed[key] : ''
  } catch (e) {
    return element.style[key]
  }
}

/**
 * scroll.js
 */

export function isScroll(el, isVertical) {
  if (!isClient) return false
  const key = { undefined: 'overflow', true: 'overflow-y', false: 'overflow-x' }[String(isVertical)]
  const overflow = getStyle(el, key)

  return ['scroll', 'auto', 'overlay'].some((s) => overflow.includes(s))
}

// 获取可滚动的容器
export function getScrollContainer(el, isVertical) {
  if (!isClient) return
  let parent = el
  while (parent) {
    if ([window, document, document.documentElement].includes(parent)) return window
    if (isScroll(parent, isVertical)) return parent
    parent = parent.parentNode
  }
  return parent
}

export const castArray = (arr) => {
  if (!arr && arr !== 0) return []
  return Array.isArray(arr) ? arr : [arr]
}

export const ensureArray = castArray

export function debugWarn(scope, message) {
  if (process.env.NODE_ENV !== 'production') {
    const error = isString(scope) ? new ElementPlusError(`[${scope}] ${message}`) : scope

    console.warn(error)
  }
}

export function getProp(obj, path, strict) {
  let tempObj = obj
  // 'a[b]'.replace(/\[(\w+)\]/g, '.$1') => 'a.b'
  path = path.replace(/\[(\w+)\]/g, '.$1')
  // 去掉path前面的第一个.
  path = path.replace(/^\./, '')
  // ['a', 'b']
  let keyArr = path.split('.')
  let i = 0
  for (let len = keyArr.length; i < len - 1; ++i) {
    if (!tempObj && !strict) break
    let key = keyArr[i]
    if (key in tempObj) {
      tempObj = tempObj[key]
    } else {
      // 如果keyArr的元素不在tempObj里面就会报错
      if (strict) {
        throw new Error('please transfer a valid prop path to form item!')
      }
      break
    }
  }
  return {
    o: tempObj,
    k: keyArr[i],
    v: tempObj ? tempObj[keyArr[i]] : null
  }
}
