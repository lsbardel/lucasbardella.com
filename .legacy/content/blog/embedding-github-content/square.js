class AnimatedSquare extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        .animated-square {
          width: 50px;
          height: 50px;
          background-color: red;
          position: relative;
          animation: move-square 1s linear infinite;
        }
        @keyframes move-square {
          from { left: 0px; }
          to { left: 100%; }
        }
      </style>

      <div class="animated-square"></div>
    `;
  }
}

customElements.define("animated-square", AnimatedSquare);
