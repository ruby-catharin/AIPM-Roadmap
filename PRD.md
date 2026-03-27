# Product Requirements Document
## AI Mastery Roadmap — PM Lens

**Author:** Ruby
**Type:** Decision PRD — documents the reasoning behind every meaningful choice made in building this tool
**Status:** Complete

---

> This is not a spec for what to build next. It is a record of what was built, why every significant choice was made, and what each choice cost. Read it if you are contributing, forking, or evaluating this project.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Goals & Non-Goals](#2-goals--non-goals)
3. [Architecture Decisions](#3-architecture-decisions)
4. [Tech Stack Decisions](#4-tech-stack-decisions)
5. [UX & Interaction Design Decisions](#5-ux--interaction-design-decisions)
6. [Content & Pedagogy Decisions](#6-content--pedagogy-decisions)
7. [Known Tradeoffs & Future Considerations](#7-known-tradeoffs--future-considerations)

---

## 1. Overview

Most AI learning resources are built for engineers or for complete beginners — PMs fall into a gap. They are not learning to build models, but they cannot afford to treat AI as a black box either. A PM who cannot reason about token economics, RAG tradeoffs, or agent reliability will make scoped decisions, over-promise to stakeholders, or get steamrolled in technical conversations.

This roadmap is built for that specific person: a PM who is new to AI and needs to go from zero to product-competent in one month. It is not a certification course, not a developer tutorial, and not an executive summary. It is a structured thinking tool.

The core design premise is that every AI concept has four valid entry points depending on where you are:

- **ELI5** — for when you need the intuition before the vocabulary
- **Normal** — for when you are ready to understand how it actually works
- **Technical** — for when you want the papers, the math, the precise mechanics
- **PM Lens** — for when you need to translate the concept into a product, cost, or strategy decision

These are not levels to unlock in order. They are lenses you switch between depending on what the moment requires.

The roadmap is structured across 4 weeks — not because AI mastery takes exactly 4 weeks, but because a time-bound structure forces momentum rather than treating this as reference material you will get to eventually. The "Learn More" resources at the end of each section are intentionally external: they point outward to primary sources, papers, and tools. Depth is something you have to go get — this roadmap shows you where to look and why it matters.

There is no progress tracking, no completion badges, and no streaks. That is a deliberate choice: completion mechanics optimise for finishing, not for understanding. You should revisit sections as your work demands it, not because a progress bar is at 80%.

---

## 2. Goals & Non-Goals

### Origin

This was built by a PM learning AI in practice — not in a classroom, not as a researcher. The author consumed blogs, tweets, YouTube videos, and documentation in an unstructured way for months. Each source was individually useful. None connected to the others. This roadmap is the synthesis that was missing: a structure that ties it all together and shows how the pieces relate.

Every resource listed, every depth level, every interactive tool reflects what actually helped during that process. The target reader is not a hypothetical persona — it is another PM in the same position: smart, busy, technically curious, and tired of content that either talks down to them or assumes they are an engineer.

### Goals

**G1 — Multi-lens comprehension, not surface familiarity**
Every concept is presented at four depths: intuition-first (ELI5), conceptual (Normal), mechanistic (Technical), and applied (PM Lens). The goal is not that a reader *knows* what RAG is — it is that they can explain it to an engineer, reason about its cost, and decide when to use it over fine-tuning.

**G2 — Hands-on feel without a lab setup**
Each section includes either an interactive tool (token calculator, temperature visualiser, embedding similarity demo, RAG pipeline walkthrough, system prompt builder) or a quiz with explanation feedback. A reader should leave each section having *done* something, not just read something. Critically: none of this requires an API key, account, or paid tool.

**G3 — Curated depth, not comprehensive coverage**
The "Learn More" resources are hand-selected — not exhaustive. The goal is to give the reader a trusted starting point for going deeper, not to be the endpoint itself. Curation implies judgment: these are the resources that actually built understanding, not everything that exists on the topic.

**G4 — Momentum through structure, not completion mechanics**
The 4-week structure exists to create a learning arc — a beginning, middle, and end — without being prescriptive about pace. The structure says: here is a reasonable order. The reader decides how fast.

### Non-Goals

**NG1 — Not a course with completion tracking**
There are no gamification mechanics, no badges, no streaks, and no metrics that *pressure* progress. This is deliberate: completion mechanics optimise for finishing, not understanding. A PM who clicks through all sections in a weekend and checks every box has learned nothing useful.

The application does persist navigation and depth level preferences to localStorage for user convenience (so you can close and resume without manual navigation), but there is no login, no server-side storage, and no pressure to complete. The absence of *pressure* mechanics is a feature — it puts the reader in charge of their own standard.

**NG2 — Not a comprehensive AI curriculum**
This roadmap does not cover every AI topic. It covers the topics a PM encounters in their first year of building AI products. Computer vision, reinforcement learning, model training from scratch — these are excluded not because they are unimportant, but because they are not where a product-focused PM should start.

**NG3 — Not a substitute for primary sources**
The explanations here are starting points. The papers, courses, and tools linked in each section are where real depth lives. This roadmap is a map — it shows you what exists and why it matters. Going there is on you.

**NG4 — Not opinionated about tools or vendors**
Where tools are mentioned (Pinecone vs. Chroma, OpenAI vs. Anthropic), they are presented with tradeoffs — not endorsements. The goal is to teach the decision framework, not the answer.

---

## 3. Architecture Decisions

---

### Decision 3.1 — Single-file component architecture

**Context**

The fundamental question when starting this project was: what is the right *unit of distribution* for a learning tool? An app implies a service — something hosted, maintained, logged into, updated. A document implies passivity — something you read linearly. Neither matched the intent. The goal was something closer to an interactive reference: open it, navigate freely, go as deep as you want, close it.

**Decision**

The entire application — content data, interactive components, quiz logic, styling, and layout — lives in a single file: `src/ai-mastery-roadmap.jsx`. There is no routing library. There are no separate CSS files. There are no component folders. The `WEEKS` data structure and the components that render it are colocated intentionally.

The alternative considered was a conventional multi-file React project: separate component files per section, a `data/` folder for content, CSS modules or Tailwind for styling, React Router for navigation between weeks. This is the standard approach for a React app of this scope. It was rejected.

**Rationale**

The multi-file structure was rejected for one reason: it optimises for *maintainability at scale*, and this project deliberately does not need to scale. It has one week of content per module, one author, and no planned feature additions that would require component isolation.

A single file means:
- A contributor can understand the entire product in one read
- The content (what to learn) and the structure (how to navigate it) are never separated — they evolve together
- There is no build complexity to debug, no import tree to trace, no abstraction to pierce
- Forking the project means copying one file

The architecture reflects the product philosophy: this is not an app. It is a file. That framing guided every downstream decision — inline styles instead of CSS files, `useState` instead of a state manager, a `WEEKS` array instead of a database.

**Consequences**

The single-file choice has real costs. At 890 lines, the file is difficult to navigate in an editor without search. It is not readable in tools that impose token limits. Adding a new week requires editing the same file where the rendering logic lives — content and code are coupled. These are accepted costs. The alternative — a well-structured multi-file project — would have been solving for a different problem: a collaborative, extensible product. That was never the goal.

---

### Decision 3.2 — Lightweight state management with Zustand for progress persistence

**Context**

React apps that share data across many components or need to persist state across sessions often require a state management library. Initially, this roadmap used only React's built-in `useState` because the design philosophy (Decision 3.1) explicitly avoided persistence features — "no progress tracking, no completion badges."

However, user feedback and observed behavior indicated that while users rejected *gamification mechanics*, they did value being able to return to where they left off without manually navigating back. This represented a shift in the non-goal boundary: persistence for user convenience (not completion optimization) became valuable.

**Decision**

The application now uses Zustand for centralized state management with automatic persistence to localStorage. Three types of state are tracked:
- Navigation state (`currentWeekId`, `currentSectionId`) — which section the user is viewing
- UI state (`expandedSections`, `selectedDepthLevels`) — which sections are expanded and which depth level is selected per section
- Progress tracking (`completedSections`, `quizAnswers`) — optional future integration for quiz performance

All state is automatically persisted to localStorage under the key `'roadmap-progress'` and restored on page load.

**Rationale**

Zustand was chosen over React Context API or Redux for three reasons:

1. **Minimal complexity** — Zustand requires no providers, no reducers, no action types. A component subscribes to only the state it uses, resulting in fine-grained reactivity and minimal unnecessary re-renders. This keeps the pattern lightweight despite adding persistence.

2. **Built-in localStorage integration** — Zustand's `persist` middleware handles serialization/deserialization automatically. This eliminates the need for manual `useEffect` cleanup and boilerplate that Context API would require.

3. **Alignment with project scale** — Redux would be over-engineered. Context API would require provider wrapping and manual persistence logic. Zustand's minimal API surface matches this project's single-author, bounded-scope nature while staying simpler than either alternative.

The decision preserves the original non-goal (NG1: "not a course with completion tracking") — there are no badges, streaks, or metrics that *pressure* completion. The persistence is purely convenience: users can close the tab and resume where they left off, without being nudged to progress.

**Consequences**

State now lives in a separate file (`src/store.js`), creating a new abstraction layer. This is acceptable because:
- The store is single-purpose and under 100 lines
- Components no longer carry local state for things that benefit from persistence, reducing their individual complexity
- The persistence boundary is explicit and testable

Future features that could leverage this state:
- Export progress as JSON for shareable snapshots
- Analytics on which sections spend the most time
- Dark/light mode preference persistence
- Quiz performance tracking and review

---

### Decision 3.3 — Inline styles with a single injected `<style>` block, no CSS framework

**Context**

React projects typically separate visual styling from component logic — either through external CSS files, CSS Modules, or a utility framework like Tailwind CSS. Each approach trades some amount of setup and configuration for better scalability and separation of concerns.

**Decision**

All styles are written as inline JavaScript objects directly on JSX elements. No CSS files, no CSS Modules, no Tailwind, no styled-components. A single `<style>` tag is injected in the root component to handle three things inline styles cannot: CSS custom properties (font family variables), `@media` queries for mobile layout, and the Google Fonts `@import`.

**Rationale**

Tailwind and CSS Modules both require build configuration and impose a mental model on top of CSS itself. For a single-file, single-author project, both approaches add friction without adding benefit.

Inline styles have a specific advantage here: they are co-located with the logic that generates them. Because this app's styling is dynamic — week colours change based on active state, depth tab highlights change on selection, hover states are programmatic — having the style live next to the condition that controls it is easier to read than a CSS class toggled from JavaScript. For example:

```jsx
background: depth === d ? weekColor : "transparent"
```

That one line communicates both the condition and the visual outcome in the same place. The `<style>` tag injection is a deliberate narrow exception — it exists only for things CSS cannot do inline, not as a general escape hatch.

**Consequences**

Inline styles cannot express pseudo-selectors natively. Hover effects are handled via `onMouseEnter` / `onMouseLeave` event handlers, which means hover state is JavaScript state rather than CSS state. This is slightly more verbose but keeps all visual logic in one place.

Colour values are repeated as hardcoded hex strings throughout the file rather than centralised in a design token system. Changing the base background colour requires a find-and-replace rather than editing one variable. For a single-author project with a stable visual identity, this is an accepted tradeoff.

---

### Decision 3.4 — Content data colocated with rendering code

**Context**

The application contains substantial structured content: 4 weeks of material, each with 3–4 sections, 4 depth levels of text per section, quiz questions with scored answers, curated resource lists, and visual metadata (colours, icons). A standard content architecture would separate this data from the rendering components — into a JSON file, a headless CMS, or a database.

**Decision**

All content lives in a single `WEEKS` constant at the top of `ai-mastery-roadmap.jsx`, colocated with the components that render it. No external data source, no API calls, no separate content files.

**Rationale**

The content in this project is not plain text. Every section contains structural references that are tightly coupled to rendering logic: the `interactive` field references a component by string key (`"tokenCalculator"`), the `quiz` field embeds answer indices that the `Quiz` component interprets, and the `color` field drives dynamic styling across the entire week. Separating the content from the code would create a false separation — the coupling would still exist, expressed as an implicit contract between a JSON file and the components expecting a specific shape.

A CMS was rejected for three reasons. First, the only editor is the author — a CMS workflow exists to let non-technical collaborators update content without touching code, a need that does not apply here. Second, CMS content is fetched at runtime, introducing loading states, API dependencies, and potential failure modes that this project has none of. Third, CMS tools cost money and require accounts — both contradict the zero-infrastructure philosophy.

A separate JSON file was also considered and rejected. It would split content from the code that interprets it without reducing their actual coupling. For a single-file, single-author project, the file boundary adds navigation cost with no organisational benefit.

**Consequences**

Editing content requires opening a JavaScript file. For a developer-author, this is no different from editing a JSON file. For a future non-technical contributor, this is a barrier. That barrier is accepted — the target contributor for this project is a technically curious PM, not a content editor.

The `WEEKS` array is large. Finding a specific section requires scrolling or search. This is a direct cost of colocation at this file size, and an argument for why this architecture does not scale beyond a single author maintaining a bounded content set.

---

## 4. Tech Stack Decisions

---

### Decision 4.1 — Vite over Next.js

**Context**

Choosing a build tool and framework is one of the first decisions in any React project. Next.js has become the default choice for many React applications, offering server-side rendering, file-based routing, and built-in API routes. Vite is a leaner alternative — a build tool and development server without the framework opinions.

**Decision**

Vite with `@vitejs/plugin-react` was used as the build tool. Next.js was not used.

**Rationale**

Next.js is built for problems this project does not have. Server-side rendering requires a server — this application has no server and needs none, as all content is static and bundled at build time. File-based routing assumes multiple pages — this application has one page, with week navigation handled by a single state variable. API routes assume a backend — this application makes no API calls and has no backend logic.

Every feature Next.js provides over Vite corresponds to a requirement this project does not have. Choosing Next.js would mean inheriting its conventions, its build output structure, and its deployment assumptions for a project that needs none of them.

Vite does one thing: it compiles JSX into a browser-runnable app with a fast development server. The entire dependency tree — `vite`, `@vitejs/plugin-react`, `react`, `react-dom` — is four packages. The `vite.config.js` is six lines.

**Consequences**

The application is deployed as a static build to a hosting service (GitHub Pages, Netlify, or Vercel static export). This is not a constraint in practice: static hosting is simpler, cheaper, and appropriate for a client-side-only application.

If the project ever required server-rendered pages for SEO, or API routes for user accounts, migrating from Vite to Next.js would be a meaningful refactor. That migration path is accepted as a future cost if requirements change.

---

### Decision 4.2 — JavaScript over TypeScript

**Context**

TypeScript has become the default language choice for production React applications, offering compile-time type checking, IDE autocomplete, and self-documenting interfaces. It requires writing explicit type annotations and a compilation step.

**Decision**

The application is written in plain JavaScript JSX. No TypeScript was introduced.

**Rationale**

TypeScript's primary value is in team environments with complex, shared data flows. Its type system acts as a contract between developers — when you define a `Section` type, every engineer who works with sections knows exactly what fields to expect without reading the data source.

This project has one author and one data structure: the `WEEKS` array, whose shape is defined once and referenced in a handful of components in the same file. There are no team contracts to enforce, no ambiguous data shapes to document, and no type errors likely to emerge from a structure that does not change.

TypeScript would have required writing type definitions for `Week`, `Section`, `Depths`, `QuizQuestion`, and `Resource` before writing a single line of content. For a project where the author both defined the data structure and wrote every component consuming it, that process adds ceremony without adding safety.

**Consequences**

If a contributor unfamiliar with the codebase wanted to extend the `WEEKS` data, they would need to infer the expected shape from reading existing entries rather than reading a type definition. This is a real onboarding cost in a team context. For the intended contributor profile — a technically curious PM following along and potentially adding a section — reading one existing `WEEKS` entry is sufficient to understand the shape.

---

## 5. UX & Interaction Design Decisions

---

### Decision 5.1 — Sections collapsed by default (progressive disclosure)

**Context**

Each week contains 3–4 sections. Each section contains up to four depth levels of text, an interactive component, a quiz, and a resource list. Displaying all of this simultaneously would present thousands of words on a single screen before the user has indicated what they want to read.

**Decision**

All sections render collapsed by default. Each section header is a clickable button that toggles its content open. The collapsed state is the initial value: `useState(false)`. There is no memory of which sections a user previously opened — every visit starts with all sections collapsed.

**Rationale**

The collapsed default applies a principle called **progressive disclosure**: show the structure first, reveal the content on demand. A user landing on any week sees a clean index of section titles and subtitles. They navigate to what they need. The detail appears only when they signal they want it.

The alternative — all sections open by default — would present approximately 4,000 words of content before the first scroll. This creates two problems. First, cognitive load: the user must parse what is relevant before they can start reading. Second, loss of navigability: the section titles — the clearest navigational signal — are buried in content rather than forming a clean list.

Collapsed-by-default also pairs correctly with the stateless architecture. Because the app stores no session data, every visit is a fresh start. A returning user — coming back to check a specific concept, re-read the PM Lens on RAG, or redo a quiz — is better served by a clean index than by finding all sections open. Collapsed is the right default for a tool designed to be revisited non-linearly.

**Consequences**

A first-time user must actively open every section they want to read. There is no "expand all" mode. This is accepted friction: the act of choosing which section to open is itself a navigational decision that the design preserves. It prevents passive scrolling through content and nudges the user toward intentional navigation.

---

### Decision 5.2 — Four depth tabs as parallel lenses, not sequential content

**Context**

Every topic in this roadmap has multiple valid entry points depending on the reader's background, their current task, and the conversation they need to have. A PM explaining RAG to their CEO needs different language than the same PM specifying a RAG pipeline to their engineering team. The same concept must serve both moments.

**Decision**

Each section presents content across four tabs — ELI5, Normal, Technical, PM Lens — rendered as equal alternatives. The reader selects one tab at a time. Tabs do not unlock sequentially. No tab is marked as default or recommended. All four are available immediately on expanding a section.

The four levels map to four genuinely distinct reader needs:

| Tab | What it gives the reader |
|---|---|
| ELI5 | Intuition — a mental model before the vocabulary |
| Normal | Understanding — how it actually works in plain language |
| Technical | Mechanics — papers, math, precise implementation details |
| PM Lens | Application — cost reasoning, product decisions, metrics, strategy |

**Rationale**

The tab structure, rather than scrolling sections, communicates a specific reading intention: these are alternative lenses, not a sequence to be read in order. A scrolling layout implies that a reader should pass through all four depths. The tab layout implies that a reader should pick the one that fits their current context and return to others when the context changes.

This reflects how PMs actually use technical knowledge. You do not read ELI5 once and graduate permanently to Technical. You switch based on audience and task — ELI5 when onboarding a non-technical stakeholder, Technical when scoping a feature with an ML engineer, PM Lens when writing a build-vs-buy recommendation for leadership. The same reader needs all four at different moments.

The PM Lens tab is positioned as an equal alongside ELI5, Normal, and Technical — not as a footer summary beneath the technical content. This is deliberate. Product thinking about a technical concept is not a simplification of technical understanding. The PM Lens tab contains content that does not exist in the other three: cost modelling per feature, decision frameworks for vendor selection, product metrics to instrument from day one, and the strategic reasoning for when a technology is the right choice versus when a simpler alternative solves the same problem. This content is original — it belongs at equal footing.

The number of depth levels — four — maps to four genuinely different cognitive needs. Three would collapse either the intuition layer or the application layer. Five would create false distinctions with insufficient content differentiation between adjacent levels.

**Consequences**

A reader who works through only one depth level per section gets an incomplete picture of each concept — by design. The roadmap assumes readers will return to sections as their context changes. The tool does not coerce a reading order — it provides structure for self-directed navigation.

---

### Decision 5.3 — Per-question immediate feedback quiz, not end-of-quiz scoring or full gamification

**Context**

Each section ends with a knowledge check: 1–2 questions, multiple choice, with an explanation revealed after each answer. There are no points, streaks, badges, or cumulative progress rewards anywhere in the application.

**Decision**

Quizzes use immediate per-question feedback with explanations. Full gamification was deliberately excluded.

**Rationale**

The quiz design is grounded in a learning science principle called the **testing effect**: being tested on information produces stronger long-term retention than re-reading the same information. The mechanism is retrieval practice — the act of actively recalling information, even imperfectly, strengthens the memory. This is why the quiz has value even when the user gets an answer wrong.

Immediate per-question feedback matters because wrong answers are most disruptive in the first moments after commitment. If a user answers incorrectly and moves on without correction, the wrong model begins to harden. Surfacing the explanation at the exact moment of error — before the user has moved on — is when the brain is most receptive to updating its understanding. End-of-quiz scoring, where all results appear after all questions, misses this window.

Full gamification — streaks, points, badges, completion percentages — was rejected on a different ground. These mechanics create extrinsic motivation: the user does the thing to get the reward. For a roadmap aimed at PMs who are already motivated to understand AI, extrinsic rewards compete with and potentially displace the intrinsic motivation that brought them to the tool. A user optimising for the badge behaves differently from a user optimising for understanding.

The quiz is positioned as a nudge, not a mechanic. It asks the user to retrieve one key concept from each section and shows them immediately whether their mental model is correct. Anything more would shift the product from a learning tool into a game — a different product with a different user behaviour.

**Consequences**

Without completion tracking or point systems, there is no feedback loop that encourages a user to return to the app or complete sections in sequence. A user who skips all quizzes loses nothing measurable. This is accepted: the target user is self-directed. The quiz exists to serve comprehension, not to enforce engagement.

---

## 6. Content & Pedagogy Decisions

---

### Decision 6.1 — Synthesis over discovery: why this roadmap exists

**Context**

The author learned AI concepts the way most PMs do — through unstructured consumption across scattered sources: blog posts, Twitter threads, YouTube videos, conference talks, documentation pages. Each source was individually useful. None connected to the others.

The problem with unstructured learning is not lack of information — there is more AI content available now than any person can consume. The problem is the absence of a mental model: a connected structure that shows how concepts relate to each other, which ones are foundational, which ones build on which, and why any of it matters for the specific work a PM does.

**Decision**

The roadmap is a synthesis tool. It does not introduce concepts that cannot be found elsewhere — every topic has richer coverage in the linked resources. What it provides is connective structure: a deliberate sequencing of concepts so that each one builds context for the next, and a PM Lens on each that answers the question the author kept asking while learning: *why does this matter for the work I actually do?*

**Rationale**

The four-week structure follows a specific progression chosen from experience: foundations first (what AI is, how it works, what it costs), then data architecture (how to build products that use your own data), then building (APIs, tools, agents — the actual product layer), then deployment (evaluation, safety, reliability — what separates demos from production). This is not the only valid sequence. It is the sequence that produced coherence for the author and reflects the order in which these problems appear in real product work.

The roadmap was built for personal use first. Tools built for hypothetical users tend toward comprehensiveness — covering everything, committing to nothing. Tools built for a specific person, by that person, tend toward usefulness — including what actually helped, excluding what did not, annotating with what the author wished they had known. The intended reader is not a persona — it is another PM in the same position the author was in, encountering the same gaps, asking the same questions.

---

### Decision 6.2 — Curated external resources over original deep-dive content

**Context**

Each section ends with a "Learn More" list of 4–8 external resources. The roadmap does not attempt to be the deepest source on any topic — it points outward to primary sources, courses, papers, and tools.

**Decision**

Resources were selected against four standards applied in combination: accessible without payment, credible source (primary documentation, peer-recommended educators, original research papers), hands-on where the concept benefits from interaction (playgrounds and tools over articles where possible), and primary over derivative (the original RAG paper over a blog post summarising it).

Curation followed three inputs: personal use — resources the author found genuinely useful during their own learning; peer recommendation — sources with strong credibility signals from the broader AI PM and ML community; and AI-assisted gap-filling — in areas where personal experience was thinner, AI was used to surface additional credible resources, with the author's judgment as the final filter.

**Rationale**

The decision not to write deep original content on each topic is a scope decision, not a capability one. Original deep-dive content would make this roadmap a course — something that competes with Karpathy, fast.ai, and Anthropic's own documentation. It would lose that competition. Those sources have more depth, more credibility, and more production value than a single-author roadmap can match.

The roadmap's comparative advantage is not depth of coverage on any individual topic. It is the structure that connects them and the PM Lens that makes them actionable. Pointing outward to better sources for depth is the correct acknowledgement of what this tool is for and what it is not.

**Consequences**

The roadmap's usefulness has a shelf life tied to its external resources. A linked course that goes offline, an API pricing page that changes, a paper that gets superseded — these are maintenance costs that come with curating external content rather than owning it. Some links will decay over time.

---

## 7. Known Tradeoffs & Future Considerations

---

### 7.1 — Tradeoffs accepted at build time

Every decision documented in this PRD carried a cost. These were accepted knowingly, not overlooked.

---

**Single-file architecture — cost: editor navigability**

At 890 lines, the file requires search to navigate efficiently. Adding content makes it longer. There is no natural module boundary to orient a contributor. The file will eventually become unwieldy for any scope beyond the current four weeks. This was accepted because the alternative solves a collaboration problem that does not exist for a single-author tool. If the project grows to five or six weeks with a second contributor, splitting `WEEKS` into `src/data/weeks.js` and components into `src/components/` is the natural first refactor.

---

**Inline styles — cost: no design token system**

Colour values are repeated as hardcoded hex strings throughout the file. `#080818` (the base background) appears in dozens of places. Changing the base colour requires a find-and-replace rather than editing one variable. Additionally, because inline styles cannot express CSS pseudo-selectors, all hover effects are implemented as JavaScript event handlers. This adds verbosity to every interactive element. Both costs were accepted because the alternative would add configuration overhead and break the co-location of visual logic with the conditions that drive it.

---

**No TypeScript — cost: no compile-time data validation**

If a new week entry in `WEEKS` has a misspelled field name, the error surfaces at runtime in the browser — not at write time in the editor. There is no autocomplete for the shape of a section object. A contributor adding a new section has to infer the expected structure from reading an existing entry. For a single author who knows the data shape, this is negligible. For a second contributor unfamiliar with the codebase, it is a real onboarding cost.

---

**Stateless architecture — cost: no memory across sessions**

Every visit to the application is a fresh start. Quiz scores are not saved. Which sections were opened is not remembered. A user who spent an hour working through Week 2 and returns the next day starts from scratch on navigation. This was accepted as a deliberate design philosophy — completion tracking optimises for finishing, not understanding. It remains a real cost for users who want to resume where they left off.

---

**Mock data in interactive components — cost: limited representational accuracy**

The embedding similarity demo uses hardcoded 4-dimensional vectors rather than real embeddings. Real embeddings have 768–3072 dimensions. The cosine similarity calculation is mathematically correct, but the semantic relationships demonstrated are manually constructed rather than emergent from a real model. This was accepted because live API calls would require API keys, introduce cost, create loading states, and add failure modes. The demo is accurate enough to build the right intuition; the linked resources carry the reader to the real thing.

---

**Curated external resources — cost: link decay**

The roadmap contains over 150 links to external resources across all sections. These will decay: courses go offline, documentation URLs change, pricing pages are updated. There is no automated link-checking mechanism. This is an ongoing maintenance cost that is invisible until a reader hits a broken link.

---

### 7.2 — Future considerations

---

**Search across sections**

Currently there is no way to search for a concept across all weeks and sections. A client-side search — indexing the `WEEKS` content at runtime and filtering by query string — would be feasible without any architecture change. It would require one additional component and a search input in the header or sidebar. This is the lowest-effort, highest-value future addition.

---

**Progress tracking and bookmarking**

The lightest implementation — `localStorage` to save which sections are open and which quizzes are completed — would not require a backend and could be added without changing the core architecture. However, it would directly contradict the stateless philosophy documented in Section 2. The decision to add it would require revisiting the Non-Goals first: is the philosophy changing, or is this a compromise? That is a product decision before it is a technical one.

A heavier implementation — user accounts, server-side progress storage, cross-device sync — would require a backend, an authentication layer, and a meaningful increase in infrastructure complexity. This would transform the project from a static file into a web application.

---

**Real interactive demos with live API calls**

The token calculator and temperature visualiser are self-contained and accurate. Making the embedding similarity demo real — computing actual cosine similarity between real embeddings — would require either user-provided API keys (friction, security risk if mishandled) or a backend proxy that holds the key server-side (infrastructure cost, rate limiting, cost management). The right path, if this feature matters, is a backend proxy with a rate-limited free tier. This is a meaningful architecture change.

---

**Multi-author content contribution**

If a second person wants to contribute a new week or section, two changes would reduce the barrier significantly without requiring a CMS: extracting `WEEKS` into a separate `src/data/weeks.js` file (so contributors touch content without touching rendering logic), and adding TypeScript types for the `Week` and `Section` shapes (so contributors get autocomplete and validation). Neither change requires a backend — both are file-level refactors within the existing Vite project.

---

**Content freshness signalling**

AI is a fast-moving field. Model pricing changes quarterly. New architectures emerge. API behaviours shift. Currently there is no mechanism to signal to a reader that a section's content was last verified on a specific date. Adding a `lastUpdated` field to each section object and rendering it visibly would cost one field per section and one line of rendering logic — and give readers a signal about which content to verify against primary sources.

---

*Built by a PM, for PMs. Fork it, extend it, make it yours.*
