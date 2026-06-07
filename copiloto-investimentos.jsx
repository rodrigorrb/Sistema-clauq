import { useState, useEffect, useRef } from "react";

// ─── Fonts & Global Styles ───────────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg-0: #080c0e;
      --bg-1: #0d1316;
      --bg-2: #131a1e;
      --bg-3: #1a2228;
      --bg-4: #222c33;
      --border: #1f2d35;
      --border-bright: #2a3d48;
      --green: #00e676;
      --green-dim: #00c96655;
      --green-glow: #00e67622;
      --red: #ff3d57;
      --red-dim: #ff3d5740;
      --yellow: #ffd740;
      --yellow-dim: #ffd74030;
      --blue: #40c4ff;
      --blue-dim: #40c4ff25;
      --text-1: #e8f0f4;
      --text-2: #8ba8b8;
      --text-3: #4a6070;
      --mono: 'IBM Plex Mono', monospace;
      --display: 'Syne', sans-serif;
      --body: 'Inter', sans-serif;
    }

    body {
      background: var(--bg-0);
      color: var(--text-1);
      font-family: var(--body);
      min-height: 100vh;
      overflow-x: hidden;
    }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: var(--bg-1); }
    ::-webkit-scrollbar-thumb { background: var(--border-bright); border-radius: 2px; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse-green {
      0%, 100% { box-shadow: 0 0 0 0 var(--green-glow); }
      50%       { box-shadow: 0 0 20px 4px var(--green-glow); }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes scanline {
      0%   { transform: translateY(-100%); }
      100% { transform: translateY(100vh); }
    }
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0; }
    }
    @keyframes stream {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    .fade-up { animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
    .fade-up-d1 { animation-delay: 0.05s; }
    .fade-up-d2 { animation-delay: 0.10s; }
    .fade-up-d3 { animation-delay: 0.15s; }
    .fade-up-d4 { animation-delay: 0.20s; }
    .fade-up-d5 { animation-delay: 0.25s; }

    .scanline-overlay {
      pointer-events: none;
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(0,0,0,0.04) 2px,
        rgba(0,0,0,0.04) 4px
      );
    }

    .card {
      background: var(--bg-2);
      border: 1px solid var(--border);
      border-radius: 8px;
    }
    .card-bright {
      background: var(--bg-3);
      border: 1px solid var(--border-bright);
      border-radius: 8px;
    }

    .tag {
      font-family: var(--mono);
      font-size: 10px;
      letter-spacing: 0.08em;
      padding: 2px 7px;
      border-radius: 3px;
      font-weight: 500;
    }

    .btn-primary {
      background: var(--green);
      color: #000;
      border: none;
      border-radius: 6px;
      font-family: var(--display);
      font-weight: 700;
      font-size: 13px;
      letter-spacing: 0.04em;
      cursor: pointer;
      transition: all 0.18s;
      display: flex; align-items: center; gap: 6px;
    }
    .btn-primary:hover { filter: brightness(1.12); transform: translateY(-1px); }
    .btn-primary:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

    .btn-ghost {
      background: transparent;
      color: var(--text-2);
      border: 1px solid var(--border-bright);
      border-radius: 6px;
      font-family: var(--mono);
      font-size: 12px;
      cursor: pointer;
      transition: all 0.18s;
    }
    .btn-ghost:hover { border-color: var(--green); color: var(--green); background: var(--green-glow); }

    .mono { font-family: var(--mono); }
    .pos { color: var(--green); }
    .neg { color: var(--red); }
    .neu { color: var(--yellow); }

    .spinner {
      width: 16px; height: 16px;
      border: 2px solid var(--border-bright);
      border-top-color: var(--green);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      display: inline-block;
    }

    .ai-stream p { animation: stream 0.3s ease both; }

    input[type="text"] {
      background: var(--bg-3);
      border: 1px solid var(--border-bright);
      border-radius: 6px;
      color: var(--text-1);
      font-family: var(--mono);
      font-size: 15px;
      letter-spacing: 0.06em;
      outline: none;
      transition: border-color 0.18s, box-shadow 0.18s;
    }
    input[type="text"]:focus {
      border-color: var(--green);
      box-shadow: 0 0 0 3px var(--green-glow);
    }
    input[type="text"]::placeholder { color: var(--text-3); }
  `}</style>
);

// ─── Mock market data (simulating API response) ──────────────────────────────
const MOCK_STOCKS = {
  PETR4: {
    name: "Petrobras PN", sector: "Energia / Petróleo",
    price: 38.72, change: +1.84, changePct: +4.99,
    pl: 4.2, pvp: 1.1, roe: 26.3, dy: 14.8,
    ebitda: 189400, receita: 502000, lucro: 124000,
    divida: 234000, dividaEbitda: 1.24,
    margemLiquida: 24.7, crescimento5a: 18.2,
    governanca: "N2", volume: "R$ 1.2Bi",
    maxAnual: 44.10, minAnual: 29.80,
    score: { lucro: 22, divida: 15, dividendos: 14, crescimento: 20, governanca: 9, total: 80 },
  },
  VALE3: {
    name: "Vale ON", sector: "Mineração",
    price: 62.15, change: -0.93, changePct: -1.47,
    pl: 5.8, pvp: 1.4, roe: 22.1, dy: 9.6,
    ebitda: 154000, receita: 234000, lucro: 89000,
    divida: 112000, dividaEbitda: 0.73,
    margemLiquida: 38.0, crescimento5a: 11.4,
    governanca: "NM", volume: "R$ 980Mi",
    maxAnual: 74.80, minAnual: 52.40,
    score: { lucro: 20, divida: 18, dividendos: 12, crescimento: 18, governanca: 13, total: 81 },
  },
  ITUB4: {
    name: "Itaú Unibanco PN", sector: "Financeiro / Bancos",
    price: 34.48, change: +0.22, changePct: +0.64,
    pl: 8.9, pvp: 2.1, roe: 20.8, dy: 5.4,
    ebitda: null, receita: 118000, lucro: 42000,
    divida: null, dividaEbitda: null,
    margemLiquida: 35.6, crescimento5a: 9.8,
    governanca: "N1", volume: "R$ 740Mi",
    maxAnual: 38.90, minAnual: 27.60,
    score: { lucro: 18, divida: 16, dividendos: 8, crescimento: 16, governanca: 11, total: 69 },
  },
  WEGE3: {
    name: "WEG ON", sector: "Indústria / Eletroeletrônicos",
    price: 52.30, change: +0.85, changePct: +1.65,
    pl: 31.2, pvp: 10.8, roe: 34.5, dy: 1.8,
    ebitda: 8200, receita: 36000, lucro: 7800,
    divida: 2100, dividaEbitda: 0.26,
    margemLiquida: 21.7, crescimento5a: 28.4,
    governanca: "NM", volume: "R$ 320Mi",
    maxAnual: 58.90, minAnual: 43.20,
    score: { lucro: 24, divida: 20, dividendos: 5, crescimento: 25, governanca: 15, total: 89 },
  },
  BBAS3: {
    name: "Banco do Brasil ON", sector: "Financeiro / Bancos Públicos",
    price: 24.15, change: -0.40, changePct: -1.63,
    pl: 4.1, pvp: 0.9, roe: 21.3, dy: 10.2,
    ebitda: null, receita: 98000, lucro: 36000,
    divida: null, dividaEbitda: null,
    margemLiquida: 36.7, crescimento5a: 14.1,
    governanca: "NM", volume: "R$ 850Mi",
    maxAnual: 30.10, minAnual: 20.80,
    score: { lucro: 19, divida: 14, dividendos: 13, crescimento: 19, governanca: 8, total: 73 },
  },
};

const TICKERS_SUGERIDOS = ["PETR4", "VALE3", "ITUB4", "WEGE3", "BBAS3", "MGLU3", "RENT3", "LREN3"];

// ─── Score Ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score }) {
  const r = 42, circ = 2 * Math.PI * r;
  const pct = score / 100;
  const color = score >= 80 ? "var(--green)" : score >= 60 ? "var(--yellow)" : "var(--red)";
  const label = score >= 80 ? "ÓTIMO" : score >= 65 ? "BOM" : score >= 50 ? "REGULAR" : "FRACO";
  return (
    <div style={{ position: "relative", width: 110, height: 110, flexShrink: 0 }}>
      <svg width={110} height={110} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={55} cy={55} r={r} fill="none" stroke="var(--bg-4)" strokeWidth={8} />
        <circle cx={55} cy={55} r={r} fill="none" stroke={color}
          strokeWidth={8} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1)", filter: `drop-shadow(0 0 6px ${color})` }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 26, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text-3)", letterSpacing: "0.1em", marginTop: 2 }}>{label}</span>
      </div>
    </div>
  );
}

// ─── Metric Card ─────────────────────────────────────────────────────────────
function MetricCard({ label, value, unit = "", color, sub }) {
  return (
    <div className="card" style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-3)", letterSpacing: "0.08em" }}>{label}</span>
      <span style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 20, color: color || "var(--text-1)" }}>
        {value}<span style={{ fontSize: 13, fontWeight: 400, color: "var(--text-2)", marginLeft: 2 }}>{unit}</span>
      </span>
      {sub && <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-3)" }}>{sub}</span>}
    </div>
  );
}

// ─── Score Bar Row ────────────────────────────────────────────────────────────
function ScoreBar({ label, val, max, weight }) {
  const pct = (val / max) * 100;
  const color = pct >= 80 ? "var(--green)" : pct >= 55 ? "var(--yellow)" : "var(--red)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-2)", width: 90, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 4, background: "var(--bg-4)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 2, transition: "width 1s cubic-bezier(0.22,1,0.36,1)" }} />
      </div>
      <span style={{ fontFamily: "var(--mono)", fontSize: 11, color, width: 28, textAlign: "right" }}>{val}</span>
      <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-3)", width: 34, textAlign: "right" }}>/{weight}</span>
    </div>
  );
}

// ─── Cenário Card ─────────────────────────────────────────────────────────────
function CenarioCard({ tipo, pct, color, bg, desc }) {
  return (
    <div style={{ background: bg, border: `1px solid ${color}40`, borderRadius: 8, padding: "14px 16px" }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 10, color, letterSpacing: "0.1em", marginBottom: 6 }}>{tipo}</div>
      <div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 22, color }}>{pct}</div>
      <div style={{ fontFamily: "var(--body)", fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>{desc}</div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("home"); // home | analysis
  const [ticker, setTicker] = useState("");
  const [activeTicker, setActiveTicker] = useState(null);
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiText, setAiText] = useState("");
  const [aiDone, setAiDone] = useState(false);
  const [watchlist, setWatchlist] = useState(["PETR4", "VALE3", "WEGE3"]);
  const [perfil, setPerfil] = useState("moderado");
  const [horizonte, setHorizonte] = useState("medio");
  const [aiError, setAiError] = useState("");
  const inputRef = useRef(null);
  const aiRef = useRef(null);

  function handleSearch(t) {
    const sym = (t || ticker).toUpperCase().trim();
    if (!sym) return;
    if (!MOCK_STOCKS[sym]) {
      setAiError(`Ticker "${sym}" não encontrado. Tente: ${Object.keys(MOCK_STOCKS).join(", ")}`);
      return;
    }
    setAiError("");
    setLoading(true);
    setAiText("");
    setAiDone(false);
    setActiveTicker(sym);
    setTimeout(() => {
      setStock(MOCK_STOCKS[sym]);
      setLoading(false);
      setView("analysis");
      setTimeout(() => analyzeWithAI(MOCK_STOCKS[sym], sym), 400);
    }, 700);
  }

  async function analyzeWithAI(s, sym) {
    setAiLoading(true);
    setAiText("");
    setAiDone(false);
    const perfilLabel = { conservador: "conservador (prioriza segurança)", moderado: "moderado (equilíbrio risco/retorno)", arrojado: "arrojado (aceita alta volatilidade)" }[perfil];
    const horizLabel = { curto: "curto prazo (até 1 ano)", medio: "médio prazo (1 a 5 anos)", longo: "longo prazo (5+ anos)" }[horizonte];

    const prompt = `Você é um analista financeiro especialista em bolsa brasileira (B3). Analise os indicadores da ação ${sym} - ${s.name} do setor ${s.sector}:

DADOS FUNDAMENTALISTAS:
- Preço atual: R$ ${s.price}
- P/L: ${s.pl}x
- P/VP: ${s.pvp}x
- ROE: ${s.roe}%
- Dividend Yield: ${s.dy}%
- Margem Líquida: ${s.margemLiquida}%
- Crescimento 5 anos: ${s.crescimento5a}%
- Dívida/EBITDA: ${s.dividaEbitda ?? "N/A (banco)"}
- Governança: Nível ${s.governanca}
- Score total: ${s.score.total}/100
- Variação hoje: ${s.changePct > 0 ? "+" : ""}${s.changePct}%
- Máxima anual: R$ ${s.maxAnual} | Mínima anual: R$ ${s.minAnual}

PERFIL DO INVESTIDOR: ${perfilLabel}
HORIZONTE: ${horizLabel}

Responda em português, de forma clara e estruturada com EXATAMENTE este formato (use emojis nos títulos):

## ✅ Pontos Fortes
[3 pontos fortes em bullets]

## ⚠️ Pontos de Atenção
[3 riscos ou fragilidades em bullets]

## 📊 Avaliação para este Perfil
[2 parágrafos sobre adequação ao perfil e horizonte indicados]

## 🎯 Potencial de Valorização
[Análise conservadora, base e otimista com % estimado e prazo, sendo claro que são estimativas educacionais, não recomendação de investimento]

## 🔍 O que monitorar
[3 fatores/eventos que mais podem impactar o preço desta ação]

---
*Esta análise é educacional e não constitui recomendação de investimento.*`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "Erro ao processar resposta.";
      // Simulate streaming effect
      let i = 0;
      const words = text.split(" ");
      const interval = setInterval(() => {
        i += 3;
        setAiText(words.slice(0, i).join(" "));
        if (aiRef.current) aiRef.current.scrollTop = aiRef.current.scrollHeight;
        if (i >= words.length) {
          clearInterval(interval);
          setAiText(text);
          setAiDone(true);
          setAiLoading(false);
        }
      }, 18);
    } catch (e) {
      setAiText("⚠️ Não foi possível conectar à IA. Verifique sua conexão.");
      setAiDone(true);
      setAiLoading(false);
    }
  }

  function toggleWatchlist(sym) {
    setWatchlist(w => w.includes(sym) ? w.filter(x => x !== sym) : [...w, sym]);
  }

  function formatMd(text) {
    if (!text) return null;
    const lines = text.split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("## ")) return <h3 key={i} style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 14, color: "var(--text-1)", marginTop: 18, marginBottom: 8 }}>{line.replace("## ", "")}</h3>;
      if (line.startsWith("- ") || line.startsWith("• ")) return <div key={i} style={{ display: "flex", gap: 8, marginBottom: 5 }}><span style={{ color: "var(--green)", flexShrink: 0 }}>▸</span><span style={{ fontFamily: "var(--body)", fontSize: 13, color: "var(--text-2)", lineHeight: 1.55 }}>{line.replace(/^[-•] /, "")}</span></div>;
      if (line.startsWith("*") && line.endsWith("*")) return <p key={i} style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-3)", marginTop: 10 }}>{line.replace(/\*/g, "")}</p>;
      if (line.startsWith("---")) return <hr key={i} style={{ border: "none", borderTop: "1px solid var(--border)", margin: "12px 0" }} />;
      if (line.trim()) return <p key={i} style={{ fontFamily: "var(--body)", fontSize: 13, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 6 }}>{line}</p>;
      return null;
    });
  }

  // ── HOME ──
  if (view === "home") return (
    <>
      <GlobalStyle />
      <div className="scanline-overlay" />
      <div style={{ minHeight: "100vh", padding: "0 16px 40px" }}>
        {/* Header */}
        <div style={{ borderBottom: "1px solid var(--border)", padding: "16px 0", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, background: "var(--green)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 14 }}>◈</span>
            </div>
            <span style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 17, letterSpacing: "-0.02em" }}>COPILOTO</span>
            <span className="tag" style={{ background: "var(--green-dim)", color: "var(--green)", border: "1px solid var(--green)40" }}>BETA</span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {["conservador", "moderado", "arrojado"].map(p => (
              <button key={p} className="btn-ghost" onClick={() => setPerfil(p)}
                style={{ padding: "5px 10px", fontSize: 10, borderColor: perfil === p ? "var(--green)" : undefined, color: perfil === p ? "var(--green)" : undefined, background: perfil === p ? "var(--green-glow)" : undefined }}>
                {p[0].toUpperCase() + p.slice(1, 4)}
              </button>
            ))}
          </div>
        </div>

        {/* Hero */}
        <div className="fade-up" style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--green)", letterSpacing: "0.15em", marginBottom: 12 }}>COPILOTO DE DECISÃO · B3</div>
          <h1 style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: "clamp(28px, 7vw, 48px)", lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: 14 }}>
            Análise inteligente<br />
            <span style={{ color: "var(--green)" }}>para o investidor</span> brasileiro.
          </h1>
          <p style={{ fontFamily: "var(--body)", fontSize: 14, color: "var(--text-2)", maxWidth: 420, margin: "0 auto", lineHeight: 1.65 }}>
            Digite qualquer ticker da B3 e receba uma análise fundamentalista completa com IA, score de qualidade e avaliação de risco personalizada.
          </p>
        </div>

        {/* Search */}
        <div className="fade-up fade-up-d1" style={{ maxWidth: 480, margin: "0 auto 12px" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <input type="text" ref={inputRef} placeholder="Digite o ticker... ex: PETR4"
              value={ticker} onChange={e => { setTicker(e.target.value.toUpperCase()); setAiError(""); }}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              style={{ flex: 1, padding: "13px 16px" }} />
            <button className="btn-primary" onClick={() => handleSearch()} disabled={loading} style={{ padding: "13px 22px", fontSize: 14 }}>
              {loading ? <span className="spinner" /> : "↗ Analisar"}
            </button>
          </div>
          {aiError && <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--red)", marginTop: 8, padding: "8px 12px", background: "var(--red-dim)", borderRadius: 6 }}>{aiError}</div>}
        </div>

        {/* Sugestões */}
        <div className="fade-up fade-up-d2" style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", marginBottom: 40 }}>
          {TICKERS_SUGERIDOS.map(t => (
            <button key={t} className="btn-ghost" onClick={() => { setTicker(t); handleSearch(t); }} style={{ padding: "5px 12px", fontFamily: "var(--mono)", fontSize: 12 }}>
              {t}
            </button>
          ))}
        </div>

        {/* Watchlist */}
        {watchlist.length > 0 && (
          <div className="fade-up fade-up-d3">
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-3)", letterSpacing: "0.1em", marginBottom: 10 }}>▸ WATCHLIST</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {watchlist.map(sym => {
                const s = MOCK_STOCKS[sym];
                if (!s) return null;
                const pos = s.changePct >= 0;
                return (
                  <div key={sym} className="card" style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
                    onClick={() => { setTicker(sym); handleSearch(sym); }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 14 }}>{sym}</div>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-3)" }}>{s.sector}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "var(--mono)", fontWeight: 500, fontSize: 15 }}>R$ {s.price.toFixed(2)}</div>
                      <div className={`mono ${pos ? "pos" : "neg"}`} style={{ fontSize: 12 }}>{pos ? "+" : ""}{s.changePct.toFixed(2)}%</div>
                    </div>
                    <ScoreRing score={s.score.total} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Horizonte */}
        <div className="fade-up fade-up-d4" style={{ marginTop: 28 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-3)", letterSpacing: "0.1em", marginBottom: 10 }}>▸ HORIZONTE DE INVESTIMENTO</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[["curto", "≤1 ano"], ["medio", "1–5 anos"], ["longo", "5+ anos"]].map(([v, l]) => (
              <button key={v} className="btn-ghost" onClick={() => setHorizonte(v)}
                style={{ flex: 1, padding: "10px 8px", borderColor: horizonte === v ? "var(--green)" : undefined, color: horizonte === v ? "var(--green)" : undefined, background: horizonte === v ? "var(--green-glow)" : undefined, textAlign: "center" }}>
                <div style={{ fontSize: 9, letterSpacing: "0.08em" }}>{v.toUpperCase()}</div>
                <div style={{ fontSize: 11, marginTop: 2 }}>{l}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="fade-up fade-up-d5" style={{ marginTop: 40, padding: "12px 16px", background: "var(--yellow-dim)", border: "1px solid var(--yellow)30", borderRadius: 8 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--yellow)", letterSpacing: "0.08em", marginBottom: 4 }}>⚠ AVISO IMPORTANTE</div>
          <p style={{ fontFamily: "var(--body)", fontSize: 11, color: "var(--text-3)", lineHeight: 1.55 }}>
            Este aplicativo tem fins <strong style={{ color: "var(--text-2)" }}>educacionais e informativos</strong>. As análises não constituem recomendação de investimento. Sempre consulte um assessor certificado antes de investir.
          </p>
        </div>
      </div>
    </>
  );

  // ── ANALYSIS ──
  if (view === "analysis" && stock) {
    const s = stock;
    const pos = s.changePct >= 0;
    const inWatchlist = watchlist.includes(activeTicker);
    return (
      <>
        <GlobalStyle />
        <div className="scanline-overlay" />
        <div style={{ minHeight: "100vh", padding: "0 16px 60px" }}>
          {/* Nav */}
          <div style={{ borderBottom: "1px solid var(--border)", padding: "14px 0", display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <button className="btn-ghost" onClick={() => { setView("home"); setStock(null); setAiText(""); }} style={{ padding: "6px 12px", fontSize: 12 }}>← Voltar</button>
            <span style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 16 }}>{activeTicker}</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-3)" }}>{s.name}</span>
            <div style={{ marginLeft: "auto" }}>
              <button className="btn-ghost" onClick={() => toggleWatchlist(activeTicker)}
                style={{ padding: "6px 14px", fontSize: 12, borderColor: inWatchlist ? "var(--green)" : undefined, color: inWatchlist ? "var(--green)" : undefined, background: inWatchlist ? "var(--green-glow)" : undefined }}>
                {inWatchlist ? "★ Watching" : "☆ Watch"}
              </button>
            </div>
          </div>

          {/* Price Hero */}
          <div className="fade-up" style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.08em", marginBottom: 4 }}>{s.sector}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                <span style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 36 }}>R$ {s.price.toFixed(2)}</span>
                <span className={`mono ${pos ? "pos" : "neg"}`} style={{ fontSize: 14 }}>{pos ? "+" : ""}{s.change.toFixed(2)} ({pos ? "+" : ""}{s.changePct.toFixed(2)}%)</span>
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-3)" }}>↓Min {s.minAnual}</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-3)" }}>↑Max {s.maxAnual}</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-3)" }}>Vol {s.volume}</span>
              </div>
            </div>
            <ScoreRing score={s.score.total} />
          </div>

          {/* Score Breakdown */}
          <div className="card fade-up fade-up-d1" style={{ padding: "16px", marginBottom: 16 }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-3)", letterSpacing: "0.1em", marginBottom: 12 }}>▸ SCORE DE QUALIDADE</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <ScoreBar label="Lucros" val={s.score.lucro} max={25} weight={25} />
              <ScoreBar label="Crescimento" val={s.score.crescimento} max={25} weight={25} />
              <ScoreBar label="Dívida" val={s.score.divida} max={20} weight={20} />
              <ScoreBar label="Dividendos" val={s.score.dividendos} max={15} weight={15} />
              <ScoreBar label="Governança" val={s.score.governanca} max={15} weight={15} />
            </div>
            <div style={{ borderTop: "1px solid var(--border)", marginTop: 12, paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-2)" }}>Score Final</span>
              <span style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 20, color: s.score.total >= 80 ? "var(--green)" : s.score.total >= 65 ? "var(--yellow)" : "var(--red)" }}>{s.score.total}/100</span>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="fade-up fade-up-d2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
            <MetricCard label="P/L" value={s.pl} unit="x" color={s.pl < 10 ? "var(--green)" : s.pl < 20 ? "var(--yellow)" : "var(--red)"} sub="Preço/Lucro" />
            <MetricCard label="ROE" value={`${s.roe}`} unit="%" color={s.roe > 20 ? "var(--green)" : "var(--yellow)"} sub="Retorno s/ Patrimônio" />
            <MetricCard label="DY" value={`${s.dy}`} unit="%" color={s.dy > 8 ? "var(--green)" : "var(--text-1)"} sub="Dividend Yield" />
            <MetricCard label="P/VP" value={s.pvp} unit="x" color={s.pvp < 1.5 ? "var(--green)" : "var(--text-1)"} sub="Preço/Valor Patrimonial" />
            <MetricCard label="Margem" value={`${s.margemLiquida}`} unit="%" color={s.margemLiquida > 25 ? "var(--green)" : "var(--text-1)"} sub="Margem Líquida" />
            <MetricCard label="Cresc 5a" value={`${s.crescimento5a}`} unit="%" color={s.crescimento5a > 15 ? "var(--green)" : "var(--text-1)"} sub="Crescimento 5 anos" />
            {s.dividaEbitda !== null && (
              <MetricCard label="Div/EBITDA" value={s.dividaEbitda} unit="x" color={s.dividaEbitda < 2 ? "var(--green)" : s.dividaEbitda < 3 ? "var(--yellow)" : "var(--red)"} sub="Alavancagem" />
            )}
            <MetricCard label="Governança" value={s.governanca} color="var(--blue)" sub="Nível B3" />
          </div>

          {/* Cenários */}
          <div className="fade-up fade-up-d3" style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-3)", letterSpacing: "0.1em", marginBottom: 10 }}>▸ CENÁRIOS ESTIMADOS (não é recomendação)</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              <CenarioCard tipo="CONSERVADOR" pct={`+${(s.score.total * 0.08).toFixed(0)}%`} color="var(--blue)" bg="var(--blue-dim)" desc="ao ano estimado" />
              <CenarioCard tipo="BASE" pct={`+${(s.score.total * 0.14).toFixed(0)}%`} color="var(--yellow)" bg="var(--yellow-dim)" desc="ao ano estimado" />
              <CenarioCard tipo="OTIMISTA" pct={`+${(s.score.total * 0.22).toFixed(0)}%`} color="var(--green)" bg="var(--green-dim)" desc="ao ano estimado" />
            </div>
          </div>

          {/* IA Analysis */}
          <div className="fade-up fade-up-d4" style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-3)", letterSpacing: "0.1em" }}>▸ ANÁLISE DA IA</div>
              {aiLoading && <><span className="spinner" style={{ width: 12, height: 12 }} /><span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--green)" }}>analisando...</span></>}
              {aiDone && <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--green)" }}>✓ concluído</span>}
            </div>
            <div className="card" ref={aiRef} style={{ padding: "16px", maxHeight: 420, overflowY: "auto" }}>
              {aiText ? (
                <div className="ai-stream">{formatMd(aiText)}</div>
              ) : aiLoading ? (
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span className="spinner" />
                  <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-3)" }}>Consultando IA...</span>
                </div>
              ) : null}
            </div>
            {aiDone && (
              <button className="btn-ghost" onClick={() => analyzeWithAI(s, activeTicker)} style={{ marginTop: 8, width: "100%", padding: "9px", textAlign: "center" }}>
                ↺ Reanalisar
              </button>
            )}
          </div>

          {/* Perfil info */}
          <div className="fade-up fade-up-d5" style={{ padding: "10px 14px", background: "var(--green-glow)", border: "1px solid var(--green)30", borderRadius: 8 }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--green)" }}>Perfil: </span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-2)" }}>{perfil} · {horizonte} prazo</span>
          </div>
        </div>
      </>
    );
  }

  return <GlobalStyle />;
}
