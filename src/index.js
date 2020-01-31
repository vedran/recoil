function Component(type, props, render) {
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

var myComponent = Component("div", { content: "Prop content!" }, props => [
  Component("div", { children: props.content })
]);

document.getElementById("recoil-root").innerHTML = myComponent;
