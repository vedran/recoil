const WRAPPERS_TO_RENDER = []

function useState(defaultVal) {
  const { curStateIndex, states, wrapper } = useState.stateInfo
  useState.stateInfo.curStateIndex += 1

  // Check if we've made this many calls to useState for this instance yet
  if (curStateIndex > states.length - 1) {
    useState.stateInfo.states.push(defaultVal)
  }

  return [
    states[curStateIndex],
    newVal => {
      states[curStateIndex] = newVal
      if (!WRAPPERS_TO_RENDER.find(w => w === wrapper)) {
        WRAPPERS_TO_RENDER.push(wrapper)
      }
    },
  ]
}

class Wrapper {
  constructor(renderFunc, props = { children: [] }, tagName = null) {
    this.renderFunc = renderFunc
    this.props = props

    this.curStateIndex = 0
    this.states = []
    this.tagName = tagName
  }

  render() {
    useState.stateInfo = {
      states: this.states,
      curStateIndex: 0,
      wrapper: this,
    }

    // Returns wrappers
    return this.renderFunc(this.props)
  }
}

function createElement(renderFuncOrString, props = {}, tagName = null) {
  if (typeof renderFuncOrString === 'string') {
    return new Wrapper(() => renderFuncOrString, props, null)
  }

  return new Wrapper(renderFuncOrString, props, tagName)
}

function createHtmlComponent({ children = [], tag, ...otherProps }) {
  return createElement(() => children, otherProps, tag)
}

function updateOrCreateDOM(wrapper) {
  // The result of a render call will either be a string or another wrapper
  var stringOrWrapper = wrapper.render()
  const childrenType = typeof stringOrWrapper

  var element =
    wrapper.element || document.createElement(wrapper.tagName || 'div')

  // Current element has an HTML tag
  const { onClick, ...attributeProps } = wrapper.props
  if (onClick) {
    element.onclick = onClick
  }

  Object.entries(attributeProps).map(([key, value]) => {
    element.setAttribute(key, value)
  })

  if (childrenType === 'string') {
    element.innerHTML = ''
    element.appendChild(document.createTextNode(stringOrWrapper))
  } else if (childrenType === 'object') {
    let childWrappers = Array.isArray(stringOrWrapper)
      ? stringOrWrapper
      : [stringOrWrapper]

    // Unmount and remount each time we render, for now
    element.innerHTML = ''
    childWrappers.map(child => element.appendChild(updateOrCreateDOM(child)))
  } else {
    throw Error(`Unknown component type: ${typeof stringOrWrapper}`)
  }

  wrapper.element = element
  return element
}

function CounterComponent() {
  const [count, setCount] = useState(0)

  return [
    createHtmlComponent({
      tag: 'div',
      style: 'border: 1px solid black; padding: 4px; margin: 16px 4px;',
      children: [
        createHtmlComponent({
          tag: 'div',
          children: `Count: ${count}`,
        }),
        createHtmlComponent({
          tag: 'button',
          onClick: () => setCount(count - 1),
          children: 'Subtract',
        }),
        createHtmlComponent({
          tag: 'button',
          onClick: () => setCount(count + 1),
          children: 'Add',
        }),
      ],
    }),
  ]
}

let app = createHtmlComponent({
  children: [createElement(CounterComponent), createElement(CounterComponent)],
  tag: 'div',
})

const rootElement = document.getElementById('recoil-root')
rootElement.innerHTML = ''
rootElement.appendChild(updateOrCreateDOM(app))

function eventLoop() {
  while (WRAPPERS_TO_RENDER.length > 0) {
    updateOrCreateDOM(WRAPPERS_TO_RENDER[0])
    WRAPPERS_TO_RENDER.shift()
  }
}

setInterval(eventLoop, 100)
