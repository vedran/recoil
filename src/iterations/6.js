/*
TODOs
- Re-rendering on change state
- Reconciliation
- Context
- JSX
*/

/* 

Notes:
- Add input text element and expand html component props
- Problem: When the whole app re-renders, the state remains but the focus isn't maintained
*/

var NEEDS_TO_RENDER = true;

function useState(defaultVal) {
  NEEDS_TO_RENDER = true;

  const { curStateIndex, states } = useState.prototype;
  useState.prototype.curStateIndex += 1;

  // Check if we've made this many calls to useState for this instance yet
  if (curStateIndex > states.length - 1) {
    useState.prototype.states.push(defaultVal);
  }

  return [
    states[curStateIndex],
    newVal => {
      states[curStateIndex] = newVal;
      NEEDS_TO_RENDER = true;
    }
  ];
}

class Wrapper {
  constructor(renderFunc, props = { children: [] }, tagName = null) {
    this.renderFunc = renderFunc;
    this.props = props;

    this.curStateIndex = 0;
    this.states = [];
    this.tagName = tagName;
  }

  render() {
    useState.prototype.states = this.states;
    useState.prototype.curStateIndex = 0;

    // Returns wrappers
    return this.renderFunc(this.props);
  }
}

function createElement(renderFuncOrString, props = {}, tagName = null) {
  if (typeof renderFuncOrString === "string") {
    return new Wrapper(() => renderFuncOrString, props, null);
  }

  return new Wrapper(renderFuncOrString, props, tagName);
}

const buildDOM = wrapper => {
  // The result of a render call will either be a string or another wrapper
  var stringOrWrapper = wrapper.render();
  const childrenType = typeof stringOrWrapper;

  var element = document.createElement(wrapper.tagName || "div");

  // Current element has an HTML tag
  if (wrapper.tagName) {
    const { onClick, onChange, ...attributeProps } = wrapper.props;
    if (onClick) {
      element.onclick = onClick;
    }
    if (onChange) {
      element.onkeyup = onChange;
    }

    Object.entries(attributeProps).map(([key, value]) =>
      element.setAttribute(key, value)
    );
  }

  if (childrenType === "string") {
    element = document.createTextNode(stringOrWrapper);
  } else if (childrenType === "object") {
    let childWrappers = Array.isArray(stringOrWrapper)
      ? stringOrWrapper
      : [stringOrWrapper];

    childWrappers.map(child => element.appendChild(buildDOM(child)));
  } else {
    throw Error(`Unknown component type: ${typeof stringOrWrapper}`);
  }

  return element;
};

function DivComponent({ children = [], ...otherProps }) {
  return createElement(() => children, otherProps, "div");
}

function InputComponent({ children = [], ...otherProps }) {
  return createElement(() => children, otherProps, "input");
}

function CounterComponent() {
  [colour, setColour] = useState("red");

  return [
    createElement(DivComponent, {
      style: `background: ${colour}`,
      children: [
        createElement(InputComponent, {
          type: "text",
          value: colour,
          onChange: e => {
            setColour(e.target.value);
          }
        })
      ]
    })
  ];
}

let app = createElement(DivComponent, {
  children: createElement(CounterComponent)
});

function eventLoop() {
  if (NEEDS_TO_RENDER) {
    console.log("RENDERED");

    const rootElement = document.getElementById("recoil-root");
    rootElement.innerHTML = "";
    rootElement.appendChild(buildDOM(app));
    NEEDS_TO_RENDER = false;
  }
}

setInterval(eventLoop, 100);
