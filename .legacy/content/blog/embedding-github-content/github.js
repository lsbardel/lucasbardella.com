import highlight from "https://cdn.skypack.dev/highlight.js";
import { Octokit } from "https://cdn.skypack.dev/octokit";

const octokit = new Octokit();

class GithubContent extends HTMLElement {
  async connectedCallback() {
    const path = this.getAttribute("path");
    if (!path) this.innerHTML = "<strong>No path</strong>";
    const result = await octokit.rest.repos.getContent({
      owner: this.getAttribute("owner"),
      repo: this.getAttribute("repo"),
      path,
    });
    const data = result.data;
    if (result.status == 200 && data.type === "file") {
      this.innerHTML = "<pre><code class='hljs'></code></pre>";
      const code = this.querySelector("code");
      const text = atob(data.content);
      const language = this.getAttribute("lang") || path.split(".").pop();
      const texth = highlight.highlight(text, { language }).value;
      code.innerHTML = texth;
    }
  }
}

customElements.define("github-content", GithubContent);
