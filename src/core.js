DOM_ATTRIBUTES_WHITELIST = {
  'style': true,
  'value': true,
  'onchange': true,
  'oninput': true,
}

function addPropsToDOMElement(props, element) {
  const { onclick, onchange, oninput, ...attributeProps } = (props || {})
  if (onclick) {
    element.onclick = onclick
  }
  if (onchange) {
    element.onchange = onchange
  }

  if (oninput) {
    element.oninput = oninput
  }

  Object.entries(attributeProps).map(([key, value]) => {
    if (DOM_ATTRIBUTES_WHITELIST[key]) {
      element.setAttribute(key, value)
    }
  })
}

function useState(defaultVal) {
  const { curStateIndex, states } = useState.stateInfo
  useState.stateInfo.curStateIndex += 1

  // Check if we've made this many calls to useState for this instance yet
  if (curStateIndex > states.length - 1) {
    useState.stateInfo.states.push(defaultVal)
  }

  return [
    states[curStateIndex],
    newVal => {
      states[curStateIndex] = newVal
      globalState.NEEDS_TO_UPDATE = true
    },
  ]
}

function asArray(renderResult) {
  if (renderResult == undefined) {
    return []
  }

  if (Array.isArray(renderResult)) {
    return renderResult
  }

  return [renderResult]
}

function buildDOMNode(renderResult) {
  if (typeof renderResult === "string") {
    return document.createTextNode(renderResult)
  }

  renderResult.render()

  return renderResult.curDOMNode
}

function copyRenderResult(stringOrComponent) {
  if (typeof stringOrComponent === "string") {
    return stringOrComponent;
  }

  const result = new Component(stringOrComponent.typeOrRenderFunc,
    { ...stringOrComponent.props },
    stringOrComponent.children ? stringOrComponent.children.map(c => copyRenderResult(c)) : null)

  return result
}


class Component {
  constructor(typeOrRenderFunc, props, children) {
    this.typeOrRenderFunc = typeOrRenderFunc
    this.props = props
    this.children = children

    // Reconciliation cache
    this.curDOMNode = null
    this.curRenderResult = []
    this.curStateIndex = 0
    this.states = []
  }

  render() {
    let tag = "div"

    useState.stateInfo = {
      states: this.states,
      curStateIndex: 0,
      component: this,
    }

    let nextRenderResult = []
    if (typeof this.typeOrRenderFunc === "string") {
      tag = this.typeOrRenderFunc
      nextRenderResult = asArray(this.children).map(c => copyRenderResult(c))
    } else {
      nextRenderResult = asArray(this.typeOrRenderFunc(this.props)).map(c => copyRenderResult(c))
    }

    if (!this.curDOMNode) {
      this.curDOMNode = document.createElement(tag)
    }

    addPropsToDOMElement(this.props, this.curDOMNode)

    const finalRenderResult = []
    let curResultIndex = 0
    let nextResultIndex = 0

    const toUnmount = []
    const toMount = []

    while (curResultIndex < this.curRenderResult.length && nextResultIndex < nextRenderResult.length) {
      const cur = this.curRenderResult[curResultIndex]
      const next = nextRenderResult[nextResultIndex]

      // Different types, unmount the old
      if (typeof cur !== typeof next) {
        toUnmount.push(this.curDOMNode.childNodes[curResultIndex])
        toMount.push(next)
      } else {
        // Both types are the same, and both are string
        if (typeof cur === "string") {
          if (cur !== next) {
            this.curDOMNode.childNodes[curResultIndex].textContent = next
            finalRenderResult.push(next)
          } else {
            finalRenderResult.push(cur)
          }
        }
        else {
          // Both are components..

          // Different component types, unmount
          if (cur.typeOrRenderFunc !== next.typeOrRenderFunc) {
            toUnmount.push(this.curDOMNode.childNodes[curResultIndex])
            toMount.push(next)
          } else {
            addPropsToDOMElement(cur.props, cur.curDOMNode)

            cur.typeOrRenderFunc = next.typeOrRenderFunc
            cur.children = next.children
            cur.props = next.props
            cur.render()
            finalRenderResult.push(cur)
          }
        }
      }
      curResultIndex += 1
      nextResultIndex += 1
    }

    // Mount new components
    while (nextResultIndex < nextRenderResult.length) {
      const next = nextRenderResult[nextResultIndex]
      const newDOMNode = buildDOMNode(next)
      this.curDOMNode.append(newDOMNode)
      nextResultIndex += 1
      finalRenderResult.push(next)
    }

    while (toUnmount.length) {
      const next = toUnmount.shift()
      this.curDOMNode.removeChild(next)
    }

    while (toMount.length) {
      const next = toMount.shift()
      finalRenderResult.push(next)
      this.curDOMNode.append(buildDOMNode(next))
    }

    this.curRenderResult = finalRenderResult
  }
}

const globalState = {
  NEEDS_TO_UPDATE: false,
}

module.exports = {
  Component,
  useState,
  globalState
}
