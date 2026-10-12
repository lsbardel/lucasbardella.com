import * as Plot from "@observablehq/plot";
import * as React from "react";
import { timeFormat } from "d3";
import GitHubButton from "react-github-btn"

const formatDate = timeFormat("%B %d, %Y");

export const githubStars = (data, { width, height } = {}) => {
  return Plot.plot({
    width,
    height,
    color: { legend: true },
    y: {
      grid: true,
    },
    marks: [
      Plot.line(data, { x: "date", y: "stars", stroke: "repo", tip: true }),
    ]
  });
}


export const GihubRepos = ({ repos }) => {
  repos.sort((a, b) => b.stargazers_count - a.stargazers_count);
  const inner = repos.map(repo =>
    <a href={repo.html_url} target="_blank">
      <div className="card">
        <h2>{repo.name}</h2>
        <p>{repo.description}</p>
      </div>
    </a>
  );
  return (
    <div className="grid grid-cols-4">
      {inner}
    </div>
  );
}


/**
 * The card used to wrap everything in one `<a>`, including the GitHub button,
 * which renders an anchor of its own. Nested anchors are invalid HTML, so the
 * browser splits them while parsing and hydration then fails against markup
 * that no longer matches. Observable never hit this because it rendered on the
 * client only. The button keeps its own link, and the rest of the card carries
 * the repository link.
 */
export const GihubRepoLink = ({ repo }) => {
  return (
    <div className="card">
      <h3><GitHubButton data-color-scheme="dark" data-size="large" href={repo.html_url}>{repo.full_name} | {repo.stargazers_count}</GitHubButton></h3>
      <a href={repo.html_url} target="_blank" style={{"textDecoration": "none"}}>
        <h3>{repo.description}</h3>
        <h3>Last updated {formatDate(new Date(repo.updated_at))}</h3>
      </a>
    </div>
  );
}
