export type RiskLevel = "Low" | "Medium" | "High";
export type ConfidenceLevel = "Low" | "Medium" | "High";
export type SourceType =
  | "News"
  | "Supplier Website"
  | "Logistics Advisory"
  | "Regulatory Update"
  | "Market Commentary";

export interface SupplierRequest {
  supplierName: string;
  liveMode?: boolean;
}

export interface AgentPerformanceMetrics {
  stage: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  error?: string;
  details?: Record<string, any>;
}

export interface LiveModeContext {
  enabled: boolean;
  metrics: AgentPerformanceMetrics[];
  totalDuration: number;
  apiCallsCount: number;
  successRate: number;
}

// Workflow node ids used to highlight the active stage in the UI.
export type ProgressStage = "input" | "search" | "analysis" | "report";

// A single progress update emitted by the streaming analyze endpoint.
export interface ProgressUpdate {
  stage?: ProgressStage;
  status?: "active" | "done" | "error";
  message: string;
}

// Callback passed into the pipeline so each stage can stream live updates.
export type ProgressCallback = (update: ProgressUpdate) => void;

// One newline-delimited JSON event sent over the streaming response.
export type StreamEvent =
  | ({ type: "progress" } & ProgressUpdate)
  | { type: "sources"; sources: SearchResult[] }
  | { type: "report"; report: SupplierRiskReport; performance?: LiveModeContext }
  | { type: "error"; message: string };

export interface SourceReference {
  title: string;
  url: string;
  publisher: string;
  published_at: string;
  source_type?: SourceType;
}

export interface ScrapedDocument {
  url: string;
  title: string;
  sourceType: SourceType;
  snippet: string;
  content: string;
  publisher: string;
  publishedAt: string;
}

export interface RiskCategory {
  category: string;
  level: RiskLevel;
  score: number;
  reason: string;
}

export interface RiskSignal {
  id: string;
  title: string;
  category: string;
  severity: RiskLevel;
  summary: string;
  business_impact: string;
  recommended_action: string;
  sources: SourceReference[];
}

export interface SupplierRiskReport {
  supplier_name: string;
  generated_at: string;
  risk_level: RiskLevel;
  risk_score: number;
  confidence: ConfidenceLevel;
  summary: string;
  risk_categories: RiskCategory[];
  signals: RiskSignal[];
  recommendations: string[];
  sources_used: SourceReference[];
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  publisher: string;
  publishedAt: string;
  sourceType: SourceType;
}

export interface PipelineContext {
  supplierName: string;
  queries: string[];
  searchResults: SearchResult[];
  scrapedDocuments: ScrapedDocument[];
}
