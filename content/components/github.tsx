import * as Plot from "npm:@observablehq/plot";
import * as React from "npm:react";
import { timeFormat } from "d3-time-format";
import GitHubButton from 'npm:react-github-btn'

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
      <div class="card">
        <h2>{repo.name}</h2>
        <p>{repo.description}</p>
      </div>
    </a>
  );
  return (
    <div class="grid grid-cols-4">
      {inner}
    </div>
  );
}


export const GihubRepoLink = ({ repo }) => {
  return (
    <a href={repo.html_url} target="_blank" style={{"textDecoration": "none"}}>
      <div class="card">
        <h3><GitHubButton data-color-scheme="dark" data-size="large">{repo.full_name} | {repo.stargazers_count}</GitHubButton></h3>
        <h3>{repo.description}</h3>
        <h3>Last updated {formatDate(new Date(repo.updated_at))}</h3>
      </div>
    </a>
  );
}
