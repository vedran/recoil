var NEEDS_TO_RENDER = true

function useState(defaultVal) {
  NEEDS_TO_RENDER = true

  const { curStateIndex, states } = useState.stateInfo
  useState.stateInfo.curStateIndex += 1

  if (curStateIndex > states.length - 1) {
    useState.stateInfo.states.push(defaultVal)
  }

  return [
    states[curStateIndex],
    newVal => {
      states[curStateIndex] = newVal
      NEEDS_TO_RENDER = true
    },
  ]
}

class Wrapper {
  constructor(renderFunc, props = { children: [] }, tagName = null) {
    this.renderFunc = renderFunc
    this.props = props
    this.tagName = tagName

    // Set the initial state list to be empty
    this.states = []
  }

  render() {
    // Reset the current state index before each render
    useState.stateInfo = {
      curStateIndex: 0,
      states: this.states,
    }

    // Returns wrappers
    return this.renderFunc(this.props)
  }
}

function createElement(renderFuncOrString, props, tagName = null) {
  if (typeof renderFuncOrString === 'string') {
    return new Wrapper(() => renderFuncOrString, props, null)
  }

  return new Wrapper(renderFuncOrString, props, tagName)
}

function buildDOM(wrapper) {
  var element = document.createElement(wrapper.tagName || 'div')

  var stringOrWrapper = wrapper.render()
  const childrenType = typeof stringOrWrapper

  //
  //
  // Added a simple check for the onClick handler.
  // For now only accept onClick handlers of the wrapper is a regular HTML component
  if (wrapper.tagName && wrapper.props.onClick) {
    element.onclick = wrapper.props.onClick
  }

  if (childrenType === 'string') {
    element = document.createTextNode(stringOrWrapper)
  } else if (childrenType === 'object') {
    let childWrappers = Array.isArray(stringOrWrapper)
      ? stringOrWrapper
      : [stringOrWrapper]

    childWrappers.map(child => element.appendChild(buildDOM(child)))
  } else {
    throw Error(`Unknown component type: ${typeof stringOrWrapper}`)
  }

  return element
}

function DivComponent({ children = [], ...otherProps }) {
  return createElement(() => children, otherProps, 'div')
}

function ButtonComponent({ children = [], ...otherProps }) {
  return createElement(() => children, otherProps, 'button')
}

function CounterComponent() {
  const [count, setCount] = useState(0)

  return [
    createElement(`Count: ${count}`),
    createElement(ButtonComponent, {
      children: [createElement('Click me')],
      onClick: () => {
        setCount(count + 1)
      },
    }),
  ]
}

let app = createElement(DivComponent, {
  children: createElement(CounterComponent),
})

function eventLoop() {
  if (NEEDS_TO_RENDER) {
    console.log('RENDERED')

    const rootElement = document.getElementById('recoil-root')
    rootElement.innerHTML = ''
    rootElement.appendChild(buildDOM(app))
    NEEDS_TO_RENDER = false
  }
}

setInterval(eventLoop, 100)
