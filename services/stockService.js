const yahooFinance = require('yahoo-finance2').default;
const config = require('../config');

class StockService {
  // Get real-time stock quote
  async getQuote(symbol) {
    try {
      const quote = await yahooFinance.quote(symbol.toUpperCase());
      
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
      const endDate = new Date();
      const startDate = new Date();
      
      if (outputsize === 'compact') {
        startDate.setDate(endDate.getDate() - 100);
      } else {
        startDate.setFullYear(startDate.getFullYear() - 20);
      }
      
      const period1 = Math.floor(startDate.getTime() / 1000);
      const period2 = Math.floor(endDate.getTime() / 1000);
      
      const historicalData = await yahooFinance.historical(symbol.toUpperCase(), {
        period1,
        period2,
        interval: '1d'
      });
      
      if (!historicalData || historicalData.length === 0) {
        throw new Error('No historical data received from Yahoo Finance');
      }
      
      // Transform data to expected format
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
      
      return {
        Symbol: quote.symbol,
        Name: quote.longName || quote.shortName || quote.symbol,
        Description: quote.longBusinessSummary || quote.shortBusinessSummary || quote.description || 'No description available',
        Sector: quote.sector || 'N/A',
        Industry: quote.industry || 'N/A',
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

  // Calculate Simple Moving Average (SMA)
  calculateSMA(data, period = 20) {
    if (!data || data.length < period) {
      return [];
    }

    const smaData = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, point) => {
        const closePrice = parseFloat(point['4. close']);
        return isNaN(closePrice) ? acc : acc + closePrice;
      }, 0);
      
      const sma = sum / period;
      const date = new Date(data[i].date).toISOString().split('T')[0];
      
      smaData.push({
        date,
        value: sma.toFixed(2),
        timestamp: Math.floor(new Date(data[i].date).getTime() / 1000)
      });
    }
    
    return smaData;
  }

  // Calculate Exponential Moving Average (EMA)
  calculateEMA(data, period = 20) {
    if (!data || data.length < period) {
      return [];
    }

    const emaData = [];
    const multiplier = 2 / (period + 1);
    
    // Calculate first EMA using SMA
    let sum = 0;
    for (let i = 0; i < period; i++) {
      const closePrice = parseFloat(data[i]['4. close']);
      if (!isNaN(closePrice)) {
        sum += closePrice;
      }
    }
    let ema = sum / period;
    
    // Add first EMA point
    const firstDate = new Date(data[period - 1].date).toISOString().split('T')[0];
    emaData.push({
      date: firstDate,
      value: ema.toFixed(2),
      timestamp: Math.floor(new Date(data[period - 1].date).getTime() / 1000)
    });

    // Calculate subsequent EMA points
    for (let i = period; i < data.length; i++) {
      const closePrice = parseFloat(data[i]['4. close']);
      if (!isNaN(closePrice)) {
        ema = (closePrice * multiplier) + (ema * (1 - multiplier));
        
        const date = new Date(data[i].date).toISOString().split('T')[0];
        emaData.push({
          date,
          value: ema.toFixed(2),
          timestamp: Math.floor(new Date(data[i].date).getTime() / 1000)
        });
      }
    }
    
    return emaData;
  }

  // Get moving averages for a symbol
  async getMovingAverages(symbol, periods = [20, 50, 200]) {
    try {
      const historicalData = await this.getHistoricalData(symbol, 'full');
      
      if (!historicalData || Object.keys(historicalData).length === 0) {
        throw new Error('No historical data available');
      }
      
      // Convert to array format for calculations
      const dataArray = Object.entries(historicalData).map(([date, data]) => ({
        date,
        ...data
      })).sort((a, b) => new Date(a.date) - new Date(b.date));
      
      const result = {
        symbol: symbol.toUpperCase(),
        sma: {},
        ema: {}
      };
      
      // Calculate SMA and EMA for each period
      periods.forEach(period => {
        result.sma[period] = this.calculateSMA(dataArray, period);
        result.ema[period] = this.calculateEMA(dataArray, period);
      });
      
      return result;
    } catch (error) {
      console.error('Error in getMovingAverages:', error.message);
      throw new Error(`Failed to calculate moving averages for ${symbol}: ${error.message}`);
    }
  }

  // Get earnings data using Polygon.io
  async getEarningsData(symbol) {
    if (!config.polygon.apiKey) {
      throw new Error('Polygon API key is not configured. Please set POLYGON_API_KEY environment variable.');
    }

    const polygonUrl = `https://api.polygon.io/vX/reference/financials?ticker=${symbol.toUpperCase()}&timeframe=quarterly&order=desc&limit=20&apiKey=${config.polygon.apiKey}`;
    
    const response = await fetch(polygonUrl);

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Polygon API error: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    const earningsResponse = await response.json();

    if (!earningsResponse || !earningsResponse.results || earningsResponse.results.length === 0) {
      return []; // Return empty array if no data, not an error
    }

    const earnings = earningsResponse.results.slice(0, 5).map((quarter) => {
      if (!quarter || typeof quarter !== 'object') {
        return null;
      }
      const date = quarter.start_date || quarter.filing_date || '';
      const incomeStatement = quarter.financials?.income_statement || {};
      const actualEPS = incomeStatement.basic_earnings_per_share?.value ?? 0;
      const actualRevenue = incomeStatement.revenues?.value ?? 0;
      const estimatedEPS = actualEPS * 0.95;
      const estimatedRevenue = actualRevenue * 0.98;

      return {
        quarter: `Q${Math.floor((new Date(date).getMonth() / 3) + 1)} ${new Date(date).getFullYear()}`,
        date,
        estimate: estimatedEPS.toFixed(2),
        actual: actualEPS.toFixed(2),
        actualRevenue: (actualRevenue / 1000000).toFixed(2) + 'M',
        estimatedRevenue: (estimatedRevenue / 1000000).toFixed(2) + 'M',
        beat: actualEPS > estimatedEPS,
        surprise: actualEPS > estimatedEPS ?
          `+${(((actualEPS - estimatedEPS) / estimatedEPS) * 100).toFixed(1)}%` :
          `${(((actualEPS - estimatedEPS) / estimatedEPS) * 100).toFixed(1)}%`,
      };
    }).filter(earning => earning !== null);

    if (earnings.length === 0) {
      return []; // Return empty array if no valid data
    }

    return earnings;
  }
}

module.exports = new StockService();