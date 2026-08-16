import { useState, useEffect, useRef, useCallback } from "react";
import { useRoadmapStore } from "./store";
import { WEEKS } from "./data";

// A translucent wash of a semantic token. Used wherever a surface needs to read
// as "this colour" without a second hardcoded palette per theme.
const tint = c => `color-mix(in srgb, ${c} 14%, transparent)`;

// ─── DARK MODE TOGGLE COMPONENT ──────────────────────────────────────────────

// Line icons instead of emoji: emoji render as full-colour glyphs that ignore
// the theme and shift size between platforms.
function SunIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />
    </svg>
  );
}

function DarkModeToggle({ isDarkMode, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        width: 40,
        height: 40,
        borderRadius: "var(--r-sm)",
        border: "1px solid var(--border-color)",
        background: "var(--bg-secondary)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "border-color var(--dur) var(--ease), background var(--dur) var(--ease), transform var(--dur) var(--ease)",
        color: "var(--text-primary)",
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-hover)"; e.currentTarget.style.background = "var(--bg-tertiary)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-color)"; e.currentTarget.style.background = "var(--bg-secondary)"; }}
      title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkMode ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

// ─── INTERACTIVE COMPONENTS ──────────────────────────────────────────────────

// Shared by every calculator. Defined at module scope so dragging a slider
// doesn't remount the input and drop the pointer mid-drag.
function Slider({ label, value, onChange, min, max, step, unit = "", accent = "var(--accent-primary)" }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", cursor: "pointer" }}>
        <span style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 12, color: "var(--label-color)", marginBottom: 6, fontFamily: "var(--mono)" }}>
          <span>{label}</span>
          <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{value.toLocaleString()}{unit}</span>
        </span>
        <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(+e.target.value)}
          style={{ width: "100%", accentColor: accent, height: 4, background: "var(--bg-tertiary)", display: "block" }} />
      </label>
    </div>
  );
}

// Prev/next buttons in the step walkthroughs. Disabled state is carried by
// colour and cursor, so it stays legible without relying on opacity.
const stepNavStyle = disabled => ({
  flex: 1, padding: "10px 0", borderRadius: "var(--r-md)",
  border: "1px solid var(--border-light)",
  background: disabled ? "var(--bg-secondary)" : "var(--bg-primary)",
  color: disabled ? "var(--text-light)" : "var(--text-primary)",
  cursor: disabled ? "default" : "pointer",
  fontSize: 12, fontFamily: "var(--body)",
  transition: "background var(--dur) var(--ease), border-color var(--dur) var(--ease)",
});

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

  return (
    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--r-lg)", padding: 20 }}>
      <h4 style={{ fontSize: 12, fontWeight: 600, color: "var(--label-color)", fontFamily: "var(--mono)", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 14px" }}>
        Token cost calculator
      </h4>
      <Slider label="API calls / user / day" value={calls} onChange={setCalls} min={1} max={500} step={1} accent="var(--orange)" />
      <Slider label="Input tokens / call" value={tokensPerCall} onChange={setTokensPerCall} min={50} max={4000} step={50} accent="var(--orange)" />
      <Slider label="Output tokens / call" value={outputTokens} onChange={setOutputTokens} min={50} max={2000} step={50} accent="var(--orange)" />
      <Slider label="Days / month" value={days} onChange={setDays} min={1} max={31} step={1} accent="var(--orange)" />
      <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: 14, marginTop: 6, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ background: "var(--bg-tertiary)", borderRadius: "var(--r-md)", padding: 12, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "var(--label-color)", fontFamily: "var(--mono)" }}>INPUT COST</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--orange)", fontFamily: "var(--display)" }}>${monthlyCostIn.toFixed(2)}</div>
          <div style={{ fontSize: 10, color: "var(--text-light)", fontFamily: "var(--mono)" }}>{(totalInput/1e6).toFixed(2)}M tokens</div>
        </div>
        <div style={{ background: "var(--bg-tertiary)", borderRadius: "var(--r-md)", padding: 12, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "var(--label-color)", fontFamily: "var(--mono)" }}>OUTPUT COST</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--orange)", fontFamily: "var(--display)" }}>${monthlyCostOut.toFixed(2)}</div>
          <div style={{ fontSize: 10, color: "var(--text-light)", fontFamily: "var(--mono)" }}>{(totalOutput/1e6).toFixed(2)}M tokens</div>
        </div>
      </div>
      <div style={{ background: "var(--accent-primary)", color: "var(--accent-text)", borderRadius: "var(--r-md)", padding: 14, textAlign: "center", marginTop: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", opacity: 0.85, fontFamily: "var(--mono)" }}>TOTAL / USER / MONTH</div>
        <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "var(--display)", letterSpacing: "-0.02em" }}>${total.toFixed(2)}</div>
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
    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-light)", borderRadius: "var(--r-lg)", padding: 20 }}>
      <h4 style={{ fontSize: 12, fontWeight: 600, color: "var(--label-color)", fontFamily: "var(--mono)", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 16px" }}>
        Temperature visualizer
      </h4>
      <label style={{ display: "block", cursor: "pointer" }}>
        <span style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--label-color)", marginBottom: 8, fontFamily: "var(--mono)" }}>
          <span>Temperature</span><span style={{ color: temp < 0.3 ? "var(--success)" : temp < 0.8 ? "var(--warning)" : "var(--danger)", fontWeight: 600 }}>{temp.toFixed(1)}</span>
        </span>
        <input type="range" min={0} max={2} step={0.1} value={temp} onChange={e => setTemp(+e.target.value)}
          style={{ width: "100%", accentColor: "var(--text-secondary)", height: 4, display: "block" }} />
      </label>
      <div style={{ display: "flex", gap: 4, marginTop: 10, fontSize: 11, justifyContent: "space-between", fontFamily: "var(--mono)", color: "var(--text-light)" }}>
        <span>Deterministic</span><span>Balanced</span><span>Creative</span><span>Chaotic</span>
      </div>
      <div style={{ marginTop: 18 }}>
        <div style={{ fontSize: 11, color: "var(--label-color)", fontFamily: "var(--mono)", marginBottom: 10, fontWeight: 600 }}>DISTRIBUTION</div>
        {available.map((word, i) => (
          <div key={word} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ width: 100, fontSize: 12, color: i === 0 ? "var(--success)" : i < 3 ? "var(--text-primary)" : "var(--text-light)", fontFamily: "var(--mono)", textAlign: "right" }}>{word}</span>
            <div style={{ flex: 1, height: 16, background: "var(--bg-tertiary)", borderRadius: "var(--r-sm)", overflow: "hidden" }}>
              <div style={{
                width: `${normalized[i] * 100}%`, height: "100%", borderRadius: "var(--r-sm)",
                background: i === 0 ? "var(--success)" : "var(--accent-primary)",
                opacity: i === 0 ? 1 : Math.max(0.25, 1 - i * 0.12),
                transition: "width 0.4s var(--ease)"
              }} />
            </div>
            <span style={{ width: 40, fontSize: 10, color: "var(--text-light)", fontFamily: "var(--mono)" }}>{(normalized[i] * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14, padding: 12, background: "var(--bg-primary)", border: "1px solid var(--border-light)", borderRadius: "var(--r-md)", fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
        {temp < 0.3 ? "Deterministic. Always picks the top token. Best for: data extraction, classification, factual Q&A."
         : temp < 0.8 ? "Balanced. Mostly picks likely tokens, with some variety. Best for: customer support, summarization."
         : temp < 1.2 ? "Creative. Explores many options. Best for: brainstorming, marketing copy, creative writing."
         : "Chaotic. Even unlikely tokens get selected. Rarely useful in production."}
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
  const scoreLabels = ["Missing key parts", "Getting there", "Solid foundation", "Strong prompt", "Production-ready"];
  const scoreColors = ["var(--danger)", "var(--orange)", "var(--warning)", "var(--success)", "var(--info)"];

  return (
    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-light)", borderRadius: "var(--r-lg)", padding: 20 }}>
      <h4 style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "var(--label-color)", fontFamily: "var(--mono)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
        System prompt builder
      </h4>
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
            {value.length > 15 && <span style={{ fontSize: 11, color: "var(--success)", fontFamily: "var(--mono)" }}>✓</span>}
          </div>
          <textarea value={value} onChange={e => set(e.target.value)} placeholder={placeholder}
            onFocus={e => { e.currentTarget.style.borderColor = "var(--accent-primary)"; }}
            onBlur={e => { e.currentTarget.style.borderColor = "var(--border-light)"; }}
            style={{ width: "100%", boxSizing: "border-box", background: "var(--bg-primary)", border: "1px solid var(--border-light)", borderRadius: "var(--r-md)", padding: "10px 12px", color: "var(--text-primary)", fontSize: 13, fontFamily: "var(--body)", resize: "vertical", minHeight: 48, outline: "none", transition: "border-color var(--dur) var(--ease)" }} />
          <div style={{ fontSize: 11, color: "var(--text-light)", marginTop: 4 }}>{tip}</div>
        </div>
      ))}
      {/* Tinted rather than filled: the score colours are tuned per theme, so a
          solid fill would leave white label text unreadable in one of them. */}
      <div style={{ background: tint(scoreColors[score]), borderLeft: `3px solid ${scoreColors[score]}`, borderRadius: "var(--r-md)", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, color: scoreColors[score], transition: "background var(--dur) var(--ease), border-color var(--dur) var(--ease)" }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{scoreLabels[score]}</span>
        <span style={{ fontSize: 12, fontFamily: "var(--mono)", flexShrink: 0 }}>{score}/4</span>
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
  const simColor = sim > 0.95 ? "var(--success)" : sim > 0.8 ? "var(--warning)" : "var(--danger)";

  return (
    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-light)", borderRadius: "var(--r-lg)", padding: 20 }}>
      <h4 style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "var(--label-color)", fontFamily: "var(--mono)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>
        Embedding similarity
      </h4>
      <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--mono)", marginBottom: 10, fontWeight: 600 }}>PHRASE A</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {phrases.map((p, i) => (
          <button key={p} onClick={() => setP1(i)} style={{
            padding: "6px 12px", borderRadius: "var(--r-sm)", border: p1 === i ? "1.5px solid var(--text-primary)" : "1px solid var(--border-light)",
            background: p1 === i ? "var(--text-primary)" : "var(--bg-primary)", color: p1 === i ? "var(--bg-primary)" : "var(--text-muted)",
            fontSize: 12, cursor: "pointer", fontFamily: "var(--body)"
          }}>{p}</button>
        ))}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--mono)", marginBottom: 10, fontWeight: 600 }}>PHRASE B</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {phrases.map((p, i) => (
          <button key={p} onClick={() => setP2(i)} style={{
            padding: "6px 12px", borderRadius: "var(--r-sm)", border: p2 === i ? "1.5px solid var(--text-primary)" : "1px solid var(--border-light)",
            background: p2 === i ? "var(--text-primary)" : "var(--bg-primary)", color: p2 === i ? "var(--bg-primary)" : "var(--text-muted)",
            fontSize: 12, cursor: "pointer", fontFamily: "var(--body)"
          }}>{p}</button>
        ))}
      </div>
      <div style={{ background: "var(--bg-primary)", border: "1px solid var(--border-light)", borderRadius: "var(--r-md)", padding: 16, textAlign: "center" }}>
        <div style={{ fontSize: 11, color: "var(--text-light)", fontFamily: "var(--mono)", marginBottom: 6, fontWeight: 600, letterSpacing: "0.08em" }}>COSINE SIMILARITY</div>
        <div style={{ fontSize: 40, fontWeight: 700, color: simColor, fontFamily: "var(--display)", letterSpacing: "-0.02em", transition: "color var(--dur) var(--ease)" }}>{sim.toFixed(4)}</div>
        <div style={{ height: 6, background: "var(--border-light)", borderRadius: "var(--r-full)", marginTop: 10, overflow: "hidden" }}>
          <div style={{ width: `${sim * 100}%`, height: "100%", background: simColor, borderRadius: "var(--r-full)", transition: "width 0.4s var(--ease), background 0.4s var(--ease)" }} />
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 10 }}>
          {sim > 0.95 ? "Nearly identical" : sim > 0.8 ? "Semantically related" : "Different topics"}
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
    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-light)", borderRadius: "var(--r-lg)", padding: 20 }}>
      <h4 style={{ fontSize: 12, fontWeight: 600, color: "var(--label-color)", fontFamily: "var(--mono)", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 16px" }}>
        RAG pipeline
      </h4>
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {steps.map((st, i) => (
          <button key={i} onClick={() => setStep(i)}
            aria-label={`Step ${i + 1}: ${st.title}`} aria-current={i === step ? "step" : undefined}
            style={{
              flex: 1, height: 5, borderRadius: "var(--r-full)", border: "none", cursor: "pointer", padding: 0,
              background: i <= step ? "var(--text-primary)" : "var(--border-color)", transition: "background var(--dur) var(--ease)"
            }} />
        ))}
      </div>
      <div style={{ background: "var(--bg-primary)", border: "1px solid var(--border-light)", borderRadius: "var(--r-md)", padding: 16, minHeight: 130 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--display)", marginBottom: 6, letterSpacing: "-0.01em" }}>{steps[step].title}</div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12, lineHeight: 1.6 }}>{steps[step].desc}</div>
        <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, padding: "10px 12px", background: "var(--bg-tertiary)", border: "1px solid var(--border-light)", borderRadius: "var(--r-sm)", fontFamily: "var(--mono)" }}>{steps[step].detail}</div>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
          style={stepNavStyle(step === 0)}>← Back</button>
        <button onClick={() => setStep(Math.min(steps.length - 1, step + 1))} disabled={step === steps.length - 1}
          style={stepNavStyle(step === steps.length - 1)}>Next →</button>
      </div>
    </div>
  );
}

function ApiCostCompare() {
  const [queries, setQueries] = useState(1000);
  const [inputTok, setInputTok] = useState(800);
  const [outputTok, setOutputTok] = useState(400);
  const models = [
    { name: "GPT-4o", inCost: 2.50, outCost: 10.00, color: "#10A37F" },
    { name: "GPT-4o-mini", inCost: 0.15, outCost: 0.60, color: "#74AA9C" },
    { name: "Claude Sonnet", inCost: 3.00, outCost: 15.00, color: "#D97706" },
    { name: "Claude Haiku", inCost: 0.25, outCost: 1.25, color: "#F59E0B" },
    { name: "Gemini Pro", inCost: 1.25, outCost: 5.00, color: "#4285F4" },
    { name: "Gemini Flash", inCost: 0.075, outCost: 0.30, color: "#34A853" },
  ];
  const costs = models.map(m => ({
    ...m,
    total: ((queries * inputTok / 1e6) * m.inCost) + ((queries * outputTok / 1e6) * m.outCost)
  })).sort((a, b) => a.total - b.total);
  const maxCost = costs[costs.length - 1].total || 1;

  return (
    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--r-lg)", padding: 20 }}>
      <h4 style={{ fontSize: 12, fontWeight: 600, color: "var(--label-color)", fontFamily: "var(--mono)", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 14px" }}>
        API cost comparison
      </h4>
      <Slider label="Queries / day" value={queries} onChange={setQueries} min={100} max={50000} step={100} accent="var(--success)" />
      <Slider label="Avg input tokens" value={inputTok} onChange={setInputTok} min={100} max={4000} step={50} accent="var(--success)" />
      <Slider label="Avg output tokens" value={outputTok} onChange={setOutputTok} min={50} max={2000} step={50} accent="var(--success)" />
      <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: 14, marginTop: 6 }}>
        {costs.map((m) => (
          <div key={m.name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ width: 100, fontSize: 12, fontFamily: "var(--mono)", color: "var(--text-primary)", textAlign: "right" }}>{m.name}</span>
            <div style={{ flex: 1, height: 18, background: "var(--bg-tertiary)", borderRadius: "var(--r-xs)", overflow: "hidden" }}>
              <div style={{ width: `${(m.total / maxCost) * 100}%`, height: "100%", background: m.color, borderRadius: "var(--r-xs)", transition: "width 0.4s var(--ease)" }} />
            </div>
            <span style={{ width: 70, fontSize: 12, fontFamily: "var(--mono)", color: m === costs[0] ? "var(--success)" : "var(--text-muted)", fontWeight: m === costs[0] ? 700 : 400, textAlign: "right" }}>${m.total.toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-light)", marginTop: 10, fontFamily: "var(--mono)", textAlign: "center" }}>
        Daily cost at current volume. Cheapest model highlighted.
      </div>
    </div>
  );
}

function FunctionCallFlow() {
  const [step, setStep] = useState(0);
  const steps = [
    { actor: "USER", msg: "What's the weather in Tokyo?", color: "var(--info)" },
    { actor: "YOUR APP", msg: "Sends message to LLM with tool definitions:\n→ get_weather(city: string)\n→ search_web(query: string)", color: "var(--violet)" },
    { actor: "LLM", msg: "Returns tool_use block:\n{\n  \"name\": \"get_weather\",\n  \"input\": { \"city\": \"Tokyo\" }\n}\nLLM does NOT execute anything.", color: "var(--orange)" },
    { actor: "YOUR APP", msg: "YOUR code calls the weather API:\nfetch('api.weather.com/tokyo')\n→ { temp: 22, condition: 'Sunny' }", color: "var(--violet)" },
    { actor: "YOUR APP", msg: "Sends tool_result back to LLM:\n{ temp: 22, condition: 'Sunny' }", color: "var(--violet)" },
    { actor: "LLM", msg: "Generates natural response:\n\"It's 22°C and sunny in Tokyo right now.\"", color: "var(--orange)" },
    { actor: "USER", msg: "Sees: \"It's 22°C and sunny in Tokyo right now.\"", color: "var(--info)" },
  ];
  const s = steps[step];

  return (
    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-light)", borderRadius: "var(--r-lg)", padding: 20 }}>
      <h4 style={{ fontSize: 12, fontWeight: 600, color: "var(--label-color)", fontFamily: "var(--mono)", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 16px" }}>
        Function call flow
      </h4>
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {steps.map((st, i) => (
          <button key={i} onClick={() => setStep(i)} aria-label={`Step ${i + 1}: ${st.actor}`}
            aria-current={i === step ? "step" : undefined} style={{
              flex: 1, height: 5, borderRadius: "var(--r-full)", border: "none", cursor: "pointer", padding: 0,
              background: i <= step ? s.color : "var(--border-color)", transition: "background var(--dur) var(--ease)"
            }} />
        ))}
      </div>
      <div style={{ background: "var(--bg-primary)", border: `1.5px solid ${tint(s.color)}`, borderRadius: "var(--r-md)", padding: 16, minHeight: 110, transition: "border-color var(--dur) var(--ease)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: "var(--r-full)", background: s.color, flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: s.color, fontFamily: "var(--mono)", letterSpacing: "0.04em" }}>{s.actor}</span>
          <span style={{ fontSize: 11, color: "var(--text-light)", fontFamily: "var(--mono)", marginLeft: "auto" }}>Step {step + 1}/{steps.length}</span>
        </div>
        <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, whiteSpace: "pre-wrap", fontFamily: "var(--mono)", background: "var(--bg-tertiary)", padding: 12, borderRadius: "var(--r-sm)" }}>{s.msg}</div>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
          style={stepNavStyle(step === 0)}>← Back</button>
        <button onClick={() => setStep(Math.min(steps.length - 1, step + 1))} disabled={step === steps.length - 1}
          style={stepNavStyle(step === steps.length - 1)}>Next →</button>
      </div>
    </div>
  );
}

function AgentReliabilityCalc() {
  const [stepSuccess, setStepSuccess] = useState(95);
  const [numSteps, setNumSteps] = useState(5);
  const overall = Math.pow(stepSuccess / 100, numSteps) * 100;
  const overallColor = overall > 80 ? "var(--success)" : overall > 60 ? "var(--warning)" : "var(--danger)";
  const scenarios = [2, 3, 5, 8, 10, 15, 20].map(n => ({
    steps: n,
    rate: Math.pow(stepSuccess / 100, n) * 100
  }));

  return (
    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-light)", borderRadius: "var(--r-lg)", padding: 20 }}>
      <h4 style={{ fontSize: 12, fontWeight: 600, color: "var(--label-color)", fontFamily: "var(--mono)", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 14px" }}>
        Agent reliability calculator
      </h4>
      <Slider label="Per-step success rate" value={stepSuccess} onChange={setStepSuccess} min={80} max={99} step={1} unit="%" accent={overallColor} />
      <Slider label="Number of steps" value={numSteps} onChange={setNumSteps} min={1} max={20} step={1} accent={overallColor} />
      {/* Tinted, not filled: --success/--warning/--danger resolve to light values
          in dark mode, so white-on-fill would be unreadable in one theme. */}
      <div style={{ background: tint(overallColor), borderLeft: `3px solid ${overallColor}`, borderRadius: "var(--r-md)", padding: 14, textAlign: "center", marginBottom: 14, color: overallColor, transition: "background var(--dur) var(--ease), border-color var(--dur) var(--ease)" }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", fontFamily: "var(--mono)" }}>OVERALL SUCCESS RATE</div>
        <div style={{ fontSize: 36, fontWeight: 800, fontFamily: "var(--display)", letterSpacing: "-0.02em" }}>{overall.toFixed(1)}%</div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--mono)" }}>{stepSuccess}%^{numSteps} = {overall.toFixed(1)}%</div>
      </div>
      <div style={{ fontSize: 11, color: "var(--label-color)", fontFamily: "var(--mono)", marginBottom: 8, fontWeight: 600, letterSpacing: "0.06em" }}>AT {stepSuccess}% PER STEP:</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {scenarios.map(s => {
          const c = s.rate > 80 ? "var(--success)" : s.rate > 60 ? "var(--warning)" : "var(--danger)";
          const active = s.steps === numSteps;
          return (
            <div key={s.steps} style={{
              background: active ? tint(c) : "var(--bg-tertiary)", border: `1px solid ${active ? c : "var(--border-light)"}`,
              borderRadius: "var(--r-sm)", padding: "6px 10px", textAlign: "center", minWidth: 52,
              transition: "background var(--dur) var(--ease), border-color var(--dur) var(--ease)"
            }}>
              <div style={{ fontSize: 10, color: active ? c : "var(--text-light)", fontFamily: "var(--mono)" }}>{s.steps} steps</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: c, fontFamily: "var(--mono)" }}>{s.rate.toFixed(0)}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EvalScorer() {
  const [scores, setScores] = useState({ relevance: 3, groundedness: 3, helpfulness: 3, safety: 5 });
  const criteria = [
    { key: "relevance", label: "RELEVANCE", desc: "Does it answer the actual question?", max: 5 },
    { key: "groundedness", label: "GROUNDEDNESS", desc: "Is it grounded in provided context?", max: 5 },
    { key: "helpfulness", label: "HELPFULNESS", desc: "Would a user find this useful?", max: 5 },
    { key: "safety", label: "SAFETY", desc: "Free of harmful/biased content?", max: 5 },
  ];
  const avg = Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length;
  const avgColor = avg >= 4 ? "var(--success)" : avg >= 3 ? "var(--warning)" : "var(--danger)";
  const verdict = avg >= 4.5 ? "Ship it" : avg >= 3.5 ? "Needs iteration" : avg >= 2.5 ? "Significant gaps" : "Back to the drawing board";

  return (
    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-light)", borderRadius: "var(--r-lg)", padding: 20 }}>
      <h4 style={{ fontSize: 12, fontWeight: 600, color: "var(--label-color)", fontFamily: "var(--mono)", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 6px" }}>
        Eval rubric scorer
      </h4>
      <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 16px" }}>Score an LLM output like an LLM-as-Judge would</p>
      {criteria.map(c => (
        <div key={c.key} style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", fontFamily: "var(--mono)", letterSpacing: "0.06em" }}>{c.label}</span>
            <span style={{ fontSize: 11, color: "var(--text-light)", textAlign: "right" }}>{c.desc}</span>
          </div>
          <div role="group" aria-label={`${c.label} score`} style={{ display: "flex", gap: 6 }}>
            {[1, 2, 3, 4, 5].map(v => {
              const filled = scores[c.key] >= v;
              const c2 = v >= 4 ? "var(--success)" : v >= 3 ? "var(--warning)" : "var(--danger)";
              return (
                <button key={v} onClick={() => setScores(s => ({ ...s, [c.key]: v }))}
                  aria-label={`${c.label}: ${v} of 5`} aria-pressed={scores[c.key] === v}
                  style={{
                    flex: 1, height: 32, borderRadius: "var(--r-sm)", cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "var(--mono)",
                    border: `1px solid ${filled ? c2 : "var(--border-light)"}`,
                    background: filled ? tint(c2) : "var(--bg-tertiary)",
                    color: filled ? c2 : "var(--text-light)",
                    transition: "background var(--dur) var(--ease), border-color var(--dur) var(--ease), color var(--dur) var(--ease)"
                  }}>{v}</button>
              );
            })}
          </div>
        </div>
      ))}
      {/* Tinted, not filled: see AgentReliabilityCalc. */}
      <div style={{ background: tint(avgColor), borderLeft: `3px solid ${avgColor}`, borderRadius: "var(--r-md)", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, color: avgColor, transition: "background var(--dur) var(--ease), border-color var(--dur) var(--ease)" }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", fontFamily: "var(--mono)" }}>VERDICT</div>
          <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "var(--display)" }}>{verdict}</div>
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "var(--display)", letterSpacing: "-0.02em" }}>{avg.toFixed(1)}/5</div>
      </div>
    </div>
  );
}

function FineTuningDecisionTree() {
  const [answers, setAnswers] = useState({});
  const questions = [
    { id: "prompts", q: "Have you tried 10+ prompt iterations with measured quality?", yes: "rag", no: "stop-prompts" },
    { id: "rag", q: "Have you tried RAG and measured quality vs your target?", yes: "gap", no: "stop-rag" },
    { id: "gap", q: "Is the remaining gap specific and measurable? (e.g., brand voice, not 'smarter')", yes: "data", no: "stop-gap" },
    { id: "data", q: "Do you have 200+ quality training examples?", yes: "maintain", no: "stop-data" },
    { id: "maintain", q: "Can you commit to quarterly maintenance (re-training on base model updates)?", yes: "go", no: "stop-maintain" },
  ];
  const stops = {
    "stop-prompts": { msg: "Go back and iterate on prompts. Document each attempt with quality metrics before considering fine-tuning.", color: "var(--info)" },
    "stop-rag": { msg: "Try RAG first. It's cheaper, faster to set up, and easier to maintain than fine-tuning.", color: "var(--info)" },
    "stop-gap": { msg: "Fine-tuning can't fix vague problems. Define a specific, measurable quality gap before investing.", color: "var(--warning)" },
    "stop-data": { msg: "You need quality training data. Invest in labeling 200+ examples first.", color: "var(--warning)" },
    "stop-maintain": { msg: "Fine-tuning requires ongoing investment. Budget for maintenance or the model will degrade.", color: "var(--warning)" },
    "go": { msg: "Fine-tuning is justified. Start with LoRA (10,000x fewer params) on a small model. Measure quality delta vs base.", color: "var(--success)" },
  };
  const currentQ = questions.find(q => !answers[q.id] && (q.id === "prompts" || answers[questions[questions.indexOf(q) - 1]?.id] === "yes"));
  const stoppedAt = Object.entries(answers).find(([, v]) => v === "no");
  const result = stoppedAt
    ? stops[questions.find(q => q.id === stoppedAt[0]).no]
    : answers.maintain === "yes" ? stops.go : null;

  const reset = () => setAnswers({});

  return (
    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-light)", borderRadius: "var(--r-lg)", padding: 20 }}>
      <h4 style={{ fontSize: 12, fontWeight: 600, color: "var(--label-color)", fontFamily: "var(--mono)", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 16px" }}>
        Should you fine-tune?
      </h4>
      {questions.map((q, i) => {
        const answered = answers[q.id];
        const visible = i === 0 || answers[questions[i - 1]?.id] === "yes";
        if (!visible) return null;
        return (
          <div key={q.id} style={{ marginBottom: 12, opacity: answered && !result ? 0.55 : 1, transition: "opacity var(--dur) var(--ease)" }}>
            <div id={`ft-${q.id}`} style={{ fontSize: 13, color: "var(--text-primary)", marginBottom: 8, lineHeight: 1.5 }}>{q.q}</div>
            <div role="group" aria-labelledby={`ft-${q.id}`} style={{ display: "flex", gap: 8 }}>
              {["yes", "no"].map(v => {
                const c = v === "yes" ? "var(--success)" : "var(--danger)";
                const on = answered === v;
                return (
                  <button key={v} onClick={() => setAnswers(a => ({ ...a, [q.id]: v }))} aria-pressed={on}
                    style={{
                      padding: "8px 20px", borderRadius: "var(--r-sm)",
                      border: `1px solid ${on ? c : "var(--border-light)"}`,
                      background: on ? tint(c) : "var(--bg-primary)",
                      color: on ? c : "var(--text-muted)", fontSize: 12, fontFamily: "var(--mono)", cursor: "pointer", fontWeight: on ? 700 : 400,
                      transition: "background var(--dur) var(--ease), border-color var(--dur) var(--ease), color var(--dur) var(--ease)"
                    }}>{v === "yes" ? "Yes" : "No"}</button>
                );
              })}
            </div>
          </div>
        );
      })}
      {/* Tinted, not filled: see AgentReliabilityCalc. */}
      {result && (
        <div role="status" style={{ background: tint(result.color), borderLeft: `3px solid ${result.color}`, borderRadius: "var(--r-md)", padding: 14, marginTop: 8 }}>
          <div style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text-primary)" }}>{result.msg}</div>
          <button onClick={reset} style={{ marginTop: 10, padding: "6px 14px", borderRadius: "var(--r-sm)", border: `1px solid ${result.color}`, background: "transparent", color: result.color, fontSize: 12, cursor: "pointer", fontFamily: "var(--mono)" }}>Reset</button>
        </div>
      )}
    </div>
  );
}

function UnitEconomicsCalc() {
  const [mau, setMau] = useState(10000);
  const [queriesPerUser, setQueriesPerUser] = useState(20);
  const [avgTokens, setAvgTokens] = useState(1200);
  const [costPerMTok, setCostPerMTok] = useState(3);
  const [pricePerUser, setPricePerUser] = useState(29);
  const totalTokens = mau * queriesPerUser * avgTokens;
  const aiCost = (totalTokens / 1e6) * costPerMTok;
  const revenue = mau * pricePerUser;
  const cogsPercent = revenue > 0 ? (aiCost / revenue) * 100 : 0;
  const cogsColor = cogsPercent <= 20 ? "var(--success)" : cogsPercent <= 40 ? "var(--warning)" : "var(--danger)";
  const margin = revenue - aiCost;
  const marginColor = margin >= 0 ? "var(--success)" : "var(--danger)";

  return (
    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--r-lg)", padding: 20 }}>
      <h4 style={{ fontSize: 12, fontWeight: 600, color: "var(--label-color)", fontFamily: "var(--mono)", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 14px" }}>
        AI unit economics
      </h4>
      <Slider label="Monthly active users" value={mau} onChange={setMau} min={100} max={1000000} step={100} accent="var(--violet)" />
      <Slider label="AI queries / user / month" value={queriesPerUser} onChange={setQueriesPerUser} min={1} max={200} step={1} accent="var(--violet)" />
      <Slider label="Avg tokens / query (in+out)" value={avgTokens} onChange={setAvgTokens} min={200} max={8000} step={100} accent="var(--violet)" />
      <Slider label="Cost per 1M tokens ($)" value={costPerMTok} onChange={setCostPerMTok} min={0.1} max={30} step={0.1} accent="var(--violet)" />
      <Slider label="Price / user / month ($)" value={pricePerUser} onChange={setPricePerUser} min={0} max={200} step={1} accent="var(--violet)" />
      <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: 14, marginTop: 6, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <div style={{ background: "var(--bg-tertiary)", borderRadius: "var(--r-md)", padding: 12, textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "var(--label-color)", fontFamily: "var(--mono)", letterSpacing: "0.06em" }}>AI COGS/mo</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "var(--danger)" }}>${aiCost >= 1000 ? (aiCost / 1000).toFixed(1) + "K" : aiCost.toFixed(0)}</div>
        </div>
        <div style={{ background: "var(--bg-tertiary)", borderRadius: "var(--r-md)", padding: 12, textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "var(--label-color)", fontFamily: "var(--mono)", letterSpacing: "0.06em" }}>REVENUE/mo</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "var(--success)" }}>${revenue >= 1000 ? (revenue / 1000).toFixed(0) + "K" : revenue.toFixed(0)}</div>
        </div>
        <div style={{ background: "var(--bg-tertiary)", borderRadius: "var(--r-md)", padding: 12, textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "var(--label-color)", fontFamily: "var(--mono)", letterSpacing: "0.06em" }}>AI COGS %</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: cogsColor, transition: "color var(--dur) var(--ease)" }}>{cogsPercent.toFixed(1)}%</div>
        </div>
      </div>
      {/* Tinted, not filled: --success/--danger resolve to light values in dark
          mode, so white-on-fill would be unreadable in one of the two themes. */}
      <div style={{ background: tint(marginColor), borderLeft: `3px solid ${marginColor}`, borderRadius: "var(--r-md)", padding: 12, textAlign: "center", marginTop: 10, color: marginColor, transition: "background var(--dur) var(--ease), border-color var(--dur) var(--ease)" }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", fontFamily: "var(--mono)" }}>GROSS MARGIN (AI ONLY)</div>
        <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "var(--display)", letterSpacing: "-0.02em" }}>${margin >= 1000 ? (margin / 1000).toFixed(1) + "K" : margin.toFixed(0)}/mo</div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--mono)", marginTop: 2 }}>Traditional SaaS: ~20% COGS · AI SaaS: 40-70% COGS</div>
      </div>
    </div>
  );
}

// ─── WEEK 5 INTERACTIVES ─────────────────────────────────────────────────────

function ModelRouter({ color }) {
  const [queriesPerDay, setQueriesPerDay] = useState(10000);
  const [complexPct, setComplexPct] = useState(20);
  const models = {
    large: { name: "GPT-4o / Claude Sonnet", costPer1M: 7.50, label: "Large" },
    small: { name: "GPT-4o-mini / Haiku", costPer1M: 0.40, label: "Small" },
  };
  const avgTokensPerQuery = 800;
  const tokensPerDay = queriesPerDay * avgTokensPerQuery;
  const allLargeCost = (tokensPerDay / 1_000_000) * models.large.costPer1M * 30;
  const complexQueries = tokensPerDay * (complexPct / 100);
  const simpleQueries = tokensPerDay * (1 - complexPct / 100);
  const routedCost = ((complexQueries / 1_000_000) * models.large.costPer1M + (simpleQueries / 1_000_000) * models.small.costPer1M) * 30;
  const savings = allLargeCost - routedCost;
  const savingsPct = allLargeCost > 0 ? Math.round((savings / allLargeCost) * 100) : 0;

  const barMax = Math.max(allLargeCost, 1);
  return (
    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-light)", borderRadius: "var(--r-lg)", padding: 20 }}>
      <h4 style={{ fontSize: 12, fontWeight: 600, color: "var(--label-color)", fontFamily: "var(--mono)", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 14px" }}>
        Multi-model routing savings
      </h4>

      <Slider label="Queries / day" value={queriesPerDay} onChange={setQueriesPerDay} min={1000} max={100000} step={1000} accent={color} />
      <Slider label="Complex queries (→ large model)" value={complexPct} onChange={setComplexPct} min={5} max={50} step={5} unit="%" accent={color} />

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
        {[
          { label: "All large model", cost: allLargeCost, bg: "var(--danger)" },
          { label: `Routed (${complexPct}% large / ${100 - complexPct}% small)`, cost: routedCost, bg: "var(--success)" },
        ].map((row) => (
          <div key={row.label}>
            <div style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--text-muted)", marginBottom: 4 }}>{row.label}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ height: 22, borderRadius: "var(--r-sm)", background: row.bg, width: `${Math.max((row.cost / barMax) * 100, 4)}%`, transition: "width 0.4s var(--ease)" }} />
              <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--mono)", color: "var(--text-primary)", whiteSpace: "nowrap" }}>${row.cost >= 1000 ? (row.cost / 1000).toFixed(1) + "K" : row.cost.toFixed(0)}/mo</span>
            </div>
          </div>
        ))}
      </div>

      {(() => {
        const c = savingsPct >= 50 ? "var(--success)" : "var(--orange)";
        return (
          <div style={{ marginTop: 16, padding: 14, borderRadius: "var(--r-md)", background: tint(c), borderLeft: `3px solid ${c}`, textAlign: "center", transition: "background var(--dur) var(--ease), border-color var(--dur) var(--ease)" }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", color: c, fontFamily: "var(--mono)" }}>MONTHLY SAVINGS</div>
            <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "var(--display)", letterSpacing: "-0.02em", color: c }}>{savingsPct}%</div>
            <div style={{ fontSize: 13, fontFamily: "var(--mono)", color: "var(--text-muted)" }}>${savings >= 1000 ? (savings / 1000).toFixed(1) + "K" : savings.toFixed(0)}/mo saved</div>
          </div>
        );
      })()}
    </div>
  );
}

function ActionRiskTaxonomy({ color }) {
  const actions = [
    { label: "Check order status", answer: "read", hint: "Read-only lookup" },
    { label: "Update shipping address", answer: "update", hint: "Modifies existing data" },
    { label: "Cancel subscription", answer: "delete", hint: "Irreversible action" },
    { label: "View FAQ article", answer: "read", hint: "Read-only content" },
    { label: "Issue a $50 refund", answer: "create", hint: "Creates a financial transaction" },
    { label: "Delete user account", answer: "delete", hint: "Irreversible data loss" },
    { label: "Create support ticket", answer: "create", hint: "Creates a new record" },
    { label: "Change plan tier", answer: "update", hint: "Modifies subscription" },
  ];
  // Surfaces derive from `color` via tint(), so there is no second palette to
  // keep in sync per theme.
  const riskLevels = {
    read: { label: "Read → No friction", color: "var(--success)", confirm: "No confirmation needed" },
    create: { label: "Create → Confirm", color: "var(--info)", confirm: "Single confirmation" },
    update: { label: "Update → Confirm + Undo", color: "var(--orange)", confirm: "Confirm + undo window" },
    delete: { label: "Delete → Double Confirm", color: "var(--danger)", confirm: "Double confirmation required" },
  };
  const [answers, setAnswers] = useState({});
  const classify = (idx, level) => setAnswers((prev) => ({ ...prev, [idx]: level }));
  const correct = Object.entries(answers).filter(([idx, val]) => val === actions[idx].answer).length;
  const attempted = Object.keys(answers).length;

  return (
    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-light)", borderRadius: "var(--r-lg)", padding: 20 }}>
      <h4 style={{ fontSize: 12, fontWeight: 600, color: "var(--label-color)", fontFamily: "var(--mono)", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 6px" }}>
        Action risk taxonomy
      </h4>
      <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 16px" }}>Classify each action by its risk level and required confirmation</p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
        {Object.entries(riskLevels).map(([key, lvl]) => (
          <span key={key} style={{ fontSize: 10, fontFamily: "var(--mono)", padding: "3px 8px", borderRadius: "var(--r-sm)", background: tint(lvl.color), border: `1px solid ${lvl.color}`, color: lvl.color, fontWeight: 700 }}>{lvl.label}</span>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {actions.map((action, idx) => {
          const answered = answers[idx];
          const isCorrect = answered === action.answer;
          const rowColor = isCorrect ? "var(--success)" : "var(--danger)";
          return (
            <div key={idx} style={{
              padding: 10, borderRadius: "var(--r-md)",
              border: "1px solid var(--border-light)",
              borderLeft: answered ? `3px solid ${rowColor}` : "1px solid var(--border-light)",
              background: answered ? tint(rowColor) : "transparent",
              transition: "background var(--dur) var(--ease), border-color var(--dur) var(--ease)"
            }}>
              <div id={`risk-${idx}`} style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>{action.label}</div>
              <div role="group" aria-labelledby={`risk-${idx}`} style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {Object.entries(riskLevels).map(([key, lvl]) => {
                  const on = answered === key;
                  return (
                    <button key={key} onClick={() => classify(idx, key)} aria-pressed={on}
                      style={{
                        fontSize: 10, fontFamily: "var(--mono)", padding: "3px 8px", borderRadius: "var(--r-sm)",
                        // Border stays 1px in both states so selecting doesn't nudge the row.
                        border: `1px solid ${on ? lvl.color : "var(--border-light)"}`,
                        background: on ? tint(lvl.color) : "transparent",
                        color: on ? lvl.color : "var(--text-muted)",
                        fontWeight: on ? 700 : 400, cursor: "pointer",
                        transition: "background var(--dur) var(--ease), border-color var(--dur) var(--ease), color var(--dur) var(--ease)"
                      }}>
                      {key}
                    </button>
                  );
                })}
              </div>
              {answered && !isCorrect && <div style={{ fontSize: 11, marginTop: 4, fontFamily: "var(--mono)", color: "var(--danger)" }}>→ {riskLevels[action.answer].label} · {action.hint}</div>}
            </div>
          );
        })}
      </div>

      {attempted === actions.length && (() => {
        const c = correct === actions.length ? "var(--success)" : "var(--orange)";
        return (
          <div role="status" style={{ marginTop: 16, padding: 14, borderRadius: "var(--r-md)", background: tint(c), borderLeft: `3px solid ${c}`, textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--display)", letterSpacing: "-0.02em", color: c }}>{correct}/{actions.length} correct</div>
            <div style={{ fontSize: 12, fontFamily: "var(--mono)", color: "var(--text-muted)" }}>{correct === actions.length ? "Every action classified correctly." : "Review the corrections above. Risk classification protects users and the business."}</div>
            <button onClick={() => setAnswers({})} style={{ marginTop: 8, fontSize: 11, fontFamily: "var(--mono)", padding: "4px 12px", borderRadius: "var(--r-sm)", border: `1px solid ${c}`, background: "transparent", color: c, cursor: "pointer" }}>Reset</button>
          </div>
        );
      })()}
    </div>
  );
}

const interactiveMap = {
  tokenCalculator: TokenCalculator,
  temperatureDemo: TemperatureDemo,
  systemPromptBuilder: SystemPromptBuilder,
  embeddingSimilarity: EmbeddingSimilarity,
  ragPipeline: RagPipeline,
  apiCostCompare: ApiCostCompare,
  functionCallFlow: FunctionCallFlow,
  agentReliabilityCalc: AgentReliabilityCalc,
  evalScorer: EvalScorer,
  fineTuningDecisionTree: FineTuningDecisionTree,
  unitEconomicsCalc: UnitEconomicsCalc,
  modelRouter: ModelRouter,
  actionRiskTaxonomy: ActionRiskTaxonomy,
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

  if (completed) {
    const pct = Math.round((score / questions.length) * 100);
    const ringColor = score === questions.length ? "var(--success)" : score > questions.length / 2 ? "var(--warning)" : "var(--danger)";
    return (
      <div role="status" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--r-lg)", padding: 24, textAlign: "center" }}>
        {/* A score dial rather than a trophy emoji: it encodes the actual result,
            and it inherits the theme instead of rendering as a colour image. */}
        <div aria-hidden="true" style={{
          width: 72, height: 72, borderRadius: "var(--r-full)", margin: "0 auto 14px",
          background: `conic-gradient(${ringColor} ${pct}%, var(--border-light) ${pct}%)`,
          display: "grid", placeItems: "center",
        }}>
          <div style={{ width: 56, height: 56, borderRadius: "var(--r-full)", background: "var(--bg-secondary)", display: "grid", placeItems: "center", fontSize: 15, fontWeight: 700, fontFamily: "var(--mono)", color: ringColor }}>
            {pct}%
          </div>
        </div>
        <div style={{ fontSize: 22, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--display)", letterSpacing: "-0.02em" }}>{score}/{questions.length} correct</div>
        <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 6, marginBottom: 16 }}>
          {score === questions.length ? "Perfect score." : score > questions.length / 2 ? "Solid understanding." : "Review the material and try again."}
        </div>
        <button onClick={reset}
          onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
          style={{ padding: "10px 28px", borderRadius: "var(--r-md)", border: "1px solid var(--border-hover)", background: "var(--text-primary)", color: "var(--bg-primary)", cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "var(--body)", transition: "opacity var(--dur) var(--ease)" }}>Retry quiz</button>
      </div>
    );
  }

  return (
    <div role="region" aria-label="Knowledge check quiz" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--r-lg)", padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", fontFamily: "var(--mono)" }}>KNOWLEDGE CHECK</span>
        <span aria-label={`Question ${current + 1} of ${questions.length}`} style={{ fontSize: 11, color: "var(--text-light)", fontFamily: "var(--mono)" }}>{current + 1}/{questions.length}</span>
      </div>
      <div id="quiz-question" style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16, fontFamily: "var(--body)" }}>{q.q}</div>
      <div role="group" aria-labelledby="quiz-question" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {q.options.map((opt, i) => {
          let bg = "var(--bg-input)", border = "var(--border-color)", c = "var(--text-secondary)";
          if (showResult && i === q.correct) { bg = tint("var(--success)"); border = "var(--success)"; c = "var(--success)"; }
          else if (showResult && i === selected && i !== q.correct) { bg = tint("var(--danger)"); border = "var(--danger)"; c = "var(--danger)"; }
          else if (selected === i) { bg = "var(--bg-tertiary)"; border = "var(--text-primary)"; c = "var(--text-primary)"; }
          return (
            <button key={i} onClick={() => handleSelect(i)} style={{
              padding: "12px 14px", borderRadius: "var(--r-md)", border: `1px solid ${border}`, background: bg,
              color: c, cursor: showResult ? "default" : "pointer", fontSize: 13, textAlign: "left",
              fontFamily: "var(--body)", transition: "background var(--dur) var(--ease), border-color var(--dur) var(--ease), color var(--dur) var(--ease)"
            }}>{opt}</button>
          );
        })}
      </div>
      {showResult && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6, padding: "12px 14px", background: "var(--bg-tertiary)", border: "1px solid var(--section-separator)", borderRadius: "var(--r-md)", marginBottom: 12 }}>
            {q.explanation}
          </div>
          <button onClick={next} style={{ width: "100%", padding: "10px 0", borderRadius: "var(--r-md)", border: "1px solid var(--border-hover)", background: "var(--text-primary)", color: "var(--bg-primary)", cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "var(--body)" }}>
            {current < questions.length - 1 ? "Next Question →" : "See Results"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── RESOURCE BADGE ──────────────────────────────────────────────────────────

const typeStyles = {
  video: { bg: tint("var(--danger)"), color: "var(--danger)", label: "Video" },
  course: { bg: tint("var(--info)"), color: "var(--info)", label: "Course" },
  tool: { bg: tint("var(--success)"), color: "var(--success)", label: "Tool" },
  docs: { bg: tint("var(--warning)"), color: "var(--warning)", label: "Docs" },
  paper: { bg: tint("var(--violet)"), color: "var(--violet)", label: "Paper" },
  article: { bg: tint("var(--orange)"), color: "var(--orange)", label: "Article" },
  code: { bg: tint("var(--success)"), color: "var(--success)", label: "Code" },
  podcast: { bg: tint("var(--pink)"), color: "var(--pink)", label: "Podcast" },
};

// ─── SECTION COMPONENT ───────────────────────────────────────────────────────

function DepthSelector({ activeDepth, onDepthChange }) {
  const depths = ["eli5", "normal", "technical", "pm"];
  const depthLabels = { eli5: "ELI5", normal: "Normal", technical: "Technical", pm: "PM Lens" };
  const depthDescriptions = { eli5: "Simple analogy", normal: "How it works", technical: "Papers & math", pm: "Product decisions" };

  return (
    <div role="radiogroup" aria-label="Depth level" style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
      {depths.map((depth) => (
        <button
          key={depth}
          role="radio"
          aria-checked={activeDepth === depth}
          aria-label={`${depthLabels[depth]}: ${depthDescriptions[depth]}`}
          onClick={() => onDepthChange(depth)}
          style={{
            padding: "6px 14px",
            borderRadius: "var(--r-sm)",
            border: activeDepth === depth ? "1.5px solid var(--text-primary)" : "1px solid var(--border-color)",
            background: activeDepth === depth ? "var(--text-primary)" : "var(--bg-secondary)",
            color: activeDepth === depth ? "var(--bg-primary)" : "var(--text-muted)",
            fontSize: 12,
            fontWeight: activeDepth === depth ? 600 : 400,
            fontFamily: "var(--mono)",
            cursor: "pointer",
            transition: "background var(--dur) var(--ease), border-color var(--dur) var(--ease), color var(--dur) var(--ease)",
            letterSpacing: "0.02em"
          }}
          onMouseEnter={e => {
            if (activeDepth !== depth) {
              e.currentTarget.style.borderColor = "var(--border-hover)";
              e.currentTarget.style.color = "var(--text-primary)";
            }
          }}
          onMouseLeave={e => {
            if (activeDepth !== depth) {
              e.currentTarget.style.borderColor = "var(--border-color)";
              e.currentTarget.style.color = "var(--text-muted)";
            }
          }}
        >
          {depthLabels[depth]}
        </button>
      ))}
    </div>
  );
}

function Section({ section, weekColor }) {
  const depths = ["eli5", "normal", "technical", "pm"];
  const depthLabels = { eli5: "ELI5", normal: "Normal", technical: "Technical", pm: "PM Lens" };
  const [activeDepth, setActiveDepth] = useState("normal");
  const [resourcesOpen, setResourcesOpen] = useState(false);

  // The sidebar TOC links to a specific depth, but depth state lives here.
  // It asks for a switch by event so the link can land on mounted content.
  useEffect(() => {
    const handleSetDepth = (e) => {
      if (e.detail?.sectionId === section.id && depths.includes(e.detail.depth)) {
        setActiveDepth(e.detail.depth);
      }
    };
    window.addEventListener("roadmap:set-depth", handleSetDepth);
    return () => window.removeEventListener("roadmap:set-depth", handleSetDepth);
  }, [section.id]);

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
    <article
      data-section-id={section.id}
      aria-labelledby={`section-title-${section.id}`}
      style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--r-lg)", marginBottom: 20, overflow: "hidden", transition: "border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease)", padding: "20px", scrollMarginTop: "160px" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-hover)"; e.currentTarget.style.boxShadow = "0 2px 10px var(--shadow-sm)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-color)"; e.currentTarget.style.boxShadow = "none"; }}>

      {/* Section Title */}
      <div style={{ marginBottom: 24 }}>
        <h3 id={`section-title-${section.id}`} style={{ color: "var(--text-primary)", fontSize: 17, fontWeight: 600, fontFamily: "var(--display)", margin: 0, lineHeight: 1.35, letterSpacing: "-0.01em" }}>{section.title}</h3>
        {section.subtitle && <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4, fontFamily: "var(--body)", maxWidth: "var(--measure)" }}>{section.subtitle}</div>}
      </div>

      {/* TL;DR */}
      {section.tldr && section.tldr.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.1em", fontFamily: "var(--mono)", marginBottom: 10, textTransform: "uppercase" }}>
            TL;DR
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {section.tldr.map((point, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 10,
                padding: "10px 14px", background: "var(--bg-secondary)",
                border: "1px solid var(--border-light)", borderRadius: "var(--r-md)"
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

      {/* Depth Selector */}
      <DepthSelector activeDepth={activeDepth} onDepthChange={setActiveDepth} />

      {/* Active Depth Content */}
      <div id={`depth-${section.id}-${activeDepth}`} style={{ marginBottom: 0, scrollMarginTop: "160px" }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.1em", fontFamily: "var(--mono)", marginBottom: 10, textTransform: "uppercase", paddingBottom: 8, borderBottom: "1px solid var(--border-light)" }}>
          {depthLabels[activeDepth]}
        </div>
        <div style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.8, fontFamily: "var(--body)", whiteSpace: "pre-line", maxWidth: "var(--measure)" }}>
          {renderText(section.depths[activeDepth])}
        </div>
      </div>

      {/* Key Insight */}
      {section.keyInsight && (
        <div style={{
          marginTop: 24, marginBottom: 4, padding: "14px 18px",
          background: "var(--bg-secondary)", borderLeft: `3px solid ${weekColor}`,
          borderRadius: "0 8px 8px 0"
        }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: weekColor, letterSpacing: "0.1em", fontFamily: "var(--mono)", marginBottom: 6, textTransform: "uppercase" }}>
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
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", fontFamily: "var(--mono)", marginBottom: 16, textTransform: "uppercase" }}>Knowledge Check</div>
          <Quiz questions={section.quiz} color={weekColor} />
        </div>
      )}

      {/* Resources (collapsible) */}
      {resourcesList.length > 0 && (
        <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--section-separator)" }}>
          <button
            onClick={() => setResourcesOpen(!resourcesOpen)}
            aria-expanded={resourcesOpen}
            style={{
              display: "flex", alignItems: "center", gap: 8, width: "100%",
              background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: resourcesOpen ? 16 : 0
            }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", fontFamily: "var(--mono)", textTransform: "uppercase" }}>Resources</span>
            <span style={{ fontSize: 11, color: "var(--text-light)", fontFamily: "var(--mono)" }}>({resourcesList.length})</span>
            <span style={{ fontSize: 10, color: "var(--text-muted)", marginLeft: "auto", transition: "transform 0.2s", transform: resourcesOpen ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
          </button>
          {resourcesOpen && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {resourcesList.map((r, i) => {
                const style = typeStyles[r.type] || typeStyles.article;
                return (
                  <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "10px 12px",
                    background: "var(--bg-secondary)", borderRadius: "var(--r-md)", textDecoration: "none",
                    border: "1px solid var(--border-color)", transition: "background var(--dur) var(--ease), border-color var(--dur) var(--ease), color var(--dur) var(--ease)"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-hover)"; e.currentTarget.style.boxShadow = "0 1px 2px var(--shadow-sm)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-color)"; e.currentTarget.style.boxShadow = "none"; }}>
                    <span style={{ fontSize: 8, padding: "2px 6px", background: style.bg, color: style.color, borderRadius: "var(--r-xs)", fontWeight: 600, fontFamily: "var(--mono)", flexShrink: 0, whiteSpace: "nowrap" }}>{style.label}</span>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)", fontFamily: "var(--body)", flex: 1, minWidth: 0 }}>{r.title}</span>
                    <span style={{ fontSize: 10, color: "var(--text-light)", flexShrink: 0 }}>↗</span>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

// ─── WEEK TABS COMPONENT ─────────────────────────────────────────────────────

function WeekTabs({ activeWeekId, onWeekChange, isMobile, onMobileClose }) {
  return (
    <div role="tablist" aria-label="Course weeks" style={{ display: "flex", gap: 8, padding: "12px 32px", borderBottom: "1px solid var(--border-light)", background: "var(--bg-primary)", overflowX: "auto", position: "sticky", top: 64, zIndex: 50, minHeight: 60 }}>
      {WEEKS.map((week) => (
        <button
          key={week.id}
          role="tab"
          aria-selected={activeWeekId === week.id}
          aria-label={`Week ${week.id}: ${week.title}`}
          onClick={() => {
            onWeekChange(week.id);
            if (isMobile) onMobileClose();
          }}
          style={{
            padding: "8px 16px",
            borderRadius: "var(--r-sm)",
            border: activeWeekId === week.id ? "1.5px solid var(--text-primary)" : "1px solid var(--border-color)",
            background: activeWeekId === week.id ? "var(--text-primary)" : "var(--bg-primary)",
            color: activeWeekId === week.id ? "var(--bg-primary)" : "var(--text-primary)",
            fontSize: 13,
            fontWeight: 500,
            fontFamily: "var(--body)",
            cursor: "pointer",
            transition: "background var(--dur) var(--ease), border-color var(--dur) var(--ease), color var(--dur) var(--ease)",
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
          {isMobile ? `W${week.id}` : `Week ${week.id}: ${week.tag.charAt(0) + week.tag.slice(1).toLowerCase()}`}
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

  // Each Section owns its own depth state, so ask it to switch, then scroll
  // one frame later, after the newly selected depth block has mounted.
  const scrollToDepth = (sectionId, depth) => {
    window.dispatchEvent(new CustomEvent("roadmap:set-depth", { detail: { sectionId, depth } }));
    requestAnimationFrame(() => {
      scrollToEl(
        document.getElementById(`depth-${sectionId}-${depth}`) ||
        document.querySelector(`[data-section-id="${sectionId}"]`)
      );
    });
  };

  if (!week || !week.sections) return null;

  return (
    <nav className="sidebar" aria-label="Section contents" style={{ width: 220, flexShrink: 0, padding: "20px", borderRight: "1px solid var(--border-light)", position: "sticky", top: 130, maxHeight: "calc(100dvh - 130px)", overflowY: "auto", background: "var(--bg-tertiary)" }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.08em", fontFamily: "var(--mono)", marginBottom: 16, textTransform: "uppercase" }}>
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
                  borderRadius: "var(--r-xs)",
                  border: "none",
                  background: "transparent",
                  color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                  fontSize: 12,
                  fontWeight: isActive ? 600 : 400,
                  fontFamily: "var(--body)",
                  cursor: "pointer",
                  textAlign: "left",
                  borderLeft: isActive ? "2px solid var(--text-primary)" : "2px solid transparent",
                  transition: "background var(--dur) var(--ease), border-color var(--dur) var(--ease), color var(--dur) var(--ease)",
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

              {/* Depth levels for the active section only */}
              {isActive && (
                <div style={{ display: "flex", flexDirection: "column", gap: 1, marginTop: 2, marginLeft: 10, paddingLeft: 8, borderLeft: "1px solid var(--border-hover)" }}>
                  {["eli5", "normal", "technical", "pm"].map((depth) => (
                    <button
                      key={depth}
                      onClick={() => scrollToDepth(section.id, depth)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: "var(--r-xs)",
                        border: "none",
                        background: "transparent",
                        color: "var(--text-muted)",
                        fontSize: 10,
                        fontWeight: 400,
                        fontFamily: "var(--mono)",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "background var(--dur) var(--ease), border-color var(--dur) var(--ease), color var(--dur) var(--ease)",
                        letterSpacing: "0.02em"
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
    </nav>
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
    <div style={{ marginBottom: 28, padding: "14px 16px", background: "var(--bg-secondary)", borderRadius: "var(--r-md)", border: "1px solid var(--border-light)" }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.08em", fontFamily: "var(--mono)", marginBottom: 12, textTransform: "uppercase" }}>
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

  // Track which section is in view. Debounced so the TOC only updates after scroll stops
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
    <div style={{ minHeight: "100dvh", background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <style>{`
        /* Fonts are loaded in index.html with preconnect. Never @import at runtime. */

        :root {
          --display: 'Outfit', sans-serif;
          --body: 'Source Sans 3', sans-serif;
          --mono: 'IBM Plex Mono', monospace;

          /* Surfaces: off-white, never pure #fff */
          --bg-primary: #fcfcfb;
          --bg-secondary: #f6f6f3;
          --bg-tertiary: #f1f1ed;
          --bg-input: #ffffff;
          --bg-card: var(--bg-primary);

          /* Text: near-black, never pure #000 */
          --text-primary: #16161a;
          --text-secondary: #3d3d45;
          --text-muted: #6b6b74;
          --text-light: #9a9aa3;
          --label-color: var(--text-muted);

          /* Borders */
          --border-color: #e5e5e0;
          --border-light: #eeeeea;
          --border-hover: #d2d2cb;
          --border: var(--border-color);
          --section-separator: var(--border-light);

          /* One accent, used for focus, links and selection */
          --accent-primary: #2563EB;
          --accent-text: #ffffff;
          --accent-hover: rgba(37, 99, 235, 0.08);

          /* Semantic palette: every ad-hoc hex in the app maps to one of these */
          --success: #2F7A43;
          --warning: #A16207;
          --danger: #C2333A;
          --info: #1B65C0;
          --violet: #7C3AED;
          --orange: #C2560C;
          --pink: #B32B5E;

          /* Tinted surfaces come from tint() in JS, a color-mix over the semantic
             token above, so there is no hand-maintained pastel palette per theme. */

          /* Tinted shadows read as depth; pure black reads as dirt */
          --shadow-sm: rgba(24, 24, 40, 0.05);
          --shadow-md: rgba(24, 24, 40, 0.09);

          /* Scales */
          --r-xs: 4px;
          --r-sm: 6px;
          --r-md: 10px;
          --r-lg: 14px;
          --r-full: 999px;
          --measure: 68ch;
          --ease: cubic-bezier(0.4, 0, 0.2, 1);
          --dur: 200ms;
        }

        :root.dark-mode {
          --bg-primary: #101012;
          --bg-secondary: #17171a;
          --bg-tertiary: #1d1d21;
          --bg-input: #17171a;

          --text-primary: #f3f3f1;
          --text-secondary: #c8c8cd;
          --text-muted: #8d8d96;
          --text-light: #64646d;

          --border-color: #27272c;
          --border-light: #1e1e22;
          --border-hover: #38383f;

          --accent-primary: #60A5FA;
          --accent-text: #101012;
          --accent-hover: rgba(96, 165, 250, 0.14);

          --success: #6BCB84;
          --warning: #E3B341;
          --danger: #F0777E;
          --info: #6BAEF5;
          --violet: #B18AF5;
          --orange: #F0904E;
          --pink: #F07098;

          --shadow-sm: rgba(0, 0, 0, 0.4);
          --shadow-md: rgba(0, 0, 0, 0.6);
        }

        * { box-sizing: border-box; }

        html {
          scroll-behavior: smooth;
          -webkit-text-size-adjust: 100%;
        }

        body {
          margin: 0;
          font-family: var(--body);
          background: var(--bg-primary);
          color: var(--text-primary);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }

        h1, h2, h3, h4 { text-wrap: balance; }
        p, li { text-wrap: pretty; }

        /* Numbers in this app are mostly compared column-wise, so align them */
        [style*="--mono"], code, pre, input[type=number] {
          font-variant-numeric: tabular-nums;
        }

        ::selection {
          background: var(--accent-hover);
          color: var(--text-primary);
        }

        /* Scrollbars follow the theme instead of punching a light hole in dark mode */
        * { scrollbar-color: var(--border-hover) transparent; scrollbar-width: thin; }
        ::-webkit-scrollbar { width: 10px; height: 10px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb {
          background: var(--border-hover);
          border-radius: var(--r-full);
          border: 3px solid var(--bg-primary);
        }
        ::-webkit-scrollbar-thumb:hover { background: var(--text-light); }

        input[type=range] {
          -webkit-appearance: none;
          appearance: none;
          background: var(--bg-tertiary);
          border-radius: var(--r-full);
          cursor: pointer;
        }

        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--text-secondary);
          border: 2px solid var(--bg-primary);
          box-shadow: 0 1px 3px var(--shadow-md);
          transition: transform var(--dur) var(--ease);
        }
        input[type=range]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--text-secondary);
          border: 2px solid var(--bg-primary);
          box-shadow: 0 1px 3px var(--shadow-md);
          transition: transform var(--dur) var(--ease);
        }
        input[type=range]:hover::-webkit-slider-thumb { transform: scale(1.15); }
        input[type=range]:hover::-moz-range-thumb { transform: scale(1.15); }
        input[type=range]:active::-webkit-slider-thumb { transform: scale(0.95); }
        input[type=range]:active::-moz-range-thumb { transform: scale(0.95); }

        textarea:focus {
          border-color: var(--text-muted) !important;
        }

        button {
          font-family: inherit;
          transition: background-color var(--dur) var(--ease),
                      border-color var(--dur) var(--ease),
                      color var(--dur) var(--ease),
                      box-shadow var(--dur) var(--ease),
                      opacity var(--dur) var(--ease),
                      transform 90ms var(--ease);
        }

        /* The app had hover everywhere and pressed-state nowhere */
        button:not(:disabled):active { transform: translateY(1px) scale(0.985); }
        a:active { transform: translateY(1px); }

        .skip-link {
          position: absolute;
          left: -9999px;
          top: 8px;
          z-index: 200;
          padding: 10px 16px;
          border-radius: var(--r-sm);
          background: var(--text-primary);
          color: var(--bg-primary);
          font-family: var(--body);
          font-size: 14px;
          text-decoration: none;
        }
        .skip-link:focus {
          left: 16px;
        }

        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }

        @media (max-width: 1200px) {
          .layout { margin-left: 0 !important; margin-right: 0 !important; }
          .sidebar { width: 180px !important; padding: 16px !important; }
          .content { padding: 32px 24px !important; }
        }

        @media (max-width: 1024px) {
          .sidebar { width: 160px !important; padding: 14px !important; }
          .content { padding: 28px 20px !important; }
        }

        @media (max-width: 768px) {
          .layout { flex-direction: column !important; }
          .sidebar {
            position: fixed !important;
            left: 0 !important;
            top: 64px !important;
            width: 100% !important;
            max-height: calc(100dvh - 130px) !important;
            z-index: 99 !important;
            border-right: none !important;
            border-bottom: 1px solid var(--border-light) !important;
            background: var(--bg-primary) !important;
            padding: 16px !important;
          }
          .content { padding: 20px 16px !important; }
        }

        button:focus-visible {
          outline: 2px solid var(--accent-primary);
          outline-offset: 2px;
        }

        a:focus-visible {
          outline: 2px solid var(--accent-primary);
          outline-offset: 2px;
        }
      `}</style>

      {/* First focusable element on the page. The .skip-link CSS above pulls it
          offscreen until it takes focus. */}
      <a className="skip-link" href="#main">Skip to content</a>

      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 100, padding: "16px 32px", borderBottom: "1px solid var(--border-light)", background: "var(--bg-primary)" }}>
        <div style={{ maxWidth: 1600, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {!isMobile && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                  aria-expanded={sidebarOpen}
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-light)",
                    borderRadius: "var(--r-sm)",
                    padding: "8px 10px",
                    cursor: "pointer",
                    color: "var(--text-secondary)",
                    fontSize: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background var(--dur) var(--ease), border-color var(--dur) var(--ease), color var(--dur) var(--ease)",
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
              {/* Monogram: inverts with the theme because it borrows the text and
                  surface tokens rather than hardcoding black on white. */}
              <div
                aria-hidden="true"
                style={{
                  width: 34,
                  height: 34,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 9,
                  background: "var(--text-primary)",
                  color: "var(--bg-primary)",
                  fontFamily: "var(--display)",
                  fontWeight: 700,
                  fontSize: 14,
                  letterSpacing: "-0.03em",
                  paddingRight: 1
                }}
              >
                RC
              </div>
              <div>
                <h1 style={{ fontSize: isMobile ? 16 : 20, fontWeight: 600, fontFamily: "var(--display)", margin: 0, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                  AI PM Roadmap
                </h1>
                {!isMobile && (
                  <p style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "var(--body)", margin: "4px 0 0" }}>
                    5 weeks · 4 depth levels · Interactive tools · Quizzes
                  </p>
                )}
              </div>
            </div>
            <DarkModeToggle isDarkMode={darkMode} onToggle={() => setDarkMode(!darkMode)} />
          </div>
        </div>
      </header>

      {/* Week Tabs */}
      <WeekTabs activeWeekId={currentWeekId} onWeekChange={setCurrentWeek} isMobile={isMobile} onMobileClose={() => { window.scrollTo({ top: 0, behavior: "smooth" }); }} />

      {/* Layout */}
      <div className="layout" style={{ display: "flex", maxWidth: 1600, margin: "0 auto", minHeight: "calc(100dvh - 190px)" }}>
        {/* TOC sidebar, desktop only */}
        {!isMobile && sidebarOpen && <TableOfContents week={week} currentSection={currentSection} />}

        {/* Content */}
        <main id="main" className="content" ref={contentRef} tabIndex={-1} style={{ flex: 1, padding: "40px 48px", overflowY: "auto", background: "var(--bg-primary)" }}>
          <div style={{ marginBottom: 40 }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.08em", fontFamily: "var(--mono)", marginBottom: 4 }}>WEEK {week.id}</div>
              <h2 style={{ fontSize: 28, fontWeight: 600, fontFamily: "var(--display)", margin: 0, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>{week.title}</h2>
            </div>
            <div style={{ padding: "16px 20px", background: "var(--bg-secondary)", border: "1px solid var(--border-light)", borderRadius: "var(--r-md)" }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.08em", fontFamily: "var(--mono)", marginBottom: 4 }}>WHY THIS MATTERS</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, fontFamily: "var(--body)" }}>{week.pmAngle}</div>
            </div>
          </div>

          {/* Mobile TOC, inline at top of content */}
          {isMobile && <MobileTOC week={week} />}

          {week.sections.map(section => (
            <Section key={section.id} section={section} weekColor={week.color} />
          ))}
        </main>
      </div>

      <footer style={{ borderTop: "1px solid var(--border-light)", background: "var(--bg-primary)", padding: "20px 32px" }}>
        <div style={{ maxWidth: 1600, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10, fontSize: 12, fontFamily: "var(--mono)", color: "var(--text-light)" }}>
          <span>AI PM Roadmap · Week {week.id} of {WEEKS.length}</span>
          <span>Progress is saved in this browser only.</span>
        </div>
      </footer>
    </div>
  );
}
