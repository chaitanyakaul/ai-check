# Stock Market Dashboard

A modern, real-time stock market dashboard built with Node.js backend and React frontend, featuring interactive candlestick charts, comprehensive stock data analysis, and AI-powered news sentiment analysis.

## 🚀 Features

- **Real-time Stock Data**: Live quotes, historical data, and company information
- **Interactive Charts**: TradingView Lightweight Charts with candlestick patterns and multiple timeframes
- **AI-Powered Risk Radar**: News sentiment analysis and risk categorization
- **Company Overview**: Sector, industry, market cap, and financial metrics
- **Moving Averages**: SMA and EMA calculations with customizable periods
- **Earnings Data**: Quarterly earnings information (requires Polygon API key)
- **Search Functionality**: Easy stock symbol search with instant results
- **Responsive Design**: Modern Bootstrap-based UI that works on all devices

## 🧠 AI-Powered Risk Radar & Sentiment Analysis

The dashboard features an innovative AI-powered "Risk Radar" that analyzes recent news for each stock and categorizes it by risk topic and sentiment, giving you a fast, actionable overview of potential risks and opportunities.

### How It Works
- **News Fetching:** Fetches recent, relevant news articles using NewsAPI, searching by both company name and ticker symbol
- **Risk Topic Classification:** Uses zero-shot classification to categorize articles into risk topics (Mergers & Acquisitions, Earnings Guidance, New Product Launch, etc.)
- **Sentiment Analysis:** Analyzes both title and content for sentiment (Positive, Neutral, Negative) with intelligent weighting
- **Visualization:** Displays stacked sentiment bars with interactive modal for detailed article review

### API Endpoint
- `GET /api/v1/stocks/:symbol/risk-radar` — Returns risk topic and sentiment breakdown

## 🛠️ Tech Stack

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **Yahoo Finance API** - Stock data source
- **NewsAPI** - News data for AI analysis
- **@xenova/transformers** - AI models for classification and sentiment analysis
- **CORS, Helmet, Morgan** - Security and logging middleware

### Frontend
- **React 19** - UI framework
- **Bootstrap 5** - CSS framework
- **TradingView Lightweight Charts** - Professional charting library
- **Axios** - HTTP client

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup

1. **Clone and install**
   ```bash
   git clone <your-github-repo-url>
   cd ai-backend-service
   npm run install:all
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   
   Add your API keys:
   ```bash
   NEWS_API_KEY=your_news_api_key          # Required for AI features
   POLYGON_API_KEY=your_polygon_api_key    # Optional for earnings data
   PORT=3000                               # Optional
   ```

3. **Start development servers**
   ```bash
   npm run dev:all
   ```

4. **Access the application**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000

## 📊 API Endpoints

### Stock Data
- `GET /api/v1/stocks/quote/:symbol` - Real-time quote
- `GET /api/v1/stocks/historical/:symbol` - Historical data
- `GET /api/v1/stocks/overview/:symbol` - Company overview
- `GET /api/v1/stocks/moving-averages/:symbol` - Moving averages (SMA/EMA)
- `GET /api/v1/stocks/earnings/:symbol` - Earnings data
- `GET /api/v1/stocks/risk-radar/:symbol` - AI news analysis
- `GET /api/v1/stocks/search` - Stock search

### Health Check
- `GET /health` - Server status

## 🔧 Available Scripts

```bash
# Development
npm run dev:all          # Start both servers
npm run dev:backend      # Backend only
npm run dev:frontend     # Frontend only

# Production
npm start               # Start production server
npm run build           # Build frontend

# Testing
npm test               # Run all tests
npm run test:unit      # Unit tests only
npm run test:integration # Integration tests only
```

## 🚀 Deployment

### Backend
1. Set environment variables
2. Run `npm start`
3. Use PM2 or similar process manager

### Frontend
1. Run `npm run build`
2. Deploy the `build` folder to your hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- [Yahoo Finance API](https://finance.yahoo.com/) for stock data
- [NewsAPI](https://newsapi.org/) for news data
- [TradingView](https://www.tradingview.com/) for charting library
- [Bootstrap](https://getbootstrap.com/) for UI components
- [React](https://reactjs.org/) for the frontend framework
- [Hugging Face](https://huggingface.co/) for AI models

---

**Happy Trading! 📈** 