# Product requirements document
## AI mastery roadmap, PM lens

**Author:** Ruby
**Type:** Decision PRD. It documents the reasoning behind every meaningful choice made in building this tool.
**Status:** Current as of week 5

---

> This is not a spec for what to build next. It is a record of what was built, why each significant choice was made, and what each choice cost. Read it if you are contributing, forking, or evaluating this project.
>
> Where a decision has since been reversed, the original reasoning is kept and the reversal is documented underneath it. A decision log that only shows the current state is a worse document than one that shows what changed.

---

## Table of contents

1. [Overview](#1-overview)
2. [Goals and non-goals](#2-goals-and-non-goals)
3. [Architecture decisions](#3-architecture-decisions)
4. [Tech stack and delivery decisions](#4-tech-stack-and-delivery-decisions)
5. [UX and interaction design decisions](#5-ux-and-interaction-design-decisions)
6. [Content and pedagogy decisions](#6-content-and-pedagogy-decisions)
7. [Known tradeoffs and future considerations](#7-known-tradeoffs-and-future-considerations)

---

## 1. Overview

Most AI learning resources are built for engineers or for complete beginners, and PMs fall into the gap between them. They are not learning to build models, but they cannot afford to treat AI as a black box either. A PM who cannot reason about token economics, RAG tradeoffs, or agent reliability will mis-scope decisions, over-promise to stakeholders, or get steamrolled in technical conversations.

This roadmap is built for that specific person: a PM who is new to AI and needs to go from zero to product-competent in about a month. It is not a certification course, not a developer tutorial, and not an executive summary. It is a structured thinking tool.

The core design premise is that every AI concept has four valid entry points, depending on where the reader is standing:

- **ELI5**, for when you need the intuition before the vocabulary
- **Normal**, for when you are ready to understand how it actually works
- **Technical**, for when you want the papers, the math, the precise mechanics
- **PM lens**, for when you need to translate the concept into a product, cost, or strategy decision

These are not levels to unlock in order. They are lenses you switch between depending on what the moment requires.

### What exists today

| | |
| --- | --- |
| Weeks | 5 |
| Sections | 22 |
| Depth variants per section | 4 |
| Interactive components | 13 |
| Knowledge check questions | 31 |
| Curated external links | 172 |

| Week | Focus | Sections |
| --- | --- | --- |
| 1 | Prompting and AI foundations | 4 |
| 2 | Data: embeddings, vectors, and RAG | 3 |
| 3 | Build: APIs, agents, and tools | 4 |
| 4 | Ship: fine-tuning, deploy, and AI PM | 3 |
| 5 | Agentic AI and orchestration | 8 |

The roadmap is structured across five weeks, not because AI mastery takes exactly five weeks, but because a time-bound structure forces momentum rather than leaving this as reference material you will get to eventually. Weeks 1 to 4 were the original arc. Week 5 was added later, when the agent tooling layer (MCP, agent-to-agent protocols, orchestration, agent memory, LLM-as-judge, guardrails) went from research curiosity to something PMs were being asked to scope. It is deliberately the longest week, because that layer moved fastest.

The "Learn more" resources at the end of each section point outward on purpose, to primary sources, papers, and tools. Depth is something you have to go get. This roadmap shows you where to look and why it matters.

There are no completion badges and no streaks. That is deliberate: completion mechanics optimise for finishing, not for understanding. You should revisit sections as your work demands it, not because a progress bar is at 80%.

---

## 2. Goals and non-goals

### Origin

This was built by a PM learning AI in practice, not in a classroom and not as a researcher. The author consumed blogs, tweets, videos, and documentation in an unstructured way for months. Each source was individually useful. None connected to the others. This roadmap is the synthesis that was missing: a structure that ties it together and shows how the pieces relate.

Every resource listed, every depth level, every interactive tool reflects what actually helped during that process. The target reader is not a hypothetical persona. It is another PM in the same position: smart, busy, technically curious, and tired of content that either talks down to them or assumes they are an engineer.

### Goals

**G1. Multi-lens comprehension, not surface familiarity**

Every concept is presented at four depths: intuition-first (ELI5), conceptual (Normal), mechanistic (Technical), and applied (PM lens). The goal is not that a reader knows what RAG is. It is that they can explain it to an engineer, reason about its cost, and decide when to use it over fine-tuning.

**G2. Hands-on feel without a lab setup**

Each section includes either an interactive tool or a quiz with explanation feedback. Thirteen sections carry a working component: token counter, temperature sampler, system prompt builder, embedding similarity, RAG pipeline walkthrough, API cost comparison, function call flow, agent reliability compounding, eval scorer, fine-tuning decision tree, unit economics calculator, model router, and an action risk taxonomy. A reader should leave a section having done something, not just read something. None of it requires an API key, an account, or a paid tool.

**G3. Curated depth, not comprehensive coverage**

The "Learn more" resources are hand-selected rather than exhaustive. The goal is to give the reader a trusted starting point for going deeper, not to be the endpoint. Curation implies judgment: these are the resources that actually built understanding, not everything that exists on the topic.

**G4. Momentum through structure, not completion mechanics**

The five-week structure exists to create a learning arc with a beginning, a middle, and an end, without being prescriptive about pace. The structure says: here is a reasonable order. The reader decides how fast.

### Non-goals

**NG1. Not a course with completion tracking**

There are no badges, no streaks, and no metrics that pressure progress. Completion mechanics optimise for finishing, not for understanding. A PM who clicks through every section in a weekend and ticks every box has learned nothing useful.

The application does persist navigation state, depth preferences, and theme to localStorage, so you can close the tab and resume without re-navigating. There is no login and no server-side storage. The absence of pressure mechanics is the point: it leaves the reader in charge of their own standard.

**NG2. Not a comprehensive AI curriculum**

This roadmap covers the topics a PM encounters in their first year of building AI products. Computer vision, reinforcement learning, and training models from scratch are excluded, not because they are unimportant, but because they are not where a product-focused PM should start.

**NG3. Not a substitute for primary sources**

The explanations here are starting points. The papers, courses, and tools linked in each section are where real depth lives. This roadmap is a map. It shows what exists and why it matters. Going there is on you.

**NG4. Not opinionated about tools or vendors**

Where tools are named (Pinecone against Chroma, OpenAI against Anthropic), they are presented with tradeoffs rather than endorsements. The goal is to teach the decision framework, not the answer.

---

## 3. Architecture decisions

---

### Decision 3.1. Single-file component architecture

**Context**

The first question was: what is the right unit of distribution for a learning tool? An app implies a service, something hosted, maintained, logged into, updated. A document implies passivity, something you read linearly. Neither matched the intent. The goal was closer to an interactive reference: open it, navigate freely, go as deep as you want, close it.

**Decision**

All rendering lives in one file, `src/ai-mastery-roadmap.jsx`: layout, navigation, the thirteen interactive components, quiz logic, and styling. There is no routing library, no CSS file, and no component folder.

The alternative was a conventional multi-file React project: a component file per section, CSS modules or Tailwind, React Router for week navigation. That is the standard approach at this scope. It was rejected.

**Rationale**

The multi-file structure optimises for maintainability at scale, and this project deliberately does not scale. One author, a bounded content set, no planned features that require component isolation.

A single file means a contributor can understand the whole product in one read, there is no import tree to trace and no abstraction to pierce, and forking means copying a file. The architecture reflects the product philosophy: this is not an app, it is a file. That framing drove the downstream choices, including inline styles instead of CSS files.

**Consequences**

The file is now 1,726 lines. It needs search to navigate in an editor, and it exceeds what some tools will read in one pass. Every new interactive component makes it longer.

**Amended, week 5.** The original decision put content in this file too. That half no longer holds. Content moved out to `src/data/`, which is documented in Decision 3.4. The rendering half of the decision stands: the components, styling, and interaction logic remain in one file, and the reasoning above is why.

---

### Decision 3.2. Zustand for state, with localStorage persistence

**Context**

The project originally used only `useState`, because the design philosophy in Decision 3.1 avoided persistence entirely: no progress tracking, no completion badges.

That turned out to conflate two different things. Readers did not want gamification. They did want to close the tab and come back to the same place, at the same depth level, in the same theme. Persistence for convenience is not persistence for pressure.

**Decision**

The application uses Zustand with the `persist` middleware. The store is `src/store.js`, 92 lines, and it holds:

- Navigation: `currentWeekId`, `currentSectionId`
- Interface state: `expandedSections`, `selectedDepthLevels` (per section), `selectedDepthLevel` (global, for the resources sidebar)
- Theme: `darkMode`, initialised from `prefers-color-scheme`
- Progress: `completedSections`, `quizAnswers`

Everything is persisted under the localStorage key `roadmap-progress` and restored on load. Sets are stored as arrays, because Sets do not survive JSON serialisation.

**Rationale**

Zustand was chosen over Context and over Redux for three reasons.

1. **Minimal complexity.** No providers, no reducers, no action types. A component subscribes to the slice it uses, which keeps re-renders narrow.
2. **Persistence is built in.** The `persist` middleware handles serialisation both ways. Context would have meant hand-writing that and cleaning up after it in `useEffect`.
3. **It matches the scale.** Redux is over-engineered here. Context needs provider wrapping and manual persistence. Zustand's API surface is small enough not to feel like an addition.

This preserves NG1. There are still no badges, streaks, or completion pressure. What is saved is position, not performance.

**Consequences**

State now lives outside the single file, which adds one abstraction layer. That is acceptable: the store is single-purpose, under a hundred lines, and the persistence boundary is explicit.

`completedSections` and `quizAnswers` are written but not yet surfaced in the interface. They exist so that a future review view (which questions you got wrong, which sections you marked done) does not need a schema migration. Until something renders them, they are dead weight in localStorage, and that is a known cost.

---

### Decision 3.3. Inline styles over a CSS custom property layer, no framework

**Context**

React projects usually separate styling from component logic through CSS files, CSS modules, or a utility framework. Each trades setup for scalability and separation of concerns.

**Decision**

Styles are inline JavaScript objects on JSX elements. No CSS modules, no Tailwind, no styled-components. One `<style>` block is injected by the root component for the things inline styles cannot express: CSS custom properties, `@media` queries, focus-visible rules, and selection styling.

**Rationale**

Tailwind and CSS modules both require build configuration and impose a mental model on top of CSS. For a single-file, single-author project, both add friction without a matching benefit.

Inline styles have a specific advantage here, which is that this app's styling is dynamic. Week colours change with the active state, depth tabs highlight on selection, hover states are programmatic. Having the style sit next to the condition that drives it reads better than a class toggled from JavaScript:

```jsx
background: depth === d ? weekColor : "transparent"
```

That line carries both the condition and the visual outcome in one place.

**Consequences**

Inline styles cannot express pseudo-selectors. Hover is handled with `onMouseEnter` and `onMouseLeave`, so hover lives in JavaScript state. That is more verbose per element, and it is the price of keeping visual logic in one place.

**Amended, week 5.** The original version of this decision accepted hardcoded hex values scattered through the file, and noted that changing the base background would mean a find and replace. That cost came due during the design pass. The injected `<style>` block now defines a token layer on `:root`:

- Type: `--display` (Outfit), `--body` (Source Sans 3), `--mono` (IBM Plex Mono)
- Surfaces: `--bg-primary` through `--bg-card`, off-white rather than pure white
- Text: `--text-primary` through `--text-light`, near-black rather than pure black
- Borders: `--border-color`, `--border-light`, `--border-hover`
- One accent, `--accent-primary`, used for focus, links, and selection
- A semantic palette (`--success`, `--warning`, `--danger`, `--info`, `--violet`, `--orange`, `--pink`) that every ad-hoc colour in the app now maps to

Tinted surfaces are derived in JavaScript by a `tint()` helper that runs `color-mix` over a semantic token, rather than being written out as a second set of hex values. Dark mode redefines the same token names under `:root.dark-mode`, which is what makes a theme switch possible at all (Decision 5.4). Fonts are loaded in `index.html` with `preconnect`, never with a runtime `@import`, because an `@import` inside an injected style block blocks first paint.

---

### Decision 3.4. Content extracted from code into JSON

**Context**

The application holds a lot of structured content: 22 sections, four depth variants of prose each, quiz questions with scored answers, curated resource lists, and visual metadata.

The original decision was to keep all of it in a `WEEKS` constant at the top of `ai-mastery-roadmap.jsx`, colocated with the components rendering it. The reasoning was that content and code were coupled anyway, because the `interactive` field names a component by string key, the `quiz` field embeds answer indices the quiz component interprets, and `color` drives styling across a whole week. Splitting the files would move that coupling without removing it, and add navigation cost with no organisational benefit.

**Decision, reversed**

Content now lives in `src/data/week1.json` through `week5.json`. `src/data/index.js` imports the five files and exports them as a `WEEKS` array, so every consuming component is unchanged.

**Rationale for the reversal**

The original reasoning held at four weeks. It stopped holding when week 5 was drafted, for three reasons.

First, size. `WEEKS` grew past the point where the rendering code was findable inside its own file. Scrolling through thousands of lines of prose to reach a component is not colocation, it is burial.

Second, the edit loop. Writing content and writing components are different activities with different rhythms. Content editing is long, prose-shaped, and frequent. Component editing is short, structural, and rare. Mixing them meant every content edit produced a diff against the file where the logic lived, which made review harder than it needed to be.

Third, the coupling argument was weaker than it looked. The contract is narrow: a string key for `interactive`, an integer index for `correct`, a hex string for `color`. That contract survives a file boundary intact. The original decision treated a narrow contract as though it were a deep one.

A CMS was considered again and rejected again, on the original grounds. The only editor is the author, so a CMS solves a collaboration problem that does not exist. CMS content is fetched at runtime, which introduces loading states and failure modes this project currently has none of. And CMS tools cost money and require accounts, which contradicts the zero-infrastructure premise. JSON files bundled at build time keep the runtime exactly as static as before.

**Consequences**

Adding a week means adding a JSON file and one line in `index.js`. Adding a section means editing one JSON file, with no risk of touching rendering code by accident.

The costs are real. JSON has no comments, so anything explanatory has to live in the README instead of next to the field it describes. JSON prose has to be escaped, which makes long passages harder to write and quotes easy to break. And there is now nothing enforcing that a section's `interactive` key matches a component that exists. A typo there renders nothing at all, silently, at runtime. See the note on schema validation in Section 7.2.

---

## 4. Tech stack and delivery decisions

---

### Decision 4.1. Vite over Next.js

**Context**

Next.js is the default choice for many React applications, offering server rendering, file-based routing, and API routes. Vite is leaner: a build tool and a dev server, without the framework opinions.

**Decision**

Vite with `@vitejs/plugin-react`. No Next.js.

**Rationale**

Next.js solves problems this project does not have. Server rendering needs a server, and everything here is static and bundled at build time. File-based routing assumes multiple pages, and this is one page where week navigation is a state variable. API routes assume a backend, and there is none.

Every Next.js feature over Vite maps to a requirement this project lacks. Choosing it would mean inheriting its conventions, its build output, and its deployment assumptions for no return. Vite compiles JSX into a browser-runnable app with a fast dev server. The dependency tree is four packages, and `vite.config.js` is six lines.

**Consequences**

The output is a static bundle, which suits static hosting. If the project ever needed server-rendered pages for SEO, or API routes for accounts, moving to Next.js would be a meaningful refactor. That is accepted as a future cost if the requirements change.

---

### Decision 4.2. JavaScript over TypeScript

**Context**

TypeScript is the default for production React, offering compile-time checking, autocomplete, and self-documenting interfaces, at the cost of annotations and a compile step.

**Decision**

Plain JavaScript JSX. No TypeScript.

**Rationale**

TypeScript's value is highest in team environments with complex shared data flows, where the type acts as a contract between developers.

This project has one author and one data shape, defined once and consumed by a handful of components. There are no team contracts to enforce and no ambiguous shapes to document. Writing definitions for `Week`, `Section`, `Depths`, `QuizQuestion`, and `Resource` before writing a line of content would add ceremony before it added safety.

**Consequences**

A contributor has to infer the section shape from an existing entry rather than read a type. That was a mild cost when content lived in JavaScript. It is a slightly larger one now that content is JSON authored by hand, because a misspelled field fails silently at runtime rather than loudly at write time. A JSON schema would address this without adopting TypeScript, and is noted in Section 7.2.

---

### Decision 4.3. GitHub Pages via Actions, on a custom domain

**Context**

The build is a static bundle, so the hosting requirement is minimal: serve files, terminate TLS, do not cost anything, and do not need attention between deploys.

An earlier workflow, `.github/workflows/deploy.yml`, pushed the build to a VPS over rsync and SSH. It worked until the host credentials stopped being valid, and then it failed on every push while the site stayed frozen at the last good build. A deploy path that fails silently in the background is worse than no deploy path.

**Decision**

`.github/workflows/pages.yml` builds on every push to `main` and publishes to GitHub Pages. It uses `actions/configure-pages`, `actions/upload-pages-artifact`, and `actions/deploy-pages`, which authenticate through OIDC (`id-token: write`) rather than through a stored secret. `workflow_dispatch` is enabled so a deploy can be re-run without an empty commit. Concurrency is grouped under `pages` with `cancel-in-progress: false`, so a push during a deploy queues rather than cancelling a publish halfway.

The site is served at `ai-pm.rubycatharin.com`. The domain is declared in `public/CNAME`, which Vite copies verbatim into `dist/`, so the custom domain survives every deploy without being re-entered in repository settings. `base` in `vite.config.js` stays at the default `/`, which is correct for a custom domain and would be wrong for a `github.io/repo-name` path.

**Rationale**

Pages removes the parts of the old setup that broke: no server to keep patched, no SSH key to rotate, no secrets to expire. Publishing is tied to the same event that produces the build, so the deployed site cannot drift from `main`.

The alternatives were Netlify and Vercel, both of which would work. Pages won on the grounds that the repository is already on GitHub, so it adds no account, no third-party access to the repository, and no dashboard to check.

**Consequences**

Pages serves static files and nothing else. There are no redirects beyond the apex behaviour, no headers configuration, and no serverless functions. If any of those become necessary, this decision gets revisited.

The old `deploy.yml` is still in the repository and still failing on every push. It is retained rather than deleted pending a decision on the VPS itself, and it is noise in the Actions tab until then.

---

## 5. UX and interaction design decisions

---

### Decision 5.1. Sections collapsed by default

**Context**

A week holds between three and eight sections. Each section holds up to four depth variants of prose, an interactive component, a quiz, and a resource list. Rendering all of it at once would put thousands of words on screen before the reader has said what they want.

**Decision**

Sections render collapsed. The section header is a button that toggles its content. Which sections are open is held in `expandedSections` and persisted, so reopening the tab restores the same view.

**Rationale**

This is progressive disclosure: show the structure first, reveal the content on demand. A reader landing on a week sees a clean index of titles and subtitles, navigates to what they need, and the detail appears when they ask for it.

Opening everything by default would put several thousand words in front of the first scroll. That costs twice: the reader has to work out what is relevant before reading anything, and the section titles, which are the clearest navigational signal, get buried inside the content instead of forming a list.

The default matters most on a first visit, which is exactly when nothing is persisted. A returning reader is usually coming back for one specific thing, and restoring their previous open sections puts them where they were.

**Amended, week 5.** The original decision said there was no memory of which sections had been opened, and justified it by the stateless architecture. Both halves are gone. `expandedSections` persists (Decision 3.2), and the architecture is not stateless. Collapsed-by-default is now the first-visit default, not a permanent condition.

**Consequences**

There is no expand-all. A reader who wants to skim a whole week has to open sections individually. That is accepted friction: choosing what to open is a navigational decision worth preserving, and it discourages passive scrolling.

Week 5 tests this more than the others, because eight collapsed sections make for a long index. If a week ever runs past ten, the index itself will need work.

---

### Decision 5.2. Four depth tabs as parallel lenses, not a sequence

**Context**

Every topic here has several valid entry points, depending on the reader's background and on the conversation they are about to have. A PM explaining RAG to a CEO needs different language than the same PM specifying a RAG pipeline with an engineer. The same concept has to serve both.

**Decision**

Each section presents four tabs, rendered as equal alternatives. The reader picks one. Tabs do not unlock in sequence, none is marked recommended, and all four are available the moment a section opens.

| Tab | What it gives the reader |
| --- | --- |
| ELI5 | Intuition, a mental model before the vocabulary |
| Normal | Understanding, how it works in plain language |
| Technical | Mechanics, papers, math, implementation detail |
| PM lens | Application, cost reasoning, decisions, metrics, strategy |

**Rationale**

Tabs rather than stacked sections communicate a reading intention. A scrolling layout implies you should pass through all four depths in order. Tabs imply you should pick the one that fits your context and come back when the context changes.

That matches how PMs actually use technical knowledge. Nobody reads ELI5 once and graduates permanently to Technical. You switch by audience and task: ELI5 to onboard a non-technical stakeholder, Technical to scope with an ML engineer, PM lens to write a build-versus-buy recommendation.

The PM lens sits alongside the other three rather than as a footer beneath the technical content. That placement is deliberate. Product thinking about a technical concept is not a simplified version of technical understanding. The PM lens carries material that appears nowhere else in the section: cost modelling per feature, vendor selection frameworks, metrics to instrument from day one, and the reasoning for when a technology is the right answer versus when something simpler solves the same problem.

Four maps to four genuinely different needs. Three would collapse either the intuition layer or the application layer. Five would invent a distinction the content could not fill.

**Consequences**

A reader who only ever opens one tab per section gets an incomplete picture of each concept, by design. The roadmap assumes people come back as their context changes. It does not enforce a reading order.

Four variants per section is also the largest single cost in authoring. Twenty-two sections means 88 pieces of prose, and every factual correction has to be applied in up to four places. This is the main reason the roadmap grows slowly.

---

### Decision 5.3. Per-question feedback, not end-of-quiz scoring

**Context**

Sections end with a knowledge check, one or two multiple choice questions, with an explanation revealed after each answer. There are 31 questions across the roadmap. There are no points, streaks, or badges anywhere in the application.

**Decision**

Immediate per-question feedback with explanations. Gamification was excluded.

**Rationale**

The design rests on the testing effect: being tested on information produces stronger retention than re-reading it. The mechanism is retrieval practice, where actively recalling something, even imperfectly, strengthens the memory. That is why the quiz has value even when the answer is wrong.

Immediate feedback matters because a wrong answer is most correctable in the seconds right after committing to it. Move on without correction and the wrong model starts to set. Surfacing the explanation at the moment of the error is when the reader is most receptive to updating. End-of-quiz scoring misses that window entirely.

Gamification was rejected on separate grounds. Streaks, points, and completion percentages create extrinsic motivation, where the reader does the thing to get the reward. For an audience that already wants to understand AI, extrinsic rewards compete with the intrinsic motivation that brought them here. Someone optimising for a badge behaves differently from someone optimising for understanding.

The quiz is a nudge, not a mechanic. Anything more would turn a learning tool into a game, which is a different product.

**Consequences**

Without tracking or points there is no loop pulling a reader back to the app. Someone who skips every quiz loses nothing measurable. That is accepted, because the target reader is self-directed. The quiz serves comprehension, not engagement.

`quizAnswers` is recorded in the store as an append-only log of every attempt, including repeats. Nothing reads it yet. When something does, it should show which concepts a reader got wrong, not a score.

---

### Decision 5.4. Theme follows the system, and remembers an override

**Context**

The roadmap is read in long sessions, often in the evening, and increasingly on phones where the system theme is not a preference so much as an expectation. A light-only interface fails that.

**Decision**

`darkMode` initialises from `window.matchMedia('(prefers-color-scheme: dark)')` and is persisted once the reader overrides it. Dark mode redefines the token set from Decision 3.3 under `:root.dark-mode`, so no component knows which theme is active.

An inline script in `index.html` reads `roadmap-progress` from localStorage and applies the theme class before the first paint. It has to run before the bundle, because a React effect applies the class one paint too late, and a white flash on a dark theme is the most visible bug a themed site can have.

**Rationale**

Applying the token swap at the `:root` level rather than in components is what keeps this cheap. Adding dark mode changed the values of the custom properties and nothing else. Had the colours still been inline hex strings, as the original Decision 3.3 accepted, a theme would have meant a conditional at every styled element in a 1,700 line file. Dark mode is the payoff for the token layer, not an addition to it.

Reading the system preference first respects a choice the reader already made at the OS level. Persisting the override respects the one they made here, which usually wins for a reason: their room, not their operating system.

**Consequences**

Dark mode doubles the surface of any visual change. Every new colour needs a value in both themes, and contrast has to be checked twice. The semantic palette absorbs most of that, since a new element referencing `--warning` is already correct in both.

The pre-paint script duplicates knowledge of the localStorage key and the persisted shape (`state.darkMode` inside the Zustand envelope). If either changes in `store.js`, the script in `index.html` breaks quietly and the flash comes back. That coupling is a known and unguarded cost.

---

## 6. Content and pedagogy decisions

---

### Decision 6.1. Synthesis over discovery

**Context**

The author learned AI the way most PMs do, through unstructured consumption across scattered sources: blog posts, threads, videos, talks, documentation. Each was individually useful. None connected.

The problem with unstructured learning is not a lack of information. There is more AI content available than anyone can consume. The problem is the absence of a mental model: a connected structure showing how concepts relate, which are foundational, which build on which, and why any of it matters for the work a PM actually does.

**Decision**

The roadmap is a synthesis tool. It does not introduce concepts unavailable elsewhere, and every topic has richer coverage in the linked resources. What it adds is connective structure: a deliberate sequence where each concept builds context for the next, and a PM lens on each answering the question the author kept asking while learning, which is why this matters for the work in front of me.

**Rationale**

The sequence was chosen from experience. Foundations first, covering what AI is, how it works, what it costs. Then data architecture, covering how to build products on your own data. Then building, covering APIs, tools, and agents, which is the product layer. Then shipping, covering evaluation, deployment, and the economics that separate demos from production. Week 5 extends the arc into orchestration, covering what happens when one agent becomes several, when they need protocols to talk to tools and to each other, and when they need memory, judgment, and guardrails to be trusted with anything real.

That last week broke the shape of the original four. It is eight sections against three or four, because the protocol and reliability layer arrived as a cluster rather than as a progression, and splitting it into two artificially balanced weeks would have implied a sequence that does not exist. Uneven weeks are the honest representation.

The roadmap was built for personal use first. Tools built for hypothetical users tend toward comprehensiveness, covering everything and committing to nothing. Tools built for a specific person by that person tend toward usefulness: including what actually helped, excluding what did not, annotating with what the author wished they had known.

---

### Decision 6.2. Curated external resources over original deep dives

**Context**

Each section ends with a "Learn more" list, between three and fifteen entries depending on how much good material exists, and 172 in total. The roadmap does not try to be the deepest source on any topic.

**Decision**

Resources were selected against four standards applied together: accessible without payment, credible at the source (primary documentation, peer-recommended educators, original papers), hands-on where the concept benefits from interaction, and primary over derivative, which means the original RAG paper rather than a blog post summarising it.

Curation drew on three inputs: personal use, meaning resources that genuinely helped during the author's own learning; peer recommendation, meaning sources with strong credibility signals in the AI PM and ML community; and AI-assisted gap-filling in areas where personal experience was thinner, with the author's judgment as the final filter.

**Rationale**

Not writing original deep dives is a scope decision, not a capability one. Deep original content would make this a course, competing with Karpathy, fast.ai, and Anthropic's own documentation. It would lose. Those sources have more depth, more credibility, and more production value than a single-author roadmap can match.

The comparative advantage here is the structure connecting the topics and the PM lens that makes them actionable. Pointing outward for depth is an accurate statement of what this tool is for.

**Consequences**

The roadmap's usefulness has a shelf life tied to its links. Courses go offline, pricing pages change, papers get superseded. Week 5 is the most exposed, because protocol specifications like MCP and A2A are still moving and its links point at documentation that is being revised rather than at settled papers.

---

## 7. Known tradeoffs and future considerations

---

### 7.1. Tradeoffs accepted at build time

Every decision in this document carried a cost. These were accepted knowingly, not overlooked.

---

**Single-file rendering, at the cost of navigability**

`ai-mastery-roadmap.jsx` is 1,726 lines. It needs search to navigate, and there is no module boundary to orient a contributor. Extracting content to JSON removed the worst of the growth, but the file still holds all thirteen interactive components alongside the layout. Splitting components into `src/components/` is the natural next refactor, and it is not urgent while there is one author.

---

**Inline styles, at the cost of CSS-native hover**

Inline styles cannot express pseudo-selectors, so hover is implemented with JavaScript event handlers on every interactive element. That is verbose, and it means hover state re-renders a component where CSS would not have. Focus rings are handled in the injected block instead, because getting keyboard focus wrong is an accessibility failure rather than a stylistic one. The original version of this tradeoff also listed the absence of design tokens. That is resolved, per Decision 3.3.

---

**No TypeScript, at the cost of validation**

A misspelled field in a week JSON file surfaces as a blank area in the browser, not as an error in the editor. There is no autocomplete for the section shape. Two specific failures are silent: an `interactive` key that names a component which does not exist, and a `correct` index pointing past the end of an `options` array. Both would be caught by a JSON schema, which is the cheaper fix (Section 7.2).

---

**Mock data in interactive components, at the cost of representational accuracy**

The embedding similarity demo uses hardcoded 4-dimensional vectors. Real embeddings have 768 to 3072 dimensions. The cosine similarity math is correct, but the semantic relationships are hand-constructed rather than emergent from a model. Accepted, because live API calls would need keys, cost money, add loading states, and introduce failure modes. The demo builds the right intuition, and the linked resources carry the reader to the real thing.

---

**Curated external links, at the cost of decay**

172 links, no automated checking. Courses go offline, documentation URLs move, pricing pages change. This cost is invisible until a reader hits a dead link, which makes it the least likely maintenance task to get done on time.

---

**Uneven week lengths, at the cost of a predictable arc**

Week 5 is more than twice the length of week 2 or week 4. A reader budgeting a week per week will find the last one does not fit. Accepted, because the alternative was splitting a topic cluster into two weeks that would imply a progression that does not exist. It does mean "five weeks" describes the structure better than it describes the time.

---

### 7.2. Future considerations

---

**Search across sections**

There is no way to search a concept across all 22 sections. Now that content is JSON, a client-side search over the imported `WEEKS` array is straightforward: one component, one input in the header or sidebar, no architecture change. This is the highest value per unit of effort of anything on this list, and it got more valuable when week 5 pushed the roadmap past twenty sections.

---

**A schema for the week files**

A JSON schema for the week and section shape would catch the failures TypeScript would have caught, without adopting TypeScript. Validating in CI on every push would turn a silent runtime blank into a failed check. This is the cheapest remaining fix for the most annoying remaining class of bug.

---

**Surfacing what is already recorded**

`completedSections` and `quizAnswers` are persisted and unused. A review view built on them, showing which questions were answered wrong and linking back to the explaining section, would use data the store already holds. It has to be built carefully: the point is to show which concepts have not landed, not to display a score. A score would reintroduce the completion pressure that NG1 exists to keep out.

---

**Real interactive demos with live API calls**

The token calculator and temperature sampler are self-contained and accurate. Making the embedding demo real would need either user-supplied API keys, which add friction and a security risk if mishandled, or a backend proxy holding the key server-side, which adds infrastructure, rate limiting, and cost management. If this matters, the proxy is the right path, and it is a meaningful change to a project that currently has no server.

---

**Content freshness signalling**

AI moves fast. Model pricing changes quarterly, architectures emerge, API behaviour shifts. There is no mechanism telling a reader when a section was last verified. A `lastUpdated` field per section plus one line of rendering would cost almost nothing and would tell readers which content to check against primary sources first. Week 5 needs this most, since its subject matter is the least settled.

---

*Built by a PM, for PMs. Fork it, extend it, make it yours.*
