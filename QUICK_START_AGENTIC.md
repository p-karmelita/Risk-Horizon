# Quick Start: Agentic AI with Real Data

## 5-Minute Setup

### 1. Configure API Keys

Edit your `.env` file:

```bash
# Bright Data (for real-time web scraping)
BRIGHT_DATA_API_KEY=your_bright_data_key
BRIGHT_DATA_SERP_ZONE=your_serp_zone
BRIGHT_DATA_UNLOCKER_ZONE=your_unlocker_zone

# AIML API (for GPT-5-5 Agentic AI)
AIML_API_KEY=your_aiml_api_key
AIML_API_URL=https://api.aimlapi.com/v1/chat/completions
```

### 2. Start the Application

```bash
npm install
npm run dev
```

### 3. Use Agentic AI

1. Open http://localhost:3000
2. Toggle **Live Mode** ON (amber switch)
3. Toggle **Agentic AI** ON (purple switch)
4. Enter supplier name (e.g., "TSMC")
5. Click **🤖 Agentic Analysis**

## What You Get

### With Both Modes Enabled

✅ **Real-Time Data** (Bright Data)
- Live web search results
- Fresh supplier information
- Current news and updates
- Actual source scraping

✅ **Autonomous AI Analysis** (GPT-5-5)
- Multi-step reasoning
- Pattern recognition
- Predictive insights
- Detailed explanations
- Source-backed claims

### Example Output

```json
{
  "supplier_name": "TSMC",
  "risk_level": "High",
  "risk_score": 78,
  "confidence": "High",
  "summary": "TSMC faces elevated supply chain risks due to...",
  "signals": [
    {
      "title": "Geopolitical Tensions Impact Production",
      "severity": "High",
      "business_impact": "Potential 15-20% capacity reduction...",
      "recommended_action": "Diversify to alternative fabs..."
    }
  ]
}
```

## Mode Combinations

| Live Mode | Agentic AI | Use Case | Speed | Quality |
|-----------|------------|----------|-------|---------|
| ❌ | ❌ | Quick testing | ⚡⚡⚡ | ⭐⭐ |
| ✅ | ❌ | Fast real data | ⚡⚡ | ⭐⭐⭐ |
| ❌ | ✅ | AI testing | ⚡⚡ | ⭐⭐⭐ |
| ✅ | ✅ | **Production** | ⚡ | ⭐⭐⭐⭐⭐ |

## Performance Expectations

### Standard Mode (Mock + Standard AI)
- Duration: ~3-5 seconds
- Cost: $0 (no API calls)
- Quality: Good for testing

### Live Mode (Real Data + Standard AI)
- Duration: ~12-15 seconds
- Cost: ~$0.02 per analysis
- Quality: Real-time insights

### Agentic Mode (Real Data + GPT-5-5)
- Duration: ~15-20 seconds
- Cost: ~$0.03-0.04 per analysis
- Quality: **Best** - Autonomous reasoning

## Monitoring

### In the UI
- **Agent Activity Log**: Shows real-time progress
- **Performance Metrics**: Duration, success rate, API calls
- **Mode Indicators**: Visual badges for active modes

### In the Terminal
```
============================================================
🚀 Starting Supplier Analysis
   Supplier: TSMC
   Data Mode: 🔴 LIVE (Bright Data APIs)
   AI Mode: 🤖 AGENTIC (GPT-5-5 Autonomous)
============================================================

[Agent Performance] SERP Search: "TSMC supply chain risk": {
  duration: "1234ms",
  success: true
}

🤖 Using AIML API (GPT-5-5) - Agentic Mode
✓ AIML API response received (3245ms)
  Model: openai/gpt-5-5
  Tokens: 3421

✅ Analysis Complete
   Total Duration: 15234ms
   Success Rate: 100.0%
   AI Mode: Agentic
   Risk Level: High (Score: 78)
============================================================
```

## Troubleshooting

### "Bright Data is not fully configured"
→ Add Bright Data credentials to `.env`

### "AIML API key required"
→ Add `AIML_API_KEY` to `.env`

### Slow performance
→ Normal for agentic + live mode (15-20s)

### Empty results
→ Check API keys and network connectivity

## Cost Management

### Per Analysis
- Bright Data: ~$0.019
- AIML API (Agentic): ~$0.02-0.03
- **Total**: ~$0.04 per analysis

### Monthly (100 analyses)
- Bright Data: ~$1.90
- AIML API: ~$2-3
- **Total**: ~$4-5/month

## Next Steps

1. ✅ Test with mock data first
2. ✅ Enable live mode for real data
3. ✅ Enable agentic mode for best insights
4. 📖 Read [AGENTIC_AI_GUIDE.md](AGENTIC_AI_GUIDE.md) for details
5. 📖 Read [LIVE_MODE_TESTING.md](LIVE_MODE_TESTING.md) for testing

## Support

- **Documentation**: See `AGENTIC_AI_GUIDE.md`
- **API Issues**: Check `.env` configuration
- **Performance**: Review server logs

---

**Pro Tip**: Start with standard mode to verify setup, then enable agentic mode for critical supplier decisions.