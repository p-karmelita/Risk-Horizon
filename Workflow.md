# Risk Horizon Workflow

Risk Horizon is a supplier risk intelligence workflow that turns live or mocked public web signals into a structured, source-backed disruption report.

The product is designed as a connected machine with distinct workflow stages. Each workflow below represents one part of the full system.

## 1. User Input Workflow

This workflow begins when the user provides a supplier name to analyze.

### Purpose

- capture the supplier the user wants to assess
- initiate the analysis pipeline
- support both live analysis and mock simulation

### Flow

1. The user opens the Risk Horizon app.
2. The user enters a supplier name in the input terminal.
3. The user can also select a predefined sample supplier:
   - TSMC
   - Maersk
   - Nvidia
   - CATL
   - Albemarle
4. The user chooses one of two actions:
   - `Analyze Supplier`
   - `Run Mock Simulation`

### Output

- a supplier name is passed into the system
- the workflow machine is activated

## 2. Query Generation Workflow

Once a supplier is selected, the system prepares search patterns designed to discover supplier disruption signals.

### Purpose

- convert a supplier name into web-searchable risk prompts
- broaden coverage across different disruption themes

### Current Query Logic

Risk Horizon currently generates queries such as:

- `{supplier} supply chain risk`
- `{supplier} disruption`
- `{supplier} latest news`
- `{supplier} logistics issue`
- `{supplier} factory shutdown`
- `{supplier} sanctions`
- `{supplier} regulatory issue`
- `{supplier} commodity risk`

### Output

- a list of supplier-specific search queries
- the first queries are used in the active search pipeline

## 3. Web Search Workflow

This workflow finds relevant public web pages related to supplier risk.

### Purpose

- search the public web for disruption signals
- collect candidate source URLs for later analysis

### Live Mode

If Bright Data is configured, the app:

1. Sends search queries through the Bright Data SERP API.
2. Receives normalized organic search results.
3. Collects titles, URLs, snippets, and publisher/source names.

### Mock Mode

If Bright Data is not configured, the app:

1. Loads predefined mock search results from the mock supplier fixtures.
2. Preserves the same frontend and backend workflow shape.

### Current Source Logic

- multiple queries are generated
- the current implementation uses up to `4` search queries
- results are deduplicated by URL
- up to `5` total search results are kept for the next stage

### Output

- a shortlist of relevant public web source candidates

## 4. Source Selection Workflow

This workflow narrows the search results into a compact evidence set for scraping and analysis.

### Purpose

- avoid overloading the analysis stage
- keep the MVP focused on the most relevant source candidates

### Current Logic

1. Search results are normalized.
2. Duplicate URLs are removed.
3. The system keeps the top `5` URLs.

### Output

- a final list of selected public source URLs

## 5. Web Scraping Workflow

This workflow retrieves readable source content from the selected URLs.

### Purpose

- extract usable text from public web pages
- gather evidence that the AI can analyze

### Live Mode

If Bright Data Web Unlocker is configured, the app:

1. Sends each selected URL to Bright Data.
2. Retrieves the unlocked page response.
3. Extracts the page title when available.
4. Strips HTML and normalizes page text.
5. Truncates the scraped text to a manageable size for analysis.

### Mock Mode

If Bright Data is unavailable or fails, the app:

1. Uses predefined mock scraped documents
2. Maintains the same report-generation structure

### Current Scraping Limits

- up to `5` selected URLs are scraped
- each scraped text body is cleaned and trimmed before analysis

### Output

- structured scraped documents with:
  - URL
  - title
  - publisher
  - source type
  - snippet
  - cleaned text

## 6. AI Analysis Workflow

This workflow turns gathered source evidence into a structured supplier risk assessment.

### Purpose

- identify disruption signals
- score risk severity
- classify risk types
- produce concise business recommendations

### Current Logic

The system packages the scraped source material into a structured LLM prompt containing:

- supplier name
- source titles
- URLs
- publishers
- source types
- snippets
- cleaned source content

The LLM is then asked to produce a strict JSON response with:

- supplier name
- generated timestamp
- risk level
- risk score
- confidence
- summary
- risk categories
- top signals
- recommendations
- sources used

### LLM Behavior

- if `OPENAI_API_KEY` exists, OpenAI is used
- if OpenAI is not configured but `ANTHROPIC_API_KEY` exists, Anthropic is used
- if neither is available, the app falls back to a mock report
- if live LLM calls fail, the app also falls back to mock output

### Output

- a structured supplier risk report JSON object

## 7. Report Generation Workflow

This workflow prepares the final intelligence output for the frontend.

### Purpose

- turn analysis output into a stable report structure
- keep report rendering consistent across live and mock modes

### Report Contents

The current report includes:

- Supplier Name
- Overall Risk Level
- Risk Score
- Confidence
- Summary
- Risk Categories
- Top Warning Signals
- Business Impact
- Recommended Actions
- Source Links

### Output

- a frontend-ready supplier risk report

## 8. Frontend Workflow Visualization

This workflow is how the user experiences the system in the UI.

### Purpose

- make the pipeline understandable at a glance
- visually reinforce the idea of a connected intelligence machine

### UI Machine Stages

The interface currently presents the process as:

1. User Input Terminal
2. Web Intelligence Engine
3. AI Analysis Core
4. Risk Report Output

### Visual Behaviors

- stages glow when active
- animated pipes connect stages
- pulses move through the machine
- activity logs update while the run progresses
- the final report surface appears when the workflow completes

### Output

- a premium visual narrative of the supplier-risk analysis process

## 9. Mock Simulation Workflow

This workflow is designed specifically for demos and presentations.

### Purpose

- provide a reliable full-funnel demo
- simulate the complete product experience without requiring live APIs

### Flow

1. The user clicks `Run Mock Simulation`.
2. The app generates supplier queries.
3. The app stages source discovery visually.
4. The app simulates scraping and signal extraction.
5. The AI analysis core displays progressive tasks.
6. The final mock report appears.

### Benefits

- stable for hackathon demos
- no external dependency required
- preserves the same product story as live mode

### Output

- a cinematic end-to-end mock run

## 10. Fallback Workflow

This workflow ensures the app remains usable even when live services are unavailable.

### Purpose

- avoid broken demo flows
- guarantee the app can still produce a report

### Current Fallback Rules

- if Bright Data env vars are missing, search and scraping use mock data
- if Bright Data live calls fail, the app falls back to mock search/scrape data
- if OpenAI and Anthropic keys are missing, analysis uses mock report data
- if live LLM calls fail, the app falls back to mock report output

### Output

- uninterrupted end-to-end report generation

## 11. Current Agentic Workflow

Risk Horizon currently behaves like a simple orchestrated agent workflow rather than a fully autonomous agent.

### Current Agentic Steps

1. generate supplier search queries
2. search the public web
3. select and deduplicate candidate URLs
4. scrape selected pages
5. compile source evidence
6. ask the LLM for a structured risk report

### What Makes It Agent-Like

- it uses a multi-step tool pipeline
- it transforms raw public signals into a decision-ready report
- it separates search, scrape, analysis, and reporting stages

### What Is Not Yet Implemented

- no replanning loop
- no dynamic decision to search more when evidence is weak
- no runtime tool-choice reasoning
- no memory across supplier runs
- no autonomous follow-up tasks

### Output

- a deterministic agent-style workflow suitable for MVP demos

## 12. End-to-End Summary Workflow

The complete Risk Horizon system currently follows this overall sequence:

1. User selects a supplier
2. System generates disruption-focused queries
3. Web search retrieves candidate sources
4. Top URLs are selected
5. Selected pages are scraped
6. Source text is analyzed by the LLM layer
7. A structured supplier risk report is generated
8. The UI visualizes the process as one connected machine

## Final Positioning

Risk Horizon is not a chatbot and not a stock-trading product.

It is a supplier risk intelligence workflow that helps companies detect disruption earlier by:

- scanning public web signals
- extracting source-backed evidence
- classifying supplier risk
- recommending practical business actions
