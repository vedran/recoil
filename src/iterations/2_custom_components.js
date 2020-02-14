/*
Iteration 2 supports custom components and div components, all treated as functional components.
Props are passed into the custom components, but not into the divs yet.
*/

function createElement(component, props = {}) {
  if (typeof component === 'string') {
    return component
  }

  return component(props)
}

function DivComponent({ children, ...otherProps }) {
  let processedChildren = (children || []).map(child =>
    createElement(child, otherProps)
  )

  return `<div>${processedChildren.join('\n')}</div>`
}

const GreetingComponent = ({ name }) =>
  createElement(DivComponent, {
    children: [createElement(`Hello ${name}`)],
  })

document.getElementById('recoil-root').innerHTML = createElement(
  GreetingComponent,
  {
    name: 'Jeff',
  }
)
