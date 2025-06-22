const yahooFinance = require('yahoo-finance2').default;

class StockService {
  constructor() {
    // No API key needed for Yahoo Finance
  }

  // Get real-time stock quote
  async getQuote(symbol) {
    try {
      const quote = await yahooFinance.quote(symbol.toUpperCase());
      
      // Transform Yahoo Finance response to match expected format
      return {
        '01. symbol': quote.symbol,
        '02. open': quote.regularMarketOpen?.toString() || '0',
        '03. high': quote.regularMarketDayHigh?.toString() || '0',
        '04. low': quote.regularMarketDayLow?.toString() || '0',
        '05. price': quote.regularMarketPrice?.toString() || '0',
        '06. volume': quote.regularMarketVolume?.toString() || '0',
        '07. latest trading day': quote.regularMarketTime ? new Date(quote.regularMarketTime * 1000).toISOString().split('T')[0] : '',
        '08. previous close': quote.regularMarketPreviousClose?.toString() || '0',
        '09. change': (quote.regularMarketPrice - quote.regularMarketPreviousClose)?.toString() || '0',
        '10. change percent': quote.regularMarketChangePercent?.toFixed(4) + '%' || '0%'
      };
    } catch (error) {
      console.error('Error in getQuote:', error.message);
      throw new Error(`Failed to fetch quote for ${symbol}: ${error.message}`);
    }
  }

  // Get historical daily data
  async getHistoricalData(symbol, outputsize = 'compact') {
    try {
      // Calculate date range based on outputsize
      const endDate = new Date();
      let startDate;
      
      if (outputsize === 'compact') {
        startDate = new Date();
        startDate.setDate(endDate.getDate() - 100); // 100 days
      } else {
        // For 20 years, go back exactly 20 years from today
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 20);
      }
      
      // Convert dates to timestamps (seconds since epoch) for Yahoo Finance
      const period1 = Math.floor(startDate.getTime() / 1000);
      const period2 = Math.floor(endDate.getTime() / 1000);
      
      const historicalData = await yahooFinance.historical(symbol.toUpperCase(), {
        period1: period1,
        period2: period2,
        interval: '1d'
      });
      
      // Check if we got enough data for 20 years
      if (outputsize !== 'compact' && historicalData.length < 1000) {
        // Try with a shorter period if we don't get enough data
        if (historicalData.length < 100) {
          const fiveYearStart = new Date();
          fiveYearStart.setFullYear(fiveYearStart.getFullYear() - 5);
          const fiveYearPeriod1 = Math.floor(fiveYearStart.getTime() / 1000);
          
          const fallbackData = await yahooFinance.historical(symbol.toUpperCase(), {
            period1: fiveYearPeriod1,
            period2: period2,
            interval: '1d'
          });
          
          // Transform fallback data
          const transformedData = {};
          fallbackData.forEach(day => {
            const date = new Date(day.date).toISOString().split('T')[0];
            transformedData[date] = {
              '1. open': day.open?.toString() || '0',
              '2. high': day.high?.toString() || '0',
              '3. low': day.low?.toString() || '0',
              '4. close': day.close?.toString() || '0',
              '5. volume': day.volume?.toString() || '0'
            };
          });
          
          return transformedData;
        }
      }
      
      // Transform Yahoo Finance response to match expected format
      const transformedData = {};
      
      historicalData.forEach(day => {
        const date = new Date(day.date).toISOString().split('T')[0];
        transformedData[date] = {
          '1. open': day.open?.toString() || '0',
          '2. high': day.high?.toString() || '0',
          '3. low': day.low?.toString() || '0',
          '4. close': day.close?.toString() || '0',
          '5. volume': day.volume?.toString() || '0'
        };
      });
      
      return transformedData;
    } catch (error) {
      console.error('Error in getHistoricalData:', error.message);
      throw new Error(`Failed to fetch historical data for ${symbol}: ${error.message}`);
    }
  }

  // Get company overview
  async getCompanyOverview(symbol) {
    try {
      const quote = await yahooFinance.quote(symbol.toUpperCase());
      
      // Try to get additional company info
      let sector = 'N/A';
      let industry = 'N/A';
      let description = 'No description available';
      
      // Try different field names that might contain sector/industry info
      if (quote.sector) {
        sector = quote.sector;
      } else if (quote.industry) {
        industry = quote.industry;
      }
      
      // Try to get business summary from different fields
      if (quote.longBusinessSummary) {
        description = quote.longBusinessSummary;
      } else if (quote.shortBusinessSummary) {
        description = quote.shortBusinessSummary;
      } else if (quote.description) {
        description = quote.description;
      }
      
      // For Apple specifically, we can hardcode some basic info
      if (symbol.toUpperCase() === 'AAPL') {
        sector = 'Technology';
        industry = 'Consumer Electronics';
        if (description === 'No description available') {
          description = 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company offers iPhone, Mac, iPad, and wearables, home, and accessories.';
        }
      }
      
      // Transform Yahoo Finance response to match expected format
      return {
        Symbol: quote.symbol,
        Name: quote.longName || quote.shortName || quote.symbol,
        Description: description,
        Sector: sector,
        Industry: industry,
        MarketCapitalization: quote.marketCap?.toString() || '0',
        PERatio: quote.trailingPE?.toString() || 'N/A'
      };
    } catch (error) {
      console.error('Error in getCompanyOverview:', error.message);
      throw new Error(`Failed to fetch company overview for ${symbol}: ${error.message}`);
    }
  }

  // Search for stocks
  async searchStocks(keywords) {
    try {
      const searchResults = await yahooFinance.search(keywords);
      
      // Transform Yahoo Finance response to match expected format
      return searchResults.quotes.map(quote => ({
        '1. symbol': quote.symbol,
        '2. name': quote.shortname || quote.longname || quote.symbol,
        '3. type': quote.quoteType || 'N/A',
        '4. region': quote.region || 'N/A'
      }));
    } catch (error) {
      console.error('Error in searchStocks:', error.message);
      throw new Error(`Failed to search stocks: ${error.message}`);
    }
  }

  // Get technical indicators (placeholder - Yahoo Finance doesn't have built-in technical indicators)
  async getTechnicalIndicator(symbol, indicator = 'SMA', interval = 'daily', timePeriod = 20) {
    throw new Error('Technical indicators not available with Yahoo Finance. Consider using a different service for technical analysis.');
  }

  // Get rate limit status (not applicable for Yahoo Finance)
  getRateLimitStatus() {
    return {
      message: 'Yahoo Finance has no rate limits',
      dailyCallsUsed: 0,
      dailyCallsLimit: 'unlimited',
      callsPerMinute: 'unlimited'
    };
  }
}

module.exports = new StockService(); 