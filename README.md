# Risk Horizon - Supplier Risk & Market Disruption Agent

Risk Horizon helps companies detect supplier and market disruption early by scanning live public web data and turning it into clear, source-backed risk insights.

This MVP is a one-page Next.js app with a futuristic command-center UI, animated workflow nodes, a simple backend pipeline, and automatic mock/live fallbacks for demo reliability.

## Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide icons

## Features

- One-page command-center experience with an animated left-to-right workflow
- Reusable UI components for workflow nodes, connectors, status badges, activity logs, and the final report
- Backend route at `POST /api/analyze-supplier`
- Mock mode by default when API keys are absent
- Live mode structure for:
  - Bright Data web search and page retrieval
  - OpenAI or Anthropic report synthesis
- Mock supplier datasets for:
  - TSMC
  - Maersk
  - Nvidia
  - CATL
  - Albemarle

## Project Structure

```text
app/
  api/analyze-supplier/route.ts
  layout.tsx
  page.tsx
components/
  AgentLog.tsx
  RiskReport.tsx
  SignalCard.tsx
  StatusBadge.tsx
  SupplierInput.tsx
  WorkflowConnector.tsx
  WorkflowNode.tsx
lib/
  brightdata.ts
  llm.ts
  mockData.ts
  prompts.ts
  types.ts
  utils.ts
styles/
  globals.css
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env.local` file in the project root if you want to enable live mode:

```bash
BRIGHT_DATA_API_KEY=
BRIGHT_DATA_SERP_ZONE=
BRIGHT_DATA_UNLOCKER_ZONE=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
```

## How Modes Work

### Mock mode

Used automatically when the Bright Data and LLM credentials are missing, invalid, or a live call fails. This keeps the demo fully working for hackathon presentations.

### Live mode

If valid credentials are available:

- Bright Data is used to fetch a live search result page and scrape selected URLs
- OpenAI or Anthropic is used to synthesize a structured risk report

If a live call fails at any point, the app falls back to mock data instead of breaking the user flow.

## API

### `POST /api/analyze-supplier`

Request:

```json
{
  "supplierName": "Maersk"
}
```

Response:

```json
{
  "supplier_name": "Maersk",
  "generated_at": "2026-05-26T18:30:00Z",
  "risk_level": "High",
  "risk_score": 78,
  "confidence": "High",
  "summary": "Recent public web signals suggest logistics disruption risk...",
  "risk_categories": [],
  "signals": [],
  "recommendations": [],
  "sources_used": []
}
```

## Notes

- The live Bright Data integration uses a generic HTTP request flow and lightweight HTML parsing so the MVP stays dependency-light.
- The OpenAI path uses a JSON-only chat completion request. Anthropic uses a JSON-only message request.
- This project is intentionally optimized for demo clarity, strong visuals, and resilience over exhaustive production hardening.
