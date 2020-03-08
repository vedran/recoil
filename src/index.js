import { Component, globalState, useState } from './core'

const CounterComponent = () => {
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

const InputComponent = () => {
  const [value, setValue] = useState("dave")

  return [
    new Component(
      'div',
      { style: 'border: 1px solid black; padding: 4px; margin: 16px 4px;' },
      [
        `Hello ${value}`,
        new Component('div'),
        new Component(
          'input',
          {
            value: value,
            oninput: (e) => {
              setValue(e.target.value)
            }
          }
        ),
      ],
    )
  ]
}


const App = new Component(
  'div',
  null,
  [
    new Component(InputComponent),
    new Component(CounterComponent)
  ]
)

App.render()

const rootElement = document.getElementById('recoil-root')
rootElement.innerHTML = ''
rootElement.appendChild(App.curDOMNode)

function eventLoop() {
  if (globalState.NEEDS_TO_UPDATE) {
    globalState.NEEDS_TO_UPDATE = false
    App.render()
  }
}

setInterval(eventLoop, 100)