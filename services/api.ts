const API = "http://localhost:3001/api";

export const getRepos = async () => fetch(`${API}/repos`).then((r) => r.json());

export const getCommits = async (repo: string) =>
  fetch(`${API}/repos/${repo}/commits`).then((r) => r.json());

export const getDashboard = async () =>
  fetch(`${API}/dashboard`).then((r) => r.json());
