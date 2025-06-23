const app = require('./app');
const config = require('./config');
const { initializeAI } = require('./services/stockService');

const startServer = async () => {
  try {
    await initializeAI();
    
    const server = app.listen(config.port, () => {
      console.log(`Server running on http://localhost:${config.port}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('Process terminated');
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully');
      server.close(() => {
        console.log('Process terminated');
      });
    });

  } catch (error) {
    console.error('Failed to start the server:', error);
    process.exit(1);
  }
};

startServer();