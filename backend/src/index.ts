import app from './app';
import { config } from './config';
import prisma from './config/database';
import redisClient from './config/redis';

async function startServer() {
  try {
    // Connect to Redis
    await redisClient.connect();
    console.log('✅ Connected to Redis');

    // Test database connection
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL');

    // Start the server
    app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
      console.log(`📊 Environment: ${config.nodeEnv}`);
      console.log(`🔗 Health check: http://localhost:${config.port}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');

  try {
    await prisma.$disconnect();
    console.log('✅ Disconnected from PostgreSQL');

    await redisClient.disconnect();
    console.log('✅ Disconnected from Redis');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');

  try {
    await prisma.$disconnect();
    await redisClient.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

startServer();
