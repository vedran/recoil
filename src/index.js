/*
Learnings:
* We set that the global state has updated
* We call app.render()
* app.render() grabs its previously rendered results
* app.render() calls its renderFunc
* app.render() compares the previous results against the current ones
* these results are all still wrappers
* if the new wrappers are the same type, then loop through each original wrapper and call receive()
* receive will look at the new wrapper, take its state and props, then call render() on it
* then 'receive' is in charge of updating the DOM element as well..

* so when render() is called, it will go through its children and either mount() or receive() each of them
*/

function reconcile(wrapper) {
  const oldElement = wrapper.element
  const newElement = wrapper.render()
}

const REFRESH_APP = true

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
      REFRESH_APP = true
    },
  ]
}

let counter = 0

class Wrapper {
  constructor(renderFunc, props = { children: [] }, tagName = null) {
    this.renderFunc = renderFunc
    this.props = props
    this.counter = counter

    counter += 1

    this.curStateIndex = 0
    this.states = []
    this.tagName = tagName
    this.componentName = tagName ? null : renderFunc.name
  }

  render() {
    useState.stateInfo = {
      states: this.states,
      curStateIndex: 0,
      wrapper: this,
    }

    this.lastRender = this.curRender
    this.curRender = this.renderFunc(this.props)

    // So last render already created the wrappers
    // How do I handle a regular re-render because of a state change?

    return this.curRender
  }
}

function createElement(renderFuncOrString, props = {}, tagName = null) {
  if (typeof renderFuncOrString === 'string') {
    return new Wrapper(() => renderFuncOrString, props, null)
  }

  return new Wrapper(renderFuncOrString, props, tagName)
}

function createHtmlComponent({ children = [], tag, ...otherProps }) {
  return createElement(() => children, { children, ...otherProps }, tag)
}

function buildHTML(wrapper) {
  // The result of a render call will either be a string or another wrapper
  var renderResultStringOrWrapper = wrapper.render()
  wrapper.lastRender = renderResultStringOrWrapper
  const resultType = typeof renderResultStringOrWrapper

  var element =
    wrapper.element || document.createElement(wrapper.tagName || 'div')

  // Current element has an HTML tag
  const { onClick, children, ...attributeProps } = wrapper.props
  if (onClick) {
    element.onclick = onClick
  }

  Object.entries(attributeProps).map(([key, value]) => {
    element.setAttribute(key, value)
  })

  if (wrapper.componentName) {
    element.setAttribute('data-recoil-component', wrapper.componentName)
  }

  if (resultType === 'string') {
    element.innerHTML = ''
    element.appendChild(document.createTextNode(renderResultStringOrWrapper))
  } else if (resultType === 'object') {
    let resultWrappers = Array.isArray(renderResultStringOrWrapper)
      ? renderResultStringOrWrapper
      : [renderResultStringOrWrapper]

    const oldElements = [...element.childNodes]

    const newWrapperElements = resultWrappers.map(resultWrapper => ({
      wrapper: resultWrapper,
      element: buildHTML(resultWrapper),
    }))

    while (oldElements.length && newWrapperElements.length) {
      const oldElement = oldElements.pop()
      const newWrapperElement = newWrapperElements.pop()
      const newElement = newWrapperElement.element

      const oldComponentType = oldElement.getAttribute('data-recoil-component')
      const newComponentType = newElement.getAttribute('data-recoil-component')

      // A. We have a totally different HTML tag. Replace the DOM element
      if (
        oldElement.tagName !== newElement.tagName ||
        oldComponentType !== newComponentType
      ) {
        debugger
        oldElement.parentNode.replaceChild(newElement, oldElement)
      } else {
        // B. Both DOM elements have the same tag/component type. Update the attributes

        // 1. Remove the old attributes
        for (let i = 0; i < oldElement.attributes.length; i++) {
          const attr = newElement.attributes[i]
          oldElement.removeAttribute(attr.name)
        }

        // 2. Set the new attributes
        for (let i = 0; i < newElement.attributes.length; i++) {
          const attr = newElement.attributes[i]
          oldElement.setAttribute(attr.name, newElement.getAttribute(attr.name))
        }

        if (oldElement.innerHTML !== newElement.innerHTML) {
          oldElement.innerHTML = newElement.innerHTML
        }

        // 3. Update the wrapper to point to the old element
        newWrapperElement.wrapper.element = oldElement
      }
    }

    // C. Leftover old elements that we didn't match to new elements should be unmounted
    oldElements.map(oldElement => oldElement.remove())

    // D. Leftover new elements that we didn't match to old elements should be added
    newWrapperElements.map(newWrapperElement =>
      element.appendChild(newWrapperElement.element)
    )
  } else {
    throw Error(`Unknown component type: ${typeof renderResultStringOrWrapper}`)
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
        // createHtmlComponent({
        //   tag: 'button',
        //   onClick: () => setCount(count - 1),
        //   children: 'Subtract',
        // }),
        createHtmlComponent({
          tag: 'button',
          onClick: () => {
            console.log('CLICKED')
            setCount(count + 1)
          },
          children: 'Add',
        }),
      ],
    }),
  ]
}

function wrapperToHTML(wrapper) {
  // The result of a render call will either be a string or another wrapper
  var element = document.createElement(wrapper.tagName || 'div')

  // Current element has an HTML tag
  const { onClick, children, ...attributeProps } = wrapper.props
  if (onClick) {
    element.onclick = onClick
  }

  Object.entries(attributeProps).map(([key, value]) => {
    element.setAttribute(key, value)
  })

  if (wrapper.componentName) {
    element.setAttribute('data-recoil-component', wrapper.componentName)
  }

  if (resultType === 'string') {
    element.innerHTML = ''
    element.appendChild(document.createTextNode(renderResultStringOrWrapper))
  } else if (resultType === 'object') {
    let resultWrappers = Array.isArray(renderResultStringOrWrapper)
      ? renderResultStringOrWrapper
      : [renderResultStringOrWrapper]

    resultWrappers.map(w => element.appendChild(wrapperToHTML(w)))
  } else {
    throw Error(`Unknown component type: ${typeof renderResultStringOrWrapper}`)
  }

  return element
}

let app = createHtmlComponent({
  children: [
    createElement(CounterComponent),
    // createElement(CounterComponent),
  ],
  tag: 'div',
})

const rootElement = document.getElementById('recoil-root')
rootElement.innerHTML = ''
rootElement.appendChild(buildHTML(app))

function reconcileChanges(lastRender, nextRender) {
  // TODO: Unmount the last render wrapper elements..
  const nextHTML = wrapperToHTML(nextWrapper)
  return nextRender

  let resultWrappers = Array.isArray(renderResultStringOrWrapper)
    ? renderResultStringOrWrapper
    : [renderResultStringOrWrapper]
}

function eventLoop() {
  if (REFRESH_APP) {
    // TODO: Render from the top to the bottom
  }
}

setInterval(eventLoop, 100)
