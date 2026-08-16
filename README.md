# AI PM mastery roadmap

Live at **[ai-pm.rubycatharin.com](https://ai-pm.rubycatharin.com)**

A five-week AI curriculum written for product managers. It assumes you will never train a model, and that you still cannot afford to treat one as a black box. The material covers what a PM actually gets asked in the first year of shipping AI features: what a token costs, when retrieval beats fine-tuning, why an agent that is 95% reliable per step still fails most of the time over ten steps, and what to instrument before launch.

22 sections, 13 interactive calculators, 31 knowledge checks, and 172 links to primary sources.

## Four depth levels

Every section is written four times. You choose which version to read.

| Level | What it gives you |
| --- | --- |
| ELI5 | The intuition, before the vocabulary |
| Normal | How the thing actually works, in plain language |
| Technical | Papers, math, precise mechanics |
| PM lens | Cost models, decision frameworks, metrics, strategy |

These are lenses, not stages. You switch based on the conversation you are about to have, not on how far along you are. Explaining retrieval to a CEO and scoping it with an ML engineer need different language for the same concept.

## The five weeks

| Week | Focus | Sections |
| --- | --- | --- |
| 1 | Prompting and AI foundations | The AI hierarchy, tokens, temperature and sampling, system prompts |
| 2 | Data: embeddings, vectors, and RAG | Embeddings, vector databases, retrieval-augmented generation |
| 3 | Build: APIs, agents, and tools | LLM APIs, function calling, agents, evaluation |
| 4 | Ship: fine-tuning, deploy, and AI PM | Fine-tuning, deployment and MLOps, AI product management |
| 5 | Agentic AI and orchestration | Agentic foundations, LLM gateways, MCP, A2A, sub-agents, agent memory, LLM-as-judge, guardrails |

Week 5 is the newest and the longest. It covers the protocol layer (MCP, A2A) and the operational layer (memory, judging, guardrails) that turn a working agent demo into something you can put in front of customers.

## Interactive tools

Thirteen of the sections carry a working calculator or visualiser instead of a diagram. None require an API key, an account, or a paid tier.

Token counter, temperature sampler, system prompt builder, embedding similarity, RAG pipeline walkthrough, API cost comparison, function call flow, agent reliability compounding, eval scorer, fine-tuning decision tree, unit economics calculator, model router, and an action risk taxonomy.

## Stack

- React 18 and Vite 5
- Zustand with the `persist` middleware, writing to `localStorage` under `roadmap-progress`
- Inline style objects plus CSS custom properties for theming, including dark mode
- No router, no CSS framework, no backend

## Running locally

```bash
npm install
npm run dev
```

`npm run build` produces a static bundle in `dist/`.

## Project layout

```
src/
  ai-mastery-roadmap.jsx   the entire UI, all interactive components, all styling
  store.js                 Zustand store: navigation, depth selection, theme, quiz answers
  data/
    index.js               imports the five week files into a WEEKS array
    week1.json .. week5.json
```

Content and code are separate. To add or edit a section you only touch a JSON file.

Each section object looks like this:

```json
{
  "id": "2-3",
  "title": "RAG",
  "subtitle": "...",
  "tldr": "...",
  "keyInsight": "...",
  "depths": { "eli5": "", "normal": "", "technical": "", "pm": "" },
  "quiz": [{ "question": "", "options": [], "correct": 0, "explanation": "" }],
  "resources": []
}
```

The optional `interactive` field names a component by string key. The key has to match a component that already exists in `ai-mastery-roadmap.jsx`.

## Deployment

Pushing to `main` triggers `.github/workflows/pages.yml`, which builds the site and publishes it to GitHub Pages. The custom domain is set by `public/CNAME`, which Vite copies verbatim into `dist/`.

## Design notes

The reasoning behind the architecture, the stack, the four-lens structure, and the things deliberately left out is documented in [PRD.md](PRD.md).
