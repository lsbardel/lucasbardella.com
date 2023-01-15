class Greeting extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    const template = document.getElementById("greeting-template");
    if (template) {
      this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
  }
}

customElements.define("greeting-component", Greeting);
