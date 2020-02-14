/*
Iteration 1 has Component as a function that takes a type (e.g. div), props, and a render function.
Render returns a list of children to convert to HTML
*/

function createElement(type, props, render) {
  function buildOpenTag() {
    if (type === "div") {
      return "<div>\n";
    }

    return "";
  }

  function buildClosingTag() {
    if (type === "div") {
      return "</div>\n";
    }

    return "";
  }

  function defaultRender(props) {
    return props.children;
  }

  function toHtml() {
    var html = "";

    html += buildOpenTag();

    var renderResults = render ? render(props) : defaultRender(props);

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
        throw Error("Unknown component type");
      }
    }

    html += buildClosingTag();
    return html;
  }

  return toHtml();
}

var myComponent = createElement("div", { content: "Prop content!" }, props => [
  createElement("div", { children: props.content })
]);

document.getElementById("recoil-root").innerHTML = myComponent;
