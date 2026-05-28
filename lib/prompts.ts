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
