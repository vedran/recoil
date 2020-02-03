/*

Exposed onClick prop and use div as placeholder HTML tag for components


Notes:

- Next up is adding support for the onClick handler in both custom components and html elements
- We should start properly building elements rather than manually building the text strings..
- How do we handle onClick handlers for custom components? The custom components aren't regular html tags...
- So do we just consider then divs?
- If we treat them as divs then the styling may be unexpected
- Let's start with divs for now because it is simple


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
    if (wrapper.props.onClick) {
      element.onclick = wrapper.props.onClick;
    }
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

function ButtonComponent({ children = [], ...otherProps }) {
  return createElement(() => children, otherProps, "button");
}

function CounterComponent() {
  [count, setCount] = useState(0);

  return [
    createElement(`Hello ${count}`),
    createElement(ButtonComponent, {
      children: [createElement("Click me")],
      onClick: () => {
        setCount(count + 1);
      }
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
