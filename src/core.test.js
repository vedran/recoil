const { Component } = require('./core')

test('Can render simple component', () => {
  const HelloComponent = new Component(() => 'hello')
  const WorldComponent = new Component(() => 'world')

  const c = new Component(() => [HelloComponent, WorldComponent])
  expect(c.buildDOMElement().outerHTML).toBe(
    '<div><div>hello</div><div>world</div></div>'
  )
})
