/*
Iteration 2 supports custom components and div components, all treated as functional components.
Props are passed into the custom components, but not into the divs yet.
*/

function createElement(component, props = {}) {
  if (typeof component === "string") {
    return component;
  }

  function toHtml() {
    var html = "";

    // component is a function that returns a component or a string
    var result = component(props);

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

document.getElementById("recoil-root").innerHTML = createElement(DivComponent, {
  children: [
    createElement(DoublerComponent, {
      content: "Double me"
    }),
    createElement(ReverserComponent, {
      content: "Hello world"
    })
  ]
});
