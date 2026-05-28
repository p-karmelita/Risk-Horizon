# Agentic AI Guide - GPT-5-5 Integration

## Overview
Risk Horizon now features advanced agentic AI capabilities powered by GPT-5-5 through the AIML API. This enables autonomous, multi-step reasoning and intelligent decision-making for supplier risk analysis.

## What is Agentic AI?

Agentic AI refers to AI systems that can:
- **Autonomously break down complex tasks** into manageable steps
- **Make informed decisions** based on available data
- **Adapt their approach** based on context and data quality
- **Reason through problems** step-by-step
- **Identify patterns** that standard analysis might miss
- **Provide detailed explanations** for their conclusions

## Standard AI vs Agentic AI

### Standard AI Mode
- Uses predefined analysis templates
- Follows fixed reasoning patterns
- Faster processing (~2-3 seconds)
- Good for routine supplier checks
- Lower token usage (~500-1000 tokens)

### Agentic AI Mode (GPT-5-5)
- Autonomous multi-step reasoning
- Adaptive analysis based on data quality
- Deeper pattern recognition
- Advanced predictive capabilities
- More comprehensive insights
- Higher token usage (~2000-4000 tokens)
- Slightly longer processing (~3-5 seconds)

## Configuration

### 1. Get AIML API Key
Sign up at [AIML API](https://aimlapi.com) and obtain your API key.

### 2. Configure Environment
Add to your `.env` file:

```bash
AIML_API_KEY=your_aiml_api_key_here
AIML_API_URL=https://api.aimlapi.com/v1/chat/completions
```

### 3. Verify Configuration
The system will automatically detect and use AIML API if configured. Priority order:
1. AIML API (GPT-5-5) - Recommended for agentic mode
2. OpenAI API
3. Anthropic API

## Using Agentic Mode

### In the UI

1. **Enable Agentic Mode**
   - Locate the "AI" toggle in the Supplier Input section
   - Switch from "Standard" to "Agentic (GPT-5-5)"
   - The toggle will turn purple when active
   - You'll see "Autonomous AI" badge

2. **Combine with Live Mode**
   - Enable both Live Mode (for real data) and Agentic Mode (for advanced AI)
   - This provides the most comprehensive analysis
   - Real-time data + autonomous reasoning = best results

3. **Run Analysis**
   - Click "🤖 Agentic Analysis" button (purple colored)
   - The system will perform multi-step autonomous analysis
   - Monitor progress in Agent Activity Log

### Analysis Framework

The agentic AI follows a structured 5-step framework:

#### Step 1: Data Assessment
- Evaluates source credibility and recency
- Identifies data gaps and limitations
- Determines confidence levels for each source

#### Step 2: Signal Extraction
- Extracts explicit disruption signals (strikes, shutdowns, sanctions)
- Identifies implicit risk indicators (market trends, regulatory changes)
- Detects early warning signs of potential issues

#### Step 3: Risk Categorization
- Classifies risks by type (operational, financial, geopolitical, environmental)
- Assesses severity and likelihood for each category
- Considers cascading effects and interdependencies

#### Step 4: Impact Analysis
- Evaluates business impact (supply continuity, cost, quality)
- Considers timeline (immediate, short-term, long-term)
- Assesses mitigation difficulty and alternatives

#### Step 5: Recommendation Generation
- Prioritizes actions by urgency and impact
- Provides specific, actionable steps
- Includes contingency planning suggestions

## Agentic Capabilities

### 1. Autonomous Decision-Making
The AI independently assesses risk factors and prioritizes findings without predefined rules.

**Example:**
```
Standard AI: "Supplier has production delays"
Agentic AI: "Supplier experiencing 3-week production delays due to 
equipment failure. Given their 40% market share and lack of immediate 
alternatives, this poses HIGH risk. Recommend immediate contact with 
secondary suppliers and inventory buffer increase."
```

### 2. Pattern Recognition
Identifies hidden connections and emerging trends across multiple sources.

**Example:**
```
Agentic AI might connect:
- Supplier's factory location
- Recent regional weather patterns
- Historical seasonal disruptions
- Current geopolitical tensions
→ Predicts potential Q4 supply chain issues
```

### 3. Contextual Understanding
Considers geopolitical, economic, and industry-specific factors.

**Example:**
```
Agentic AI analyzes:
- Semiconductor supplier in Taiwan
- Recent geopolitical tensions
- Industry consolidation trends
- Alternative supplier capacity
→ Provides nuanced risk assessment with regional context
```

### 4. Predictive Analysis
Forecasts potential future disruptions based on current signals.

**Example:**
```
Current Signal: "Supplier announced capacity expansion"
Agentic Prediction: "Expansion may cause temporary 15-20% capacity 
reduction during Q2 transition. Historical data shows similar expansions 
take 8-12 weeks. Recommend securing alternative capacity for this period."
```

### 5. Adaptive Reasoning
Adjusts analysis depth based on data quality and availability.

**Example:**
```
High-quality data: Deep analysis with specific recommendations
Limited data: Focuses on available signals, flags data gaps, 
suggests additional research areas
```

## Advanced Features

### Multi-Step Reasoning
The agentic AI breaks down complex problems:

```
Task: Assess supplier risk for TSMC

Step 1: Analyze current operational status
Step 2: Evaluate geopolitical factors
Step 3: Assess market position and alternatives
Step 4: Consider supply chain dependencies
Step 5: Synthesize findings into actionable intelligence
```

### Confidence Scoring
Provides transparency about analysis certainty:

- **High Confidence**: Multiple recent, credible sources confirm findings
- **Medium Confidence**: Some sources available, minor gaps in data
- **Low Confidence**: Limited or outdated information, significant uncertainty

### Source-Backed Claims
Every finding is tied to specific sources:

```json
{
  "signal": "Production capacity reduced by 30%",
  "sources": [
    {
      "title": "TSMC Announces Temporary Shutdown",
      "publisher": "Reuters",
      "published_at": "2024-01-15",
      "url": "https://..."
    }
  ]
}
```

## Performance Considerations

### Token Usage
- Standard Mode: ~500-1000 tokens per analysis
- Agentic Mode: ~2000-4000 tokens per analysis

### Response Time
- Standard Mode: 2-3 seconds
- Agentic Mode: 3-5 seconds
- With Live Data: Add 10-15 seconds for scraping

### Cost Estimation (AIML API)
- Standard Analysis: ~$0.01 per request
- Agentic Analysis: ~$0.02-0.03 per request
- Monthly (100 analyses): ~$2-3

## Best Practices

### When to Use Agentic Mode

✅ **Use Agentic Mode For:**
- Critical supplier decisions
- Complex supply chain scenarios
- High-value contracts
- Strategic planning
- Unfamiliar suppliers or markets
- When you need detailed reasoning

❌ **Use Standard Mode For:**
- Routine supplier checks
- Quick risk assessments
- Known low-risk suppliers
- Batch processing
- Cost-sensitive operations

### Combining Modes

**Optimal Configuration:**
```
Live Mode: ON (real-time data)
Agentic Mode: ON (advanced reasoning)
= Most comprehensive analysis
```

**Fast Configuration:**
```
Live Mode: OFF (mock data)
Agentic Mode: OFF (standard AI)
= Quick testing and development
```

**Balanced Configuration:**
```
Live Mode: ON (real-time data)
Agentic Mode: OFF (standard AI)
= Good balance of speed and accuracy
```

## Monitoring and Debugging

### Server Logs
When agentic mode is active, you'll see detailed logs:

```
============================================================
🧠 LLM Analysis Starting
   Provider: AIML
   Mode: Agentic AI
   Supplier: TSMC
   Sources: 5
============================================================

🤖 Using AIML API (GPT-5-5) - Agentic Mode
✓ AIML API response received (3245ms)
  Model: openai/gpt-5-5
  Tokens: 3421

✅ Analysis Complete
   Risk Level: High
   Risk Score: 78
   Signals: 4
   Confidence: High
```

### Performance Metrics
The Agent Activity Log shows:
- Total analysis duration
- AI mode used (Agentic vs Standard)
- Token usage
- Success rate

## API Integration

### Programmatic Access

```typescript
// Standard analysis
const response = await fetch("/api/analyze-supplier", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    supplierName: "TSMC",
    liveMode: true,
    agenticMode: false
  })
});

// Agentic analysis
const agenticResponse = await fetch("/api/analyze-supplier", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    supplierName: "TSMC",
    liveMode: true,
    agenticMode: true  // Enable agentic AI
  })
});
```

### Custom Agentic Tasks

```typescript
import { agenticAnalysis } from "@/lib/llm";

// Custom autonomous task
const result = await agenticAnalysis(
  context,
  "Identify potential supply chain vulnerabilities for Q4 2024"
);
```

## Troubleshooting

### Issue: "AIML API key required for agentic analysis"
**Solution**: Add `AIML_API_KEY` to your `.env` file

### Issue: Agentic mode not providing deeper insights
**Solution**: 
- Ensure you're using live mode for real data
- Check that sources contain sufficient information
- Verify GPT-5-5 model is being used (check logs)

### Issue: High token usage
**Solution**:
- Use agentic mode selectively for critical analyses
- Consider standard mode for routine checks
- Implement caching for repeated queries

### Issue: Slow response times
**Solution**:
- This is normal for agentic mode (3-5 seconds)
- Combine with live mode adds scraping time (10-15 seconds)
- Consider async processing for batch operations

## Future Enhancements

### Planned Features
1. **Multi-Agent Collaboration**: Multiple AI agents working together
2. **Learning from Feedback**: Improve based on user corrections
3. **Custom Analysis Templates**: User-defined reasoning frameworks
4. **Automated Follow-ups**: AI-initiated additional research
5. **Risk Trend Analysis**: Historical pattern recognition

## Support and Resources

- **AIML API Documentation**: https://docs.aimlapi.com
- **GPT-5-5 Model Info**: https://aimlapi.com/models
- **Risk Horizon Issues**: GitHub repository
- **Community**: Discord/Slack channel

## Conclusion

Agentic AI with GPT-5-5 represents a significant advancement in supplier risk intelligence. By combining autonomous reasoning with real-time data, Risk Horizon provides unprecedented insights for supply chain decision-making.

**Key Takeaways:**
- Agentic AI provides deeper, more nuanced analysis
- Best used for critical decisions and complex scenarios
- Combines well with live mode for optimal results
- Transparent reasoning with source-backed claims
- Adaptive to data quality and context

Start with standard mode, then enable agentic mode for suppliers that require deeper analysis or when making critical procurement decisions.