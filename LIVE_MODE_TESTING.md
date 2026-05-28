# Live Mode Testing Guide

## Overview
This guide explains how to test the Risk Horizon application with live Bright Data scraping APIs to evaluate agentic performance.

## Prerequisites

### 1. Bright Data Account Setup
You need a Bright Data account with the following products configured:
- **SERP API** - For web search results
- **Web Unlocker** - For scraping web pages
- **Scraping Browser** (optional) - For JavaScript-heavy sites

### 2. Environment Configuration
Create a `.env.local` file in the project root with your Bright Data credentials:

```bash
# Bright Data Configuration
BRIGHT_DATA_API_KEY=your_api_key_here
BRIGHT_DATA_SERP_ZONE=your_serp_zone_name
BRIGHT_DATA_UNLOCKER_ZONE=your_unlocker_zone_name
BRIGHT_DATA_REQUEST_ENDPOINT=https://api.brightdata.com/request

# LLM Configuration (for risk analysis)
OPENAI_API_KEY=your_openai_key_here
# OR
ANTHROPIC_API_KEY=your_anthropic_key_here
```

### 3. Install Dependencies
```bash
npm install
```

## Testing Live Mode

### Starting the Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Using Live Mode

1. **Toggle Live Mode**
   - Locate the "Mode" toggle switch in the Supplier Input section
   - Switch from "Mock Data" to "Live API"
   - The toggle will turn amber when live mode is active
   - You'll see "Bright Data Active" badge

2. **Run Analysis**
   - Enter a supplier name (e.g., "TSMC", "Maersk", "Nvidia")
   - Click "Analyze Live" button (amber colored in live mode)
   - The system will:
     - Generate search queries
     - Call Bright Data SERP API for web search
     - Scrape discovered sources using Web Unlocker
     - Analyze content with LLM
     - Generate risk report

3. **Monitor Performance**
   - Watch the Agent Activity Log for real-time updates
   - Performance metrics will appear showing:
     - Total duration
     - Success rate
     - Individual stage timings
     - API call details

## Performance Metrics Explained

### Tracked Stages
1. **Query Generation** - Time to generate search queries
2. **SERP API Search** - Time for each web search query
3. **Web Search Aggregation** - Time to deduplicate and aggregate results
4. **Web Unlocker Scrape** - Time to scrape each source page
5. **Parallel Source Scraping** - Total time for all scraping operations
6. **LLM Risk Analysis** - Time for AI-powered risk assessment

### Metrics Display
- **Duration**: Time in milliseconds for each stage
- **Success Rate**: Percentage of successful operations
- **API Calls**: Total number of Bright Data API calls
- **Error Details**: Any failures with error messages

## Server-Side Logging

When running in live mode, detailed logs appear in the terminal:

```
============================================================
🚀 Starting Supplier Analysis
   Supplier: TSMC
   Mode: 🔴 LIVE (Bright Data APIs)
============================================================

[Agent Performance] SERP Search: "TSMC supply chain disruption": {
  duration: "1234ms",
  success: true,
  details: { query: "TSMC supply chain disruption", resultsCount: 10 }
}

[Agent Performance] Scrape: reuters.com: {
  duration: "2345ms",
  success: true,
  details: { url: "https://...", contentLength: 8543 }
}

============================================================
✅ Analysis Complete
   Total Duration: 15234ms
   Success Rate: 100.0%
   API Calls: 8
   Risk Level: High (Score: 78)
============================================================
```

## Testing Scenarios

### 1. Basic Live Analysis
- **Supplier**: "Maersk"
- **Expected**: 4 search queries, 5 scraped sources, complete risk report
- **Metrics**: ~10-20 seconds total duration

### 2. High-Risk Supplier
- **Supplier**: "TSMC"
- **Expected**: Multiple risk signals, high risk score
- **Metrics**: Similar timing, more detailed findings

### 3. Error Handling
- **Test**: Invalid API credentials
- **Expected**: Graceful fallback to mock data with error logging

### 4. Rate Limiting
- **Test**: Multiple rapid requests
- **Expected**: Proper handling of API rate limits

## Comparing Mock vs Live Mode

### Mock Mode (Default)
- ✅ Instant results (~3-5 seconds)
- ✅ No API costs
- ✅ Consistent test data
- ❌ Not real-time data
- ❌ Limited variety

### Live Mode
- ✅ Real-time web data
- ✅ Actual supplier intelligence
- ✅ Performance metrics
- ❌ Slower (~10-20 seconds)
- ❌ API costs apply
- ❌ Results vary by availability

## Troubleshooting

### Issue: "Bright Data is not fully configured"
**Solution**: Check that all environment variables are set correctly in `.env.local`

### Issue: API requests timing out
**Solution**: 
- Verify your Bright Data zones are active
- Check your account has sufficient credits
- Ensure network connectivity

### Issue: Empty search results
**Solution**:
- Verify SERP zone configuration
- Check query formatting
- Try different supplier names

### Issue: Scraping failures
**Solution**:
- Verify Web Unlocker zone is active
- Some sites may block scraping
- Check URL accessibility

## Performance Optimization Tips

1. **Parallel Processing**: The system scrapes multiple sources simultaneously
2. **Query Optimization**: Limit to 4 most relevant queries
3. **Content Truncation**: Scraped content limited to 10,000 characters
4. **Caching**: Consider implementing Redis for repeated queries
5. **Rate Limiting**: Implement request throttling for production

## API Cost Estimation

Typical analysis costs (Bright Data):
- **SERP API**: ~4 requests × $0.001 = $0.004
- **Web Unlocker**: ~5 requests × $0.003 = $0.015
- **Total per analysis**: ~$0.019

Monthly estimates (100 analyses):
- **Bright Data**: ~$1.90
- **OpenAI GPT-4**: ~$0.50 (varies by usage)
- **Total**: ~$2.40/month

## Next Steps

1. **Production Deployment**: Configure environment variables in your hosting platform
2. **Monitoring**: Set up logging and alerting for API failures
3. **Caching**: Implement caching layer for frequently analyzed suppliers
4. **Rate Limiting**: Add user-level rate limiting
5. **Analytics**: Track usage patterns and performance trends

## Support

For issues with:
- **Bright Data APIs**: Contact Bright Data support
- **Application bugs**: Check GitHub issues or create new one
- **Performance**: Review server logs and metrics

## Additional Resources

- [Bright Data Documentation](https://docs.brightdata.com/)
- [SERP API Guide](https://docs.brightdata.com/scraping-automation/serp-api)
- [Web Unlocker Guide](https://docs.brightdata.com/scraping-automation/web-unlocker)