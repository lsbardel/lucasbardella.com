import * as Plot from "npm:@observablehq/plot";
import * as React from "npm:react";

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
