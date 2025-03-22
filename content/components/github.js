// src/github.jsx
import * as Plot from "npm:@observablehq/plot";
import * as React from "npm:react";
var githubStars = (data, { width, height } = {}) => {
  return Plot.plot({
    width,
    height,
    color: { legend: true },
    y: {
      grid: true
    },
    marks: [
      Plot.line(data, { x: "date", y: "stars", stroke: "repo", tip: true })
    ]
  });
};
var GihubRepos = ({ repos }) => {
  repos.sort((a, b) => b.stargazers_count - a.stargazers_count);
  const inner = repos.map(
    (repo) => /* @__PURE__ */ React.createElement("a", { href: repo.html_url, target: "_blank" }, /* @__PURE__ */ React.createElement("div", { class: "card" }, /* @__PURE__ */ React.createElement("h2", null, repo.name), /* @__PURE__ */ React.createElement("p", null, repo.description)))
  );
  return /* @__PURE__ */ React.createElement("div", { class: "grid grid-cols-4" }, inner);
};
export {
  GihubRepos,
  githubStars
};
//# sourceMappingURL=github.js.map
