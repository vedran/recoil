/*


Next up is per-component rendering vs unmounting and remounting

So right now if we have a component that contains an <input> tag

If the state of the component changes, then the wrapper of that component
will have render() called.

That render() call eventually set the element's innerHTML to the result of calling render()

So we're unmounting ALL the children of a changed component, every time, then we're actually grabbing
the cached element again, injecting into the DOM again, and then returning it..


So how do we avoid unmounting and remounting?

I know React uses the logic...

1. Type is different
2. Key is different

For the purposes of recoil v1, let's just go with type being different as the necessary condition for unmounting a component


Algorithm:

1. Iterate through old DOM tree
2. Iterate through new DOM tree at the same time



Three cases:

1. Building new DOM element
 - If old != new, delete old if its not null, append new
2. Removing old DOM element 
 - If old != new, delete old if its not null, append new

3. Updating existing DOM element
- Use .attributes to get all of the attributes
- Handle the removed attributes case
- Handle the new attributes case
- Handle the changed attributes case

*/

function reconcile(wrapper) {
  const oldElement = wrapper.element
  const newElement = wrapper.render()
}

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

  if (wrapper.componentName) {
    element.setAttribute('data-recoil-component', wrapper.componentName)
  }

  if (childrenType === 'string') {
    element.innerHTML = ''
    element.appendChild(document.createTextNode(stringOrWrapper))
  } else if (childrenType === 'object') {
    let childWrappers = Array.isArray(stringOrWrapper)
      ? stringOrWrapper
      : [stringOrWrapper]
    const oldElements = [...element.childNodes]

    const newWrapperElements = childWrappers.map(child => ({
      wrapper: child,
      element: updateOrCreateDOM(child),
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

        // 3. Update the wrapper to point to the old element
        newWrapperElement.wrapper.element = oldElement
      }
    }

    // C. Leftover old elements that we didn't match to new elements should be unmounted
    oldElements.map(oldElement => oldElements.remove())

    // D. Leftover new elements that we didn't match to old elements should be added
    newWrapperElements.map(newWrapperElement =>
      element.appendChild(newWrapperElement.element)
    )
  } else {
    throw Error(`Unknown component type: ${typeof stringOrWrapper}`)
  }

  wrapper.element = element
  return element
}

function CounterComponent() {
  const [count, setCount] = useState(0)

  console.log(`CounterComponent: count = ${count}`)

  TODO: Why does this count get incremented to 1 but the div doesn't update?

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
          onClick: () => {
            setCount(count + 1)
          },
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
    const updated = WRAPPERS_TO_RENDER.shift()
    updateOrCreateDOM(updated)
  }
}

setInterval(eventLoop, 100)
