---
title: AI World
description: A journey through the modern AI world - Tools, Concepts, and Open Source Projects
date: 2025 Aug 24
---

**This is still a work in progress - I'm trying to get a better understanding of the landscape.**

The AI landscape is evolving at breakneck speed. New tools, frameworks, and concepts are emerging almost daily, making it challenging to keep up, even for seasoned developers. In this post, I’ll demystify some of the most talked-about ideas in AI today, such as **agents**, **RAG**, and **MCP**, and share some of the most promising open-source projects on GitHub.

## Models

At the heart of every AI system are the models themselves. These are mathematical constructs, often neural networks, trained on vast datasets to perform tasks like language understanding, image recognition, or code generation. The recent wave of progress is driven by large foundation models, which can be adapted for a wide range of applications.

**Types of Models:**

- **Large Language Models (LLMs):** Specialized in understanding and generating human language. Examples: GPT-4, Llama 4, Mistral, Falcon, Gemma.
- **Vision Models:** Designed for image analysis and generation. Examples: CLIP, Stable Diffusion, Segment Anything.
- **Multimodal Models:** Can process and generate multiple data types (text, images, audio). Examples: Gemini, GPT-5, LLaVA.

**Open-Source Models:**

- [Hugging Face Models](https://huggingface.co/models) - large collections of open-source models with a python SDK. Most models listed in this section are available via Hugging face SDK.
- [Model Scope](https://modelscope.cn/models) - similar to Hugging Face
- [Meta Llama](https://www.llama.com): Open weights, widely used for research and production.
- [Mistral](https://mistral.ai/news/announcing-mistral-7b/): High-performance open LLMs.
- [Falcon](https://falconllm.tii.ae/): Open-source LLMs from TII.
- [Gemma](https://ai.google.dev/gemma): Google's open models for research and commercial use.
- [Stable Diffusion](https://github.com/CompVis/stable-diffusion): Leading open-source image generation model.
- [CLIP](https://github.com/openai/CLIP): Connects vision and language for powerful search and understanding.

**Commercial Models:**

- [OpenAI GPT](https://platform.openai.com/docs/models): State-of-the-art LLM, available via API.
- [Anthropic Claude](https://www.anthropic.com/claude): Advanced LLMs focused on helpfulness and safety, available via API.
- [Google Gemini](https://deepmind.google/technologies/gemini/): Multimodal models powering Google AI products, available via API.
- [xAI Grok](https://x.ai/): xAI's conversational model designed for real-time knowledge and wit, available via X (Twitter) and API.

**How Models Are Used:**

- **Inference:** Using pre-trained models for tasks like chat, search, or image generation.
- **Fine-tuning:** Adapting models to specific domains or tasks with your own data.
- **Open Weights vs. API:** Some models are available as downloadable weights (run locally or on your own servers), while others are only accessible via cloud APIs.

Choosing the right model and understanding its strengths and limitations is key to building effective AI solutions.

---

## Agents

Most people interact with AI via chatbots, notable examples are ChatCPT, Gemini and so on. AI Agents go beyond simple chatbots, they are autonomous programs that can perceive their environment, make decisions, and act to achieve specific goals. Unlike traditional chatbots, modern AI agents can plan, reason, and even use external tools or APIs.

- [Langchain ![GitHub stars](https://img.shields.io/github/stars/langchain-ai/langchain?style=social)](https://github.com/langchain-ai/langchain) is a popular Python framework for building language model-powered applications. Its agent module lets you create LLM-driven agents that can use tools, search the web, or interact with APIs.
- **Auto-GPT**: [Auto-GPT](https://github.com/Significant-Gravitas/Auto-GPT) is an experimental open-source application that demonstrates the power of GPT-4 as an autonomous agent capable of performing complex tasks with minimal human input.

---

## RAG

**RAG** stands for Retrieval-Augmented Generation and is a technique that combines large language models with external knowledge sources. Instead of relying solely on what the model “knows,” RAG systems retrieve relevant documents or data and use them to generate more accurate and up-to-date responses.

- [Haystack ![GitHub stars](https://img.shields.io/github/stars/deepset-ai/haystack?style=social)](https://github.com/deepset-ai/haystack) is an open-source framework for building RAG pipelines, supporting document retrieval, question answering, and more.
- **LlamaIndex**: [LlamaIndex](https://github.com/jerryjliu/llama_index) (formerly GPT Index) helps you connect LLMs with your own data, making it easy to build RAG-powered applications.

---

## MCP

**MCP** stands for model context protocol and serves as a standardised communication layer, enabling AI agents to understand and interact with external APIs (MCP servers). It provides a framework for APIs to describe their

- Capabilities
- Input schema
- Execution methods

* **OpenAI Function Calling**: [OpenAI’s function calling](https://platform.openai.com/docs/guides/function-calling) lets you chain model outputs with external functions, a key building block for MCPs.
* **CrewAI**: [CrewAI](https://github.com/joaomdmoura/crewAI) is an open-source framework for building collaborative agent workflows, where multiple agents with different skills work together to solve complex tasks.

---

## Document Parsing

Before you can train or fine-tune AI models—especially with your own data—raw documents must be parsed, cleaned, and structured. This step is crucial for both supervised and unsupervised learning, as well as for building effective RAG pipelines.

**Key Steps in Document Processing:**

- **Parsing:** Extracting text and metadata from various formats (PDF, DOCX, HTML, images, etc.).
- **Cleaning:** Removing noise, boilerplate, and irrelevant content.
- **Segmentation/Chunking:** Splitting documents into manageable pieces (sentences, paragraphs, or custom chunks).
- **Tokenization:** Breaking text into tokens (words, subwords, etc.) for model input.
- **Metadata Extraction:** Capturing useful context like author, date, section headers, etc.

**Popular Tools & Libraries:**

- [Apache Tika](https://tika.apache.org/): Universal document parser for text and metadata extraction.
- [Unstructured](https://github.com/Unstructured-IO/unstructured): Python library for parsing and cleaning complex documents, including PDFs and HTML.
- [spaCy](https://github.com/explosion/spaCy) & [NLTK](https://www.nltk.org/): NLP libraries for tokenization, cleaning, and linguistic processing.
- [Haystack Preprocessing](https://docs.haystack.deepset.ai/v1.23.0/docs/preprocessing): Built-in tools for cleaning, splitting, and preparing documents for RAG pipelines.

Proper document processing ensures your models learn from high-quality, relevant data—directly impacting downstream performance.

## Frameworks

Modern AI frameworks are systems that combine multiple AI components—such as models, agents, retrieval, orchestration, and tool integrations—into cohesive, end-to-end solutions. These frameworks abstract away much of the complexity involved in building advanced AI applications, allowing developers to focus on business logic and user experience rather than low-level plumbing.

Frameworks typically offer:

- Modular pipelines for chaining models, tools, and data sources
- Built-in support for RAG, agents, and multi-step workflows
- Extensibility for custom tools, plugins, and integrations
- APIs and UIs for rapid prototyping and deployment

However, the landscape is rapidly evolving, with new frameworks and tools emerging to address specific needs and use cases. This makes choosing one quite challenging.

**Popular AI Frameworks:**

- [LangChain](https://github.com/langchain-ai/langchain): The most widely used Python framework for building LLM-powered applications, with support for agents, RAG, tools, and orchestration.
- [Haystack](https://github.com/deepset-ai/haystack): Focused on RAG, search, and question answering, with modular pipelines and integrations for various models and data sources.
- [CrewAI](https://github.com/joaomdmoura/crewAI): Enables collaborative multi-agent workflows, where agents with different skills work together to solve complex tasks.
- [LlamaIndex](https://github.com/jerryjliu/llama_index): Specializes in connecting LLMs to custom data sources, with tools for document indexing, retrieval, and pipeline composition.
- [Agno](https://github.com/agno-agi/agno): A full-stack framework for building multi-agent systems.

### Serving Frameworks

Running large language models efficiently in production or research settings requires specialized inference and serving frameworks. These systems are designed to maximize throughput, minimize latency, and make the most of available hardware resources when deploying LLMs at scale.

**Notable Tools:**

- [vLLM](https://github.com/vllm-project/vllm): A high-performance and memory-efficient inference engine for LLMs, supporting continuous batching and serving open-source and commercial models at scale.
- [Hugging Face Text Generation Inference](https://github.com/huggingface/text-generation-inference): A production-ready, distributed serving system for LLMs, optimized for speed and scalability.
- [Triton Inference Server](https://github.com/triton-inference-server/server): NVIDIA's open-source server for deploying AI models from any framework, including LLMs, with support for GPU acceleration and advanced scheduling.
- [Ray Serve](https://docs.ray.io/en/latest/serve/index.html): A scalable model serving library built on Ray, supporting Python, ML, and LLM workloads.

These frameworks are essential for anyone looking to deploy LLMs in real-world applications, ensuring high availability, efficiency, and scalability.

Modern AI frameworks are systems that combine multiple AI components—such as models, agents, retrieval, orchestration, and tool integrations—into cohesive, end-to-end solutions. These frameworks abstract away much of the complexity involved in building advanced AI applications, allowing developers to focus on business logic and user experience rather than low-level plumbing.

Frameworks typically offer:

- Modular pipelines for chaining models, tools, and data sources
- Built-in support for RAG, agents, and multi-step workflows
- Extensibility for custom tools, plugins, and integrations
- APIs and UIs for rapid prototyping and deployment

**Popular AI Frameworks:**

- [LangChain](https://github.com/langchain-ai/langchain): The most widely used Python framework for building LLM-powered applications, with support for agents, RAG, tools, and orchestration.
- [Haystack](https://github.com/deepset-ai/haystack): Focused on RAG, search, and question answering, with modular pipelines and integrations for various models and data sources.
- [CrewAI](https://github.com/joaomdmoura/crewAI): Enables collaborative multi-agent workflows, where agents with different skills work together to solve complex tasks.
- [LlamaIndex](https://github.com/jerryjliu/llama_index): Specializes in connecting LLMs to custom data sources, with tools for document indexing, retrieval, and pipeline composition.
- [Agno](https://github.com/agno-agi/agno): A full-stack framework for building multi-agent systems.

These frameworks are rapidly evolving and form the backbone of many modern AI products and research projects.

## Conclusion

The AI world is more accessible than ever, thanks to a vibrant open-source ecosystem and a growing set of powerful abstractions. Whether you’re building autonomous agents, RAG-powered apps, or complex pipelines, there’s a tool or project to help you get started.

_What new AI tool or concept are you most excited about? Let me know in the comments!_
