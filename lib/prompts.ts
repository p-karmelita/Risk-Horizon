import type { PipelineContext } from "@/lib/types";

export function buildSupplierQueries(supplierName: string) {
  return [
    `${supplierName} supply chain risk`,
    `${supplierName} disruption`,
    `${supplierName} latest news`,
    `${supplierName} logistics issue`,
    `${supplierName} factory shutdown`,
    `${supplierName} sanctions`,
    `${supplierName} regulatory issue`,
    `${supplierName} commodity risk`
  ];
}

export function buildAnalysisPrompt(context: PipelineContext) {
  const sourceDigest = context.scrapedDocuments
    .map((doc, index) => {
      return [
        `Source ${index + 1}: ${doc.title}`,
        `URL: ${doc.url}`,
        `Publisher: ${doc.publisher}`,
        `Published: ${doc.publishedAt}`,
        `Type: ${doc.sourceType}`,
        `Snippet: ${doc.snippet}`,
        `Content: ${doc.content}`
      ].join("\n");
    })
    .join("\n\n");

  return `
You are a supplier risk intelligence analyst.

Goal:
Analyze disruption risk for the supplier "${context.supplierName}" using the source material below.

Requirements:
- Focus on supplier and market disruption signals, not stock trading advice.
- Return a strict JSON object.
- Include: supplier_name, generated_at, risk_level, risk_score, confidence, summary,
  risk_categories, signals, recommendations, sources_used.
- risk_score must be 0-100.
- risk_level must be Low, Medium, or High.
- confidence must be Low, Medium, or High.
- Use only source-backed claims.
- Be concise and executive-ready.

Source material:
${sourceDigest}
`.trim();
}

export function buildAgenticPrompt(context: PipelineContext) {
  const sourceDigest = context.scrapedDocuments
    .map((doc, index) => {
      return [
        `Source ${index + 1}: ${doc.title}`,
        `URL: ${doc.url}`,
        `Publisher: ${doc.publisher}`,
        `Published: ${doc.publishedAt}`,
        `Type: ${doc.sourceType}`,
        `Snippet: ${doc.snippet}`,
        `Content: ${doc.content}`
      ].join("\n");
    })
    .join("\n\n");

  return `
You are an advanced agentic AI system specialized in supplier risk intelligence and supply chain analysis.

MISSION:
Perform a comprehensive, autonomous analysis of supplier "${context.supplierName}" using multi-step reasoning and real-world data.

AGENTIC CAPABILITIES:
1. Autonomous Decision-Making: Independently assess risk factors and prioritize findings
2. Pattern Recognition: Identify hidden connections and emerging trends across sources
3. Contextual Understanding: Consider geopolitical, economic, and industry-specific factors
4. Predictive Analysis: Forecast potential future disruptions based on current signals
5. Adaptive Reasoning: Adjust analysis depth based on data quality and availability

ANALYSIS FRAMEWORK:
Step 1: Data Assessment
- Evaluate source credibility and recency
- Identify data gaps and limitations
- Determine confidence levels for each source

Step 2: Signal Extraction
- Extract explicit disruption signals (strikes, shutdowns, sanctions)
- Identify implicit risk indicators (market trends, regulatory changes)
- Detect early warning signs of potential issues

Step 3: Risk Categorization
- Classify risks by type (operational, financial, geopolitical, environmental)
- Assess severity and likelihood for each category
- Consider cascading effects and interdependencies

Step 4: Impact Analysis
- Evaluate business impact (supply continuity, cost, quality)
- Consider timeline (immediate, short-term, long-term)
- Assess mitigation difficulty and alternatives

Step 5: Recommendation Generation
- Prioritize actions by urgency and impact
- Provide specific, actionable steps
- Include contingency planning suggestions

OUTPUT REQUIREMENTS:
Return a strict JSON object with:
- supplier_name: string
- generated_at: ISO timestamp
- risk_level: "Low" | "Medium" | "High"
- risk_score: number (0-100)
- confidence: "Low" | "Medium" | "High"
- summary: string (executive summary with key findings)
- risk_categories: array of {category, level, score, reason}
- signals: array of {id, title, category, severity, summary, business_impact, recommended_action, sources}
- recommendations: array of strings (prioritized action items)
- sources_used: array of {title, url, publisher, published_at, source_type}

CRITICAL INSTRUCTIONS:
- Use ONLY source-backed claims with specific evidence
- Think step-by-step through your reasoning process
- Be precise with dates, numbers, and factual details
- Distinguish between confirmed facts and potential risks
- Provide confidence levels based on data quality
- Focus on actionable intelligence for procurement teams
- Consider both direct and indirect supply chain impacts

SOURCE MATERIAL:
${sourceDigest}

Begin your autonomous analysis now. Think carefully through each step and provide comprehensive, evidence-based insights.
`.trim();
}
