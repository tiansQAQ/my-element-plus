<!--水印-->
<template>
  <div ref="containerRef" v-bind="$attrs" :class="[ns.b(), rootClassName]" :style="[{ position: 'relative' }]">
    <slot />
  </div>
</template>

<script setup>
import { useNamespace } from '@/hooks'
import { computed, shallowRef, onMounted, watch, onBeforeUnmount } from 'vue'
import { useMutationObserver } from '@vueuse/core'
// 组件名
const COMPONENT_NAME = 'ElWatermark'

// TODO  inheritAttrs
defineOptions({ name: COMPONENT_NAME, inheritAttrs: false })

const ns = useNamespace('watermark')

const BaseSize = 2 // 基础尺寸
const FontGap = 3 // 高度间隙

/**
Watermark
 *  width: 水印的宽度，content 的默认值为自身的宽度  number	120
 *  height: 水印的高度，content 的默认值为自身的高度	number 64
    rotate: 水印绘制时，旋转的角度，单位 °	number  -22
    zIndex: 追加的水印元素的 z-index	number  9
    image: 图片源，建议导出 2 倍或 3 倍图，优先级高	    string
    content: 水印文字内容	    string | string[]
    font:	文字样式	    	Font	Font
    gap: 水印之间的间距         [number, number]	[100, 100]
    offset: 水印距离容器左上角的偏移量，默认为 gap/2	    [number, number]	[gap[0]/2, gap[1]/2]

Font
 *  color:  字体颜色		string	rgba(0,0,0,.15)
    fontSize:   字体大小	number	16
    fontWeight: 字体粗细	normal | light | weight | number	normal
 *  fontFamily: 字体类型		string	sans-serif
 *  fontStyle: 	字体样式	none | normal | italic | oblique	normal
 *
 */
const props = defineProps({
  /**共有属性 */
  // 水印的宽度，content 的默认值为自身的宽度
  width: Number,
  // 水印的高度，content 的默认值为自身的高度
  height: Number,
  // 水印绘制时，旋转的角度，单位 °
  rotate: {
    type: Number,
    default: -22
  },
  // 追加的水印元素的 z-index
  zIndex: {
    type: Number,
    default: 9
  },
  // 图片源，建议导出 2 倍或 3 倍图，优先级高
  image: String,
  // 水印文字内容
  content: [String, Array],
  // 水印之间的间距
  gap: {
    type: Array,
    default() {
      return [100, 100]
    }
  },
  // 水印距离容器左上角的偏移量，默认为 gap/2
  offset: {
    type: Array,
    default() {
      return []
    }
  },
  // 文字样式
  font: {
    type: Object,
    default() {
      return {}
    }
  },
  rootClassName: String

  /* TODO */
})

// watermark根元素ref
const containerRef = shallowRef()

// 水印ref
const watermarkRef = shallowRef()

// 是否停止监听
const stopObservation = shallowRef(false)

// 水印之间的X间距
const gapX = computed(() => props.gap?.[0] ?? 100)

// 水印之间的Y间距
const gapY = computed(() => props.gap?.[1] ?? 100)

// 水印之间的X间距的一半
const gapXCenter = computed(() => gapX.value / 2)

// 水印之间的Y间距的一半
const gapYCenter = computed(() => gapY.value / 2)

// 水印距离容器左上角left的偏移量
const offsetLeft = computed(() => props.offset?.[0] ?? gapXCenter.value)

// 水印距离容器左上角top的偏移量
const offsetTop = computed(() => props.offset?.[1] ?? gapYCenter.value)

// 设置fontSize
const fontSize = computed(() => props.font?.fontSize ?? 16)

// 设置fontWeight
const fontWeight = computed(() => props.font?.fontWeight ?? 'normal')

// 设置fontStyle
const fontStyle = computed(() => props.font?.fontStyle ?? 'normal')

// 设置fontFamily
const fontFamily = computed(() => props.font?.fontFamily ?? 'sans-serif')

// 设置color
const color = computed(() => props.font?.color ?? 'rgba(0, 0, 0, 0.15)')

// 水印 markStyle 对象
const markStyle = computed(() => {
  const markStyle = {
    zIndex: props.zIndex ?? 9,
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none', //  禁用鼠标事件
    backgroundRepeat: 'repeat'
  }

  let positionLeft = offsetLeft.value - gapXCenter.value
  let positionTop = offsetTop.value - gapYCenter.value
  if (positionLeft > 0) {
    markStyle.left = `${positionLeft}px`
    markStyle.width = `calc(100% - ${positionLeft}px)`
    positionLeft = 0
  }
  if (positionTop > 0) {
    markStyle.top = `${positionTop}px`
    markStyle.height = `calc(100% - ${positionTop}px)`
    positionTop = 0
  }
  markStyle.backgroundPosition = `${positionLeft}px ${positionTop}px`
  return markStyle
})

// 销毁水印元素
const destoryWaterMark = () => {
  if (watermarkRef.value) {
    watermarkRef.value.remove()
    watermarkRef.value = undefined
  }
}

// 手动添加水印元素
const appendWatermark = (base64Url, markWidth) => {
  if (containerRef.value && watermarkRef.value) {
    stopObservation.value = true
    watermarkRef.value.setAttribute(
      'style',
      getStyleStr({
        ...markStyle.value,
        backgroundImage: `url('${base64Url}')`,
        backgroundSize: `${(gapX.value + markWidth) * BaseSize}px`
      })
    )

    containerRef.value?.append(watermarkRef.value)
    // 延迟执行
    setTimeout(() => {
      stopObservation.value = false
    })
  }
}

// 获取水印的宽度和高度。默认值: image：[120,64]；content：按内容计算；
const getMarkSize = (ctx) => {
  let defaultWidth = 120
  let defaultHeight = 64
  const content = props.content
  const image = props.image
  const width = props.width
  const height = props.height
  // props.image不存在 && 存在获取文本长度ctx.measureText的方法
  if (!image && ctx.measureText) {
    ctx.font = `${Number(fontSize.value)}px ${fontFamily.value}`
    ctx.font = `${fontSize.value}px ${fontFamily.value}`
    const contents = Array.isArray(content) ? content : [content]
    // 找出contents最长文本的宽度
    const widths = contents.map((item) => ctx.measureText(item).width)
    defaultWidth = Math.ceil(Math.max(...widths))
    // 字体大小 * 数组长度 + ((数组长度 -1) * 高度间隙)
    defaultHeight = Number(fontSize.value) * contents.length + (contents.length - 1) * FontGap
  }
  return [width ?? defaultWidth, height ?? defaultHeight]
}

// 绘制填充文本
const fillTexts = (ctx, drawX, drawY, drawWidth, drawHeight) => {
  const ratio = window.devicePixelRatio || 1
  // 文字内容
  const content = props.content
  // merged font-size
  const mergedFontSize = Number(fontSize.value) * ratio
  // font-style,font-variant,font-weight,font-size/line-height,font-family
  ctx.font = `${fontStyle.value} normal ${fontWeight.value} ${mergedFontSize}px/${drawHeight}px ${fontFamily.value}`
  // 填充样式
  ctx.fillStyle = color.value

  // 指定文本对齐方式
  ctx.textAlign = 'center'

  // 文本对齐的基线
  ctx.textBaseline = 'top'
  // 位移
  ctx.translate(drawWidth / 2, 0)

  const contents = Array.isArray(content) ? content : [content]
  contents?.forEach((item, index) => {
    // 用来填充的文本信息,填充文本的起点横坐标,填充文本的起点纵坐标
    ctx.fillText(item ?? '', drawX, drawY + index * (mergedFontSize + FontGap * ratio))
  })
}

// 渲染水印
const renderWatermark = () => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const image = props.image
  const rotate = props.rotate ?? -22

  if (!ctx) return

  if (!watermarkRef.value) {
    watermarkRef.value = document.createElement('div')
  }

  const ratio = window.devicePixelRatio || 1

  const [markWidth, markHeight] = getMarkSize(ctx)

  // canvas宽度 = 间距 + 宽度
  const canvasWidth = (gapX.value + markWidth) * ratio

  // canvas高度 = 间距 + 高度
  const canvasHeight = (gapY.value + markHeight) * ratio

  // TODO
  canvas.setAttribute('width', `${canvasWidth * BaseSize}px`)
  canvas.setAttribute('height', `${canvasHeight * BaseSize}px`)

  // 填充文本的起点横坐标: 间距的一半
  const drawX = gapX.value / 2

  // 填充文本的起点纵坐标: 间距的一半
  const drawY = gapY.value / 2

  // draw width
  const drawWidth = markWidth * ratio

  // draw height
  const drawHeight = markHeight * ratio

  const rotateX = (drawWidth + gapX.value * ratio) / 2

  const rotateY = (drawHeight + gapY.value * ratio) / 2

  // 备用图形参数 TODO
  const alternateDrawX = drawX + canvasWidth
  const alternateDrawY = drawY + canvasHeight
  const alternateRotateX = rotateX + canvasWidth
  const alternateRotateY = rotateY + canvasHeight
  ctx.save()
  rotateWatermark(ctx, rotateX, rotateY, rotate)

  // 如果是图片
  if (image) {
    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
      // 旋转后绘制交错图片 TODO
      ctx.restore()
      rotateWatermark(ctx, alternateRotateX, alternateRotateY, rotate)
      ctx.drawImage(img, alternateDrawX, alternateDrawY, drawWidth, drawHeight)
      // https://www.canvasapi.cn/HTMLCanvasElement/toDataURL#&syntax
      appendWatermark(canvas.toDataURL(), markWidth)
    }
    img.crossOrigin = 'anonymous' // TODO
    img.referrerPolicy = 'no-referrer'
    img.src = image
  } else {
    fillTexts(ctx, drawX, drawY, drawWidth, drawHeight)
    /** 旋转后填充交错文本 */
    ctx.restore()
    rotateWatermark(ctx, alternateRotateX, alternateRotateY, rotate)
    fillTexts(ctx, alternateDrawX, alternateDrawY, drawWidth, drawHeight)
    appendWatermark(canvas.toDataURL(), markWidth)
  }
}

// Canvas元素内容以Canvas画布的中心点为变换点进行旋转 https://www.canvasapi.cn/CanvasRenderingContext2D/translate#&examples
const rotateWatermark = (ctx, rotateX, rotateY, rotate) => {
  ctx.translate(rotateX, rotateY)
  ctx.rotate((Math.PI / 180) * Number(rotate))
  ctx.translate(-rotateX, -rotateY)
}
onMounted(() => {
  renderWatermark()
})

watch(
  () => props,
  () => {
    renderWatermark()
  },
  {
    deep: true,
    flush: 'post'
  }
)

onBeforeUnmount(() => {
  destroyWatermark()
})

// MutationObserver callback
const onMutate = (mutations) => {
  if (stopObservation.value) {
    return
  }
  mutations.forEach((mutation) => {
    if (reRendering(mutation, watermarkRef.value)) {
      destroyWatermark()
      renderWatermark()
    }
  })
}

// MutationObserver
useMutationObserver(containerRef, onMutate, { attributes: true })

function toLowercaseSeparator(key) {
  return key.replace(/([A-Z])/g, '-$1').toLowerCase()
}

function getStyleStr(style) {
  return Object.keys(style)
    .map((key) => `${toLowercaseSeparator(key)}: ${style[key]};`)
    .join(' ')
}
/** Whether to re-render the watermark */
// https://www.51cto.com/article/753082.html
function reRendering(mutation, watermarkElement) {
  let flag = false
  // Whether to delete the watermark node
  // 是否删除水印节点
  if (mutation.removedNodes.length) {
    flag = Array.from(mutation.removedNodes).some((node) => node === watermarkElement)
  }
  // Whether the watermark dom property value has been modified
  // 水印dom属性值是否已修改
  if (mutation.type === 'attributes' && mutation.target === watermarkElement) {
    flag = true
  }
  return flag
}
</script>
