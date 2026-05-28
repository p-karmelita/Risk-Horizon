import { buildAnalysisPrompt, buildAgenticPrompt } from "@/lib/prompts";
import { getMockSupplierFixture } from "@/lib/mockData";
import type { PipelineContext, SupplierRiskReport, AgentPerformanceMetrics } from "@/lib/types";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const AIML_API_KEY = process.env.AIML_API_KEY;
const AIML_API_URL = process.env.AIML_API_URL || "https://api.aimlapi.com/v1/chat/completions";

function llmConfigured() {
  return Boolean(OPENAI_API_KEY || ANTHROPIC_API_KEY || AIML_API_KEY);
}

function getPreferredProvider(): "aiml" | "openai" | "anthropic" | null {
  if (AIML_API_KEY) return "aiml";
  if (OPENAI_API_KEY) return "openai";
  if (ANTHROPIC_API_KEY) return "anthropic";
  return null;
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

async function analyzeWithAIML(
  supplierName: string,
  prompt: string,
  fallback: SupplierRiskReport,
  agenticMode = false
): Promise<SupplierRiskReport> {
  const startTime = Date.now();
  
  console.log(`\n🤖 Using AIML API (GPT-5-5) - ${agenticMode ? "Agentic Mode" : "Standard Mode"}`);
  
  const response = await fetch(AIML_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${AIML_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "openai/gpt-5-5",
      temperature: agenticMode ? 0.3 : 0.2,
      max_tokens: agenticMode ? 4000 : 2000,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: agenticMode
            ? "You are an advanced agentic AI system specialized in supplier risk intelligence. You autonomously analyze data, identify patterns, make informed decisions, and provide actionable insights. Think step-by-step and reason through complex scenarios. Always return strict JSON only."
            : "You are a supplier risk intelligence analyst. Always return strict JSON only."
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
    const errorText = await response.text().catch(() => "");
    throw new Error(`AIML API request failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error("AIML API returned empty response");
  }

  const duration = Date.now() - startTime;
  console.log(`✓ AIML API response received (${duration}ms)`);
  console.log(`  Model: openai/gpt-5-5`);
  console.log(`  Tokens: ${data.usage?.total_tokens || "N/A"}`);

  const parsed = JSON.parse(content) as Partial<SupplierRiskReport>;
  return normalizeReport(supplierName, parsed, fallback);
}

export async function analyzeSupplierRisk(
  context: PipelineContext,
  agenticMode = false
): Promise<SupplierRiskReport> {
  const fallback = getMockSupplierFixture(context.supplierName).report;

  if (!llmConfigured()) {
    console.log("⚠️  No LLM API configured, using mock data");
    return {
      ...fallback,
      generated_at: new Date().toISOString()
    };
  }

  const provider = getPreferredProvider();
  const prompt = agenticMode
    ? buildAgenticPrompt(context)
    : buildAnalysisPrompt(context);

  console.log(`\n${"=".repeat(60)}`);
  console.log(`🧠 LLM Analysis Starting`);
  console.log(`   Provider: ${provider?.toUpperCase()}`);
  console.log(`   Mode: ${agenticMode ? "Agentic AI" : "Standard"}`);
  console.log(`   Supplier: ${context.supplierName}`);
  console.log(`   Sources: ${context.scrapedDocuments.length}`);
  console.log(`${"=".repeat(60)}\n`);

  try {
    let result: SupplierRiskReport;

    switch (provider) {
      case "aiml":
        result = await analyzeWithAIML(context.supplierName, prompt, fallback, agenticMode);
        break;
      case "openai":
        result = await analyzeWithOpenAI(context.supplierName, prompt, fallback);
        break;
      case "anthropic":
        result = await analyzeWithAnthropic(context.supplierName, prompt, fallback);
        break;
      default:
        throw new Error("No LLM provider available");
    }

    console.log(`\n✅ Analysis Complete`);
    console.log(`   Risk Level: ${result.risk_level}`);
    console.log(`   Risk Score: ${result.risk_score}`);
    console.log(`   Signals: ${result.signals.length}`);
    console.log(`   Confidence: ${result.confidence}\n`);

    return result;
  } catch (error) {
    console.error(`\n❌ LLM Analysis Failed:`, error);
    console.warn("Falling back to mock LLM response.\n");
    
    return {
      ...fallback,
      generated_at: new Date().toISOString()
    };
  }
}

// Agentic AI function for autonomous multi-step analysis
export async function agenticAnalysis(
  context: PipelineContext,
  taskDescription: string
): Promise<any> {
  if (!AIML_API_KEY) {
    throw new Error("AIML API key required for agentic analysis");
  }

  console.log(`\n🤖 Agentic AI Task: ${taskDescription}`);
  
  const response = await fetch(AIML_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${AIML_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "openai/gpt-5-5",
      temperature: 0.3,
      max_tokens: 4000,
      messages: [
        {
          role: "system",
          content: `You are an advanced agentic AI system. You can:
- Autonomously break down complex tasks into steps
- Analyze data and identify patterns
- Make informed decisions based on evidence
- Provide detailed reasoning for your conclusions
- Adapt your approach based on the data available

Always think step-by-step and explain your reasoning.`
        },
        {
          role: "user",
          content: `Task: ${taskDescription}

Context:
- Supplier: ${context.supplierName}
- Available Sources: ${context.scrapedDocuments.length}
- Search Queries Used: ${context.queries.join(", ")}

Source Data:
${context.scrapedDocuments.map((doc, i) => `
Source ${i + 1}: ${doc.title}
Publisher: ${doc.publisher}
Date: ${doc.publishedAt}
Content: ${doc.content.slice(0, 1000)}...
`).join("\n")}

Please analyze this data and complete the task autonomously.`
        }
      ]
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Agentic AI request failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  console.log(`✓ Agentic AI completed task`);
  console.log(`  Tokens used: ${data.usage?.total_tokens || "N/A"}\n`);
  
  return content;
}
