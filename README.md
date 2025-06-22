# Stock Market Dashboard

A modern, real-time stock market dashboard built with Node.js backend and React frontend, featuring interactive candlestick charts and comprehensive stock data analysis.

## 🚀 Features

- **Real-time Stock Data**: Live quotes, historical data, and company information
- **Interactive Charts**: TradingView Lightweight Charts with candlestick patterns
- **Multiple Timeframes**: 1 Week, 3 Months, 5 Years, and 20 Years views
- **Company Overview**: Sector, industry, market cap, and financial metrics
- **Responsive Design**: Modern Bootstrap-based UI that works on all devices
- **Auto-refresh**: Automatic data updates for real-time information
- **Search Functionality**: Easy stock symbol search with instant results

## 🛠️ Tech Stack

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **Yahoo Finance API** - Stock data source (no rate limits)
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware
- **Morgan** - HTTP request logger

### Frontend
- **React 19** - UI framework
- **Bootstrap 5** - CSS framework
- **TradingView Lightweight Charts** - Professional charting library
- **Axios** - HTTP client

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Environment Setup

1. **Create environment file**
   ```bash
   # Create a .env file in the root directory
   cp .env.example .env
   ```

2. **Configure environment variables**
   ```bash
   # Required for earnings data (optional for basic functionality)
   POLYGON_API_KEY=your_polygon_api_key_here
   
   # Optional configurations
   PORT=3000
   NODE_ENV=development
   CORS_ORIGIN=*
   ```

3. **Get Polygon API Key (Optional)**
   - Visit [Polygon.io](https://polygon.io/)
   - Sign up for a free account
   - Get your API key from the dashboard
   - Add it to your `.env` file
   
   **Note**: The Polygon API key is only required for earnings data. The basic stock functionality works without it.

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-github-repo-url>
   cd ai-backend-service
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd frontend
   npm install
   cd ..
   ```

3. **Start the development servers**
   ```bash
   # Start both backend and frontend
   npm run dev:all
   
   # Or start individually
   npm run dev:backend    # Backend only (port 3000)
   npm run dev:frontend   # Frontend only (port 3001)
   ```

4. **Access the application**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000
   - Health Check: http://localhost:3000/health

## 🎯 Usage

1. **Search for a stock** using the search bar in the header
2. **View real-time data** including price, change, volume, and market cap
3. **Switch timeframes** using the chart controls (1W, 3M, 5Y, 20Y)
4. **Analyze charts** with interactive candlestick patterns
5. **Monitor company metrics** in the overview section

## 📊 API Endpoints

### Stock Data
- `GET /api/v1/stocks/quote/:symbol` - Get real-time quote
- `GET /api/v1/stocks/historical/:symbol` - Get historical data
- `GET /api/v1/stocks/overview/:symbol` - Get company overview
- `GET /api/v1/stocks/earnings/:symbol` - Get earnings data (requires Polygon API key)
- `GET /api/v1/stocks/moving-averages/:symbol` - Get moving averages (SMA/EMA)
- `GET /api/v1/stocks/search` - Search for stocks by keywords

### Health Check
- `GET /health` - Server health status

## 🔧 Available Scripts

```bash
# Development
npm run dev:all          # Start both servers
npm run dev:backend      # Start backend only
npm run dev:frontend     # Start frontend only

# Production
npm start               # Start production server
npm run build           # Build frontend for production

# Installation
npm run install:all     # Install all dependencies
```

## 🌟 Key Features

### Real-time Data
- Live stock prices and market data
- Automatic data refresh
- Post-market and pre-market data

### Chart Analysis
- Professional candlestick charts
- Multiple timeframe options
- Interactive zoom and pan
- Price and volume indicators

### Company Information
- Market capitalization
- Sector and industry classification
- Financial ratios (P/E, P/B, etc.)
- Analyst ratings

## 📱 Responsive Design

The dashboard is fully responsive and works seamlessly on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🔒 Security

- CORS enabled for cross-origin requests
- Helmet.js for security headers
- Input validation and sanitization
- Error handling and logging

## 🚀 Deployment

### Backend Deployment
1. Set environment variables
2. Run `npm start` for production
3. Use PM2 or similar process manager

### Frontend Deployment
1. Run `npm run build`
2. Deploy the `build` folder to your hosting service
3. Configure proxy settings for API calls

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
- [TradingView](https://www.tradingview.com/) for charting library
- [Bootstrap](https://getbootstrap.com/) for UI components
- [React](https://reactjs.org/) for the frontend framework

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API endpoints

---

**Happy Trading! 📈** 