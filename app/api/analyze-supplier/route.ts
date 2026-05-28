import { NextResponse } from "next/server";
import { buildSupplierQueries } from "@/lib/prompts";
import { analyzeSupplierRisk } from "@/lib/llm";
import { scrapeSupplierSources, searchSupplierWeb } from "@/lib/brightdata";
import type { SupplierRequest } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<SupplierRequest>;
    const supplierName = body.supplierName?.trim();

    if (!supplierName) {
      return NextResponse.json(
        { error: "supplierName is required." },
        { status: 400 }
      );
    }

    const queries = buildSupplierQueries(supplierName);
    const searchResults = await searchSupplierWeb(supplierName, queries);
    const selectedResults = searchResults.slice(0, 5);
    const scrapedDocuments = await scrapeSupplierSources(
      supplierName,
      selectedResults
    );
    const report = await analyzeSupplierRisk({
      supplierName,
      queries,
      searchResults: selectedResults,
      scrapedDocuments
    });

    return NextResponse.json(report, { status: 200 });
  } catch (error) {
    console.error("Analyze supplier error", error);

    return NextResponse.json(
      {
        error:
          "The supplier analysis agent could not complete the request. Please try again."
      },
      { status: 500 }
    );
  }
}
