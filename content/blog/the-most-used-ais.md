---
title: The Most Used AI APIs
description: Tracking AI API adoption across OpenAI, Anthropic, Google, Mistral and Groq using NPM and PyPI SDK download data as a proxy for real-world usage.
date: 2026-03-21
keywords: ai, llm, openai, anthropic, google, mistral, groq, npm, pypi
heroImage: ai
heroOpacity: 0.2
---

```js
display(html`<p style="color: var(--theme-foreground-muted); font-size: 0.85rem">Last updated: ${new Date(data.generated_at).toLocaleDateString("en-GB", {day: "numeric", month: "long", year: "numeric"})}</p>`);
```

Which AI API is actually winning? OpenAI, Anthropic, Google, Mistral, and Groq all claim momentum, but none of them publish usage numbers. API traffic is treated as proprietary by every major provider.

## The Contenders

**[OpenAI](https://platform.openai.com/)** is the company that started the current wave with GPT-3 in 2020 and redefined the industry with ChatGPT in 2022. Its API, built around the GPT model family, remains the benchmark everything else is measured against. The OpenAI-compatible API format has become an informal standard that competitors voluntarily adopt.

**[Anthropic](https://www.anthropic.com/)** was founded in 2021 by former OpenAI researchers and built Claude from the ground up with a focus on safety and reliability. Claude has earned a strong reputation for long-context reasoning and is widely used in agentic and enterprise workflows. Anthropic raised over $7 billion in 2024 and is the most credible challenger to OpenAI.

**[Google](https://ai.google.dev/)** brings the Gemini model family and unmatched infrastructure through Google Cloud. Gemini is multimodal by design and deeply integrated into Google's own products. Google's reach is enormous but its API adoption is harder to measure, as usage flows through multiple SDKs and the Vertex AI platform.

**[Mistral](https://mistral.ai/)** is a French AI company founded in 2023 that has built a reputation for releasing highly capable open-weight models alongside its commercial API. It is smaller than the others but punches above its weight, particularly in Europe.

**[Groq](https://groq.com/)** takes a different angle: rather than training its own frontier models, it focuses on inference speed using custom hardware (LPUs). Groq runs open-source models like Llama and Mixtral at exceptionally low latency, making it attractive for latency-sensitive applications.

## Measuring AI API Adoption

The best available proxy for API usage is SDK download counts from NPM and PyPI. Every time an application installs the [openai](https://www.npmjs.com/package/openai) or [@anthropic-ai/sdk](https://www.npmjs.com/package/@anthropic-ai/sdk) package, it registers in the download stats. It is not a perfect measure of API calls or revenue, but it is consistent, public, and updated daily. The chart below tracks these numbers for the five providers.

```js
const data = FileAttachment("../../data/the-most-used-ais.json").json();
```

```js
const fmt = (n) => n >= 1e9 ? (n / 1e9).toFixed(1) + "B" : (n / 1e6).toFixed(0) + "M";
const fmtK = (n) => (n / 1e3).toFixed(0) + "k";

const npmTotal = Object.fromEntries(
  d3.rollups(data.npm, v => d3.sum(v, d => d.downloads), d => d.provider)
);
const pypiTotal = Object.fromEntries(
  d3.rollups(data.pypi, v => d3.sum(v, d => d.downloads), d => d.provider)
);

const latestNpm = Object.fromEntries(
  d3.rollups(
    data.npm.filter(d => d.date === d3.max(data.npm, d => d.date)),
    v => d3.sum(v, d => d.downloads),
    d => d.provider
  )
);
```

```tsx
import AiSdkDownloads, { GitHubStars } from "../../components/the-most-used-ais.js";
```

<div class="card">

```tsx
display(<AiSdkDownloads data={data} />);
```
</div>

<div class="note">

NPM data covers the past 12 months. PyPI is limited to the last 6 months as the [pypistats](https://pypistats.org) API does not provide older history. The combined view only includes months where both sources are available.

</div>

## OpenAI is still far ahead

Over the past 12 months, the [openai](https://www.npmjs.com/package/openai) package was downloaded **${fmt(npmTotal.OpenAI)} times on NPM** and **${fmt(pypiTotal.OpenAI)} times on PyPI**, more than double the next closest competitor on both registries. The gap is not just a legacy effect. The most recent week shows OpenAI at ${fmt(latestNpm.OpenAI)} NPM downloads, versus ${fmt(latestNpm.Anthropic)} for Anthropic.

<div class="tip">

The [openai](https://www.npmjs.com/package/openai) package is not only used to talk to OpenAI models. Many providers (Groq, Azure, Together, and others) expose an OpenAI-compatible API, meaning developers route traffic through the same SDK even when the underlying model is not from OpenAI. This inflates OpenAI's numbers, but also signals the degree to which it has become the de facto interface standard for LLM APIs.

</div>

## Anthropic is the clear second

Anthropic's [@anthropic-ai/sdk](https://www.npmjs.com/package/@anthropic-ai/sdk) sits firmly in second place, with ${fmt(npmTotal.Anthropic)} NPM downloads and ${fmt(pypiTotal.Anthropic)} PyPI downloads over the measured period. The PyPI numbers are particularly notable: the [anthropic](https://pypi.org/project/anthropic/) Python package sits at ${Math.round(pypiTotal.Anthropic / pypiTotal.OpenAI * 100)}% of OpenAI's volume, which reflects the strong Python bias in the AI/ML developer community and the popularity of Claude in agentic workflows and tooling.

## Google, Mistral, and Groq are trailing

Google's [@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai) and [google-generativeai](https://pypi.org/project/google-generativeai/) packages sit at ${fmt(npmTotal.Google)} NPM and ${fmt(pypiTotal.Google)} PyPI downloads, ahead of the pack but well behind the top two. Mistral's [@mistralai/mistralai](https://www.npmjs.com/package/@mistralai/mistralai) and Groq's [groq-sdk](https://www.npmjs.com/package/groq-sdk) are broadly similar to each other in PyPI terms (${fmt(pypiTotal.Mistral)} and ${fmt(pypiTotal.Groq)} respectively), though Mistral holds a slight edge in NPM.

These numbers likely undercount Google's true reach. A significant portion of Gemini API usage flows through Vertex AI SDKs and Google Cloud tooling rather than the standalone [google-generativeai](https://pypi.org/project/google-generativeai/) package, so the figures here represent only a slice of actual adoption.

## Why Python Downloads Are So Much Higher

<div class="outer-placeholder" style="padding-top: 40%;">
<div class="inner-placeholder">

```tsx
display(
  <PageHeader
    title="Python rules the AI ecosystem"
    subtitle="...as it does in every other corner of machine learning and data science."
    urls={__images.python}
    opacity={0.5}
  />
);
```
</div>
</div>


Across every provider, PyPI downloads dwarf NPM downloads by a factor of 2–3x. This is not a coincidence. There are several structural reasons why Python dominates AI API consumption.

**Python is the native language of AI research.** The entire machine learning ecosystem, from [PyTorch](https://pytorch.org) and [TensorFlow](https://www.tensorflow.org) to [Hugging Face](https://huggingface.co) and [LangChain](https://www.langchain.com), is built in Python. Researchers, data scientists, and ML engineers default to Python for everything from experimentation to production pipelines. When they reach for an AI API, they reach for the Python SDK.

**Server-side usage inflates PyPI counts.** Python SDKs are typically installed on servers, in Docker containers, and in CI pipelines. Every deployment, every container rebuild, and every automated test run triggers a fresh install. NPM packages used in browser applications are often bundled once and cached, leading to far fewer repeated downloads.

**Python tooling runs in more automated environments.** Data pipelines, batch jobs, notebooks, and backend services are overwhelmingly Python. A single production system running daily jobs can account for thousands of installs per month across environments.

**JavaScript AI usage skews toward the browser and edge.** While Node.js backends do use the NPM SDKs, a significant share of JavaScript AI work happens in the browser or at the edge, where bundled code is distributed once rather than installed repeatedly.

The result is that raw PyPI numbers should not be read as proof that Python developers outnumber JavaScript developers by 2–3x. The install mechanics are simply different. The NPM numbers are arguably a cleaner signal of active integration work, while PyPI numbers reflect both active use and infrastructure churn.

## Caveats

<div class="warning">

SDK downloads are a noisy proxy. A single CI pipeline running pip install openai on every build can generate millions of downloads per month. Cached installs, mirrors, and automated tooling all distort the raw counts. PyPI stats in particular exclude mirror traffic by default (the figures here use the without_mirrors category), but the signal is still imperfect. Treat the trends and relative rankings as meaningful; treat the absolute numbers with appropriate scepticism.

</div>

## GitHub Stars

GitHub stars are a slower-moving but less noisy signal. They reflect genuine interest from developers who have deliberately bookmarked a repository, rather than automated installs. The chart below shows current star counts for the official Python and JavaScript SDKs of each provider.

<div class="card">

```tsx
display(<GitHubStars data={data} />);
```

</div>

## A Moving Picture

OpenAI is winning, but the lead is softer than the raw numbers suggest. A large share of those downloads are developers routing traffic through the OpenAI-compatible API format while actually running models from other providers. Strip that out and the gap narrows considerably.

Anthropic is the only serious challenger right now. The PyPI numbers are particularly telling: Python developers, the same people building the agents and pipelines that will define how AI gets used in production, are choosing Claude at a rate that closes the gap with OpenAI far more than the NPM numbers alone imply.

Google has the infrastructure and the models, but its SDK adoption is fragmented across too many products to read clearly from this data. Mistral and Groq are carving out real niches but are not in the same conversation for general API adoption.

The numbers on this page update daily. The charts, the inline figures, and the GitHub star counts all reflect the latest available data, so what you are reading now is current. If the landscape shifts, this page shifts with it.

The raw data is public. The [NPM downloads API](https://api.npmjs.org/downloads/range/) and the [pypistats](https://pypistats.org) API are both free and require no authentication. The source for this page is a short Python script that pulls from both daily.

<div class="note">

This post was researched and written with the help of [Claude](https://www.anthropic.com/claude) by Anthropic.

</div>
