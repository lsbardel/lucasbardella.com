import json
import sys
from datetime import date, timedelta

import pandas as pd
import requests

PACKAGES = [
    {"provider": "OpenAI", "npm": "openai", "pypi": "openai"},
    {"provider": "Anthropic", "npm": "@anthropic-ai/sdk", "pypi": "anthropic"},
    {"provider": "Google", "npm": "@google/generative-ai", "pypi": "google-generativeai"},
    {"provider": "Mistral", "npm": "@mistralai/mistralai", "pypi": "mistralai"},
    {"provider": "Groq", "npm": "groq-sdk", "pypi": "groq"},
]

GITHUB_REPOS = [
    {"provider": "OpenAI", "repo": "openai/openai-python", "language": "Python"},
    {"provider": "OpenAI", "repo": "openai/openai-node", "language": "JavaScript"},
    {"provider": "Anthropic", "repo": "anthropics/anthropic-sdk-python", "language": "Python"},
    {"provider": "Anthropic", "repo": "anthropics/anthropic-sdk-typescript", "language": "JavaScript"},
    {"provider": "Google", "repo": "google-gemini/generative-ai-python", "language": "Python"},
    {"provider": "Google", "repo": "google-gemini/generative-ai-js", "language": "JavaScript"},
    {"provider": "Mistral", "repo": "mistralai/client-python", "language": "Python"},
    {"provider": "Mistral", "repo": "mistralai/client-ts", "language": "JavaScript"},
    {"provider": "Groq", "repo": "groq/groq-python", "language": "Python"},
    {"provider": "Groq", "repo": "groq/groq-typescript", "language": "JavaScript"},
]

SESSION = requests.Session()
SESSION.headers.update({"User-Agent": "lucasbardella.com/1.0"})


def fetch_npm(package: str, start: str, end: str) -> list[dict]:
    url = f"https://api.npmjs.org/downloads/range/{start}:{end}/{package}"
    resp = SESSION.get(url, timeout=15)
    resp.raise_for_status()
    return resp.json().get("downloads", [])


def fetch_github(repo: str) -> int:
    url = f"https://api.github.com/repos/{repo}"
    resp = SESSION.get(url, timeout=15)
    resp.raise_for_status()
    return resp.json()["stargazers_count"]


def fetch_pypi(package: str) -> list[dict]:
    url = f"https://pypistats.org/api/packages/{package}/overall"
    resp = SESSION.get(url, timeout=15)
    resp.raise_for_status()
    data = resp.json().get("data", [])
    return [d for d in data if d["category"] == "without_mirrors"]


def main() -> None:
    end = date.today().isoformat()
    start = (date.today() - timedelta(days=365)).isoformat()

    npm_rows: list[dict] = []
    pypi_rows: list[dict] = []

    for pkg in PACKAGES:
        try:
            for d in fetch_npm(pkg["npm"], start, end):
                npm_rows.append(
                    {
                        "date": d["day"],
                        "downloads": d["downloads"],
                        "provider": pkg["provider"],
                    }
                )
        except Exception as e:
            print(f"npm {pkg['npm']}: {e}", file=sys.stderr)

        try:
            for d in fetch_pypi(pkg["pypi"]):
                pypi_rows.append(
                    {
                        "date": d["date"],
                        "downloads": d["downloads"],
                        "provider": pkg["provider"],
                    }
                )
        except Exception as e:
            print(f"pypi {pkg['pypi']}: {e}", file=sys.stderr)

    npm_df = pd.DataFrame(npm_rows)
    npm_df["date"] = pd.to_datetime(npm_df["date"])
    npm_df = (
        npm_df.groupby(["provider", pd.Grouper(key="date", freq="W-MON")])["downloads"]
        .sum()
        .reset_index()
    )
    # Drop weeks in the current (incomplete) month
    current_month = pd.Timestamp(date.today().replace(day=1))
    npm_df = npm_df[npm_df["date"] < current_month]
    npm_df["date"] = npm_df["date"].dt.strftime("%Y-%m-%d")

    pypi_df = pd.DataFrame(pypi_rows)
    pypi_df["date"] = pd.to_datetime(pypi_df["date"])
    pypi_df = (
        pypi_df.groupby(["provider", pd.Grouper(key="date", freq="MS")])["downloads"]
        .sum()
        .reset_index()
    )
    # Drop the last (incomplete) month
    pypi_df = pypi_df[pypi_df["date"] < pypi_df["date"].max()]
    pypi_df["date"] = pypi_df["date"].dt.strftime("%Y-%m-%d")

    github_rows: list[dict] = []
    for r in GITHUB_REPOS:
        try:
            stars = fetch_github(r["repo"])
            github_rows.append({"provider": r["provider"], "language": r["language"], "repo": r["repo"], "stars": stars})
        except Exception as e:
            print(f"github {r['repo']}: {e}", file=sys.stderr)

    result = {
        "generated_at": date.today().isoformat(),
        "npm": npm_df.to_dict(orient="records"),
        "pypi": pypi_df.to_dict(orient="records"),
        "github": github_rows,
    }
    json.dump(result, sys.stdout)


if __name__ == "__main__":
    main()
