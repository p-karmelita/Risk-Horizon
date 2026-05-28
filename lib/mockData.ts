import type {
  ScrapedDocument,
  SearchResult,
  SourceReference,
  SourceType,
  SupplierRiskReport
} from "@/lib/types";

type SupplierFixture = {
  searchResults: SearchResult[];
  scrapedDocuments: ScrapedDocument[];
  report: SupplierRiskReport;
};

function sourceTypeCycle(index: number): SourceType {
  const types: SourceType[] = [
    "News",
    "Supplier Website",
    "Logistics Advisory",
    "Regulatory Update",
    "Market Commentary"
  ];

  return types[index % types.length];
}

function buildGenericSearchResults(
  supplierName: string,
  theme: string,
  publisherPrefix: string
): SearchResult[] {
  return Array.from({ length: 5 }, (_, index) => ({
    title: `${supplierName}: ${theme} signal ${index + 1}`,
    url: `https://example.com/${supplierName.toLowerCase()}-${index + 1}`,
    snippet: `${supplierName} is seeing ${theme.toLowerCase()} developments that could affect production, logistics, or compliance planning.`,
    publisher: `${publisherPrefix} ${index + 1}`,
    publishedAt: `2026-05-${String(21 + index).padStart(2, "0")}`,
    sourceType: sourceTypeCycle(index)
  }));
}

function buildGenericScrapedDocuments(
  supplierName: string,
  theme: string,
  publisherPrefix: string
): ScrapedDocument[] {
  return buildGenericSearchResults(supplierName, theme, publisherPrefix).map(
    (result, index) => ({
      url: result.url,
      title: result.title,
      sourceType: result.sourceType,
      snippet: result.snippet,
      content: `${result.title}. Reports point to ${theme.toLowerCase()} pressures around ${supplierName}, including operational constraints, cross-border frictions, lead-time concerns, and customer planning impacts. Teams are monitoring whether these signals intensify over the next 30 to 60 days.`,
      publisher: result.publisher,
      publishedAt: result.publishedAt
    })
  );
}

function buildSourceReferences(
  supplierName: string,
  theme: string,
  publisherPrefix: string
): SourceReference[] {
  return buildGenericSearchResults(supplierName, theme, publisherPrefix).map(
    (result) => ({
      title: result.title,
      url: result.url,
      publisher: result.publisher,
      published_at: result.publishedAt,
      source_type: result.sourceType
    })
  );
}

export const mockSupplierData: Record<string, SupplierFixture> = {
  tsmc: {
    searchResults: buildGenericSearchResults("TSMC", "capacity and geopolitical", "Semiconductor Wire"),
    scrapedDocuments: buildGenericScrapedDocuments("TSMC", "capacity and geopolitical", "Semiconductor Wire"),
    report: {
      supplier_name: "TSMC",
      generated_at: "2026-05-26T18:30:00Z",
      risk_level: "Medium",
      risk_score: 64,
      confidence: "High",
      summary:
        "Public signals indicate manageable but material supply risk driven by advanced-node capacity tightness, geopolitical exposure, and long lead-time pressure for strategic chips.",
      risk_categories: [
        {
          category: "Capacity",
          level: "High",
          score: 76,
          reason: "Advanced-node demand remains elevated, creating allocation pressure for priority customers."
        },
        {
          category: "Geopolitical",
          level: "Medium",
          score: 62,
          reason: "Cross-strait tensions continue to shape continuity planning and customer concentration risk."
        }
      ],
      signals: [
        {
          id: "sig_tsmc_001",
          title: "Advanced-node allocation pressure remains elevated",
          category: "Capacity",
          severity: "High",
          summary: "Industry coverage points to continued queueing for leading-edge production slots.",
          business_impact: "Program timelines for semiconductor-dependent products may slip if allocations tighten further.",
          recommended_action: "Confirm allocation windows, review buffer inventory, and identify second-source options for non-leading-edge components.",
          sources: [
            {
              title: "TSMC: capacity and geopolitical signal 1",
              url: "https://example.com/tsmc-1",
              publisher: "Semiconductor Wire 1",
              published_at: "2026-05-21"
            }
          ]
        }
      ],
      recommendations: [
        "Validate capacity commitments for the next two quarters.",
        "Increase executive monitoring of geopolitical continuity scenarios.",
        "Review product BOM flexibility where alternate nodes are viable."
      ],
      sources_used: buildSourceReferences("TSMC", "capacity and geopolitical", "Semiconductor Wire")
    }
  },
  maersk: {
    searchResults: buildGenericSearchResults("Maersk", "port congestion and route volatility", "Global Freight Monitor"),
    scrapedDocuments: buildGenericScrapedDocuments("Maersk", "port congestion and route volatility", "Global Freight Monitor"),
    report: {
      supplier_name: "Maersk",
      generated_at: "2026-05-26T18:30:00Z",
      risk_level: "High",
      risk_score: 78,
      confidence: "High",
      summary:
        "Recent public web signals suggest logistics disruption risk, including route volatility, congestion, and operational delays that may affect shipment timing and landed cost.",
      risk_categories: [
        {
          category: "Logistics",
          level: "High",
          score: 82,
          reason: "Multiple logistics sources point to congestion and delay pressure on major trade lanes."
        },
        {
          category: "Regulatory",
          level: "Medium",
          score: 55,
          reason: "Trade and customs updates could alter route planning and lead times."
        }
      ],
      signals: [
        {
          id: "sig_maersk_001",
          title: "Port congestion affecting major routes",
          category: "Logistics",
          severity: "High",
          summary: "Recent reports mention congestion, schedule slippage, and transshipment delay risk.",
          business_impact: "Shipments may be delayed, inventory turns may slow, and freight costs may rise.",
          recommended_action: "Prepare backup logistics plans and review time-sensitive shipments.",
          sources: [
            {
              title: "Maersk: port congestion and route volatility signal 1",
              url: "https://example.com/maersk-1",
              publisher: "Global Freight Monitor 1",
              published_at: "2026-05-21"
            }
          ]
        }
      ],
      recommendations: [
        "Contact the supplier for updated timeline assumptions.",
        "Stand up alternate route planning for critical lanes.",
        "Increase safety stock for time-sensitive inventory."
      ],
      sources_used: buildSourceReferences("Maersk", "port congestion and route volatility", "Global Freight Monitor")
    }
  },
  nvidia: {
    searchResults: buildGenericSearchResults("Nvidia", "AI demand and export control", "Compute Markets Daily"),
    scrapedDocuments: buildGenericScrapedDocuments("Nvidia", "AI demand and export control", "Compute Markets Daily"),
    report: {
      supplier_name: "Nvidia",
      generated_at: "2026-05-26T18:30:00Z",
      risk_level: "Medium",
      risk_score: 67,
      confidence: "Medium",
      summary:
        "Signals point to moderate disruption risk from sustained AI demand, supply concentration, and export-control complexity affecting planning certainty.",
      risk_categories: [
        {
          category: "Demand Shock",
          level: "High",
          score: 79,
          reason: "AI infrastructure demand may keep high-end hardware allocations constrained."
        },
        {
          category: "Regulatory",
          level: "Medium",
          score: 58,
          reason: "Export and trade controls may shape customer segmentation and product availability."
        }
      ],
      signals: [
        {
          id: "sig_nvda_001",
          title: "Allocation pressure for high-performance compute",
          category: "Demand Shock",
          severity: "High",
          summary: "Coverage indicates strong enterprise demand and limited short-term elasticity.",
          business_impact: "Hardware-dependent projects may face delivery uncertainty and pricing pressure.",
          recommended_action: "Confirm supply reservations early and reprioritize non-critical deployment schedules.",
          sources: [
            {
              title: "Nvidia: AI demand and export control signal 1",
              url: "https://example.com/nvidia-1",
              publisher: "Compute Markets Daily 1",
              published_at: "2026-05-21"
            }
          ]
        }
      ],
      recommendations: [
        "Secure demand forecasts with longer planning windows.",
        "Review region-specific regulatory exposure.",
        "Sequence infrastructure programs by business criticality."
      ],
      sources_used: buildSourceReferences("Nvidia", "AI demand and export control", "Compute Markets Daily")
    }
  },
  catl: {
    searchResults: buildGenericSearchResults("CATL", "battery materials and trade policy", "Energy Storage Brief"),
    scrapedDocuments: buildGenericScrapedDocuments("CATL", "battery materials and trade policy", "Energy Storage Brief"),
    report: {
      supplier_name: "CATL",
      generated_at: "2026-05-26T18:30:00Z",
      risk_level: "Medium",
      risk_score: 61,
      confidence: "Medium",
      summary:
        "Battery supply signals show moderate risk from materials pricing, industrial policy shifts, and concentration in strategic energy storage supply chains.",
      risk_categories: [
        {
          category: "Commodity",
          level: "Medium",
          score: 63,
          reason: "Input material price volatility may affect cost predictability."
        },
        {
          category: "Trade Policy",
          level: "Medium",
          score: 60,
          reason: "Policy and tariff developments can influence sourcing strategies and qualification timelines."
        }
      ],
      signals: [
        {
          id: "sig_catl_001",
          title: "Battery materials volatility raises planning noise",
          category: "Commodity",
          severity: "Medium",
          summary: "Public commentary suggests materials pricing remains uneven across key battery inputs.",
          business_impact: "Procurement teams may face margin pressure and repricing risk on long-term programs.",
          recommended_action: "Model revised cost scenarios and refresh supplier escalation triggers.",
          sources: [
            {
              title: "CATL: battery materials and trade policy signal 1",
              url: "https://example.com/catl-1",
              publisher: "Energy Storage Brief 1",
              published_at: "2026-05-21"
            }
          ]
        }
      ],
      recommendations: [
        "Revisit battery cost assumptions for active programs.",
        "Map exposure to policy-sensitive import pathways.",
        "Increase monitoring for raw-material and tariff announcements."
      ],
      sources_used: buildSourceReferences("CATL", "battery materials and trade policy", "Energy Storage Brief")
    }
  },
  albemarle: {
    searchResults: buildGenericSearchResults("Albemarle", "lithium pricing and permitting", "Critical Minerals Report"),
    scrapedDocuments: buildGenericScrapedDocuments("Albemarle", "lithium pricing and permitting", "Critical Minerals Report"),
    report: {
      supplier_name: "Albemarle",
      generated_at: "2026-05-26T18:30:00Z",
      risk_level: "Medium",
      risk_score: 58,
      confidence: "Medium",
      summary:
        "Current disruption indicators are moderate, centered on lithium market swings, permitting cadence, and downstream battery demand uncertainty.",
      risk_categories: [
        {
          category: "Commodity",
          level: "Medium",
          score: 66,
          reason: "Lithium pricing remains volatile enough to affect budget and contract assumptions."
        },
        {
          category: "Operational",
          level: "Low",
          score: 45,
          reason: "No major shutdown signals appear, but project timing remains important for future supply."
        }
      ],
      signals: [
        {
          id: "sig_alb_001",
          title: "Lithium market volatility complicates procurement planning",
          category: "Commodity",
          severity: "Medium",
          summary: "Market coverage shows pricing variability and mixed demand expectations.",
          business_impact: "Buyers may need to adjust contract structures and working capital assumptions.",
          recommended_action: "Refresh pricing bands and align inventory policy to downside and upside demand cases.",
          sources: [
            {
              title: "Albemarle: lithium pricing and permitting signal 1",
              url: "https://example.com/albemarle-1",
              publisher: "Critical Minerals Report 1",
              published_at: "2026-05-21"
            }
          ]
        }
      ],
      recommendations: [
        "Re-baseline cost assumptions for lithium-linked inputs.",
        "Track permitting and project update milestones monthly.",
        "Build alternate sourcing triggers for rapid market swings."
      ],
      sources_used: buildSourceReferences("Albemarle", "lithium pricing and permitting", "Critical Minerals Report")
    }
  }
};

export function getMockSupplierFixture(supplierName: string): SupplierFixture {
  const key = supplierName.trim().toLowerCase();
  return (
    mockSupplierData[key] ??
    {
      searchResults: buildGenericSearchResults(supplierName, "supply chain and market", "Open Source Monitor"),
      scrapedDocuments: buildGenericScrapedDocuments(supplierName, "supply chain and market", "Open Source Monitor"),
      report: {
        supplier_name: supplierName,
        generated_at: new Date().toISOString(),
        risk_level: "Medium",
        risk_score: 57,
        confidence: "Medium",
        summary:
          "The current mock intelligence scan shows a mixed disruption picture with some logistics, regulatory, and market uncertainty worth monitoring.",
        risk_categories: [
          {
            category: "Logistics",
            level: "Medium",
            score: 59,
            reason: "Open-source signals suggest moderate transit and fulfillment variability."
          },
          {
            category: "Market",
            level: "Medium",
            score: 55,
            reason: "Market commentary indicates soft but notable planning uncertainty."
          }
        ],
        signals: [
          {
            id: "sig_generic_001",
            title: "Mixed disruption signals detected across public sources",
            category: "Market",
            severity: "Medium",
            summary: "A small set of open-source references indicate emerging but not yet severe operational noise.",
            business_impact: "Supply planning may require extra monitoring and contingency alignment.",
            recommended_action: "Validate near-term supplier commitments and maintain alternate sourcing readiness.",
            sources: [
              {
                title: `${supplierName}: supply chain and market signal 1`,
                url: `https://example.com/${supplierName.toLowerCase()}-1`,
                publisher: "Open Source Monitor 1",
                published_at: "2026-05-21"
              }
            ]
          }
        ],
        recommendations: [
          "Schedule a supplier status check for the next 30 days.",
          "Review contingency plans for critical inbound materials.",
          "Continue monitoring public disruption indicators weekly."
        ],
        sources_used: buildSourceReferences(supplierName, "supply chain and market", "Open Source Monitor")
      }
    }
  );
}
