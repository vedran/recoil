const { Component, useState, globalState } = require('./core');

test('Components that render a string', () => {
  const fromChild = new Component('div', null, ["hello"])
  fromChild.render()
  expect(fromChild.curDOMNode.outerHTML).toBe("<div>hello</div>")
  expect(fromChild.curRenderResult).toEqual(["hello"])

  const fromRender = new Component(() => ['hello'], null)
  fromRender.render()
  expect(fromRender.curDOMNode.outerHTML).toBe("<div>hello</div>")
  expect(fromRender.curRenderResult).toEqual(["hello"])
})

test('Render component with multiple children', () => {
  const c = new Component('div', null, [
    "hello",
    new Component('span', null, [
      new Component(() => ['middle'], null, null),
    ]),
    "earth"
  ])
  c.render()
  expect(c.curDOMNode.outerHTML).toEqual("<div>hello<span><div>middle</div></span>earth</div>")
})

test('Can render multiple times with the same result', () => {
  const c = new Component('div', null, [
    '1',
    new Component('span', null, [
      new Component(() => ['2'], null, null),
    ]),
    '3',
  ])
  c.render()
  c.render()
  expect(c.curDOMNode.outerHTML).toEqual("<div>1<span><div>2</div></span>3</div>")
})

test('Update component without unmounting', () => {
  const withRenderFunc = new Component('section', null, [
    new Component(({ name }) => [name], { name: "hello" })
  ])

  withRenderFunc.render()
  expect(withRenderFunc.curDOMNode.outerHTML).toEqual("<section><div>hello</div></section>")

  withRenderFunc.children[0].props.name = 'world'
  withRenderFunc.render()

  expect(withRenderFunc.curDOMNode.outerHTML).toEqual("<section><div>world</div></section>")

  const withChildren = new Component('section', null, [
    new Component('div', null, ['hello'])
  ])

  withChildren.render()
  expect(withChildren.curDOMNode.outerHTML).toEqual("<section><div>hello</div></section>")

  withChildren.children[0].children[0] = 'world'

  withChildren.render()
  expect(withChildren.curDOMNode.outerHTML).toEqual("<section><div>world</div></section>")
})

test('Support for useState hook', () => {
  CounterComponent = () => {
    const [count, setCount] = useState(0)

    return [
      new Component(
        'div',
        { style: 'border: 1px solid black; padding: 4px; margin: 16px 4px;' },
        [
          new Component(
            'div',
            null,
            [`Count: ${count}`],
          ),
          new Component(
            'button',
            { 'onclick': () => setCount(count - 1) },
            ['Subtract'],
          ),
          new Component(
            'button',
            { 'onclick': () => setCount(count + 1) },
            ['Add'],
          ),
        ],
      )
    ]
  }

  const App = new Component(
    'div',
    null,
    [new Component(CounterComponent), new Component(CounterComponent)]
  )

  App.render()

  expect(App.curDOMNode.outerHTML).toEqual("<div><div><div style=\"border: 1px solid black; padding: 4px; margin: 16px 4px;\"><div>Count: 0</div><button>Subtract</button><button>Add</button></div></div><div><div style=\"border: 1px solid black; padding: 4px; margin: 16px 4px;\"><div>Count: 0</div><button>Subtract</button><button>Add</button></div></div></div>")
  expect(globalState.NEEDS_TO_UPDATE).toBe(false)

  // Simulate calling the onclick handler for the first counter addition button
  App.curRenderResult[0].curRenderResult[0].curRenderResult[2].props.onclick()

  // Check that the event loop would have been called
  expect(globalState.NEEDS_TO_UPDATE).toBe(true)

  // Check that re-rendering actually updated the elements
  App.render()
  expect(App.curDOMNode.outerHTML).toEqual("<div><div><div style=\"border: 1px solid black; padding: 4px; margin: 16px 4px;\"><div>Count: 1</div><button>Subtract</button><button>Add</button></div></div><div><div style=\"border: 1px solid black; padding: 4px; margin: 16px 4px;\"><div>Count: 0</div><button>Subtract</button><button>Add</button></div></div></div>")
})