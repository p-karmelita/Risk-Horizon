<div align="center">

# 🛰️ Risk Horizon

### **Know your supplier is in trouble — *before* the shipment doesn't show up.**

**Risk Horizon is an autonomous AI agent that scans the live web for early signs of supplier and supply-chain disruption, then turns the noise into a clear, source-backed risk brief — in seconds.**

🌐 Live web intelligence (Bright Data) · 🧠 Agentic reasoning (GPT-5-5) · ⚡ Real-time streaming UI

🏆 **Built for the [Bright Data AI Agents Web Data Hackathon](https://lablab.ai/ai-hackathons/brightdata-ai-agents-web-data-hackathon) on lablab.ai**

[Quick Start](#-quick-start-under-2-minutes) · [How It Works](#️-how-it-works) · [Demo](https://risk-horizon.replit.app/) · [Tech Stack](#️-tech-stack)

</div>

---

## 🏆 The Hackathon

Risk Horizon was built for the **Bright Data AI Agents Web Data Hackathon** (hosted on lablab.ai) — a challenge to build **AI agents that turn live web data into action**. It leans all the way into that brief:

- 🌐 **Bright Data is the engine, not a footnote** — the SERP API discovers sources and the Web Unlocker scrapes pages that block ordinary bots, giving the agent *real, fresh* ground truth.
- 🤖 **An agent, not a dashboard** — autonomous query planning → live retrieval → multi-step reasoning → an actionable, source-cited verdict.

> 📌 *Add your team, submission link, and any prize/track details here.*

---

## 🧩 The Problem

Supply chains break **quietly**. A fab gets sanctioned, a port strikes, a key material spikes, a factory floods — and the average procurement team finds out *weeks later*, when the PO is already late and the line is already down.

The signal exists. It's sitting in news articles, regulatory filings, logistics advisories, and supplier press pages **right now**. The problem isn't availability — it's that nobody has time to read the entire internet about every supplier, every day.

## 💡 The Solution (and why it's clever)

Type a supplier name. Hit analyze. Risk Horizon does the reading for you:

1. It **generates an investigative search plan** instead of one naive query.
2. It **pulls live results and unlocks real pages** through Bright Data — no stale cache, no scraper-blocking walls.
3. It hands the evidence to an **agentic LLM that reasons like a 20-year risk analyst** — assess data → extract signals → categorize risk → analyze impact → recommend actions.
4. It returns a **structured, source-cited risk report** you can actually act on — risk score, signals, business impact, and recommended mitigations.

> The clever part: **every claim is traceable to a real URL it scraped this minute**, and the entire agent pipeline **streams its thinking to your screen in real time** — so you watch the analysis happen instead of staring at a spinner. And if any live API hiccups mid-demo? It **gracefully falls back to curated fixtures** so the show never stops. 🎭

---

## ✨ Why It's Hackathon-Worthy

- 🤖 **True agentic AI, not a chatbot wrapper.** GPT-5-5 (via AIML) runs an explicit 5-step reasoning framework — **Data Assessment → Signal Extraction → Risk Categorization → Impact Analysis → Recommendation Generation** — and emits strict structured JSON.
- 🌐 **Real live web data via Bright Data.** SERP API for discovery + Web Unlocker for scraping pages that normally block bots. Real intelligence, not a demo dataset.
- ⚡ **Real-time streaming pipeline.** The backend streams **NDJSON progress events** stage-by-stage; the "Agent Activity Log" fills with *actual* events (`✓ "Maersk disruption" — 9 results`, `✓ Scraped reuters.com`) tied to real timing.
- 🛡️ **Bulletproof for demos.** Per-request timeouts, parallel fan-out, dedup, and automatic mock fallback mean a single dead URL or flaky key never crashes the run.
- 📊 **Built-in observability.** Every stage is timed; the UI shows duration, success rate, and live API-call counts.
- 🎛️ **Two-axis control.** Toggle **Mock ↔ Live** data and **Standard ↔ Agentic** AI independently — perfect for showing judges the before/after.

---

## 🏗️ How It Works

Risk Horizon is modeled as a **four-stage intelligence machine**. Data flows left → right, and each node lights up as it runs.

```
   ┌──────────────┐     ┌────────────────────┐     ┌───────────────────┐     ┌──────────────────┐
   │  🖥️  STAGE 1  │     │   🛰️  STAGE 2       │     │   🧠  STAGE 3      │     │  📑  STAGE 4      │
   │ User Input   │ ──▶ │ Web Intelligence   │ ──▶ │ AI Analysis Core  │ ──▶ │ Risk Report      │
   │  Terminal    │     │ Engine             │     │                   │     │ Output           │
   └──────────────┘     └────────────────────┘     └───────────────────┘     └──────────────────┘
   Supplier name        Bright Data SERP API        Standard or Agentic       Structured, cited
   → 8 smart queries    + Web Unlocker scrape        LLM reasoning             risk brief
                        (parallel · dedup · 15s      → strict JSON             (score, signals,
                         timeout · top-5 sources)     report                    recommendations)

        └───────────────── 🔴 streams NDJSON progress events the whole way ─────────────────┘
```

### The flow, in detail

| Stage | What happens | Powered by |
|------:|--------------|------------|
| **1 · Query Generation** | Expands a supplier name into **8 targeted investigative queries** (disruption, sanctions, logistics, factory shutdown, regulatory, commodity risk…). | `lib/prompts.ts` |
| **2 · Web Intelligence** | Runs the top queries in **parallel** through Bright Data **SERP API** (`brd_json=1` parsed results), dedups, then **unlocks & scrapes the top 5 source pages** via Web Unlocker. HTML → clean text. | `lib/brightdata.ts` |
| **3 · AI Analysis** | Feeds the scraped evidence to the LLM using either the **Standard** prompt or the **Agentic** multi-step reasoning prompt. Returns strict JSON. | `lib/llm.ts` |
| **4 · Risk Report** | Renders an analyst-grade brief: overall **risk level + score (0–100)**, **confidence**, categorized **signals** with business impact & recommended actions, and the **exact sources used**. | `components/RiskReportOutput.tsx` |

Everything is orchestrated by a single streaming endpoint — **`POST /api/analyze-supplier`** — which emits progress events as it goes:

```jsonc
{"type":"progress","stage":"search","message":"✓ \"Maersk disruption\" — 9 results"}
{"type":"progress","stage":"search","message":"✓ Scraped supplychaindigital.com"}
{"type":"sources","sources":[ ... ]}
{"type":"progress","stage":"analysis","message":"AI Analysis Core scoring risk signals…"}
{"type":"report","report":{ "risk_level":"High","risk_score":78, ... }}
```

---

## 🎬 Demo / Workflows

> 📸 **[Screenshot: Hero / command console]**
> *The full-screen "operations console" — animated four-stage workflow machine glowing against a dark grid, supplier input terminal on the left.*

### 🟢 Workflow 1 — Instant Mock Demo (0 setup, 0 cost)

Perfect for the first 30 seconds in front of judges.

1. `npm run dev` → open **http://localhost:3000**
2. Pick a supplier chip (**TSMC**, **Maersk**, **Nvidia**, **CATL**, **Albemarle**) — or type any name.
3. Hit **▶ Run Mock Simulation**.
4. Watch the workflow animate end-to-end and a full risk report render — **instantly, no API keys required.**

> 📸 **[GIF: Mock run]** *Workflow nodes lighting up sequentially, Agent Activity Log scrolling, final risk report fading in.*

### 🔴 Workflow 2 — Live Web Intelligence

The real magic. Requires Bright Data + an LLM key (see [Quick Start](#-quick-start-under-2-minutes)).

1. Flip the **MOCK → LIVE** toggle (it turns amber, "Bright Data Active" badge appears).
2. Enter a supplier, e.g. **`Maersk`**.
3. Hit **Analyze Live** and watch the **Agent Activity Log stream real events**:
   ```
   Searching the web with 4 queries…
   ✓ "Maersk disruption" — 9 results
   ✓ Scraped supplychaindigital.com
   ✗ Skipped example-blocked-site.com (unreachable)
   AI Analysis Core scoring risk signals…
   Risk assessed: High (78) — 3 signals
   ```
4. Read the **source-backed report** — every signal links to a page scraped seconds ago.

> 📸 **[GIF: Live run]** *Real-time log streaming during a ~30–60s live analysis, ending on a High-risk report with cited sources.*

### 🧠 Workflow 3 — Agentic vs. Standard

Show the depth difference.

1. Turn on the **STANDARD → AGENTIC** toggle (turns purple).
2. Run the same supplier in both modes.
3. Compare: **Agentic** mode runs a deeper multi-step reasoning chain (richer context window, explicit observe→infer→recommend), surfacing connected risks a single-pass model misses.

> 📸 **[Screenshot: Side-by-side report comparison]** *Standard report vs. Agentic report for the same supplier — note the deeper signal reasoning and recommendations.*

---

## ⚡ Quick Start (under 2 minutes)

```bash
# 1. Clone & install
git clone <your-repo-url> risk-horizon && cd risk-horizon
npm install

# 2. Run it (mock mode works out of the box — no keys needed!)
npm run dev
# → open http://localhost:3000 and hit "Run Mock Simulation" 🎉
```

### 🔑 Going Live (optional)

Want real web data? Copy the env skeleton and drop in your keys:

```bash
cp .env.example .env
```

```bash
# .env — fill in what you have. Missing keys → app stays in mock mode.

# 🌐 Bright Data (powers LIVE web search + scraping)
BRIGHT_DATA_API_KEY=your_token_here
BRIGHT_DATA_SERP_ZONE=serp_api1
BRIGHT_DATA_UNLOCKER_ZONE=web_unlocker1

# 🧠 LLM provider (pick ONE — priority: AIML › OpenAI › Anthropic)
AIML_API_KEY=your_aiml_key        # recommended → unlocks Agentic GPT-5-5
# OPENAI_API_KEY=your_openai_key   # uses gpt-4o-mini
# ANTHROPIC_API_KEY=your_key       # uses claude-3-5-sonnet
```

Restart, flip the **LIVE** toggle, and you're pulling real intelligence. 🛰️

> 💸 **Cost is tiny:** a full live analysis runs **~$0.02** (≈$0.004 SERP + ≈$0.015 Web Unlocker). ~100 analyses ≈ $2.

---

## 🛠️ Tech Stack

| Choice | Why we picked it |
|--------|------------------|
| **⚛️ Next.js 16 (App Router + Turbopack)** | One framework for the UI *and* the streaming API route. Turbopack = sub-300ms dev startup; route handlers make NDJSON streaming trivial. |
| **🔷 TypeScript** | The whole pipeline is typed end-to-end — `StreamEvent`, `SupplierRiskReport`, and friends keep the agent contract honest from API to UI. |
| **🎨 Tailwind CSS** | The dense "command-center" aesthetic would be unmaintainable in hand-rolled CSS. Tailwind makes the glassmorphism + glow system fast to iterate. |
| **🎬 Framer Motion** | Powers the living "machine" feel — pulsing nodes, glowing pipes, staged reveals — that makes the demo *pop*. |
| **🌐 Bright Data** | SERP API + Web Unlocker = reliable live search and the ability to scrape pages that block ordinary bots. This is what makes "live" actually live. |
| **🤖 AIML API (GPT-5-5)** | Drives the agentic reasoning mode with a large context window and strict JSON output — the brain of the operation. |
| **🪄 Lucide Icons** | Crisp, consistent iconography across every workflow node and status badge. |

**Zero heavyweight deps** — no ORM, no state library, no scraping SDK. The Bright Data integration is a lean `fetch` wrapper with lightweight HTML parsing, keeping the project fast and easy to read.

---

## 🗂️ Project Structure

```
risk-horizon/
├── app/
│   ├── page.tsx                      # 🎛️  The command console (consumes the live stream)
│   ├── icon.svg                      # 🛰️  Favicon
│   └── api/analyze-supplier/route.ts # 🔴  Streaming NDJSON pipeline endpoint
├── components/
│   ├── WorkflowMachine.tsx           # 🏭  The four-stage machine frame
│   ├── MachineStage.tsx              # 🔲  A single glowing workflow node
│   ├── GlowingPipe.tsx               # 🔗  Animated connectors between stages
│   ├── SupplierInput.tsx             # ⌨️  Input + Mock/Live & Standard/Agentic toggles
│   ├── AgentLog.tsx                  # 📜  Real-time activity log + performance metrics
│   ├── RiskReportOutput.tsx          # 📑  The final risk brief
│   ├── SignalCard.tsx                # 🚦  Individual risk signal card
│   └── StatusBadge.tsx               # 🏷️  Mode/status pills
├── lib/
│   ├── brightdata.ts                 # 🌐  SERP + Web Unlocker, timeouts, fallback, metrics
│   ├── llm.ts                        # 🧠  AIML / OpenAI / Anthropic providers
│   ├── prompts.ts                    # ✍️  Query generation + Standard/Agentic prompts
│   ├── performance.ts                # 📊  Per-stage timing & success tracking
│   ├── mockData.ts                   # 🎭  Curated fixtures (TSMC, Maersk, Nvidia, CATL, Albemarle)
│   └── types.ts                      # 🔷  Shared types & the streaming event contract
└── .env.example                      # 🔑  Env skeleton
```

---

## 📡 API Reference

**`POST /api/analyze-supplier`** → streams `application/x-ndjson`

```jsonc
// Request
{ "supplierName": "Maersk", "liveMode": true, "agenticMode": true }
```

Emits a sequence of `progress` / `sources` events, then a terminal `report` (or `error`) event. The final report shape:

```jsonc
{
  "supplier_name": "Maersk",
  "risk_level": "High",          // Low | Medium | High
  "risk_score": 78,              // 0–100
  "confidence": "High",
  "summary": "…",
  "risk_categories": [{ "category": "Logistics", "level": "High", "score": 82, "reason": "…" }],
  "signals": [{
    "title": "…", "category": "…", "severity": "High",
    "summary": "…", "business_impact": "…", "recommended_action": "…",
    "sources": [{ "title": "…", "url": "https://…", "publisher": "…", "published_at": "…" }]
  }],
  "recommendations": ["…"],
  "sources_used": [ /* every page that informed the verdict */ ]
}
```

---

## 🧰 Scripts

```bash
npm run dev     # 🚀 Dev server (Turbopack)
npm run build   # 📦 Production build
npm run start   # ▶️  Serve the production build
npm run lint    # 🧹 Lint
```

---

## 🗺️ Roadmap

- [ ] 📨 Alerting — push a Slack/email digest when a watched supplier crosses a risk threshold
- [ ] 🕒 Scheduled re-scans & historical risk trend charts
- [ ] 🔌 Caching layer for repeat lookups (lower cost, faster demos)
- [ ] 🧾 Export reports to PDF / shareable links
- [ ] 🌍 Multi-supplier portfolio dashboard

---

## 🤝 Contributing

PRs welcome — this is a hackathon project with room to grow! 🌱

1. 🍴 Fork the repo
2. 🌿 `git checkout -b feat/your-amazing-idea`
3. 💾 Commit your changes
4. 🚀 Open a PR with a clear description (screenshots/GIFs earn bonus points ✨)

Found a bug or have an idea? [Open an issue](../../issues).

---

<div align="center">

**Built with ☕, 🛰️ Bright Data, and 🤖 GPT-5-5 — at roughly 2am.**

⭐ *If Risk Horizon made you go "oh that's clever," drop a star.* ⭐

</div>
