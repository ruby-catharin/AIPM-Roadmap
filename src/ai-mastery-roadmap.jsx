import { useState, useEffect, useRef, useCallback } from "react";
import { useRoadmapStore } from "./store";

// ─── WEEK DATA ───────────────────────────────────────────────────────────────
const WEEKS = [
  {
    id: 1,
    title: "Prompting & AI Foundations",
    tag: "FOUNDATIONS",
    color: "#F76707",
    accent: "#FFF4E6",
    dark: "#1a0f05",
    icon: "🧠",
    pmAngle: "Understand what AI can and can't do — so you scope products correctly and set realistic expectations with stakeholders.",
    sections: [
      {
        id: "1-1",
        title: "The AI Hierarchy",
        subtitle: "AI → ML → Deep Learning → LLMs",
        depths: {
          eli5: `Imagine a big family. **AI** is the grandparent — any computer that can do something "smart" like play chess or suggest a movie. **Machine Learning** is the parent — it's AI that learns from examples instead of being told every rule. **Deep Learning** is the kid — it uses layers of math (like stacking Lego blocks) to learn really complicated things like recognizing faces or understanding language. **LLMs** (Large Language Models) are deep learning systems trained on tons of text so they can have conversations like this one.`,
          normal: `AI is the broadest category: any system that mimics human intelligence (rule-based chatbots, recommendation engines, chess programs). Machine Learning is a subset where the system learns patterns from data rather than following hard-coded rules — think spam filters learning from labeled emails. Deep Learning uses neural networks with many layers to learn complex representations — enabling image recognition, speech-to-text, and language understanding. LLMs like GPT-4 and Claude are deep learning models trained on massive text corpora using the Transformer architecture, which enables them to generate human-like text by predicting the most likely next token.`,
          technical: `The hierarchy reflects increasing architectural complexity. Classical AI uses symbolic reasoning and search algorithms (A*, minimax). ML introduces statistical learning: supervised (labeled data → predictions), unsupervised (pattern discovery), and reinforcement learning (reward-driven). Deep learning leverages multi-layer neural networks — CNNs for spatial data, RNNs/LSTMs for sequential data, and Transformers for attention-based parallel processing. LLMs specifically are autoregressive Transformer decoders trained via next-token prediction on web-scale corpora (Common Crawl, books, code). The Transformer architecture (Vaswani et al., 2017) introduced self-attention: Q·K^T/√d_k → softmax → V, enabling O(1) sequential operations vs O(n) for RNNs. Modern LLMs have 7B–1.8T parameters, trained on 1–15T tokens, with pre-training costs of $2M–$100M+.`,
          pm: `This hierarchy determines your product architecture and cost structure. A rule-based chatbot (classical AI) costs $0 per query but handles only scripted flows. An ML classifier costs pennies but needs labeled training data. An LLM costs $0.003–$0.06 per query but handles any input. Your product decision: which layer solves the user's actual problem at acceptable cost? Many features that feel like they need an LLM (classification, routing, extraction) can be solved with cheaper ML models. The AI PM's job is matching the right technology layer to each feature — over-engineering with LLMs where a regex works is as bad as under-engineering with rules where an LLM is needed.`
        },
        quiz: [
          { q: "A spam filter that learns which emails are junk from labeled examples is an example of:", options: ["Classical AI", "Machine Learning", "Deep Learning", "LLM"], correct: 1, explanation: "It learns patterns from labeled data (supervised learning) rather than following hard-coded rules — that's ML." },
          { q: "Why might a PM choose a simple ML classifier over an LLM for a product feature?", options: ["LLMs can't classify text", "ML classifiers are always more accurate", "ML classifiers cost pennies vs $0.003+ per LLM query at scale", "There's no reason — always use LLMs"], correct: 2, explanation: "At 1M queries/day, an LLM costs $3K-60K/day vs pennies for a classifier. Cost matters at scale." }
        ],
        resources: [
          { title: "Karpathy: Intro to LLMs (1hr)", url: "https://www.youtube.com/watch?v=zjkBMFhNj_g", type: "video" },
          { title: "3Blue1Brown: Neural Networks", url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi", type: "video" },
          { title: "Google ML Crash Course", url: "https://developers.google.com/machine-learning/crash-course", type: "course" },
          { title: "fast.ai Practical Deep Learning", url: "https://course.fast.ai/", type: "course" }
        ]
      },
      {
        id: "1-2",
        title: "Tokens — The Atomic Unit",
        subtitle: "How LLMs read, price, and limit text",
        depths: {
          eli5: `LLMs don't read words like you do. They chop text into small pieces called **tokens**. The word "unbelievable" gets split into ["un", "believ", "able"]. Common words like "the" are one token. Rare words get split into more pieces. Think of it like Scrabble tiles — common letter combos are one tile, rare ones need multiple tiles. Why does this matter? Because you **pay per token** (like paying per text message), and there's a **maximum number of tokens** the AI can handle at once (like a reading limit).`,
          normal: `Tokenization converts text into numerical IDs the model can process. Most modern LLMs use Byte-Pair Encoding (BPE): start with individual characters, then iteratively merge the most frequent pairs into single tokens. "Tokenization" might become ["Token", "ization"]. A token is roughly ¾ of an English word. This matters for three product-critical reasons: (1) **Pricing** — APIs charge per token (GPT-4o: $2.50/1M input, $10/1M output; Claude Sonnet: $3/$15). (2) **Context window** — the maximum tokens processable at once (GPT-4o: 128K; Claude: 200K). (3) **Latency** — more output tokens = slower response, critical for real-time features.`,
          technical: `BPE (Sennrich et al., 2016) starts with a byte-level vocabulary and iteratively merges the most frequent adjacent pairs. GPT-4 uses cl100k_base encoding (~100K vocab); Llama uses SentencePiece with a 32K vocab. Tokenization introduces systematic biases: non-English text uses 2-5x more tokens per semantic unit, code tokenization varies by language (Python is efficient, Haskell is not), and mathematical expressions tokenize poorly. Context windows are fundamentally limited by the O(n²) self-attention computation — 200K tokens requires ~40B attention computations per layer. Techniques like Sliding Window Attention (Mistral), ALiBi, and RoPE extend effective context. Token-to-word ratios: English ≈ 1.3, Chinese ≈ 2.5, code ≈ 2.0.`,
          pm: `Token economics define your unit economics. Calculate: (avg_input_tokens + avg_output_tokens) × price_per_token × queries_per_user × users = monthly API cost. A customer support bot processing 10K tickets/day at 800 input + 400 output tokens on Claude Sonnet: (800×$3 + 400×$15)/1M × 10K × 30 = $2,520/month. That's your COGS baseline before infrastructure. Context window determines product capability: can you process an entire contract (100K tokens)? A codebase? Context window is your product's memory limit. Token latency determines UX: streaming (tokens appear as generated) vs batch (wait for complete response) is a critical UX decision — streaming feels faster even when it isn't.`
        },
        interactive: "tokenCalculator",
        quiz: [
          { q: "Your app sends 50 API calls/user/day at 800 tokens each. At $3/1M input tokens, what's the monthly input cost per user?", options: ["$0.12", "$1.24", "$3.72", "$12.40"], correct: 2, explanation: "50 × 800 × 31 = 1,240,000 tokens. 1.24M × $3/1M = $3.72. But remember output tokens cost more!" },
          { q: "Why does Chinese text cost more to process than English with LLMs?", options: ["The models are biased", "Chinese characters use 2-5x more tokens per meaning", "API providers charge more for Chinese", "Chinese is harder to understand"], correct: 1, explanation: "BPE tokenizers trained on English-heavy data split Chinese characters into more tokens per semantic unit." }
        ],
        resources: [
          { title: "Karpathy: Let's Build the GPT Tokenizer (2hr)", url: "https://www.youtube.com/watch?v=zduSFxRajkE", type: "video" },
          { title: "OpenAI Tokenizer Tool", url: "https://platform.openai.com/tokenizer", type: "tool" },
          { title: "Tiktokenizer (multi-model)", url: "https://tiktokenizer.vercel.app/", type: "tool" },
          { title: "HF Tokenizer Playground", url: "https://huggingface.co/spaces/Xenova/the-tokenizer-playground", type: "tool" },
          { title: "Hugging Face: Tokenizer Summary", url: "https://huggingface.co/docs/transformers/en/tokenizer_summary", type: "docs" }
        ]
      },
      {
        id: "1-3",
        title: "Temperature & Sampling",
        subtitle: "Controlling creativity vs determinism",
        depths: {
          eli5: `Imagine a bag of words the AI might say next. **Temperature** controls how adventurous the AI is when picking. Temperature 0 = always pick the most obvious word (boring but safe). Temperature 1.5 = sometimes pick surprising words (creative but sometimes weird). **Top-p** is different: instead of changing how adventurous, it removes unlikely words from the bag entirely. Top-p 0.1 means "only consider the most likely words." It's like choosing between adjusting your bravery vs limiting your options.`,
          normal: `After processing input, an LLM produces a probability distribution over its vocabulary for the next token. Temperature (0-2) controls the "sharpness" of this distribution: at 0, the highest-probability token always wins (greedy decoding); at 1.0+, lower-probability tokens get a fairer chance. Top-p (nucleus sampling) takes a different approach: it orders tokens by probability and only considers the smallest set whose cumulative probability exceeds p. At top-p=0.1, only the top ~10% most likely tokens are candidates. The key rule: use one or the other, not both, because they interfere unpredictably. Temperature 0-0.3 for factual tasks, 0.7-1.0 for creative tasks.`,
          technical: `The softmax function converts logits z_i to probabilities: P(i) = exp(z_i/T) / Σ exp(z_j/T). At T→0, this approaches argmax (deterministic). At T=1, it's standard softmax. At T>1, the distribution flattens. Top-p (Holtzman et al., 2020) computes the minimal set V_p where Σ_{i∈V_p} P(i) ≥ p, then re-normalizes. Top-k simply takes the k highest-probability tokens. Min-p (recent) sets a floor: only tokens with P(i) ≥ p_min × P(most_likely). When combining T and top-p, temperature reshapes probabilities first, then top-p truncates — the truncation point shifts unpredictably because the reshaped distribution changes which tokens fall above/below the cumulative threshold.`,
          pm: `Temperature is a product lever, not just a technical parameter. Grammarly uses low temperature for corrections (deterministic, consistent) but higher for tone suggestions (creative variety). A legal document analyzer must be near-zero temperature (hallucination = liability). A brainstorming assistant benefits from 0.8-1.0 (variety = value). Some products expose temperature as a user-facing "creativity slider" — this works for power users but confuses mainstream users. Better: set optimal defaults per feature and A/B test the values. Track the relationship between temperature settings and user satisfaction scores.`
        },
        interactive: "temperatureDemo",
        quiz: [
          { q: "A legal contract analyzer should use which temperature range?", options: ["0.8-1.2 for creative interpretation", "0-0.3 for factual consistency", "1.5+ for broad exploration", "Doesn't matter"], correct: 1, explanation: "Legal analysis requires deterministic, consistent outputs. Hallucination in legal = liability risk." },
          { q: "Why shouldn't you set both temperature=1.5 AND top-p=0.1?", options: ["The API will error", "Temperature flattens probabilities, changing which tokens top-p selects — making behavior unpredictable", "It's too expensive", "They do the same thing"], correct: 1, explanation: "Temperature reshapes the distribution first, then top-p truncates based on the reshaped values — the interaction is unpredictable." }
        ],
        resources: [
          { title: "LLM Sampling Parameters Explained", url: "https://www.letsdatascience.com/blog/llm-sampling-temperature-top-k-top-p-and-min-p-explained", type: "article" },
          { title: "DAIR.AI: LLM Settings", url: "https://www.promptingguide.ai/introduction/settings", type: "docs" },
          { title: "OpenAI Playground (test live)", url: "https://platform.openai.com/playground", type: "tool" },
          { title: "Google AI Studio (free, no card)", url: "https://aistudio.google.com/", type: "tool" }
        ]
      },
      {
        id: "1-4",
        title: "System Prompts & Prompt Engineering",
        subtitle: "Programming AI behavior — the most powerful lever",
        depths: {
          eli5: `A **system prompt** is like giving the AI a job description before it starts working. Without one, it's a smart generalist. With one, it becomes a specialist. You tell it: "You are a friendly cooking assistant. Only answer food questions. Always suggest vegetarian options first." Now every answer follows those rules. The better your job description, the better the AI employee. Companies like Jasper and Copy.ai are basically selling really good system prompts + a nice interface.`,
          normal: `System prompts are the invisible instruction set that shapes model behavior. A strong system prompt includes: (1) Role definition — who the AI is. (2) Behavioral constraints — what it should/shouldn't do. (3) Output format — how to structure responses. (4) Guardrails — how to handle edge cases. (5) Few-shot examples — concrete input→output pairs. Advanced techniques: Chain-of-Thought ("think step by step") improves reasoning accuracy dramatically. ReAct (Reason + Act) enables multi-step tool use. Self-Consistency runs the same prompt multiple times and takes the majority answer for higher reliability.`,
          technical: `System prompts are prepended to the messages array and processed during the prefill phase. They consume context window but receive cached KV attention for efficiency. Key techniques: XML tagging (<context>, <rules>, <examples>) provides structural cues the model attends to strongly. Chain-of-Thought (Wei et al., 2022) improved GSM8K math accuracy from 17.7% to 78.7% by eliciting intermediate reasoning. ReAct (Yao et al., 2022) interleaves Thought→Action→Observation loops. Structured output enforcement (JSON mode, tool_choice="required") ensures parseability. Prompt injection defense requires layered approaches: input sanitization, output validation, and instruction hierarchy where system instructions override user messages.`,
          pm: `System prompt design IS product design. The difference between a $10M AI product and a toy demo is often the system prompt quality. Version control your prompts (Promptfoo, LangSmith, Humanloop). A/B test them — a 5-word change can swing NPS by 20 points. Build a prompt review process like code review. Track prompt performance metrics: task completion rate, hallucination rate, user satisfaction. The system prompt is your product's personality, capabilities, and safety boundary — all in one artifact. For technical PMs: own the prompt iteration cycle, define the quality bar, and build the eval framework that measures prompt changes against user outcomes.`
        },
        interactive: "systemPromptBuilder",
        quiz: [
          { q: "What's the most impactful part of a system prompt for production AI products?", options: ["Making it as long as possible", "Adding emojis for personality", "Few-shot examples showing ideal input→output pairs", "Using ALL CAPS for emphasis"], correct: 2, explanation: "Few-shot examples give the model concrete patterns to follow — they're the highest-signal component of a system prompt." },
          { q: "Chain-of-Thought prompting improved math accuracy on GSM8K by approximately:", options: ["5% → 10%", "18% → 79%", "50% → 55%", "79% → 95%"], correct: 1, explanation: "Adding 'let's think step by step' improved accuracy from ~17.7% to ~78.7% — a 4.4x improvement." }
        ],
        resources: [
          { title: "DeepLearning.AI: Prompt Engineering for Devs", url: "https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/", type: "course" },
          { title: "Anthropic Prompt Engineering Tutorial (9 chapters)", url: "https://github.com/anthropics/prompt-eng-interactive-tutorial", type: "course" },
          { title: "Anthropic Prompt Engineering Docs", url: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview", type: "docs" },
          { title: "OpenAI Prompt Engineering Guide", url: "https://platform.openai.com/docs/guides/prompt-engineering", type: "docs" },
          { title: "DAIR.AI Prompt Engineering Guide", url: "https://www.promptingguide.ai/", type: "docs" },
          { title: "Learn Prompting (60+ free modules)", url: "https://learnprompting.org/docs/introduction", type: "course" },
          { title: "Chain-of-Thought Paper (Wei et al.)", url: "https://arxiv.org/abs/2201.11903", type: "paper" },
          { title: "ReAct Paper (Yao et al.)", url: "https://arxiv.org/abs/2210.03629", type: "paper" }
        ]
      }
    ]
  },
  {
    id: 2,
    title: "Data — Embeddings, Vectors & RAG",
    tag: "RETRIEVAL",
    color: "#1C7ED6",
    accent: "#E7F5FF",
    dark: "#051525",
    icon: "📊",
    pmAngle: "Build products that use YOUR proprietary data — not just the model's training knowledge. Data is your moat.",
    sections: [
      {
        id: "2-1",
        title: "Embeddings",
        subtitle: "How AI understands meaning as numbers",
        depths: {
          eli5: `Imagine every word has a secret address in a huge city. Words that mean similar things live near each other. "Happy" and "joyful" are neighbors. "Sad" is across town. An **embedding** is that address — a list of numbers like [0.23, -0.45, 0.67]. The cool part: you can do math with these addresses! "King" minus "Man" plus "Woman" = somewhere very close to "Queen." This is how AI understands that words relate to each other — not by reading a dictionary, but by learning neighborhoods.`,
          normal: `Embeddings are dense vector representations of text (or images, audio) in a continuous vector space. Models like OpenAI's text-embedding-3-large or sentence-transformers convert text into 384-3072 dimensional vectors where semantic similarity corresponds to geometric proximity (measured by cosine similarity). Created by extracting intermediate layer outputs from transformer models trained on billions of sentences, embeddings capture statistical relationships: synonyms cluster together, analogies form parallelograms. This enables semantic search (finding documents by meaning, not keywords), clustering, recommendations, and anomaly detection.`,
          technical: `Embedding models use the encoder portion of transformers, outputting the [CLS] token representation or mean-pooled token embeddings. Training uses contrastive loss: positive pairs (semantically similar) are pulled together while negative pairs are pushed apart (InfoNCE loss). Matryoshka Representation Learning (MRL) trains embeddings that work at multiple dimensionalities — OpenAI's text-embedding-3 models support dimension truncation without retraining. Cosine similarity = (A·B)/(||A||×||B||), range [-1,1]. For retrieval, Maximum Inner Product Search (MIPS) is preferred with normalized vectors. Evaluation uses MTEB (Massive Text Embedding Benchmark) across retrieval, clustering, classification, and semantic similarity tasks.`,
          pm: `Embeddings power the features users actually pay for: "smart search" that understands intent, not just keywords. A legal search finding "breach of contract" when the user types "broken agreement." Product implications: embedding model choice affects quality (OpenAI vs Cohere vs open-source sentence-transformers) and cost ($0.02-0.13/1M tokens). Embedding quality directly determines search relevance — which determines user trust. Build an internal "search quality scorecard" that samples 50 queries weekly and grades result relevance. The flywheel: better search → more usage → more click data → fine-tuned embeddings → even better search.`
        },
        interactive: "embeddingSimilarity",
        quiz: [
          { q: "Cosine similarity between two identical embeddings equals:", options: ["-1", "0", "0.5", "1"], correct: 3, explanation: "Identical vectors point in the same direction → cosine of 0° = 1. Opposite vectors = -1. Perpendicular = 0." },
          { q: "Why are embeddings more useful for search than keyword matching?", options: ["They're faster", "They find semantically similar content even with different words", "They're cheaper", "They return more results"], correct: 1, explanation: "Embeddings capture meaning — so 'broken agreement' matches 'breach of contract' even without shared keywords." }
        ],
        resources: [
          { title: "Jay Alammar: Illustrated Word2Vec", url: "https://jalammar.github.io/illustrated-word2vec/", type: "article" },
          { title: "TensorFlow Embedding Projector", url: "https://projector.tensorflow.org/", type: "tool" },
          { title: "OpenAI Embeddings Guide", url: "https://platform.openai.com/docs/guides/embeddings", type: "docs" },
          { title: "Original Word2Vec Paper", url: "https://arxiv.org/abs/1301.3781", type: "paper" },
          { title: "Sentence Transformers Library", url: "https://github.com/huggingface/sentence-transformers", type: "code" }
        ]
      },
      {
        id: "2-2",
        title: "Vector Databases",
        subtitle: "Where embeddings live and are searched",
        depths: {
          eli5: `Normal databases are like filing cabinets — you find things by exact labels. A **vector database** is like a smart librarian who finds books by meaning. You say "I want something about space adventure with a sad ending" and the librarian finds the closest matches, even if none are labeled that exact way. It does this by comparing the "address" (embedding) of your question with the "addresses" of everything in the library, and finding the nearest neighbors.`,
          normal: `Vector databases store embeddings and enable fast similarity search. Traditional databases search with exact matches (SQL WHERE). Vector DBs search by proximity — "find the 10 most similar vectors to this query." Key players: Pinecone (managed, easiest), Chroma (open-source, lightweight, great for prototyping), Weaviate (feature-rich open-source), pgvector (Postgres extension). The workflow: embed documents → store vectors + metadata → embed user query → find nearest vectors → return corresponding documents. At scale, Approximate Nearest Neighbor (ANN) algorithms trade tiny accuracy losses for massive speed gains.`,
          technical: `Exact k-NN search is O(n) — prohibitive at millions of vectors. ANN algorithms provide sub-linear search: HNSW (Hierarchical Navigable Small World graphs) achieves ~95%+ recall at 100-1000x speedup by building a multi-layer graph where higher layers connect distant nodes and lower layers are dense local connections. IVF (Inverted File Index) partitions the space into Voronoi cells, searching only nearby cells. Product Quantization compresses vectors by splitting dimensions into subspaces and quantizing each — reducing memory 4-64x with ~5% recall loss. FAISS (Meta) is the gold-standard library, supporting GPU-accelerated IVF-PQ at billion scale. Distance metrics: cosine similarity (angle), L2/Euclidean (magnitude-sensitive), dot product (unnormalized cosine).`,
          pm: `Vector DB choice is a classic build-vs-buy PM decision. Pinecone: fastest time-to-market, $0.096/hr for serverless, but vendor lock-in. pgvector: free, your team already knows Postgres, but limited scale. Chroma: perfect for MVP validation. Weaviate: best for teams wanting control + features. Decision framework: if pre-PMF, use Chroma (free, fast). If scaling to 1M+ vectors, evaluate Pinecone vs self-hosted based on team ML ops maturity. Key product metrics from your vector DB: query latency (p50/p95), recall@K, index build time, and cost per million queries.`
        },
        quiz: [
          { q: "Why do vector databases use ANN algorithms instead of exact nearest-neighbor search?", options: ["ANN is more accurate", "Exact search is O(n) — too slow at millions of vectors", "ANN uses less storage", "Exact search doesn't work with embeddings"], correct: 1, explanation: "Searching every vector is linear time. With 100M vectors, that's 100M comparisons per query. ANN trades ~5% recall for 100-1000x speedup." },
        ],
        resources: [
          { title: "Pinecone Learning Center", url: "https://www.pinecone.io/learn/vector-database/", type: "docs" },
          { title: "Chroma Getting Started", url: "https://www.trychroma.com/", type: "docs" },
          { title: "FAISS Tutorial (Pinecone)", url: "https://www.pinecone.io/learn/series/faiss/faiss-tutorial/", type: "course" },
          { title: "FAISS Library (Meta)", url: "https://github.com/facebookresearch/faiss", type: "code" }
        ]
      },
      {
        id: "2-3",
        title: "RAG — Retrieval-Augmented Generation",
        subtitle: "The #1 architecture pattern in production AI",
        depths: {
          eli5: `Imagine you're taking an open-book exam. Instead of memorizing everything (which is expensive and you'd forget stuff), you bring your textbooks. When you get a question, you quickly flip to the right page, read the relevant part, then write your answer based on what you just read. **RAG** works the same way for AI: instead of training the model on your data (expensive open-brain surgery), you let it search your documents in real-time and answer based on what it finds. Cheaper, fresher, and you can see which "pages" it used.`,
          normal: `RAG solves the biggest LLM problems: hallucination and stale knowledge. The pipeline: (1) **Index phase** — split documents into chunks (500-1000 tokens), embed each chunk, store in vector DB. (2) **Query phase** — user asks question → embed query → retrieve top-K relevant chunks → inject as context into LLM prompt → LLM generates answer grounded in YOUR data. Why RAG wins over fine-tuning for most use cases: cheaper (no GPU training), fresher (update docs anytime), auditable (cite sources), safer (less hallucination). Quality levers: chunk size (512 typical), overlap (50-100 tokens), retrieval count K (3-5), and reranking for precision.`,
          technical: `The original RAG paper (Lewis et al., 2020) combined a DPR bi-encoder retriever with a BART seq2seq generator, trained end-to-end. Modern RAG uses frozen retriever + frozen generator with prompt engineering. Advanced patterns: Hybrid search combines dense (semantic) + sparse (BM25/keyword) retrieval for better recall. HyDE (Hypothetical Document Embeddings) generates a hypothetical answer, embeds it, and uses that for retrieval — improving retrieval quality by 20-30%. Query decomposition breaks complex questions into sub-queries. Reranking with cross-encoders (Cohere Rerank, ms-marco-MiniLM) re-scores retrieved chunks with full query-document attention — more accurate but slower than bi-encoder retrieval. Evaluation: Retrieval (Precision@K, Recall@K, MRR), Generation (faithfulness, relevance, answer correctness). The RAG Triad: context relevance, groundedness, answer relevance.`,
          pm: `RAG is your product's knowledge engine. Its quality directly determines whether users trust your product. Build these metrics from day 1: retrieval precision (are the right docs being found?), answer groundedness (is the answer actually based on retrieved docs?), hallucination rate (are there unsupported claims?), latency p50/p95 (is it fast enough?), cost per query (is it sustainable?). RAG vs fine-tuning decision framework: use RAG when data changes frequently, you need citations, or you have <10K documents. Fine-tune when you need consistent style/voice, domain-specific behavior that prompting can't capture, or latency-sensitive applications where shorter prompts help. Most products should start with RAG and only fine-tune after proving RAG limitations with data.`
        },
        interactive: "ragPipeline",
        quiz: [
          { q: "What does the 'Retrieval' in RAG refer to?", options: ["Retrieving the model from storage", "Searching a vector DB for relevant document chunks before generating", "Downloading new training data", "Caching previous responses"], correct: 1, explanation: "RAG retrieves relevant chunks from your knowledge base, then feeds them to the LLM as context for generating grounded answers." },
          { q: "Chunk overlap of 50-100 tokens helps with:", options: ["Making the database bigger", "Preventing sentences from being cut mid-thought at chunk boundaries", "Saving money", "Faster retrieval"], correct: 1, explanation: "Without overlap, important context at chunk boundaries gets lost — overlap ensures continuity between adjacent chunks." }
        ],
        resources: [
          { title: "Original RAG Paper (Lewis et al.)", url: "https://arxiv.org/abs/2005.11401", type: "paper" },
          { title: "LlamaIndex: RAG Introduction", url: "https://developers.llamaindex.ai/python/framework/understanding/rag/", type: "docs" },
          { title: "LangChain: Build a RAG Agent", url: "https://docs.langchain.com/oss/python/langchain/rag", type: "docs" },
          { title: "DeepLearning.AI: Advanced RAG", url: "https://www.deeplearning.ai/short-courses/building-evaluating-advanced-rag/", type: "course" },
          { title: "Weaviate: Chunking Strategies", url: "https://weaviate.io/blog/chunking-strategies-for-rag", type: "article" },
          { title: "NVIDIA: Best Chunking Strategies", url: "https://developer.nvidia.com/blog/finding-the-best-chunking-strategy-for-accurate-ai-responses/", type: "article" }
        ]
      }
    ]
  },
  {
    id: 3,
    title: "Build — APIs, Agents & Tools",
    tag: "APPLICATIONS",
    color: "#2F9E44",
    accent: "#EBFBEE",
    dark: "#051a0a",
    icon: "⚡",
    pmAngle: "Go from prototype to product — shipping real AI applications with reliability, observability, and user trust.",
    sections: [
      {
        id: "3-1",
        title: "LLM APIs",
        subtitle: "Building blocks of every AI product",
        depths: {
          eli5: `LLM APIs are like ordering food from a restaurant. You send your order (a message), the kitchen (the AI model) prepares it, and you get your meal (a response) back. You pay per dish (per token). Different restaurants (OpenAI, Anthropic, Google) have different specialties and prices. **Streaming** is like getting your food course by course instead of waiting for everything at once — it feels faster even if total time is similar.`,
          normal: `Every major AI product is built on LLM APIs. Key providers: OpenAI (GPT-4o, o1 — ecosystem leader), Anthropic (Claude — best for long docs, safety), Google (Gemini — strong multimodal), open-source via Together AI/Fireworks. Core concepts: the messages array structures conversations as system/user/assistant turns; streaming delivers tokens incrementally for better UX; function calling lets the model invoke tools you define. Cost optimization strategies: use cheaper models for simple tasks (Haiku for classification, Sonnet for generation), cache frequent requests, batch non-urgent requests, and compress prompts.`,
          technical: `API calls follow the OpenAI-compatible format: POST /v1/messages with model, messages[], tools[], temperature, max_tokens. Response contains content[] blocks (text, tool_use). Streaming uses Server-Sent Events (SSE): each chunk contains a delta with partial text. Key metrics: TTFT (Time-to-First-Token, 200-800ms typical) determines perceived speed; TPS (Tokens-per-Second, 30-100 for output) determines throughput. Rate limiting varies: OpenAI uses TPM (tokens-per-minute) and RPM (requests-per-minute) quotas. Retry strategies: exponential backoff with jitter for 429/529 errors. Multi-model architectures use routers that classify query complexity and dispatch to appropriate models — Martian, Unify, and custom routers using small classifiers.`,
          pm: `API provider selection is a strategic vendor decision. Evaluate: pricing trajectory (are costs declining?), reliability SLAs (99.9%+ for production), feature roadmap alignment, lock-in risk, data privacy terms (where is data processed? retained?). Multi-model strategies reduce single-vendor risk but increase integration complexity. Key product decision: streaming vs batch. Streaming is essential for chat interfaces (perceived latency drops 60-80%). Batch is fine for background processing (email summarization, document analysis). Build a model cost dashboard from day one — track cost per user, per feature, per model. Set alerts for cost anomalies.`
        },
        quiz: [
          { q: "Why is streaming important for chat-based AI products?", options: ["It's cheaper", "It reduces perceived latency by 60-80% as users see tokens appear immediately", "It's more accurate", "It uses fewer tokens"], correct: 1, explanation: "Users perceive the response as faster because text starts appearing in 200-800ms vs waiting 2-5 seconds for the full response." }
        ],
        resources: [
          { title: "OpenAI API Quickstart", url: "https://platform.openai.com/docs/quickstart", type: "docs" },
          { title: "Anthropic Claude Docs", url: "https://docs.anthropic.com/en/docs/intro-to-claude", type: "docs" },
          { title: "Google Gemini API", url: "https://ai.google.dev/gemini-api/docs", type: "docs" },
          { title: "OpenAI Cookbook (71K+ stars)", url: "https://cookbook.openai.com", type: "code" },
          { title: "Anthropic Cookbook", url: "https://github.com/anthropics/anthropic-cookbook", type: "code" }
        ]
      },
      {
        id: "3-2",
        title: "Function Calling & Tool Use",
        subtitle: "Connecting AI to the real world",
        depths: {
          eli5: `Right now, AI can only talk. **Function calling** lets it DO things. It's like giving a smart assistant not just a brain, but hands. You tell the AI: "Here are buttons you can press — one checks the weather, one searches a database, one sends an email." When someone asks about weather, the AI presses the weather button, reads the result, and gives a natural answer. The AI doesn't actually run the code — it just says "I'd like to press this button" and YOUR system presses it. You stay in control.`,
          normal: `Function calling is how LLMs interact with external systems. You define available tools (name, description, parameters as JSON Schema). When appropriate, the model responds with a structured tool call instead of text. YOUR code executes the function and returns results. The model then generates a natural language response incorporating the results. This enables: database queries, API calls, calculations, web searches, file operations. The critical insight: the model doesn't execute code — it generates a structured request. You execute it. This maintains security and control.`,
          technical: `Tool definitions follow JSON Schema: {name, description, input_schema: {type: "object", properties: {...}, required: [...]}}. The model may return multiple tool calls in parallel (parallel function calling). Handle the flow: user message → model returns tool_use block → execute function → return tool_result → model generates final response. MCP (Model Context Protocol) by Anthropic standardizes tool connectivity — a universal plugin system for AI. Error handling patterns: timeout wrappers, retry logic, graceful degradation messages. For multi-step tool use, implement a loop: model calls tool → result → model decides if more tools needed → repeat until done.`,
          pm: `Function calling is the bridge between "cool demo" and "useful product." A travel AI that can actually book flights (via tool use) is infinitely more valuable than one that just describes flights. Map your product's core value proposition to the functions the AI needs access to. Critical PM decisions: which tools should the AI have? What's the risk of each tool? (Read-only tools are safe; write tools need confirmation flows). Build a tool permission system: customer support AI can read orders but needs human approval to issue refunds. Monitor tool call success rates, latency, and error rates as product health metrics.`
        },
        quiz: [
          { q: "Who actually executes the function when an LLM makes a function call?", options: ["The LLM runs the code directly", "OpenAI/Anthropic's servers run it", "YOUR backend code executes it — the LLM only generates a structured request", "The user's browser"], correct: 2, explanation: "The LLM generates a structured JSON request. Your system executes the function and returns results. This keeps you in control of security and access." }
        ],
        resources: [
          { title: "Anthropic: Tool Use Docs", url: "https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview", type: "docs" },
          { title: "OpenAI: Function Calling Guide", url: "https://platform.openai.com/docs/guides/function-calling", type: "docs" },
          { title: "Anthropic: Writing Tools for Agents", url: "https://www.anthropic.com/engineering/writing-tools-for-agents", type: "article" },
          { title: "Google: Function Calling Codelab", url: "https://codelabs.developers.google.com/codelabs/gemini-function-calling", type: "course" }
        ]
      },
      {
        id: "3-3",
        title: "AI Agents",
        subtitle: "Autonomous multi-step AI systems",
        depths: {
          eli5: `A regular AI answers one question at a time. An **agent** is an AI that can plan and do a whole project. Imagine asking: "Research the top 5 coffee shops near me, check their reviews, and make a table comparing them." A regular AI might make something up. An agent actually searches the web, reads reviews, organizes the info, and creates the table — step by step, checking its own work. It's like upgrading from a calculator to a personal assistant.`,
          normal: `An agent is an AI system that autonomously plans and executes multi-step tasks using an observe→think→act loop. Agent architectures include: ReAct (reason about what to do, act, observe result, repeat), Plan-and-Execute (create full plan, then execute), and Multi-Agent (specialized agents collaborate). Key frameworks: LangGraph (graph-based orchestration), CrewAI (multi-agent teams), AutoGen (Microsoft). The hard problems: reliability (95% per step = 60% over 10 steps), cost control (agents can loop infinitely — always set max iterations), and observability (without logging every step, debugging is impossible).`,
          technical: `Agent architectures as defined by Anthropic's seminal guide: (1) Prompt chaining — sequential LLM calls with gates. (2) Routing — classifying input and dispatching. (3) Parallelization — multiple LLM calls simultaneously. (4) Orchestrator-worker — central LLM delegates to sub-agents. (5) Evaluator-optimizer — one agent generates, another evaluates, loop until quality threshold met. LangGraph models agents as state machines with typed state, conditional edges, and human-in-the-loop interrupts. State management is critical: agents need memory across steps (short-term in state, long-term in vector stores). Tracing with LangSmith or Langfuse is non-negotiable — log every LLM call, tool call, state transition, and decision.`,
          pm: `Agents are the future of AI products but are hard to ship reliably. Start narrow: well-defined tasks with clear success criteria ("research and summarize 5 competitor pricing pages" not "do market research"). Ship with human-in-the-loop: the agent proposes actions, the user approves. This builds trust and gives you training data for when to remove the human. Key metrics: task completion rate (aim for 85%+ before removing human oversight), average steps to completion, cost per completed task, failure mode distribution. The reliability math is brutal: P(success) = p^n where p is per-step success rate and n is steps. At 95% per step, 10 steps = 60% overall success. This is why simple workflows with 2-3 chained calls often outperform complex agents.`
        },
        quiz: [
          { q: "If an agent has 95% success rate per step and needs 10 steps, what's the overall success rate?", options: ["95%", "85%", "~60%", "~50%"], correct: 2, explanation: "0.95^10 ≈ 0.599 or ~60%. This is why simple chains often beat complex agents — fewer steps = higher reliability." }
        ],
        resources: [
          { title: "Anthropic: Building Effective Agents (essential read)", url: "https://www.anthropic.com/research/building-effective-agents", type: "article" },
          { title: "Hugging Face AI Agents Course", url: "https://huggingface.co/learn/agents-course/en/unit0/introduction", type: "course" },
          { title: "LangGraph Essentials (free)", url: "https://academy.langchain.com/courses/langgraph-essentials-python", type: "course" },
          { title: "LangChain Academy (all free courses)", url: "https://academy.langchain.com/collections", type: "course" },
          { title: "DeepLearning.AI: Agentic AI", url: "https://www.deeplearning.ai/courses/agentic-ai/", type: "course" },
          { title: "CrewAI Quickstart", url: "https://docs.crewai.com/en/quickstart", type: "docs" }
        ]
      }
    ]
  },
  {
    id: 4,
    title: "Ship — Fine-Tuning, Deploy & AI PM",
    tag: "PRODUCTION",
    color: "#AE3EC9",
    accent: "#F8F0FC",
    dark: "#1a0525",
    icon: "🚀",
    pmAngle: "Ship, scale, and sustain AI products in production. 20% model, 80% infrastructure and strategy.",
    sections: [
      {
        id: "4-1",
        title: "Fine-Tuning",
        subtitle: "When prompting + RAG aren't enough",
        depths: {
          eli5: `Fine-tuning is like sending a general-purpose employee to a specialized training course. The AI already knows language (that's pre-training, like school). Fine-tuning teaches it YOUR specific way of doing things. Maybe your company writes emails in a particular tone, or labels support tickets in a unique way. You show it 100-1000 examples of "here's the input, here's the perfect output" and it learns your patterns. It's more expensive than just giving instructions (prompting) but produces more consistent results.`,
          normal: `Fine-tuning trains a pre-trained model further on your specific data. When to fine-tune (only after exhausting prompting + RAG): consistent style/voice that prompting can't capture, domain-specific patterns too complex for context, latency optimization (shorter prompts with fine-tuned behavior), cost optimization (smaller fine-tuned model matching larger base model). Techniques: Full fine-tuning (all weights, expensive), LoRA (Low-Rank Adaptation — trains small adapter layers, 10,000x fewer parameters), QLoRA (quantized LoRA — fits on consumer GPUs). Training data: JSONL format, min 50 examples, ideally 200-1000+. Always hold out a test set.`,
          technical: `LoRA (Hu et al., 2021) decomposes weight updates as W + ΔW where ΔW = BA, with B∈R^(d×r) and A∈R^(r×k), rank r << min(d,k). This reduces trainable params from millions to thousands. Key hyperparameters: rank r (8-64 typical — higher = more capacity but overfitting risk), alpha (scaling factor, typically 2× rank), learning rate (1e-5 to 1e-4), epochs (2-3 for most tasks). QLoRA adds 4-bit NormalFloat quantization, enabling 65B model fine-tuning on a single 48GB GPU. RLHF pipeline: (1) supervised fine-tuning on demonstrations, (2) train reward model on human preference data, (3) optimize policy with PPO against reward model. DPO (Direct Preference Optimization) simplifies by eliminating the reward model. Evaluation: perplexity on held-out test set, task-specific metrics, human evaluation for style/quality.`,
          pm: `Fine-tuning is a significant investment with ongoing maintenance costs. Decision framework: (1) Have you maxed out prompt engineering? Document 10+ prompt iterations and their metrics. (2) Have you tried RAG? Compare RAG quality vs your target. (3) Is the gap specific and measurable? "The model doesn't sound like our brand" is fine-tunable. "The model isn't smart enough" isn't. (4) Do you have enough quality training data? 200+ examples minimum. (5) Can you maintain it? When base models update, you may need to re-fine-tune. Budget 20% of initial effort for quarterly maintenance. Track: fine-tuned vs base model quality delta, training data freshness, inference cost savings.`
        },
        quiz: [
          { q: "LoRA reduces trainable parameters by approximately:", options: ["2x", "100x", "10,000x", "It doesn't reduce them"], correct: 2, explanation: "LoRA injects low-rank matrices that decompose weight updates — reducing trainable parameters from millions to thousands (10,000x reduction)." }
        ],
        resources: [
          { title: "LoRA Paper (Hu et al.)", url: "https://arxiv.org/abs/2106.09685", type: "paper" },
          { title: "QLoRA Paper (Dettmers et al.)", url: "https://arxiv.org/abs/2305.14314", type: "paper" },
          { title: "Phil Schmid: Fine-Tune LLMs in 2025", url: "https://www.philschmid.de/fine-tune-llms-in-2025", type: "article" },
          { title: "Sebastian Raschka: Practical LoRA Tips", url: "https://magazine.sebastianraschka.com/p/practical-tips-for-finetuning-llms", type: "article" },
          { title: "Hugging Face PEFT Library", url: "https://github.com/huggingface/peft", type: "code" },
          { title: "Hugging Face: Illustrated RLHF", url: "https://huggingface.co/blog/rlhf", type: "article" }
        ]
      },
      {
        id: "4-2",
        title: "Deployment & MLOps",
        subtitle: "Production is a different game",
        depths: {
          eli5: `Building an AI app is like cooking at home. **Deploying** it is like opening a restaurant. Suddenly you need: a kitchen that handles 100 orders at once (model serving), health inspections (guardrails), customer feedback cards (observability), a backup chef if the main one gets sick (fallbacks), and a way to track costs so you don't go bankrupt (monitoring). 80% of the work in AI products is this restaurant management — not the recipe itself.`,
          normal: `Production AI infrastructure: **Model serving** — API providers (simplest), managed platforms (AWS Bedrock, GCP Vertex), self-hosted (vLLM, Ollama). **Prompt management** — version control prompts like code (Promptfoo, LangSmith). **Observability** — log every request/response, track latency, errors, costs, quality (Langfuse, Helicone). **Guardrails** — input/output filtering for harmful content, PII, off-topic responses. **Caching** — exact match (easy) or semantic (similar questions get cached answers). **Fallbacks** — when primary model is down, route to backup. The production stack: Input → Guardrails → Cache check → Model call → Output guardrails → Logging → Monitoring → Alerting.`,
          technical: `vLLM uses PagedAttention (inspired by OS virtual memory) for memory-efficient serving — achieving 2-4x throughput vs HuggingFace's default generate(). Key vLLM features: continuous batching, tensor parallelism, speculative decoding. For local/edge: Ollama wraps llama.cpp with a REST API; LM Studio adds a GUI. Guardrails implementations: input classifiers (NeMo Guardrails, Guardrails AI) using small fine-tuned models for toxicity/PII/injection detection; output validators for JSON schema conformance, citation grounding checks, and regex-based PII redaction. Semantic caching uses embedding similarity with a threshold (cosine > 0.95) — stores query embedding + response, serves cached response for semantically similar new queries. Observability stack: OpenTelemetry for traces, Langfuse/LangSmith for LLM-specific logging, Grafana/Prometheus for infrastructure metrics.`,
          pm: `Production AI is 20% model, 80% infrastructure. Allocate engineering time accordingly — most PMs under-invest in observability and over-invest in model performance. Your launch checklist: (1) Observability — can you see every LLM call, its cost, latency, and quality? (2) Guardrails — what happens with adversarial inputs? PII in responses? (3) Fallbacks — if Claude is down, does the product gracefully degrade? (4) Cost alerts — will a viral moment bankrupt you? Set per-user and per-day spend caps. (5) Data retention — how long do you store user conversations? GDPR compliance? (6) Evaluation — are you running automated evals on production traffic? Build a "Production Readiness Review" process your team runs before every AI feature launch.`
        },
        quiz: [
          { q: "What percentage of AI product effort is typically infrastructure vs model work?", options: ["50/50", "80% model, 20% infrastructure", "20% model, 80% infrastructure", "100% model"], correct: 2, explanation: "Observability, guardrails, caching, fallbacks, monitoring, deployment — the infrastructure around the model is the bulk of production work." }
        ],
        resources: [
          { title: "vLLM Quickstart", url: "https://docs.vllm.ai/en/latest/getting_started/quickstart/", type: "docs" },
          { title: "Ollama", url: "https://ollama.com/", type: "tool" },
          { title: "Langfuse (open-source observability)", url: "https://langfuse.com/", type: "tool" },
          { title: "Made With ML (free MLOps course)", url: "https://madewithml.com/", type: "course" },
          { title: "Streamlit Docs", url: "https://docs.streamlit.io/", type: "docs" },
          { title: "FastAPI", url: "https://fastapi.tiangolo.com/", type: "docs" }
        ]
      },
      {
        id: "4-3",
        title: "AI Product Management",
        subtitle: "Strategy, metrics, and the PM skill stack",
        depths: {
          eli5: `Being an **AI Product Manager** is like being a movie director who also understands cameras. You don't operate the camera yourself, but you need to know what's possible, what's expensive, and what makes a great shot. You decide: What should the AI do? How do we know it's working well? How much can we afford to spend? When should a human take over? Your superpower is translating between "what users need" and "what the technology can deliver."`,
          normal: `The AI PM skill stack: (1) Technical fluency — understand models, tokens, embeddings, RAG, fine-tuning. (2) Probabilistic thinking — AI outputs are non-deterministic; you ship confidence levels, not guarantees. (3) Eval-driven development — define evals BEFORE building, measure against them continuously. (4) Cost modeling — every feature has per-use AI costs; unit economics differ fundamentally from traditional SaaS. (5) Trust design — transparency (show citations), graceful failure (admit uncertainty), human-in-the-loop (escalation paths). Strategy frameworks: build vs buy vs combine; data flywheel design; human-AI interaction spectrum.`,
          technical: `Technical PM responsibilities: Own the eval framework — automated evals (exact match, LLM-as-judge, BLEU/ROUGE), human evals (domain expert grading), A/B testing (model/prompt variants against user metrics), red teaming (adversarial testing). Manage model selection using benchmarks: MMLU (knowledge), HumanEval (code), MT-Bench (conversation), plus your own task-specific evals. Define the fallback hierarchy and reliability targets (99.5%+ uptime). Partner with ML engineers on training data strategy and quality pipelines. Drive prompt iteration cycles with measured quality improvements. Understand infrastructure tradeoffs: embedding model quality vs latency vs cost, chunk size vs retrieval precision, cache hit rate vs freshness requirements.`,
          pm: `The data flywheel is your most important strategic asset: usage generates data → data improves model → better model attracts usage → more data. Design for this from day 1. Unit economics framework: Traditional SaaS COGS is ~20% of revenue (hosting). AI SaaS COGS is 40-70% (model inference + infrastructure). You need higher prices or dramatically better retention to make the math work. Human-in-the-loop strategy: start with AI-suggests-human-decides, track agreement rate, gradually increase AI autonomy as agreement rate exceeds 95%. AI product KPIs: task completion rate, hallucination rate, user trust score (do they verify AI outputs?), escalation rate (how often do users need a human?), cost per successful interaction. The best AI PMs don't just manage products — they manage the uncertainty inherent in probabilistic systems.`
        },
        quiz: [
          { q: "What makes AI product unit economics different from traditional SaaS?", options: ["They're identical", "AI products have no marginal cost", "AI COGS is 40-70% vs ~20% for traditional SaaS due to inference costs", "AI products are always cheaper to run"], correct: 2, explanation: "Every AI interaction costs real money (model inference). This means higher prices needed or dramatically better retention vs traditional SaaS." },
          { q: "The data flywheel means:", options: ["Data spins around in circles", "Usage → data → model improvement → more usage → more data", "You need to buy more data", "AI models get worse over time"], correct: 1, explanation: "The flywheel is a self-reinforcing loop: more users generate more data, which improves the model, which attracts more users." }
        ],
        resources: [
          { title: "Lenny's Podcast (AI PM episodes)", url: "https://www.lennysnewsletter.com/podcast", type: "podcast" },
          { title: "Marily Nika: AI & PM (Lenny's)", url: "https://podcasts.apple.com/us/podcast/ai-and-product-management-marily-nika-meta-google/id1627920305?i=1000598054115", type: "podcast" },
          { title: "Shreyas Doshi Frameworks", url: "https://shreyasdoshi.com/", type: "article" },
          { title: "a16z AI Playbook", url: "https://a16z.com/artificial-intelligence-the-promise-and-the-playbook/", type: "article" },
          { title: "Evidently AI: 30 LLM Benchmarks", url: "https://www.evidentlyai.com/llm-guide/llm-benchmarks", type: "docs" },
          { title: "LMSYS Chatbot Arena", url: "https://lmarena.ai/", type: "tool" },
          { title: "Karpathy: Zero to Hero (full series)", url: "https://karpathy.ai/zero-to-hero.html", type: "course" },
          { title: "Hugging Face LLM Course", url: "https://huggingface.co/learn/llm-course/en/chapter1/1", type: "course" }
        ]
      }
    ]
  }
];

// ─── INTERACTIVE COMPONENTS ──────────────────────────────────────────────────

function TokenCalculator() {
  const [calls, setCalls] = useState(50);
  const [tokensPerCall, setTokensPerCall] = useState(800);
  const [outputTokens, setOutputTokens] = useState(400);
  const [days, setDays] = useState(31);
  const inputCost = 3; const outputCost = 15;
  const totalInput = calls * tokensPerCall * days;
  const totalOutput = calls * outputTokens * days;
  const monthlyCostIn = (totalInput / 1e6) * inputCost;
  const monthlyCostOut = (totalOutput / 1e6) * outputCost;
  const total = monthlyCostIn + monthlyCostOut;

  const Slider = ({ label, value, onChange, min, max, step, unit }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#8a8aa0", marginBottom: 4, fontFamily: "var(--mono)" }}>
        <span>{label}</span><span style={{ color: "#e0e0e0" }}>{value.toLocaleString()}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(+e.target.value)}
        style={{ width: "100%", accentColor: "#F76707", height: 4, background: "#222240" }} />
    </div>
  );

  return (
    <div style={{ background: "#111128", border: "1px solid #252545", borderRadius: 14, padding: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#F76707", fontFamily: "var(--mono)", letterSpacing: 1, marginBottom: 14 }}>
        🧮 TOKEN COST CALCULATOR
      </div>
      <Slider label="API calls / user / day" value={calls} onChange={setCalls} min={1} max={500} step={1} unit="" />
      <Slider label="Input tokens / call" value={tokensPerCall} onChange={setTokensPerCall} min={50} max={4000} step={50} unit="" />
      <Slider label="Output tokens / call" value={outputTokens} onChange={setOutputTokens} min={50} max={2000} step={50} unit="" />
      <Slider label="Days / month" value={days} onChange={setDays} min={1} max={31} step={1} unit="" />
      <div style={{ borderTop: "1px solid #252545", paddingTop: 14, marginTop: 6, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ background: "#1a1a35", borderRadius: 10, padding: 12, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "#666", fontFamily: "var(--mono)" }}>INPUT COST</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#F76707" }}>${monthlyCostIn.toFixed(2)}</div>
          <div style={{ fontSize: 10, color: "#555", fontFamily: "var(--mono)" }}>{(totalInput/1e6).toFixed(2)}M tokens</div>
        </div>
        <div style={{ background: "#1a1a35", borderRadius: 10, padding: 12, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "#666", fontFamily: "var(--mono)" }}>OUTPUT COST</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#F76707" }}>${monthlyCostOut.toFixed(2)}</div>
          <div style={{ fontSize: 10, color: "#555", fontFamily: "var(--mono)" }}>{(totalOutput/1e6).toFixed(2)}M tokens</div>
        </div>
      </div>
      <div style={{ background: "linear-gradient(135deg, #F76707 0%, #AE3EC9 100%)", borderRadius: 10, padding: 14, textAlign: "center", marginTop: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, opacity: 0.8, fontFamily: "var(--mono)" }}>TOTAL / USER / MONTH</div>
        <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "var(--display)" }}>${total.toFixed(2)}</div>
      </div>
    </div>
  );
}

function TemperatureDemo() {
  const [temp, setTemp] = useState(0.7);
  const words = ["The", "quick", "brown", "fox", "jumps", "gracefully", "leaps", "dances", "somersaults", "catapults", "yeets", "transcends", "discombobulates"];
  const getWords = (t) => {
    if (t < 0.3) return words.slice(0, 5);
    if (t < 0.7) return words.slice(0, 8);
    if (t < 1.2) return words.slice(0, 11);
    return words;
  };
  const available = getWords(temp);
  const probs = available.map((_, i) => Math.exp(-i / (temp + 0.1)));
  const total = probs.reduce((a, b) => a + b, 0);
  const normalized = probs.map(p => p / total);

  return (
    <div style={{ background: "#111128", border: "1px solid #252545", borderRadius: 14, padding: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#F76707", fontFamily: "var(--mono)", letterSpacing: 1, marginBottom: 14 }}>
        🌡️ TEMPERATURE VISUALIZER
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#8a8aa0", marginBottom: 4, fontFamily: "var(--mono)" }}>
        <span>Temperature</span><span style={{ color: temp < 0.3 ? "#2F9E44" : temp < 0.8 ? "#F76707" : "#E03131", fontWeight: 700 }}>{temp.toFixed(1)}</span>
      </div>
      <input type="range" min={0} max={2} step={0.1} value={temp} onChange={e => setTemp(+e.target.value)}
        style={{ width: "100%", accentColor: "#F76707", height: 4 }} />
      <div style={{ display: "flex", gap: 4, marginTop: 8, fontSize: 11, justifyContent: "space-between", fontFamily: "var(--mono)", color: "#555" }}>
        <span>Deterministic</span><span>Balanced</span><span>Creative</span><span>Chaotic</span>
      </div>
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 11, color: "#666", fontFamily: "var(--mono)", marginBottom: 8 }}>CANDIDATE TOKENS (probability distribution)</div>
        {available.map((word, i) => (
          <div key={word} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ width: 100, fontSize: 12, color: i === 0 ? "#2F9E44" : i < 3 ? "#e0e0e0" : "#888", fontFamily: "var(--mono)", textAlign: "right" }}>{word}</span>
            <div style={{ flex: 1, height: 16, background: "#1a1a35", borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                width: `${normalized[i] * 100}%`, height: "100%", borderRadius: 4,
                background: i === 0 ? "#2F9E44" : `hsl(${200 - i * 15}, 70%, ${55 - i * 3}%)`,
                transition: "width 0.4s ease"
              }} />
            </div>
            <span style={{ width: 40, fontSize: 10, color: "#666", fontFamily: "var(--mono)" }}>{(normalized[i] * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, padding: 10, background: "#1a1a35", borderRadius: 8, fontSize: 12, color: "#8a8aa0", lineHeight: 1.5 }}>
        {temp < 0.3 ? "🎯 Deterministic mode — always picks the top token. Best for: data extraction, classification, factual Q&A."
         : temp < 0.8 ? "⚖️ Balanced mode — mostly picks likely tokens with some variety. Best for: customer support, summarization."
         : temp < 1.2 ? "🎨 Creative mode — explores many options. Best for: brainstorming, marketing copy, creative writing."
         : "🌪️ Chaotic mode — even unlikely tokens get selected. Outputs may be incoherent. Rarely useful in production."}
      </div>
    </div>
  );
}

function SystemPromptBuilder() {
  const [role, setRole] = useState("");
  const [constraints, setConstraints] = useState("");
  const [format, setFormat] = useState("");
  const [guardrails, setGuardrails] = useState("");

  const score = [role, constraints, format, guardrails].filter(s => s.length > 15).length;
  const scoreLabels = ["Missing key parts", "Getting there", "Solid foundation", "Strong prompt", "Production-ready ✨"];
  const scoreColors = ["#E03131", "#F76707", "#F59F00", "#2F9E44", "#1C7ED6"];

  return (
    <div style={{ background: "#111128", border: "1px solid #252545", borderRadius: 14, padding: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#F76707", fontFamily: "var(--mono)", letterSpacing: 1, marginBottom: 4 }}>
        🏗️ SYSTEM PROMPT BUILDER
      </div>
      <div style={{ fontSize: 11, color: "#666", marginBottom: 14 }}>Build a system prompt and get instant quality feedback</div>
      {[
        { label: "1. ROLE", placeholder: "You are a senior financial analyst specializing in...", value: role, set: setRole, tip: "Be specific: domain, seniority, expertise" },
        { label: "2. CONSTRAINTS", placeholder: "Never provide investment advice. Always cite sources...", value: constraints, set: setConstraints, tip: "What should it do and NOT do?" },
        { label: "3. OUTPUT FORMAT", placeholder: "Respond with: Summary (2-3 sentences), Key Findings (bullets), Confidence (high/medium/low)", value: format, set: setFormat, tip: "How should responses be structured?" },
        { label: "4. GUARDRAILS", placeholder: "If asked about topics outside finance, politely redirect...", value: guardrails, set: setGuardrails, tip: "How to handle edge cases and off-topic" },
      ].map(({ label, placeholder, value, set, tip }) => (
        <div key={label} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#8a8aa0", fontFamily: "var(--mono)" }}>{label}</span>
            {value.length > 15 && <span style={{ fontSize: 10, color: "#2F9E44", fontFamily: "var(--mono)" }}>✓</span>}
          </div>
          <textarea value={value} onChange={e => set(e.target.value)} placeholder={placeholder}
            style={{ width: "100%", boxSizing: "border-box", background: "#1a1a35", border: "1px solid #252545", borderRadius: 8, padding: "10px 12px", color: "#e0e0e0", fontSize: 13, fontFamily: "var(--body)", resize: "vertical", minHeight: 48, outline: "none" }} />
          <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>{tip}</div>
        </div>
      ))}
      <div style={{ background: scoreColors[score], borderRadius: 8, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 700 }}>{scoreLabels[score]}</span>
        <span style={{ fontSize: 12, fontFamily: "var(--mono)" }}>{score}/4 sections</span>
      </div>
    </div>
  );
}

function EmbeddingSimilarity() {
  const mockEmbeddings = {
    "I love dogs": [0.8, 0.2, 0.9, 0.1], "I adore puppies": [0.75, 0.25, 0.88, 0.12],
    "The stock market crashed": [0.1, 0.9, 0.05, 0.8], "Financial markets declined": [0.15, 0.85, 0.08, 0.75],
    "The weather is nice today": [0.5, 0.3, 0.4, 0.5], "It's a beautiful sunny day": [0.52, 0.28, 0.42, 0.48],
  };
  const phrases = Object.keys(mockEmbeddings);
  const [p1, setP1] = useState(0);
  const [p2, setP2] = useState(1);
  const cosineSim = (a, b) => {
    const dot = a.reduce((s, v, i) => s + v * b[i], 0);
    const magA = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
    const magB = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
    return dot / (magA * magB);
  };
  const sim = cosineSim(mockEmbeddings[phrases[p1]], mockEmbeddings[phrases[p2]]);
  const simColor = sim > 0.95 ? "#2F9E44" : sim > 0.8 ? "#F59F00" : "#E03131";

  return (
    <div style={{ background: "#111128", border: "1px solid #252545", borderRadius: 14, padding: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#1C7ED6", fontFamily: "var(--mono)", letterSpacing: 1, marginBottom: 14 }}>
        📐 EMBEDDING SIMILARITY DEMO
      </div>
      <div style={{ fontSize: 11, color: "#666", fontFamily: "var(--mono)", marginBottom: 8 }}>PHRASE A</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
        {phrases.map((p, i) => (
          <button key={p} onClick={() => setP1(i)} style={{
            padding: "6px 12px", borderRadius: 8, border: p1 === i ? "1px solid #1C7ED6" : "1px solid #252545",
            background: p1 === i ? "#1C7ED622" : "transparent", color: p1 === i ? "#1C7ED6" : "#888",
            fontSize: 12, cursor: "pointer", fontFamily: "var(--body)"
          }}>{p}</button>
        ))}
      </div>
      <div style={{ fontSize: 11, color: "#666", fontFamily: "var(--mono)", marginBottom: 8 }}>PHRASE B</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
        {phrases.map((p, i) => (
          <button key={p} onClick={() => setP2(i)} style={{
            padding: "6px 12px", borderRadius: 8, border: p2 === i ? "1px solid #1C7ED6" : "1px solid #252545",
            background: p2 === i ? "#1C7ED622" : "transparent", color: p2 === i ? "#1C7ED6" : "#888",
            fontSize: 12, cursor: "pointer", fontFamily: "var(--body)"
          }}>{p}</button>
        ))}
      </div>
      <div style={{ background: "#1a1a35", borderRadius: 10, padding: 16, textAlign: "center" }}>
        <div style={{ fontSize: 11, color: "#666", fontFamily: "var(--mono)", marginBottom: 4 }}>COSINE SIMILARITY</div>
        <div style={{ fontSize: 36, fontWeight: 800, color: simColor, fontFamily: "var(--display)" }}>{sim.toFixed(4)}</div>
        <div style={{ height: 8, background: "#252545", borderRadius: 99, marginTop: 8, overflow: "hidden" }}>
          <div style={{ width: `${sim * 100}%`, height: "100%", background: simColor, borderRadius: 99, transition: "all 0.4s" }} />
        </div>
        <div style={{ fontSize: 11, color: "#888", marginTop: 8 }}>
          {sim > 0.95 ? "Nearly identical meaning ✨" : sim > 0.8 ? "Semantically related 🔗" : "Different topics 🔀"}
        </div>
      </div>
    </div>
  );
}

function RagPipeline() {
  const [step, setStep] = useState(0);
  const steps = [
    { title: "1. Document Loading", desc: "Load PDFs, web pages, docs into raw text", icon: "📄", detail: "Loaders: PyPDF, Unstructured, BeautifulSoup. Handle tables, images, headers." },
    { title: "2. Chunking", desc: "Split into 500-1000 token chunks with overlap", icon: "✂️", detail: "RecursiveCharacterTextSplitter(chunk_size=512, overlap=50). Respect sentence boundaries." },
    { title: "3. Embedding", desc: "Convert each chunk to a vector", icon: "🔢", detail: "text-embedding-3-small ($0.02/1M tokens) or sentence-transformers (free, local)." },
    { title: "4. Vector Storage", desc: "Store embeddings + metadata in vector DB", icon: "🗄️", detail: "Chroma for MVP, Pinecone for production. Include metadata: source, page, date." },
    { title: "5. Query Embedding", desc: "User question → embed → similarity search", icon: "🔍", detail: "Same embedding model as indexing. Retrieve top-K (3-5) most similar chunks." },
    { title: "6. Reranking (optional)", desc: "Cross-encoder reranks for precision", icon: "⚖️", detail: "Cohere Rerank or ms-marco-MiniLM. Improves precision by 10-30% but adds latency." },
    { title: "7. Generation", desc: "LLM generates answer grounded in retrieved context", icon: "💬", detail: "Inject chunks as context: 'Based on the following documents: [chunks]. Answer: [query]'" },
  ];

  return (
    <div style={{ background: "#111128", border: "1px solid #252545", borderRadius: 14, padding: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#1C7ED6", fontFamily: "var(--mono)", letterSpacing: 1, marginBottom: 14 }}>
        🔄 RAG PIPELINE — STEP BY STEP
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {steps.map((_, i) => (
          <button key={i} onClick={() => setStep(i)} style={{
            flex: 1, height: 6, borderRadius: 99, border: "none", cursor: "pointer",
            background: i <= step ? "#1C7ED6" : "#252545", transition: "background 0.3s"
          }} />
        ))}
      </div>
      <div style={{ background: "#1a1a35", borderRadius: 10, padding: 16, minHeight: 120 }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>{steps[step].icon}</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#e0e0e0", fontFamily: "var(--display)", marginBottom: 4 }}>{steps[step].title}</div>
        <div style={{ fontSize: 13, color: "#8a8aa0", marginBottom: 10, lineHeight: 1.5 }}>{steps[step].desc}</div>
        <div style={{ fontSize: 12, color: "#666", lineHeight: 1.6, padding: "8px 12px", background: "#111128", borderRadius: 8, fontFamily: "var(--mono)" }}>{steps[step].detail}</div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
          style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "1px solid #252545", background: "transparent", color: step === 0 ? "#333" : "#888", cursor: step === 0 ? "default" : "pointer", fontSize: 12, fontFamily: "var(--mono)" }}>← Back</button>
        <button onClick={() => setStep(Math.min(steps.length - 1, step + 1))} disabled={step === steps.length - 1}
          style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "1px solid #1C7ED644", background: step === steps.length - 1 ? "transparent" : "#1C7ED622", color: step === steps.length - 1 ? "#333" : "#1C7ED6", cursor: step === steps.length - 1 ? "default" : "pointer", fontSize: 12, fontWeight: 600, fontFamily: "var(--mono)" }}>Next →</button>
      </div>
    </div>
  );
}

const interactiveMap = {
  tokenCalculator: TokenCalculator,
  temperatureDemo: TemperatureDemo,
  systemPromptBuilder: SystemPromptBuilder,
  embeddingSimilarity: EmbeddingSimilarity,
  ragPipeline: RagPipeline,
};

// ─── QUIZ COMPONENT ──────────────────────────────────────────────────────────

function Quiz({ questions, color }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const q = questions[current];

  const handleSelect = (i) => {
    if (showResult) return;
    setSelected(i);
    setShowResult(true);
    if (i === q.correct) setScore(s => s + 1);
  };

  const next = () => {
    if (current < questions.length - 1) {
      setCurrent(c => c + 1); setSelected(null); setShowResult(false);
    } else {
      setCompleted(true);
    }
  };

  const reset = () => { setCurrent(0); setSelected(null); setShowResult(false); setScore(0); setCompleted(false); };

  if (completed) return (
    <div style={{ background: "#111128", border: "1px solid #252545", borderRadius: 14, padding: 20, textAlign: "center" }}>
      <div style={{ fontSize: 36, marginBottom: 8 }}>{score === questions.length ? "🏆" : score > questions.length / 2 ? "👏" : "📚"}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: "#e0e0e0", fontFamily: "var(--display)" }}>{score}/{questions.length} correct</div>
      <div style={{ fontSize: 13, color: "#888", marginTop: 4, marginBottom: 14 }}>
        {score === questions.length ? "Perfect score!" : score > questions.length / 2 ? "Great understanding!" : "Review the material and try again."}
      </div>
      <button onClick={reset} style={{ padding: "8px 24px", borderRadius: 8, border: `1px solid ${color}`, background: `${color}22`, color, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "var(--mono)" }}>Retry Quiz</button>
    </div>
  );

  return (
    <div style={{ background: "#111128", border: "1px solid #252545", borderRadius: 14, padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: "var(--mono)" }}>📝 KNOWLEDGE CHECK</span>
        <span style={{ fontSize: 11, color: "#555", fontFamily: "var(--mono)" }}>{current + 1}/{questions.length}</span>
      </div>
      <div style={{ fontSize: 14, color: "#e0e0e0", lineHeight: 1.6, marginBottom: 14, fontFamily: "var(--body)" }}>{q.q}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {q.options.map((opt, i) => {
          let bg = "#1a1a35", border = "#252545", c = "#bbb";
          if (showResult && i === q.correct) { bg = "#2F9E4422"; border = "#2F9E44"; c = "#2F9E44"; }
          else if (showResult && i === selected && i !== q.correct) { bg = "#E0313122"; border = "#E03131"; c = "#E03131"; }
          else if (selected === i) { bg = `${color}22`; border = color; c = color; }
          return (
            <button key={i} onClick={() => handleSelect(i)} style={{
              padding: "10px 14px", borderRadius: 8, border: `1px solid ${border}`, background: bg,
              color: c, cursor: showResult ? "default" : "pointer", fontSize: 13, textAlign: "left",
              fontFamily: "var(--body)", transition: "all 0.2s"
            }}>{opt}</button>
          );
        })}
      </div>
      {showResult && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12, color: "#8a8aa0", lineHeight: 1.6, padding: "10px 12px", background: "#1a1a35", borderRadius: 8, marginBottom: 10 }}>
            💡 {q.explanation}
          </div>
          <button onClick={next} style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: `1px solid ${color}44`, background: `${color}22`, color, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "var(--mono)" }}>
            {current < questions.length - 1 ? "Next Question →" : "See Results"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── RESOURCE BADGE ──────────────────────────────────────────────────────────

const typeStyles = {
  video: { bg: "#E0313118", color: "#E03131", label: "▶ Video" },
  course: { bg: "#1C7ED618", color: "#1C7ED6", label: "📚 Course" },
  tool: { bg: "#2F9E4418", color: "#2F9E44", label: "🔧 Tool" },
  docs: { bg: "#F59F0018", color: "#F59F00", label: "📄 Docs" },
  paper: { bg: "#AE3EC918", color: "#AE3EC9", label: "📑 Paper" },
  article: { bg: "#F7670718", color: "#F76707", label: "✏️ Article" },
  code: { bg: "#36895918", color: "#368959", label: "💻 Code" },
  podcast: { bg: "#C2255C18", color: "#C2255C", label: "🎙️ Podcast" },
};

// ─── SECTION COMPONENT ───────────────────────────────────────────────────────

function Section({ section, weekColor }) {
  const expandedSections = useRoadmapStore((state) => state.expandedSections);
  const selectedDepthLevels = useRoadmapStore((state) => state.selectedDepthLevels);
  const toggleExpandSection = useRoadmapStore((state) => state.toggleExpandSection);
  const setDepthLevel = useRoadmapStore((state) => state.setDepthLevel);

  const expanded = expandedSections.has(section.id);
  const depth = selectedDepthLevels[section.id] || "eli5";
  const depths = ["eli5", "normal", "technical", "pm"];
  const depthLabels = { eli5: "ELI5 🧒", normal: "Normal 📖", technical: "Technical ⚙️", pm: "PM Lens 🎯" };

  const renderText = (text) => {
    return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) return <strong key={i} style={{ color: "#e8e8e8" }}>{part.slice(2, -2)}</strong>;
      return <span key={i}>{part}</span>;
    });
  };

  const Interactive = section.interactive ? interactiveMap[section.interactive] : null;

  return (
    <div style={{ background: "#0d0d22", border: "1px solid #1a1a35", borderRadius: 16, marginBottom: 14, overflow: "hidden", transition: "border-color 0.3s" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = weekColor + "44"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "#1a1a35"}>
      <button onClick={() => toggleExpandSection(section.id)} style={{
        width: "100%", padding: "18px 20px", background: "none", border: "none",
        display: "flex", alignItems: "center", gap: 14, cursor: "pointer", textAlign: "left"
      }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${weekColor}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
          {expanded ? "▾" : "▸"}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#e8e8e8", fontSize: 16, fontWeight: 700, fontFamily: "var(--display)" }}>{section.title}</div>
          <div style={{ color: "#555", fontSize: 12, fontFamily: "var(--mono)", marginTop: 2 }}>{section.subtitle}</div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {section.interactive && <span style={{ fontSize: 9, padding: "3px 8px", background: "#2F9E4420", color: "#2F9E44", borderRadius: 6, fontWeight: 700, fontFamily: "var(--mono)" }}>INTERACTIVE</span>}
          {section.quiz && <span style={{ fontSize: 9, padding: "3px 8px", background: "#F59F0020", color: "#F59F00", borderRadius: 6, fontWeight: 700, fontFamily: "var(--mono)" }}>QUIZ</span>}
        </div>
      </button>

      {expanded && (
        <div style={{ padding: "0 20px 20px" }}>
          {/* Depth Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 16, background: "#111128", borderRadius: 10, padding: 4 }}>
            {depths.map(d => (
              <button key={d} onClick={() => setDepthLevel(section.id, d)} style={{
                flex: 1, padding: "8px 4px", borderRadius: 8, border: "none",
                background: depth === d ? weekColor : "transparent",
                color: depth === d ? "#fff" : "#666", fontSize: 12, fontWeight: 600,
                cursor: "pointer", fontFamily: "var(--mono)", transition: "all 0.2s"
              }}>{depthLabels[d]}</button>
            ))}
          </div>

          {/* Content */}
          <div style={{ color: "#b0b0c0", fontSize: 14, lineHeight: 1.85, fontFamily: "var(--body)", whiteSpace: "pre-line", marginBottom: 16 }}>
            {renderText(section.depths[depth])}
          </div>

          {/* Interactive */}
          {Interactive && <div style={{ marginBottom: 16 }}><Interactive /></div>}

          {/* Quiz */}
          {section.quiz && <div style={{ marginBottom: 16 }}><Quiz questions={section.quiz} color={weekColor} /></div>}

          {/* Resources */}
          {section.resources && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#555", fontFamily: "var(--mono)", letterSpacing: 1, marginBottom: 10 }}>📚 LEARN MORE</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {section.resources.map((r, i) => {
                  const style = typeStyles[r.type] || typeStyles.article;
                  return (
                    <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
                      background: "#111128", borderRadius: 8, textDecoration: "none",
                      border: "1px solid #1a1a35", transition: "border-color 0.2s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "#333"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "#1a1a35"}>
                      <span style={{ fontSize: 10, padding: "2px 8px", background: style.bg, color: style.color, borderRadius: 4, fontWeight: 700, fontFamily: "var(--mono)", flexShrink: 0 }}>{style.label}</span>
                      <span style={{ fontSize: 13, color: "#b0b0c0", fontFamily: "var(--body)" }}>{r.title}</span>
                      <span style={{ marginLeft: "auto", fontSize: 11, color: "#444" }}>↗</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────

export default function AIRoadmap() {
  const currentWeekId = useRoadmapStore((state) => state.currentWeekId);
  const setCurrentWeek = useRoadmapStore((state) => state.setCurrentWeek);
  const contentRef = useRef(null);

  const activeWeek = WEEKS.findIndex((w) => w.id === currentWeekId);
  const week = WEEKS[activeWeek];

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [activeWeek]);

  return (
    <div style={{ minHeight: "100vh", background: "#080818", color: "#e8e8e8" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Source+Sans+3:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
        :root { --display: 'Outfit', sans-serif; --body: 'Source Sans 3', sans-serif; --mono: 'IBM Plex Mono', monospace; }
        * { box-sizing: border-box; }
        input[type=range] { -webkit-appearance: none; appearance: none; background: #222240; border-radius: 99px; cursor: pointer; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #F76707; border: 2px solid #080818; }
        textarea:focus { border-color: #F76707 !important; }
        @media (max-width: 768px) {
          .layout { flex-direction: column !important; }
          .sidebar { width: 100% !important; max-height: none !important; position: static !important; border-right: none !important; border-bottom: 1px solid #1a1a35 !important; }
          .content { max-height: none !important; padding: 20px 16px !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ padding: "28px 28px 22px", borderBottom: "1px solid #151530", background: "linear-gradient(180deg, #0c0c22 0%, #080818 100%)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ padding: "4px 10px", background: "linear-gradient(135deg, #F76707, #AE3EC9)", borderRadius: 6, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, fontFamily: "var(--mono)" }}>30-DAY ROADMAP</span>
            <span style={{ color: "#444", fontSize: 11, fontFamily: "var(--mono)" }}>Based on @EXM7777</span>
          </div>
          <h1 style={{ fontSize: "clamp(22px, 3.5vw, 32px)", fontWeight: 800, fontFamily: "var(--display)", margin: "4px 0 6px", background: "linear-gradient(135deg, #fff 0%, #777 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Master AI: Engineer × Product Manager
          </h1>
          <p style={{ color: "#555", fontSize: 13, fontFamily: "var(--body)", lineHeight: 1.5, margin: 0 }}>
            4 depth levels per topic · Interactive tools · Quizzes · 150+ free resources · Zero API cost
          </p>
        </div>
      </div>

      {/* Layout */}
      <div className="layout" style={{ display: "flex", maxWidth: 1200, margin: "0 auto" }}>
        {/* Sidebar */}
        <div className="sidebar" style={{ width: 300, flexShrink: 0, padding: 16, borderRight: "1px solid #151530", position: "sticky", top: 0, maxHeight: "calc(100vh - 120px)", overflowY: "auto" }}>
          {WEEKS.map((w, i) => (
            <button key={w.id} onClick={() => setCurrentWeek(w.id)} style={{
              width: "100%", padding: "16px 14px", marginBottom: 6, borderRadius: 12, border: i === activeWeek ? `1px solid ${w.color}55` : "1px solid transparent",
              background: i === activeWeek ? `${w.color}0c` : "transparent", cursor: "pointer", textAlign: "left", transition: "all 0.25s"
            }}
            onMouseEnter={e => { if (i !== activeWeek) e.currentTarget.style.background = "#0d0d22"; }}
            onMouseLeave={e => { if (i !== activeWeek) e.currentTarget.style.background = "transparent"; }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 24 }}>{w.icon}</span>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: i === activeWeek ? w.color : "#444", letterSpacing: 1.5, fontFamily: "var(--mono)", marginBottom: 1 }}>{w.tag}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: i === activeWeek ? "#e0e0e0" : "#777", fontFamily: "var(--display)" }}>Week {w.id}: {w.title.split("—")[0]}</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: "#444", fontFamily: "var(--mono)", marginTop: 6, paddingLeft: 34 }}>
                {w.sections.length} sections · {w.sections.filter(s => s.interactive).length} interactive · {w.sections.filter(s => s.quiz).length} quizzes
              </div>
            </button>
          ))}
          <div style={{ margin: "12px 8px", padding: "14px", background: "#0d0d22", border: "1px solid #1a1a35", borderRadius: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#444", letterSpacing: 1.5, fontFamily: "var(--mono)", marginBottom: 6 }}>DEPTH LEVELS</div>
            <div style={{ fontSize: 11, color: "#666", lineHeight: 1.6 }}>
              🧒 <strong style={{ color: "#888" }}>ELI5</strong> — Analogy-first<br/>
              📖 <strong style={{ color: "#888" }}>Normal</strong> — Clear explanation<br/>
              ⚙️ <strong style={{ color: "#888" }}>Technical</strong> — Papers & math<br/>
              🎯 <strong style={{ color: "#888" }}>PM Lens</strong> — Product strategy
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="content" ref={contentRef} style={{ flex: 1, padding: "24px 32px", overflowY: "auto", maxHeight: "calc(100vh - 120px)" }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <span style={{ fontSize: 36 }}>{week.icon}</span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: week.color, letterSpacing: 2, fontFamily: "var(--mono)" }}>WEEK {week.id} · {week.tag}</div>
                <h2 style={{ fontSize: 26, fontWeight: 800, fontFamily: "var(--display)", margin: 0, color: "#fff" }}>{week.title}</h2>
              </div>
            </div>
            <div style={{ padding: "12px 16px", background: `${week.color}0a`, border: `1px solid ${week.color}30`, borderRadius: 10, display: "flex", alignItems: "flex-start", gap: 10 }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>🎯</span>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: week.color, letterSpacing: 1, fontFamily: "var(--mono)", marginBottom: 2 }}>PM PERSPECTIVE</div>
                <div style={{ fontSize: 13, color: "#8a8aa0", lineHeight: 1.5, fontFamily: "var(--body)" }}>{week.pmAngle}</div>
              </div>
            </div>
          </div>

          {week.sections.map(section => (
            <Section key={section.id} section={section} weekColor={week.color} />
          ))}

          {/* Week nav */}
          <div style={{ display: "flex", gap: 12, marginTop: 28, paddingBottom: 40 }}>
            <button onClick={() => setCurrentWeek(WEEKS[Math.max(0, activeWeek - 1)].id)} disabled={activeWeek === 0}
              style={{ flex: 1, padding: "12px 0", borderRadius: 10, border: "1px solid #252545", background: "transparent", color: activeWeek === 0 ? "#252545" : "#888", cursor: activeWeek === 0 ? "default" : "pointer", fontSize: 13, fontWeight: 600, fontFamily: "var(--mono)" }}>← Previous Week</button>
            <button onClick={() => setCurrentWeek(WEEKS[Math.min(WEEKS.length - 1, activeWeek + 1)].id)} disabled={activeWeek === WEEKS.length - 1}
              style={{ flex: 1, padding: "12px 0", borderRadius: 10, border: `1px solid ${week.color}44`, background: activeWeek === WEEKS.length - 1 ? "transparent" : `${week.color}18`, color: activeWeek === WEEKS.length - 1 ? "#252545" : week.color, cursor: activeWeek === WEEKS.length - 1 ? "default" : "pointer", fontSize: 13, fontWeight: 600, fontFamily: "var(--mono)" }}>Next Week →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
