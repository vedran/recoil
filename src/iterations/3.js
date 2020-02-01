/*
Created a basic useState by having a Wrapper class that sets up a prototype
which allows us to expose state value and setter.

Next step... how do we "re-render"?
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
  constructor(component, props) {
    this.curStateIndex = 0;
    this.states = [];
    this.component = component;
    this.props = props;
  }

  render() {
    useState.prototype.states = this.states;
    useState.prototype.curStateIndex = 0;

    return this.component(this.props);
  }
}

function createElement(component, props = {}) {
  if (typeof component === "string") {
    return component;
  }

  function toHtml() {
    var html = "";

    const w = new Wrapper(component, props);
    var result = w.render();

    if (typeof result === "string") {
      // Text
      html += result;
    } else if (typeof result === "function") {
      // Another Component
      html += result();
    } else {
      // Unknown
      throw Error(`Unknown component type: ${typeof result}`);
    }

    return html;
  }

  return toHtml();
}

function DivComponent({ children, ...otherProps }) {
  // TODO: Use otherProps as attributes rather than passing them down

  let processedChildren = (children || []).map(child =>
    createElement(child, otherProps)
  );

  return `<div>${processedChildren.join("\n")}</div>`;
}

const DoublerComponent = ({ content }) =>
  createElement(DivComponent, {
    children: [createElement(`${content} => ${content}, ${content}`)]
  });

const ReverserComponent = ({ content }) => {
  return createElement(DivComponent, {
    children: [
      createElement(
        `${content} => ${content
          .split("")
          .reverse()
          .join("")}`
      )
    ]
  });
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

document.getElementById("recoil-root").innerHTML = createElement(DivComponent, {
  children: [
    createElement(DoublerComponent, {
      content: "Double me"
    }),
    createElement(ReverserComponent, {
      content: "Hello world"
    }),
    createElement(DoublerWithHooksComponent)
  ]
});
