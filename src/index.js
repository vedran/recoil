/*
TODOs
- Generating HTML from objects (Components)
- Custom Component Props
- Html component props
- Internal component state w/hooks
- Re-rendering on change state
- One-way data binding
- Reconciliation
- Context
- JSX
*/

// When the setterFunc is called, we need to look up this particular value, update it
// and then somehow call render on the element again

/*

When I call useState, I know that for this instance of the component, variable #1 and setter #1
correspond to this particular value and setter

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
    return new Wrapper(() => renderFuncOrString);
  }

  return new Wrapper(renderFuncOrString, props, tagName);
}

const createHTML = wrapper => {
  var html = "";

  // The result of a render call will either be a string or another wrapper
  var stringOrWrapper = wrapper.render();
  const childrenType = typeof stringOrWrapper;

  if (wrapper.tagName) {
    html += `<${wrapper.tagName}>\n`;
  }

  if (childrenType === "string") {
    html += stringOrWrapper;
  } else if (childrenType === "object") {
    let childWrappers = Array.isArray(stringOrWrapper)
      ? stringOrWrapper
      : [stringOrWrapper];

    html += childWrappers.reduce((acc, curVal) => {
      return acc + createHTML(curVal);
    }, "");

    html += "\n";
  } else {
    throw Error(`Unknown component type: ${typeof stringOrWrapper}`);
  }

  if (wrapper.tagName) {
    html += `</${wrapper.tagName}>\n`;
  }

  return html;
};

function DivComponent({ children = [], ...otherProps }) {
  return createElement(() => children, {}, "div");
}

let rootWrapper = createElement(DivComponent, {
  children: createElement(() => {
    [count, setCount] = useState(0);

    setTimeout(() => {
      setCount(count + 1);
    }, 1000);

    return `Hello ${count}`;
  })
});

function eventLoop() {
  if (NEEDS_TO_RENDER) {
    console.log("RENDERED");
    document.getElementById("recoil-root").innerHTML = createHTML(rootWrapper);
    NEEDS_TO_RENDER = false;
  }
}

setInterval(eventLoop, 500);
