import { buildAnalysisPrompt } from "@/lib/prompts";
import { getMockSupplierFixture } from "@/lib/mockData";
import type { PipelineContext, SupplierRiskReport } from "@/lib/types";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

function llmConfigured() {
  return Boolean(OPENAI_API_KEY || ANTHROPIC_API_KEY);
}

function normalizeReport(
  supplierName: string,
  report: Partial<SupplierRiskReport>,
  fallback: SupplierRiskReport
): SupplierRiskReport {
  return {
    supplier_name: report.supplier_name ?? supplierName,
    generated_at: report.generated_at ?? new Date().toISOString(),
    risk_level: report.risk_level ?? fallback.risk_level,
    risk_score: report.risk_score ?? fallback.risk_score,
    confidence: report.confidence ?? fallback.confidence,
    summary: report.summary ?? fallback.summary,
    risk_categories: report.risk_categories ?? fallback.risk_categories,
    signals: report.signals ?? fallback.signals,
    recommendations: report.recommendations ?? fallback.recommendations,
    sources_used: report.sources_used ?? fallback.sources_used
  };
}

async function analyzeWithOpenAI(
  supplierName: string,
  prompt: string,
  fallback: SupplierRiskReport
) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a supplier risk intelligence analyst. Always return strict JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  const parsed = JSON.parse(content ?? "{}") as Partial<SupplierRiskReport>;
  return normalizeReport(supplierName, parsed, fallback);
}

async function analyzeWithAnthropic(
  supplierName: string,
  prompt: string,
  fallback: SupplierRiskReport
) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY as string,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-latest",
      max_tokens: 1600,
      temperature: 0.2,
      system:
        "You are a supplier risk intelligence analyst. Return strict JSON only.",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Anthropic request failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.content?.[0]?.text;
  const parsed = JSON.parse(content ?? "{}") as Partial<SupplierRiskReport>;
  return normalizeReport(supplierName, parsed, fallback);
}

export async function analyzeSupplierRisk(
  context: PipelineContext
): Promise<SupplierRiskReport> {
  const fallback = getMockSupplierFixture(context.supplierName).report;

  if (!llmConfigured()) {
    return {
      ...fallback,
      generated_at: new Date().toISOString()
    };
  }

  const prompt = buildAnalysisPrompt(context);

  try {
    if (OPENAI_API_KEY) {
      return await analyzeWithOpenAI(context.supplierName, prompt, fallback);
    }

    if (ANTHROPIC_API_KEY) {
      return await analyzeWithAnthropic(context.supplierName, prompt, fallback);
    }
  } catch (error) {
    console.warn("Falling back to mock LLM response.", error);
  }

  return {
    ...fallback,
    generated_at: new Date().toISOString()
  };
}
