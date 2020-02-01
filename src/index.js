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


All useState does is, give me the current value and setter function for this instance of the component
Then you keep a counter somewhere for the current setter

component() {
  - clear useState count somehow for this component only
  - keep the same id for this component every time

  useState() => component id 1234 useState #1
  useState() => component id 1234 useState #2
  useState() => component id 1234 useState #3
  useState() => component id 1234 useState #4
}

So when I create a component, I need to have a wrapper around the function that generates
an id for it and 


So what if i had a class with an id?

class Wrapper {
  states = [
  ]

  render() {
    let result = component()
    when useState is called inside of component(), how does it know
  }

}

function useState() {
  if (this.count == undefined) {
    this.count = 0;
  }

  this.count += 1;
  console.log(this.count);
}

class Wrapper {
  constructor() {
    this.outerCount = 0;
  }

  render() {
    useState.prototype.count = this.outerCount;
    this.outerCount += 1;

    // the internal render calls
    useState();
    useState();
    useState();
  }
}

const w = new Wrapper();
w.render();


*/

function useState(defaultVal) {
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

  const newWrapper = new Wrapper(renderFuncOrString, props, tagName);
  return newWrapper;
  // return new Wrapper(renderFuncOrString, props, tagName);
}

function DivComponent({ children = [], ...otherProps }) {
  return createElement(() => children, {}, "div");
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

const DoublerWithHooksComponent = () => {
  const [first, setFirst] = useState("first");
  const [second, setSecond] = useState("second");
  return createElement(DivComponent, {
    children: [
      createElement(DivComponent, {
        children: [createElement(`${first} => ${first}, ${first}`)]
      }),
      createElement(DivComponent, {
        children: [createElement(`${second} => ${second}, ${second}`)]
      })
    ]
  });
};

document.getElementById("recoil-root").innerHTML = createHTML(
  createElement(DivComponent, {
    children: createElement(() => "hello")
  })
);
