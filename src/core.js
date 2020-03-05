/*

What does recoil need to do to be like React?


Components
 * Components can mount()
   * Generates elements for the DOM
 * Components can unmount()
   * Removes elements from the DOM
 * Components can update based on changes..
   * How does this one work?
     * What are the steps when the app state somewhere changes?
        * I need to start at the top of the tree
        * What does render() return? It must return the Component?
*/

class Component {
  constructor(renderFunc, props = {}, tag = 'div') {
    this.curRenderedElement = null
    this.curRenderedComponents = []
    this.renderFunc = renderFunc
    this.tag = tag
  }

  buildDOMElement() {
    const newElement = document.createElement(this.tag)
    const newRenderedComponents = [...this.renderFunc(this.props)]

    newRenderedComponents.map(newComponent => {
      if (typeof newComponent === 'string') {
        newElement.append(newComponent)
      } else {
        newElement.append(newComponent.buildDOMElement())
      }
    })

    return newElement
  }

  removeDOMElement() {
    if (!this.curRenderedElement) {
      return
    }

    this.curRenderedElement.remove()
    this.curRenderedElement = null
  }

  render() {
    // 1. Call renderFunc(), the result of render is more components
    const curRenderedComponents = [...this.curRenderedComponents]
    const newRenderedComponents = [...this.renderFunc(this.props)]

    const finalNewComponents = []
    if (!this.curRenderedElement) {
      this.curRenderedElement = document.createElement('div')
    }

    let curChildIndex = 0
    const finalComponents = []

    // 2. Compare this list of rendered components against the current ones
    while (newRenderedComponents.length && curRenderedComponents.length) {
      const newComponent = newRenderedComponents.shift()
      const curComponent = curRenderedComponents.shift()
      const curChild = this.curRenderedElement.childNodes[curChildIndex]

      // Matching types, update attributes from props
      if (
        newComponent.tag === curComponent.tag &&
        newComponent.renderFunc.name === curChild.renderFunc.name
      ) {
        const { children, ...attributeProps } = newComponent.props
        Object.entries(attributeProps).map(([key, value]) => {
          curChild.setAttribute(key, value)
        })
        finalComponents.push(curComponent)
      } else {
        // Not matching type, replace with new element

        const newElement = newComponent.buildDOMElement()
        newComponent.curRenderedElement = newElement
        this.curRenderedElement.replaceChild(curChild)

        finalComponents.push(newComponent)
      }

      curChildIndex += 1
    }

    // Unmount any leftover elements from last time that didn't match new elements
    const numExtraElements = Math.max(
      0,
      this.curRenderedComponents.length - curChildIndex + 1
    )
    while (numExtraElements) {
      this.curRenderedElement.removeChild(
        this.curRenderedElement.childNodes[curChildIndex]
      )
      numExtraElements -= 1
    }

    while (newRenderedComponents.length) {
      const newComponent = newRenderedComponents.shift()
      const newElement = newComponent.buildDOMElement()

      newComponent.curRenderedElement = newElement
      this.curRenderedElement.append(newElement)
      finalComponents.push(newComponent)
    }

    this.curRenderedComponents = finalComponents

    return this.curRenderedComponents
  }
}

module.exports = {
  Component,
}
