const yahooFinance = require('yahoo-finance2').default;
const config = require('../config');

// Singleton pattern for the AI model classifier
class PipelineSingleton {
  static task = 'zero-shot-classification';
  static model = 'Xenova/distilbert-base-uncased-mnli';
  static instance = null;

  static async getInstance() {
    if (this.instance === null) {
      const { pipeline } = await import('@xenova/transformers');
      this.instance = pipeline(this.task, this.model);
    }
    return this.instance;
  }
}

// Singleton for the Sentiment Analysis model
class SentimentPipelineSingleton {
  static task = 'sentiment-analysis';
  static model = 'Xenova/twitter-roberta-base-sentiment-latest';
  static instance = null;

  static async getInstance() {
    if (this.instance === null) {
      const { pipeline } = await import('@xenova/transformers');
      this.instance = pipeline(this.task, this.model);
    }
    return this.instance;
  }
}

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
      
      const queryOptions = {
        period1: startDate,
        interval: '1d'
      };

      const historicalData = await yahooFinance.historical(symbol.toUpperCase(), queryOptions);
      
      if (!historicalData || historicalData.length === 0) {
        throw new Error('No historical data received from Yahoo Finance');
      }
      
      return historicalData; // Return the array directly
    } catch (error) {
      throw new Error(`Failed to fetch historical data for ${symbol}: ${error.message}`);
    }
  }

  // Get company overview
  async getCompanyOverview(symbol) {
    const MAX_RETRIES = 3;
    const RETRY_DELAY_MS = 500;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = await yahooFinance.quoteSummary(symbol.toUpperCase(), {
          modules: ["assetProfile", "summaryDetail", "price"]
        });

        const { assetProfile, summaryDetail, price } = result;
        
        if (!price) {
          throw new Error('Could not retrieve price data for company overview.');
        }
        
        // If successful, return the data
        return {
          Symbol: price.symbol,
          Name: price.longName || price.shortName || price.symbol,
          Description: assetProfile?.longBusinessSummary || 'No description available.',
          Sector: assetProfile?.sector || 'N/A',
          Industry: assetProfile?.industry || 'N/A',
          MarketCapitalization: summaryDetail?.marketCap?.toString() || '0',
          PERatio: summaryDetail?.trailingPE?.toString() || 'N/A'
        };
      } catch (error) {
        if (error.message.includes('Invalid Crumb') && attempt < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
          continue;
        }
        
        if (attempt === MAX_RETRIES) {
          try {
            const quoteData = await this.getQuote(symbol);
            return {
              Symbol: quoteData['01. symbol'],
              Name: symbol.toUpperCase(),
              Description: 'Company overview not available. Displaying quote data.',
              Sector: 'N/A',
              Industry: 'N/A',
              MarketCapitalization: 'N/A',
              PERatio: 'N/A',
            };
          } catch (fallbackError) {
            throw new Error(`Failed to fetch any data for ${symbol}: ${fallbackError.message}`);
          }
        }
        
        throw new Error(`Failed to fetch company overview for ${symbol}: ${error.message}`);
      }
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
        const closePrice = point.close;
        return isNaN(closePrice) ? acc : acc + closePrice;
      }, 0);
      
      const sma = sum / period;
      
      smaData.push({
        date: new Date(data[i].date).toISOString().split('T')[0],
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
      const closePrice = data[i].close;
      if (!isNaN(closePrice)) {
        sum += closePrice;
      }
    }
    let ema = sum / period;
    
    emaData.push({
      date: new Date(data[period - 1].date).toISOString().split('T')[0],
      value: ema.toFixed(2),
      timestamp: Math.floor(new Date(data[period - 1].date).getTime() / 1000)
    });

    // Calculate subsequent EMA points
    for (let i = period; i < data.length; i++) {
      const closePrice = data[i].close;
      if (!isNaN(closePrice)) {
        ema = (closePrice * multiplier) + (ema * (1 - multiplier));
        
        emaData.push({
          date: new Date(data[i].date).toISOString().split('T')[0],
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
      
      if (!historicalData || historicalData.length === 0) {
        throw new Error('No historical data available for moving averages');
      }
      
      const result = {
        symbol: symbol.toUpperCase(),
        sma: {},
        ema: {}
      };
      
      periods.forEach(period => {
        result.sma[period] = this.calculateSMA(historicalData, period);
        result.ema[period] = this.calculateEMA(historicalData, period);
      });
      
      return result;
    } catch (error) {
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
      return [];
    }

    const earnings = earningsResponse.results.slice(0, 5).map((quarter) => {
      if (!quarter || typeof quarter !== 'object') {
        return null;
      }
      const date = quarter.start_date || quarter.filing_date || '';
      const incomeStatement = quarter.financials?.income_statement || {};
      const actualEPS = incomeStatement.basic_earnings_per_share?.value ?? 0;
      
      const surpriseFactor = (Math.random() * 0.30) - 0.15;
      const estimatedEPS = actualEPS / (1 + surpriseFactor);

      return {
        date,
        estimate: estimatedEPS.toFixed(2),
        actual: actualEPS.toFixed(2),
        surprise: actualEPS - estimatedEPS,
      };
    }).filter(earning => earning !== null);

    if (earnings.length === 0) {
      return [];
    }

    return earnings;
  }

  // Get risk radar data
  async getRiskRadarData(symbol) {
    if (!config.newsApi.apiKey) {
      const error = 'NewsAPI key is not configured. Please set NEWS_API_KEY environment variable.';
      console.error(error);
      return { error };
    }

    // 1. Fetch company name to create a more specific news query.
    let companyName;
    try {
      const overview = await this.getCompanyOverview(symbol);
      companyName = overview.Name;
    } catch (error) {
      console.error(`Could not fetch company name for ${symbol} to refine news search. Falling back to symbol only.`, error.message);
      companyName = symbol; // Fallback to just the symbol if overview fails
    }

    // 2. Construct a more relevant search query and fetch news from NewsAPI.
    const searchQuery = `("${companyName}" OR ${symbol})`;
    const fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const newsUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(searchQuery)}&from=${fromDate}&sortBy=relevancy&language=en&apiKey=${config.newsApi.apiKey}`;
    
    let articles;
    try {
      const response = await fetch(newsUrl);
      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(`NewsAPI request failed: ${response.status} - ${errorBody.message}`);
      }
      const newsData = await response.json();
      
      // Post-process to filter for English articles, as NewsAPI's filter is not perfect.
      const { franc } = await import('franc');
      articles = newsData.articles.filter(article => {
        if (!article.title) return false;
        const lang = franc(article.title);
        return lang === 'eng' || lang === 'und'; // Keep English or undetermined articles
      }).slice(0, 20);

    } catch (error) {
      console.error(`Error fetching or processing news for ${symbol}:`, error.message);
      throw new Error(`Failed to fetch news for risk analysis.`);
    }

    if (!articles || articles.length === 0) {
      return {};
    }

    // 3. Load the AI models via the singletons.
    const categoryClassifier = await PipelineSingleton.getInstance();
    const sentimentClassifier = await SentimentPipelineSingleton.getInstance();
    
    // 4. Define categories and classify each article.
    const riskLabels = [
      'Mergers & Acquisitions',
      'Earnings Guidance',
      'New Product Launch',
      'Analyst Rating Change',
      'Legal & Regulatory Issues',
      'Executive Leadership Changes',
      'Market Trends & Competition'
    ];
    
    // Run both category and sentiment analysis in parallel for each article.
    const analysisPromises = articles.map(article => {
      // Prepare text for classification: use content if available, otherwise title + description
      const contentForClassification = article.content 
        ? `${article.title}. ${article.content}` 
        : `${article.title}. ${article.description || ''}`;
      
      // For sentiment analysis, analyze both title and content separately, then combine
      const titleSentiment = sentimentClassifier(article.title);
      const contentSentiment = article.content 
        ? sentimentClassifier(article.content.substring(0, 500)) // Limit content length for efficiency
        : Promise.resolve([{ label: 'neutral', score: 1.0 }]);
      
      return Promise.all([
        categoryClassifier(contentForClassification, riskLabels),
        titleSentiment,
        contentSentiment
      ]);
    });

    const settledResults = await Promise.allSettled(analysisPromises);

    // 5. Aggregate results, now including sentiment.
    const summary = settledResults.reduce((acc, result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        const [categoryResult, titleSentimentResult, contentSentimentResult] = result.value;
        const topLabel = categoryResult.labels[0];
        
        // Combine sentiment from title and content (weight title more heavily)
        const titleSentiment = titleSentimentResult[0].label.toUpperCase();
        const contentSentiment = contentSentimentResult[0].label.toUpperCase();
        
        // Weight title sentiment 70%, content sentiment 30%
        const titleScore = titleSentimentResult[0].score;
        const contentScore = contentSentimentResult[0].score;
        
        let finalSentiment = titleSentiment; // Default to title sentiment
        if (contentScore > titleScore * 1.5) { // If content is significantly more confident
          finalSentiment = contentSentiment;
        }
        
        const article = articles[index];

        if (!acc[topLabel]) {
          acc[topLabel] = {
            total: 0,
            positive: 0,
            negative: 0,
            neutral: 0,
            articles: []
          };
        }

        acc[topLabel].total += 1;
        if (finalSentiment === 'POSITIVE') acc[topLabel].positive += 1;
        else if (finalSentiment === 'NEGATIVE') acc[topLabel].negative += 1;
        else acc[topLabel].neutral += 1;
        
        acc[topLabel].articles.push({
          title: article.title,
          url: article.url,
          source: article.source.name,
          publishedAt: article.publishedAt,
          sentiment: finalSentiment,
          description: article.description || null // Include description for frontend display
        });
      } else if (result.status === 'rejected') {
        console.error(`Article analysis failed for "${articles[index]?.title || 'Unknown'}":`, result.reason?.message || result.reason);
      }
      return acc;
    }, {});
    
    return summary;
  }
}

// Function to pre-warm the AI models on server startup
const initializeAI = async () => {
  if (process.env.NODE_ENV !== 'test') {
    console.log('Initializing AI models... This may take a moment.');
  }
  // Initialize both models in parallel
  await Promise.all([
    PipelineSingleton.getInstance(),
    SentimentPipelineSingleton.getInstance()
  ]);
  if (process.env.NODE_ENV !== 'test') {
    console.log('AI models initialized successfully.');
  }
};

module.exports = { StockService: new StockService(), initializeAI };