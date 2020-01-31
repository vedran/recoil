function createElement(component, props) {
  function toHtml() {
    var html = "";

    var renderResults = component(props);
    if (!Array.isArray(renderResults)) {
      renderResults = [renderResults];
    }

    for (var i = 0; i < renderResults.length; i++) {
      var result = renderResults[i];
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
    }

    return html;
  }

  return toHtml();
}

function HtmlElement({ type, children = [] }) {
  function buildOpenTag() {
    if (type === "br") return "<br/>";
    return "<" + type + ">";
  }

  function buildClosingTag() {
    if (type === "br") return "";
    return "</" + type + ">";
  }

  let childrenAsList = Array.isArray(children) ? children : [children];

  return [
    buildOpenTag(),
    ...childrenAsList.map(child => createElement(child)),
    buildClosingTag()
  ];
}

console.log(
  HtmlElement({
    type: "div",
    children: [
      HtmlElement({
        children: "Testing"
      })
    ]
  })
);

/*
const DoublerComponent = ({ content }) =>
  HtmlElement({
    type: "div",
    children: [
      `1. ${content}`,
      HtmlElement({ type: "br" }),
      HtmlElement({ type: "br" }),
      `2. ${content}`,
      HtmlElement({ type: "b", children: "Bolded text is fun" })
    ]
  });

document.getElementById("recoil-root").innerHTML = createElement(
  DoublerComponent,
  {
    content: "Prop Content"
  }
);

*/
