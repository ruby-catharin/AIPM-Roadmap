import { useState, useEffect, useRef, useCallback } from "react";
import { useRoadmapStore } from "./store";
import { WEEKS } from "./data";

// ─── DARK MODE TOGGLE COMPONENT ──────────────────────────────────────────────

function DarkModeToggle({ isDarkMode, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: 40,
        height: 40,
        borderRadius: 6,
        border: "1px solid var(--border-color)",
        background: "var(--bg-secondary)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.15s",
        color: "var(--text-primary)",
        fontSize: 18,
        fontWeight: 600
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-hover)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-color)"; }}
      title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkMode ? "☀" : "☾"}
    </button>
  );
}

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
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)", marginBottom: 4, fontFamily: "var(--mono)" }}>
        <span>{label}</span><span style={{ color: "var(--text-secondary)" }}>{value.toLocaleString()}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(+e.target.value)}
        style={{ width: "100%", accentColor: "#F76707", height: 4, background: "var(--bg-tertiary)" }} />
    </div>
  );

  return (
    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: 14, padding: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#F76707", fontFamily: "var(--mono)", letterSpacing: 1, marginBottom: 14 }}>
        🧮 TOKEN COST CALCULATOR
      </div>
      <Slider label="API calls / user / day" value={calls} onChange={setCalls} min={1} max={500} step={1} unit="" />
      <Slider label="Input tokens / call" value={tokensPerCall} onChange={setTokensPerCall} min={50} max={4000} step={50} unit="" />
      <Slider label="Output tokens / call" value={outputTokens} onChange={setOutputTokens} min={50} max={2000} step={50} unit="" />
      <Slider label="Days / month" value={days} onChange={setDays} min={1} max={31} step={1} unit="" />
      <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: 14, marginTop: 6, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ background: "var(--bg-tertiary)", borderRadius: 10, padding: 12, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--mono)" }}>INPUT COST</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#F76707" }}>${monthlyCostIn.toFixed(2)}</div>
          <div style={{ fontSize: 10, color: "var(--text-light)", fontFamily: "var(--mono)" }}>{(totalInput/1e6).toFixed(2)}M tokens</div>
        </div>
        <div style={{ background: "var(--bg-tertiary)", borderRadius: 10, padding: 12, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--mono)" }}>OUTPUT COST</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#F76707" }}>${monthlyCostOut.toFixed(2)}</div>
          <div style={{ fontSize: 10, color: "var(--text-light)", fontFamily: "var(--mono)" }}>{(totalOutput/1e6).toFixed(2)}M tokens</div>
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
    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-light)", borderRadius: 12, padding: 20 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--mono)", letterSpacing: 1, marginBottom: 16 }}>
        🌡️ Temperature Visualizer
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)", marginBottom: 8, fontFamily: "var(--mono)" }}>
        <span>Temperature</span><span style={{ color: temp < 0.3 ? "#2F9E44" : temp < 0.8 ? "#F59F00" : "#E03131", fontWeight: 600 }}>{temp.toFixed(1)}</span>
      </div>
      <input type="range" min={0} max={2} step={0.1} value={temp} onChange={e => setTemp(+e.target.value)}
        style={{ width: "100%", accentColor: "#555555", height: 4 }} />
      <div style={{ display: "flex", gap: 4, marginTop: 10, fontSize: 11, justifyContent: "space-between", fontFamily: "var(--mono)", color: "var(--text-light)" }}>
        <span>Deterministic</span><span>Balanced</span><span>Creative</span><span>Chaotic</span>
      </div>
      <div style={{ marginTop: 18 }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--mono)", marginBottom: 10, fontWeight: 600 }}>DISTRIBUTION</div>
        {available.map((word, i) => (
          <div key={word} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ width: 100, fontSize: 12, color: i === 0 ? "#2F9E44" : i < 3 ? "var(--text-primary)" : "var(--text-light)", fontFamily: "var(--mono)", textAlign: "right" }}>{word}</span>
            <div style={{ flex: 1, height: 16, background: "var(--border-light)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                width: `${normalized[i] * 100}%`, height: "100%", borderRadius: 4,
                background: i === 0 ? "#2F9E44" : `hsl(${200 - i * 15}, 70%, ${55 - i * 3}%)`,
                transition: "width 0.4s ease"
              }} />
            </div>
            <span style={{ width: 40, fontSize: 10, color: "var(--text-light)", fontFamily: "var(--mono)" }}>{(normalized[i] * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14, padding: 12, background: "var(--bg-primary)", border: "1px solid var(--border-light)", borderRadius: 8, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
        {temp < 0.3 ? "🎯 Deterministic — always picks the top token. Best for: data extraction, classification, factual Q&A."
         : temp < 0.8 ? "⚖️ Balanced — mostly picks likely tokens with some variety. Best for: customer support, summarization."
         : temp < 1.2 ? "🎨 Creative — explores many options. Best for: brainstorming, marketing copy, creative writing."
         : "🌪️ Chaotic — even unlikely tokens get selected. Rarely useful in production."}
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
    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-light)", borderRadius: 12, padding: 20 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--mono)", letterSpacing: 1, marginBottom: 6 }}>
        🏗️ System Prompt Builder
      </div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>Get instant quality feedback</div>
      {[
        { label: "1. ROLE", placeholder: "You are a senior financial analyst specializing in...", value: role, set: setRole, tip: "Be specific: domain, seniority, expertise" },
        { label: "2. CONSTRAINTS", placeholder: "Never provide investment advice. Always cite sources...", value: constraints, set: setConstraints, tip: "What should it do and NOT do?" },
        { label: "3. OUTPUT FORMAT", placeholder: "Respond with: Summary (2-3 sentences), Key Findings (bullets)", value: format, set: setFormat, tip: "How should responses be structured?" },
        { label: "4. GUARDRAILS", placeholder: "If asked about topics outside finance, politely redirect...", value: guardrails, set: setGuardrails, tip: "How to handle edge cases?" },
      ].map(({ label, placeholder, value, set, tip }) => (
        <div key={label} style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--mono)" }}>{label}</span>
            {value.length > 15 && <span style={{ fontSize: 11, color: "#2F9E44", fontFamily: "var(--mono)" }}>✓</span>}
          </div>
          <textarea value={value} onChange={e => set(e.target.value)} placeholder={placeholder}
            style={{ width: "100%", boxSizing: "border-box", background: "var(--bg-primary)", border: "1px solid var(--border-light)", borderRadius: 8, padding: "10px 12px", color: "var(--text-primary)", fontSize: 13, fontFamily: "var(--body)", resize: "vertical", minHeight: 48, outline: "none" }} />
          <div style={{ fontSize: 11, color: "var(--text-light)", marginTop: 4 }}>{tip}</div>
        </div>
      ))}
      <div style={{ background: scoreColors[score], borderRadius: 8, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#fff" }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{scoreLabels[score]}</span>
        <span style={{ fontSize: 12, fontFamily: "var(--mono)" }}>{score}/4</span>
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
    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-light)", borderRadius: 12, padding: 20 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--mono)", letterSpacing: 1, marginBottom: 16 }}>
        📐 Embedding Similarity
      </div>
      <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--mono)", marginBottom: 10, fontWeight: 600 }}>PHRASE A</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {phrases.map((p, i) => (
          <button key={p} onClick={() => setP1(i)} style={{
            padding: "6px 12px", borderRadius: 6, border: p1 === i ? "1.5px solid var(--text-primary)" : "1px solid var(--border-light)",
            background: p1 === i ? "var(--text-primary)" : "var(--bg-primary)", color: p1 === i ? "var(--bg-primary)" : "var(--text-muted)",
            fontSize: 12, cursor: "pointer", fontFamily: "var(--body)"
          }}>{p}</button>
        ))}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--mono)", marginBottom: 10, fontWeight: 600 }}>PHRASE B</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {phrases.map((p, i) => (
          <button key={p} onClick={() => setP2(i)} style={{
            padding: "6px 12px", borderRadius: 6, border: p2 === i ? "1.5px solid var(--text-primary)" : "1px solid var(--border-light)",
            background: p2 === i ? "var(--text-primary)" : "var(--bg-primary)", color: p2 === i ? "var(--bg-primary)" : "var(--text-muted)",
            fontSize: 12, cursor: "pointer", fontFamily: "var(--body)"
          }}>{p}</button>
        ))}
      </div>
      <div style={{ background: "var(--bg-primary)", border: "1px solid var(--border-light)", borderRadius: 8, padding: 16, textAlign: "center" }}>
        <div style={{ fontSize: 11, color: "var(--text-light)", fontFamily: "var(--mono)", marginBottom: 6, fontWeight: 600 }}>COSINE SIMILARITY</div>
        <div style={{ fontSize: 40, fontWeight: 700, color: simColor, fontFamily: "var(--display)" }}>{sim.toFixed(4)}</div>
        <div style={{ height: 6, background: "var(--border-light)", borderRadius: 99, marginTop: 10, overflow: "hidden" }}>
          <div style={{ width: `${sim * 100}%`, height: "100%", background: simColor, borderRadius: 99, transition: "all 0.4s" }} />
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 10 }}>
          {sim > 0.95 ? "Nearly identical ✨" : sim > 0.8 ? "Semantically related 🔗" : "Different topics 🔀"}
        </div>
      </div>
    </div>
  );
}

function RagPipeline() {
  const [step, setStep] = useState(0);
  const steps = [
    { title: "1. Document Loading", desc: "Load PDFs, web pages, docs into raw text", detail: "Loaders: PyPDF, Unstructured, BeautifulSoup. Handle tables, images, headers." },
    { title: "2. Chunking", desc: "Split into 500-1000 token chunks with overlap", detail: "RecursiveCharacterTextSplitter(chunk_size=512, overlap=50). Respect sentence boundaries." },
    { title: "3. Embedding", desc: "Convert each chunk to a vector", detail: "text-embedding-3-small ($0.02/1M tokens) or sentence-transformers (free, local)." },
    { title: "4. Vector Storage", desc: "Store embeddings + metadata in vector DB", detail: "Chroma for MVP, Pinecone for production. Include metadata: source, page, date." },
    { title: "5. Query Embedding", desc: "User question → embed → similarity search", detail: "Same embedding model as indexing. Retrieve top-K (3-5) most similar chunks." },
    { title: "6. Reranking (optional)", desc: "Cross-encoder reranks for precision", detail: "Cohere Rerank or ms-marco-MiniLM. Improves precision by 10-30% but adds latency." },
    { title: "7. Generation", desc: "LLM generates answer grounded in retrieved context", detail: "Inject chunks as context: 'Based on the following documents: [chunks]. Answer: [query]'" },
  ];

  return (
    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-light)", borderRadius: 12, padding: 20 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--mono)", letterSpacing: 1, marginBottom: 16 }}>
        RAG Pipeline
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {steps.map((_, i) => (
          <button key={i} onClick={() => setStep(i)} style={{
            flex: 1, height: 5, borderRadius: 99, border: "none", cursor: "pointer",
            background: i <= step ? "var(--text-primary)" : "var(--border-color)", transition: "background 0.3s"
          }} />
        ))}
      </div>
      <div style={{ background: "var(--bg-primary)", border: "1px solid var(--border-light)", borderRadius: 8, padding: 16, minHeight: 130 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--display)", marginBottom: 6 }}>{steps[step].title}</div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12, lineHeight: 1.6 }}>{steps[step].desc}</div>
        <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, padding: "10px 12px", background: "var(--bg-tertiary)", border: "1px solid var(--border-light)", borderRadius: 6, fontFamily: "var(--mono)" }}>{steps[step].detail}</div>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
          style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "1px solid var(--border-light)", background: step === 0 ? "var(--bg-secondary)" : "var(--bg-primary)", color: step === 0 ? "var(--text-light)" : "var(--text-primary)", cursor: step === 0 ? "default" : "pointer", fontSize: 12, fontFamily: "var(--body)" }}>← Back</button>
        <button onClick={() => setStep(Math.min(steps.length - 1, step + 1))} disabled={step === steps.length - 1}
          style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "1px solid var(--border-light)", background: step === steps.length - 1 ? "var(--bg-secondary)" : "var(--bg-primary)", color: step === steps.length - 1 ? "var(--text-light)" : "var(--text-primary)", cursor: step === steps.length - 1 ? "default" : "pointer", fontSize: 12, fontFamily: "var(--body)" }}>Next →</button>
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
    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 24, textAlign: "center" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{score === questions.length ? "🏆" : score > questions.length / 2 ? "👏" : "📚"}</div>
      <div style={{ fontSize: 22, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--display)" }}>{score}/{questions.length} correct</div>
      <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 6, marginBottom: 16 }}>
        {score === questions.length ? "Perfect score!" : score > questions.length / 2 ? "Great understanding!" : "Review the material and try again."}
      </div>
      <button onClick={reset} style={{ padding: "10px 28px", borderRadius: 8, border: "1px solid var(--border-hover)", background: "var(--text-primary)", color: "var(--bg-primary)", cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "var(--body)" }}>Retry Quiz</button>
    </div>
  );

  return (
    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", fontFamily: "var(--mono)" }}>KNOWLEDGE CHECK</span>
        <span style={{ fontSize: 11, color: "var(--text-light)", fontFamily: "var(--mono)" }}>{current + 1}/{questions.length}</span>
      </div>
      <div style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16, fontFamily: "var(--body)" }}>{q.q}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {q.options.map((opt, i) => {
          let bg = "var(--bg-input)", border = "var(--border-color)", c = "var(--text-secondary)";
          if (showResult && i === q.correct) { bg = "var(--badge-bg-interactive)"; border = "#2F9E44"; c = "#2F9E44"; }
          else if (showResult && i === selected && i !== q.correct) { bg = "#ffebee"; border = "#E03131"; c = "#E03131"; }
          else if (selected === i) { bg = "var(--bg-tertiary)"; border = "var(--text-primary)"; c = "var(--text-primary)"; }
          return (
            <button key={i} onClick={() => handleSelect(i)} style={{
              padding: "12px 14px", borderRadius: 8, border: `1px solid ${border}`, background: bg,
              color: c, cursor: showResult ? "default" : "pointer", fontSize: 13, textAlign: "left",
              fontFamily: "var(--body)", transition: "all 0.15s"
            }}>{opt}</button>
          );
        })}
      </div>
      {showResult && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6, padding: "12px 14px", background: "var(--bg-tertiary)", border: "1px solid var(--section-separator)", borderRadius: 8, marginBottom: 12 }}>
            {q.explanation}
          </div>
          <button onClick={next} style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "1px solid var(--border-hover)", background: "var(--text-primary)", color: "var(--bg-primary)", cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "var(--body)" }}>
            {current < questions.length - 1 ? "Next Question →" : "See Results"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── RESOURCE BADGE ──────────────────────────────────────────────────────────

const typeStyles = {
  video: { bg: "#E0313118", color: "#E03131", label: "Video" },
  course: { bg: "#1C7ED618", color: "#1C7ED6", label: "Course" },
  tool: { bg: "#2F9E4418", color: "#2F9E44", label: "Tool" },
  docs: { bg: "#F59F0018", color: "#F59F00", label: "Docs" },
  paper: { bg: "#AE3EC918", color: "#AE3EC9", label: "Paper" },
  article: { bg: "#F7670718", color: "#F76707", label: "Article" },
  code: { bg: "#36895918", color: "#368959", label: "Code" },
  podcast: { bg: "#C2255C18", color: "#C2255C", label: "Podcast" },
};

// ─── SECTION COMPONENT ───────────────────────────────────────────────────────

function Section({ section, weekColor }) {
  const depths = ["eli5", "normal", "technical", "pm"];
  const depthLabels = { eli5: "ELI5", normal: "Normal", technical: "Technical", pm: "PM Lens" };

  const renderText = (text) => {
    return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) return <strong key={i} style={{ color: "var(--text-primary)", fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
      return <span key={i}>{part}</span>;
    });
  };

  const Interactive = section.interactive ? interactiveMap[section.interactive] : null;

  const resourcesList = Array.isArray(section.resources)
    ? section.resources
    : section.resources
      ? Object.values(section.resources).reduce((acc, list) => {
          if (Array.isArray(list)) list.forEach(r => { if (!acc.some(x => x.url === r.url)) acc.push(r); });
          return acc;
        }, [])
      : [];

  return (
    <div
      data-section-id={section.id}
      style={{ background: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: 12, marginBottom: 20, overflow: "hidden", transition: "all 0.2s", padding: "20px", scrollMarginTop: "160px" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-hover)"; e.currentTarget.style.boxShadow = "0 1px 3px var(--shadow-md)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-color)"; e.currentTarget.style.boxShadow = "none"; }}>

      {/* Section Title */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ color: "var(--text-primary)", fontSize: 17, fontWeight: 600, fontFamily: "var(--display)" }}>{section.title}</div>
        {section.subtitle && <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4, fontFamily: "var(--body)" }}>{section.subtitle}</div>}
      </div>

      {/* TL;DR */}
      {section.tldr && section.tldr.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-muted)", letterSpacing: 1.5, fontFamily: "var(--mono)", marginBottom: 10, textTransform: "uppercase" }}>
            TL;DR
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {section.tldr.map((point, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 10,
                padding: "10px 14px", background: "var(--bg-secondary)",
                border: "1px solid var(--border-light)", borderRadius: 8
              }}>
                <span style={{ fontSize: 11, color: weekColor, fontWeight: 700, fontFamily: "var(--mono)", flexShrink: 0, marginTop: 2 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, fontFamily: "var(--body)" }}>
                  {renderText(point)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Depth Levels Stacked */}
      {depths.map((depth, idx) => (
        <div key={depth} id={`depth-${section.id}-${depth}`} style={{ marginBottom: idx < depths.length - 1 ? 28 : 0, scrollMarginTop: "160px" }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-muted)", letterSpacing: 1.5, fontFamily: "var(--mono)", marginBottom: 10, textTransform: "uppercase", paddingBottom: 8, borderBottom: "1px solid var(--border-light)" }}>
            {depthLabels[depth]}
          </div>
          <div style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.8, fontFamily: "var(--body)", whiteSpace: "pre-line" }}>
            {renderText(section.depths[depth])}
          </div>
        </div>
      ))}

      {/* Key Insight */}
      {section.keyInsight && (
        <div style={{
          marginTop: 24, marginBottom: 4, padding: "14px 18px",
          background: "var(--bg-secondary)", borderLeft: `3px solid ${weekColor}`,
          borderRadius: "0 8px 8px 0"
        }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: weekColor, letterSpacing: 1.5, fontFamily: "var(--mono)", marginBottom: 6, textTransform: "uppercase" }}>
            Key Insight
          </div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, fontFamily: "var(--body)" }}>
            {renderText(section.keyInsight)}
          </div>
        </div>
      )}

      {/* Interactive Widget */}
      {Interactive && <div style={{ marginBottom: 20, marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--section-separator)" }}><Interactive /></div>}

      {/* Quiz */}
      {section.quiz && section.quiz.length > 0 && (
        <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--section-separator)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: 1.2, fontFamily: "var(--mono)", marginBottom: 16, textTransform: "uppercase" }}>Knowledge Check</div>
          <Quiz questions={section.quiz} color={weekColor} />
        </div>
      )}

      {/* Resources — after quiz */}
      {resourcesList.length > 0 && (
        <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--section-separator)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: 1.2, fontFamily: "var(--mono)", marginBottom: 16, textTransform: "uppercase" }}>Resources</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {resourcesList.map((r, i) => {
              const style = typeStyles[r.type] || typeStyles.article;
              return (
                <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "10px 12px",
                  background: "var(--bg-secondary)", borderRadius: 8, textDecoration: "none",
                  border: "1px solid var(--border-color)", transition: "all 0.15s"
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-hover)"; e.currentTarget.style.boxShadow = "0 1px 2px var(--shadow-sm)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-color)"; e.currentTarget.style.boxShadow = "none"; }}>
                  <span style={{ fontSize: 8, padding: "2px 6px", background: style.bg, color: style.color, borderRadius: 3, fontWeight: 600, fontFamily: "var(--mono)", flexShrink: 0, whiteSpace: "nowrap" }}>{style.label}</span>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)", fontFamily: "var(--body)", flex: 1, minWidth: 0 }}>{r.title}</span>
                  <span style={{ fontSize: 10, color: "var(--text-light)", flexShrink: 0 }}>↗</span>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── WEEK TABS COMPONENT ─────────────────────────────────────────────────────

function WeekTabs({ activeWeekId, onWeekChange, isMobile, onMobileClose }) {
  return (
    <div style={{ display: "flex", gap: 8, padding: "12px 32px", borderBottom: "1px solid var(--border-light)", background: "var(--bg-primary)", overflowX: "auto", position: "sticky", top: 64, zIndex: 50, minHeight: 60 }}>
      {WEEKS.map((week) => (
        <button
          key={week.id}
          onClick={() => {
            onWeekChange(week.id);
            if (isMobile) onMobileClose();
          }}
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            border: activeWeekId === week.id ? "1.5px solid var(--text-primary)" : "1px solid var(--border-color)",
            background: activeWeekId === week.id ? "var(--text-primary)" : "var(--bg-primary)",
            color: activeWeekId === week.id ? "var(--bg-primary)" : "var(--text-primary)",
            fontSize: 13,
            fontWeight: 500,
            fontFamily: "var(--body)",
            cursor: "pointer",
            transition: "all 0.15s",
            whiteSpace: "nowrap"
          }}
          onMouseEnter={e => {
            if (activeWeekId !== week.id) {
              e.currentTarget.style.borderColor = "var(--border-hover)";
              e.currentTarget.style.background = "var(--bg-secondary)";
            }
          }}
          onMouseLeave={e => {
            if (activeWeekId !== week.id) {
              e.currentTarget.style.borderColor = "var(--border-color)";
              e.currentTarget.style.background = "var(--bg-primary)";
            }
          }}
        >
          Week {week.id}
        </button>
      ))}
    </div>
  );
}

// ─── TABLE OF CONTENTS SIDEBAR ───────────────────────────────────────────────

function TableOfContents({ week, currentSection }) {
  const depthLevelLabels = { eli5: "ELI5", normal: "Normal", technical: "Technical", pm: "PM Lens" };

  const scrollToEl = (el) => {
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToSection = (section) => {
    scrollToEl(document.querySelector(`[data-section-id="${section.id}"]`));
  };

  const scrollToDepth = (sectionId, depth) => {
    scrollToEl(document.getElementById(`depth-${sectionId}-${depth}`));
  };

  if (!week || !week.sections) return null;

  return (
    <div className="sidebar" style={{ width: 220, flexShrink: 0, padding: "20px", borderRight: "1px solid var(--border-light)", position: "sticky", top: 130, maxHeight: "calc(100vh - 130px)", overflowY: "auto", background: "var(--bg-tertiary)" }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", letterSpacing: 1.2, fontFamily: "var(--mono)", marginBottom: 16, textTransform: "uppercase" }}>
        Contents
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {week.sections.map((section) => {
          const isActive = currentSection?.id === section.id;
          return (
            <div key={section.id} style={{ marginBottom: 2 }}>
              <button
                onClick={() => scrollToSection(section)}
                style={{
                  padding: "8px 10px",
                  borderRadius: 4,
                  border: "none",
                  background: "transparent",
                  color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                  fontSize: 12,
                  fontWeight: isActive ? 600 : 400,
                  fontFamily: "var(--body)",
                  cursor: "pointer",
                  textAlign: "left",
                  borderLeft: isActive ? "2px solid var(--text-primary)" : "2px solid transparent",
                  transition: "all 0.15s",
                  lineHeight: 1.4,
                  width: "100%"
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = "var(--text-primary)";
                    e.currentTarget.style.background = "var(--bg-secondary)";
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = "var(--text-secondary)";
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                {section.title}
              </button>

              {/* Depth levels — active section only */}
              {isActive && (
                <div style={{ display: "flex", flexDirection: "column", gap: 1, marginTop: 2, marginLeft: 10, paddingLeft: 8, borderLeft: "1px solid var(--border-hover)" }}>
                  {["eli5", "normal", "technical", "pm"].map((depth) => (
                    <button
                      key={depth}
                      onClick={() => scrollToDepth(section.id, depth)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 3,
                        border: "none",
                        background: "transparent",
                        color: "var(--text-muted)",
                        fontSize: 10,
                        fontWeight: 400,
                        fontFamily: "var(--mono)",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.15s",
                        letterSpacing: 0.3
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.color = "var(--text-primary)";
                        e.currentTarget.style.background = "var(--bg-secondary)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.color = "var(--text-muted)";
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      {depthLevelLabels[depth]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MOBILE TABLE OF CONTENTS ────────────────────────────────────────────────

function MobileTOC({ week }) {
  const scrollToSection = (sectionId) => {
    const el = document.querySelector(`[data-section-id="${sectionId}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!week || !week.sections) return null;

  return (
    <div style={{ marginBottom: 28, padding: "14px 16px", background: "var(--bg-secondary)", borderRadius: 10, border: "1px solid var(--border-light)" }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", letterSpacing: 1.2, fontFamily: "var(--mono)", marginBottom: 12, textTransform: "uppercase" }}>
        Contents
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {week.sections.map((section) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            style={{
              padding: "8px 4px",
              border: "none",
              background: "transparent",
              color: "var(--text-secondary)",
              fontSize: 13,
              fontFamily: "var(--body)",
              cursor: "pointer",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: 8
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--text-primary)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-secondary)"; }}
          >
            <span style={{ color: "var(--text-muted)", fontSize: 11 }}>→</span>
            {section.title}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────

export default function AIRoadmap() {
  const currentWeekId = useRoadmapStore((state) => state.currentWeekId);
  const setCurrentWeek = useRoadmapStore((state) => state.setCurrentWeek);
  const contentRef = useRef(null);
  const [currentSection, setCurrentSection] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const activeWeek = WEEKS.findIndex((w) => w.id === currentWeekId);
  const week = WEEKS[activeWeek];

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
    setCurrentSection(week.sections[0] || null);
  }, [activeWeek, week.sections]);

  // Track which section is in view — debounced so TOC only updates after scroll stops
  useEffect(() => {
    const OFFSET = 200; // below sticky header + week tabs
    let scrollTimer = null;

    const handleScroll = () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        const sectionEls = document.querySelectorAll("[data-section-id]");
        let active = week.sections[0];
        sectionEls.forEach((el) => {
          if (el.getBoundingClientRect().top <= OFFSET) {
            const sectionId = el.getAttribute("data-section-id");
            const section = week.sections.find((s) => s.id === sectionId);
            if (section) active = section;
          }
        });
        setCurrentSection(active);
      }, 150);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearTimeout(scrollTimer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [week.sections]);

  const darkMode = useRoadmapStore((state) => state.darkMode);
  const setDarkMode = useRoadmapStore((state) => state.setDarkMode);

  // Apply dark mode class to document root
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark-mode");
    } else {
      document.documentElement.classList.remove("dark-mode");
    }
  }, [darkMode]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Source+Sans+3:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');

        :root {
          --display: 'Outfit', sans-serif;
          --body: 'Source Sans 3', sans-serif;
          --mono: 'IBM Plex Mono', monospace;

          /* Light mode colors (default) */
          --bg-primary: #ffffff;
          --bg-secondary: #f9f9f9;
          --bg-tertiary: #fafafa;
          --bg-input: #ffffff;
          --text-primary: #000000;
          --text-secondary: #333333;
          --text-muted: #666666;
          --text-light: #999999;
          --border-color: #e0e0e0;
          --border-light: #efefef;
          --border-hover: #d0d0d0;
          --badge-bg-interactive: #e8f5e9;
          --badge-color-interactive: #2e7d32;
          --badge-bg-quiz: #fff3e0;
          --badge-color-quiz: #e65100;
          --section-separator: #f0f0f0;
          --shadow-sm: rgba(0,0,0,0.05);
          --shadow-md: rgba(0,0,0,0.08);
          --label-color: #666;
          --accent-primary: #007AFF;
          --accent-text: #ffffff;
          --accent-hover: rgba(0, 122, 255, 0.1);
        }

        :root.dark-mode {
          /* Dark mode colors */
          --bg-primary: #0f0f0f;
          --bg-secondary: #1a1a1a;
          --bg-tertiary: #151515;
          --bg-input: #1a1a1a;
          --text-primary: #ffffff;
          --text-secondary: #e0e0e0;
          --text-muted: #999999;
          --text-light: #666666;
          --border-color: #2a2a2a;
          --border-light: #1f1f1f;
          --border-hover: #3a3a3a;
          --badge-bg-interactive: #1b3a1b;
          --badge-color-interactive: #90EE90;
          --badge-bg-quiz: #3a2a1a;
          --badge-color-quiz: #FFB366;
          --section-separator: #1f1f1f;
          --shadow-sm: rgba(0,0,0,0.3);
          --shadow-md: rgba(0,0,0,0.5);
          --label-color: #999;
          --accent-primary: #0A84FF;
          --accent-text: #ffffff;
          --accent-hover: rgba(10, 132, 255, 0.2);
        }

        * { box-sizing: border-box; }

        input[type=range] {
          -webkit-appearance: none;
          appearance: none;
          background: var(--bg-secondary);
          border-radius: 99px;
          cursor: pointer;
        }

        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--text-muted);
          border: 2px solid var(--bg-primary);
        }

        textarea:focus {
          border-color: var(--text-muted) !important;
        }

        button {
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @media (max-width: 1200px) {
          .layout { margin-left: 0 !important; margin-right: 0 !important; }
          .sidebar { width: 180px !important; padding: 16px !important; }
          .content { padding: 32px 24px !important; }
          .right-sidebar { width: 220px !important; }
        }

        @media (max-width: 1024px) {
          .sidebar { width: 160px !important; padding: 14px !important; }
          .content { padding: 28px 20px !important; }
          .right-sidebar { width: 200px !important; }
        }

        @media (max-width: 768px) {
          .layout { flex-direction: column !important; }
          .sidebar {
            position: fixed !important;
            left: 0 !important;
            top: 64px !important;
            width: 100% !important;
            max-height: calc(100vh - 130px) !important;
            z-index: 99 !important;
            border-right: none !important;
            border-bottom: 1px solid var(--border-light) !important;
            background: var(--bg-primary) !important;
            padding: 16px !important;
          }
          .content { padding: 20px 16px !important; }
          .right-sidebar { display: none !important; width: 100% !important; position: static !important; border-left: none !important; max-height: none !important; top: auto !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, padding: "16px 32px", borderBottom: "1px solid var(--border-light)", background: "var(--bg-primary)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {!isMobile && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-light)",
                    borderRadius: 6,
                    padding: "8px 10px",
                    cursor: "pointer",
                    color: "var(--text-secondary)",
                    fontSize: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.15s",
                    width: 36,
                    height: 36
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "var(--border-light)";
                    e.currentTarget.style.borderColor = "var(--border-hover)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "var(--bg-secondary)";
                    e.currentTarget.style.borderColor = "var(--border-light)";
                  }}
                  title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                >
                  {sidebarOpen ? "←" : "→"}
                </button>
              )}
              <div>
                <h1 style={{ fontSize: isMobile ? 16 : 20, fontWeight: 600, fontFamily: "var(--display)", margin: 0, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                  AI PM Roadmap
                </h1>
                {!isMobile && (
                  <p style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "var(--body)", margin: "4px 0 0" }}>
                    4 depth levels · Interactive tools · Quizzes · Resources
                  </p>
                )}
              </div>
            </div>
            <DarkModeToggle isDarkMode={darkMode} onToggle={() => setDarkMode(!darkMode)} />
          </div>
        </div>
      </div>

      {/* Week Tabs */}
      <WeekTabs activeWeekId={currentWeekId} onWeekChange={setCurrentWeek} isMobile={isMobile} onMobileClose={() => {}} />

      {/* Layout */}
      <div className="layout" style={{ display: "flex", maxWidth: 1600, margin: "0 auto", minHeight: "calc(100vh - 190px)" }}>
        {/* TOC Sidebar — desktop only */}
        {!isMobile && sidebarOpen && <TableOfContents week={week} currentSection={currentSection} />}

        {/* Content */}
        <div className="content" ref={contentRef} style={{ flex: 1, padding: "40px 48px", overflowY: "auto", background: "var(--bg-primary)" }}>
          <div style={{ marginBottom: 40 }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", letterSpacing: 1.2, fontFamily: "var(--mono)", marginBottom: 4 }}>WEEK {week.id}</div>
              <h2 style={{ fontSize: 28, fontWeight: 600, fontFamily: "var(--display)", margin: 0, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>{week.title}</h2>
            </div>
            <div style={{ padding: "16px 20px", background: "var(--bg-secondary)", border: "1px solid var(--border-light)", borderRadius: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", letterSpacing: 1, fontFamily: "var(--mono)", marginBottom: 4 }}>WHY THIS MATTERS</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, fontFamily: "var(--body)" }}>{week.pmAngle}</div>
            </div>
          </div>

          {/* Mobile TOC — inline at top of content */}
          {isMobile && <MobileTOC week={week} />}

          {week.sections.map(section => (
            <Section key={section.id} section={section} weekColor={week.color} />
          ))}
        </div>
      </div>
    </div>
  );
}
