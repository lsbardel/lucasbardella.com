---
applyTo: "content/**/*.md"
---

# Content Instructions

When creating or modifying content files in the `content/` directory, please follow these best practices:

- Use observable framework for interactive content, see markdown syntax and examples in https://observablehq.com/framework/markdown.
- Ensure all content is well-structured with appropriate headings and subheadings.
- Include relevant metadata such as title, author, date, and tags at the beginning of each file.
- Use clear and concise language to enhance readability.
- Optimize images and media for web performance.
- Validate all links to ensure they are functional and point to the correct resources.


## Data Fetching

- Data fetching scripts should be placed in the `content/data/` directory.
- Use Python for data fetching when possible, following the [Python Coding Conventions and Best Practices](./python.instructions.md).
- When using python, try to use [quantflow](https://github.com/quantmind/quantflow) library for data fetching, use pandas and numpy for data manipulation.
- If quanflow does not provide a data fetcher, write a new one in the `lspy` python project in this repository and follow the [lspy Development Guidelines](./instructions/python-instructions.md).
- You can also use typeScript for data fetching (javascript is deprecated and will convert all javscript files to typescript) following best practices for that language.
- **Note**: Do not manually run data fetching scripts - the Observable framework automatically handles data loading and execution of these scripts when the content is built or served.
