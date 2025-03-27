import {Octokit} from "octokit";

const octokit = new Octokit({auth: process.env.GITHUB_TOKEN});

const fetchRepo = async (repo: string) => {
  const [owner, name] = repo.split("/");
  const {data} = await octokit.rest.repos.get({owner, repo: name});
  return data;
};

const fetchRepos = async (repos: string[]) => {
  return Promise.all(repos.map(fetchRepo));
};

const data = await fetchRepos([
  "mgeier/rtrb",
  "agerasev/ringbuf",
  "erenon/cueue",
  "Elzair/core_affinity_rs",
]);
const dataMap = data.reduce((acc, repo) => {
  acc[repo.full_name] = repo;
  return acc;
}, {});

process.stdout.write(JSON.stringify(dataMap, null, 2));
