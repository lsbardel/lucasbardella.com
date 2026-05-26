---
name: seo
description: Evaluate the SEO performance of a content page and produce a scored report with actionable recommendations.
---

# SEO Evaluation Skill

Read the target content file and evaluate it across the categories below. Produce a scored report and a prioritised list of fixes.

## Evaluation Categories

### 1. Title (20 pts)
- [ ] Present in frontmatter (5 pts)
- [ ] Under 70 characters — short titles are fine and often preferred. Do not flag titles for being too short. (5 pts)
- [ ] Primary keyword appears in the title (5 pts)
- [ ] No em dashes or hyphens used as separators (5 pts)

### 2. Meta Description (20 pts)
- [ ] Present in frontmatter (5 pts)
- [ ] 140–160 characters (5 pts)
- [ ] Primary keyword appears naturally (5 pts)
- [ ] No em dashes or hyphens used as separators (5 pts)

### 3. Keywords (10 pts)
- [ ] `keywords` field present in frontmatter (5 pts)
- [ ] At least 5 keywords covering primary topic, subtopics, and related terms (5 pts)

### 4. Content Structure (20 pts)
- [ ] At least one H2 heading (5 pts)
- [ ] No skipped heading levels (H2 → H4) (5 pts)
- [ ] Primary keyword appears in at least one H2 (5 pts)
- [ ] Post has an introduction, body sections, and a conclusion (5 pts)

### 5. Content Quality (15 pts)
- [ ] Minimum 600 words of body text (excluding code blocks and frontmatter) (5 pts)
- [ ] No em dashes in prose (5 pts)
- [ ] Primary keyword appears in the first paragraph (5 pts)

### 6. Links (15 pts)
- [ ] At least one external link to an authoritative source (5 pts)
- [ ] External links use descriptive anchor text, not "click here" or bare URLs (5 pts)
- [ ] No broken or placeholder links (5 pts)

### 7. Dynamic Content Risk (bonus/penalty)
- [ ] Flag any `${expression}` interpolations in prose — search crawlers cannot execute JavaScript and will see the raw template syntax instead of the rendered value. Each occurrence is a content gap for SEO. Recommend replacing with static fallback text or moving numbers to a static summary.

---

## Report Format

Produce the report as:

```
## SEO Report: {filename}

**Score: XX / 100**

### Passing
- ✅ ...

### Failing
- ❌ {item} — {fix}

### Dynamic Content Warnings
- ⚠️ {line} — crawler sees raw `${...}` instead of rendered value

### Priority Fixes
1. {highest impact fix}
2. ...
```

Score each category, sum the total, and list fixes in order of impact (title and description issues first, then content, then links).
